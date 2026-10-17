# bili-subtitle Worker（Cloudflare 版，存档）

> ⚠️ **此版本已停用**：B 站 WAF 在 IP 层封锁 Cloudflare Workers 出口段，
> 所有 api/passport 请求返回 `-412 request was banned`（实测含指纹引导接口 spi）。
> 现役后端为 `../relay-aliyun/`（阿里云函数计算版，逻辑与本版一致）。
> 本目录保留作参考。

B站字幕提取工具（`tools/bili-subtitle/index.html`）的后端反代，部署到 Cloudflare Workers。

## 为什么需要它

B 站 WAF 封杀一切携带 `Origin` 头的跨域请求（浏览器 fetch 必带），字幕列表又必须登录
Cookie 才能拿到。静态页无法直连，需要一层自己的反代：补 Referer/UA/设备指纹，
并按需注入用户的 SESSDATA。

Worker **只做只读转发**：不落盘、不打日志、不存 Cookie。

## 部署

```bash
cd tools/bili-subtitle/worker
npx wrangler login    # 首次使用，浏览器完成授权
npx wrangler deploy
```

部署完成后会得到 `https://bili-subtitle.<你的子域>.workers.dev`，
把它填进 `../index.html` 顶部的 `WORKER_BASE` 常量即可。

可选：编辑 `wrangler.toml`，取消 `ALLOWED_ORIGIN` 的注释并设为你的站点，
限制只有自己的页面能调用。

## 路由

| 路由 | 用途 |
|---|---|
| `/bili/api/*` | 透传 api.bilibili.com（GET） |
| `/bili/passport/*` | 透传 passport.bilibili.com（扫码登录） |
| `/bili/cdn?url=` | 拉取字幕 JSON，仅限 `*.hdslb.com` |
| `/resolve?url=` | b23.tv 短链跟随重定向，返回最终 URL |
