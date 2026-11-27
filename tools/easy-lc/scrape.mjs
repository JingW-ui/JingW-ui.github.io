#!/usr/bin/env node
/**
 * LeetCode Top Interview 150 前 30 道简单题 抓取脚本（构建时运行，页面本身零请求）
 *
 * 数据源：LeetCode 中文站 SSR 页面内嵌的 __NEXT_DATA__ JSON（匿名 GET 可读）：
 *   1. 学习计划页 -> 150 题有序清单（slug + 中文标题 + 难度）
 *   2. 每道题详情页 -> translatedContent（中文题面 HTML）、标签、中英文标题
 *
 * 用法：
 *   node scrape.mjs               # 抓取 -> 写 data.json
 *   node scrape.mjs --inject      # 抓取 -> 写 data.json -> 注入 index.html
 *   node scrape.mjs --inject-only # 用现有 data.json 注入 index.html（不联网）
 *
 * 注入位置：index.html 中 <!--LC_DATA:START--> / <!--LC_DATA:END--> 标记块。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data.json');
const HTML_PATH = path.join(__dirname, 'index.html');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const H = { 'User-Agent': UA, Referer: 'https://leetcode.cn/' };
const PLAN_URL = 'https://leetcode.cn/studyplan/top-interview-150/';
const PROBLEM_URL = s => `https://leetcode.cn/problems/${s}/`;
const EASY_TAKE = 30;
const DELAY_MS = 1000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

function walk(node, visit, depth = 0) {
  if (depth > 14 || node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const v of node) walk(v, visit, depth + 1); return; }
  visit(node);
  for (const v of Object.values(node)) walk(v, visit, depth + 1);
}

async function getHtml(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: H });
      if (r.ok) return await r.text();
      console.error(`  HTTP ${r.status} (try ${i + 1}) ${url}`);
    } catch (e) {
      console.error(`  FETCH ERR (try ${i + 1}) ${e.message}`);
    }
    await sleep(2000 * (i + 1));
  }
  throw new Error('unreachable: ' + url);
}

async function fetchPlan() {
  const d = nextData(await getHtml(PLAN_URL));
  const seen = new Map();
  walk(d, n => {
    if (typeof n.titleSlug === 'string' && typeof n.difficulty === 'string' && !seen.has(n.titleSlug)) {
      seen.set(n.titleSlug, {
        slug: n.titleSlug,
        diff: n.difficulty,
        id: n.questionFrontendId || n.frontendQuestionId || null,
        zh: n.translatedTitle || n.title || null,
      });
    }
  });
  return [...seen.values()];
}

/** 轻量清洗：去 script / on* 事件处理器，相对链接补全为 LeetCode 绝对地址 */
function sanitize(raw) {
  let s = raw || '';
  s = s.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, '');
  s = s.replace(/(href|src)=("|')\/(?!\/)/gi, (m, a, q) => `${a}=${q}https://leetcode.cn/`);
  return s.trim();
}

async function fetchProblem(slug, hint) {
  const d = nextData(await getHtml(PROBLEM_URL(slug)));
  let node = null;
  walk(d, n => {
    if (typeof n.translatedContent !== 'string' || n.translatedContent.length < 20) return;
    if (n.titleSlug === slug) { node = n; return; }
    if (!node) node = n;
  });
  if (!node) throw new Error('question node not found: ' + slug);
  return {
    id: String(node.questionFrontendId || (hint && hint.id) || ''),
    slug,
    zh: node.translatedTitle || (hint && hint.zh) || '',
    en: node.title || '',
    tags: (node.topicTags || []).map(t => t.translatedName || t.name).filter(Boolean),
    html: sanitize(node.translatedContent),
  };
}

function inject() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  if (!Array.isArray(data) || data.length !== EASY_TAKE) {
    console.error(`data.json 题目数 ${Array.isArray(data) ? data.length : 'N/A'} != ${EASY_TAKE}，中止注入`);
    process.exit(1);
  }
  // `<` 只会出现在 JSON 字符串内部，转义成 \u003c 防止提前闭合 </script>
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const date = new Date().toISOString().slice(0, 10);
  const block = `<!--LC_DATA:START-->\n<script type="application/json" id="lc-data" data-date="${date}">${json}</script>\n<!--LC_DATA:END-->`;
  let html = fs.readFileSync(HTML_PATH, 'utf8');
  const re = /<!--LC_DATA:START-->[\s\S]*?<!--LC_DATA:END-->/;
  if (!re.test(html)) { console.error('index.html 缺少 LC_DATA 注入标记'); process.exit(1); }
  html = html.replace(re, () => block);
  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log(`INJECTED ${data.length} problems (${Buffer.byteLength(json, 'utf8')} B) -> index.html, data-date=${date}`);
}

async function main() {
  if (process.argv.includes('--inject-only')) { inject(); return; }
  const plan = await fetchPlan();
  const easies = plan.filter(p => p.diff === 'EASY').slice(0, EASY_TAKE);
  console.log(`plan=${plan.length} easy=${plan.filter(p => p.diff === 'EASY').length} take=${easies.length}`);
  const out = [];
  for (const e of easies) {
    const q = await fetchProblem(e.slug, e);
    out.push(q);
    console.log(`${String(out.length).padStart(2)}/${EASY_TAKE}  ${q.id}.${q.zh}  ${Buffer.byteLength(q.html, 'utf8')}B  [${q.tags.join('/')}]`);
    if (out.length < easies.length) await sleep(DELAY_MS);
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(out, null, 1) + '\n', 'utf8');
  const total = out.reduce((a, q) => a + Buffer.byteLength(q.html, 'utf8'), 0);
  console.log(`DONE total_html=${total}B -> data.json`);
  if (process.argv.includes('--inject')) inject();
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
