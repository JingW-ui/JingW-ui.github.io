/**
 * 巡航导弹类 - 支持5种不同类型的导弹
 * 004: 范围伤害 (AOE)
 * 006: 穿透伤害 (连续穿过3个敌人，伤害递减)
 * 011: 范围+穿透组合
 * 013: 裂变加速弹 (快速摧毁就近敌人)
 * 023: 终极导弹 (范围+穿透10敌人+裂变加速)
 */
class CruiseMissile extends Entity {
    constructor(x, y, target, missileType = '004', owner = 'player') {
        super(x, y, 8);
        
        // 导弹类型
        this.missileType = missileType;
        this.owner = owner;
        
        // 追踪目标
        this.target = target;
        
        // 基础属性
        this.speed = 10;
        this.turnRate = 4;
        this.damage = 30;
        this.lifeTime = 8;
        this.maxLifeTime = 8;
        
        // 根据导弹类型设置特殊属性
        this.setupMissileProperties();
        
        // 加载对应的导弹图片
        this.loadMissileImage();
        
        // 视觉效果
        this.trail = [];
        this.maxTrailLength = 15;
        
        // 穿透相关
        this.pierceCount = 0;
        this.maxPierceCount = 0;
        this.hitEnemies = new Set(); // 记录已击中的敌人ID
        
        // 裂变相关
        this.hasFissioned = false;
        this.fissionMissiles = [];
        
        // 爆炸相关
        this.hasExploded = false;
        this.explosionRadius = 0;
    }
    
    /**
     * 根据导弹类型设置属性
     */
    setupMissileProperties() {
        switch (this.missileType) {
            case '004':
                // 范围伤害导弹
                this.color = '#f59e0b';
                this.glowColor = 'rgba(245, 158, 11, 0.6)';
                this.explosionRadius = 80;
                this.damage = 40;
                this.speed = 9;
                this.imageKey = 'missile_004';
                break;
                
            case '006':
                // 穿透导弹（可穿过3个敌人）
                this.color = '#3b82f6';
                this.glowColor = 'rgba(59, 130, 246, 0.6)';
                this.maxPierceCount = 3;
                this.damage = 35;
                this.speed = 11;
                this.imageKey = 'missile_006';
                break;
                
            case '011':
                // 范围+穿透组合
                this.color = '#a855f7';
                this.glowColor = 'rgba(168, 85, 247, 0.6)';
                this.explosionRadius = 60;
                this.maxPierceCount = 2;
                this.damage = 30;
                this.speed = 10;
                this.imageKey = 'missile_011';
                break;
                
            case '013':
                // 裂变加速弹
                this.color = '#ef4444';
                this.glowColor = 'rgba(239, 68, 68, 0.7)';
                this.damage = 25;
                this.speed = 14;
                this.fissionRange = 150; // 裂变触发距离
                this.fissionCount = 3; // 裂变数量
                this.imageKey = 'missile_013';
                break;
                
            case '023':
                // 终极导弹（范围+穿透10+裂变）
                this.color = '#ec4899';
                this.glowColor = 'rgba(236, 72, 153, 0.8)';
                this.explosionRadius = 100;
                this.maxPierceCount = 10;
                this.damage = 50;
                this.speed = 12;
                this.fissionRange = 120;
                this.fissionCount = 4;
                this.imageKey = 'missile_023';
                break;
                
            default:
                this.color = '#f59e0b';
                this.glowColor = 'rgba(245, 158, 11, 0.6)';
                this.imageKey = 'missile_004';
        }
    }
    
    update(deltaTime, enemies) {
        if (!this.active) return;
        
        // 更新生命周期
        this.lifeTime -= deltaTime;
        if (this.lifeTime <= 0) {
            this.explode(enemies);
            return;
        }
        
        // 追踪逻辑
        if (this.target && this.target.isAlive()) {
            this.trackTarget(deltaTime);
        } else {
            // 如果目标死亡，寻找最近的敌人
            this.findNewTarget(enemies);
        }
        
        // 更新位置
        this.position.add(Vector2.multiply(this.velocity, deltaTime * 60));
        
        // 更新轨迹
        this.updateTrail();
        
        // 检测碰撞
        this.checkCollisions(enemies);
        
        // 裂变检测（013和023导弹）
        if ((this.missileType === '013' || this.missileType === '023') && !this.hasFissioned) {
            this.checkFission(enemies);
        }
    }
    
    /**
     * 追踪目标
     */
    trackTarget(deltaTime) {
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
        this.velocity = Vector2.multiply(newDir, this.speed);
    }
    
    /**
     * 寻找新目标
     */
    findNewTarget(enemies) {
        let nearest = null;
        let nearestDistSq = Infinity;
        const searchRadiusSq = 40000; // 200像素范围的平方值
        
        for (const enemy of enemies) {
            if (!enemy.isAlive() || this.hitEnemies.has(enemy)) continue;
            
            const distSq = this.position.distanceSquared(enemy.position);
            if (distSq < nearestDistSq && distSq < searchRadiusSq) {
                nearestDistSq = distSq;
                nearest = enemy;
            }
        }
        
        if (nearest) {
            this.target = nearest;
        }
    }
    
    /**
     * 更新尾迹
     */
    updateTrail() {
        this.trail.push({ x: this.position.x, y: this.position.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    /**
     * 检测碰撞
     */
    checkCollisions(enemies) {
        if (this.hasExploded) return;
        
        for (const enemy of enemies) {
            if (!enemy.isAlive() || this.hitEnemies.has(enemy)) continue;
            
            if (this.checkCollision(enemy)) {
                this.hitEnemy(enemy, enemies);
                
                // 如果不是穿透导弹，击中后立即爆炸
                if (this.maxPierceCount === 0) {
                    this.explode(enemies);
                    return;
                }
                
                // 如果达到最大穿透数，爆炸并退出循环
                if (this.pierceCount >= this.maxPierceCount && this.maxPierceCount > 0) {
                    this.explode(enemies);
                    return;
                }
            }
        }
    }
    
    /**
     * 击中敌人
     */
    hitEnemy(enemy, allEnemies) {
        // 计算伤害（穿透导弹伤害递减）
        let damage = this.damage;
        if (this.pierceCount > 0) {
            damage = this.damage * Math.pow(0.6, this.pierceCount); // 每次穿透伤害降低40%
        }
        
        // 造成伤害
        const died = enemy.takeDamage(damage);
        
        // 记录已击中的敌人
        this.hitEnemies.add(enemy);
        this.pierceCount++;
        
        // 粒子特效
        if (window.game && window.game.particles) {
            window.game.particles.createHitSpark(this.position.x, this.position.y);
        }
        
        // 如果敌人死亡
        if (died) {
            this.handleEnemyDeath(enemy, allEnemies);
        }
        
        // 检查是否达到最大穿透数
        if (this.pierceCount >= this.maxPierceCount && this.maxPierceCount > 0) {
            this.explode(allEnemies);
        }
    }
    
    /**
     * 处理敌人死亡
     */
    handleEnemyDeath(enemy, allEnemies) {
        if (!window.game) return;
        
        // 创建爆炸特效
        window.game.particles.createExplosion(
            enemy.position.x,
            enemy.position.y,
            enemy.color,
            15
        );
        window.game.particles.createDebris(
            enemy.position.x,
            enemy.position.y,
            enemy.color
        );
        
        // 增加分数和击杀数
        if (this.owner === 'player' && window.game.player) {
            window.game.player.addScore(enemy.scoreValue);
            window.game.player.addKill();
            // 注意：不在这里给经验，经验通过收集经验球获得
            // 避免双重经验获取（敌人死亡给经验 + 收集经验球再给经验）
            
            // 掉落收集物
            window.game.spawnCollectibles(enemy.position, enemy.type);
        }
    }
    
    /**
     * 裂变检测
     */
    checkFission(enemies) {
        // 计算附近敌人数量
        let nearbyEnemies = [];
        
        for (const enemy of enemies) {
            if (!enemy.isAlive() || this.hitEnemies.has(enemy)) continue;
            
            const dist = this.position.distance(enemy.position);
            if (dist < this.fissionRange) {
                nearbyEnemies.push(enemy);
            }
        }
        
        // 如果附近有足够敌人，触发裂变
        if (nearbyEnemies.length >= 2 && !this.hasFissioned) {
            this.fission(nearbyEnemies, enemies);
        }
    }
    
    /**
     * 裂变
     */
    fission(nearbyEnemies, allEnemies) {
        this.hasFissioned = true;
        
        // 创建裂被子弹
        const fissionSpeed = this.speed * 1.5;
        
        for (let i = 0; i < this.fissionCount && i < nearbyEnemies.length; i++) {
            const target = nearbyEnemies[i];
            const direction = Vector2.sub(target.position, this.position).normalized();
            const velocity = Vector2.multiply(direction, fissionSpeed);
            
            const fissionMissile = new CruiseMissile(
                this.position.x,
                this.position.y,
                target,
                this.missileType,
                this.owner
            );
            
            fissionMissile.velocity = velocity;
            fissionMissile.damage = this.damage * 0.7; // 裂变导弹伤害降低30%
            fissionMissile.speed = fissionSpeed;
            fissionMissile.hasFissioned = true; // 防止再次裂变
            
            this.fissionMissiles.push(fissionMissile);
            
            // 添加到游戏中
            if (window.game) {
                window.game.cruiseMissiles.push(fissionMissile);
            }
        }
        
        // 原导弹消失
        this.active = false;
        
        // 裂变特效
        if (window.game && window.game.particles) {
            window.game.particles.createExplosion(
                this.position.x,
                this.position.y,
                this.color,
                20
            );
        }
    }
    
    /**
     * 爆炸（范围伤害）
     */
    explode(enemies) {
        if (this.hasExploded) return;
        this.hasExploded = true;
        
        // 如果有爆炸半径，造成范围伤害
        if (this.explosionRadius > 0) {
            // 记录已处理的敌人，防止重复计算
            const processedEnemies = new Set();
            
            for (const enemy of enemies) {
                if (!enemy.isAlive()) continue;
                
                const dist = this.position.distance(enemy.position);
                if (dist < this.explosionRadius) {
                    // 距离越近伤害越高
                    const damageMultiplier = 1 - (dist / this.explosionRadius);
                    const damage = this.damage * damageMultiplier;
                    
                    const died = enemy.takeDamage(damage);
                    
                    // 粒子特效
                    if (window.game && window.game.particles) {
                        window.game.particles.createHitSpark(enemy.position.x, enemy.position.y);
                    }
                    
                    // 使用敌人对象本身作为标识，防止重复处理
                    if (died && !processedEnemies.has(enemy)) {
                        processedEnemies.add(enemy);
                        this.handleEnemyDeath(enemy, enemies);
                    }
                }
            }
            
            // 爆炸特效
            if (window.game && window.game.particles) {
                window.game.particles.createExplosion(
                    this.position.x,
                    this.position.y,
                    this.color,
                    25
                );
            }
        }
        
        this.active = false;
    }
    
    /**
     * 加载导弹图片
     */
    loadMissileImage() {
        try {
            if (window.resourceManager && window.resourceManager.hasImage(this.imageKey)) {
                this.missileImage = window.resourceManager.getImage(this.imageKey);
            } else {
                this.missileImage = null;
                console.warn(`Missile image not found: ${this.imageKey}`);
            }
        } catch (error) {
            console.error(`Error loading missile image ${this.imageKey}:`, error);
            this.missileImage = null;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // 绘制尾迹
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = (i / this.trail.length) * 0.6;
                const size = (i / this.trail.length) * this.radius;
                
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
        
        // 如果有导弹图片，使用图片渲染
        if (this.missileImage) {
            // 计算缩放比例（保持导弹大小一致）- 放大2倍
            const scale = (this.radius * 4.0) / Math.max(this.missileImage.width, this.missileImage.height);
            const drawWidth = this.missileImage.width * scale;
            const drawHeight = this.missileImage.height * scale;
            
            // 旋转以匹配导弹方向
            const angle = Math.atan2(this.velocity.y, this.velocity.x);
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(angle + Math.PI / 2); // 调整角度使图片正确朝向
            
            // 绘制图片（居中）
            ctx.drawImage(
                this.missileImage,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
        } else {
            // 如果没有图片，使用原有的Canvas绘制作为后备
            // 发光效果
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.glowColor;
            
            // 导弹主体
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 内部高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.position.x - 2, this.position.y - 2, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // 外层光环
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 1.8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
