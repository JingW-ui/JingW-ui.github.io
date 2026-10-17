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

## 路由

| 路由 | 用途 |
|---|---|
| `/bili/api/*` | 透传 api.bilibili.com（GET） |
| `/bili/passport/*` | 透传 passport.bilibili.com（扫码登录） |
| `/bili/cdn?url=` | 拉取字幕 JSON，仅限 `*.hdslb.com` |
| `/resolve?url=` | b23.tv 短链跟随重定向，返回最终 URL |
| `/ai/summary` | POST `{bvid, cid, lan}` → 服务端拉字幕并调 GLM-4-Flash 生成结构化总结 |
| `/debug/fp` | 设备指纹引导状态 |

## AI 总结配置

1. https://bigmodel.cn 注册并实名，创建 API key（GLM-4-Flash 模型免费）
2. FC 控制台 → 函数详情 → 配置 → 环境变量 → 创建 `ZHIPU_API_KEY` = 你的 key
3. 无 key 时 `/ai/summary` 返回 503；软限流：每 IP 10 次/时、50 次/日，全局 300 次/日
4. 字幕文本由服务端自行拉取（不接受客户端传文本），上限 400 行 / 8000 字
