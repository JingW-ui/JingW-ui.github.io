/**
 * B站字幕提取 —— 阿里云函数计算（FC）Web 函数版中继
 *
 * 背景：B 站 WAF 在 IP 层封锁 Cloudflare Workers 出口段（-412 request was banned），
 * 国内数据中心 IP 不受此专项限制，故提供本函数计算版本作为中继。
 *
 * 部署（阿里云控制台 → 函数计算 FC 3.0 → 创建函数 → Web 函数 → Node.js 18+）：
 *   1. 运行环境选 Node.js 18 或更高，启动命令：node server.js
 *   2. 把本文件与 package.json 上传/粘贴进代码目录
 *   3. 创建后在「配置 → 网络与存储」开启公网访问，即可获得公网 URL
 *
 * 逻辑与 Cloudflare Worker 版完全一致：
 *   /bili/api/<path>       → api.bilibili.com/<path>
 *   /bili/passport/<path>  → passport.bilibili.com/<path>
 *   /bili/cdn?url=         → 字幕 JSON（仅限 *.hdslb.com）
 *   /resolve?url=          → b23.tv 短链解析
 *   /debug/fp              → 指纹引导状态
 * 冷启动时执行一次设备指纹引导（spi / ExClimbWuzhi / bili_ticket），
 * 结果仅存于进程内存，不落盘、不打日志、不含用户信息。
 */

const http = require('node:http');
const crypto = require('node:crypto');

const PORT = Number(process.env.FC_SERVER_PORT || 9000);

const UPSTREAM_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const FALLBACK_BUVID3 = 'e5a1f4c9-3b2d-4c8e-9f6a-7d0b8c1a2e3f';

/* ================= 设备指纹引导 ================= */

const fp = {
  ready: false,
  buvid3: '',
  buvid4: '',
  uuid: '',
  bLsid: '',
  bNut: '',
  buvidFp: '',
  biliTicket: '',
  biliTicketExpires: 0,
  wbiImg: '',
  wbiSub: '',
  bootAt: 0,
  log: [],
  promise: null, // 并发去重：冷启动同时来多个请求只引导一次
};

function note(msg) {
  fp.log.push(msg);
  if (fp.log.length > 30) fp.log.shift();
}

function rotl64(x, k) {
  return BigInt.asUintN(64, BigInt.asUintN(64, x << BigInt(k)) | BigInt.asUintN(64, x >> BigInt(64 - k)));
}

function murmur3x64_128(bytes, seed) {
  const C1 = 0x87c37b91114253d5n, C2 = 0x4cf5ad432745937fn;
  const C3 = 0x52dce729n, C4 = 0x38495ab5n;
  const MOD = 1n << 64n;
  const fmix64 = (k) => {
    let t = k;
    t ^= t >> 33n;
    t = BigInt.asUintN(64, t * 0xff51afd7ed558ccdn) % MOD;
    t ^= t >> 33n;
    t = BigInt.asUintN(64, t * 0xc4ceb9fe1a85ec53n) % MOD;
    return t;
  };
  const le64 = (u8, off) => {
    let v = 0n;
    for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(u8[off + i]);
    return v;
  };
  let h1 = BigInt(seed), h2 = BigInt(seed);
  let processed = 0n, off = 0;
  for (;;) {
    const read = bytes.slice(off, off + 16);
    off += read.length;
    processed += BigInt(read.length);
    if (read.length === 16) {
      const k1 = le64(read, 0), k2 = le64(read, 8);
      h1 ^= BigInt.asUintN(64, rotl64((k1 * C1) % MOD, 31) * C2) % MOD;
      h1 = BigInt.asUintN(64, (rotl64(h1, 27) + h2) * 5n + C3) % MOD;
      h2 ^= BigInt.asUintN(64, rotl64((k2 * C2) % MOD, 33) * C1) % MOD;
      h2 = BigInt.asUintN(64, (rotl64(h2, 31) + h1) * 5n + C4) % MOD;
    } else if (read.length === 0) {
      h1 ^= processed; h2 ^= processed;
      h1 = (h1 + h2) % MOD; h2 = (h2 + h1) % MOD;
      h1 = fmix64(h1); h2 = fmix64(h2);
      h1 = (h1 + h2) % MOD; h2 = (h2 + h1) % MOD;
      return { lo: h1, hi: h2 };
    } else {
      let k1 = 0n, k2 = 0n;
      if (read.length >= 15) k2 ^= BigInt(read[14]) << 48n;
      if (read.length >= 14) k2 ^= BigInt(read[13]) << 40n;
      if (read.length >= 13) k2 ^= BigInt(read[12]) << 32n;
      if (read.length >= 12) k2 ^= BigInt(read[11]) << 24n;
      if (read.length >= 11) k2 ^= BigInt(read[10]) << 16n;
      if (read.length >= 10) k2 ^= BigInt(read[9]) << 8n;
      if (read.length >= 9) {
        k2 ^= BigInt(read[8]);
        k2 = BigInt.asUintN(64, rotl64((k2 * C2) % MOD, 33) * C1) % MOD;
        h2 ^= k2;
      }
      if (read.length >= 8) k1 ^= BigInt(read[7]) << 56n;
      if (read.length >= 7) k1 ^= BigInt(read[6]) << 48n;
      if (read.length >= 6) k1 ^= BigInt(read[5]) << 40n;
      if (read.length >= 5) k1 ^= BigInt(read[4]) << 32n;
      if (read.length >= 4) k1 ^= BigInt(read[3]) << 24n;
      if (read.length >= 3) k1 ^= BigInt(read[2]) << 16n;
      if (read.length >= 2) k1 ^= BigInt(read[1]) << 8n;
      if (read.length >= 1) k1 ^= BigInt(read[0]);
      k1 = BigInt.asUintN(64, rotl64((k1 * C1) % MOD, 31) * C2) % MOD;
      h1 ^= k1;
    }
  }
}

function randomHexUpper(len) {
  const chars = '0123456789ABCDEF';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

function genUuid(ts) {
  const mp = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '1', '0'];
  const part = (n) => Array.from({ length: n }, () => mp[Math.floor(Math.random() * mp.length)]).join('');
  return [part(8), part(4), part(4), part(4), part(12)].join('-') + String(ts % 100000).padStart(5, '0') + 'infoc';
}

function hmacSha256Hex(key, msg) {
  return crypto.createHmac('sha256', Buffer.from(key, 'utf-8')).update(Buffer.from(msg, 'utf-8')).digest('hex');
}

function buildExClimbWuzhiPayload(uuid) {
  const payload = {
    '3064': 1,
    '5062': String(Date.now()),
    '03bf': 'https%3A%2F%2Fwww.bilibili.com%2F',
    '39c8': '333.1007.fp.risk',
    '34f1': '',
    'd402': '',
    '654a': '',
    '6e7c': '1699x794',
    '3c43': {
      '2673': 0, '5766': 32, '6527': 0, '7003': 1, '807e': 1,
      'b8ce': UPSTREAM_UA,
      '641c': 0, '07a4': 'zh-CN', '1c57': 32, '0bd0': 20,
      '748e': [960, 1707],
      'd61f': [912, 1707],
      'fc9d': -480,
      '6aa9': 'Asia/Shanghai',
      '75b8': 1, '3b21': 1, '8a1c': 0,
      'd52f': 'not available',
      'adca': 'Win32',
      '80c9': [
        ['PDF Viewer', 'Portable Document Format', [['application/pdf', 'pdf'], ['text/pdf', 'pdf']]],
        ['Chrome PDF Viewer', 'Portable Document Format', [['application/pdf', 'pdf'], ['text/pdf', 'pdf']]],
        ['Chromium PDF Viewer', 'Portable Document Format', [['application/pdf', 'pdf'], ['text/pdf', 'pdf']]],
        ['Microsoft Edge PDF Viewer', 'Portable Document Format', [['application/pdf', 'pdf'], ['text/pdf', 'pdf']]],
        ['WebKit built-in PDF', 'Portable Document Format', [['application/pdf', 'pdf'], ['text/pdf', 'pdf']]],
      ],
      '13ab': 'EPQAAAAASUVORK5CYII=',
      'bfe9': '//TgNIfAAAAAZJREFUAwBde+3wgcxEHQAAAABJRU5ErkJggg==',
      'a3c1': ['extensions:ANGLE_instanced_arrays;EXT_blend_minmax;EXT_clip_control;EXT_color_buffer_half_float;EXT_depth_clamp;EXT_disjoint_timer_query;EXT_float_blend;EXT_frag_depth;EXT_polygon_offset_clamp;EXT_shader_texture_lod;EXT_texture_compression_bptc;EXT_texture_compression_rgtc;EXT_texture_filter_anisotropic;EXT_texture_mirror_clamp_to_edge;EXT_sRGB;KHR_parallel_shader_compile;OES_element_index_uint;OES_fbo_render_mipmap;OES_standard_derivatives;OES_texture_float;OES_texture_float_linear;OES_texture_half_float;OES_texture_half_float_linear;OES_vertex_array_object;WEBGL_blend_func_extended;WEBGL_color_buffer_float;WEBGL_compressed_texture_s3tc;WEBGL_compressed_texture_s3tc_srgb;WEBGL_debug_renderer_info;WEBGL_debug_shaders;WEBGL_depth_texture;WEBGL_draw_buffers;WEBGL_lose_context;WEBGL_multi_draw;WEBGL_polygon_mode', 'webgl aliased line width range:[1, 1]', 'webgl aliased point size range:[1, 1024]', 'webgl alpha bits:8', 'webgl antialiasing:yes', 'webgl blue bits:8', 'webgl depth bits:24', 'webgl green bits:8', 'webgl max anisotropy:16', 'webgl max combined texture image units:32', 'webgl max cube map texture size:16384', 'webgl max fragment uniform vectors:1024', 'webgl max render buffer size:16384', 'webgl max texture image units:16', 'webgl max texture size:16384', 'webgl max varying vectors:30', 'webgl max vertex attribs:16', 'webgl max vertex texture image units:16', 'webgl max vertex uniform vectors:4095', 'webgl max viewport dims:[32767, 32767]', 'webgl red bits:8', 'webgl renderer:WebKit WebGL', 'webgl shading language version:WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)', 'webgl stencil bits:0', 'webgl vendor:WebKit', 'webgl version:WebGL 1.0 (OpenGL ES 2.0 Chromium)', 'webgl unmasked vendor:Google Inc. (NVIDIA)', 'webgl unmasked renderer:ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x000028E0) Direct3D11 vs_5_0 ps_5_0, D3D11)', 'webgl vertex shader high float precision:23', 'webgl vertex shader high float precision rangeMin:127', 'webgl vertex shader high float precision rangeMax:127', 'webgl vertex shader medium float precision:23', 'webgl vertex shader medium float precision rangeMin:127', 'webgl vertex shader medium float precision rangeMax:127', 'webgl vertex shader low float precision:23', 'webgl vertex shader low float precision rangeMin:127', 'webgl vertex shader low float precision rangeMax:127', 'webgl vertex shader high int precision:0', 'webgl vertex shader high int precision rangeMin:31', 'webgl vertex shader high int precision rangeMax:30', 'webgl vertex shader medium int precision:0', 'webgl vertex shader medium int precision rangeMin:31', 'webgl vertex shader medium int precision rangeMax:31', 'webgl fragment shader high float precision:23', 'webgl fragment shader high float precision rangeMin:127', 'webgl fragment shader high float precision rangeMax:127', 'webgl fragment shader medium float precision:23', 'webgl fragment shader medium float precision rangeMin:127', 'webgl fragment shader medium float precision rangeMax:127', 'webgl fragment shader low float precision:23', 'webgl fragment shader low float precision rangeMin:127', 'webgl fragment shader low float precision rangeMax:127'],
      '6bc5': 'Google Inc. (NVIDIA)~ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x000028E0) Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'ed31': 0, '72bd': 0, '097b': 0,
      '52cd': [0, 0, 0],
      'a658': ['Arial', 'Arial Black', 'Arial Narrow', 'Book Antiqua', 'Bookman Old Style', 'Calibri', 'Cambria', 'Cambria Math', 'Century', 'Century Gothic', 'Century Schoolbook', 'Comic Sans MS', 'Consolas', 'Courier', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Bright', 'Lucida Calligraphy', 'Lucida Console', 'Lucida Fax', 'Lucida Handwriting', 'Lucida Sans', 'Lucida Sans Typewriter', 'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Monotype Corsiva', 'MS Gothic', 'MS PGothic', 'MS Reference Sans Serif', 'MS Sans Serif', 'MS Serif', 'Palatino Linotype', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Symbol', 'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Wingdings', 'Wingdings 2', 'Wingdings 3'],
      'd02f': '124.04347527516074',
    },
    '54ef': '{"b_ut":"","home_version":"V8","in_new_ab":true,"ab_version":{"for_ai_home_version":"V8","in_theme_version":"OPEN","enable_web_push":"DISABLE","enable_ai_floor_api":"ENABLE","enable_shortcut_key":"DISABLE","rcmd_timeout_config":"550","home_performance_opt":"ssr_fetch_opt","infra_projection":"OFF"},"ab_split_num":{"for_ai_home_version":54,"in_theme_version":30,"enable_web_push":10,"enable_ai_floor_api":137,"enable_shortcut_key":54,"rcmd_timeout_config":49,"home_performance_opt":49,"infra_projection":49},"uniq_page_id":"1671272756362","is_modern":true}',
    '8b94': '',
    'df35': uuid,
    '07a4': 'zh-CN',
    '5f45': null,
    'db46': 0,
  };
  return JSON.stringify({ payload: JSON.stringify(payload) });
}

async function bareFetch(url, init) {
  return fetch(url, {
    ...init,
    // 所有出站请求必须带超时：Node fetch 默认无超时，上游停滞会挂死整个请求
    signal: AbortSignal.timeout(10000),
    headers: {
      'User-Agent': UPSTREAM_UA,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referer': 'https://www.bilibili.com/',
      ...(init && init.headers ? init.headers : {}),
    },
  });
}

async function bootstrapFingerprint() {
  const now = Math.floor(Date.now() / 1000);
  if (fp.ready && now - fp.bootAt < 12 * 3600 && now < fp.biliTicketExpires) return;
  if (fp.promise) return fp.promise;

  fp.promise = (async () => {
    fp.ready = false;
    fp.bootAt = now;
    fp.log = [];
    try {
      const spi = await (await bareFetch('https://api.bilibili.com/x/frontend/finger/spi')).json();
      fp.buvid3 = (spi.data && spi.data.b_3) || FALLBACK_BUVID3;
      fp.buvid4 = (spi.data && spi.data.b_4) || '';
      note('spi: ' + (spi.code === 0 ? 'ok' : 'code ' + spi.code));

      fp.uuid = genUuid(now);
      fp.bLsid = randomHexUpper(8) + '_' + now.toString(16).toUpperCase();
      fp.bNut = String(now);

      const m = murmur3x64_128(Buffer.from(UPSTREAM_UA, 'ascii'), 31);
      fp.buvidFp = m.lo.toString(16) + m.hi.toString(16);

      const cookieHeader = baseCookieString();

      try {
        const act = await (await bareFetch('https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: buildExClimbWuzhiPayload(fp.uuid),
        })).json();
        note('exclimbwuzhi: code ' + act.code);
      } catch (e) { note('exclimbwuzhi err: ' + e.message); }

      try {
        const hexsign = hmacSha256Hex('XgwSnGZ1p', 'ts' + now);
        const qp = new URLSearchParams({ key_id: 'ec02', hexsign: hexsign, 'context[ts]': String(now), csrf: '' });
        const t = await (await bareFetch('https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket?' + qp, {
          method: 'POST',
          headers: { 'Cookie': cookieHeader },
        })).json();
        if (t.code === 0 && t.data && t.data.ticket) {
          fp.biliTicket = t.data.ticket;
          fp.biliTicketExpires = now + 3 * 24 * 3600;
          note('bili_ticket: ok');
        } else {
          fp.biliTicket = '';
          fp.biliTicketExpires = now + 3600;
          note('bili_ticket: code ' + t.code);
        }
      } catch (e) {
        fp.biliTicket = '';
        fp.biliTicketExpires = now + 3600;
        note('bili_ticket err: ' + e.message);
      }

      fp.ready = true;
      note('bootstrap done');

      // 5) 顺带取 WBI 签名密钥（nav 匿名也返回 wbi_img），供 /ai/summary 服务端签名
      try {
        const nv = await (await bareFetch('https://api.bilibili.com/x/web-interface/nav')).json();
        const wbi = nv.data && nv.data.wbi_img;
        if (wbi && wbi.img_url && wbi.sub_url) {
          fp.wbiImg = wbi.img_url.split('/').pop().split('.')[0];
          fp.wbiSub = wbi.sub_url.split('/').pop().split('.')[0];
          note('wbi keys: ok');
        }
      } catch (e) { note('wbi keys err: ' + e.message); }
    } catch (e) {
      note('bootstrap failed: ' + e.message);
      fp.buvid3 = fp.buvid3 || FALLBACK_BUVID3;
      fp.biliTicket = '';
      fp.biliTicketExpires = now + 600;
    } finally {
      fp.promise = null;
    }
  })();

  return fp.promise;
}

function baseCookieString() {
  const c = [];
  if (fp.uuid) c.push('_uuid=' + fp.uuid);
  if (fp.bLsid) c.push('b_lsid=' + fp.bLsid);
  if (fp.bNut) c.push('b_nut=' + fp.bNut);
  if (fp.biliTicket) {
    c.push('bili_ticket=' + fp.biliTicket);
    c.push('bili_ticket_expires=' + fp.biliTicketExpires);
  }
  if (fp.buvidFp) c.push('buvid_fp=' + fp.buvidFp);
  c.push('buvid3=' + (fp.buvid3 || FALLBACK_BUVID3));
  if (fp.buvid4) c.push('buvid4=' + fp.buvid4);
  c.push('CURRENT_FNVAL=4048', 'CURRENT_QUALITY=0');
  return c.join('; ');
}

/* ================= HTTP 服务 ================= */

function sendJson(res, obj, status = 200, req = null) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(req),
  });
  res.end(JSON.stringify(obj));
}

async function pipeUpstream(res, upstreamResp, req = null) {
  const headers = {
    'Content-Type': upstreamResp.headers.get('Content-Type') || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(req),
  };
  res.writeHead(upstreamResp.status, headers);
  const reader = upstreamResp.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

/* ================= AI 总结（GLM-4-Flash） ================= */

// 软限流：每 IP 10 次/时、50 次/日；全局 300 次/日（实例级，冷启动重置——个人工具合理强度）
const aiLimit = new Map();
const AI_H = 10, AI_D = 50, AI_GLOBAL_D = 300;
let aiGlobalDay = { count: 0, start: Date.now() };

function aiAllow(ip) {
  const now = Date.now();
  let e = aiLimit.get(ip);
  if (!e || now - e.hStart > 3600e3) {
    e = (e && now - e.dStart <= 86400e3) ? e : { d: 0, dStart: now };
    e.h = 0; e.hStart = now;
    aiLimit.set(ip, e);
  }
  if (now - e.dStart > 86400e3) { e.d = 0; e.dStart = now; }
  if (e.h >= AI_H || e.d >= AI_D) return '达到调用频率限制，请稍后再试';
  e.h++; e.d++;
  if (now - aiGlobalDay.start > 86400e3) aiGlobalDay = { count: 0, start: now };
  if (aiGlobalDay.count >= AI_GLOBAL_D) return '今日总结额度已用完';
  aiGlobalDay.count++;
  return null;
}

const WBI_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
];

function wbiSignNode(params) {
  const mixinKey = WBI_TAB.map(i => (fp.wbiImg + fp.wbiSub)[i]).join('').slice(0, 32);
  const all = Object.assign({}, params, { wts: Math.floor(Date.now() / 1000) });
  const q = Object.keys(all).sort()
    .map(k => k + '=' + encodeURIComponent(String(all[k]).replace(/[!'()*]/g, '')))
    .join('&');
  return q + '&w_rid=' + crypto.createHash('md5').update(q + mixinKey, 'utf-8').digest('hex');
}

function fmtTs(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h > 0
    ? h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    : String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

async function aiSummaryHandler(req, res, url) {
  const json = (obj, status = 200) => sendJson(res, obj, status, req);
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const denied = aiAllow(ip);
  if (denied) return json({ code: -1, message: denied }, 429);

  const key = process.env.ZHIPU_API_KEY;
  if (!key) return json({ code: -1, message: 'AI 总结未配置（缺少 ZHIPU_API_KEY）' }, 503);

  let reqBody = {};
  try { reqBody = JSON.parse(await readBody(req)); } catch (e) { return json({ code: -1, message: '请求体格式错误' }); }
  const bvid = String(reqBody.bvid || ''), cid = Number(reqBody.cid || 0), lan = String(reqBody.lan || '');
  if (!/^BV[1-9A-HJ-NP-Za-km-z]{10}$/.test(bvid) || !cid || !lan) {
    return json({ code: -1, message: '参数不完整' });
  }

  // AI 强制登录：滥用需消耗真实 B 站账号（校验结果按 Cookie 哈希缓存 10 分钟）
  if (!(await requireLogin(req))) return json({ code: -1, message: 'AI 总结需要登录后使用' }, 401);

  await bootstrapFingerprint();
  const userCookie = req.headers['x-bili-cookie'] || '';
  const fullCookie = baseCookieString() + (userCookie ? '; ' + userCookie : '');
  const hdrs = {
    'User-Agent': UPSTREAM_UA,
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.bilibili.com/',
    'Cookie': fullCookie,
  };

  // 服务端自己拉字幕（不接受客户端传文本，杜绝端点被当成任意摘要服务）
  const qs = wbiSignNode({ bvid: bvid, cid: cid, dm_img_list: '[]', dm_img_str: 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ', dm_cover_img_str: 'QU5HTEUgKE5WSURJQSwgTlZJRElBIEdlRm9yY2UgUlRYIDQwNjAgTGFwdG9wIEdQVSAoMHgwMDAwMjhFMCkgRGlyZWN0M0QxMSB2c181XzAgcHNfNV8wLCBEM0QxMSlHb29nbGUgSW5jLiAoTlZJRElBKQ', dm_img_inter: '{"ds":[],"wh":[5231,6067,75],"of":[475,950,475]}' });
  const player = await (await fetch('https://api.bilibili.com/x/player/wbi/v2?' + qs, { headers: hdrs })).json();
  if (player.code !== 0) return json({ code: -1, message: '字幕列表获取失败：' + (player.message || player.code) });
  const entry = ((player.data.subtitle || {}).subtitles || []).find(s => s.lan === lan);
  if (!entry || !entry.subtitle_url) return json({ code: -1, message: '未找到该语言的字幕' });
  let sUrl = entry.subtitle_url;
  if (sUrl.startsWith('//')) sUrl = 'https:' + sUrl;
  const subBody = await (await fetch(sUrl, { headers: hdrs, signal: AbortSignal.timeout(15000) })).json();
  if (!Array.isArray(subBody.body) || !subBody.body.length) return json({ code: -1, message: '字幕内容为空' });

  // 拼接带时间戳的字幕文本（上限 400 行 / 8000 字）
  const text = subBody.body.slice(0, 400)
    .map(it => '[' + fmtTs(it.from || 0) + ']' + (it.content || ''))
    .join('\n').slice(0, 8000);

  const sys = '你是视频字幕总结助手。根据带时间戳的字幕内容输出 JSON（不要输出其他内容），字段：'
    + 'tldr（一句话总结，不超过 60 字）、points（核心要点字符串数组，3-7 条，每条不超过 40 字）、'
    + 'chapters（章节对象数组 [{time: "MM:SS", title: "章节名"}]，3-8 个，time 必须取自字幕中出现的时间戳）、'
    + 'keywords（关键词字符串数组，3-6 个，每个不超过 6 字）。';

  const glmResp = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(45000),
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: '以下是视频字幕：\n' + text },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });
  const glm = await glmResp.json();
  const content = glm.choices && glm.choices[0] && glm.choices[0].message && glm.choices[0].message.content;
  if (!content) {
    return json({ code: -1, message: 'AI 调用失败：' + ((glm.error && glm.error.message) || glmResp.status) }, 502);
  }
  let parsed;
  try { parsed = JSON.parse(content); } catch (e) { parsed = { tldr: content }; }
  return json({
    code: 0,
    data: {
      tldr: String(parsed.tldr || ''),
      points: Array.isArray(parsed.points) ? parsed.points.map(String).slice(0, 7) : [],
      chapters: Array.isArray(parsed.chapters) ? parsed.chapters.slice(0, 8).map(c => ({ time: String(c.time || ''), title: String(c.title || '') })) : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 6) : [],
    },
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 1e5) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

/* ================= 访问控制 ================= */

// Origin 白名单：浏览器跨域请求必带 Origin 且无法伪造，可挡住其他网站热链中继；
// curl 等非浏览器客户端可伪造该头，属残留风险（前端无秘密可言，此为合理强度）
const ALLOWED_ORIGINS = ['https://jingw-ui.github.io', 'https://jingweb.me'];
const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function originOk(req) {
  const o = req.headers.origin;
  // 无 Origin（同源探测）或 null（file:// 本地直开）放行
  if (o === undefined || o === '' || o === 'null') return true;
  return ALLOWED_ORIGINS.indexOf(o) !== -1 || LOCAL_ORIGIN_RE.test(o);
}

function corsHeaders(req) {
  const o = req && req.headers ? req.headers.origin : undefined;
  // CORS 按白名单反射；不在白名单的来源不给 ACAO 头，浏览器直接拦截响应
  let acao = '*';
  if (o !== undefined && o !== '' && o !== 'null') {
    acao = (ALLOWED_ORIGINS.indexOf(o) !== -1 || LOCAL_ORIGIN_RE.test(o)) ? o : '';
  }
  const h = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'x-bili-cookie, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (acao) h['Access-Control-Allow-Origin'] = acao;
  return h;
}

// 登录校验（结果按 Cookie 哈希缓存 10 分钟，避免每次总结都多打一次 nav）
const loginCache = new Map();

async function requireLogin(req) {
  const cookie = req.headers['x-bili-cookie'] || '';
  if (cookie.indexOf('SESSDATA=') === -1) return false;
  const hash = crypto.createHash('sha256').update(cookie).digest('hex').slice(0, 16);
  const now = Date.now();
  const c = loginCache.get(hash);
  if (c && now < c.until) return c.ok;
  let ok = false;
  try {
    const nav = await (await bareFetch('https://api.bilibili.com/x/web-interface/nav', {
      headers: { Cookie: baseCookieString() + '; ' + cookie },
    })).json();
    ok = !!(nav.data && nav.data.isLogin);
  } catch (e) { ok = false; }
  loginCache.set(hash, { ok: ok, until: now + 600e3 });
  if (loginCache.size > 500) loginCache.clear();
  return ok;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const json = (obj, status = 200) => sendJson(res, obj, status, req);
  const pipe = (up) => pipeUpstream(res, up, req);

  try {
    // 非 白名单 Origin 一律 403（其他网站热链/盗用中继的第一道闸）
    if (!originOk(req)) return json({ code: -1, message: 'forbidden' }, 403);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders());
      return res.end();
    }
    if (req.method !== 'GET' && req.method !== 'POST') {
      return json({ code: -1, message: 'method not allowed' }, 405);
    }

    // ---- AI 总结（POST）----
    if (url.pathname === '/ai/summary') {
      return aiSummaryHandler(req, res, url);
    }

    // ---- 调试 ----
    if (url.pathname === '/debug/fp') {
      await bootstrapFingerprint();
      return json({ ready: fp.ready, buvid3: fp.buvid3, bootAt: fp.bootAt, log: fp.log });
    }
    if (url.pathname === '/debug/upstream') {
      const host = url.searchParams.get('host') || 'api.bilibili.com';
      try {
        const r = await bareFetch('https://' + host + '/x/web-interface/view?bvid=BV1GJ411x7h7');
        const j = await r.json();
        return json({ host: host, http: r.status, code: j.code, message: j.message, hasData: !!j.data });
      } catch (e) {
        return json({ host: host, error: e.message });
      }
    }

    // ---- b23.tv 短链解析 ----
    if (url.pathname === '/resolve') {
      const target = url.searchParams.get('url') || '';
      let tu;
      try { tu = new URL(target); } catch (e) { return json({ code: -1, message: '链接格式错误' }); }
      if (tu.hostname !== 'b23.tv') return json({ code: -1, message: '仅支持 b23.tv 短链' });
      await bootstrapFingerprint();
      const userCookie = req.headers['x-bili-cookie'] || '';
      const resp = await fetch(tu.href, {
        headers: {
          'User-Agent': UPSTREAM_UA,
          'Referer': 'https://www.bilibili.com/',
          'Cookie': baseCookieString() + (userCookie ? '; ' + userCookie : ''),
        },
        redirect: 'follow',
      });
      return json({ code: 0, data: { url: resp.url } });
    }

    // ---- 字幕 CDN ----
    if (url.pathname === '/bili/cdn') {
      const target = url.searchParams.get('url') || '';
      let tu;
      try { tu = new URL(target); } catch (e) { return json({ code: -1, message: '链接格式错误' }); }
      const ok = tu.protocol === 'https:' &&
        (tu.hostname === 'aisubtitle.hdslb.com' || tu.hostname.endsWith('.hdslb.com'));
      if (!ok) return json({ code: -1, message: '仅支持 hdslb.com 字幕资源' });
      await bootstrapFingerprint();
      const userCookie = req.headers['x-bili-cookie'] || '';
      const resp = await fetch(tu.href, {
        headers: {
          'User-Agent': UPSTREAM_UA,
          'Accept': '*/*',
          'Referer': 'https://www.bilibili.com/',
          'Cookie': baseCookieString() + (userCookie ? '; ' + userCookie : ''),
        },
      });
      return pipe(resp);
    }

    // ---- B 站 API / 登录接口透传 ----
    const m = url.pathname.match(/^\/bili\/(api|passport)\/(.+)$/);
    if (m) {
      const host = m[1] === 'api' ? 'api.bilibili.com' : 'passport.bilibili.com';
      await bootstrapFingerprint();
      const userCookie = req.headers['x-bili-cookie'] || '';
      const fullCookie = baseCookieString() + (userCookie ? '; ' + userCookie : '');
      const upstream = 'https://' + host + '/' + m[2] + url.search;
      const resp = await fetch(upstream, {
        headers: {
          'User-Agent': UPSTREAM_UA,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.bilibili.com/',
          'Cookie': fullCookie,
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });

      // 二维码登录成功时，凭证通过 Set-Cookie 头下发（crossDomain URL 已不含 Cookie），
      // 转写进 JSON 体（bili_cookies 字段）交给前端
      if (m[2].includes('qrcode/poll')) {
        let setCookies = [];
        try {
          if (typeof resp.headers.getSetCookie === 'function') setCookies = resp.headers.getSetCookie();
          else {
            const raw = resp.headers.get('set-cookie');
            if (raw) setCookies = [raw];
          }
        } catch (e) { setCookies = []; }
        if (setCookies.length) {
          const bodyText = await resp.text();
          let j = {};
          try { j = JSON.parse(bodyText); } catch (e) { j = { code: -1, message: 'bad json' }; }
          j.bili_cookies = setCookies;
          return json(j, resp.status);
        }
      }

      return pipe(resp);
    }

    return json({ code: -1, message: 'not found' }, 404);
  } catch (e) {
    return json({ code: -1, message: 'relay error: ' + ((e && e.message) || String(e)) }, 502);
  }
});

server.listen(PORT, () => {
  console.log('bili-subtitle relay listening on port ' + PORT);
});
