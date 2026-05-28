import pyautogui
import time
import random


def type_code_from_file(file_path="code.txt"):
    """
    读取Python代码文件，等待5秒后模拟人为逐字符输入到光标位置。

    参数:
        file_path: Python代码文本路径，默认为 "code.txt"
    """
    # 1. 读取文件内容
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code_text = f.read()
    except FileNotFoundError:
        print(f"错误：找不到文件 '{file_path}'")
        return
    except Exception as e:
        print(f"读取文件时出错：{e}")
        return

    # 2. 等待5秒，供用户定位光标
    print("5秒后开始输入，请将光标定位到目标位置...")
    time.sleep(5)

    # 3. 逐字符模拟人为输入
    lines = code_text.split('\n')

    for line_idx, line in enumerate(lines):
        # 分离缩进和实际代码
        stripped = line.lstrip()
        indent = line[:len(line) - len(stripped)]

        # 输入缩进（空格或制表符），避免IDE自动处理
        for char in indent:
            _type_char_human_like(char)

        # 输入实际代码内容
        for char in stripped:
            _type_char_human_like(char)

        # 行末换行（最后一行除外）
        if line_idx < len(lines) - 1:
            _type_char_human_like('\n')


def _type_char_human_like(char):
    """
    模拟人类输入单个字符：非匀速、极低概率输入错误并自动纠正。
    """
    # 随机打字间隔（30ms~250ms），模拟非匀速
    delay = random.uniform(0.03, 0.25)
    time.sleep(delay)

    # 0.3% 概率输入错误字符，然后立即纠正
    if random.random() < 0.003 and char.isalnum():
        wrong_chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        wrong_char = random.choice(wrong_chars)
        pyautogui.typewrite(wrong_char, interval=0.01)
        time.sleep(random.uniform(0.1, 0.3))
        pyautogui.keyDown('backspace')
        pyautogui.keyUp('backspace')
        time.sleep(random.uniform(0.05, 0.15))

    # 输入正确字符
    if char == '\n':
        pyautogui.keyDown('return')
        pyautogui.keyUp('return')
    elif char == '\t':
        pyautogui.keyDown('tab')
        pyautogui.keyUp('tab')
    else:
        pyautogui.typewrite(char, interval=0.01)


# 调用示例
if __name__ == "__main__":
    type_code_from_file("code.txt")