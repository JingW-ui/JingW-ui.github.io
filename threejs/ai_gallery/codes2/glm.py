import pyautogui
import time
import random

pyautogui.PAUSE = 0  # 关闭pyautogui默认间隔，使用自定义延迟

KEYBOARD_ROWS = [
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
    '1234567890',
]


def get_nearby_keys(char):
    """获取键盘上与给定字符左右相邻的键（用于模拟真实打错）"""
    c = char.lower()
    for row in KEYBOARD_ROWS:
        if c in row:
            idx = row.index(c)
            nearby = []
            if idx > 0:
                nearby.append(row[idx - 1])
            if idx < len(row) - 1:
                nearby.append(row[idx + 1])
            return nearby
    return []


def type_char(char, typo_chance=0.012):
    """模拟人类逐字符输入，含随机延迟与偶发打字错误"""
    # --- 偶发打错字符（仅限ASCII字母） ---
    if (typo_chance > 0
            and random.random() < typo_chance
            and char.isalpha()
            and ord(char) < 128):
        nearby = get_nearby_keys(char)
        if nearby:
            wrong = random.choice(nearby)
            pyautogui.write(wrong)
            time.sleep(random.uniform(0.10, 0.35))
            pyautogui.press('backspace')
            time.sleep(random.uniform(0.06, 0.20))

    # --- 输入正确字符 ---
    if char == '\t':
        pyautogui.press('tab')
    else:
        try:
            pyautogui.write(char)
        except Exception:
            # 非ASCII字符走剪贴板
            try:
                import pyperclip
                pyperclip.copy(char)
                pyautogui.hotkey('ctrl', 'v')
                time.sleep(0.03)
            except Exception:
                pass

    # --- 非匀速延迟 ---
    if random.random() < 0.04:
        time.sleep(random.uniform(0.25, 0.55))   # 偶尔"思考"停顿
    else:
        time.sleep(random.uniform(0.02, 0.12))


def auto_type_code(file_path='code.txt'):
    """
    读取Python代码文件，等待5秒后模拟人类逐字符输入到光标位置。

    参数:
        file_path: Python代码文本文件路径（txt格式），默认 'code.txt'
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    lines = code.split('\n')

    # 去除首尾空行
    while lines and lines[0].strip() == '':
        lines.pop(0)
    while lines and lines[-1].strip() == '':
        lines.pop()

    print("5秒后开始自动输入，请将光标定位到目标编辑器位置...")
    time.sleep(5)

    INDENT_SIZE = 4
    cursor_indent = 0  # IDE自动缩进后光标所处的缩进级别

    for line in lines:
        content = line.lstrip()
        actual_indent = len(line) - len(content)
        is_empty = (content == '')

        # ========== 空行处理 ==========
        if is_empty:
            pyautogui.press('space')
            time.sleep(random.uniform(0.05, 0.12))
            pyautogui.press('enter')
            time.sleep(random.uniform(0.10, 0.25))
            # 空行后IDE通常维持缩进级别，cursor_indent保持不变
            continue

        # ========== 缩进处理 ==========
        if actual_indent < cursor_indent:
            # 缩进变短 → Home回行首 → 选中删除自动缩进 → 重新键入实际缩进
            pyautogui.press('home')
            time.sleep(random.uniform(0.04, 0.10))
            pyautogui.press('home')  # 兼容智能Home，确保到达第0列
            time.sleep(random.uniform(0.03, 0.07))
            # Shift+End 选中本行全部内容（此时仅有自动缩进空白）
            pyautogui.keyDown('shift')
            time.sleep(0.02)
            pyautogui.press('end')
            time.sleep(0.02)
            pyautogui.keyUp('shift')
            time.sleep(random.uniform(0.02, 0.05))
            pyautogui.press('delete')
            time.sleep(random.uniform(0.03, 0.07))
            # 键入实际缩进
            for _ in range(actual_indent):
                pyautogui.press('space')
                time.sleep(random.uniform(0.015, 0.04))
        elif actual_indent > cursor_indent:
            # 缩进变长 → 在IDE自动缩进基础上补充额外空格
            for _ in range(actual_indent - cursor_indent):
                pyautogui.press('space')
                time.sleep(random.uniform(0.02, 0.05))
        # 缩进相同 → IDE已自动处理，无需额外操作

        # ========== 逐字符输入行内容 ==========
        for ch in content:
            type_char(ch)

        # ========== 行尾：多输一个空格再换行 ==========
        pyautogui.press('space')
        time.sleep(random.uniform(0.05, 0.12))
        pyautogui.press('enter')
        time.sleep(random.uniform(0.10, 0.25))

        # ========== 更新下一行预期自动缩进 ==========
        stripped = content.rstrip()
        if stripped.endswith(':') and not content.startswith('#'):
            cursor_indent = actual_indent + INDENT_SIZE
        else:
            cursor_indent = actual_indent


if __name__ == '__main__':
    auto_type_code()