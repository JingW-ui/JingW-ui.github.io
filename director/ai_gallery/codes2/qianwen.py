import pyautogui
import time
import random


def auto_type_code(file_path="code.txt"):
    """
    读取Python代码文件并模拟人为逐字符输入到当前光标位置
    """
    # 1. 读取文件中缩进规范的Python代码
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"未找到文件：{file_path}")
        return

    # 2. 等待5秒，供用户定位光标
    print("请在5秒内将光标定位到目标位置...")
    time.sleep(5)
    print("开始自动输入代码...")

    # 遍历每一行代码进行输入
    for line in lines:
        # 去掉行末换行符，保留行首缩进
        line_content = line.rstrip('\n')

        # 计算当前行的缩进长度（行首空格数）
        indent_len = len(line_content) - len(line_content.lstrip(' '))
        # 获取去除缩进后的实际代码内容
        actual_code = line_content.lstrip(' ')

        # 如果当前行有缩进，模拟按下 Home 键回到行首，再通过右方向键模拟光标经过缩进的过程
        # 这样可以将缩进交给目标软件自动处理，符合“不能输入额外的缩进”的要求
        if indent_len > 0:
            pyautogui.press('home')
            # 模拟光标经过缩进的过程（交给软件自动处理缩进）
            for _ in range(indent_len):
                pyautogui.press('right')
                time.sleep(random.uniform(0.01, 0.03))  # 极短的停顿

        # 3. 逐字符模拟人为输入（非匀速，有几率输入错误）
        for char in actual_code:
            # 模拟人为输入错误（约2%的几率输错，然后退格重输）
            if random.random() < 0.02:
                # 随机输入一个错误的字母
                pyautogui.typewrite(random.choice('abcdefghijklmnopqrstuvwxyz'), interval=0)
                time.sleep(random.uniform(0.1, 0.3))  # 停顿一下发现错误
                pyautogui.press('backspace')  # 删除错误字符

            # 输入正确的字符
            pyautogui.typewrite(char, interval=0)

            # 模拟非匀速输入（在 0.05秒 到 0.2秒 之间随机停顿）
            time.sleep(random.uniform(0.05, 0.2))

        # 每一行输入结束后，多输入一个空格再换行
        pyautogui.typewrite(' ')
        pyautogui.press('enter')


# 函数调用（默认读取 code.txt，你可以传入其他路径如 "test.py"）
auto_type_code()