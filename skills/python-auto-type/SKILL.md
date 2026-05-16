---
name: python-auto-type
description: Automatically input Python code into any target window with realistic typing simulation, error correction, and customizable delays. Use this skill whenever the user needs to simulate human typing of Python code, demonstrate coding in real-time, or automate code input with natural typing behavior including realistic errors and corrections.
compatibility: requires pyautogui
---

# Python Auto-Type Skill

This skill enables Claude to automatically input Python code into any target application window with realistic typing simulation. It mimics human typing behavior including natural delays, occasional typing errors with corrections, and intelligent indentation handling.

## Features

- **Realistic typing simulation**: Mimics human typing speed with configurable delays
- **Error simulation**: Random typing errors with automatic correction (8% error rate by default)
- **Smart indentation**: Automatically handles Python indentation using Home key when needed
- **Markdown code block filtering**: Automatically skips ```python and ``` markers
- **Progress tracking**: Real-time progress updates during typing
- **Pause/Resume control**: Hotkey controls for typing process management
- **Clipboard integration**: Automatically copies filtered code to clipboard after completion

## Usage

The skill takes a Python file path and optional parameters to control typing behavior:

**Required Parameters:**
- `code_file_path`: Path to the Python file to be typed

**Optional Parameters:**
- `delay`: Base typing delay in seconds (default: 0.05)
- `think_time_min`: Minimum thinking delay between lines (default: 1.0)
- `think_time_max`: Maximum thinking delay between lines (default: 2.0)
- `error_rate`: Probability of typing errors (default: 0.08 = 8%)
- `line_break_rate`: Probability of random line breaks for long lines (default: 0.7 = 70%)

## How it Works

1. **File Reading**: Reads the specified Python file and filters out Markdown code block markers
2. **Window Switching**: Provides a 5-second window for user to switch to target application
3. **Intelligent Typing**: 
   - Uses Home key for proper indentation when needed
   - Simulates realistic typing errors and corrections
   - Adds random thinking delays between lines
   - Handles long lines with occasional random breaks
4. **Progress Monitoring**: Provides real-time feedback on typing progress
5. **Completion**: Copies the filtered code to clipboard and reports total time

## Hotkeys During Typing

- **Alt+L**: Pause/Resume typing
- **Ctrl+K**: Stop typing (implemented via stop_typing method)

## Example Usage

```python
# Basic usage with default settings
auto_type_python("/path/to/your/script.py")

# Advanced usage with custom parameters
auto_type_python(
    code_file_path="/path/to/your/script.py",
    delay=0.03,
    think_time_min=0.5,
    think_time_max=1.5,
    error_rate=0.05,
    line_break_rate=0.6
)
```

## Requirements

**⚠️ IMPORTANT: Install pyautogui before using this skill!**

The target system must have:
- **Python with pyautogui installed** (run `pip install pyautogui` first)
- Target application window that accepts keyboard input
- English input mode (for proper character typing)

### Installation

Before running the script, make sure to install the required dependency:

```bash
pip install pyautogui
```

Or use the provided requirements.txt file:

```bash
pip install -r requirements.txt
```

## Safety Features

- **5-second preparation time**: Allows user to switch to target window
- **Pause/Resume**: Immediate control over typing process
- **Stop capability**: Ability to immediately halt typing
- **Error handling**: Comprehensive error reporting and graceful failure

## Integration

This skill uses the AutoTypeWorker class from script.py, providing a clean interface for automated Python code input with realistic human-like typing behavior. No GUI framework dependencies required - just pyautogui!