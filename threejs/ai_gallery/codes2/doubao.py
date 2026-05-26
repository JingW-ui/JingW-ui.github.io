import pyautogui
import time
import random
from pathlib import Path


def auto_type_python_code(file_path: str = "code.txt"):
    """
    读取Python代码文件，等待5秒后逐字符模拟人工输入代码
    :param file_path: Python代码文本文件路径，默认code.txt
    """
    # 读取代码文件
    code_path = Path(file_path)
    with open(code_path, 'r', encoding='utf-8') as f:
        code_lines = f.readlines()

    # 等待5秒，让用户定位光标
    print("准备开始输入，5秒内请将光标定位到目标位置...")
    time.sleep(5)
    print("开始模拟输入！")

    # 人工输入配置：非匀速、随机错误、随机修正
    pyautogui.PAUSE = 0
    base_delay = (0.05, 0.15)  # 基础输入间隔
    error_chance = 0.02  # 输入错误概率
    error_chars = 'abcdefghijklmnopqrstuvwxyz0123456789'  # 错误字符池

    for line in code_lines:
        # 去除行尾换行符，保留原始缩进
        stripped_line = line.rstrip('\n')
        if not stripped_line:
            # 空行直接换行
            pyautogui.press('enter')
            time.sleep(random.uniform(*base_delay))
            continue

        # 计算本行缩进空格数
        indent_count = len(stripped_line) - len(stripped_line.lstrip(' '))
        actual_code = stripped_line.lstrip(' ')

        # 处理缩进：仅处理比上一行短的缩进（HOME+输入缩进），长缩进交给软件自动处理
        if indent_count > 0:
            # 模拟人工：先按HOME回到行首，再输入对应缩进空格
            pyautogui.press('home')
            time.sleep(random.uniform(0.1, 0.3))
            pyautogui.typewrite(' ' * indent_count, interval=random.uniform(*base_delay))

        # 逐字符输入实际代码，模拟人工非匀速+随机错误
        for char in actual_code:
            # 随机触发输入错误
            if random.random() < error_chance:
                wrong_char = random.choice(error_chars)
                pyautogui.typewrite(wrong_char, interval=random.uniform(*base_delay))
                time.sleep(random.uniform(0.05, 0.2))
                pyautogui.press('backspace')  # 修正错误
                time.sleep(random.uniform(0.05, 0.1))

            # 输入正确字符
            pyautogui.typewrite(char, interval=random.uniform(*base_delay))

        # 要求：每行结束多输入一个空格，再换行
        pyautogui.typewrite(' ', interval=random.uniform(*base_delay))
        pyautogui.press('enter')

        # 行末随机停顿，更贴近人工输入
        time.sleep(random.uniform(0.1, 0.4))

    print("代码输入完成！")


# 函数调用，直接运行即可
if __name__ == "__main__":
    auto_type_python_code()