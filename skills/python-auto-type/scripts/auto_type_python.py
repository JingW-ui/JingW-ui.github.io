#!/usr/bin/env python3
"""
Python Auto-Type Skill - Main execution script
Provides a clean interface to the AutoTypeWorker functionality
"""

import sys
import os
import time
import random
from PyQt5.QtCore import QThread
from PyQt5.QtCore import pyqtSignal as Signal
import pyautogui

# Add the current directory to Python path to import AutoTypeWorker
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from script import AutoTypeWorker

def auto_type_python(code_file_path, delay=0.05, think_time_min=1.0, think_time_max=2.0, error_rate=0.08, line_break_rate=0.7):
    """
    Automatically input Python code with realistic typing simulation

    Args:
        code_file_path (str): Path to the Python file to be typed
        delay (float): Base typing delay in seconds (default: 0.05)
        think_time_min (float): Minimum thinking delay between lines (default: 1.0)
        think_time_max (float): Maximum thinking delay between lines (default: 2.0)
        error_rate (float): Probability of typing errors (default: 0.08 = 8%)
        line_break_rate (float): Probability of random line breaks for long lines (default: 0.7 = 70%)
    """
    print(f"Starting Python Auto-Type for: {code_file_path}")
    print(f"Parameters: delay={delay}s, think_time={think_time_min}-{think_time_max}s, error_rate={error_rate*100}%")

    # Create a simple application to host the QThread
    from PyQt5.QtWidgets import QApplication
    app = QApplication([])

    # Create the worker thread
    worker = AutoTypeWorker(
        code_file_path=code_file_path,
        delay=delay,
        think_time_min=think_time_min,
        think_time_max=think_time_max,
        error_rate=error_rate,
        line_break_rate=line_break_rate
    )

    # Connect signals for status updates
    def on_typing_started():
        print("Typing started!")

    def on_typing_paused():
        print("Typing paused")

    def on_typing_resumed():
        print("Typing resumed")

    def on_typing_completed(total_time):
        print(f"Typing completed in {total_time:.2f} seconds")
        app.quit()

    def on_clipboard_ready(code):
        print("Code copied to clipboard!")
        # In a real implementation, you'd copy to clipboard here

    def on_error_occurred(error_msg):
        print(f"Error: {error_msg}")
        app.quit()

    def on_status_update(status):
        print(f"Status: {status}")

    def on_progress_update(current, total):
        print(f"Progress: {current}/{total} lines")

    # Connect all signals
    worker.typing_started.connect(on_typing_started)
    worker.typing_paused.connect(on_typing_paused)
    worker.typing_resumed.connect(on_typing_resumed)
    worker.typing_completed.connect(on_typing_completed)
    worker.clipboard_ready.connect(on_clipboard_ready)
    worker.error_occurred.connect(on_error_occurred)
    worker.status_update.connect(on_status_update)
    worker.progress_update.connect(on_progress_update)

    # Start the worker
    worker.start()

    # Run the application
    app.exec_()

    print("Auto-type session completed")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python auto_type_python.py <code_file_path> [delay] [think_time_min] [think_time_max] [error_rate] [line_break_rate]")
        sys.exit(1)

    code_file_path = sys.argv[1]

    # Parse optional parameters
    delay = float(sys.argv[2]) if len(sys.argv) > 2 else 0.05
    think_time_min = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    think_time_max = float(sys.argv[4]) if len(sys.argv) > 4 else 2.0
    error_rate = float(sys.argv[5]) if len(sys.argv) > 5 else 0.08
    line_break_rate = float(sys.argv[6]) if len(sys.argv) > 6 else 0.7

    auto_type_python(code_file_path, delay, think_time_min, think_time_max, error_rate, line_break_rate)