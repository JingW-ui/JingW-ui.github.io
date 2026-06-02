/**
 * 3D 星空背景系统 - 星际穿梭风格
 * 基于 background.html 的 3D 透视星空效果
 * 4000颗星星 + 视差跟随相机 + 闪烁 + 高速拖尾
 */

const STAR_COLORS = [
    '#ffffff', '#e8f4f8', '#d4eeff', '#fff4e6',
    '#ffe8d6', '#ffd4a3', '#b8e6ff', '#c4d4ff',
    '#e0c8ff', '#ffc8e0'
];

class Star {
    constructor() {
        this.reset(true);
    }

    reset(randomZ = false) {
        this.x = (Math.random() - 0.5) * 4000;
        this.y = (Math.random() - 0.5) * 4000;
        this.z = randomZ ? Math.random() * 4000 : 4000;

        this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        this.size = Math.random() * 1.5 + 0.5;
        this.brightness = Math.random() * 0.5 + 0.5;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
    }

    update(dt, speed) {
        this.z -= speed * dt * 60;
        if (this.z <= 1) {
            this.reset();
        }
        this.twinklePhase += this.twinkleSpeed * dt * 60;
    }

    draw(ctx, width, height, offsetX, offsetY, speed) {
        const FOV = 300;
        const centerX = width / 2;
        const centerY = height / 2;

        const scale = FOV / this.z;
        const sx = this.x * scale + centerX + offsetX * scale * 0.5;
        const sy = this.y * scale + centerY + offsetY * scale * 0.5;

        // 视锥剔除
        if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) return;

        // 距离淡出
        const distanceFade = Math.min(1, (4000 - this.z) / 2000);
        const twinkle = 0.7 + 0.3 * Math.sin(this.twinklePhase);
        const alpha = this.brightness * distanceFade * twinkle;

        // 拖尾长度
        const trailLength = Math.min(100, speed * 3 * scale);

        ctx.globalAlpha = alpha;

        // 高速拖尾（仅当速度较高时）
        if (speed > 8 && trailLength > 5) {
            const trailScale = FOV / (this.z + trailLength);
            const tx = this.x * trailScale + centerX + offsetX * trailScale * 0.5;
            const ty = this.y * trailScale + centerY + offsetY * trailScale * 0.5;

            const gradient = ctx.createLinearGradient(sx, sy, tx, ty);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.size * scale * 0.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
        }

        // 星星本体
        const drawSize = this.size * scale;
        if (drawSize > 0.3) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(sx, sy, drawSize, 0, Math.PI * 2);
            ctx.fill();

            // 大星星光晕
            if (drawSize > 2) {
                ctx.globalAlpha = alpha * 0.3;
                ctx.beginPath();
                ctx.arc(sx, sy, drawSize * 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
    }
}

class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.starCount = 4000;
        this.speed = 2;
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        this.resize();
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push(new Star());
        }

        // 监听鼠标，营造轻微视差效果
        document.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            this.mouseX = (e.clientX - cx) * 0.3;
            this.mouseY = (e.clientY - cy) * 0.3;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * 每帧更新
     * @param {number} deltaTime - 帧间隔（秒）
     * @param {number} cameraX - 相机世界X
     * @param {number} cameraY - 相机世界Y
     * @param {number} [gameSpeed] - 游戏速度（影响星星流速），默认2
     */
    update(deltaTime, cameraX, cameraY, gameSpeed) {
        // 游戏速度影响星空流速
        this.speed = gameSpeed !== undefined ? Math.max(2, gameSpeed) : 2;

        // 相机偏移作为视差偏移
        const parallaxFactor = 0.15;
        const offsetX = -cameraX * parallaxFactor + this.mouseX;
        const offsetY = -cameraY * parallaxFactor + this.mouseY;

        // 按 z 排序（远的先画）
        this.stars.sort((a, b) => b.z - a.z);

        for (const star of this.stars) {
            star.update(deltaTime, this.speed);
        }

        // 缓存给 render 用
        this._offsetX = offsetX;
        this._offsetY = offsetY;
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 纯黑背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // 绘制所有星星
        const offsetX = this._offsetX || 0;
        const offsetY = this._offsetY || 0;

        for (const star of this.stars) {
            star.draw(ctx, w, h, offsetX, offsetY, this.speed);
        }

        // 叠加淡星云氛围（保留一点原星云味道）
        this._renderNebula(ctx);
    }

    _renderNebula() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const time = Date.now() / 1000;

        const nebulas = [
            { x: w * 0.15 + Math.sin(time * 0.05) * 30, y: h * 0.25, color: 'rgba(79, 70, 229, 0.025)', radius: 220 },
            { x: w * 0.75 + Math.cos(time * 0.04) * 40, y: h * 0.65, color: 'rgba(168, 85, 247, 0.02)', radius: 260 },
            { x: w * 0.5 + Math.sin(time * 0.06) * 25, y: h * 0.15, color: 'rgba(6, 182, 212, 0.02)', radius: 200 }
        ];

        for (const n of nebulas) {
            const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            gradient.addColorStop(0, n.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
        }
    }
}
