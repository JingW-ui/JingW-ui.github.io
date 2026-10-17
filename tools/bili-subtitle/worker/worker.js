/**
 * B站字幕提取 —— Cloudflare Worker 反向代理
 *
 * 职责单一：把静态页发起的只读 GET 请求转发到 B 站并补齐必要的请求头与设备指纹。
 * 不存储任何数据：用户的登录 Cookie 只在这一次请求的内存里中转，不落盘、不打日志。
 *
 * 路由：
 *   /bili/api/<path>?<query>      →  https://api.bilibili.com/<path>?<query>
 *   /bili/passport/<path>?<query> →  https://passport.bilibili.com/<path>?<query>
 *   /bili/cdn?url=<enc>           →  字幕 JSON（仅限 *.hdslb.com）
 *   /resolve?url=<enc>            →  b23.tv 短链跟随重定向，返回最终 URL
 *
 * 登录态：前端通过请求头 x-bili-cookie 传入（如 "SESSDATA=…; DedeUserID=…"），
 * Worker 把它并入 Cookie 后转发给 B 站。
 *
 * 风控应对：B 站对机房 IP 的匿名请求返回 -412。为此在冷启动时执行一次
 * 「设备指纹引导」（移植自 Bili23-Downloader 的 auth/cookie.py）：
 *   spi 颁发 buvid3/buvid4 → 生成 _uuid/b_lsid/b_nut/buvid_fp →
 *   HMAC-SHA256 签发 bili_ticket → ExClimbWuzhi 激活 buvid3。
 * 指纹结果只存在模块级变量里（随 isolate 存活），不含任何用户信息。
 */

const UPSTREAM_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// 兜底指纹（spi 失败时使用）：随机生成、不含身份信息的设备标识
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
  bootAt: 0,
  log: [],
};

function note(msg) {
  fp.log.push(msg);
  if (fp.log.length > 30) fp.log.shift();
}

function rotl64(x, k) {
  return BigInt.asUintN(64, BigInt.asUintN(64, x << BigInt(k)) | BigInt.asUintN(64, x >> BigInt(64 - k)));
}

// murmur3 x64 128（移植自 Bili23 cookie.py，含其特有的尾块处理）
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
  // Bili23: "123456789ABCDEF" + "10"，按 8-4-4-4-12 分段 + 时间戳后 5 位 + infoc
  const mp = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '1', '0'];
  const part = (n) => Array.from({ length: n }, () => mp[Math.floor(Math.random() * mp.length)]).join('');
  return [part(8), part(4), part(4), part(4), part(12)].join('-') + String(ts % 100000).padStart(5, '0') + 'infoc';
}

async function hmacSha256Hex(key, msg) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ExClimbWuzhi 激活载荷（模板移植自 Bili23 exclimbwuzhi.py，设备画像为固定伪装值）
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
  // 指纹 12 小时内复用；bili_ticket 3 天有效
  if (fp.ready && now - fp.bootAt < 12 * 3600 && now < fp.biliTicketExpires) return;

  fp.ready = false;
  fp.bootAt = now;
  fp.log = [];
  try {
    // 1) spi 颁发 buvid3/buvid4
    const spi = await (await bareFetch('https://api.bilibili.com/x/frontend/finger/spi')).json();
    fp.buvid3 = (spi.data && spi.data.b_3) || FALLBACK_BUVID3;
    fp.buvid4 = (spi.data && spi.data.b_4) || '';
    note('spi: ' + (spi.code === 0 ? 'ok' : 'code ' + spi.code));

    fp.uuid = genUuid(now);
    fp.bLsid = randomHexUpper(8) + '_' + now.toString(16).toUpperCase();
    fp.bNut = String(now);

    // 2) buvid_fp = murmur3_x64_128(UA, seed 31)
    const m = murmur3x64_128(new TextEncoder().encode(UPSTREAM_UA), 31);
    fp.buvidFp = m.lo.toString(16) + m.hi.toString(16);

    const anonCookies = baseCookieString();
    const cookieHeader = anonCookies;

    // 3) ExClimbWuzhi 激活 buvid3
    try {
      const act = await (await bareFetch('https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
        body: buildExClimbWuzhiPayload(fp.uuid),
      })).json();
      note('exclimbwuzhi: code ' + act.code);
    } catch (e) { note('exclimbwuzhi err: ' + e.message); }

    // 4) bili_ticket（HMAC-SHA256）
    try {
      const hexsign = await hmacSha256Hex('XgwSnGZ1p', 'ts' + now);
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
  } catch (e) {
    note('bootstrap failed: ' + e.message);
    fp.buvid3 = fp.buvid3 || FALLBACK_BUVID3;
    fp.biliTicket = '';
    fp.biliTicketExpires = now + 600;
  }
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

/* ================= HTTP 入口 ================= */

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'x-bili-cookie',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(obj, env, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(env),
    },
  });
}

function proxyResponse(upstreamResp, env) {
  const headers = {
    'Content-Type': upstreamResp.headers.get('Content-Type') || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(env),
  };
  return new Response(upstreamResp.body, { status: upstreamResp.status, headers });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') {
      return jsonResponse({ code: -1, message: 'method not allowed' }, env, 405);
    }

    const url = new URL(request.url);

    try {
      // ---- 调试：测试不同上游域名的连通性 ----
      if (url.pathname === '/debug/upstream') {
        const host = url.searchParams.get('host') || 'api.bilibili.com';
        try {
          const r = await fetch('https://' + host + '/x/web-interface/view?bvid=BV1GJ411x7h7', {
            headers: {
              'User-Agent': UPSTREAM_UA,
              'Accept': 'application/json, text/plain, */*',
              'Referer': 'https://www.bilibili.com/',
            },
          });
          const j = await r.json();
          return jsonResponse({ host: host, http: r.status, code: j.code, message: j.message, hasData: !!j.data }, env);
        } catch (e) {
          return jsonResponse({ host: host, error: e.message }, env);
        }
      }

      // ---- 调试：查看指纹引导状态 ----
      if (url.pathname === '/debug/fp') {
        await bootstrapFingerprint();
        return jsonResponse({ ready: fp.ready, buvid3: fp.buvid3, bootAt: fp.bootAt, log: fp.log }, env);
      }

      // ---- b23.tv 短链解析：跟随重定向，返回最终落地页 ----
      if (url.pathname === '/resolve') {
        const target = url.searchParams.get('url') || '';
        let tu;
        try { tu = new URL(target); } catch (e) { return jsonResponse({ code: -1, message: '链接格式错误' }, env); }
        if (tu.hostname !== 'b23.tv') {
          return jsonResponse({ code: -1, message: '仅支持 b23.tv 短链' }, env);
        }
        await bootstrapFingerprint();
        const resolveCookie = baseCookieString() + (request.headers.get('x-bili-cookie') ? '; ' + request.headers.get('x-bili-cookie') : '');
        const resp = await fetch(tu.href, { headers: { 'User-Agent': UPSTREAM_UA, 'Referer': 'https://www.bilibili.com/', 'Cookie': resolveCookie }, redirect: 'follow' });
        return jsonResponse({ code: 0, data: { url: resp.url } }, env);
      }

      // ---- 字幕 CDN（白名单 *.hdslb.com）----
      if (url.pathname === '/bili/cdn') {
        const target = url.searchParams.get('url') || '';
        let tu;
        try { tu = new URL(target); } catch (e) { return jsonResponse({ code: -1, message: '链接格式错误' }, env); }
        const ok = tu.protocol === 'https:' &&
          (tu.hostname === 'aisubtitle.hdslb.com' || tu.hostname.endsWith('.hdslb.com'));
        if (!ok) return jsonResponse({ code: -1, message: '仅支持 hdslb.com 字幕资源' }, env);
        await bootstrapFingerprint();
        const resp = await fetch(tu.href, {
          headers: {
            'User-Agent': UPSTREAM_UA,
            'Accept': '*/*',
            'Referer': 'https://www.bilibili.com/',
            'Cookie': baseCookieString() + '; ' + (request.headers.get('x-bili-cookie') || ''),
          },
        });
        return proxyResponse(resp, env);
      }

      // ---- B 站 API / 登录接口透传 ----
      const m = url.pathname.match(/^\/bili\/(api|passport)\/(.+)$/);
      if (m) {
        const host = m[1] === 'api' ? 'api.bilibili.com' : 'passport.bilibili.com';
        await bootstrapFingerprint();
        const userCookie = request.headers.get('x-bili-cookie') || '';
        const fullCookie = baseCookieString() + (userCookie ? '; ' + userCookie : '');
        const upstream = `https://${host}/${m[2]}${url.search}`;
        const resp = await fetch(upstream, {
          headers: {
            'User-Agent': UPSTREAM_UA,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.bilibili.com/',
            'Cookie': fullCookie,
          },
          redirect: 'follow',
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
            return jsonResponse(j, env, resp.status);
          }
        }

        return proxyResponse(resp, env);
      }

      return jsonResponse({ code: -1, message: 'not found' }, env, 404);
    } catch (e) {
      return jsonResponse({ code: -1, message: 'worker error: ' + ((e && e.message) || String(e)) }, env, 502);
    }
  },
};
