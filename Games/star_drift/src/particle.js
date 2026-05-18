/**
 * 粒子系统 - 用于爆炸、尾焰、特效等
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

    /**
     * 创建爆炸效果
     */
    createExplosion(x, y, color = '#ff6600', count = 20, speed = 3) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Utils.randomRange(-0.3, 0.3);
            const velocity = Utils.randomRange(speed * 0.5, speed * 1.5);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * velocity,
                Math.sin(angle) * velocity,
                color,
                Utils.randomRange(0.3, 0.8),
                Utils.randomRange(2, 6)
            ));
        }
    }

    /**
     * 创建引擎尾焰
     */
    createEngineTrail(x, y, angle, intensity = 1) {
        const count = Math.floor(2 * intensity);
        for (let i = 0; i < count; i++) {
            const spreadAngle = angle + Utils.randomRange(-0.3, 0.3);
            const speed = Utils.randomRange(1, 3);
            this.particles.push(new Particle(
                x + Utils.randomRange(-3, 3),
                y + Utils.randomRange(-3, 3),
                Math.cos(spreadAngle) * speed,
                Math.sin(spreadAngle) * speed,
                Utils.randomChoice(['#6366f1', '#818cf8', '#a5b4fc']),
                Utils.randomRange(0.2, 0.5),
                Utils.randomRange(2, 4),
                true
            ));
        }
    }

    /**
     * 创建击中火花
     */
    createHitSpark(x, y, color = '#ffff00') {
        for (let i = 0; i < 8; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(1, 4);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                Utils.randomRange(0.15, 0.4),
                Utils.randomRange(1, 3)
            ));
        }
    }

    /**
     * 创建星星收集特效
     */
    createCollectEffect(x, y) {
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const speed = Utils.randomRange(2, 5);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffcc00',
                Utils.randomRange(0.3, 0.7),
                Utils.randomRange(2, 5)
            ));
        }
    }

    /**
     * 创建护盾激活特效（蓝色力场）
     */
    createShieldEffect(x, y) {
        // 外层光环
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const speed = Utils.randomRange(1, 3);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#3b82f6',
                Utils.randomRange(0.5, 1.0),
                Utils.randomRange(3, 6)
            ));
        }
        
        // 内层闪光
        for (let i = 0; i < 10; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const dist = Utils.randomRange(0, 20);
            this.particles.push(new Particle(
                x + Math.cos(angle) * dist,
                y + Math.sin(angle) * dist,
                0, 0,
                '#60a5fa',
                Utils.randomRange(0.3, 0.6),
                Utils.randomRange(2, 4)
            ));
        }
    }

    /**
     * 创建自动避险特效（绿色气流）
     */
    createAutoDodgeEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(2, 6);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#10b981',
                Utils.randomRange(0.4, 0.8),
                Utils.randomRange(2, 5)
            ));
        }
    }

    /**
     * 创建能源恢复特效（青色闪电）
     */
    createEnergyEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(1, 4);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#22d3ee',
                Utils.randomRange(0.4, 0.8),
                Utils.randomRange(2, 4)
            ));
        }
        
        // 闪电状粒子
        for (let i = 0; i < 8; i++) {
            const offsetX = Utils.randomRange(-30, 30);
            const offsetY = Utils.randomRange(-30, 30);
            this.particles.push(new Particle(
                x + offsetX,
                y + offsetY,
                0, -2,
                '#06b6d4',
                Utils.randomRange(0.3, 0.6),
                Utils.randomRange(1, 3)
            ));
        }
    }

    /**
     * 创建生命恢复特效（绿色治疗）
     */
    createHealthEffect(x, y) {
        // 向上飘浮的治疗粒子
        for (let i = 0; i < 12; i++) {
            const offsetX = Utils.randomRange(-20, 20);
            this.particles.push(new Particle(
                x + offsetX,
                y,
                0, -3,
                '#10b981',
                Utils.randomRange(0.5, 1.0),
                Utils.randomRange(3, 6)
            ));
        }
        
        // 十字形光点
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            this.particles.push(new Particle(
                x + Math.cos(angle) * 15,
                y + Math.sin(angle) * 15,
                0, 0,
                '#34d399',
                Utils.randomRange(0.4, 0.7),
                Utils.randomRange(2, 4)
            ));
        }
    }

    /**
     * 创建导弹发射特效（橙色尾焰）
     */
    createMissileLaunchEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(2, 6);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#f59e0b',
                Utils.randomRange(0.3, 0.7),
                Utils.randomRange(3, 7)
            ));
        }
    }

    /**
     * 创建敌人死亡碎片
     */
    createDebris(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(1, 4);
            this.particles.push(new Debris(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                Utils.randomRange(0.5, 1.2)
            ));
        }
    }

    update(deltaTime) {
        // 限制粒子数量
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(deltaTime);
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            p.render(ctx);
        }
    }

    clear() {
        this.particles = [];
    }
}

/**
 * 单个粒子
 */
class Particle {
    constructor(x, y, vx, vy, color, lifeTime, size, isTrail = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.maxLife = lifeTime;
        this.life = lifeTime;
        this.size = size;
        this.isTrail = isTrail;
        this.drag = isTrail ? 0.95 : 0.98;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime * 60;
        this.y += this.vy * deltaTime * 60;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.life -= deltaTime;

        if (this.isTrail) {
            this.size *= 0.97;
        }
    }

    isDead() {
        return this.life <= 0 || this.size <= 0.5;
    }

    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 发光效果
        if (alpha > 0.5) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

/**
 * 碎片粒子 (带旋转)
 */
class Debris extends Particle {
    constructor(x, y, vx, vy, color, lifeTime) {
        super(x, y, vx, vy, color, lifeTime, Utils.randomRange(3, 8));
        this.rotation = Utils.randomRange(0, Math.PI * 2);
        this.rotationSpeed = Utils.randomRange(-5, 5);
        this.drag = 0.97;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += this.rotationSpeed * deltaTime;
    }

    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}
