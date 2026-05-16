"""
图片优化工具
支持：缩放、WebP转换、PNG优化压缩、颜色深度减少、元数据清除
"""

import os
from PIL import Image
import io


def optimize_image(img, output_format='WEBP', quality=80, scale_factor=1.0, 
                   reduce_colors=False, color_count=256, remove_metadata=True):
    """
    优化图片
    
    Args:
        img: PIL Image对象
        output_format: 输出格式 ('WEBP', 'PNG', 'JPEG')
        quality: 质量参数 (1-100)
        scale_factor: 缩放因子
        reduce_colors: 是否减少颜色深度
        color_count: 目标颜色数 (仅PNG有效)
        remove_metadata: 是否移除元数据
    
    Returns:
        优化后的Image对象和保存参数
    """
    # 1. 缩放处理
    if scale_factor != 1.0:
        original_width, original_height = img.size
        new_width = max(1, int(original_width * scale_factor))
        new_height = max(1, int(original_height * scale_factor))
        img = img.resize((new_width, new_height), Image.LANCZOS)
    
    # 2. 移除元数据（创建新图像复制像素数据）
    if remove_metadata:
        # 根据模式创建新图像
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            clean_img = Image.new(img.mode, img.size)
        else:
            clean_img = Image.new('RGB' if img.mode != 'L' else 'L', img.size)
        clean_img.paste(img)
        img = clean_img
    
    # 3. 减少颜色深度（仅对PNG有效）
    if reduce_colors and output_format == 'PNG':
        if img.mode != 'P':
            img = img.convert('P', palette=Image.ADAPTIVE, colors=color_count)
        else:
            img = img.quantize(colors=color_count, method=2)
    
    return img


def save_optimized_image(img, filepath, output_format='WEBP', quality=80):
    """
    保存优化后的图片
    
    Args:
        img: PIL Image对象
        filepath: 保存路径
        output_format: 输出格式
        quality: 质量参数
    
    Returns:
        文件大小（字节）
    """
    save_kwargs = {}
    
    if output_format == 'WEBP':
        save_kwargs = {'format': 'WEBP', 'quality': quality, 'method': 6}
        # 如果原图有透明通道，保留透明度
        if img.mode in ('RGBA', 'LA'):
            save_kwargs['lossless'] = False
    elif output_format == 'PNG':
        save_kwargs = {'format': 'PNG', 'optimize': True}
    elif output_format == 'JPEG':
        save_kwargs = {'format': 'JPEG', 'quality': quality, 'optimize': True}
        # JPEG不支持透明，转换为RGB
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
    
    img.save(filepath, **save_kwargs)
    return os.path.getsize(filepath)


def process_images(directory, scale_factor=0.6, output_format='WEBP', quality=80,
                   reduce_colors=False, color_count=256, remove_metadata=True):
    """
    批量处理目录下的图片
    
    Args:
        directory: 图片目录
        scale_factor: 缩放因子 (0-1)
        output_format: 输出格式 ('WEBP', 'PNG', 'JPEG')
        quality: 质量参数 (1-100)
        reduce_colors: 是否减少颜色深度
        color_count: 颜色数量
        remove_metadata: 是否移除元数据
    """
    # 确保目录存在
    if not os.path.exists(directory):
        print(f"目录不存在: {directory}")
        return
    
    # 支持的图片格式
    supported_formats = ('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp')
    
    # 获取目录下所有图片文件（排除backup目录）
    image_files = []
    for f in os.listdir(directory):
        filepath = os.path.join(directory, f)
        if os.path.isfile(filepath) and f.lower().endswith(supported_formats):
            image_files.append(f)
    
    if not image_files:
        print("未找到任何图片文件")
        return
    
    print(f"找到 {len(image_files)} 个图片文件")
    
    # 创建备份目录
    backup_dir = os.path.join(directory, "backup")
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"创建备份目录: {backup_dir}")
    
    # 统计信息
    total_original_size = 0
    total_new_size = 0
    processed_count = 0
    
    # 处理每个图片文件
    for filename in image_files:
        try:
            filepath = os.path.join(directory, filename)
            original_size = os.path.getsize(filepath)
            total_original_size += original_size
            
            # 打开图片
            with Image.open(filepath) as img:
                original_width, original_height = img.size
                
                # 备份原图
                backup_path = os.path.join(backup_dir, filename)
                img.save(backup_path)
                
                # 优化图片
                optimized_img = optimize_image(
                    img, 
                    output_format=output_format,
                    quality=quality,
                    scale_factor=scale_factor,
                    reduce_colors=reduce_colors,
                    color_count=color_count,
                    remove_metadata=remove_metadata
                )
                
                # 确定新文件名
                name_without_ext = os.path.splitext(filename)[0]
                if output_format == 'WEBP':
                    new_filename = f"{name_without_ext}.webp"
                elif output_format == 'JPEG':
                    new_filename = f"{name_without_ext}.jpg"
                else:
                    new_filename = filename
                
                new_filepath = os.path.join(directory, new_filename)
                
                # 保存优化后的图片
                new_size = save_optimized_image(optimized_img, new_filepath, output_format, quality)
                total_new_size += new_size
                
                # 计算新尺寸
                new_width, new_height = optimized_img.size
                
                # 计算压缩率
                reduction = (1 - new_size / original_size) * 100
                
                print(f"✓ {filename} -> {new_filename}:")
                print(f"  尺寸: {original_width}x{original_height} -> {new_width}x{new_height}")
                print(f"  大小: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB (减少 {reduction:.1f}%)")
                
                # 如果格式改变，删除原文件
                if new_filename != filename:
                    os.remove(filepath)
                    print(f"  已删除原文件: {filename}")
                
                processed_count += 1
                
        except Exception as e:
            print(f"✗ 处理 {filename} 时出错: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # 打印总结
    print("\n" + "="*50)
    print("处理完成！")
    print(f"成功处理: {processed_count}/{len(image_files)} 个文件")
    print(f"总大小: {total_original_size/1024:.1f}KB -> {total_new_size/1024:.1f}KB")
    if total_original_size > 0:
        total_reduction = (1 - total_new_size / total_original_size) * 100
        print(f"总压缩率: {total_reduction:.1f}%")
    print(f"原图已备份到: {backup_dir}")


if __name__ == "__main__":
    # 设置图片目录路径
    image_directory = os.path.dirname(os.path.abspath(__file__))
    
    print("="*50)
    print("图片优化工具 v2.0")
    print("="*50)
    print(f"目标目录: {image_directory}")
    print()
    
    # ========== 配置参数 ==========
    # 1. 缩放设置
    scale = 0.6  # 缩放因子 (0-1)，1.0表示不缩放
    
    # 2. 输出格式选择: 'WEBP' (推荐), 'PNG', 'JPEG'
    output_format = 'WEBP'
    
    # 3. 质量参数 (1-100)，越高质量越好但体积越大
    quality = 80
    
    # 4. 是否减少颜色深度（仅PNG有效）
    reduce_colors = False
    color_count = 256  # 目标颜色数
    
    # 5. 是否移除元数据
    remove_metadata = True
    # ================================
    
    print("当前配置:")
    print(f"  缩放因子: {scale}")
    print(f"  输出格式: {output_format}")
    print(f"  质量参数: {quality}")
    print(f"  减少颜色: {reduce_colors}" + (f" ({color_count}色)" if reduce_colors else ""))
    print(f"  移除元数据: {remove_metadata}")
    print()
    print("提示:")
    print("  - WEBP格式通常比PNG小25-35%，质量相当")
    print("  - 质量参数70-85是性价比最高的区间")
    print("  - 减少颜色深度适合简单图形，照片不建议使用")
    print("="*50)
    print()
    
    # 执行优化
    process_images(
        image_directory,
        scale_factor=scale,
        output_format=output_format,
        quality=quality,
        reduce_colors=reduce_colors,
        color_count=color_count,
        remove_metadata=remove_metadata
    )