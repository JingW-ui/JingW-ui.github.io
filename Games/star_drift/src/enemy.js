/**
 * 敌人类
 */
class Enemy extends Entity {
    constructor(x, y, type = 'basic') {
        super(x, y, 15);

        this.type = type;
        this.active = true;
        this.angle = 0;
        this.speedMultiplier = 1.0; // 速度乘数，默认为1.0

        // 根据类型设置属性
        this.setupByType();
        
        // 加载对应的SVG图片
        this.loadEnemyImage();

        this.flashTimer = 0;
        this.spawnTimer = 0.3; // 生成时的无敌时间
    }

    // 设置速度乘数（用于无敌模式）
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    setupByType() {
        switch (this.type) {
            case 'basic':
                this.health = 20;
                this.maxHealth = 20;
                this.speed = 6; // 提升71%
                this.damage = 10;
                this.scoreValue = 100;
                this.radius = 14;
                this.color = '#664a4a';
                this.accelerationForce = 0.5; // 提升100%
                this.fireRate = 3; // 基础敌人也能射击
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy1';
                break;

            case 'fast':
                this.health = 10;
                this.maxHealth = 10;
                this.speed = 10; // 提升67%
                this.damage = 5;
                this.scoreValue = 150;
                this.radius = 10;
                this.color = '#66604a';
                this.accelerationForce = 0.8; // 提升100%
                this.imageKey = 'enemy1';
                break;

            case 'tank':
                this.health = 60;
                this.maxHealth = 60;
                this.speed = 3.5; // 提升75%
                this.damage = 20;
                this.scoreValue = 300;
                this.radius = 20;
                this.color = '#664a4a';
                this.accelerationForce = 0.25; // 提升108%
                this.imageKey = 'enemy2';
                break;

            case 'shooter':
                this.health = 30;
                this.maxHealth = 30;
                this.speed = 4.5; // 提升80%
                this.damage = 15;
                this.scoreValue = 250;
                this.radius = 16;
                this.color = '#5a5566';
                this.accelerationForce = 0.35; // 提升94%
                this.fireRate = 1.5; // 加快射击频率
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy2';
                break;

            case 'asteroid':
                this.health = 40;
                this.maxHealth = 40;
                this.speed = 3.5; // 提升75%
                this.damage = 15;
                this.scoreValue = 50;
                this.radius = Utils.randomRange(15, 30);
                this.color = '#5a5a5a';
                this.accelerationForce = 0.2; // 提升100%
                this.rotationSpeed = Utils.randomRange(-2, 2);
                // 为每个陨石生成独特的形状点
                this.asteroidPoints = [];
                const points = Math.floor(Utils.randomRange(7, 11));
                for (let i = 0; i < points; i++) {
                    this.asteroidPoints.push(Utils.randomRange(0.7, 1.0));
                }
                this.imageKey = null; // 陨石不使用SVG
                break;

            case 'sniper':
                this.health = 15;
                this.maxHealth = 15;
                this.speed = 2.5; // 提升67%
                this.damage = 25;
                this.scoreValue = 200;
                this.radius = 12;
                this.color = '#4a6655';
                this.accelerationForce = 0.3; // 提升100%
                this.fireRate = 2.5;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy1';
                break;

            case 'swarmer':
                this.health = 8;
                this.maxHealth = 8;
                this.speed = 8.5; // 提升70%
                this.damage = 8;
                this.scoreValue = 80;
                this.radius = 8;
                this.color = '#66554a';
                this.accelerationForce = 0.9; // 提升100%
                this.swarmOffset = Utils.randomRange(0, Math.PI * 2);
                this.imageKey = 'enemy1';
                break;

            case 'boss':
                // Boss敌人：超高血量，多阶段攻击
                this.health = 500;
                this.maxHealth = 500;
                this.speed = 4;
                this.damage = 30;
                this.scoreValue = 2000;
                this.radius = 35;
                this.color = '#664a4a';
                this.accelerationForce = 0.4;
                this.fireRate = 0.8; // 快速射击
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.phase = 1; // Boss阶段（1-3）
                this.phaseTimer = 0;
                this.attackPattern = 0; // 攻击模式
                this.imageKey = 'boss1';
                
                // 无敌模式：大幅增强Boss
                if (window.gameInstance && window.gameInstance.gameMode === 'god') {
                    const playerLevel = window.gameInstance.player ? window.gameInstance.player.level : 1;
                    const bossMultiplier = 1 + (playerLevel * 0.25); // 每级+25%难度
                    
                    this.health *= bossMultiplier;
                    this.maxHealth *= bossMultiplier;
                    this.damage *= bossMultiplier;
                    this.speed *= (1 + playerLevel * 0.08); // 每级+8%速度
                    this.fireRate = Math.max(0.3, 0.8 - playerLevel * 0.03); // 等级越高射速越快
                    this.scoreValue *= Math.floor(bossMultiplier);
                    
                    console.log(`👹 Boss增强: Lv.${playerLevel} | HP:${this.health.toFixed(0)} DMG:${this.damage.toFixed(0)} Speed:${this.speed.toFixed(1)}`);
                }
                break;

            // 新增敌人类型 - 使用PNG资源
            case 'scout':
                // 侦察机：小型快速敌人
                this.health = 12;
                this.maxHealth = 12;
                this.speed = 9;
                this.damage = 6;
                this.scoreValue = 120;
                this.radius = 11;
                this.color = '#66604a';
                this.accelerationForce = 0.7;
                this.imageKey = 'enemy_dinghy_small';
                break;

            case 'cruiser':
                // 巡洋舰：中型均衡敌人
                this.health = 35;
                this.maxHealth = 35;
                this.speed = 5.5;
                this.damage = 12;
                this.scoreValue = 180;
                this.radius = 16;
                this.color = '#4a5568';
                this.accelerationForce = 0.4;
                this.fireRate = 2;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy_ship1';
                break;

            case 'destroyer':
                // 驱逐舰：重型火力敌人
                this.health = 50;
                this.maxHealth = 50;
                this.speed = 4;
                this.damage = 18;
                this.scoreValue = 280;
                this.radius = 18;
                this.color = '#66554a';
                this.accelerationForce = 0.35;
                this.fireRate = 1.2;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy_ship2';
                break;

            case 'frigate':
                // 护卫舰：快速攻击型
                this.health = 25;
                this.maxHealth = 25;
                this.speed = 7.5;
                this.damage = 10;
                this.scoreValue = 160;
                this.radius = 13;
                this.color = '#5a5566';
                this.accelerationForce = 0.6;
                this.imageKey = 'enemy_ship3';
                break;

            case 'carrier':
                // 航母：大型慢速敌人
                this.health = 80;
                this.maxHealth = 80;
                this.speed = 2.5;
                this.damage = 25;
                this.scoreValue = 400;
                this.radius = 25;
                this.color = '#5a5566';
                this.accelerationForce = 0.2;
                this.fireRate = 1;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy_ship4';
                break;

            case 'interceptor':
                // 拦截机：超高速突袭
                this.health = 15;
                this.maxHealth = 15;
                this.speed = 11;
                this.damage = 8;
                this.scoreValue = 140;
                this.radius = 10;
                this.color = '#4a6655';
                this.accelerationForce = 0.9;
                this.imageKey = 'enemy_ship5';
                break;

            case 'battleship':
                // 战列舰：超级重甲
                this.health = 100;
                this.maxHealth = 100;
                this.speed = 3;
                this.damage = 22;
                this.scoreValue = 450;
                this.radius = 22;
                this.color = '#664a4a';
                this.accelerationForce = 0.25;
                this.fireRate = 1.5;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy_ship6';
                break;

            case 'bomber':
                // 轰炸机：投弹专家
                this.health = 40;
                this.maxHealth = 40;
                this.speed = 4.5;
                this.damage = 20;
                this.scoreValue = 300;
                this.radius = 17;
                this.color = '#66604a';
                this.accelerationForce = 0.4;
                this.fireRate = 2.5;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.imageKey = 'enemy_ship8';
                break;

            case 'stealth':
                // 隐形战机：难以发现
                this.health = 18;
                this.maxHealth = 18;
                this.speed = 8;
                this.damage = 15;
                this.scoreValue = 220;
                this.radius = 12;
                this.color = '#554a66';
                this.accelerationForce = 0.65;
                this.stealth = true; // 隐形标记
                this.imageKey = 'enemy_ship9';
                break;

            case 'support':
                // 支援舰：治疗友军
                this.health = 30;
                this.maxHealth = 30;
                this.speed = 5;
                this.damage = 8;
                this.scoreValue = 250;
                this.radius = 15;
                this.color = '#4a6655';
                this.accelerationForce = 0.45;
                this.fireRate = 3;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.healAbility = true; // 治疗能力
                this.imageKey = 'enemy_ship10';
                break;

            case 'elite':
                // 精英战士：全能型
                this.health = 60;
                this.maxHealth = 60;
                this.speed = 6;
                this.damage = 20;
                this.scoreValue = 350;
                this.radius = 19;
                this.color = '#ef4444';
                this.accelerationForce = 0.5;
                this.fireRate = 1;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.elite = true; // 精英标记
                this.imageKey = 'enemy_ship18';
                break;

            case 'commander':
                // 指挥官：指挥其他敌人
                this.health = 70;
                this.maxHealth = 70;
                this.speed = 4.5;
                this.damage = 18;
                this.scoreValue = 500;
                this.radius = 20;
                this.color = '#f43f5e';
                this.accelerationForce = 0.4;
                this.fireRate = 1.8;
                this.fireTimer = Utils.randomRange(0, this.fireRate);
                this.commander = true; // 指挥官标记
                this.imageKey = 'enemy_ship19';
                break;

            default:
                this.health = 20;
                this.maxHealth = 20;
                this.speed = 6;
                this.damage = 10;
                this.scoreValue = 100;
                this.radius = 14;
                this.color = '#ff4444';
                this.accelerationForce = 0.5;
                this.imageKey = 'enemy1';
        }
    }

    /**
     * 加载敌人SVG/PNG图片
     */
    loadEnemyImage() {
        try {
            if (this.imageKey && window.resourceManager && window.resourceManager.hasImage(this.imageKey)) {
                this.enemyImage = window.resourceManager.getImage(this.imageKey);
            } else {
                this.enemyImage = null;
                // 只在首次加载时输出警告
                if (!this._imageLoadLogged) {
                    console.warn(`✗ 敌人 ${this.type} 未找到图片: ${this.imageKey}`);
                    this._imageLoadLogged = true;
                }
            }
        } catch (error) {
            console.error(`Error loading enemy image ${this.imageKey}:`, error);
            this.enemyImage = null;
        }
    }

    update(deltaTime, player, worldBounds) {
        if (!this.active) return;

        // 生成无敌时间
        if (this.spawnTimer > 0) {
            this.spawnTimer -= deltaTime;
        }

        // 受击闪烁
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
        }

        // AI行为
        this.updateAI(deltaTime, player);

        // 更新物理
        this.updatePhysics(deltaTime, 0.75);

        // 限制速度（应用速度乘数）
        const maxSpeed = this.speed * this.speedMultiplier;
        this.velocity.limit(maxSpeed);

        // 小行星自转
        if (this.type === 'asteroid') {
            this.angle += this.rotationSpeed * deltaTime;
        }

        // 射击者射击逻辑（优化：使用统一的射击类型判断）
        if (this.canShoot() && player.isAlive()) {
            this.fireTimer -= deltaTime;
            if (this.fireTimer <= 0) {
                this.fireTimer = this.fireRate;
                return this.tryShoot(player);
            }
        }

        return null;
    }

    /**
     * 判断敌人是否可以射击
     */
    canShoot() {
        // 需要射击能力的敌人类型
        const shootingTypes = [
            'shooter', 'sniper', 'basic', 'cruiser', 'destroyer', 
            'carrier', 'battleship', 'bomber', 'support', 'elite', 'commander'
        ];
        return shootingTypes.includes(this.type) && this.fireRate > 0;
    }

    updateAI(deltaTime, player) {
        if (!player.isAlive()) return;

        const toPlayer = Vector2.sub(player.position, this.position);
        const distance = toPlayer.magnitude();

        switch (this.type) {
            case 'basic':
                // 基础敌人：直接追逐玩家
                if (distance > 10) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;

            case 'fast':
                // 快速敌人：快速接近，然后环绕
                if (distance > 100) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                } else {
                    // 环绕行为
                    const perpendicular = new Vector2(-toPlayer.y, toPlayer.x).normalized();
                    this.applyForce(Vector2.multiply(perpendicular, this.accelerationForce * 0.5));
                }
                this.angle = toPlayer.angle();
                break;

            case 'tank':
                // 坦克敌人：缓慢但坚定地追逐
                if (distance > 20) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;

            case 'shooter':
                // 射击者：保持距离
                if (distance > 200) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                } else if (distance < 150) {
                    const direction = toPlayer.normalized().multiply(-1);
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;

            case 'sniper':
                // 狙击手：远距离精准打击
                if (distance > 300) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                } else if (distance < 250) {
                    const direction = toPlayer.normalized().multiply(-1);
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;

            case 'swarmer':
                // 群集者：螺旋式攻击
                const time = Date.now() / 1000;
                const spiralAngle = this.swarmOffset + time * 2;
                const spiralDir = new Vector2(Math.cos(spiralAngle), Math.sin(spiralAngle));
                
                if (distance > 80) {
                    const direction = toPlayer.normalized();
                    const combined = Vector2.add(direction, Vector2.multiply(spiralDir, 0.5)).normalized();
                    this.applyForce(Vector2.multiply(combined, this.accelerationForce));
                } else {
                    const perpendicular = new Vector2(-toPlayer.y, toPlayer.x).normalized();
                    this.applyForce(Vector2.multiply(perpendicular, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;

            case 'asteroid':
                // 小行星：直线移动，不追逐
                if (this.velocity.magnitude() < 0.5) {
                    const randomAngle = Utils.randomRange(0, Math.PI * 2);
                    this.applyForce(Vector2.fromAngle(randomAngle, this.accelerationForce));
                }
                break;

            case 'boss':
                // Boss AI：多阶段攻击模式
                this.phaseTimer += deltaTime;
                
                // 根据血量切换阶段
                const healthPercent = this.health / this.maxHealth;
                if (healthPercent < 0.3 && this.phase < 3) {
                    this.phase = 3; // 狂暴阶段
                    this.speed = 6;
                    this.fireRate = 0.4;
                } else if (healthPercent < 0.6 && this.phase < 2) {
                    this.phase = 2; // 愤怒阶段
                    this.speed = 5;
                    this.fireRate = 0.6;
                }
                
                // 攻击模式切换（每5秒）
                if (this.phaseTimer > 5) {
                    this.attackPattern = (this.attackPattern + 1) % 3;
                    this.phaseTimer = 0;
                }
                
                switch (this.attackPattern) {
                    case 0: // 追逐模式
                        if (distance > 50) {
                            const direction = toPlayer.normalized();
                            this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                        }
                        break;
                    case 1: // 环绕模式
                        if (distance > 150) {
                            const direction = toPlayer.normalized();
                            this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                        } else {
                            const perpendicular = new Vector2(-toPlayer.y, toPlayer.x).normalized();
                            this.applyForce(Vector2.multiply(perpendicular, this.accelerationForce * 0.8));
                        }
                        break;
                    case 2: // 远离射击模式
                        if (distance < 200) {
                            const direction = toPlayer.normalized().multiply(-1);
                            this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                        }
                        break;
                }
                
                this.angle = toPlayer.angle();
                break;
                
            // 新增敌人类型的AI
            case 'scout':
            case 'interceptor':
                // 侦察机/拦截机：超高速突袭
                if (distance > 50) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;
                
            case 'cruiser':
            case 'frigate':
            case 'destroyer':
                // 巡洋舰/护卫舰/驱逐舰：标准追逐+射击
                if (distance > 100) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;
                
            case 'carrier':
            case 'battleship':
                // 航母/战列舰：慢速但坚定
                if (distance > 80) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;
                
            case 'bomber':
                // 轰炸机：保持中等距离
                if (distance > 200) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                } else if (distance < 150) {
                    const direction = toPlayer.normalized().multiply(-1);
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;
                
            case 'stealth':
                // 隐形战机：快速突袭后撤退
                if (distance > 120) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                } else if (distance < 80) {
                    const direction = toPlayer.normalized().multiply(-1);
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce * 1.5));
                }
                this.angle = toPlayer.angle();
                break;
                
            case 'support':
                // 支援舰：保持距离治疗友军
                if (distance > 250) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                } else if (distance < 200) {
                    const direction = toPlayer.normalized().multiply(-1);
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;
                
            case 'elite':
                // 精英战士：智能追逐
                if (distance > 80) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;
                
            case 'commander':
                // 指挥官：指挥位置
                if (distance > 150) {
                    const direction = toPlayer.normalized();
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                } else if (distance < 120) {
                    const direction = toPlayer.normalized().multiply(-1);
                    this.applyForce(Vector2.multiply(direction, this.accelerationForce));
                }
                this.angle = toPlayer.angle();
                break;
        }
    }

    tryShoot(player) {
        const angle = this.position.angleTo(player.position);
        const spawnOffset = Vector2.fromAngle(angle, this.radius + 5);
        const spawnPos = Vector2.add(this.position, spawnOffset);
        
        // 根据敌人类型设置子弹速度和射程
        let bulletSpeed = 5;  // 降低普通小怪子弹速度（原8）
        let bulletType = 'normal';
        let bulletLifeTime = 2;  // 限制普通小怪子弹射程（原3秒）
        
        if (this.type === 'sniper') {
            bulletSpeed = 15;
            bulletType = 'sniper';
            bulletLifeTime = 4;  // 狙击手子弹射程更远
        } else if (this.type === 'shooter') {
            bulletSpeed = 6;  // 射击者子弹速度适中（原7）
            bulletLifeTime = 2.5;  // 射击者子弹射程适中
        }
        
        const velocity = Vector2.fromAngle(angle, bulletSpeed);
        const bullet = new Bullet(
            spawnPos.x,
            spawnPos.y,
            velocity.x,
            velocity.y,
            this.damage,
            'enemy',
            bulletType
        );
        
        // 设置敌人类型，用于子弹样式渲染
        bullet.enemyType = this.type;
        
        // 设置子弹生命周期（控制射程）
        bullet.lifeTime = bulletLifeTime;
        bullet.maxLifeTime = bulletLifeTime;
        
        return bullet;
    }

    takeDamage(damage) {
        if (this.spawnTimer > 0) return false;

        this.health -= damage;
        this.flashTimer = 0.1;

        if (this.health <= 0) {
            this.active = false;
            return true; // 死亡
        }

        return false;
    }

    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // 生成时淡入
        if (this.spawnTimer > 0) {
            ctx.globalAlpha = 1 - (this.spawnTimer / 0.3);
        }

        // 受击闪烁
        if (this.flashTimer > 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.rotate(this.angle + Math.PI / 2);

        // 如果有SVG/PNG图片，使用图片渲染
        if (this.enemyImage) {
            const scale = (this.radius * 5.0) / Math.max(this.enemyImage.width, this.enemyImage.height);
            const drawWidth = this.enemyImage.width * scale;
            const drawHeight = this.enemyImage.height * scale;
            
            ctx.drawImage(
                this.enemyImage,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
        } else {
            // 如果没有图片（如陨石），使用原有的Canvas绘制
            switch (this.type) {
                case 'basic':
                    this.renderBasic(ctx);
                    break;
                case 'fast':
                    this.renderFast(ctx);
                    break;
                case 'tank':
                    this.renderTank(ctx);
                    break;
                case 'shooter':
                    this.renderShooter(ctx);
                    break;
                case 'asteroid':
                    this.renderAsteroid(ctx);
                    break;
                case 'sniper':
                    this.renderSniper(ctx);
                    break;
                case 'swarmer':
                    this.renderSwarmer(ctx);
                    break;
                case 'boss':
                    this.renderBoss(ctx);
                    break;
                // 新增敌人类型也应该有图片，但为了安全添加default
                default:
                    // 如果新敌人没有加载到图片，至少显示一个圆形
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.strokeStyle = '#888888';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    break;
            }
        }

        ctx.restore();
    }

    renderBasic(ctx) {
        const r = this.radius;

        // 主体 - 菱形
        ctx.beginPath();
        ctx.moveTo(0, r);
        ctx.lineTo(-r * 0.7, 0);
        ctx.lineTo(0, -r * 0.8);
        ctx.lineTo(r * 0.7, 0);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -r, 0, r);
        gradient.addColorStop(0, '#fca5a5');
        gradient.addColorStop(1, '#dc2626');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#665555';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 核心
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#fee2e2';
        ctx.fill();
    }

    renderFast(ctx) {
        const r = this.radius;

        // 主体 - 尖锐三角形
        ctx.beginPath();
        ctx.moveTo(0, r * 1.2);
        ctx.lineTo(-r * 0.5, -r * 0.3);
        ctx.lineTo(0, -r * 0.1);
        ctx.lineTo(r * 0.5, -r * 0.3);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -r, 0, r);
        gradient.addColorStop(0, '#fcd34d');
        gradient.addColorStop(1, '#d97706');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#66604a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    renderTank(ctx) {
        const r = this.radius;

        // 主体 - 六边形
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, '#f87171');
        gradient.addColorStop(1, '#991b1b');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#664a4a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 装甲板
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#664a4a';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    renderShooter(ctx) {
        const r = this.radius;

        // 主体
        ctx.beginPath();
        ctx.moveTo(0, r);
        ctx.lineTo(-r * 0.6, r * 0.3);
        ctx.lineTo(-r * 0.8, -r * 0.5);
        ctx.lineTo(0, -r * 0.8);
        ctx.lineTo(r * 0.8, -r * 0.5);
        ctx.lineTo(r * 0.6, r * 0.3);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -r, 0, r);
        gradient.addColorStop(0, '#f0abfc');
        gradient.addColorStop(1, '#c026d3');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#5a5566';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 炮管
        ctx.fillStyle = '#e879f9';
        ctx.fillRect(-r * 0.15, -r * 1.2, r * 0.3, r * 0.6);
    }

    renderAsteroid(ctx) {
        const r = this.radius;

        // 使用预生成的形状点，保持一致性
        ctx.beginPath();
        const points = this.asteroidPoints.length;
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 / points) * i;
            const radiusVariation = this.asteroidPoints[i];
            const x = Math.cos(angle) * r * radiusVariation;
            const y = Math.sin(angle) * r * radiusVariation;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const gradient = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        gradient.addColorStop(0, '#d1d5db');
        gradient.addColorStop(1, '#6b7280');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 多个陨石坑
        ctx.beginPath();
        ctx.arc(r * 0.2, r * 0.1, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.2, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();
    }

    renderSniper(ctx) {
        const r = this.radius;

        // 狙击手 - 细长的三角形
        ctx.beginPath();
        ctx.moveTo(0, r * 1.3);
        ctx.lineTo(-r * 0.4, -r * 0.2);
        ctx.lineTo(-r * 0.6, -r * 0.8);
        ctx.lineTo(0, -r * 1.0);
        ctx.lineTo(r * 0.6, -r * 0.8);
        ctx.lineTo(r * 0.4, -r * 0.2);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -r, 0, r);
        gradient.addColorStop(0, '#6ee7b7');
        gradient.addColorStop(1, '#059669');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#4a6655';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 瞄准镜
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#34d399';
        ctx.fill();
        ctx.strokeStyle = '#5a7a6a';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    renderSwarmer(ctx) {
        const r = this.radius;

        // 群集者 - 小圆形带翅膀
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, '#fdba74');
        gradient.addColorStop(1, '#ea580c');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#66554a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 翅膀
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, 0);
        ctx.lineTo(-r * 1.2, -r * 0.6);
        ctx.lineTo(-r * 0.8, r * 0.2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(251, 146, 60, 0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(r * 0.4, 0);
        ctx.lineTo(r * 1.2, -r * 0.6);
        ctx.lineTo(r * 0.8, r * 0.2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(251, 146, 60, 0.6)';
        ctx.fill();
    }

    renderBoss(ctx) {
        const r = this.radius;
        
        // Boss主体 - 大型圆形带装甲板
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        
        // 根据阶段改变颜色
        let bossColor;
        if (this.phase === 3) {
            bossColor = '#dc2626'; // 狂暴阶段：深红
        } else if (this.phase === 2) {
            bossColor = '#ef4444'; // 愤怒阶段：红色
        } else {
            bossColor = '#f87171'; // 正常阶段：浅红
        }
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, bossColor);
        gradient.addColorStop(1, '#991b1b');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 外圈装甲
        ctx.strokeStyle = '#665555';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内部能量核心（脉动效果）
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.fill();
        
        // 装甲板装饰
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x1 = Math.cos(angle) * r * 0.6;
            const y1 = Math.sin(angle) * r * 0.6;
            const x2 = Math.cos(angle) * r * 0.9;
            const y2 = Math.sin(angle) * r * 0.9;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = 'rgba(102, 85, 85, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 血条背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-r, -r - 15, r * 2, 8);
        
        // 血条
        const healthPercent = this.health / this.maxHealth;
        const barColor = healthPercent > 0.6 ? '#10b981' : (healthPercent > 0.3 ? '#f59e0b' : '#ef4444');
        ctx.fillStyle = barColor;
        ctx.fillRect(-r, -r - 15, r * 2 * healthPercent, 8);
        
        // 血条边框
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(-r, -r - 15, r * 2, 8);
    }
}

/**
 * 敌人波次管理器
 */
class WaveManager {
    constructor(gameMode = 'normal') {
        this.currentWave = 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.enemiesToSpawn = 0;
        this.waveInProgress = false;
        this.waveCooldown = 3; // 波次间隔
        this.waveConfig = null;
        this.gameMode = gameMode; // 游戏模式
        this.bossSpawnTimer = 0; // Boss生成计时器
    }

    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.waveInProgress = true;
        this.enemiesSpawned = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;

        // 计算本波敌人数量
        this.enemiesToSpawn = this.calculateEnemyCount(waveNumber);
        this.waveConfig = this.generateWaveConfig(waveNumber);
    }

    calculateEnemyCount(wave) {
        // 无敌模式：敌人数量翻倍
        const baseCount = this.gameMode === 'god' ? (5 + wave * 3) * 2 : (5 + wave * 3);
        return Math.min(baseCount, this.gameMode === 'god' ? 80 : 50); // 无敌模式上限80
    }

    generateWaveConfig(wave) {
        const isGodMode = this.gameMode === 'god';
        const multiplier = isGodMode ? 2 : 1; // 无敌模式数量翻倍
        
        // 计算总敌人数
        const totalEnemies = this.calculateEnemyCount(wave);
        
        // 根据波次分配敌人类型权重
        const typeWeights = [];
        
        // 基础敌人（始终有）
        typeWeights.push({ type: 'basic', weight: 30 });
        typeWeights.push({ type: 'asteroid', weight: 15 });
        
        // 第2波开始添加快速敌人
        if (wave >= 2) {
            typeWeights.push({ type: 'fast', weight: 15 });
            typeWeights.push({ type: 'scout', weight: 10 });
        }
        
        // 第3波开始添加坦克和群集者
        if (wave >= 3) {
            typeWeights.push({ type: 'tank', weight: 8 });
            typeWeights.push({ type: 'swarmer', weight: 12 });
            typeWeights.push({ type: 'cruiser', weight: 8 });
            typeWeights.push({ type: 'interceptor', weight: 10 });
        }
        
        // 第4波开始添加射击者和护卫舰
        if (wave >= 4) {
            typeWeights.push({ type: 'shooter', weight: 10 });
            typeWeights.push({ type: 'frigate', weight: 8 });
        }
        
        // 第5波开始添加狙击手、驱逐舰和隐形战机
        if (wave >= 5) {
            typeWeights.push({ type: 'sniper', weight: 8 });
            typeWeights.push({ type: 'destroyer', weight: 6 });
            typeWeights.push({ type: 'stealth', weight: 7 });
        }
        
        // 第6波开始添加轰炸机和支援舰
        if (wave >= 6) {
            typeWeights.push({ type: 'bomber', weight: 6 });
            typeWeights.push({ type: 'support', weight: 5 });
        }
        
        // 第7波开始添加航母
        if (wave >= 7) {
            typeWeights.push({ type: 'carrier', weight: 5 });
        }
        
        // 第8波开始添加战列舰和精英
        if (wave >= 8) {
            typeWeights.push({ type: 'battleship', weight: 4 });
            typeWeights.push({ type: 'elite', weight: 5 });
        }
        
        // 第10波开始添加指挥官
        if (wave >= 10) {
            typeWeights.push({ type: 'commander', weight: 3 });
        }
        
        // 根据权重分配敌人数量
        const config = {};
        const totalWeight = typeWeights.reduce((sum, item) => sum + item.weight, 0);
        
        let remainingEnemies = totalEnemies;
        
        for (const item of typeWeights) {
            const count = Math.floor((item.weight / totalWeight) * totalEnemies * multiplier);
            config[item.type] = Math.max(0, count);
            remainingEnemies -= count;
        }
        
        // 将剩余的敌人分配给基础类型
        if (remainingEnemies > 0) {
            config.basic = (config.basic || 0) + remainingEnemies;
        }
        
        // 无敌模式：每5波生成一个Boss（替换部分普通敌人）
        if (isGodMode && wave % 5 === 0) {
            config.boss = 1;
            // 减少其他敌人数量为Boss让路
            const reduceAmount = Math.floor(totalEnemies * 0.3); // 减少30%
            if (config.basic > reduceAmount) {
                config.basic -= reduceAmount;
            }
        }
        
        return config;
    }

    update(deltaTime, player, worldBounds) {
        if (!this.waveInProgress) {
            this.waveTimer += deltaTime;
            if (this.waveTimer >= this.waveCooldown) {
                this.startWave(this.currentWave + 1);
            }
            return null;
        }

        this.spawnTimer -= deltaTime;

        if (this.spawnTimer <= 0 && this.enemiesSpawned < this.enemiesToSpawn) {
            this.spawnTimer = Math.max(0.3, 1.5 - this.currentWave * 0.05);
            this.enemiesSpawned++;
            return this.spawnEnemy(player, worldBounds);
        }

        return null;
    }

    spawnEnemy(player, worldBounds) {
        const spawnPos = Utils.randomSpawnPosition(
            player.position.x,
            player.position.y,
            window.innerWidth,
            window.innerHeight,
            100
        );

        // 根据波次配置选择敌人类型
        const types = [];
        for (const [type, count] of Object.entries(this.waveConfig)) {
            for (let i = 0; i < count; i++) {
                types.push(type);
            }
        }

        const type = types.length > 0 ? Utils.randomChoice(types) : 'basic';
        return new Enemy(spawnPos.x, spawnPos.y, type);
    }

    checkWaveComplete(enemies) {
        if (!this.waveInProgress) return false;

        const aliveEnemies = enemies.filter(e => e.isAlive()).length;
        if (this.enemiesSpawned >= this.enemiesToSpawn && aliveEnemies === 0) {
            this.waveInProgress = false;
            this.waveTimer = 0;
            return true;
        }
        return false;
    }

    isSpawning() {
        return this.waveInProgress && this.enemiesSpawned < this.enemiesToSpawn;
    }
}
