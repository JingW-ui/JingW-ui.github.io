import pyautogui
import time
import random


def type_python_code(file_path: str = "code.txt") -> None:
    """
    读取Python代码文件，等待5秒后，模拟人工非匀速逐字符输入代码

    参数:
        file_path: 代码文本文件路径，默认为 code.txt
    """
    # 1. 读取文件中的Python代码（保持原始缩进、换行、格式）
    with open(file_path, 'r', encoding='utf-8') as f:
        code_content = f.read()

    # 2. 等待5秒，供用户定位光标
    print("5秒后开始自动输入代码，请将光标定位到目标输入位置...")
    time.sleep(5)
    print("开始输入！")

    # 3. 模拟人工非匀速逐字符输入
    for char in code_content:
        # 模拟人工输入：随机停顿，更真实
        # 基础延迟 + 随机浮动，模拟人手输入速度不均
        delay = random.uniform(0.05, 0.15)

        # 遇到换行/缩进时，轻微增加延迟，更符合真实输入习惯
        if char in ('\n', '    ', '\t'):
            delay = random.uniform(0.1, 0.25)

        time.sleep(delay)

        # 逐字符输入（pyautogui会自动处理空格、缩进、换行）
        pyautogui.typewrite(char)

    print("代码输入完成！")


# 函数调用（直接运行即可）
if __name__ == "__main__":
    # 使用默认文件 code.txt
    type_python_code()

    # 如需指定自定义路径，使用下面这行
    # type_python_code("你的文件路径.txt")