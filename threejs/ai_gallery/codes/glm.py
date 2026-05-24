import pyautogui
import time
import random


def auto_type_code(file_path='code.txt'):
    """
    读取Python代码文件并逐字符模拟人为输入到光标位置。
    自动处理编辑器缩进：预测编辑器按Enter后的自动缩进，
    仅补充/退格差量空格，避免频繁使用Home键。

    参数:
        file_path: Python代码文本文件路径，默认'code.txt'
    """
    # 1. 读取代码文件
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 统一缩进：制表符转4空格
    code = code.replace('\t', '    ')
    lines = code.splitlines()
    while lines and lines[-1].strip() == '':
        lines.pop()

    if not lines:
        print("代码文件为空！")
        return

    # 自动检测缩进单位
    indent_size = _detect_indent_size(lines)

    # 2. 倒计时5秒供用户定位光标
    print("5秒后开始自动输入，请将光标定位到目标位置...")
    for t in range(5, 0, -1):
        print(f"  {t}...")
        time.sleep(1)
    print("开始输入！")

    # 3. 逐行逐字符输入
    editor_indent = 0  # 编辑器在当前行首自动插入的缩进空格数

    for i, line in enumerate(lines):
        stripped = line.lstrip(' ')
        target_indent = len(line) - len(stripped)

        # 空行/纯空格行 → 缩进归零（Python空行缩进无语法意义）
        if stripped == '':
            target_indent = 0

        if i == 0:
            # 首行：直接输入缩进 + 内容
            _type_spaces(target_indent)
            if stripped:
                _type_human_string(stripped)
        else:
            # 回车换行
            _rand_delay(0.05, 0.20)
            pyautogui.press('enter')
            _rand_delay(0.15, 0.40)  # 等待编辑器完成自动缩进

            # 缩进调整：补充空格 或 退格删除多余缩进
            if target_indent > editor_indent:
                _type_spaces(target_indent - editor_indent)
            elif target_indent < editor_indent:
                for _ in range(editor_indent - target_indent):
                    _rand_delay(0.01, 0.04)
                    pyautogui.press('backspace')

            # 输入行内容
            if stripped:
                _type_human_string(stripped)

        # 预测下一行编辑器自动缩进
        editor_indent = _predict_next_indent(line, target_indent, indent_size)

    print("\n输入完成！")


def _detect_indent_size(lines):
    """从代码中自动检测缩进单位（最小非零缩进）"""
    indents = set()
    for line in lines:
        stripped = line.lstrip(' ')
        indent = len(line) - len(stripped)
        if indent > 0 and stripped:
            indents.add(indent)
    return min(indents) if indents else 4


def _predict_next_indent(line, current_indent, indent_size):
    """
    预测编辑器按Enter后自动插入的缩进空格数
    适配 VS Code(Python扩展) / PyCharm 等主流编辑器的自动缩进行为
    """
    content = line.rstrip()
    stripped = content.strip()

    if content.endswith(':'):
        # 冒号结尾 → 编辑器增加一级缩进
        return current_indent + indent_size

    # 智能编辑器在这些语句后自动减少一级缩进
    dedent_words = ('pass', 'break', 'continue', 'return', 'raise')
    if (stripped in dedent_words
            or stripped.startswith('return ') or stripped.startswith('return(')
            or stripped.startswith('raise ') or stripped.startswith('raise(')):
        return max(0, current_indent - indent_size)

    # 普通行 → 编辑器保持当前缩进
    return current_indent


def _type_spaces(count):
    """逐空格输入，模拟手动缩进"""
    for _ in range(count):
        _rand_delay(0.01, 0.06)
        pyautogui.press('space')


def _type_human_string(text):
    """模拟人类逐字符输入：非匀速、偶尔打错再纠正"""
    for char in text:
        # ~2%概率打错（仅字母，符号打错难以自然纠正）
        if random.random() < 0.02 and char.isalpha():
            _simulate_typo(char)
        else:
            _type_char(char)


def _type_char(char):
    """模拟人类输入单个字符，三角分布实现非匀速延迟"""
    if char == ' ':
        delay = _human_speed(0.02, 0.10)
    elif char in '.,;:!?':
        delay = _human_speed(0.07, 0.18)
    elif char in '([{\'"':
        delay = _human_speed(0.05, 0.15)
    elif char in ')]}':
        delay = _human_speed(0.04, 0.12)
    else:
        delay = _human_speed(0.03, 0.13)

    time.sleep(delay)

    try:
        pyautogui.write(char)
    except Exception:
        try:
            pyautogui.press(char)
        except Exception:
            pass


def _simulate_typo(correct_char):
    """模拟打错字 → 反应停顿 → 退格删除 → 重新输入正确字符"""
    wrong_char = _nearby_key(correct_char)
    if wrong_char:
        try:
            pyautogui.write(wrong_char)
        except Exception:
            pass
        # 人类意识到打错的反应时间
        _rand_delay(0.10, 0.40)
        pyautogui.press('backspace')
        _rand_delay(0.05, 0.20)
    # 输入正确字符
    _type_char(correct_char)


def _nearby_key(char):
    """获取QWERTY键盘上相邻按键，用于模拟打字失误"""
    neighbors = {
        'q': 'w', 'w': 'e', 'e': 'r', 'r': 't', 't': 'y',
        'y': 'u', 'u': 'i', 'i': 'o', 'o': 'p',
        'a': 's', 's': 'd', 'd': 'f', 'f': 'g', 'g': 'h',
        'h': 'j', 'j': 'k', 'k': 'l',
        'z': 'x', 'x': 'c', 'c': 'v', 'v': 'b', 'b': 'n', 'n': 'm',
    }
    c = char.lower()
    if c in neighbors:
        n = neighbors[c]
        return n if char.islower() else n.upper()
    return None


def _human_speed(min_s, max_s):
    """三角分布生成非匀速人体工学延迟（中间值概率最高）"""
    return random.triangular(min_s, max_s, (min_s + max_s) / 2)


def _rand_delay(min_s, max_s):
    """均匀随机延迟"""
    time.sleep(random.uniform(min_s, max_s))


if __name__ == '__main__':
    auto_type_code('code.txt')