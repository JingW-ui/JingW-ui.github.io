/**
 * 背景装饰物系统 - 大型太空物体（陨石、黑洞、空间站等）
 */
class BackgroundDecorations {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.decorations = [];
        this.decorationCount = 30; // 大幅增加到30个（之前是15个）
        this.init();
    }

    init() {
        this.resize();
        this.generateDecorations();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateDecorations() {
        this.decorations = [];
        
        const types = ['asteroid', 'asteroid', 'blackhole', 'spacestation', 'nebula_cloud'];
        
        for (let i = 0; i < this.decorationCount; i++) {
            const type = types[i % types.length];
            this.decorations.push(this.createDecoration(type, i));
        }
    }

    createDecoration(type, index) {
        const decoration = {
            type: type,
            x: Math.random() * this.canvas.width * 3 - this.canvas.width,
            y: Math.random() * this.canvas.height * 3 - this.canvas.height,
            size: this.getSizeByType(type),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            parallaxFactor: 0.05 + Math.random() * 0.1, // 视差系数
            alpha: 0.3 + Math.random() * 0.4,
            uniqueId: index
        };

        // 为陨石生成形状点
        if (type === 'asteroid') {
            decoration.points = [];
            const pointCount = Math.floor(Math.random() * 5) + 7;
            for (let i = 0; i < pointCount; i++) {
                decoration.points.push(0.7 + Math.random() * 0.3);
            }
        }

        return decoration;
    }

    getSizeByType(type) {
        switch (type) {
            case 'asteroid':
                return 40 + Math.random() * 60; // 40-100
            case 'blackhole':
                return 80 + Math.random() * 40; // 80-120
            case 'spacestation':
                return 60 + Math.random() * 40; // 60-100
            case 'nebula_cloud':
                return 100 + Math.random() * 100; // 100-200
            default:
                return 50;
        }
    }

    update(deltaTime, cameraX, cameraY) {
        for (const dec of this.decorations) {
            // 视差移动
            dec.x -= cameraX * dec.parallaxFactor * deltaTime * 10;
            dec.y -= cameraY * dec.parallaxFactor * deltaTime * 10;

            // 旋转
            dec.rotation += dec.rotationSpeed * deltaTime;

            // 边界循环 - 扩大范围以避免突然消失
            const margin = 300;
            if (dec.x < -this.canvas.width - margin) {
                dec.x += this.canvas.width * 3 + margin * 2;
            }
            if (dec.x > this.canvas.width * 2 + margin) {
                dec.x -= this.canvas.width * 3 + margin * 2;
            }
            if (dec.y < -this.canvas.height - margin) {
                dec.y += this.canvas.height * 3 + margin * 2;
            }
            if (dec.y > this.canvas.height * 2 + margin) {
                dec.y -= this.canvas.height * 3 + margin * 2;
            }
        }
    }

    render(ctx) {
        for (const dec of this.decorations) {
            ctx.save();
            ctx.translate(dec.x, dec.y);
            ctx.rotate(dec.rotation);
            ctx.globalAlpha = dec.alpha;

            switch (dec.type) {
                case 'asteroid':
                    this.renderAsteroid(ctx, dec);
                    break;
                case 'blackhole':
                    this.renderBlackHole(ctx, dec);
                    break;
                case 'spacestation':
                    this.renderSpaceStation(ctx, dec);
                    break;
                case 'nebula_cloud':
                    this.renderNebulaCloud(ctx, dec);
                    break;
            }

            ctx.restore();
        }
    }

    renderAsteroid(ctx, dec) {
        const r = dec.size;
        
        ctx.beginPath();
        const points = dec.points.length;
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 / points) * i;
            const radiusVariation = dec.points[i];
            const x = Math.cos(angle) * r * radiusVariation;
            const y = Math.sin(angle) * r * radiusVariation;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const gradient = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        gradient.addColorStop(0, '#6b7280');
        gradient.addColorStop(1, '#374151');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 陨石坑
        ctx.beginPath();
        ctx.arc(r * 0.3, r * 0.2, r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-r * 0.4, -r * 0.3, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();
    }

    renderBlackHole(ctx, dec) {
        const r = dec.size;

        // 外层吸积盘
        const accretionGradient = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.5);
        accretionGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        accretionGradient.addColorStop(0.3, 'rgba(147, 51, 234, 0.6)');
        accretionGradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.4)');
        accretionGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = accretionGradient;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 事件视界
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // 引力透镜效果
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }

    renderSpaceStation(ctx, dec) {
        const r = dec.size;

        // 主体圆环
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 8;
        ctx.stroke();

        // 内部结构
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 中心核心
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#e2e8f0';
        ctx.fill();

        // 太阳能板
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.fillRect(-r * 1.2, -r * 0.15, r * 0.5, r * 0.3);
        ctx.fillRect(r * 0.7, -r * 0.15, r * 0.5, r * 0.3);

        // 太阳能板边框
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-r * 1.2, -r * 0.15, r * 0.5, r * 0.3);
        ctx.strokeRect(r * 0.7, -r * 0.15, r * 0.5, r * 0.3);

        // 连接臂
        ctx.beginPath();
        ctx.moveTo(-r * 0.6, 0);
        ctx.lineTo(-r * 0.7, 0);
        ctx.moveTo(r * 0.6, 0);
        ctx.lineTo(r * 0.7, 0);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    renderNebulaCloud(ctx, dec) {
        const r = dec.size;

        // 多层星云云团
        const clouds = [
            { x: 0, y: 0, radius: r, color: 'rgba(99, 102, 241, 0.08)' },
            { x: r * 0.3, y: -r * 0.2, radius: r * 0.7, color: 'rgba(168, 85, 247, 0.06)' },
            { x: -r * 0.2, y: r * 0.3, radius: r * 0.6, color: 'rgba(6, 182, 212, 0.05)' }
        ];

        for (const cloud of clouds) {
            const gradient = ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius
            );
            gradient.addColorStop(0, cloud.color);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
