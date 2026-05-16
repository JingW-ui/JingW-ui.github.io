import os
import time
import random
import pyautogui

class AutoTypeWorker:
    """自动写入工作类 - 将整理好的代码自动输入到目标窗口"""

    def __init__(self, code_file_path, delay=0.05, think_time_min=1.0, think_time_max=2.0, error_rate=0.08, line_break_rate=0.7):
        self.code_file_path = code_file_path
        self.delay = delay
        self.think_time_min = think_time_min  # 思考时间最小值
        self.think_time_max = think_time_max  # 思考时间最大值
        self.error_rate = error_rate  # 错误率（默认8%）
        self.line_break_rate = line_break_rate  # 长行随机换行率（默认70%概率触发）
        self._stop_flag = False
        self._paused = False
        self.filtered_code = None  # 存储过滤后的代码，用于输入完成后复制到剪切板

    def _get_nearby_keys(self, char):
        """
        获取键盘上字符周围的按键（用于模拟打错字）
        :param char: 要输入的字符
        :return: 附近按键列表
        """
        # 键盘布局映射（可以根据需要扩展）
        keyboard_layout = {
            'q': ['w', 'a', 's'], 'w': ['q', 'e', 's', 'd'], 'e': ['w', 'r', 'd', 'f'],
            'r': ['e', 't', 'f', 'g'], 't': ['r', 'y', 'g', 'h'], 'y': ['t', 'u', 'h', 'j'],
            'u': ['y', 'i', 'j', 'k'], 'i': ['u', 'o', 'k', 'l'], 'o': ['i', 'p', 'l'],
            'p': ['o'], 'a': ['q', 'w', 's', 'z'], 's': ['w', 'e', 'a', 'd', 'x', 'z'],
            'd': ['e', 'r', 's', 'f', 'c', 'x'], 'f': ['r', 't', 'd', 'g', 'v', 'c'],
            'g': ['t', 'y', 'f', 'h', 'b', 'v'], 'h': ['y', 'u', 'g', 'j', 'n', 'b'],
            'j': ['u', 'i', 'h', 'k', 'm', 'n'], 'k': ['i', 'o', 'j', 'l', 'm'],
            'l': ['o', 'p', 'k'], 'z': ['a', 's', 'x'], 'x': ['s', 'd', 'z', 'c'],
            'c': ['d', 'f', 'x', 'v'], 'v': ['f', 'g', 'c', 'b'], 'b': ['g', 'h', 'v', 'n'],
            'n': ['h', 'j', 'b', 'm'], 'm': ['j', 'k', 'n']
        }

        char_lower = char.lower()
        if char_lower in keyboard_layout:
            return keyboard_layout[char_lower]
        return []

    def _type_with_realistic_errors(self, char, delay=0.05, error_rate=0.08):
        """
        模拟真实打字，有一定概率打错并退格修正
        :param char: 要输入的字符
        :param delay: 输入延迟
        :param error_rate: 出错概率 (默认8%)
        """
        import pyautogui

        if random.random() < error_rate:
            nearby_chars = self._get_nearby_keys(char)
            if nearby_chars:
                num_errors = random.randint(1, min(3, len(nearby_chars)))
                wrong_chars = random.sample(nearby_chars, num_errors)

                for wrong_char in wrong_chars:
                    pyautogui.typewrite(wrong_char, interval=delay * 0.7)
                    time.sleep(random.uniform(0.1, 0.3))
                    pyautogui.press('backspace')
                    time.sleep(random.uniform(0.05, 0.15))
                return True  # 发生了错误并修正
        return False  # 没有错误

    def run(self):
        """执行自动写入"""
        import pyautogui

        typing_start_time = time.time()

        try:
            # 读取文件内容
            if not os.path.exists(self.code_file_path):
                self.error_occurred.emit(f"代码文件不存在: {self.code_file_path}")
                return

            with open(self.code_file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            # 过滤Markdown代码块标记行（```python 和 ```）
            filtered_lines = []
            for line in lines:
                stripped = line.strip()
                # 跳过代码块开始标记（如 ```python, ```, ```java 等）
                if stripped.startswith('```'):
                    print(f"跳过代码块标记: {stripped}")
                    continue
                filtered_lines.append(line)
            lines = filtered_lines

            total_chars = sum(len(line) for line in lines)
            print(f"准备输入 {len(lines)} 行（已过滤Markdown标记），共 {total_chars} 个字符")

            # 给用户3秒时间切换到目标窗口
            print("请在5秒内切换到目标窗口...并检查是否为英文输入状态！！")
            time.sleep(5)
            print("开始输入...")

            last_leading_spaces = None
            need_home = False

            # 逐行输入
            for line_idx, line in enumerate(lines):
                # 检查停止信号
                if self._stop_flag:
                    print("\n用户中断输入！")
                    return

                # 检查暂停状态
                while self._paused and not self._stop_flag:
                    time.sleep(0.1)
                if self._stop_flag:
                    return

                # 展开tab为4空格并计算缩进
                expanded_line = line.expandtabs(4)
                leading_spaces = len(expanded_line) - len(expanded_line.lstrip(" "))

                # 判断是否需要Home键处理（缩进减少时）
                if last_leading_spaces is not None and leading_spaces < last_leading_spaces:
                    need_home = True

                if need_home:
                    pyautogui.press('home')
                    need_home = False
                    # 逐字符输入（带错误模拟）
                    for char in line:
                        if char == '\n' and line.strip():
                            pyautogui.typewrite(' ')
                        else:
                            random_delay = random.uniform(self.delay * 0.5, self.delay * 1.5)
                            self._type_with_realistic_errors(char, delay=random_delay, error_rate=self.error_rate)
                            pyautogui.typewrite(char, interval=random_delay)
                    # 输入换行
                    if line.strip():
                        pyautogui.typewrite('\n')
                        think_time = random.uniform(self.think_time_min, self.think_time_max)
                        time.sleep(think_time)
                    print(f"[Home] 已输入行 {line_idx + 1}")
                else:
                    # 普通行输入
                    line_content = line.strip()
                    for char in line_content:
                        random_delay = random.uniform(self.delay * 0.5, self.delay * 2.5)
                        # 使用错误模拟打字
                        self._type_with_realistic_errors(char, delay=random_delay, error_rate=self.error_rate)
                        pyautogui.typewrite(char, interval=random_delay)

                    # 输入空格和换行
                    if line_content:
                        pyautogui.typewrite(' ')
                    pyautogui.typewrite('\n')

                    # 随机延迟模拟思考时间
                    think_time = random.uniform(self.think_time_min, self.think_time_max)
                    time.sleep(think_time)

                # 长行随机换行（更自然的打字行为）
                line_content = line.strip()
                if len(line_content) > 18 and random.random() > self.line_break_rate:
                    pyautogui.press('enter')
                    pause_time = random.uniform(1, 3)
                    time.sleep(pause_time)

                # 每10行显示进度
                if (line_idx + 1) % 10 == 0 or line_idx == len(lines) - 1:
                    print(f"已输入 {line_idx + 1}/{len(lines)} 行")

                last_leading_spaces = leading_spaces

            total_elapsed = time.time() - typing_start_time
            print(f"输入完成! (总耗时: {total_elapsed:.2f}s)")

            # 自动输入完成后，返回过滤后的代码
            if self.filtered_code:
                print("自动输入完成")

            return total_elapsed

        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            print(f"❌ 自动写入失败: {str(e)}\n{error_detail}")
            raise

    def stop_typing(self):
        """停止自动输入"""
        self._stop_flag = True
        print("\n正在停止输入...")

    def toggle_pause(self):
        """切换暂停/恢复状态"""
        # 如果已经停止，不允许切换暂停状态
        if self._stop_flag:
            print("⚠️ 任务已停止，无法切换暂停状态")
            return

        self._paused = not self._paused
        if self._paused:
            print("[已暂停] - 按 Alt+L 恢复或 Ctrl+K 停止")
        else:
            print("[已恢复] 继续输入...")