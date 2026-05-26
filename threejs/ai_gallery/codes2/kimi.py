import random
import time


def type_code_from_file(file_path="code.txt"):
    """
    读取Python代码文件，模拟人为逐字符输入到光标位置
    """
    import pyautogui

    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 等待5秒，供用户定位光标
    print("5秒后开始输入，请将光标定位到目标位置...")
    time.sleep(5)

    # 设置pyautogui
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0.01

    for line_idx, line in enumerate(lines):
        # 去除行尾换行符，但保留内容
        content = line.rstrip('\n').rstrip('\r')

        # 计算前导缩进
        stripped = content.lstrip(' ')
        leading_spaces = len(content) - len(stripped)

        # 处理缩进
        if line_idx == 0:
            # 第一行：需要输入所有前导空格
            for _ in range(leading_spaces):
                pyautogui.press('space')
                time.sleep(random.uniform(0.01, 0.05))
        else:
            # 非第一行：软件会自动继承上一行缩进
            prev_content = lines[line_idx - 1].rstrip('\n').rstrip('\r')
            prev_stripped = prev_content.lstrip(' ')
            prev_leading = len(prev_content) - len(prev_stripped)

            # 计算当前行与上一行的缩进差异
            if leading_spaces > prev_leading:
                # 当前行缩进更长：需要额外输入空格
                extra_spaces = leading_spaces - prev_leading
                pyautogui.press('home')
                time.sleep(random.uniform(0.05, 0.15))
                for _ in range(extra_spaces):
                    pyautogui.press('space')
                    time.sleep(random.uniform(0.01, 0.05))
            elif leading_spaces < prev_leading:
                # 当前行缩进更短：需要减少缩进
                reduce_spaces = prev_leading - leading_spaces
                pyautogui.press('home')
                time.sleep(random.uniform(0.05, 0.15))
                for _ in range(reduce_spaces):
                    pyautogui.press('backspace')
                    time.sleep(random.uniform(0.03, 0.08))
            else:
                # 缩进相同：偶尔按Home模拟真实行为
                if random.random() < 0.3:
                    pyautogui.press('home')
                    time.sleep(random.uniform(0.05, 0.1))

        # 输入实际内容（去除前导空格后的内容）
        for char in stripped:
            # 模拟非匀速输入
            time.sleep(random.uniform(0.03, 0.15))

            # 模拟输入错误（2%概率）
            if random.random() < 0.02 and char.isalnum():
                wrong_char = random.choice('abcdefghijklmnopqrstuvwxyz')
                pyautogui.typewrite(wrong_char, interval=random.uniform(0.01, 0.03))
                time.sleep(random.uniform(0.1, 0.3))
                pyautogui.press('backspace')
                time.sleep(random.uniform(0.05, 0.15))

            # 输入正确字符
            pyautogui.typewrite(char, interval=random.uniform(0.01, 0.03))

            # 偶尔停顿（模拟思考）
            if random.random() < 0.05:
                time.sleep(random.uniform(0.2, 0.6))

        # 行尾多输入一个空格，然后换行
        pyautogui.press('space')
        time.sleep(random.uniform(0.03, 0.08))
        pyautogui.press('return')
        time.sleep(random.uniform(0.1, 0.3))

    print("代码输入完成！")


# 主程序入口
if __name__ == "__main__":
    type_code_from_file("code.txt")