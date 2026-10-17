# relay-aliyun —— 阿里云函数计算（FC）中继

B站字幕提取工具的**现役后端**。

## 为什么在阿里云

B 站 WAF 在 IP 层封锁 Cloudflare Workers 出口段（所有 api/passport 请求返回
`-412 request was banned`，连指纹引导接口 spi 也一样）。阿里云国内机房的 IP
配合设备指纹引导可通过全部风控（实测：spi ok → ExClimbWuzhi code 0 → bili_ticket ok）。

## 部署

1. https://fcnext.console.aliyun.com → 创建函数 → **Web 函数** → Node.js 18+
2. 代码上传：ZIP 包（server.js + package.json）
3. 启动命令 `node server.js`，监听端口 9000
4. 配置 → 公网访问 URL → 认证方式选 **「无需认证」**（否则请求报 MissingRequiredHeader）
5. 公网地址形如 `https://<name>.<region>.fcapp.run`，填进 `../index.html` 的 `WORKER_BASE`

## 费用

按量付费，每月有免费试用额度；个人工具用量（每月几千次调用、流量几 MB）
账单趋近 0 元。

## 安全

只做只读 GET 转发；用户 Cookie 仅在单次请求内存中中转，不落盘不打日志。
