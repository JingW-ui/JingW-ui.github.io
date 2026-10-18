# B站字幕提取

粘贴 B 站视频链接，扫码登录后在线查看、复制与导出视频字幕，并支持 AI 总结。
纯静态页面 + 轻量服务端中继，登录凭证只存在浏览器里。

在线地址：`https://jingw-ui.github.io/tools/bili-subtitle/`

## 功能

| 模块 | 说明 |
|---|---|
| 链接解析 | 支持 BV 号 / av 号 / b23.tv 短链 / 带跟踪参数的完整链接，自动识别分 P（`?p=N`） |
| 扫码登录 | 网页内展示二维码，B 站 App 扫码即登录；凭证存 localStorage，约 1 个月有效 |
| 字幕展示 | **列表**（紧凑行 + 时间戳开关）与**文稿**（流式段落、两端对齐、每行填满）双视图切换 |
| AI 总结 | GLM-4-Flash 生成一句话 TL;DR、核心要点、时间轴章节与关键词 |
| 快速复制 | 内容容器角标一键复制（GitHub 代码块风格），所见即所得 |
| 格式导出 | SRT / ASS / TXT / JSON，含 UTF-8 BOM 与时间格式进位修复 |
| 历史记录 | 最近 20 条查询记录存本机，点击重查 |

## 架构

```
静态页（GitHub Pages）
   │  fetch + 自定义头 x-bili-cookie
   ▼
阿里云函数计算中继（relay-aliyun/）
   │  补 Referer/UA/设备指纹 · 注入 SESSDATA · WBI 签名
   ├──▶ api.bilibili.com        视频信息 / 播放器信息 / 字幕列表
   ├──▶ passport.bilibili.com   扫码登录 generate / poll
   ├──▶ *.hdslb.com             字幕 JSON
   ├──▶ b23.tv                  短链解析
   └──▶ open.bigmodel.cn        GLM-4-Flash（AI 总结）
```

**为什么需要中继**：B 站 WAF 在 IP 层封锁一切携带 `Origin` 头的跨域请求（浏览器 fetch
必带），且字幕列表必须登录 Cookie 才返回。纯前端无法直连，需要一层自己的转发。
Cloudflare Workers 的出口段被 B 站整体封禁（`-412 request was banned`，实测），故
部署在阿里云函数计算——国内机房 IP 配合设备指纹引导可通过全部风控。

**设备指纹引导**（移植自 [Bili23-Downloader](https://github.com/scott-sloan/Bili23-Downloader)）：
冷启动时依次完成 spi 颁发 buvid3/buvid4 → murmur3 计算 buvid_fp → ExClimbWuzhi 激活 →
HMAC-SHA256 签发 bili_ticket，结果仅存实例内存。无指纹的匿名请求会被 B 站以 -352/-412 拒绝。

**WBI 签名**同样移植自 Bili23（nav 取密钥 → 64 位置换表 → md5），前端与中继各有一份实现，
两者输出已做交叉验证。

## 部署

### 静态页

仓库即 GitHub Pages 站点，`tools/bili-subtitle/` 随站点自动发布；
`index.html` 顶部的 `WORKER_BASE` 需指向你的中继地址。

### 中继（阿里云函数计算）

详见 [relay-aliyun/README.md](relay-aliyun/README.md)，要点：

1. 创建 **Web 函数**（Node.js 18+），上传 ZIP，启动命令 `node server.js`，端口 9000
2. 公网访问 URL 认证方式选「无需认证」，函数超时建议 120 秒
3. AI 总结需要配置环境变量 `ZHIPU_API_KEY`（智谱 bigmodel.cn，GLM-4-Flash 免费）
4. 公网地址形如 `https://<name>.<region>.fcapp.run`

### Cloudflare Worker 版（存档）

`worker/` 是早期的 CF Worker 实现，因 B 站封锁其出口段已停用，代码留作参考，
其中的 WBI 签名与指纹逻辑与 FC 版一致。

## 目录结构

```
tools/bili-subtitle/
├── index.html            工具页面（查询/登录/双视图/AI 总结/导出）
├── favicon.svg           B 站粉色 logo 标签页图标
├── vendor/
│   ├── style.css         页面样式（B 站粉主题）
│   ├── qrcode.min.js     二维码渲染（qrcode-generator，MIT）
│   └── md5.min.js        WBI 签名用 MD5（blueimp-md5，MIT）
├── relay-aliyun/         阿里云函数计算中继（现役后端）
│   ├── server.js         HTTP 服务：透传/字幕拉取/扫码登录/AI 总结
│   └── README.md         部署与配置说明
└── worker/               Cloudflare Worker 版（存档）
```

## 安全与隐私

- 登录凭证（SESSDATA）只存浏览器 localStorage，中继仅在单次请求内存中转，不落盘不打日志
- 点击右上角头像可随时退出登录（清除本地凭证）
- AI 总结会把字幕文本发送至智谱 API，卡片上有明示；总结结果按视频缓存于本机
- 中继的 `/ai/summary` 只接受 `{bvid, cid, lan}`，字幕由服务端自行拉取，配软限流防滥用

## 鸣谢

- [Bili23-Downloader](https://github.com/scott-sloan/Bili23-Downloader)：WBI 签名、
  设备指纹引导、av→BV 转换与字幕格式转换逻辑的参考实现
- [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)：B 站接口文档
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) /
  [blueimp-md5](https://github.com/blueimp/JavaScript-MD5)：前端依赖库
