import pyautogui
import time
import random

DEFAULT_PATH = "code.txt"


def type_python_code_from_file(path=DEFAULT_PATH):
    """
    从 txt 文件中读取 Python 代码，
    等待 5 秒后逐字符模拟人工输入
    """

    # 1. 读取文件
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # 2. 给用户时间定位光标
    time.sleep(5)

    # 3. 逐字符输入（模拟人类行为）
    for ch in code:
        pyautogui.write(ch)

        # 非匀速输入
        base_delay = random.uniform(0.03, 0.12)

        # 标点 / 换行稍慢
        if ch in (":", "(", ")", "{", "}", "[", "]", "\n"):
            base_delay += random.uniform(0.05, 0.15)

        # 随机“手抖”输错并回删
        if random.random() < 0.01:
            wrong_char = random.choice("abcdefghijklmnopqrstuvwxyz")
            pyautogui.write(wrong_char)
            time.sleep(random.uniform(0.05, 0.1))
            pyautogui.press("backspace")

        time.sleep(base_delay)


if __name__ == "__main__":
    type_python_code_from_file()