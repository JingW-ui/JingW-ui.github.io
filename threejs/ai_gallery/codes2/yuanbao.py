import pyautogui
import time
import random


def type_python_code_from_file(file_path="code.txt", start_delay=5):
    """
    从 txt 文件中读取 Python 代码，并以拟人的方式逐字符输入
    """

    # 读取文件
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # 等待用户定位光标
    time.sleep(start_delay)

    last_indent = 0  # 上一行缩进空格数

    for raw_line in lines:
        line = raw_line.rstrip("\n")

        # 计算当前行缩进
        indent = len(line) - len(line.lstrip(" "))

        # 如果缩进变少，回到行首再输入
        if indent < last_indent:
            pyautogui.press("home")
            for _ in range(indent):
                pyautogui.write(" ", interval=random.uniform(0.05, 0.15))

        # 逐字符输入代码内容（忽略已处理的缩进）
        code_part = line[indent:]
        for ch in code_part:
            # 小概率输错字符
            if random.random() < 0.01:
                wrong_char = random.choice("abcdefghijklmnopqrstuvwxyz")
                pyautogui.write(wrong_char, interval=random.uniform(0.05, 0.2))
                pyautogui.press("backspace")

            pyautogui.write(ch, interval=random.uniform(0.05, 0.2))

        # 行结束：多打一个空格再换行
        pyautogui.write(" ", interval=random.uniform(0.05, 0.15))
        pyautogui.press("enter")

        last_indent = indent


# ===== 直接运行 =====
if __name__ == "__main__":
    type_python_code_from_file("code.txt")