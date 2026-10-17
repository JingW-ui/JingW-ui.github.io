/**
 * B站字幕提取 —— Cloudflare Worker 反向代理
 *
 * 职责单一：把静态页发起的只读 GET 请求转发到 B 站并补齐必要的请求头。
 * 不存储任何数据：用户的登录 Cookie 只在这一次请求的内存里中转，不落盘、不打日志。
 *
 * 路由：
 *   /bili/api/<path>?<query>    →  https://api.bilibili.com/<path>?<query>
 *   /bili/passport/<path>?<query> → https://passport.bilibili.com/<path>?<query>
 *   /bili/cdn?url=<enc>         →  字幕 JSON（仅限 *.hdslb.com）
 *   /resolve?url=<enc>          →  b23.tv 短链跟随重定向，返回最终 URL
 *
 * 登录态：前端通过请求头 x-bili-cookie 传入（如 "SESSDATA=…; DedeUserID=…"），
 * Worker 把它并入 Cookie 后转发给 B 站。
 */

const UPSTREAM_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// 随机设备指纹（buvid3），部署时固定。B 站部分接口对无指纹的请求返回 -352 风控，
// 一个稳定的 buvid3 能显著降低这种情况；它不含任何身份信息。
const BUVID3 = 'e5a1f4c9-3b2d-4c8e-9f6a-7d0b8c1a2e3f';

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

function buildCookieHeader(userCookie) {
  return userCookie ? `buvid3=${BUVID3}; ${userCookie}` : `buvid3=${BUVID3}`;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') {
      return jsonResponse({ code: -1, message: 'method not allowed' }, env, 405);
    }

    const url = new URL(request.url);
    const userCookie = request.headers.get('x-bili-cookie') || '';

    // 只允许出现在转发头里的字段，其余一律不带
    const fwdHeaders = {
      'User-Agent': UPSTREAM_UA,
      'Referer': 'https://www.bilibili.com/',
      'Cookie': buildCookieHeader(userCookie),
    };

    try {
      // ---- b23.tv 短链解析：跟随重定向，返回最终落地页 ----
      if (url.pathname === '/resolve') {
        const target = url.searchParams.get('url') || '';
        let tu;
        try { tu = new URL(target); } catch (e) { return jsonResponse({ code: -1, message: '链接格式错误' }, env); }
        if (tu.hostname !== 'b23.tv') {
          return jsonResponse({ code: -1, message: '仅支持 b23.tv 短链' }, env);
        }
        const resp = await fetch(tu.href, { headers: fwdHeaders, redirect: 'follow' });
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
        const resp = await fetch(tu.href, { headers: fwdHeaders });
        return proxyResponse(resp, env);
      }

      // ---- B 站 API / 登录接口透传 ----
      const m = url.pathname.match(/^\/bili\/(api|passport)\/(.+)$/);
      if (m) {
        const host = m[1] === 'api' ? 'api.bilibili.com' : 'passport.bilibili.com';
        const upstream = `https://${host}/${m[2]}${url.search}`;
        const resp = await fetch(upstream, { headers: fwdHeaders, redirect: 'follow' });
        return proxyResponse(resp, env);
      }

      return jsonResponse({ code: -1, message: 'not found' }, env, 404);
    } catch (e) {
      return jsonResponse({ code: -1, message: 'worker error: ' + ((e && e.message) || String(e)) }, env, 502);
    }
  },
};
