/**
 * 玩家飞船类 - 包含能源系统、等级系统、战舰选择
 */
class Player extends Entity {
    constructor(x, y, shipType = 'fighter') {
        super(x, y, 18);

        // 战舰类型
        this.shipType = shipType;
        this.setupShipType();
        
        // 加载对应的SVG图片
        this.loadShipImage();

        // 基础属性
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 1.5;

        // 能源系统
        this.maxEnergy = 100;
        this.energy = this.maxEnergy;
        this.energyRegenRate = 8; // 每秒恢复量
        this.energyCostPerShot = 5; // 每发子弹能耗

        // 自动瞄准
        this.autoAim = true;
        this.aimTarget = null;
        this.aimAngle = 0;

        // 射击
        this.fireRate = 0.15;
        this.fireTimer = 0;
        this.bulletSpeed = 15;
        this.bulletDamage = 10;
        
        // 子弹特殊属性
        this.bulletSplitCount = 1;  // 子弹裂变数量（1=普通，2=双发，4=四发）
        this.bulletType = 'normal'; // 子弹类型：'normal', 'ray'（射线）

        // 等级系统
        this.level = 1;
        this.experience = 0;
        // 经验值配置（可通过调参界面调整）
        this.expConfig = {
            initialExp: 150,           // 初始经验需求
            expGrowthRate: 1.35,       // 经验增长系数
            expFromScoreRatio: 0.05    // 得分转经验的比例（scoreValue * ratio）- 降低到0.05
        };
        this.expToNextLevel = this.expConfig.initialExp;
        this.skillPoints = 0;

        // 保存基础属性（用于百分比计算）
        this.baseMaxHealth = this.maxHealth;
        this.baseMaxEnergy = this.maxEnergy;
        this.baseMaxSpeed = this.maxSpeed;
        this.baseFireRate = this.fireRate;
        this.baseRotationSpeed = this.rotationSpeed;

        // 升级属性加成
        this.levelBonuses = {
            healthBonus: 0,
            energyBonus: 0,
            damageBonus: 0,
            speedBonus: 0,
            rotationSpeedBonus: 0
        };

        // 视觉
        this.thrustIntensity = 0;
        this.thrustVisual = 0;
        this.thrustAngle = Math.PI; // 尾焰角度，初始向下
        this.hitFlash = 0;
        
        // 移动优化
        this.driftFactor = 0; // 漂移程度（用于特效）
        this.lastVelocity = Vector2.zero(); // 上一帧速度（计算急转弯）

        // 得分
        this.score = 0;
        this.kills = 0;
        this.highScore = Utils.loadData('highScore', 0);

        // 背包系统
        this.inventory = {
            energyCrystals: 0,      // 能源水晶（恢复30能源）
            scrapMetal: 0,          // 废金属（恢复15生命）
            rareMinerals: 0,        // 稀有矿物（恢复25生命+20能源）
            missile: 0,             // 导弹（高伤害追踪弹）
            shield: 0,              // 护盾（短暂无敌）
            autoDodge: 0,           // 自动避险（临时自动躲避）
            // 巡航导弹背包
            cruiseMissiles: {       // 巡航导弹库存
                '004': 0,           // 范围伤害导弹
                '006': 0,           // 穿透导弹
                '011': 0,           // 范围+穿透导弹
                '013': 0,           // 裂变加速导弹
                '023': 0            // 终极导弹
            },
            unlockedMissiles: ['004'] // 已解锁的导弹类型（02级默认解锁004）
        };

        // 道具效果状态
        this.autoDodgeActive = false;   // 自动避险是否激活
        this.autoDodgeTimer = 0;        // 自动避险剩余时间
        
        // 巡航导弹自动发射（需要升级解锁）
        this.cruiseMissileEnabled = false;  // 巡航导弹自动发射是否启用（默认关闭，需要升级解锁）
        this.cruiseMissileFireRate = 1.5;   // 导弹发射间隔（秒）
        this.cruiseMissileTimer = 0;        // 导弹发射计时器
        this.currentMissileType = '004';    // 当前装备的导弹类型
    }

    setupShipType() {
        const shipConfigs = {
            fighter: {
                maxHealth: 100,
                maxEnergy: 100,
                maxSpeed: 12,  // 提升：8 → 12
                accelerationForce: 0.6,  // 提升：0.4 → 0.6
                fireRate: 0.15,
                bulletSpeed: 15,
                bulletDamage: 12,
                energyCostPerShot: 5,
                energyRegenRate: 10,
                rotationSpeed: 5,
                color: '#6366f1',
                imageKey: 'our1'
            },
            interceptor: {
                maxHealth: 70,
                maxEnergy: 80,
                maxSpeed: 16,  // 提升：12 → 16
                accelerationForce: 0.8,  // 提升：0.6 → 0.8
                fireRate: 0.1,
                bulletSpeed: 18,
                bulletDamage: 8,
                energyCostPerShot: 4,
                energyRegenRate: 12,
                rotationSpeed: 7,
                color: '#06b6d4',
                imageKey: 'our2'
            },
            destroyer: {
                maxHealth: 150,
                maxEnergy: 120,
                maxSpeed: 8,  // 提升：5 → 8
                accelerationForce: 0.4,  // 提升：0.25 → 0.4
                fireRate: 0.25,
                bulletSpeed: 12,
                bulletDamage: 20,
                energyCostPerShot: 8,
                energyRegenRate: 6,
                rotationSpeed: 3,
                color: '#a855f7',
                imageKey: 'our3'
            },
            bomber: {
                maxHealth: 120,
                maxEnergy: 150,
                maxSpeed: 9,  // 提升：6 → 9
                accelerationForce: 0.5,  // 提升：0.3 → 0.5
                fireRate: 0.35,
                bulletSpeed: 10,
                bulletDamage: 25,
                energyCostPerShot: 12,
                energyRegenRate: 8,
                rotationSpeed: 4,
                color: '#f59e0b',
                imageKey: 'our4'
            }
        };

        const config = shipConfigs[this.shipType] || shipConfigs.fighter;
        this.maxHealth = config.maxHealth;
        this.health = config.maxHealth;
        this.maxEnergy = config.maxEnergy;
        this.energy = config.maxEnergy;
        this.maxSpeed = config.maxSpeed;
        this.accelerationForce = config.accelerationForce;
        this.fireRate = config.fireRate;
        this.bulletSpeed = config.bulletSpeed;
        this.bulletDamage = config.bulletDamage;
        this.energyCostPerShot = config.energyCostPerShot;
        this.energyRegenRate = config.energyRegenRate;
        this.rotationSpeed = config.rotationSpeed;
        this.shipColor = config.color;
        this.shipImageKey = config.imageKey;
    }

    /**
     * 加载飞船SVG图片
     */
    loadShipImage() {
        if (window.resourceManager && window.resourceManager.hasImage(this.shipImageKey)) {
            this.shipImage = window.resourceManager.getImage(this.shipImageKey);
        } else {
            this.shipImage = null;
        }
    }

    update(deltaTime, input, enemies, worldBounds) {
        if (!this.active) return;

        // 自动避险逻辑
        if (this.autoDodgeActive) {
            this.updateAutoDodge(enemies, deltaTime);
        }

        // 处理移动输入
        const moveVector = input.getMoveVector();
        if (moveVector.magnitude() > 0.1) {
            // 优化：加速度根据速度调整（高速时加速度降低）
            const speedRatio = this.velocity.magnitude() / this.maxSpeed;
            const accelerationMultiplier = 1 - (speedRatio * 0.3); // 高速时加速度降低30%
            
            const thrust = Vector2.multiply(moveVector, this.accelerationForce * accelerationMultiplier);
            this.applyForce(thrust);
            this.thrustIntensity = moveVector.magnitude();
        } else {
            this.thrustIntensity = 0;
        }

        // 保存上一帧速度用于漂移计算
        this.lastVelocity = this.velocity.clone();

        // 更新物理 (优化：0.78 惯性衰减，更流畅的滑行)
        this.updatePhysics(deltaTime, 0.78);

        // 限制最大速度
        this.velocity.limit(this.maxSpeed);
        
        // 计算漂移程度（速度方向与加速度方向的夹角）
        if (moveVector.magnitude() > 0.1 && this.velocity.magnitude() > 1) {
            const velocityDir = this.velocity.normalized();
            const inputDir = moveVector.normalized();
            const dotProduct = Vector2.dot(velocityDir, inputDir);
            // dot product < 0 表示反向，= 1 表示同向
            this.driftFactor = Math.max(0, 1 - dotProduct); // 0-1范围
        } else {
            this.driftFactor *= 0.9; // 逐渐衰减
        }

        // 处理瞄准
        if (this.autoAim) {
            this.updateAutoAim(enemies);
        } else {
            const aimAngle = input.getAimAngle();
            if (aimAngle !== null) {
                this.aimAngle = aimAngle;
            }
        }

        // 平滑转向 - 船头朝向瞄准方向
        this.angle = Utils.lerpAngle(this.angle, this.aimAngle, deltaTime * this.rotationSpeed);

        // 尾焰角度 - 与飞船朝向相反（需要减去Math.PI/2，因为渲染时加了Math.PI/2）
        this.thrustAngle = this.angle + Math.PI / 2;

        // 射击计时器
        this.fireTimer -= deltaTime;
        if (this.fireTimer <= 0) {
            this.fireTimer = 0;
        }

        // 能源恢复
        this.regenerateEnergy(deltaTime);

        // 无敌时间
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.invincibleTimer = 0;
            }
        }

        // 受击闪烁
        if (this.hitFlash > 0) {
            this.hitFlash -= deltaTime;
        }

        // 自动避险倒计时
        if (this.autoDodgeActive) {
            this.autoDodgeTimer -= deltaTime;
            if (this.autoDodgeTimer <= 0) {
                this.autoDodgeActive = false;
                this.autoDodgeTimer = 0;
            }
        }

        // 巡航导弹自动发射计时器
        this.cruiseMissileTimer -= deltaTime;
        
        // 尝试自动发射巡航导弹（只有解锁后才能自动发射）
        if (this.cruiseMissileEnabled && this.cruiseMissileTimer <= 0 && this.canFireCruiseMissile()) {
            this.fireCruiseMissile();
        }
        
        // 推力视觉效果衰减
        this.thrustVisual = Utils.lerp(this.thrustVisual, this.thrustIntensity, deltaTime * 10);

        // 世界边界处理
        this.handleWorldBounds(worldBounds);
        
        // 生成高速粒子拖尾（速度>50%时）
        const speedRatio = this.velocity.magnitude() / this.maxSpeed;
        if (speedRatio > 0.5 && Math.random() < 0.3) {
            this.createSpeedTrail();
        }
        
        // 生成漂移火花（急转弯时）
        if (this.driftFactor > 0.5 && Math.random() < 0.4) {
            this.createDriftSparks();
        }
    }

    /**
     * 能源恢复
     */
    regenerateEnergy(deltaTime) {
        if (this.energy < this.getMaxEnergy()) {
            this.energy = Math.min(
                this.getMaxEnergy(),
                this.energy + this.energyRegenRate * deltaTime
            );
        }
    }

    /**
     * 获取最大血量（含等级加成）
     */
    getMaxHealth() {
        // maxHealth 已经在升级时更新，直接返回
        return this.maxHealth;
    }

    /**
     * 获取最大能源（含等级加成）
     */
    getMaxEnergy() {
        // maxEnergy 已经在升级时更新，直接返回
        return this.maxEnergy;
    }

    /**
     * 获取子弹伤害（含等级加成）
     */
    getBulletDamage() {
        return this.bulletDamage + this.levelBonuses.damageBonus;
    }

    /**
     * 获取最大速度（含等级加成）
     */
    getMaxSpeed() {
        return this.maxSpeed + this.levelBonuses.speedBonus;
    }

    /**
     * 自动瞄准最近敌人
     */
    updateAutoAim(enemies) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const enemy of enemies) {
            if (!enemy.isAlive()) continue;

            const dist = this.position.distanceSquared(enemy.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        if (nearest) {
            this.aimTarget = nearest;
            this.aimAngle = this.position.angleTo(nearest.position);
        } else {
            // 没有目标时，保持当前朝向或朝向前进方向
            this.aimTarget = null;
            if (this.velocity.magnitude() > 0.1) {
                this.aimAngle = this.velocity.angle();
            }
        }
    }

    /**
     * 自动避险 - 远离最近的敌人
     */
    updateAutoDodge(enemies, deltaTime) {
        let nearest = null;
        let nearestDist = Infinity;

        // 找到最近的敌人
        for (const enemy of enemies) {
            if (!enemy.isAlive()) continue;

            const dist = this.position.distanceSquared(enemy.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        if (nearest && nearestDist < 10000) { // 只在100像素内触发
            // 计算远离敌人的方向
            const awayDir = Vector2.sub(this.position, nearest.position).normalized();
            
            // 施加强大的推力
            const dodgeForce = Vector2.multiply(awayDir, this.accelerationForce * 3);
            this.applyForce(dodgeForce);
            
            // 更新瞄准方向（面向逃跑方向）
            this.aimAngle = awayDir.angle();
        }
    }

    /**
     * 尝试射击（需要手动触发）
     */
    tryShoot() {
        // 无敌模式：无限弹药，不消耗能源
        if (this.invincible && this.invincibleTimer === Infinity) {
            if (this.fireTimer <= 0) {
                this.fireTimer = this.fireRate;
                return this.createBullet();
            }
            return null;
        }

        // 正常模式：检查能源是否足够
        if (this.energy < this.energyCostPerShot) {
            return null;
        }

        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireRate;
            this.energy -= this.energyCostPerShot;
            
            // 创建普通子弹
            const bullets = this.createBullet();
            
            return bullets;
        }
        return null;
    }

    /**
     * 创建子弹（支持五行元素和多种发射模式）
     */
    createBullet() {
        const bullets = [];
        
        // 根据飞船类型确定默认五行元素
        let defaultElement = 'metal';
        let bulletType = 'normal';
        let bulletColor = this.shipColor;
        
        switch (this.shipType) {
            case 'fighter':
                // 战斗机：金元素 - 标准等离子弹
                defaultElement = 'metal';
                bulletType = 'fighter';
                bulletColor = '#fbbf24';
                break;
            case 'interceptor':
                // 拦截机：水元素 - 高速穿甲弹
                defaultElement = 'water';
                bulletType = 'interceptor';
                bulletColor = '#3b82f6';
                break;
            case 'destroyer':
                // 毁灭者：土元素 - 重型炮弹
                defaultElement = 'earth';
                bulletType = 'destroyer';
                bulletColor = '#a16207';
                break;
            case 'bomber':
                // 轰炸机：火元素 - 爆炸弹
                defaultElement = 'fire';
                bulletType = 'bomber';
                bulletColor = '#ef4444';
                break;
        }
        
        // 根据等级解锁不同的发射模式
        const fireMode = this.getFireMode();
        
        switch (fireMode) {
            case 'single':
                // 单发
                bullets.push(this.createSingleBullet(defaultElement, bulletType, bulletColor));
                break;
                
            case 'double':
                // 双发（左右各一）
                bullets.push(this.createDoubleBullet(defaultElement, bulletType, bulletColor));
                break;
                
            case 'triple':
                // 三发（扇形）
                bullets.push(...this.createTripleBullet(defaultElement, bulletType, bulletColor));
                break;
                
            case 'spread':
                // 散射（5发）
                bullets.push(...this.createSpreadBullet(defaultElement, bulletType, bulletColor));
                break;
                
            case 'spiral':
                // 螺旋发射（8发）
                bullets.push(...this.createSpiralBullet(defaultElement, bulletType, bulletColor));
                break;
        }
        
        // 返回单个子弹或第一个子弹（兼容旧代码）
        return bullets.length === 1 ? bullets[0] : bullets;
    }
    
    /**
     * 获取当前发射模式（根据等级解锁）
     */
    getFireMode() {
        if (this.level >= 20) return 'spiral';   // 20级：螺旋
        if (this.level >= 15) return 'spread';   // 15级：散射
        if (this.level >= 10) return 'triple';   // 10级：三发
        if (this.level >= 5) return 'double';    // 5级：双发
        return 'single';                          // 1-4级：单发
    }
    
    /**
     * 创建单发子弹（支持裂变和射线）
     */
    createSingleBullet(element, bulletType, color) {
        const bullets = [];
        
        // 如果是射线模式
        if (this.bulletType === 'ray') {
            const spawnOffset = Vector2.fromAngle(this.angle, this.radius + 5);
            const spawnPos = Vector2.add(this.position, spawnOffset);
            const velocity = Vector2.fromAngle(this.angle, this.bulletSpeed * 1.5); // 射线速度更快
            
            const bullet = new Bullet(
                spawnPos.x, spawnPos.y,
                velocity.x, velocity.y,
                this.getBulletDamage() * 0.8, // 射线伤害略低
                'player',
                'ray', // 射线类型
                element
            );
            bullet.color = color;
            return bullet;
        }
        
        // 普通子弹或裂被子弹
        const splitCount = this.bulletSplitCount;
        
        if (splitCount === 1) {
            // 单发
            const spawnOffset = Vector2.fromAngle(this.angle, this.radius + 5);
            const spawnPos = Vector2.add(this.position, spawnOffset);
            const velocity = Vector2.fromAngle(this.angle, this.bulletSpeed);
            
            const bullet = new Bullet(
                spawnPos.x, spawnPos.y,
                velocity.x, velocity.y,
                this.getBulletDamage(),
                'player',
                bulletType,
                element
            );
            bullet.color = color;
            // 应用子弹特效（如自动追踪）
            this.applyBulletEffects(bullet);
            bullets.push(bullet);
        } else {
            // 裂变子弹（扇形分布）
            const spreadAngle = 0.3; // 总散射角度
            const startAngle = this.angle - spreadAngle / 2;
            const angleStep = spreadAngle / (splitCount - 1);
            
            for (let i = 0; i < splitCount; i++) {
                const angle = startAngle + (i * angleStep);
                const spawnOffset = Vector2.fromAngle(angle, this.radius + 5);
                const spawnPos = Vector2.add(this.position, spawnOffset);
                const velocity = Vector2.fromAngle(angle, this.bulletSpeed);
                
                const bullet = new Bullet(
                    spawnPos.x, spawnPos.y,
                    velocity.x, velocity.y,
                    this.getBulletDamage(),
                    'player',
                    bulletType,
                    element
                );
                bullet.color = color;
                // 应用子弹特效（如自动追踪）
                this.applyBulletEffects(bullet);
                bullets.push(bullet);
            }
        }
        
        return bullets.length === 1 ? bullets[0] : bullets;
    }
    
    /**
     * 创建双发子弹（左右偏移）
     */
    createDoubleBullet(element, bulletType, color) {
        const offsetAngle = 0.15; // 偏移角度（弧度）
        const bullets = [];
        
        // 左子弹
        const leftAngle = this.angle - offsetAngle;
        const leftSpawn = Vector2.add(
            this.position,
            Vector2.fromAngle(leftAngle, this.radius + 5)
        );
        const leftVel = Vector2.fromAngle(leftAngle, this.bulletSpeed);
        const leftBullet = new Bullet(
            leftSpawn.x, leftSpawn.y,
            leftVel.x, leftVel.y,
            this.getBulletDamage(),
            'player',
            bulletType,
            element
        );
        leftBullet.color = color;
        this.applyBulletEffects(leftBullet);
        bullets.push(leftBullet);
        
        // 右子弹
        const rightAngle = this.angle + offsetAngle;
        const rightSpawn = Vector2.add(
            this.position,
            Vector2.fromAngle(rightAngle, this.radius + 5)
        );
        const rightVel = Vector2.fromAngle(rightAngle, this.bulletSpeed);
        const rightBullet = new Bullet(
            rightSpawn.x, rightSpawn.y,
            rightVel.x, rightVel.y,
            this.getBulletDamage(),
            'player',
            bulletType,
            element
        );
        rightBullet.color = color;
        this.applyBulletEffects(rightBullet);
        bullets.push(rightBullet);
        
        return bullets;
    }
    
    /**
     * 创建三发子弹（扇形）
     */
    createTripleBullet(element, bulletType, color) {
        const spreadAngle = 0.2; // 扇形角度
        const bullets = [];
        
        for (let i = -1; i <= 1; i++) {
            const angle = this.angle + (i * spreadAngle);
            const spawnPos = Vector2.add(
                this.position,
                Vector2.fromAngle(angle, this.radius + 5)
            );
            const velocity = Vector2.fromAngle(angle, this.bulletSpeed);
            
            const bullet = new Bullet(
                spawnPos.x, spawnPos.y,
                velocity.x, velocity.y,
                this.getBulletDamage(),
                'player',
                bulletType,
                element
            );
            bullet.color = color;
            this.applyBulletEffects(bullet);
            bullets.push(bullet);
        }
        
        return bullets;
    }
    
    /**
     * 创建散射子弹（5发）
     */
    createSpreadBullet(element, bulletType, color) {
        const spreadAngle = 0.3; // 总散射角度
        const bulletCount = 5;
        const bullets = [];
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = this.angle - spreadAngle + (i * (spreadAngle * 2 / (bulletCount - 1)));
            const spawnPos = Vector2.add(
                this.position,
                Vector2.fromAngle(angle, this.radius + 5)
            );
            const velocity = Vector2.fromAngle(angle, this.bulletSpeed);
            
            const bullet = new Bullet(
                spawnPos.x, spawnPos.y,
                velocity.x, velocity.y,
                this.getBulletDamage(),
                'player',
                bulletType,
                element
            );
            bullet.color = color;
            this.applyBulletEffects(bullet);
            bullets.push(bullet);
        }
        
        return bullets;
    }
    
    /**
     * 创建螺旋子弹（8发）
     */
    createSpiralBullet(element, bulletType, color) {
        const bulletCount = 8;
        const bullets = [];
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 / bulletCount) * i + (Date.now() / 1000); // 旋转效果
            const spawnPos = Vector2.add(
                this.position,
                Vector2.fromAngle(angle, this.radius + 5)
            );
            const velocity = Vector2.fromAngle(angle, this.bulletSpeed * 0.9);
            
            const bullet = new Bullet(
                spawnPos.x, spawnPos.y,
                velocity.x, velocity.y,
                this.getBulletDamage(),
                'player',
                bulletType,
                element
            );
            bullet.color = color;
            this.applyBulletEffects(bullet);
            bullets.push(bullet);
        }
        
        return bullets;
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        if (!this.active) return false;

        // 无敌模式：保留特效但不扣血
        if (this.invincible) {
            this.hitFlash = 0.2; // 仍然显示受击闪烁特效
            return false; // 不死亡
        }

        this.health -= damage;
        this.hitFlash = 0.2;

        if (this.health <= 0) {
            this.health = 0;
            this.active = false;
            this.saveHighScore();
            return true;
        }

        this.invincible = true;
        this.invincibleTimer = this.invincibleDuration;

        return false;
    }

    /**
     * 恢复生命
     */
    heal(amount) {
        this.health = Math.min(this.getMaxHealth(), this.health + amount);
    }

    /**
     * 恢复能源
     */
    rechargeEnergy(amount) {
        this.energy = Math.min(this.getMaxEnergy(), this.energy + amount);
    }

    /**
     * 添加经验值
     */
    addExperience(exp) {
        const oldLevel = this.level;
        this.experience += exp;
        let hasItemReward = false;
        let leveledUp = false;
        while (this.experience >= this.expToNextLevel) {
            this.experience -= this.expToNextLevel;
            const itemReward = this.levelUp();
            if (itemReward) {
                hasItemReward = true;
            }
            leveledUp = true; // 标记已升级
        }
        
        // 调试日志：显示经验获取和升级信息
        if (exp > 0) {
            console.log(`📊 获得经验: +${exp.toFixed(1)} | 当前: ${this.experience.toFixed(0)}/${this.expToNextLevel} | 等级: Lv.${oldLevel}→Lv.${this.level}`);
        }
        
        return leveledUp; // 返回是否升级（而不是是否有物品奖励）
    }

    /**
     * 升级 - 返回升级选项供玩家选择（随机生成）
     */
    getLevelUpOptions() {
        // 所有可能的升级选项池
        const allOptions = [
            // 子弹属性升级
            {
                id: 'freeze',
                name: '冰冻效果',
                description: '子弹有几率冻结敌人',
                icon: '❄️',
                type: 'bullet_effect',
                effect: 'freeze',
                value: 0.3,
                weight: 1 // 权重
            },
            {
                id: 'homing',
                name: '追踪导弹',
                description: '子弹自动追踪最近敌人',
                icon: '🎯',
                type: 'bullet_effect',
                effect: 'homing',
                value: true,
                weight: 3 // 提高权重：更容易抽到
            },
            {
                id: 'burn',
                name: '燃烧效果',
                description: '子弹造成持续燃烧伤害',
                icon: '🔥',
                type: 'bullet_effect',
                effect: 'burn',
                value: { duration: 3, damagePerSec: 5 },
                weight: 1
            },
            {
                id: 'short_circuit',
                name: '短路效果',
                description: '子弹使敌人武器失效2秒',
                icon: '⚡',
                type: 'bullet_effect',
                effect: 'short_circuit',
                value: 2,
                weight: 1
            },
            {
                id: 'ricochet',
                name: '弹射效果',
                description: '子弹在敌人间弹射2次',
                icon: '🔄',
                type: 'bullet_effect',
                effect: 'ricochet',
                value: 2,
                weight: 1
            },
            {
                id: 'elongated',
                name: '细长子弹',
                description: '子弹变为细长的激光束形状',
                icon: '💠',
                type: 'bullet_effect',
                effect: 'elongated',
                value: 2.5,
                weight: 1
            },
            
            // 飞船属性升级
            {
                id: 'speed_boost',
                name: '速度提升',
                description: '+15% 最大移动速度',
                icon: '💨',
                type: 'ship_attribute',
                attribute: 'speed',
                value: 0.15,
                weight: 1
            },
            {
                id: 'energy_boost',
                name: '能量提升',
                description: '+20% 最大能量值',
                icon: '⚡',
                type: 'ship_attribute',
                attribute: 'energy',
                value: 0.20,
                weight: 1
            },
            {
                id: 'control_boost',
                name: '操控提升',
                description: '+25% 转向速度',
                icon: '🎮',
                type: 'ship_attribute',
                attribute: 'rotationSpeed',
                value: 0.25,
                weight: 1
            },
            {
                id: 'health_boost',
                name: '生命提升',
                description: '+25 最大生命值',
                icon: '❤️',
                type: 'ship_attribute',
                attribute: 'health',
                value: 25,
                weight: 1
            },
            {
                id: 'damage_boost',
                name: '伤害提升',
                description: '+20% 子弹伤害',
                icon: '💥',
                type: 'ship_attribute',
                attribute: 'damage',
                value: 0.20,
                weight: 1
            },
            {
                id: 'fire_rate_boost',
                name: '射速提升',
                description: '+15% 射击频率',
                icon: '🔫',
                type: 'ship_attribute',
                attribute: 'fireRate',
                value: 0.15,
                weight: 1
            },
            
            // 特殊能力 - 提高子弹裂变权重
            {
                id: 'split2',
                name: '子弹裂变 ×2',
                description: '每次发射2颗子弹',
                icon: '🔱',
                type: 'bullet_split',
                value: 2,
                weight: 3 // 提高权重：更容易抽到
            },
            {
                id: 'split3',
                name: '子弹裂变 ×3',
                description: '每次发射3颗子弹',
                icon: '⚡',
                type: 'bullet_split',
                value: 3,
                weight: 2 // 提高权重：更容易抽到
            },
            {
                id: 'ray',
                name: '射线模式',
                description: '子弹变为穿透射线',
                icon: '✨',
                type: 'bullet_type',
                value: 'ray',
                weight: 1
            },
            
            // 巡航导弹解锁选项
            {
                id: 'unlock_006',
                name: '解锁006导弹',
                description: '穿透导弹 - 连续穿过3个敌人',
                icon: '🚀',
                type: 'missile_unlock',
                missileType: '006',
                weight: 1
            },
            {
                id: 'unlock_011',
                name: '解锁011导弹',
                description: '范围+穿透组合导弹',
                icon: '💣',
                type: 'missile_unlock',
                missileType: '011',
                weight: 1
            },
            {
                id: 'unlock_013',
                name: '解锁013导弹',
                description: '裂变加速弹 - 快速摧毁就近敌人',
                icon: '⚡',
                type: 'missile_unlock',
                missileType: '013',
                weight: 1
            },
            {
                id: 'unlock_023',
                name: '解锁023终极导弹',
                description: '终极导弹 - 范围+穿透10+裂变',
                icon: '🌟',
                type: 'missile_unlock',
                missileType: '023',
                weight: 1
            },
            
            // 巡航导弹类型切换
            {
                id: 'switch_006',
                name: '切换到006导弹',
                description: '穿透导弹 - 连续穿过3个敌人',
                icon: '🚀',
                type: 'missile_switch',
                missileType: '006',
                weight: 1
            },
            {
                id: 'switch_011',
                name: '切换到011导弹',
                description: '范围+穿透组合导弹',
                icon: '💣',
                type: 'missile_switch',
                missileType: '011',
                weight: 1
            },
            {
                id: 'switch_013',
                name: '切换到013导弹',
                description: '裂变加速弹 - 快速摧毁就近敌人',
                icon: '⚡',
                type: 'missile_switch',
                missileType: '013',
                weight: 1
            },
            {
                id: 'switch_023',
                name: '切换到023终极导弹',
                description: '终极导弹 - 范围+穿透10+裂变',
                icon: '🌟',
                type: 'missile_switch',
                missileType: '023',
                weight: 1
            }
        ];
        
        // 使用权重随机选择3-4个选项
        const optionCount = Utils.randomInt(3, 4);
        const selectedOptions = [];
        const usedIndices = new Set();
        
        while (selectedOptions.length < optionCount) {
            // 加权随机选择
            const totalWeight = allOptions.reduce((sum, opt, idx) => {
                return usedIndices.has(idx) ? sum : sum + (opt.weight || 1);
            }, 0);
            
            let random = Math.random() * totalWeight;
            let selectedIndex = -1;
            
            for (let i = 0; i < allOptions.length; i++) {
                if (usedIndices.has(i)) continue;
                
                const weight = allOptions[i].weight || 1;
                random -= weight;
                
                if (random <= 0) {
                    selectedIndex = i;
                    break;
                }
            }
            
            // 如果没选中（理论上不会发生），使用普通随机
            if (selectedIndex === -1) {
                selectedIndex = Utils.randomInt(0, allOptions.length - 1);
                while (usedIndices.has(selectedIndex)) {
                    selectedIndex = Utils.randomInt(0, allOptions.length - 1);
                }
            }
            
            usedIndices.add(selectedIndex);
            selectedOptions.push(allOptions[selectedIndex]);
        }
        
        return selectedOptions;
    }
    
    /**
     * 应用升级选项
     */
    applyUpgradeOption(option) {
        console.log('应用升级:', option.name);
        
        switch (option.type) {
            case 'bullet_effect':
                // 添加子弹特效
                if (!this.bulletEffects) {
                    this.bulletEffects = [];
                }
                this.bulletEffects.push({
                    effect: option.effect,
                    value: option.value
                });
                console.log(`添加子弹特效: ${option.effect}`);
                break;
                
            case 'ship_attribute':
                // 提升飞船属性
                if (option.attribute === 'speed') {
                    // 速度：基于基础速度的百分比提升
                    const bonusIncrease = this.baseMaxSpeed * option.value;
                    this.levelBonuses.speedBonus += bonusIncrease;
                    console.log(`速度提升: +${bonusIncrease.toFixed(1)} (总加成: ${this.levelBonuses.speedBonus.toFixed(1)})`);
                } else if (option.attribute === 'energy') {
                    // 能量：基于基础能量的百分比提升
                    const bonusIncrease = this.baseMaxEnergy * option.value;
                    this.levelBonuses.energyBonus += bonusIncrease;
                    this.maxEnergy = this.baseMaxEnergy + this.levelBonuses.energyBonus;
                    this.energy = Math.min(this.energy + bonusIncrease, this.maxEnergy);
                    console.log(`能量提升: +${bonusIncrease.toFixed(0)} (总加成: ${this.levelBonuses.energyBonus.toFixed(0)})`);
                } else if (option.attribute === 'rotationSpeed') {
                    // 转向速度：基于基础转向速度的百分比提升
                    const bonusIncrease = this.baseRotationSpeed * option.value;
                    this.levelBonuses.rotationSpeedBonus += bonusIncrease;
                    console.log(`操控提升: +${bonusIncrease.toFixed(1)} (总加成: ${this.levelBonuses.rotationSpeedBonus.toFixed(1)})`);
                } else if (option.attribute === 'health') {
                    // 生命值：固定值提升
                    this.levelBonuses.healthBonus += option.value;
                    this.maxHealth = this.baseMaxHealth + this.levelBonuses.healthBonus;
                    this.health = Math.min(this.health + option.value, this.maxHealth);
                    console.log(`生命值提升: +${option.value} (总加成: ${this.levelBonuses.healthBonus})`);
                } else if (option.attribute === 'damage') {
                    // 伤害：基于基础伤害的百分比提升
                    const bonusIncrease = this.bulletDamage * option.value;
                    this.levelBonuses.damageBonus += bonusIncrease;
                    console.log(`伤害提升: +${bonusIncrease.toFixed(1)} (总加成: ${this.levelBonuses.damageBonus.toFixed(1)})`);
                } else if (option.attribute === 'fireRate') {
                    // 射速：减少射击间隔（百分比提升）
                    this.fireRate *= (1 - option.value);
                    console.log(`射速提升: +${(option.value * 100).toFixed(0)}% (新间隔: ${this.fireRate.toFixed(3)}s)`);
                }
                break;
                
            case 'bullet_split':
                // 子弹裂变可叠加：在现有基础上增加
                this.bulletSplitCount += option.value;
                console.log(`子弹裂变增加 +${option.value}，当前: ${this.bulletSplitCount}`);
                break;
                
            case 'bullet_type':
                this.bulletType = option.value;
                console.log(`子弹类型设置为: ${option.value}`);
                break;
                
            case 'missile_unlock':
                // 解锁新的导弹类型
                if (this.unlockMissile(option.missileType)) {
                    console.log(`成功解锁导弹: ${option.missileType}`);
                } else {
                    console.log(`导弹 ${option.missileType} 已解锁`);
                }
                break;
                
            case 'missile_switch':
                // 切换导弹类型（需要先解锁）
                if (this.inventory.unlockedMissiles.includes(option.missileType)) {
                    this.currentMissileType = option.missileType;
                    console.log(`切换到 ${option.missileType} 号导弹`);
                } else {
                    console.log(`导弹 ${option.missileType} 尚未解锁`);
                }
                break;
        }
        
        // 消耗1个技能点
        if (this.skillPoints > 0) {
            this.skillPoints--;
            console.log(`技能点剩余: ${this.skillPoints}`);
        }
    }
    
    /**
     * 应用子弹特效到子弹对象
     */
    applyBulletEffects(bullet) {
        if (!this.bulletEffects || !bullet) return;
        
        for (const effect of this.bulletEffects) {
            switch (effect.effect) {
                case 'homing':
                    // 自动追踪
                    bullet.homing = true;
                    bullet.homingStrength = effect.value || 0.5;
                    break;
                case 'elongated':
                    // 细长特效
                    bullet.elongated = true;
                    bullet.elongatedRatio = effect.value || 2.5;
                    break;
                // 其他特效可以在这里添加
                // case 'freeze':
                // case 'burn':
                // case 'short_circuit':
                // case 'ricochet':
            }
        }
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.skillPoints++;
        // 使用配置的增长系数
        this.expToNextLevel = Math.floor(this.expToNextLevel * this.expConfig.expGrowthRate);

        // 升级基础奖励
        this.maxHealth += 10;
        this.health += 10;
        this.maxEnergy += 5;
        this.energy += 5;
        
        // 每级自动提升速度（基础速度的3%）
        const speedIncrease = this.maxSpeed * 0.03;
        this.levelBonuses.speedBonus += speedIncrease;
        
        let hasItemReward = false;
        
        // 02级默认解锁004导弹，并启用自动发射功能
        if (this.level === 2) {
            this.unlockMissile('004');
            this.cruiseMissileEnabled = true;  // 启用巡航导弹自动发射
            console.log('🚀 等级2奖励：解锁004范围导弹 + 启用自动发射功能');
            hasItemReward = true;
        }
        
        // 每3级奖励道具
        if (this.level % 3 === 0) {
            this.inventory.missile += 2;      // +2导弹
            this.inventory.shield += 1;       // +1护盾
            hasItemReward = true;
            console.log(`🎁 等级${this.level}奖励：2导弹 + 1护盾`);
        }
        
        // 每5级额外奖励
        if (this.level % 5 === 0) {
            this.inventory.autoDodge += 1;    // +1自动避险
            this.inventory.rareMinerals += 3; // +3稀有矿物
            hasItemReward = true;
            console.log(`🎉 等级${this.level}大奖：1避险 + 3矿物`);
        }
        
        console.log(`⬆️ 升级到 Lv.${this.level}！速度+${speedIncrease.toFixed(1)}`);
        
        return hasItemReward;
    }

    /**
     * 使用技能点升级属性
     */
    upgradeAttribute(attribute) {
        if (this.skillPoints <= 0) return false;

        switch (attribute) {
            case 'health':
                this.levelBonuses.healthBonus += 20;
                this.health += 20;
                break;
            case 'energy':
                this.levelBonuses.energyBonus += 15;
                this.energy += 15;
                break;
            case 'damage':
                this.levelBonuses.damageBonus += 3;
                break;
            case 'speed':
                this.levelBonuses.speedBonus += 0.5;
                break;
            default:
                return false;
        }

        this.skillPoints--;
        return true;
    }

    /**
     * 添加物品到背包
     */
    addItem(itemType, amount = 1) {
        if (this.inventory[itemType] !== undefined) {
            this.inventory[itemType] += amount;
            return true;
        }
        return false;
    }

    /**
     * 使用物品
     */
    useItem(itemType) {
        if (this.inventory[itemType] > 0) {
            this.inventory[itemType]--;

            switch (itemType) {
                case 'energyCrystals':
                    this.rechargeEnergy(30);
                    break;
                case 'scrapMetal':
                    this.heal(15);
                    break;
                case 'rareMinerals':
                    this.heal(25);
                    this.rechargeEnergy(20);
                    break;
                case 'missile':
                    // 导弹效果在game.js中处理（需要发射）
                    return 'missile';
                case 'shield':
                    // 短暂无敌5秒
                    this.setInvincible(5);
                    break;
                case 'autoDodge':
                    // 自动避险10秒
                    this.autoDodgeActive = true;
                    this.autoDodgeTimer = 10;
                    break;
            }
            return true;
        }
        return false;
    }

    /**
     * 保存最高分
     */
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            Utils.saveData('highScore', this.highScore);
        }
    }

    /**
     * 设置无敌
     */
    setInvincible(duration = Infinity) {
        this.invincible = true;
        if (duration !== Infinity) {
            this.invincibleTimer = duration;
        } else {
            this.invincibleTimer = Infinity;
        }
    }

    /**
     * 取消无敌
     */
    clearInvincible() {
        this.invincible = false;
        this.invincibleTimer = 0;
    }

    /**
     * 处理世界边界
     */
    handleWorldBounds(bounds) {
        const margin = this.radius;

        if (this.position.x < bounds.left + margin) {
            this.position.x = bounds.left + margin;
            this.velocity.x = Math.abs(this.velocity.x) * 0.5;
        }
        if (this.position.x > bounds.right - margin) {
            this.position.x = bounds.right - margin;
            this.velocity.x = -Math.abs(this.velocity.x) * 0.5;
        }
        if (this.position.y < bounds.top + margin) {
            this.position.y = bounds.top + margin;
            this.velocity.y = Math.abs(this.velocity.y) * 0.5;
        }
        if (this.position.y > bounds.bottom - margin) {
            this.position.y = bounds.bottom - margin;
            this.velocity.y = -Math.abs(this.velocity.y) * 0.5;
        }
    }

    /**
     * 获取生命值百分比
     */
    getHealthPercent() {
        return this.health / this.getMaxHealth();
    }

    /**
     * 获取能源百分比
     */
    getEnergyPercent() {
        return this.energy / this.getMaxEnergy();
    }

    /**
     * 获取经验百分比
     */
    getExpPercent() {
        return this.experience / this.expToNextLevel;
    }

    /**
     * 添加得分
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * 增加击杀数
     */
    addKill() {
        this.kills++;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // 无敌闪烁效果（仅非无限无敌时显示）
        if (this.invincible && this.invincibleTimer !== Infinity && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // 受击红色闪烁
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
        }

        // 绘制引擎尾焰 - 在船身之前绘制，使用独立旋转
        if (this.thrustVisual > 0.1) {
            this.renderEngineTrail(ctx);
        }

        // 绘制飞船主体 - 旋转到瞄准方向
        ctx.rotate(this.angle + Math.PI / 2);
        this.renderShipBody(ctx);

        ctx.restore();
        
        // 绘制护盾光环（如果激活且不是无限无敌）
        if (this.invincible && this.invincibleTimer !== Infinity) {
            this.renderShieldGlow(ctx);
        }
        
        // 绘制自动避险特效（如果激活）
        if (this.autoDodgeActive) {
            this.renderAutoDodgeEffect(ctx);
        }
    }

    renderShipBody(ctx) {
        const r = this.radius;
        const color = this.shipColor || '#6366f1';

        // 如果有SVG图片，使用图片渲染
        if (this.shipImage) {
            // 计算缩放比例（保持飞船大小一致）- 放大2倍
            const scale = (r * 5.0) / Math.max(this.shipImage.width, this.shipImage.height);
            const drawWidth = this.shipImage.width * scale;
            const drawHeight = this.shipImage.height * scale;
            
            // 绘制图片（居中）
            ctx.drawImage(
                this.shipImage,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
            return;
        }

        // 如果没有图片，使用原有的Canvas绘制作为后备
        // 根据战舰类型绘制不同形状
        switch (this.shipType) {
            case 'interceptor':
                this.renderInterceptor(ctx, r, color);
                break;
            case 'destroyer':
                this.renderDestroyer(ctx, r, color);
                break;
            case 'bomber':
                this.renderBomber(ctx, r, color);
                break;
            default:
                this.renderFighter(ctx, r, color);
        }
    }

    renderFighter(ctx, r, color) {
        // 标准战斗机 - 科幻三角翼设计
        
        // 外层能量场（脉冲效果）
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.save();
        ctx.shadowBlur = 25 * pulse;
        ctx.shadowColor = '#6366f1';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.3);
        ctx.lineTo(-r * 0.9, r * 0.7);
        ctx.lineTo(-r * 0.4, r * 0.5);
        ctx.lineTo(0, r * 0.4);
        ctx.lineTo(r * 0.4, r * 0.5);
        ctx.lineTo(r * 0.9, r * 0.7);
        ctx.closePath();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        
        // 主体船身
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.2);
        ctx.lineTo(-r * 0.8, r * 0.6);
        ctx.lineTo(0, r * 0.3);
        ctx.lineTo(r * 0.8, r * 0.6);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -r * 1.2, 0, r * 0.6);
        gradient.addColorStop(0, '#e0e7ff');
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, '#3730a3');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 边框高光
        ctx.strokeStyle = '#c7d2fe';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 驾驶舱（椭圆形，发光）
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a5b4fc';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.3, r * 0.2, r * 0.35, 0, 0, Math.PI * 2);
        const cockpitGrad = ctx.createRadialGradient(0, -r * 0.3, 0, 0, -r * 0.3, r * 0.35);
        cockpitGrad.addColorStop(0, '#ffffff');
        cockpitGrad.addColorStop(1, '#818cf8');
        ctx.fillStyle = cockpitGrad;
        ctx.fill();
        ctx.restore();
        
        // 两侧翼尖推进器
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#6366f1';
        ctx.fillStyle = '#a5b4fc';
        ctx.beginPath();
        ctx.arc(-r * 0.75, r * 0.55, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.75, r * 0.55, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 中心能量线
        ctx.strokeStyle = 'rgba(165, 180, 252, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.8);
        ctx.lineTo(0, r * 0.3);
        ctx.stroke();
    }

    renderInterceptor(ctx, r, color) {
        // 拦截机 - 极速流线型双翼设计
        
        // 等离子尾迹光晕（动态）
        const trailPulse = Math.sin(Date.now() / 150) * 0.2 + 0.8;
        ctx.save();
        ctx.shadowBlur = 20 * trailPulse;
        ctx.shadowColor = '#06b6d4';
        ctx.globalAlpha = 0.5;
        // 外层速度场
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.5);
        ctx.lineTo(-r * 0.5, r * 0.4);
        ctx.lineTo(-r * 0.7, r * 0.9);
        ctx.lineTo(0, r * 0.6);
        ctx.lineTo(r * 0.7, r * 0.9);
        ctx.lineTo(r * 0.5, r * 0.4);
        ctx.closePath();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        
        // 主体船身（尖锐流线型）
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.4);
        ctx.lineTo(-r * 0.4, r * 0.3);
        ctx.lineTo(-r * 0.6, r * 0.8);
        ctx.lineTo(0, r * 0.5);
        ctx.lineTo(r * 0.6, r * 0.8);
        ctx.lineTo(r * 0.4, r * 0.3);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -r * 1.4, 0, r * 0.8);
        gradient.addColorStop(0, '#cffafe');
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, '#164e63');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 边框高光
        ctx.strokeStyle = '#ecfeff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 驾驶舱（细长椭圆形，青色发光）
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#67e8f9';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.4, r * 0.15, r * 0.4, 0, 0, Math.PI * 2);
        const cockpitGrad = ctx.createRadialGradient(0, -r * 0.4, 0, 0, -r * 0.4, r * 0.4);
        cockpitGrad.addColorStop(0, '#ffffff');
        cockpitGrad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = cockpitGrad;
        ctx.fill();
        ctx.restore();
        
        // 两侧主翼（后掠翼设计）
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#0891b2';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        // 左翼
        ctx.beginPath();
        ctx.moveTo(-r * 0.3, r * 0.2);
        ctx.lineTo(-r * 0.8, r * 0.7);
        ctx.lineTo(-r * 0.6, r * 0.9);
        ctx.lineTo(-r * 0.2, r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 右翼
        ctx.beginPath();
        ctx.moveTo(r * 0.3, r * 0.2);
        ctx.lineTo(r * 0.8, r * 0.7);
        ctx.lineTo(r * 0.6, r * 0.9);
        ctx.lineTo(r * 0.2, r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // 双引擎喷口（尾部，强烈发光）
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
        ctx.fillStyle = '#a5f3fc';
        ctx.beginPath();
        ctx.arc(-r * 0.25, r * 0.75, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.25, r * 0.75, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 中心加速线（从驾驶舱到尾部）
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.9);
        ctx.lineTo(0, r * 0.5);
        ctx.stroke();
    }

    renderDestroyer(ctx, r, color) {
        // 毁灭者 - 重甲六边形堡垒+紫色力场网格
        
        // 力场网格光晕（最强）
        const forceFieldPulse = Math.sin(Date.now() / 300) * 0.15 + 0.85;
        ctx.save();
        ctx.shadowBlur = 30 * forceFieldPulse;
        ctx.shadowColor = '#a855f7';
        ctx.globalAlpha = 0.4;
        // 外层力场轮廓
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.2);
        ctx.lineTo(-r * 1.1, r * 0.3);
        ctx.lineTo(-r * 0.9, r * 1.1);
        ctx.lineTo(0, r * 0.8);
        ctx.lineTo(r * 0.9, r * 1.1);
        ctx.lineTo(r * 1.1, r * 0.3);
        ctx.closePath();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
        
        // 主体船身（六边形重甲）
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.0);
        ctx.lineTo(-r * 1.0, r * 0.2);
        ctx.lineTo(-r * 0.8, r * 1.0);
        ctx.lineTo(0, r * 0.6);
        ctx.lineTo(r * 0.8, r * 1.0);
        ctx.lineTo(r * 1.0, r * 0.2);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -r, 0, r);
        gradient.addColorStop(0, '#f3e8ff');
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, '#581c87');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 边框高光
        ctx.strokeStyle = '#faf5ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 驾驶舱（方形装甲窗，紫色发光）
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#c084fc';
        ctx.fillStyle = 'rgba(192, 132, 252, 0.3)';
        ctx.fillRect(-r * 0.25, -r * 0.5, r * 0.5, r * 0.4);
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-r * 0.25, -r * 0.5, r * 0.5, r * 0.4);
        
        // 驾驶舱内部十字准星
        ctx.strokeStyle = 'rgba(233, 213, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.5);
        ctx.lineTo(0, -r * 0.1);
        ctx.moveTo(-r * 0.25, -r * 0.3);
        ctx.lineTo(r * 0.25, -r * 0.3);
        ctx.stroke();
        ctx.restore();
        
        // 重甲装甲板（多层）
        ctx.save();
        // 上层装甲
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.fillRect(-r * 0.7, -r * 0.2, r * 1.4, r * 0.3);
        ctx.strokeStyle = '#d8b4fe';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-r * 0.7, -r * 0.2, r * 1.4, r * 0.3);
        
        // 下层装甲
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.fillRect(-r * 0.6, r * 0.2, r * 1.2, r * 0.3);
        ctx.strokeStyle = '#d8b4fe';
        ctx.strokeRect(-r * 0.6, r * 0.2, r * 1.2, r * 0.3);
        ctx.restore();
        
        // 四角重型推进器（强烈发光）
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#a855f7';
        ctx.fillStyle = '#d8b4fe';
        // 左上
        ctx.beginPath();
        ctx.arc(-r * 0.85, r * 0.15, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        // 右上
        ctx.beginPath();
        ctx.arc(r * 0.85, r * 0.15, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        // 左下
        ctx.beginPath();
        ctx.arc(-r * 0.7, r * 0.85, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        // 右下
        ctx.beginPath();
        ctx.arc(r * 0.7, r * 0.85, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 力场网格线（纵横交错）
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
        ctx.lineWidth = 1;
        // 横线
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(-r * 0.9, r * i * 0.25);
            ctx.lineTo(r * 0.9, r * i * 0.25);
            ctx.stroke();
        }
        // 竖线
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(r * i * 0.3, -r * 0.8);
            ctx.lineTo(r * i * 0.3, r * 0.9);
            ctx.stroke();
        }
    }

    renderBomber(ctx, r, color) {
        // 轰炸机 - 圆形堡垒+橙色反应堆核心
        
        // 能量护盾光晕（脉冲）
        const shieldPulse = Math.sin(Date.now() / 250) * 0.2 + 0.8;
        ctx.save();
        ctx.shadowBlur = 25 * shieldPulse;
        ctx.shadowColor = '#f59e0b';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
        
        // 主体船身（八角形堡垒）
        ctx.beginPath();
        const sides = 8;
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, '#fef3c7');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#78350f');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 边框高光
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 中心反应堆核心（强烈发光，脉动）
        const reactorPulse = Math.sin(Date.now() / 200) * 0.15 + 0.85;
        ctx.save();
        ctx.shadowBlur = 20 * reactorPulse;
        ctx.shadowColor = '#fbbf24';
        
        // 外层反应堆环
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        const reactorGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.35);
        reactorGrad.addColorStop(0, '#ffffff');
        reactorGrad.addColorStop(0.5, '#fcd34d');
        reactorGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = reactorGrad;
        ctx.fill();
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 内层反应堆核心
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
        
        // 四座炮塔（十字分布，强烈发光）
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#fbbf24';
        // 上炮塔
        ctx.beginPath();
        ctx.arc(0, -r * 0.7, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        // 下炮塔
        ctx.beginPath();
        ctx.arc(0, r * 0.7, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        // 左炮塔
        ctx.beginPath();
        ctx.arc(-r * 0.7, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        // 右炮塔
        ctx.beginPath();
        ctx.arc(r * 0.7, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 装甲板装饰（环形）
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // 辐射状加强筋
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * r * 0.35, Math.sin(angle) * r * 0.35);
            ctx.lineTo(Math.cos(angle) * r * 0.95, Math.sin(angle) * r * 0.95);
            ctx.stroke();
        }
    }

    renderEngineTrail(ctx) {
        const intensity = this.thrustVisual;
        const r = this.radius;
        
        // 根据速度调整尾焰长度
        const speedRatio = this.velocity.magnitude() / this.maxSpeed;
        const speedMultiplier = 1 + (speedRatio * 0.5); // 高速时尾焰更长
        
        // 根据漂移程度调整尾焰宽度
        const driftWidth = 1 + (this.driftFactor * 0.8); // 漂移时更宽

        // 保存当前状态
        ctx.save();
        
        // 旋转到尾焰方向（完全与速度方向相反）
        ctx.rotate(this.thrustAngle);
        
        // 外层光晕（动态大小）
        ctx.shadowBlur = 20 * intensity * speedMultiplier;
        ctx.shadowColor = this.shipColor || '#6366f1';

        // 主火焰 - 向下喷射（带抖动效果）
        const jitter = Math.sin(Date.now() / 50) * 2; // 快速抖动
        ctx.beginPath();
        ctx.moveTo(-r * 0.3 * driftWidth, 0);
        ctx.lineTo(0, intensity * r * 2 * speedMultiplier + jitter);
        ctx.lineTo(r * 0.3 * driftWidth, 0);
        ctx.closePath();

        const flameGradient = ctx.createLinearGradient(0, 0, 0, intensity * r * 2.5);
        flameGradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
        flameGradient.addColorStop(0.3, 'rgba(168, 85, 247, 0.6)');
        flameGradient.addColorStop(0.7, 'rgba(79, 70, 229, 0.3)');
        flameGradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
        ctx.fillStyle = flameGradient;
        ctx.fill();

        // 内层核心火焰（更亮）
        ctx.beginPath();
        ctx.moveTo(-r * 0.12 * driftWidth, 0);
        ctx.lineTo(0, intensity * r * 1.5 * speedMultiplier);
        ctx.lineTo(r * 0.12 * driftWidth, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(199, 210, 254, 0.95)';
        ctx.fill();
        
        // 恢复状态
        ctx.restore();
    }

    /**
     * 绘制护盾光环（蓝色力场）
     */
    renderShieldGlow(ctx) {
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        
        ctx.save();
        ctx.shadowBlur = 25 * pulse;
        ctx.shadowColor = '#3b82f6';
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.6 * pulse})`;
        ctx.lineWidth = 3;
        
        // 外层光环
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内层光环
        ctx.globalAlpha = 0.3 * pulse;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * 绘制自动避险特效（绿色气流）
     */
    renderAutoDodgeEffect(ctx) {
        const pulse = Math.sin(Date.now() / 150) * 0.4 + 0.6;
        
        ctx.save();
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = '#10b981';
        
        // 旋转的气流线条
        const time = Date.now() / 300;
        for (let i = 0; i < 4; i++) {
            const angle = time + (Math.PI / 2) * i;
            const x1 = Math.cos(angle) * this.radius * 1.5;
            const y1 = Math.sin(angle) * this.radius * 1.5;
            const x2 = Math.cos(angle) * this.radius * 2.5;
            const y2 = Math.sin(angle) * this.radius * 2.5;
            
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.5 * pulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // 中心光点
        ctx.globalAlpha = 0.4 * pulse;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * 创建高速粒子拖尾
     */
    createSpeedTrail() {
        // 需要访问game的particles，通过参数传递或全局访问
        // 这里使用简化的方式，直接在update中调用
        const trailCount = 2;
        for (let i = 0; i < trailCount; i++) {
            const offsetX = Utils.randomRange(-this.radius * 0.5, this.radius * 0.5);
            const offsetY = Utils.randomRange(-this.radius * 0.5, this.radius * 0.5);
            
            // 粒子向速度反方向移动
            const trailDir = Vector2.multiply(this.velocity.normalized(), -1);
            const speed = Utils.randomRange(1, 3);
            
            // 返回粒子数据，由game.js处理
            if (window.game && window.game.particles) {
                window.game.particles.particles.push(new Particle(
                    this.position.x + offsetX,
                    this.position.y + offsetY,
                    trailDir.x * speed,
                    trailDir.y * speed,
                    this.shipColor || '#6366f1',
                    Utils.randomRange(0.2, 0.4),
                    Utils.randomRange(2, 4)
                ));
            }
        }
    }

    /**
     * 创建漂移火花
     */
    createDriftSparks() {
        const sparkCount = 3;
        for (let i = 0; i < sparkCount; i++) {
            // 在飞船两侧生成火花
            const side = Math.random() > 0.5 ? 1 : -1;
            const offsetX = side * this.radius * 0.8;
            const offsetY = Utils.randomRange(-this.radius * 0.3, this.radius * 0.3);
            
            // 火花向外喷射
            const sparkAngle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(2, 5);
            
            if (window.game && window.game.particles) {
                window.game.particles.particles.push(new Particle(
                    this.position.x + offsetX,
                    this.position.y + offsetY,
                    Math.cos(sparkAngle) * speed,
                    Math.sin(sparkAngle) * speed,
                    '#fbbf24', // 金黄色火花
                    Utils.randomRange(0.1, 0.3),
                    Utils.randomRange(1, 3)
                ));
            }
        }
    }

    /**
     * 检查是否可以发射巡航导弹
     */
    canFireCruiseMissile() {
        // 检查是否已解锁任何导弹类型
        if (this.inventory.unlockedMissiles.length === 0) {
            return false;
        }
        
        // 检查当前选择的导弹类型是否已解锁
        if (!this.inventory.unlockedMissiles.includes(this.currentMissileType)) {
            return false;
        }
        
        // 检查计时器
        if (this.cruiseMissileTimer > 0) return false;
        
        return true;
    }

    /**
     * 发射巡航导弹（左右两侧）
     */
    fireCruiseMissile() {
        if (!window.game || !window.game.enemies) return;
        
        // 找到最近的敌人作为目标
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const enemy of window.game.enemies) {
            if (!enemy.isAlive()) continue;
            
            const dist = this.position.distanceSquared(enemy.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }
        
        // 如果没有目标，延迟后重试（不重置计时器）
        if (!nearest) {
            this.cruiseMissileTimer = 0.5; // 0.5秒后再次尝试
            return;
        }
        
        // 计算左右两侧的发射位置
        const leftOffset = Vector2.fromAngle(this.angle - Math.PI / 2, this.radius + 10);
        const rightOffset = Vector2.fromAngle(this.angle + Math.PI / 2, this.radius + 10);
        
        const leftPos = Vector2.add(this.position, leftOffset);
        const rightPos = Vector2.add(this.position, rightOffset);
        
        // 创建左侧导弹
        const leftMissile = new CruiseMissile(
            leftPos.x,
            leftPos.y,
            nearest,
            this.currentMissileType,
            'player'
        );
        
        // 设置初始速度方向（向目标）
        const leftDir = Vector2.sub(nearest.position, leftPos).normalized();
        leftMissile.velocity = Vector2.multiply(leftDir, leftMissile.speed);
        
        // 创建右侧导弹
        const rightMissile = new CruiseMissile(
            rightPos.x,
            rightPos.y,
            nearest,
            this.currentMissileType,
            'player'
        );
        
        // 设置初始速度方向（向目标）
        const rightDir = Vector2.sub(nearest.position, rightPos).normalized();
        rightMissile.velocity = Vector2.multiply(rightDir, rightMissile.speed);
        
        // 添加到游戏中
        window.game.cruiseMissiles.push(leftMissile);
        window.game.cruiseMissiles.push(rightMissile);
        
        // 成功发射后才重置计时器
        this.cruiseMissileTimer = this.cruiseMissileFireRate;
        
        console.log(`发射 ${this.currentMissileType} 号巡航导弹！（无限制模式）`);
    }

    /**
     * 切换当前装备的导弹类型
     */
    switchMissileType(missileType) {
        if (this.inventory.unlockedMissiles.includes(missileType)) {
            this.currentMissileType = missileType;
            console.log(`切换导弹类型: ${missileType}`);
            return true;
        }
        return false;
    }

    /**
     * 解锁新的导弹类型
     */
    unlockMissile(missileType) {
        if (!this.inventory.unlockedMissiles.includes(missileType)) {
            this.inventory.unlockedMissiles.push(missileType);
            // 首次解锁任何导弹时，启用自动发射功能
            if (this.inventory.unlockedMissiles.length === 1) {
                this.cruiseMissileEnabled = true;
                console.log('🚀 首次解锁导弹，启用自动发射功能！');
            }
            console.log(`解锁新导弹: ${missileType}`);
            return true;
        }
        return false;
    }

    /**
     * 添加巡航导弹到背包
     */
    addCruiseMissile(missileType, count = 1) {
        if (this.inventory.cruiseMissiles[missileType] !== undefined) {
            this.inventory.cruiseMissiles[missileType] += count;
            
            // 如果这是新类型的导弹，自动解锁
            if (!this.inventory.unlockedMissiles.includes(missileType)) {
                this.unlockMissile(missileType);
            }
            
            return true;
        }
        return false;
    }
}
