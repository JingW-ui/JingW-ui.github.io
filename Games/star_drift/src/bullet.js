/**
 * 子弹类 - 支持五行属性系统
 */
class Bullet extends Entity {
    constructor(x, y, vx, vy, damage = 10, owner = 'player', bulletType = 'normal', element = 'metal') {
        super(x, y, 3);

        this.velocity.set(vx, vy);
        this.damage = damage;
        this.owner = owner; // 'player' 或 'enemy'
        this.lifeTime = 3; // 子弹存活时间
        this.maxLifeTime = 3;
        this.bulletType = bulletType; // 'normal', 'sniper', 'spread', 'missile', 'fighter', 'interceptor', 'destroyer', 'bomber', 'ray'
        this.element = element; // 'metal'(金), 'wood'(木), 'water'(水), 'fire'(火), 'earth'(土)

        // 导弹特殊属性
        this.target = null;           // 追踪目标
        this.turnRate = 3;            // 转向速率
        this.missileSpeed = 12;       // 导弹速度
        
        // 自动追踪属性（升级奖励）
        this.homing = false;          // 是否启用自动追踪
        this.homingStrength = 0.5;    // 追踪强度（0-1）
        
        // 细长特效属性（升级奖励）
        this.elongated = false;       // 是否为细长形状
        this.elongatedRatio = 2.5;    // 长宽比（长度/宽度）

        // 视觉效果
        this.trail = [];
        this.maxTrailLength = bulletType === 'sniper' ? 12 : (bulletType === 'missile' ? 15 : (bulletType === 'ray' ? 20 : 8));
        
        // 射线特殊属性
        this.rayLength = 0;         // 射线长度
        this.rayMaxLength = 800;    // 射线最大长度
        this.rayWidth = 4;          // 射线宽度
        this.penetrate = false;     // 是否穿透
        
        // 根据类型设置属性
        this.setupBulletProperties();
    }
    
    /**
     * 设置子弹属性（包括五行元素）
     */
    setupBulletProperties() {
        // 五行元素配置
        const elementConfig = {
            metal: {   // 金 - 穿透性强，金色
                color: '#fbbf24',
                glowColor: 'rgba(251, 191, 36, 0.5)',
                radius: 4,
                lifeTime: 3.5
            },
            wood: {    // 木 - 持续伤害，绿色
                color: '#10b981',
                glowColor: 'rgba(16, 185, 129, 0.5)',
                radius: 3.5,
                lifeTime: 3
            },
            water: {   // 水 - 减速效果，蓝色
                color: '#3b82f6',
                glowColor: 'rgba(59, 130, 246, 0.5)',
                radius: 3.5,
                lifeTime: 3.2
            },
            fire: {    // 火 - 爆炸伤害，红色
                color: '#ef4444',
                glowColor: 'rgba(239, 68, 68, 0.6)',
                radius: 4.5,
                lifeTime: 2.8
            },
            earth: {   // 土 - 高防御，棕色
                color: '#a16207',
                glowColor: 'rgba(161, 98, 7, 0.5)',
                radius: 5,
                lifeTime: 3.5
            }
        };
        
        const config = elementConfig[this.element] || elementConfig.metal;
        this.color = config.color;
        this.glowColor = config.glowColor;
        this.radius = config.radius;
        this.lifeTime = config.lifeTime;
        this.maxLifeTime = config.lifeTime;
        
        // 特殊类型覆盖
        if (this.bulletType === 'sniper') {
            this.radius = 4;
            this.color = '#10b981';
            this.glowColor = 'rgba(16, 185, 129, 0.4)';
            this.lifeTime = 4;
            this.maxLifeTime = 4;
        } else if (this.bulletType === 'missile') {
            this.radius = 5;
            this.color = '#f59e0b';
            this.glowColor = 'rgba(245, 158, 11, 0.6)';
            this.lifeTime = 5;
            this.maxLifeTime = 5;
        } else if (this.bulletType === 'ray') {
            // 射线子弹
            this.radius = 3;
            this.color = '#ec4899'; // 粉色射线
            this.glowColor = 'rgba(236, 72, 153, 0.7)';
            this.lifeTime = 0.5; // 射线存在时间短
            this.maxLifeTime = 0.5;
            this.penetrate = true; // 射线可以穿透
            this.rayMaxLength = 1000;
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        // 射线子弹特殊处理
        if (this.bulletType === 'ray') {
            // 射线立即计算长度并检测碰撞
            this.updateRay();
            this.lifeTime -= deltaTime;
            if (this.lifeTime <= 0) {
                this.active = false;
            }
            return;
        }

        // 导弹追踪逻辑（仅当有目标且目标存活时）
        if (this.bulletType === 'missile' && this.target && this.target.isAlive()) {
            // 计算到目标的方向
            const toTarget = Vector2.sub(this.target.position, this.position);
            const targetDir = toTarget.normalized();
            
            // 当前速度方向
            const currentDir = this.velocity.normalized();
            
            // 平滑转向目标
            const newDir = Vector2.add(
                Vector2.multiply(currentDir, 1 - this.turnRate * deltaTime),
                Vector2.multiply(targetDir, this.turnRate * deltaTime)
            ).normalized();
            
            // 更新速度
            this.velocity = Vector2.multiply(newDir, this.missileSpeed);
        }
        
        // 自动追踪逻辑（升级奖励）
        if (this.homing && this.owner === 'player') {
            // 找到最近的敌人
            const game = window.game;
            if (game && game.enemies) {
                let nearest = null;
                let nearestDist = Infinity;
                
                for (const enemy of game.enemies) {
                    if (!enemy.isAlive()) continue;
                    
                    const dist = this.position.distanceSquared(enemy.position);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearest = enemy;
                    }
                }
                
                // 如果有目标且在追踪范围内（500像素）
                if (nearest && nearestDist < 250000) {
                    const toTarget = Vector2.sub(nearest.position, this.position);
                    const targetDir = toTarget.normalized();
                    
                    // 当前速度方向
                    const currentDir = this.velocity.normalized();
                    
                    // 根据追踪强度平滑转向
                    const strength = this.homingStrength;
                    const newDir = Vector2.add(
                        Vector2.multiply(currentDir, 1 - strength),
                        Vector2.multiply(targetDir, strength)
                    ).normalized();
                    
                    // 保持原有速度大小
                    const speed = this.velocity.magnitude();
                    this.velocity = Vector2.multiply(newDir, speed);
                }
            }
        }

        // 更新位置
        this.position.add(Vector2.multiply(this.velocity, deltaTime * 60));

        // 更新轨迹（限制最大长度防止内存泄漏）
        this.trail.push({ x: this.position.x, y: this.position.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // 生命周期
        this.lifeTime -= deltaTime;
        if (this.lifeTime <= 0) {
            this.active = false;
        }
        
        // 边界检查：如果子弹飞出世界边界太远，销毁它
        if (window.game && window.game.worldBounds) {
            const bounds = window.game.worldBounds;
            const margin = 200; // 允许超出边界的距离
            if (this.position.x < bounds.left - margin || 
                this.position.x > bounds.right + margin ||
                this.position.y < bounds.top - margin || 
                this.position.y > bounds.bottom + margin) {
                this.active = false;
            }
        }
    }
    
    /**
     * 更新射线（立即计算碰撞）
     */
    updateRay() {
        // 计算射线方向
        const direction = this.velocity.normalized();
        
        // 射线起点和终点
        const startPos = this.position.clone();
        const endPos = Vector2.add(
            startPos,
            Vector2.multiply(direction, this.rayMaxLength)
        );
        
        // 保存射线数据用于渲染和碰撞检测
        this.rayStart = startPos;
        this.rayEnd = endPos;
        this.rayLength = this.rayMaxLength;
        
        // 注意：射线的实际碰撞检测在 game.js 的 checkRayCollision 中处理
    }

    render(ctx) {
        if (!this.active) return;

        // 射线特殊渲染
        if (this.bulletType === 'ray') {
            this.renderRay(ctx);
            return;
        }

        ctx.save();

        // 绘制轨迹（更细腻的尾迹）
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = (i / this.trail.length) * 0.5;
                const size = (i / this.trail.length) * this.radius * 0.8;

                ctx.globalAlpha = alpha;
                
                // 根据类型设置轨迹颜色
                let trailColor;
                if (this.bulletType === 'sniper') {
                    trailColor = '#10b981';
                } else if (this.bulletType === 'missile') {
                    trailColor = '#f59e0b';
                } else if (this.owner === 'player') {
                    trailColor = this.color || '#6366f1';
                } else {
                    // 敌人子弹轨迹颜色多样化
                    trailColor = this.getEnemyBulletTrailColor();
                }
                
                ctx.fillStyle = trailColor;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 绘制子弹主体
        ctx.globalAlpha = 1;

        // 核心颜色
        const coreColor = this.bulletType === 'sniper' ? '#34d399' :
            (this.owner === 'player' ? this.color : this.getEnemyBulletColor());
        
        // 细长特效子弹（升级奖励）
        if (this.elongated) {
            this.renderElongatedBullet(ctx, coreColor);
        } else if (this.bulletType === 'interceptor') {
            // 拦截机：细长型穿甲弹（椭圆形）
            ctx.fillStyle = coreColor;
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.8, this.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.ellipse(-1, -1, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (this.bulletType === 'destroyer') {
            // 毁灭者：重型炮弹（六边形）
            ctx.fillStyle = coreColor;
            ctx.beginPath();
            const sides = 6;
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const x = this.position.x + Math.cos(angle) * this.radius * 1.3;
                const y = this.position.y + Math.sin(angle) * this.radius * 1.3;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // 内部能量核心
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.bulletType === 'bomber') {
            // 轰炸机：爆炸弹（带光环的圆形）
            ctx.fillStyle = coreColor;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 外层光环（减弱）
            ctx.strokeStyle = `${this.color}66`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 1.8, 0, Math.PI * 2);
            ctx.stroke();
            
            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(this.position.x - 1, this.position.y - 1, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.bulletType === 'fighter') {
            // 战斗机：标准等离子弹（圆形+光晕）
            ctx.fillStyle = coreColor;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(this.position.x - 1, this.position.y - 1, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.owner === 'enemy') {
            // 敌人子弹：多样化样式
            this.renderEnemyBullet(ctx, coreColor);
        } else {
            // 默认：圆形子弹（五行元素样式）
            ctx.fillStyle = coreColor;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(this.position.x - 1, this.position.y - 1, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // 五行元素特殊效果
            this.renderElementEffect(ctx);
        }

        // 狙击子弹特殊效果
        if (this.bulletType === 'sniper') {
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 1.8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 导弹特殊效果
        if (this.bulletType === 'missile') {
            // 外层光环（减弱）
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
    
    /**
     * 渲染射线
     */
    renderRay(ctx) {
        if (!this.rayStart || !this.rayEnd) return;
        
        ctx.save();
        
        // 射线发光效果
        const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
        
        // 外层光晕
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = `rgba(236, 72, 153, ${0.6 * pulse})`;
        ctx.lineWidth = this.rayWidth * 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.rayStart.x, this.rayStart.y);
        ctx.lineTo(this.rayEnd.x, this.rayEnd.y);
        ctx.stroke();
        
        // 中层光线
        ctx.strokeStyle = `rgba(236, 72, 153, ${0.8 * pulse})`;
        ctx.lineWidth = this.rayWidth * 1.5;
        ctx.beginPath();
        ctx.moveTo(this.rayStart.x, this.rayStart.y);
        ctx.lineTo(this.rayEnd.x, this.rayEnd.y);
        ctx.stroke();
        
        // 核心光线
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.rayWidth;
        ctx.beginPath();
        ctx.moveTo(this.rayStart.x, this.rayStart.y);
        ctx.lineTo(this.rayEnd.x, this.rayEnd.y);
        ctx.stroke();
        
        // 起点光效
        ctx.fillStyle = `rgba(236, 72, 153, ${pulse})`;
        ctx.beginPath();
        ctx.arc(this.rayStart.x, this.rayStart.y, this.rayWidth * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 渲染五行元素特效
     */
    renderElementEffect(ctx) {
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        
        switch (this.element) {
            case 'metal':  // 金 - 金属光泽闪烁
                ctx.strokeStyle = `rgba(251, 191, 36, ${pulse * 0.6})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius * 1.5, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'wood':   // 木 - 绿叶环绕
                ctx.fillStyle = `rgba(16, 185, 129, ${pulse * 0.4})`;
                for (let i = 0; i < 3; i++) {
                    const angle = (Date.now() / 500) + (i * Math.PI * 2 / 3);
                    const x = this.position.x + Math.cos(angle) * this.radius * 1.8;
                    const y = this.position.y + Math.sin(angle) * this.radius * 1.8;
                    ctx.beginPath();
                    ctx.arc(x, y, this.radius * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'water':  // 水 - 水滴波纹
                ctx.strokeStyle = `rgba(59, 130, 246, ${pulse * 0.5})`;
                ctx.lineWidth = 1;
                for (let i = 1; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, this.radius * (1 + i * 0.5), 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
                
            case 'fire':   // 火 - 火焰粒子
                ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.5})`;
                for (let i = 0; i < 4; i++) {
                    const offsetX = (Math.random() - 0.5) * this.radius * 2;
                    const offsetY = (Math.random() - 0.5) * this.radius * 2;
                    ctx.beginPath();
                    ctx.arc(this.position.x + offsetX, this.position.y + offsetY, this.radius * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'earth':  // 土 - 岩石碎片
                ctx.fillStyle = `rgba(161, 98, 7, ${pulse * 0.4})`;
                for (let i = 0; i < 3; i++) {
                    const angle = (i * Math.PI * 2 / 3) + (Date.now() / 1000);
                    const x = this.position.x + Math.cos(angle) * this.radius * 1.6;
                    const y = this.position.y + Math.sin(angle) * this.radius * 1.6;
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
                break;
        }
    }
    
    /**
     * 获取敌人子弹颜色（根据敌人类型）
     */
    getEnemyBulletColor() {
        // 如果有enemyType属性，根据类型返回不同颜色
        if (this.enemyType) {
            const colorMap = {
                'basic': '#f87171',      // 红色
                'fast': '#fbbf24',       // 黄色
                'tank': '#dc2626',       // 深红
                'shooter': '#e879f9',    // 紫色
                'sniper': '#10b981',     // 绿色
                'swarmer': '#f97316',    // 橙色
                'scout': '#fbbf24',      // 黄色
                'cruiser': '#60a5fa',    // 蓝色
                'destroyer': '#f97316',  // 橙色
                'frigate': '#a78bfa',    // 淡紫
                'carrier': '#34d399',    // 青绿
                'interceptor': '#60a5fa', // 蓝色
                'battleship': '#ef4444',  // 红色
                'bomber': '#f97316',     // 橙色
                'stealth': '#a78bfa',    // 淡紫
                'support': '#34d399',    // 青绿
                'elite': '#fbbf24',      // 黄色
                'commander': '#ef4444',   // 红色
                'asteroid': '#9ca3af'     // 灰色（小行星）
            };
            return colorMap[this.enemyType] || '#f87171';
        }
        return '#f87171'; // 默认红色
    }
    
    /**
     * 获取敌人子弹轨迹颜色
     */
    getEnemyBulletTrailColor() {
        const baseColor = this.getEnemyBulletColor();
        // 轨迹颜色比主体颜色稍淡
        return baseColor;
    }
    
    /**
     * 渲染敌人子弹（多样化样式）
     */
    renderEnemyBullet(ctx, coreColor) {
        if (!this.enemyType) {
            // 默认敌人子弹：简单圆形
            ctx.fillStyle = coreColor;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 小高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.position.x - 1, this.position.y - 1, this.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        
        // 根据敌人类型渲染不同样式的子弹
        switch (this.enemyType) {
            case 'basic':
            case 'fast':
                // 基础敌人：小圆点
                ctx.fillStyle = coreColor;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'tank':
            case 'destroyer':
            case 'battleship':
                // 重型敌人：方形子弹
                ctx.fillStyle = coreColor;
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
                ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
                ctx.restore();
                
                // 中心亮点
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'shooter':
            case 'sniper':
                // 射击敌人：菱形子弹
                ctx.fillStyle = coreColor;
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
                ctx.beginPath();
                ctx.moveTo(0, -this.radius * 1.3);
                ctx.lineTo(this.radius * 0.8, 0);
                ctx.lineTo(0, this.radius * 1.3);
                ctx.lineTo(-this.radius * 0.8, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;
                
            case 'swarmer':
            case 'scout':
            case 'interceptor':
                // 快速敌人：细长椭圆
                ctx.fillStyle = coreColor;
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
                ctx.beginPath();
                ctx.ellipse(0, 0, this.radius * 1.5, this.radius * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                break;
                
            case 'cruiser':
            case 'frigate':
                // 中型敌人：三角形
                ctx.fillStyle = coreColor;
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
                ctx.beginPath();
                ctx.moveTo(this.radius * 1.2, 0);
                ctx.lineTo(-this.radius * 0.8, -this.radius * 0.9);
                ctx.lineTo(-this.radius * 0.8, this.radius * 0.9);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;
                
            case 'carrier':
            case 'support':
                // 支援敌人：十字形
                ctx.fillStyle = coreColor;
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
                
                // 横线
                ctx.fillRect(-this.radius * 1.2, -this.radius * 0.3, this.radius * 2.4, this.radius * 0.6);
                // 竖线
                ctx.fillRect(-this.radius * 0.3, -this.radius * 1.2, this.radius * 0.6, this.radius * 2.4);
                
                ctx.restore();
                break;
                
            case 'bomber':
                // 轰炸机：带环的圆形
                ctx.fillStyle = coreColor;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // 外环（减弱）
                ctx.strokeStyle = `${coreColor}66`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius * 1.6, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'stealth':
                // 隐形敌人：半透明小点
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = coreColor;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                break;
                
            case 'elite':
            case 'commander':
                // 精英敌人：星形
                ctx.fillStyle = coreColor;
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(Date.now() / 500); // 旋转效果
                
                const spikes = 5;
                const outerRadius = this.radius * 1.3;
                const innerRadius = this.radius * 0.6;
                
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI / spikes) * i;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;
                
            default:
                // 默认：圆形
                ctx.fillStyle = coreColor;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        // 所有敌人子弹都有小高光（但不发光）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.position.x - 1, this.position.y - 1, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * 渲染细长子弹
     */
    renderElongatedBullet(ctx, coreColor) {
        ctx.fillStyle = coreColor;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
        
        // 绘制细长的椭圆形子弹
        const length = this.radius * this.elongatedRatio;
        const width = this.radius * 0.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(-length * 0.3, -width * 0.3, length * 0.4, width * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾部拖尾光效（减弱）
        ctx.fillStyle = `${coreColor}44`;
        ctx.beginPath();
        ctx.ellipse(-length * 0.6, 0, length * 0.3, width * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
