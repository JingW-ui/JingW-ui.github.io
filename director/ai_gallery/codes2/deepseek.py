import pyautogui
import time
import random

def type_string_with_errors(s, delay_range=(0.03, 0.15), error_rate=0.05):
    """
    模拟人类输入字符串，带有随机延迟和一定概率的输入错误（自动纠正）
    """
    for ch in s:
        time.sleep(random.uniform(*delay_range))
        if random.random() < error_rate:
            # 随机输入一个错误字符
            err_char = random.choice(
                'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:,.<>/?'
            )
            pyautogui.write(err_char)
            time.sleep(random.uniform(0.05, 0.1))
            pyautogui.press('backspace')
            time.sleep(random.uniform(0.05, 0.1))
        pyautogui.write(ch)

def type_code_file(filepath='code.txt'):
    """
    读取代码文件，等待5秒后模拟人工输入
    """
    # 读取所有行，保留行内空白，去掉末尾换行符
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = [line.rstrip('\n') for line in f]

    print("等待5秒，请将光标定位到目标位置...")
    time.sleep(5)

    prev_indent_len = 0

    for i, line in enumerate(lines):
        # 提取前导空白和实际内容
        stripped = line.lstrip(' \t')
        leading = line[:len(line) - len(stripped)]   # 前导缩进字符串（空格/制表符）
        cur_indent_len = len(leading)
        content = stripped

        # 第一行：手动处理缩进（无自动缩进）
        if i == 0:
            if leading:
                pyautogui.press('home')
                type_string_with_errors(leading)
        else:
            # 如果当前行缩进小于上一行缩进 -> 需要手动减少缩进
            if cur_indent_len < prev_indent_len:
                pyautogui.press('home')
                # 删除多余的自动缩进字符
                del_count = prev_indent_len - cur_indent_len
                if del_count > 0:
                    pyautogui.press('del', presses=del_count, interval=random.uniform(0.03, 0.1))
                # 输入正确的缩进
                if leading:
                    type_string_with_errors(leading)
            # 当前行缩进 >= 上一行缩进：完全依赖IDE自动缩进，不输入任何前导空白

        # 输入代码主体内容
        if content:
            type_string_with_errors(content)

        # 每行结束后先输入一个空格，再换行
        pyautogui.write(' ')
        pyautogui.press('enter')

        # 更新上一行缩进长度
        prev_indent_len = cur_indent_len
        # 行间随机停顿，模拟人工换行后的短暂思考
        time.sleep(random.uniform(0.1, 0.5))

if __name__ == '__main__':
    # 可直接运行，默认读取 code.txt
    type_code_file('code.txt')