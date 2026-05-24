import time
import random
import pyautogui


def simulate_typing_code(file_path='code.txt'):
    """
    模拟人工输入Python代码到当前光标位置，具有真实的人类输入特征

    参数:
        file_path: Python代码文件路径，默认为'code.txt'
    """
    # 读取代码文件
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"错误：文件 '{file_path}' 未找到。")
        return
    except Exception as e:
        print(f"读取文件时出错: {e}")
        return

    # 等待用户定位光标（倒计时显示）
    print("请立即将光标定位到需要输入的位置！")
    print("将在5秒后开始输入...")
    for i in range(5, 0, -1):
        print(f"{i}...")
        time.sleep(1)

    # 处理每行代码
    for i, line in enumerate(lines):
        # 移除换行符
        line = line.rstrip('\n')

        # 如果不是第一行，按回车
        if i > 0:
            pyautogui.press('enter')
            time.sleep(random.uniform(0.05, 0.15))

        # 跳过空行
        if not line:
            continue

        # 分块输入（模拟真实打字节奏）
        chunk_size = random.randint(8, 20)
        for j in range(0, len(line), chunk_size):
            chunk = line[j:j + chunk_size]

            # 输入前随机延迟（模拟思考停顿）
            delay = random.uniform(0.01, 0.06)
            if random.random() < 0.1 and j > 0:
                delay += random.uniform(0.1, 0.3)
            time.sleep(delay)

            # 输入块（字符间有微小间隔）
            pyautogui.typewrite(chunk, interval=random.uniform(0.01, 0.07))

            # 小概率输入错误并修正（约1%概率）
            if random.random() < 0.01:
                wrong_char = chr(random.randint(97, 122))
                pyautogui.press(wrong_char)
                time.sleep(0.15)
                pyautogui.press('backspace')
                time.sleep(0.05)

        # 对于长行，完成后短暂停顿
        if len(line) > 30:
            time.sleep(random.uniform(0.15, 0.3))

        # 对于def/class等定义行，停顿更久
        if line.strip().startswith(('def ', 'class ')):
            time.sleep(random.uniform(0.3, 0.8))

    # 模拟用户检查（小概率）
    if random.random() < 0.2:
        time.sleep(1)
        for _ in range(random.randint(2, 4)):
            pyautogui.press('up')
            time.sleep(0.2)

    print("代码输入完成！")


# 调用代码（可直接运行）
if __name__ == "__main__":
    simulate_typing_code('code.txt')