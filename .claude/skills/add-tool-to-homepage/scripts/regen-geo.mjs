#!/usr/bin/env node
/**
 * regen-geo.mjs — GEO 清单重生成（sitemap.xml / llms.txt / llms-full.txt）
 *
 * 用法：在仓库根目录运行  node .claude/skills/add-tool-to-homepage/scripts/regen-geo.mjs
 *
 * 单一事实源：三个 hub 页的卡片属性
 *   - tools/index.html      → a.tool-card 的 href / data-name / data-desc
 *   - softwares/index.html  → div.software-card 的 data-name / data-desc / download-btn href / repo-pill href
 *   - Games/index.html      → div.game-card 的 data-href / data-name / data-cat
 *
 * 规则：
 *   - 子页面清单从 git ls-files 枚举（不会误收未跟踪的工作目录）
 *   - sitemap 的 lastmod 精确继承：已存在 URL 原样保留，仅新 URL 与三个 hub 刷成今天
 *   - llms.txt / llms-full.txt 全量重生成（删除条目自动清理）
 *   - 幂等：重复运行无害
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const SITE = 'https://jingw-ui.github.io';
const today = new Date().toISOString().slice(0, 10);

if (!fs.existsSync('tools/index.html') || !fs.existsSync('Games/index.html')) {
    console.error('错误：请在仓库根目录运行本脚本（找不到 tools/index.html）');
    process.exit(1);
}

// ---------- 1. git 枚举已跟踪子页面 ----------
const tracked = (p) => execSync(`git ls-files "${p}"`, { encoding: 'utf8' })
    .split('\n').map(s => s.trim()).filter(Boolean);
const toolPages = tracked('tools/*/index.html').map(p => '/' + p.replace(/\/index\.html$/, '/'));
const gamePages = tracked('Games/*/index.html').map(p => '/' + p.replace(/\/index\.html$/, '/'));

// ---------- 2. 解析三个 hub ----------
const toolsHtml = fs.readFileSync('tools/index.html', 'utf8');
const toolCards = [];
{
    const re = /<a href="([^"]+)"\s+class="tool-card"\s+data-name="([^"]*)"\s+data-desc="([^"]*)"/g;
    let m;
    while ((m = re.exec(toolsHtml)) !== null) toolCards.push({ href: m[1], name: m[2], desc: m[3] });
}

const swHtml = fs.readFileSync('softwares/index.html', 'utf8');
const swCards = [];
for (const b of swHtml.split('<div class="software-card"').slice(1)) {
    const name = (b.match(/data-name="([^"]*)"/) || [])[1];
    const desc = (b.match(/data-desc="([^"]*)"/) || [])[1];
    const dl = (b.match(/<a href="([^"]+)"[^>]*class="download-btn"/) || [])[1];
    const repo = (b.match(/class="repo-pill" href="([^"]+)"/) || [])[1];
    if (name) swCards.push({ name, desc, downloadUrl: dl, repo });
}

const gHtml = fs.readFileSync('Games/index.html', 'utf8');
const gCards = [];
for (const b of gHtml.split('class="game-card"').slice(1)) {
    const chunk = b.substring(0, 600);
    const href = (chunk.match(/data-href="([^"]*)"/) || (chunk.match(/href="([^"]*)"/) || []))[1];
    const name = (chunk.match(/data-name="([^"]*)"/) || [])[1];
    const cat = (chunk.match(/data-cat="([^"]*)"/) || [])[1];
    if (href && name) gCards.push({ href, name, cat: cat || 'game' });
}

// ---------- 3. lastmod 继承 ----------
const oldMap = new Map();
if (fs.existsSync('sitemap.xml')) {
    const old = fs.readFileSync('sitemap.xml', 'utf8');
    for (const m of old.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) oldMap.set(m[1], m[2]);
}
const hubUrls = ['/tools/', '/softwares/', '/Games/'];
const lastmodFor = (loc) => (oldMap.get(loc) && !hubUrls.includes(loc.slice(SITE.length))) ? oldMap.get(loc) : today;

// ---------- 4. sitemap.xml ----------
const urls = [...hubUrls, ...toolPages, ...gamePages];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `    <url><loc>${SITE}${u}</loc><lastmod>${lastmodFor(SITE + u)}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync('sitemap.xml', sitemap, 'utf8');

// ---------- 5. llms.txt ----------
const llms = [];
llms.push(`# JingW-ui — 免费在线工具、Windows 软件与网页小游戏`);
llms.push('');
llms.push(`> 纯静态个人公益站，无需注册、无后端、浏览器直接使用。含 ${toolCards.length} 个在线工具、${swCards.length} 款 Windows 免费软件（GitHub Releases 下载）、${gCards.length} 款网页小游戏。`);
llms.push('');
llms.push(`## 在线工具（共 ${toolCards.length} 个，浏览器直接运行）`);
llms.push(`- [工具箱总览](${SITE}/tools/): ${toolCards.length} 个在线工具汇总页，支持搜索与分类快筛，覆盖文本处理、编解码、图片处理、计算器、生成器、知识图谱等`);
for (const t of toolCards) {
    if (!toolPages.includes(t.href)) continue;
    llms.push(`- [${t.name}](${SITE}${t.href}): ${t.desc}`);
}
llms.push('');
llms.push(`## Windows 免费软件（共 ${swCards.length} 款，GitHub Releases 下载）`);
llms.push(`- [软件下载中心](${SITE}/softwares/): ${swCards.length} 款 Windows 软件的汇总与下载页`);
for (const s of swCards) {
    llms.push(`- [${s.name}](${SITE}/softwares/): ${s.desc}（下载: ${s.downloadUrl}）`);
}
llms.push('');
llms.push(`## 网页小游戏（共 ${gCards.length} 款，浏览器直接玩）`);
llms.push(`- [游戏中心](${SITE}/Games/): ${gCards.length} 款网页游戏汇总页`);
for (const g of gCards) {
    llms.push(`- [${g.name}](${SITE}${g.href}): ${g.cat} 类网页游戏`);
}
llms.push('');
fs.writeFileSync('llms.txt', llms.join('\n'), 'utf8');

// ---------- 6. llms-full.txt ----------
const full = [];
full.push(`# JingW-ui 站点全量内容（供 AI 检索引用）`);
full.push('');
full.push(`> 站点: ${SITE} · 生成日期: ${today} · 纯静态站点，所有工具/游戏浏览器直接运行，软件为 Windows exe（GitHub Releases 下载）。`);
full.push('');
full.push(`## 一、在线工具箱（${toolCards.length} 个）`);
full.push(`入口: ${SITE}/tools/`);
full.push('');
for (const t of toolCards) {
    if (!toolPages.includes(t.href)) continue;
    full.push(`### ${t.name}`);
    full.push(`用途: ${t.desc}`);
    full.push(`URL: ${SITE}${t.href}`);
    full.push('');
}
full.push(`## 二、Windows 免费软件（${swCards.length} 款）`);
full.push(`入口: ${SITE}/softwares/`);
full.push('');
for (const s of swCards) {
    full.push(`### ${s.name}`);
    full.push(`用途: ${s.desc}`);
    full.push(`下载: ${s.downloadUrl}`);
    if (s.repo) full.push(`开源仓库: ${s.repo}`);
    full.push('');
}
full.push(`## 三、网页小游戏（${gCards.length} 款）`);
full.push(`入口: ${SITE}/Games/`);
full.push('');
for (const g of gCards) {
    full.push(`### ${g.name}`);
    full.push(`类型: ${g.cat} · URL: ${SITE}${g.href}`);
    full.push('');
}
fs.writeFileSync('llms-full.txt', full.join('\n'), 'utf8');

// ---------- 7. 增删摘要 ----------
const newSet = new Set(urls.map(u => SITE + u));
const added = [...newSet].filter(u => !oldMap.has(u));
const removed = [...oldMap.keys()].filter(u => !newSet.has(u));
console.log(`✅ sitemap.xml: ${urls.length} URL（hub 3 + tools ${toolPages.length} + games ${gamePages.length}）`);
console.log(`   新增 ${added.length}${added.length ? '：' + added.join(', ') : ''}`);
console.log(`   移除 ${removed.length}${removed.length ? '：' + removed.join(', ') : ''}`);
console.log(`✅ llms.txt / llms-full.txt 已按 hub 卡片重生成（tools ${toolCards.length} · softwares ${swCards.length} · games ${gCards.length}）`);
