# -*- coding: utf-8 -*-
"""
将 assets/brands/*.svg 合成成统一的「圆形 logo」SVG。
规格：256x256，白色底圆 + 浅灰描边，原始 logo 作为内层 <g> 居中缩进留白。
输出到 assets/brands/<name>_circle.svg，供 ECharts image:// 使用。
纯字符串合成，无需 cairo/inkscape 等本地渲染依赖。
"""
import os
import re

BRANDS = ["samsung", "apple", "xiaomi", "oppo", "vivo", "huawei", "honor"]

SIZE = 256
STROKE = 6
PAD_RATIO = 0.16  # logo 在圆内的留白比例（占半径）

HERE = os.path.dirname(os.path.abspath(__file__))


def extract_inner(svg_text: str):
    """从源 svg 中取出 fill 颜色与 <path>/<g> 等内部元素。"""
    # 取根 svg 的 fill
    fill = "#000000"
    m = re.search(r'<svg[^>]*\sfill="([^"]+)"', svg_text)
    if m:
        fill = m.group(1)

    # 取 <svg ...> 与 </svg> 之间的内容（去掉 title）
    inner = re.sub(r"</?svg[^>]*>", "", svg_text, flags=re.IGNORECASE)
    inner = re.sub(r"<title>.*?</title>", "", inner, flags=re.IGNORECASE | re.DOTALL)
    return fill, inner.strip()


def make_circle_svg(src_svg: str, out_svg: str) -> None:
    with open(src_svg, "r", encoding="utf-8") as f:
        text = f.read()
    fill, inner = extract_inner(text)

    # logo 在圆内的直径（留白后）
    logo_d = SIZE * (1 - 2 * PAD_RATIO)
    # 把原始 24x24 的 logo 缩放到 logo_d，并居中
    scale = logo_d / 24.0
    offset = (SIZE - logo_d) / 2

    # 白底圆 + 浅灰描边
    r = SIZE / 2
    circle = (
        f'<circle cx="{r}" cy="{r}" r="{r - STROKE/2}" '
        f'fill="#ffffff" stroke="#d2d8e0" stroke-width="{STROKE}"/>'
    )
    # 内层 logo：缩放并平移到圆心
    group = (
        f'<g fill="{fill}" transform="'
        f'translate({offset},{offset}) scale({scale})">'
        f'{inner}'
        f'</g>'
    )

    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {SIZE} {SIZE}" width="{SIZE}" height="{SIZE}">'
        f'{circle}{group}'
        f'</svg>'
    )
    with open(out_svg, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"  -> {os.path.basename(out_svg)}  (fill={fill})")


def main() -> None:
    print("生成统一圆形品牌 logo (SVG):")
    for name in BRANDS:
        src = os.path.join(HERE, f"{name}.svg")
        out = os.path.join(HERE, f"{name}_circle.svg")
        if not os.path.exists(src):
            print(f"  缺失源文件: {src}")
            continue
        make_circle_svg(src, out)
    print("完成。")


if __name__ == "__main__":
    main()
