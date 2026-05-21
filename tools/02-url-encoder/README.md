# URL 编解码工具

> 工具编号：02 | 分类：文本处理类

## 功能简介

URL 编码、解码、参数解析与拼接的一站式工具，支持标准 URL 编码和 URL 安全 Base64。

## 核心功能

- **URL 编码/解码**：支持 encodeURI 和 encodeURIComponent 两种模式
- **URL 参数解析**：解析 URL 的协议、主机、路径、查询参数、锚点等
- **URL 拼接构建**：可视化填写参数，自动生成完整 URL
- **URL 安全 Base64**：使用 `-` 和 `_` 替代 `+` 和 `/`

## 使用方式

1. 打开 `index.html`
2. 各功能区独立操作，互不干扰

## 技术栈

- 纯 HTML + CSS + 原生 JavaScript
- 使用原生 URL API 进行解析

## 开发状态

- [x] URL 编码（encodeURI/encodeURIComponent）
- [x] URL 解码
- [x] 文本互换功能
- [x] URL 各部分解析
- [x] 可视化 URL 拼接
- [x] URL 安全 Base64 编解码
- [x] 一键复制结果
- [x] 响应式布局
