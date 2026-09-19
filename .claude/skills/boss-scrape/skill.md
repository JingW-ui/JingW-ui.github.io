---
name: boss-scrape
description: 使用CloakBrowser抓取BOSS直聘职位数据。支持多关键词拓宽搜索、触底滚动翻页、全局去重、详情页渐进限流恢复。触发词：抓取boss、抓取岗位、boss直聘抓取、爬取boss。
---

# BOSS直聘职位抓取

使用 CloakBrowser 反检测浏览器抓取 BOSS直聘的职位数据，包括薪资、经验要求、学历、公司信息和职位描述。

## 前置条件检测（每次必先执行）

在做任何事之前，运行以下命令检查环境：

```bash
source .venv/bin/activate 2>/dev/null && python -c "from cloakbrowser import launch; print('ENV:OK')" 2>&1
```

- 输出包含 `ENV:OK` → 环境就绪，继续后续步骤
- 任何报错 → 告诉用户：「抓取环境未配置，请先说"配置boss抓取"来初始化环境。」**不要继续执行**

## 参数获取

从用户消息中提取以下参数，缺失的参数要主动询问：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| **关键词** | 搜索关键词，如 "AI Agent"、"Java开发"、"前端" | 必填，无默认值 |
| **城市** | 目标城市列表 | 必填，无默认值 |

### 关键词拓展策略

单个关键词在 BOSS直聘只能获取约 90 条结果。为获取更多数据，**主动帮用户拓展为多组近义关键词**：

| 用户输入 | 建议拓展为 |
|---------|-----------|
| 产品经理 | `["产品经理", "产品总监", "产品负责人", "高级产品经理", "B端产品经理", "C端产品经理"]` |
| Java | `["Java后端", "Java开发", "Java工程师", "Spring Boot"]` |
| 前端 | `["前端开发", "前端工程师", "React开发", "Vue开发"]` |
| AI | `["AI", "人工智能", "AI Agent", "大模型", "机器学习"]` |

脚本会自动按 `link` 全局去重，不同关键词抓到的同一岗位不会重复。

### 城市编码映射

```python
CITY_CODES = {
    "北京": 101010100, "上海": 101020100, "广州": 101280100,
    "深圳": 101280600, "东莞": 101281600, "杭州": 101210100,
    "成都": 101270100, "南京": 101190100, "武汉": 101200100,
    "西安": 101110100, "苏州": 101190400, "长沙": 101250100,
    "重庆": 101040100, "佛山": 101280800, "珠海": 101280700,
    "厦门": 101230200, "天津": 101030100, "郑州": 101180100,
    "合肥": 101220100, "青岛": 101120200,
}
```

用户说的城市不在列表中时，提示支持的城市或让用户提供城市编码。

## 执行流程

### Step 1: 生成抓取脚本

根据用户的关键词和城市参数，生成 `scraper.py` 脚本。脚本模板如下：

```python
"""BOSS直聘职位抓取 (CloakBrowser)"""

import json, csv, time, random, re
from pathlib import Path
from cloakbrowser import launch

# ===== 用户参数 =====
KEYWORDS = {{KEYWORDS_LIST}}  # 如 ["Java后端", "Java开发", "Java工程师"]
CITIES = {{CITIES_DICT}}      # 如 {"北京": 101010100}
PAGES_PER_SEARCH = 5          # 每个关键词最多滚动轮数（每轮约15条）
# ====================

OUTPUT_DIR = Path("data")
OUTPUT_DIR.mkdir(exist_ok=True)

JS_LIST = """
() => {
    const cards = document.querySelectorAll('li.job-card-box');
    return Array.from(cards).map(card => {
        const name = card.querySelector('.job-name');
        const tags = card.querySelectorAll('.tag-list li');
        const company = card.querySelector('.boss-name');
        const location = card.querySelector('.company-location');
        const tagTexts = Array.from(tags).map(t => t.textContent.trim());
        let experience = '', education = '';
        for (const t of tagTexts) {
            if (t.includes('年') || t === '应届生' || t === '在校生' || t.includes('经验'))
                experience = t;
            else if (['本科','硕士','博士','大专','学历不限','中专/中技','高中'].some(k => t.includes(k)))
                education = t;
        }
        return {
            name: name ? name.textContent.trim() : '',
            link: name ? name.getAttribute('href') : '',
            experience, education,
            company: company ? company.textContent.trim() : '',
            location: location ? location.textContent.trim() : '',
        };
    }).filter(j => j.name);
}
"""

JS_DETAIL = """
() => {
    const r = {};
    const sal = document.querySelector('.salary, .info-primary .salary');
    r.salary = sal ? sal.textContent.trim() : '';
    const desc = document.querySelector('.job-sec-text, .job-detail-section .text, .text.fold-text');
    r.description = desc ? desc.textContent.trim() : '';
    const ct = Array.from(document.querySelectorAll('.sider-company-info li, .company-info li'))
        .map(t => t.textContent.trim()).filter(Boolean);
    r.industry = ''; r.scale = ''; r.financing = '';
    for (const t of ct) {
        if (t.match(/\\d+.*人/) || t.includes('以上') || t.includes('少于')) r.scale = t;
        else if (t.includes('融资') || t.includes('上市') || t.includes('不需要融资')) r.financing = t;
        else if (t.length > 1 && t.length < 20) r.industry = r.industry || t;
    }
    return r;
}
"""

def delay(a=3, b=7):
    time.sleep(random.uniform(a, b))

def wait_jobs(page, sec=25):
    for _ in range(sec):
        time.sleep(1)
        try:
            if page.evaluate("document.querySelectorAll('li.job-card-box').length") > 0:
                return True
        except: pass
    return False

def login_wait(page):
    page.goto("https://www.zhipin.com/web/user/?ka=header-login",
              wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    print("[等待登录] 请在浏览器中登录BOSS直聘...")
    for i in range(36):
        time.sleep(5)
        try:
            cookies = page.context.cookies()
            has_token = any(c["name"] in ("token","wt2","bst") for c in cookies)
            url = page.url
            if has_token or ("user" not in url and "login" not in url):
                print(f"[登录成功]")
                return True
            print(f"  [{i+1}/36] 等待中...", end="\r")
        except: pass
    print("[超时] 未检测到登录")
    return False

def wait_new_cards(page, old_count, timeout=8):
    """等待页面卡片数量超过 old_count，最多等 timeout 秒"""
    for _ in range(timeout * 2):
        time.sleep(0.5)
        try:
            n = page.evaluate("document.querySelectorAll('li.job-card-box').length")
            if n > old_count:
                return n
        except:
            pass
    return old_count

def collect_list(page, keyword, city_name, city_code):
    """通过触底滚动加载抓取列表页，最多滚动 PAGES_PER_SEARCH 轮"""
    url = f"https://www.zhipin.com/web/geek/job?query={keyword}&city={city_code}"
    print(f"  [加载首页] {url}")
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
    except Exception as e:
        print(f"  [导航错误] {e}")
        return []
    if not wait_jobs(page):
        print(f"  [无结果]")
        return []

    # 先采集首屏已有的卡片
    time.sleep(2)
    jobs = []
    batch = page.evaluate(JS_LIST)
    for j in batch:
        j["keyword"] = keyword
        j["city"] = city_name
    jobs.extend(batch)
    print(f"  [首屏] {len(jobs)} 条")

    # 滚动加载更多
    no_new_count = 0
    for round_i in range(1, PAGES_PER_SEARCH + 1):
        old_count = page.evaluate("document.querySelectorAll('li.job-card-box').length")
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        new_count = wait_new_cards(page, old_count)

        batch = page.evaluate(JS_LIST)
        existing = {j["link"] for j in jobs}
        new = [j for j in batch if j["link"] not in existing]
        for j in new:
            j["keyword"] = keyword
            j["city"] = city_name
        jobs.extend(new)
        print(f"  [第{round_i}轮滚动] 卡片 {old_count}→{new_count}, +{len(new)} 条新 (累计 {len(jobs)})")

        if len(new) == 0:
            no_new_count += 1
            if no_new_count >= 2:
                print(f"  [连续{no_new_count}轮无新数据，停止]")
                break
        else:
            no_new_count = 0
        delay(2, 4)
    return jobs

def collect_details(page, jobs):
    total = len(jobs)
    consecutive_errors = 0
    for i, job in enumerate(jobs, 1):
        link = job.get("link", "")
        if not link: continue
        print(f"  [{i}/{total}] {job['name'][:25]}...", end=" ", flush=True)
        url = f"https://www.zhipin.com{link}" if link.startswith("/") else link
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
            time.sleep(random.uniform(1, 2))
            d = page.evaluate(JS_DETAIL)
            job["salary"] = d.get("salary", "")
            job["description"] = d.get("description", "")[:500]
            job["industry"] = d.get("industry", "")
            job["scale"] = d.get("scale", "")
            job["financing"] = d.get("financing", "")
            print(f"{job['salary']}")
            consecutive_errors = 0
            delay(1, 3)
        except Exception as e:
            err = str(e)[:60]
            print(f"错误: {err}")
            consecutive_errors += 1
            if consecutive_errors >= 3 or "DISCONNECTED" in err.upper():
                wait = min(30 + consecutive_errors * 10, 90)
                print(f"  [限流/连续错误] 等待{wait}秒...")
                time.sleep(wait)
                try:
                    page.goto("https://www.zhipin.com/", wait_until="domcontentloaded", timeout=20000)
                    time.sleep(3)
                except: pass
            else:
                delay(2, 4)

def save(jobs, prefix):
    with open(OUTPUT_DIR / f"{prefix}_jobs.json", "w", encoding="utf-8") as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    fields = ["keyword","city","name","salary","experience","education",
              "company","location","industry","scale","financing","description","link"]
    with open(OUTPUT_DIR / f"{prefix}_jobs.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(jobs)

def main():
    print("=" * 50)
    print("  BOSS直聘职位抓取")
    print(f"  关键词: {KEYWORDS}")
    print(f"  城市: {list(CITIES.keys())}")
    print("=" * 50)
    browser = launch(headless=False, humanize=True)
    page = browser.new_page()
    login_wait(page)
    try:
        page.goto("https://www.zhipin.com/", wait_until="domcontentloaded", timeout=60000)
    except Exception:
        time.sleep(5)
    time.sleep(3)
    all_jobs = []
    seen_links = set()
    for kw in KEYWORDS:
        for city, code in CITIES.items():
            print(f"\n--- {kw} | {city} ---")
            jobs = collect_list(page, kw, city, code)
            new_jobs = [j for j in jobs if j["link"] not in seen_links]
            for j in new_jobs:
                seen_links.add(j["link"])
            all_jobs.extend(new_jobs)
            print(f"  [去重后] +{len(new_jobs)} 条新岗位 (总计 {len(all_jobs)})")
            delay(8, 15)
    prefix = KEYWORDS[0].replace(" ","_").lower()
    save(all_jobs, prefix)
    print(f"\n[列表完成] {len(all_jobs)} 条（去重后），开始获取详情...")
    collect_details(page, all_jobs)
    browser.close()
    save(all_jobs, prefix)
    filled = sum(1 for j in all_jobs if j.get("salary"))
    print(f"\n{'='*50}")
    print(f"  完成! {len(all_jobs)} 个岗位 | 薪资获取 {filled}/{len(all_jobs)}")
    print(f"  CSV: data/{prefix}_jobs.csv")
    print(f"  JSON: data/{prefix}_jobs.json")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
```

**生成脚本时**，将 `{{KEYWORDS_LIST}}` 和 `{{CITIES_DICT}}` 替换为用户指定的值。例如：
- 用户说"抓取北京的Java后端岗位" → `KEYWORDS = ["Java后端", "Java开发", "Java工程师", "Spring Boot"]`，`CITIES = {"北京": 101010100}`

### Step 2: 运行脚本

```bash
source .venv/bin/activate && python scraper.py
```

提醒用户：
1. 浏览器会弹出 BOSS直聘登录页，需要手动扫码/手机号登录
2. 登录后脚本自动检测并开始抓取
3. 多关键词 + 触底滚动，每个关键词约采集 90 条，总量取决于关键词数和去重率

### Step 3: 报告结果

抓取完成后，读取输出文件并向用户报告：
- 各关键词的采集量和去重后数量
- 薪资获取成功率
- 文件保存位置
- 提示可以用 `boss-analyze` 进一步分析

## 技术要点

- **触底滚动翻页**：BOSS直聘使用无限滚动加载，脚本通过 `scrollTo(document.body.scrollHeight)` 触底并监测 DOM 卡片数量变化来判断是否加载完成
- **多关键词全局去重**：不同关键词搜索结果有重叠，脚本按岗位 `link` 全局去重
- **渐进式限流恢复**：详情页采集遇到连续错误时，等待时间从 30 秒逐步增加到 90 秒，而非固定等待
- **首屏先采集**：进入搜索页后先采集已渲染的卡片，再开始滚动，避免丢失首批数据
- 脚本使用 `headless=False`，需要有图形界面环境
- 薪资在列表页以 SVG 加密，必须通过详情页提取
