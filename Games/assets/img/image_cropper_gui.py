"""
图片自动裁剪工具 - GUI版本
支持批量自动裁剪图片四周的多余像素（空白、透明或纯色背景）
"""

import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image
import threading


class ImageCropperGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("图片自动裁剪工具 v1.0")
        self.root.geometry("750x700")
        self.root.resizable(True, True)
        
        # 存储选中的文件列表
        self.selected_files = []
        self.target_directory = ""
        
        # 创建界面
        self.create_widgets()
        
    def create_widgets(self):
        """创建GUI组件"""
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 配置网格权重
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(4, weight=1)
        
        # ===== 标题 =====
        title_label = ttk.Label(main_frame, text="✂️ 图片自动裁剪工具", 
                                font=("Microsoft YaHei", 16, "bold"))
        title_label.grid(row=0, column=0, pady=(0, 10), sticky=tk.W)
        
        # ===== 文件选择区域 =====
        file_frame = ttk.LabelFrame(main_frame, text="选择图片", padding="10")
        file_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        file_frame.columnconfigure(1, weight=1)
        
        # 文件夹选择
        ttk.Button(file_frame, text="📁 选择文件夹", 
                  command=self.select_folder).grid(row=0, column=0, padx=(0, 5), pady=2)
        
        # 文件选择
        ttk.Button(file_frame, text="📄 选择多张图片", 
                  command=self.select_files).grid(row=0, column=1, padx=(0, 5), pady=2, sticky=tk.W)
        
        # 清空选择
        ttk.Button(file_frame, text="❌ 清空", 
                  command=self.clear_selection).grid(row=0, column=2, pady=2)
        
        # 显示选中信息
        self.file_info_var = tk.StringVar(value="未选择任何文件")
        file_info_label = ttk.Label(file_frame, textvariable=self.file_info_var, 
                                   foreground="gray")
        file_info_label.grid(row=1, column=0, columnspan=3, pady=(5, 0), sticky=tk.W)
        
        # ===== 参数设置区域 =====
        param_frame = ttk.LabelFrame(main_frame, text="裁剪参数", padding="10")
        param_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        param_frame.columnconfigure(1, weight=1)
        
        # 裁剪边距
        ttk.Label(param_frame, text="裁剪边距:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.margin_var = tk.DoubleVar(value=5.0)
        margin_scale = ttk.Scale(param_frame, from_=2.0, to=10.0, 
                                variable=self.margin_var, orient=tk.HORIZONTAL)
        margin_scale.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(10, 0), pady=5)
        margin_label = ttk.Label(param_frame, textvariable=self.margin_var, width=5)
        margin_label.grid(row=0, column=2, sticky=tk.W, padx=(5, 0), pady=5)
        ttk.Label(param_frame, text="% (2%-10%, 相对于图片尺寸)", 
                 foreground="gray").grid(row=0, column=3, sticky=tk.W, padx=(5, 0), pady=5)
        

        
        # 自动备份
        self.auto_backup_var = tk.BooleanVar(value=True)
        backup_check = ttk.Checkbutton(param_frame, text="自动备份原图",
                                      variable=self.auto_backup_var)
        backup_check.grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        # 覆盖原文件
        self.overwrite_var = tk.BooleanVar(value=False)
        overwrite_check = ttk.Checkbutton(param_frame, text="覆盖原文件（不备份）",
                                         variable=self.overwrite_var)
        overwrite_check.grid(row=2, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        # ===== 进度和日志区域 =====
        progress_frame = ttk.LabelFrame(main_frame, text="处理进度", padding="10")
        progress_frame.grid(row=3, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        progress_frame.columnconfigure(0, weight=1)
        
        # 进度条
        self.progress_var = tk.DoubleVar(value=0)
        progress_bar = ttk.Progressbar(progress_frame, variable=self.progress_var,
                                      maximum=100, mode='determinate')
        progress_bar.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 5))
        
        # 状态标签
        self.status_var = tk.StringVar(value="就绪")
        status_label = ttk.Label(progress_frame, textvariable=self.status_var,
                                foreground="blue")
        status_label.grid(row=1, column=0, sticky=tk.W)
        
        # ===== 日志文本框 =====
        log_frame = ttk.Frame(main_frame)
        log_frame.grid(row=4, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        
        # 滚动条
        scrollbar = ttk.Scrollbar(log_frame)
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # 文本框
        self.log_text = tk.Text(log_frame, height=12, wrap=tk.WORD,
                               yscrollcommand=scrollbar.set,
                               font=("Consolas", 9))
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.config(command=self.log_text.yview)
        
        # ===== 按钮区域 =====
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=5, column=0, sticky=(tk.W, tk.E))
        
        # 开始裁剪按钮
        self.start_btn = ttk.Button(button_frame, text="✂️ 开始裁剪",
                                   command=self.start_cropping,
                                   style="Accent.TButton")
        self.start_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # 打开输出目录按钮
        ttk.Button(button_frame, text="📂 打开输出目录",
                  command=self.open_output_dir).pack(side=tk.LEFT, padx=(0, 10))
        
        # 关于按钮
        ttk.Button(button_frame, text="ℹ️ 关于",
                  command=self.show_about).pack(side=tk.LEFT)
        
    def log_message(self, message):
        """添加日志消息"""
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.root.update_idletasks()
        
    def select_folder(self):
        """选择文件夹"""
        folder = filedialog.askdirectory(title="选择包含图片的文件夹")
        if folder:
            self.target_directory = folder
            # 获取文件夹中的所有图片
            supported_formats = ('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp', '.tiff')
            self.selected_files = [
                os.path.join(folder, f) for f in os.listdir(folder)
                if f.lower().endswith(supported_formats) and os.path.isfile(os.path.join(folder, f))
            ]
            
            if self.selected_files:
                self.file_info_var.set(f"文件夹: {folder} ({len(self.selected_files)} 张图片)")
                self.log_message(f"已选择文件夹: {folder}")
                self.log_message(f"找到 {len(self.selected_files)} 张图片")
            else:
                self.file_info_var.set(f"文件夹: {folder} (未找到图片)")
                self.log_message(f"警告: 文件夹中未找到支持的图片格式")
                
    def select_files(self):
        """选择多个文件"""
        files = filedialog.askopenfilenames(
            title="选择图片文件",
            filetypes=[
                ("图片文件", "*.png *.jpg *.jpeg *.bmp *.gif *.webp *.tiff"),
                ("PNG文件", "*.png"),
                ("JPEG文件", "*.jpg *.jpeg"),
                ("WebP文件", "*.webp"),
                ("所有文件", "*.*")
            ]
        )
        
        if files:
            self.selected_files = list(files)
            if len(files) == 1:
                # 如果只选了一个文件，设置目标目录为该文件所在目录
                self.target_directory = os.path.dirname(files[0])
                self.file_info_var.set(f"已选择: {os.path.basename(files[0])}")
            else:
                # 多个文件，使用第一个文件的目录作为目标目录
                self.target_directory = os.path.dirname(files[0])
                self.file_info_var.set(f"已选择 {len(files)} 张图片")
            
            self.log_message(f"已选择 {len(files)} 张图片")
            for f in files:
                self.log_message(f"  - {os.path.basename(f)}")
                
    def clear_selection(self):
        """清空选择"""
        self.selected_files = []
        self.target_directory = ""
        self.file_info_var.set("未选择任何文件")
        self.log_message("已清空选择")
        
    def get_bbox_for_image(self, img, margin_percent=5.0):
        """
        根据百分比计算裁剪边界（直接从四周裁剪固定比例）
        
        Args:
            img: PIL Image对象
            margin_percent: 裁剪边距百分比（相对于图片尺寸）
            
        Returns:
            bbox: (left, upper, right, lower) 元组
        """
        width, height = img.size
        
        # 根据百分比计算边距
        margin_x = int(width * margin_percent / 100.0)
        margin_y = int(height * margin_percent / 100.0)
        
        # 计算裁剪后的边界（从四周各裁剪margin_percent%）
        left = margin_x
        upper = margin_y
        right = width - margin_x
        lower = height - margin_y
        
        # 确保边界有效
        if left >= right or upper >= lower:
            return None
        
        # 返回bbox格式：(left, upper, right, lower)
        return (left, upper, right, lower)
    
    def crop_image(self, img, params):
        """裁剪图片"""
        bbox = self.get_bbox_for_image(
            img, 
            margin_percent=params['margin']
        )
        
        if bbox is None:
            return img, False  # 无需裁剪
        
        cropped_img = img.crop(bbox)
        return cropped_img, True
    
    def save_cropped_image(self, img, filepath):
        """保存裁剪后的图片（保持原格式）"""
        # 获取原文件格式
        ext = os.path.splitext(filepath)[1].lower()
        
        save_kwargs = {}
        
        if ext in ['.png']:
            save_kwargs = {'format': 'PNG', 'optimize': True}
        elif ext in ['.jpg', '.jpeg']:
            save_kwargs = {'format': 'JPEG', 'quality': 95, 'optimize': True}
            # JPEG不支持透明，需要转换
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
        elif ext in ['.webp']:
            save_kwargs = {'format': 'WEBP', 'quality': 95, 'method': 6}
        else:
            # 默认使用PNG
            save_kwargs = {'format': 'PNG', 'optimize': True}
        
        img.save(filepath, **save_kwargs)
        return os.path.getsize(filepath)
    
    def process_single_image(self, filepath, params, index, total):
        """处理单张图片"""
        try:
            filename = os.path.basename(filepath)
            original_size = os.path.getsize(filepath)
            
            with Image.open(filepath) as img:
                original_width, original_height = img.size
                
                # 备份原图
                if params['auto_backup'] and not params['overwrite']:
                    backup_dir = os.path.join(params['target_dir'], "backup")
                    if not os.path.exists(backup_dir):
                        os.makedirs(backup_dir)
                    backup_path = os.path.join(backup_dir, filename)
                    img.save(backup_path)
                
                # 裁剪图片
                cropped_img, was_cropped = self.crop_image(img, params)
                
                if not was_cropped:
                    self.log_message(f"⊘ [{index}/{total}] {filename} - 无需裁剪")
                    return True, original_size, original_size
                
                # 确定新文件名（保持原格式）
                new_filename = filename
                
                # 确定保存路径
                if params['overwrite']:
                    new_filepath = filepath
                else:
                    new_filepath = os.path.join(params['target_dir'], new_filename)
                
                # 保存裁剪后的图片
                new_size = self.save_cropped_image(cropped_img, new_filepath)
                
                # 计算压缩率
                reduction = (1 - new_size / original_size) * 100 if original_size > 0 else 0
                
                # 更新日志
                self.log_message(f"✓ [{index}/{total}] {filename}")
                self.log_message(f"   尺寸: {original_width}x{original_height} -> {cropped_img.size[0]}x{cropped_img.size[1]}")
                self.log_message(f"   大小: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB (减少 {reduction:.1f}%)")
                
                # 如果不覆盖且格式改变，删除原文件
                if not params['overwrite'] and new_filename != filename:
                    os.remove(filepath)
                    self.log_message(f"   已删除原文件: {filename}")
                
                return True, original_size, new_size
                
        except Exception as e:
            self.log_message(f"✗ [{index}/{total}] 处理 {filename} 时出错: {str(e)}")
            import traceback
            self.log_message(traceback.format_exc())
            return False, 0, 0
    
    def start_cropping(self):
        """开始裁剪"""
        if not self.selected_files:
            messagebox.showwarning("警告", "请先选择图片或文件夹！")
            return
        
        if not self.target_directory:
            messagebox.showwarning("警告", "目标目录未设置！")
            return
        
        # 禁用开始按钮
        self.start_btn.config(state=tk.DISABLED)
        
        # 在新线程中执行裁剪
        thread = threading.Thread(target=self.run_cropping)
        thread.daemon = True
        thread.start()
    
    def run_cropping(self):
        """运行裁剪（在后台线程中）"""
        # 收集参数
        params = {
            'margin': self.margin_var.get(),
            'auto_backup': self.auto_backup_var.get(),
            'overwrite': self.overwrite_var.get(),
            'target_dir': self.target_directory
        }
        
        total = len(self.selected_files)
        total_original_size = 0
        total_new_size = 0
        success_count = 0
        cropped_count = 0
        
        self.log_message("\n" + "="*60)
        self.log_message("开始裁剪...")
        self.log_message(f"共 {total} 张图片")
        self.log_message(f"参数: 边距={params['margin']}%")
        self.log_message("="*60 + "\n")
        
        # 处理每张图片
        for i, filepath in enumerate(self.selected_files, 1):
            self.status_var.set(f"正在处理: {os.path.basename(filepath)} ({i}/{total})")
            
            success, orig_size, new_size = self.process_single_image(
                filepath, params, i, total
            )
            
            if success:
                success_count += 1
                total_original_size += orig_size
                total_new_size += new_size
                if orig_size != new_size:
                    cropped_count += 1
            
            # 更新进度条
            progress = (i / total) * 100
            self.progress_var.set(progress)
            self.root.update_idletasks()
        
        # 完成
        self.status_var.set("裁剪完成！")
        self.progress_var.set(100)
        
        self.log_message("\n" + "="*60)
        self.log_message("✅ 裁剪完成！")
        self.log_message(f"成功处理: {success_count}/{total} 张图片")
        self.log_message(f"实际裁剪: {cropped_count} 张")
        self.log_message(f"总大小: {total_original_size/1024:.1f}KB -> {total_new_size/1024:.1f}KB")
        if total_original_size > 0:
            total_reduction = (1 - total_new_size / total_original_size) * 100
            self.log_message(f"总压缩率: {total_reduction:.1f}%")
        self.log_message("="*60)
        
        # 重新启用按钮
        self.start_btn.config(state=tk.NORMAL)
        
        # 显示完成对话框
        messagebox.showinfo("完成", 
                          f"裁剪完成！\n\n"
                          f"成功处理: {success_count}/{total} 张图片\n"
                          f"实际裁剪: {cropped_count} 张\n"
                          f"总压缩率: {(1 - total_new_size / total_original_size) * 100:.1f}%\n"
                          f"详见日志窗口")
    
    def open_output_dir(self):
        """打开输出目录"""
        if self.target_directory and os.path.exists(self.target_directory):
            os.startfile(self.target_directory)
        else:
            messagebox.showwarning("警告", "输出目录不存在！")
    
    def show_about(self):
        """显示关于信息"""
        messagebox.showinfo("关于",
                          "图片自动裁剪工具 v1.0\n\n"
                          "功能:\n"
                          "• 批量按百分比裁剪图片四周\n"
                          "• 可调节裁剪边距（2%-10%）\n"
                          "• 保持原图片格式\n"
                          "• 自动备份原图\n\n"
                          "技术支持: Python + Tkinter + Pillow")


def main():
    root = tk.Tk()
    app = ImageCropperGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
