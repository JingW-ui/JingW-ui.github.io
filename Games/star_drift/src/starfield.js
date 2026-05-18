/**
 * 星空背景系统 - 纯深色太空背景 + 星云效果
 */
class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.init();
    }

    init() {
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update(deltaTime, cameraX, cameraY) {
        // 不需要更新星星，只更新星云动画
    }

    render() {
        const ctx = this.ctx;
        const time = Date.now() / 1000;

        // 深空背景色
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制远处的星云效果
        this.renderNebula(ctx, time);
    }

    renderNebula(ctx, time) {
        // 星云效果 - 缓慢飘动营造氛围
        const nebulas = [
            { x: this.canvas.width * 0.2 + Math.sin(time * 0.1) * 30, y: this.canvas.height * 0.3, color: 'rgba(79, 70, 229, 0.04)', radius: 200 },
            { x: this.canvas.width * 0.7 + Math.cos(time * 0.08) * 40, y: this.canvas.height * 0.6, color: 'rgba(168, 85, 247, 0.03)', radius: 250 },
            { x: this.canvas.width * 0.5 + Math.sin(time * 0.12) * 25, y: this.canvas.height * 0.2, color: 'rgba(6, 182, 212, 0.03)', radius: 180 },
            { x: this.canvas.width * 0.3 + Math.cos(time * 0.09) * 35, y: this.canvas.height * 0.7, color: 'rgba(99, 102, 241, 0.03)', radius: 220 }
        ];

        for (const nebula of nebulas) {
            const gradient = ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(
                nebula.x - nebula.radius,
                nebula.y - nebula.radius,
                nebula.radius * 2,
                nebula.radius * 2
            );
        }
    }
}
