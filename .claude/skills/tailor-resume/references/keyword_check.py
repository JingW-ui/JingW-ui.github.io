#!/usr/bin/env python3
"""keyword_check.py — tailor-resume 技能的关键词覆盖自检工具。

对生成的简历 HTML 做 JD 关键词整词匹配，输出命中/缺失清单与覆盖率。
灵感来自 Resume-Matcher 的 ATS keyword_match 检查（整词正则 + CJK 感知边界）。

用法:
    python keyword_check.py <resume.html> <keywords.txt> [--json]

keywords.txt 格式: 每行一个关键词，同义词用 | 分隔（如 LLM|大模型），
以 # 开头的行视为注释。纯 stdlib，无第三方依赖。
"""

import argparse
import json
import re
import sys

# 让 Windows 控制台也能正常打印中文
sys.stdout.reconfigure(encoding="utf-8")


def strip_html(html: str) -> str:
    """去掉 <script>/<style> 块与所有标签、HTML 实体，返回纯文本。"""
    text = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&nbsp;", " ").replace("&middot;", "·")
    return text


def is_cjk(keyword: str) -> bool:
    """关键词含 CJK 字符时用子串匹配，否则用整词边界。"""
    return any("一" <= ch <= "鿿" or "　" <= ch <= "ヿ" for ch in keyword)


def build_pattern(keyword: str) -> re.Pattern:
    """ASCII 词用 (?<!\\w)…(?!\\w) 整词边界，避免 python 误命中 pythonic、java 误命中 javascript。"""
    if is_cjk(keyword):
        return re.compile(re.escape(keyword))
    return re.compile(r"(?<!\w)" + re.escape(keyword) + r"(?!\w)", re.I)


def parse_keywords(path: str):
    """读关键词文件，返回 [(组名, [同义词...]), ...]。"""
    groups = []
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            variants = [v.strip() for v in line.split("|") if v.strip()]
            if variants:
                groups.append((variants[0], variants))
    return groups


def main():
    parser = argparse.ArgumentParser(description="JD 关键词覆盖自检")
    parser.add_argument("resume_html", help="生成的简历 HTML 文件")
    parser.add_argument("keywords_txt", help="关键词文件（每行一个，同义词用 | 分隔）")
    parser.add_argument("--json", action="store_true", help="以 JSON 输出")
    args = parser.parse_args()

    with open(args.resume_html, encoding="utf-8") as f:
        text = strip_html(f.read())

    groups = parse_keywords(args.keywords_txt)
    if not groups:
        print("错误：关键词文件为空", file=sys.stderr)
        sys.exit(2)

    matched, missing = [], []
    for name, variants in groups:
        hit = next((v for v in variants if build_pattern(v).search(text)), None)
        (matched if hit else missing).append(name if hit else name)

    total = len(groups)
    coverage = round(len(matched) / total * 100, 1)
    priority = missing[:5]  # 与 Resume-Matcher 一致：最多提示 5 个优先缺失词

    if args.json:
        print(json.dumps({
            "coverage": coverage,
            "total": total,
            "matched": matched,
            "missing": missing,
            "priority_missing": priority,
        }, ensure_ascii=False, indent=2))
        return

    print(f"关键词覆盖率: {coverage}%  ({len(matched)}/{total})")
    print(f"\n✓ 命中 ({len(matched)}): {'、'.join(matched) if matched else '无'}")
    print(f"✗ 缺失 ({len(missing)}): {'、'.join(missing) if missing else '无'}")
    if priority:
        print(f"\n优先补充建议 (最多 5 个): {('、'.join(priority))}")
        print("→ 对照三档判定：'可注入'档请回改简历后重跑；'不可注入'档属正常缺失。")


if __name__ == "__main__":
    main()
