import pyautogui
import time
import random
import sys

def simulate_code_input(file_path='code.txt'):
    """
    读取Python代码文件，等待5秒后，逐字符模拟人工输入到当前光标位置。
    模拟非匀速输入，具有随机延迟和一定概率的输入错误及自动更正。
    正确处理换行符、空格和制表符，避免使用Home键。
    """
    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 等待5秒，给用户时间定位光标
    print("等待5秒，请将光标定位到目标位置...")
    time.sleep(5)

    # 定义可打印字符集（用于模拟输入错误时的随机错误字符）
    printable = [chr(i) for i in range(32, 127) if chr(i) not in '\n\r\t']

    # 遍历每个字符
    for ch in code:
        # 随机延迟 0.05 ~ 0.35 秒，模拟非匀速打字
        delay = random.uniform(0.05, 0.35)
        time.sleep(delay)

        # 处理换行符
        if ch == '\n':
            pyautogui.press('enter')
            continue

        # 处理制表符
        if ch == '\t':
            pyautogui.press('tab')
            continue

        # 处理空格
        if ch == ' ':
            pyautogui.press('space')
            continue

        # 普通字符：以 8% 的概率模拟输入错误
        if random.random() < 0.08:
            # 随机选择一个错误字符（与正确字符不同）
            wrong_char = random.choice([c for c in printable if c != ch])
            # 输入错误字符
            pyautogui.press(wrong_char)
            # 模拟看到错误后的短暂停顿 (0.1~0.3秒)
            time.sleep(random.uniform(0.1, 0.3))
            # 按退格键删除错误字符
            pyautogui.press('backspace')
            # 再停顿一下再输入正确字符
            time.sleep(random.uniform(0.05, 0.15))
            # 输入正确字符
            pyautogui.press(ch)
        else:
            # 直接输入正确字符
            pyautogui.press(ch)

if __name__ == '__main__':
    # 如果命令行提供了参数，则作为文件路径；否则使用默认值
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = 'code.txt'
    simulate_code_input(file_path)