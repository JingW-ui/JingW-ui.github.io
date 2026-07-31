# -*- coding: utf-8 -*-
"""
exercise-db 数据裁剪脚本
来源:https://github.com/hasaneyldrm/exercises-dataset (数据 MIT)
生成:assets/data/exercises.js —— 仅保留核心字段 + 中文/英文指令,缩小约 13 倍

用法:
  python build_data.py                    # 默认从 jsdelivr CDN 下载
  SOURCE=/path/exercises.json python build_data.py   # 或使用本地文件
"""
import json
import os
import urllib.request

SOURCE = os.environ.get('SOURCE', 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/data/exercises.json')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'data', 'exercises.js')


def load_source():
    if os.path.exists(SOURCE):
        with open(SOURCE, encoding='utf-8') as f:
            return json.load(f)
    with urllib.request.urlopen(SOURCE, timeout=180) as r:
        return json.load(r)


def main():
    data = load_source()
    out = []
    for r in data:
        steps = r.get('instruction_steps') or {}
        out.append({
            'id': r.get('id'),
            'name': r.get('name'),
            'body_part': r.get('body_part'),
            'equipment': r.get('equipment'),
            'target': r.get('target'),
            'muscle_group': r.get('muscle_group'),
            'secondary_muscles': r.get('secondary_muscles') or [],
            # 分步指令已含全文,不再保留冗余的 instructions 自由文本
            'steps': {'zh': steps.get('zh', []), 'en': steps.get('en', [])},
            'image': r.get('image'),
            'gif': r.get('gif_url'),
            'attr': r.get('attribution'),
        })
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    body = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('window.EXERCISES = ' + body + ';\n')
    print('生成 %s (%d 条, %.2f MB)' % (OUT, len(out), os.path.getsize(OUT) / 1024 / 1024))


if __name__ == '__main__':
    main()
