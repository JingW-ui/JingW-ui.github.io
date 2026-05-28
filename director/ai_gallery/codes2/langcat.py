import pyautogui
import time
import random


def simulate_typing_python_code(file_path="code.txt"):
    # 设置 pyautogui 的安全延迟（最小化意外操作）
    pyautogui.PAUSE = 0.01  # 字符间基础延迟（会被随机扰动）
    pyautogui.FAILSAFE = True  # 启用安全机制

    # 读取文件内容
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # 预处理：去除末尾空行（但保留中间空行）
    while lines and lines[-1].strip() == "":
        lines.pop()

    # 等待定位光标
    print("5秒后开始输入，请将光标定位到代码编辑区域...")
    time.sleep(5)

    def simulate_human_type(text):
        """模拟人类输入文本，带随机错误和纠错"""
        for char in text:
            # 5% 概率输入错误字符
            if random.random() < 0.05:
                # 输入一个错误字符（随机小写字母）
                wrong_char = random.choice("abcdefghijklmnopqrstuvwxyz")
                pyautogui.write(wrong_char)
                # 立即纠错：按退格键删除
                pyautogui.press('backspace')
            # 输入正确字符
            pyautogui.write(char)
            # 非匀速延迟：50ms~150ms
            time.sleep(random.uniform(0.05, 0.15))

    # 记录当前缩进级别（空格数）
    current_indent = 0

    for i, line in enumerate(lines):
        stripped = line.strip()
        original_indent = len(line) - len(line.lstrip())  # 原始空格/Tab数

        if stripped == "":
            # 空行直接换行
            pyautogui.press('return')
            time.sleep(0.5)
            current_indent = 0  # 空行不影响缩进记录
            continue

        # 判断是否需要手动处理缩进
        need_manual_indent = False
        if original_indent < current_indent:
            # 缩进变短：需要手动处理
            need_manual_indent = True
        elif original_indent == current_indent:
            # 相同缩进：不需要额外处理（软件自动保持）
            pass
        else:
            # 缩进变长：不手动加空格/Tab（交给软件自动缩进）
            pass

        if need_manual_indent:
            # 回到行首
            pyautogui.press('home')
            time.sleep(0.1)
            # 清除当前行内容（防止残留）
            pyautogui.hotkey('shift', 'end')  # 选到行尾
            pyautogui.press('backspace')  # 删除选中内容
            time.sleep(0.1)
            # 输入正确缩进
            indent_str = line[:original_indent]
            simulate_human_type(indent_str)
        else:
            # 直接输入缩进（交给软件自动处理后续）
            # 但不输入额外空格，只输入缩进本身
            indent_str = line[:original_indent] if original_indent > 0 else ""
            if indent_str:
                simulate_human_type(indent_str)

        # 输入代码内容（去除缩进后的内容）
        simulate_human_type(stripped)

        # 每行结尾额外加一个空格
        pyautogui.press('space')
        time.sleep(0.2)

        # 换行
        pyautogui.press('return')
        time.sleep(0.5)  # 换行后稍作停顿

        # 更新当前缩进（用于下一行判断）
        current_indent = original_indent

    print("输入完成！")

if __name__ == '__main__':
    simulate_typing_python_code('code.txt')
