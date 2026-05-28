import pyautogui
import time
import random

# 耗时10s以内
def auto_type_code(file_path="code.txt"):
    """
    读取 Python 代码文件并模拟人为逐字符输入到当前光标位置。
    """
    # 1. 读取文件中缩进规范的 Python 代码
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"错误：找不到文件 {file_path}")
        return

    # 2. 等待5秒，供用户定位光标
    print("请在 5 秒内将光标定位到目标输入框...")
    time.sleep(5)
    print("开始模拟输入...")

    # 3. 使用 pyautogui 逐字符模拟人为输入
    for line in lines:
        # 去除行尾换行符，并去掉行首的缩进
        stripped_line = line.rstrip('\n').lstrip(' \t')

        if stripped_line:
            # 当前行有实际代码，逐字符输入
            for char in stripped_line:
                # 模拟非匀速输入（人类打字节奏）
                time.sleep(random.uniform(0.05, 0.2))

                # 模拟极低概率的输入错误（约 2% 几率输错）
                if random.random() < 0.02:
                    # 随机按下一个附近的错误字母键
                    pyautogui.typewrite(random.choice('abcdefghijklmnopqrstuvwxyz'))
                    time.sleep(0.1)  # 发现错误的短暂停顿
                    pyautogui.press('backspace')  # 模拟退格删除错误字符
                    time.sleep(0.1)  # 修正后的短暂停顿

                # 输入正确的字符
                pyautogui.typewrite(char)
        else:
            # 当前行是空行，不需要输入字符，但仍需处理换行
            pass

            # 无论是否有代码内容，每处理完文件中的一行，都需要按下回车换行
        pyautogui.press('enter')
        # 换行后的短暂停顿
        time.sleep(random.uniform(0.1, 0.4))

    print("代码输入完成！")


# 函数的调用
if __name__ == "__main__":
    auto_type_code("code.txt")