/**
 * 资源加载器 - 管理SVG图片资源
 */
class ResourceManager {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    /**
     * 预加载所有飞船SVG图片
     */
    async loadAllAssets() {
        const assets = [
            // 玩家飞船
            { key: 'our1', path: 'assets/chips/our1.svg' },
            { key: 'our2', path: 'assets/chips/our2.svg' },
            { key: 'our3', path: 'assets/chips/our3.svg' },
            { key: 'our4', path: 'assets/chips/our4.svg' },
            // 敌人飞船（SVG）
            { key: 'enemy1', path: 'assets/chips/enemy1.svg' },
            { key: 'enemy2', path: 'assets/chips/enemy2.svg' },
            // Boss
            { key: 'boss1', path: 'assets/chips/boss1.svg' },
            { key: 'boss2', path: 'assets/chips/boss2.svg' },
            // 敌人飞船（PNG）- 新增丰富样式
            { key: 'enemy_dinghy_large', path: 'assets/enemies/dinghyLarge1.png' },
            { key: 'enemy_dinghy_small', path: 'assets/enemies/dinghySmall1.png' },
            { key: 'enemy_ship1', path: 'assets/enemies/ship (1).png' },
            { key: 'enemy_ship2', path: 'assets/enemies/ship (2).png' },
            { key: 'enemy_ship3', path: 'assets/enemies/ship (3).png' },
            { key: 'enemy_ship4', path: 'assets/enemies/ship (4).png' },
            { key: 'enemy_ship5', path: 'assets/enemies/ship (5).png' },
            { key: 'enemy_ship6', path: 'assets/enemies/ship (6).png' },
            { key: 'enemy_ship8', path: 'assets/enemies/ship (8).png' },
            { key: 'enemy_ship9', path: 'assets/enemies/ship (9).png' },
            { key: 'enemy_ship10', path: 'assets/enemies/ship (10).png' },
            { key: 'enemy_ship18', path: 'assets/enemies/ship (18).png' },
            { key: 'enemy_ship19', path: 'assets/enemies/ship (19).png' },
            // 巡航导弹图片
            { key: 'missile_004', path: 'assets/missiles/spaceMissiles_004.png' },
            { key: 'missile_006', path: 'assets/missiles/spaceMissiles_006.png' },
            { key: 'missile_011', path: 'assets/missiles/spaceMissiles_011.png' },
            { key: 'missile_013', path: 'assets/missiles/spaceMissiles_013.png' },
            { key: 'missile_023', path: 'assets/missiles/spaceMissiles_023.png' }
        ];

        this.totalCount = assets.length;
        this.loadedCount = 0;

        console.log('📦 开始加载资源...');

        const promises = assets.map(asset => this.loadImage(asset.key, asset.path));
        await Promise.all(promises);

        console.log('✅ 所有资源加载完成！');
        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * 加载单个图片
     */
    loadImage(key, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images[key] = img;
                this.loadedCount++;
                
                console.log(`✓ 已加载: ${key} (${img.width}x${img.height})`);
                
                if (this.onProgress) {
                    this.onProgress(this.loadedCount, this.totalCount);
                }
                
                resolve(img);
            };

            img.onerror = (err) => {
                console.error(`✗ 加载失败: ${key}`, err);
                reject(err);
            };

            img.src = path;
        });
    }

    /**
     * 获取图片
     */
    getImage(key) {
        return this.images[key];
    }

    /**
     * 检查图片是否已加载
     */
    hasImage(key) {
        return !!this.images[key];
    }

    /**
     * 获取加载进度 (0-1)
     */
    getProgress() {
        return this.totalCount > 0 ? this.loadedCount / this.totalCount : 0;
    }
}

// 全局资源管理器实例
window.resourceManager = new ResourceManager();
