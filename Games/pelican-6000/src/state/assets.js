const MAX_BYTES = 20 * 1024 * 1024;

export class AssetStore extends EventTarget {
  constructor() {
    super();
    this.backgrounds = new Map();
    this.character = null;
    this.urls = new Map();
  }

  async replace(slot, file) {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('请选择 PNG、JPG 或 WebP 图片。');
    if (file.size > MAX_BYTES) throw new Error('请选择 20 MB 以内的图片。');
    const url = URL.createObjectURL(file);
    const img = new Image();
    try {
      img.src = url;
      await img.decode();
    } catch {
      URL.revokeObjectURL(url);
      throw new Error('这张图片无法读取，请换一个文件。');
    }
    if (this.urls.has(slot)) URL.revokeObjectURL(this.urls.get(slot));
    this.urls.set(slot, url);
    if (slot === 'character') this.character = img;
    else this.backgrounds.set(Number(slot), img);
    this.dispatchEvent(new Event('change'));
  }

  reset() {
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear(); this.backgrounds.clear(); this.character = null;
    this.dispatchEvent(new Event('change'));
  }
}
