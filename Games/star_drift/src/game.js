/**
 * 游戏主控制器 - v2.0
 * 新增：能源系统、等级系统、背包系统、战舰选择、手动发射
 */
class Game {
    constructor() {
        // 画布
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 游戏状态
        this.state = 'menu';
        this.gameMode = 'normal';
        this.deltaTime = 0;
        this.lastTime = 0;
        this.gameTime = 0;
        this.godModeTimer = Infinity; // 无敌模式倒计时（无限）

        // 子系统
        this.input = new InputManager();
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();
        this.starfield = null;
        this.bgDecorations = null;

        // 游戏对象
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.cruiseMissiles = []; // 巡航导弹数组
        this.collectibles = [];
        this.waveManager = null;

        // 世界设置
        this.worldBounds = {
            left: -2000,
            right: 2000,
            top: -2000,
            bottom: 2000
        };

        // 相机
        this.camera = new Vector2(0, 0);
        this.cameraSmooth = 0.1;

        // 设置
        this.settings = {
            sound: true,
            music: true,
            autoAim: true,
            vibration: true
        };

        // 战舰选择
        this.selectedShip = 'fighter';

        // 无敌模式特殊设置
        this.godModeSettings = {
            spawnRate: 0.5,
            enemyMultiplier: 2
        };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 初始化星空背景
        const starfieldCanvas = document.getElementById('starfield-canvas');
        this.starfield = new Starfield(starfieldCanvas);
        
        // 初始化背景装饰物（使用同一个canvas）
        this.bgDecorations = new BackgroundDecorations(starfieldCanvas);

        // 加载设置
        this.loadSettings();

        // 加载最高分
        this.loadHighScore();

        // 绑定UI事件
        this.bindUIEvents();
        
        // 绑定升级选择按钮事件
        this.bindUpgradeSelectionEvents();

        // 开始游戏循环
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.starfield) {
            this.starfield.resize();
        }
        if (this.bgDecorations) {
            this.bgDecorations.resize();
        }

        // 移动端横屏优化
        this.isLandscape = window.innerWidth > window.innerHeight;

        // 根据屏幕方向调整UI布局
        if (this.isLandscape) {
            this.adjustUIForLandscape();
        }
    }

    adjustUIForLandscape() {
        // 横屏时的UI调整逻辑
        const joystickLeft = document.getElementById('joystick-left');
        const joystickRight = document.getElementById('joystick-right');
        const fireButton = document.getElementById('fire-button');
        const inventoryBar = document.getElementById('inventory-bar');

        if (joystickLeft && joystickRight && fireButton && inventoryBar) {
            // 调整摇杆位置适应横屏
            if (window.innerHeight < 500) {
                // 超窄高度优化
                joystickLeft.style.bottom = '30px';
                joystickRight.style.bottom = '30px';
                fireButton.style.transform = 'translateY(-50%) scale(0.9)';
            }
        }
    }

    loadSettings() {
        const saved = Utils.loadData('settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }

        this.audio.setEnabled(this.settings.sound);
        this.audio.setMusicEnabled(this.settings.music);
    }

    saveSettings() {
        Utils.saveData('settings', this.settings);
    }

    loadHighScore() {
        const highScore = Utils.loadData('highScore', 0);
        const menuHighScore = document.getElementById('menu-high-score');
        if (menuHighScore) {
            menuHighScore.textContent = Utils.formatNumber(highScore);
        }
    }

    bindUIEvents() {
        // 主菜单 - 飞船选择（直接在主菜单中）
        document.querySelectorAll('.ship-card').forEach(card => {
            // 触摸开始 - 添加反馈
            card.addEventListener('touchstart', (e) => {
                card.style.transform = 'scale(0.95)';
                card.style.transition = 'transform 0.1s ease';
            }, { passive: true });

            // 触摸结束 - 恢复并触发选择
            card.addEventListener('touchend', (e) => {
                card.style.transform = '';
                document.querySelectorAll('.ship-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedShip = card.dataset.ship;
                console.log('已选择飞船:', this.selectedShip);
                
                // 播放选择音效
                if (this.audio) {
                    this.audio.playClick();
                }
            }, { passive: true });

            // 点击事件（PC端）
            card.addEventListener('click', () => {
                document.querySelectorAll('.ship-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedShip = card.dataset.ship;
                console.log('已选择飞船:', this.selectedShip);
            });
        });

        // 游戏模式按钮
        const normalModeBtn = document.getElementById('btn-normal-mode');
        const godModeBtn = document.getElementById('btn-god-mode');

        // 正常模式 - 触摸反馈
        normalModeBtn.addEventListener('touchstart', (e) => {
            normalModeBtn.style.transform = 'scale(0.95)';
            normalModeBtn.style.transition = 'transform 0.1s ease';
        }, { passive: true });

        normalModeBtn.addEventListener('touchend', (e) => {
            normalModeBtn.style.transform = '';
            this.startGame('normal');
        }, { passive: true });

        normalModeBtn.addEventListener('click', () => {
            this.startGame('normal');
        });

        // 无敌模式 - 触摸反馈
        godModeBtn.addEventListener('touchstart', (e) => {
            godModeBtn.style.transform = 'scale(0.95)';
            godModeBtn.style.transition = 'transform 0.1s ease';
        }, { passive: true });

        godModeBtn.addEventListener('touchend', (e) => {
            godModeBtn.style.transform = '';
            this.startGame('god');
        }, { passive: true });

        godModeBtn.addEventListener('click', () => {
            this.startGame('god');
        });

        // 设置按钮 - 触摸反馈
        const settingsBtn = document.getElementById('btn-settings');
        settingsBtn.addEventListener('touchstart', (e) => {
            settingsBtn.style.transform = 'scale(0.95)';
            settingsBtn.style.transition = 'transform 0.1s ease';
        }, { passive: true });

        settingsBtn.addEventListener('touchend', (e) => {
            settingsBtn.style.transform = '';
            this.showScreen('settings-menu');
        }, { passive: true });

        settingsBtn.addEventListener('click', () => {
            this.showScreen('settings-menu');
        });

        // 暂停菜单
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.pauseGame();
        });

        document.getElementById('btn-resume').addEventListener('click', () => {
            this.resumeGame();
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('btn-quit').addEventListener('click', () => {
            this.quitToMenu();
        });

        // 设置菜单
        document.getElementById('btn-settings-back').addEventListener('click', () => {
            if (this.state === 'playing') {
                this.showScreen('hud');
            } else {
                this.showScreen('main-menu');
            }
        });

        // 开关按钮
        this.bindToggle('toggle-sound', 'sound', (v) => this.audio.setEnabled(v));
        this.bindToggle('toggle-music', 'music', (v) => this.audio.setMusicEnabled(v));
        this.bindToggle('toggle-auto-aim-default', 'autoAim');
        this.bindToggle('toggle-vibration', 'vibration');

        // 自动瞄准开关
        document.getElementById('auto-aim-toggle').addEventListener('click', () => {
            if (this.player) {
                this.player.autoAim = !this.player.autoAim;
                this.updateAutoAimUI();
            }
        });

        // 升级界面
        document.getElementById('btn-upgrade-close').addEventListener('click', () => {
            this.showScreen('hud');
            this.state = 'playing';
        });

        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeType = e.target.closest('.upgrade-item').dataset.upgrade;
                this.upgradeAttribute(upgradeType);
            });
        });

        // 背包界面
        document.getElementById('btn-inventory-close').addEventListener('click', () => {
            this.showScreen('hud');
            this.state = 'playing';
        });

        // 背包道具栏点击事件
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const itemType = slot.dataset.item;
                this.useInventoryItem(itemType);
            });
        });

        // 背包界面中的使用按钮
        document.querySelectorAll('.use-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemType = e.target.dataset.item;
                this.useInventoryItem(itemType);
            });
        });

        // 游戏结束
        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('btn-go-menu').addEventListener('click', () => {
            this.quitToMenu();
        });
    }
    
    /**
     * 绑定升级选择按钮事件（使用事件委托）
     */
    bindUpgradeSelectionEvents() {
        // 使用事件委托，在容器上监听点击事件
        const container = document.getElementById('upgrade-selection-options');
        if (container) {
            container.addEventListener('click', (e) => {
                // 找到被点击的卡片
                const card = e.target.closest('.upgrade-option-card');
                if (card) {
                    const optionId = card.dataset.option;
                    console.log('点击升级选项:', optionId);
                    this.applyUpgradeOption(optionId);
                }
            });
        }
    }

    bindToggle(id, settingKey, callback) {
        const btn = document.getElementById(id);
        if (this.settings[settingKey]) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            this.settings[settingKey] = !this.settings[settingKey];
            btn.classList.toggle('active');
            this.saveSettings();

            if (callback) {
                callback(this.settings[settingKey]);
            }
        });
    }

    updateAutoAimUI() {
        const btn = document.getElementById('auto-aim-toggle');
        const status = btn.querySelector('.aim-status');

        if (this.player && this.player.autoAim) {
            btn.classList.add('active');
            status.textContent = 'ON';
        } else {
            btn.classList.remove('active');
            status.textContent = 'OFF';
        }
    }

    startGame(mode) {
        this.audio.resume();
        this.gameMode = mode;
        this.state = 'playing';
        this.gameTime = 0;
        
        // 重置敌人类型索引
        this._enemyTypeIndex = 0;

        // 创建玩家（使用选择的战舰）
        this.player = new Player(0, 0, this.selectedShip);
        this.player.autoAim = this.settings.autoAim;
        
        // 设置全局引用，让player可以访问particles
        window.game = this;

        // 无敌模式设置
        if (mode === 'god') {
            this.player.setInvincible(Infinity);
            this.player.maxHealth = 999999;
            this.player.health = 999999;
            this.player.energy = this.player.maxEnergy;
            
            // 无敌模式下速度翻倍（再乘以2）
            this.player.maxSpeed *= 2;
            this.player.levelBonuses.speedBonus *= 2;
            
            // 无敌模式下道具填满
            this.player.inventory.missile = 99;
            this.player.inventory.shield = 99;
            this.player.inventory.autoDodge = 99;
            this.player.inventory.energyCrystals = 99;
            this.player.inventory.scrapMetal = 99;
            this.player.inventory.rareMinerals = 99;
            
            // 设置无限时间（不需要倒计时）
            this.godModeTimer = Infinity;
            
            // 隐藏无敌模式倒计时UI（无限时间不需要显示）
            const timerElement = document.getElementById('god-mode-timer');
            if (timerElement) {
                timerElement.style.display = 'none';
            }
        } else {
            // 正常模式隐藏倒计时
            const timerElement = document.getElementById('god-mode-timer');
            if (timerElement) {
                timerElement.style.display = 'none';
            }
        }

        // 初始化波次
        this.waveManager = new WaveManager(this.gameMode);
        this.waveManager.startWave(1);

        // 清空对象
        this.enemies = [];
        this.bullets = [];
        this.cruiseMissiles = [];
        this.collectibles = [];
        this.particles.clear();

        // 重置相机
        this.camera.set(0, 0);

        // 更新UI
        this.updateHUD();
        this.updateAutoAimUI();
        this.updateModeIndicator();
        this.updateInventoryUI(); // 初始化背包UI
        this.showScreen('hud');

        // 播放背景音乐
        this.audio.playMusic();
    }

    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.showScreen('pause-menu');
        }
    }

    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.lastTime = performance.now();
            this.showScreen('hud');
        }
    }

    restartGame() {
        this.startGame(this.gameMode);
    }

    quitToMenu() {
        this.state = 'menu';
        this.audio.stopMusic();
        this.loadHighScore();
        this.showScreen('main-menu');
    }

    showScreen(screenId) {
        // 隐藏所有screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        // 显示目标screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            console.log('显示界面:', screenId);
        } else {
            console.warn('未找到界面:', screenId);
        }
    }

    updateModeIndicator() {
        const indicator = document.getElementById('mode-indicator');
        // 无论什么模式都隐藏模式标识
        indicator.style.display = 'none';
    }

    gameLoop(currentTime) {
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
        }
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.05);
        this.lastTime = currentTime;

        this.input.update();

        if (this.state === 'playing') {
            this.update(this.deltaTime);
        }

        if (this.starfield) {
            // 星空背景只需要渲染，不需要视差移动
            this.starfield.render();
        }
        
        // 更新和渲染背景装饰物
        if (this.bgDecorations) {
            const cameraVel = this.player ? this.player.velocity : Vector2.zero();
            this.bgDecorations.update(this.deltaTime, cameraVel.x * 30, cameraVel.y * 30);
            this.bgDecorations.render(this.ctx);
        }

        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime) {
        this.gameTime += deltaTime;

        // 无敌模式倒计时（仅在有限时间模式下）
        if (this.gameMode === 'god' && this.godModeTimer !== Infinity && this.godModeTimer > 0) {
            this.godModeTimer -= deltaTime;
            if (this.godModeTimer <= 0) {
                this.godModeTimer = 0;
                this.endGodMode();
            }
            // 更新倒计时UI
            this.updateGodModeTimerUI();
        }

        if (!this.player) return;

        // 更新玩家
        this.player.update(deltaTime, this.input, this.enemies, this.worldBounds);

        // 手动发射控制
        if (this.input.isFirePressed()) {
            const bulletResult = this.player.tryShoot();
            if (bulletResult) {
                // 支持返回单个子弹或子弹数组
                if (Array.isArray(bulletResult)) {
                    this.bullets.push(...bulletResult);
                } else {
                    this.bullets.push(bulletResult);
                }
                this.audio.playShoot();
            }
        }

        // 键盘快捷键
        this.handleKeyboardShortcuts();

        // 更新相机
        this.updateCamera(deltaTime);

        // 更新波次
        const newEnemy = this.waveManager.update(deltaTime, this.player, this.worldBounds);
        if (newEnemy) {
            this.enemies.push(newEnemy);
        }

        // 无敌模式：额外生成敌人
        if (this.gameMode === 'god') {
            this.updateGodModeSpawning(deltaTime);
        }

        // 更新敌人
        const enemySpeedMultiplier = this.gameMode === 'god' ? 1.5 : 1.0; // 无敌模式敌人速度1.5倍
        for (const enemy of this.enemies) {
            enemy.setSpeedMultiplier(enemySpeedMultiplier); // 设置速度乘数
            const enemyBullet = enemy.update(deltaTime, this.player, this.worldBounds);
            if (enemyBullet) {
                this.bullets.push(enemyBullet);
            }
        }

        // 更新子弹
        for (const bullet of this.bullets) {
            bullet.update(deltaTime);
        }

        // 更新巡航导弹
        for (const missile of this.cruiseMissiles) {
            missile.update(deltaTime, this.enemies);
        }

        // 更新收集物
        for (const collectible of this.collectibles) {
            collectible.update(deltaTime, this.player);
        }

        // 碰撞检测
        this.checkCollisions();

        // 更新粒子
        this.particles.update(deltaTime);

        // 清理死亡对象
        this.cleanup();

        // 检查波次完成
        if (this.waveManager.checkWaveComplete(this.enemies)) {
            if (this.gameMode === 'normal') {
                this.player.heal(20);
                this.player.rechargeEnergy(30);
            }
        }

        // 检查游戏结束
        if (this.gameMode === 'normal' && !this.player.isAlive()) {
            this.gameOver();
        }

        // 更新HUD
        this.updateHUD();
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts() {
        // U键打开升级界面（有技能点时）
        if (this.input.isKeyJustPressed('KeyU')) {
            if (this.player && this.player.skillPoints > 0) {
                this.state = 'upgrade';
                this.updateUpgradeUI();
                this.showScreen('upgrade-menu');
            }
        }
        
        // I键打开背包
        if (this.input.isKeyJustPressed('KeyI')) {
            if (this.state === 'playing') {  // 只在游戏中可以打开
                this.state = 'inventory';
                this.updateInventoryUI();
                this.showScreen('inventory-menu');
            }
        }
    }

    updateCamera(deltaTime) {
        if (!this.player) return;

        const targetX = this.player.position.x;
        const targetY = this.player.position.y;

        this.camera.x = Utils.lerp(this.camera.x, targetX, this.cameraSmooth);
        this.camera.y = Utils.lerp(this.camera.y, targetY, this.cameraSmooth);
    }

    updateGodModeSpawning(deltaTime) {
        // 无敌模式：根据等级指数级增加敌人生成
        const playerLevel = this.player ? this.player.level : 1;
        
        // 计算当前屏幕中的敌人数量
        const currentEnemyCount = this.enemies.filter(e => e.isAlive()).length;
        const maxEnemies = 30; // 屏幕中最多30个敌人
        
        // 如果已经达到上限，不再生成
        if (currentEnemyCount >= maxEnemies) {
            return;
        }
        
        // 指数级生成公式：基础率 * (1 + 等级 * 0.5)^2
        const levelMultiplier = Math.pow(1 + playerLevel * 0.5, 2);
        const baseSpawnRate = 5 * levelMultiplier; // 基础生成率从0.5提升到5
        
        // 计算本次应该生成的数量（考虑剩余空间）
        const availableSlots = maxEnemies - currentEnemyCount;
        const desiredSpawnCount = Math.floor(baseSpawnRate * deltaTime * 3); // 系数从2提升到3
        const spawnCount = Math.min(desiredSpawnCount, availableSlots);
        
        // 所有敌人类型列表
        const allTypes = [
            // 基础类型（SVG）
            'basic', 'fast', 'tank', 'shooter', 'asteroid', 'sniper', 'swarmer',
            // 新增类型（PNG）- 确保都能出现
            'scout', 'cruiser', 'destroyer', 'frigate', 'carrier',
            'interceptor', 'battleship', 'bomber', 'stealth',
            'support', 'elite', 'commander'
        ];
        
        // 初始化敌人类型索引计数器
        if (!this._enemyTypeIndex) {
            this._enemyTypeIndex = 0;
        }
        
        for (let i = 0; i < spawnCount; i++) {
            const spawnPos = Utils.randomSpawnPosition(
                this.player.position.x,
                this.player.position.y,
                this.canvas.width,
                this.canvas.height,
                50
            );

            // 循环依次选择敌人类型，确保每种都能出现
            const type = allTypes[this._enemyTypeIndex % allTypes.length];
            this._enemyTypeIndex++;
            
            const enemy = new Enemy(spawnPos.x, spawnPos.y, type);
            
            // 无敌模式：根据等级提升敌人属性
            const difficultyMultiplier = 1 + (playerLevel * 0.2); // 每级+20%难度
            enemy.health *= difficultyMultiplier;
            enemy.maxHealth *= difficultyMultiplier;
            enemy.damage *= difficultyMultiplier;
            enemy.speed *= (1 + playerLevel * 0.08); // 每级+8%速度
            
            this.enemies.push(enemy);
            
            // 调试日志：显示生成的敌人类型（仅前10个）
            if (!enemy._spawnLogged && currentEnemyCount < 10) {
                console.log(`👾 Lv.${playerLevel} 生成: ${type} (HP:${enemy.health.toFixed(0)}, DMG:${enemy.damage.toFixed(0)})`);
                enemy._spawnLogged = true;
            }
        }
    }

    checkCollisions() {
        if (!this.player || !this.player.isAlive()) return;

        // 优化：只检测视口内的对象（提升性能）
        const viewportMargin = 200;
        const visibleEnemies = this.enemies.filter(e => 
            e.isAlive() && 
            Math.abs(e.position.x - this.camera.x) < this.canvas.width/2 + viewportMargin &&
            Math.abs(e.position.y - this.camera.y) < this.canvas.height/2 + viewportMargin
        );
        
        const visibleBullets = this.bullets.filter(b => 
            b.isAlive() &&
            Math.abs(b.position.x - this.camera.x) < this.canvas.width/2 + viewportMargin &&
            Math.abs(b.position.y - this.camera.y) < this.canvas.height/2 + viewportMargin
        );

        // 玩家子弹 vs 敌人（只检测可见对象）
        for (const bullet of visibleBullets) {
            if (!bullet.isAlive() || bullet.owner !== 'player') continue;

            // 射线特殊处理：可以穿透多个敌人
            if (bullet.bulletType === 'ray' && bullet.rayStart && bullet.rayEnd) {
                this.checkRayCollision(bullet, visibleEnemies);
            } else {
                // 普通子弹碰撞
                for (const enemy of visibleEnemies) {
                    if (!enemy.isAlive()) continue;

                    if (bullet.checkCollision(enemy)) {
                        bullet.active = false;

                        const died = enemy.takeDamage(bullet.damage);
                        this.particles.createHitSpark(bullet.position.x, bullet.position.y);
                        this.audio.playHit();

                        if (died) {
                            this.handleEnemyDeath(enemy);

                            // 掉落收集物
                            this.spawnCollectibles(enemy.position, enemy.type);

                            Utils.vibrate(30);
                        }

                        break;
                    }
                }
            }
        }

        // 敌人子弹 vs 玩家（无敌模式也检测碰撞，但不扣血）
        for (const bullet of visibleBullets) {
            if (!bullet.isAlive() || bullet.owner !== 'enemy') continue;

            if (bullet.checkCollision(this.player)) {
                bullet.active = false;

                const died = this.player.takeDamage(bullet.damage);
                this.particles.createHitSpark(bullet.position.x, bullet.position.y);
                this.audio.playHit();

                if (died) {
                    this.particles.createExplosion(
                        this.player.position.x,
                        this.player.position.y,
                        '#6366f1',
                        30
                    );
                    this.audio.playExplosion();
                    Utils.vibrate([100, 50, 100]);
                } else {
                    Utils.vibrate(50);
                }

                break;
            }
        }

        // 敌人 vs 玩家碰撞（无敌模式也检测碰撞，但不扣血）
        for (const enemy of visibleEnemies) {
            if (!enemy.isAlive()) continue;

            if (enemy.checkCollision(this.player)) {
                // 无敌模式下，玩家撞毁敌人
                if (this.gameMode === 'god') {
                    // 播放爆炸特效
                    this.particles.createExplosion(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        15
                    );
                    this.particles.createDebris(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color
                    );
                    this.audio.playExplosion();
                    
                    // 增加分数和击杀数
                    this.player.addScore(enemy.scoreValue);
                    this.player.addKill();
                    const leveledUp = this.player.addExperience(enemy.scoreValue / 10);
                    if (leveledUp) {
                        this.updateInventoryUI();
                        this.checkLevelUpSelection();
                    }
                    
                    // 掉落收集物
                    this.spawnCollectibles(enemy.position, enemy.type);
                    
                    // 销毁敌人
                    enemy.health = 0;
                    
                    Utils.vibrate(30);
                } else {
                    // 正常模式：玩家受击
                    this.player.handleCollision(enemy);

                    const damage = enemy.damage;
                    const died = this.player.takeDamage(damage);

                    this.particles.createHitSpark(
                        (this.player.position.x + enemy.position.x) / 2,
                        (this.player.position.y + enemy.position.y) / 2
                    );

                    if (died) {
                        this.particles.createExplosion(
                            this.player.position.x,
                            this.player.position.y,
                            '#6366f1',
                            30
                        );
                        this.audio.playExplosion();
                        Utils.vibrate([100, 50, 100]);
                    } else {
                        this.audio.playHit();
                        Utils.vibrate(50);
                    }
                }
            }
        }

        // 玩家 vs 收集物
        for (const collectible of this.collectibles) {
            if (!collectible.active) continue;

            if (collectible.position.distance(this.player.position) < collectible.radius + this.player.radius + 10) {
                const effect = collectible.getCollectEffect();
                
                // 处理经验值收集（统一升级逻辑）
                if (effect.type === 'exp') {
                    const leveledUp = this.player.addExperience(effect.value);
                    if (leveledUp) {
                        this.updateInventoryUI();
                        this.checkLevelUpSelection();
                    }
                } else {
                    this.collectCollectible(collectible);
                }
            }
        }

        // 敌人之间碰撞（优化：只检测相邻敌人）
        this.checkEnemyCollisions();
    }
    
    /**
     * 优化敌人碰撞检测（空间分区简化版）
     */
    checkEnemyCollisions() {
        const aliveEnemies = this.enemies.filter(e => e.isAlive());
        const cellSize = 100; // 网格大小
        const grid = new Map();
        
        // 将敌人分配到网格
        for (const enemy of aliveEnemies) {
            const gridX = Math.floor(enemy.position.x / cellSize);
            const gridY = Math.floor(enemy.position.y / cellSize);
            const key = `${gridX},${gridY}`;
            
            if (!grid.has(key)) {
                grid.set(key, []);
            }
            grid.get(key).push(enemy);
        }
        
        // 只检测同一网格和相邻网格的敌人
        const checked = new Set();
        for (const [key, enemies] of grid) {
            const [gx, gy] = key.split(',').map(Number);
            
            // 检查当前网格和周围8个网格
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const neighborKey = `${gx + dx},${gy + dy}`;
                    const neighbors = grid.get(neighborKey);
                    if (!neighbors) continue;
                    
                    for (const e1 of enemies) {
                        for (const e2 of neighbors) {
                            if (e1 === e2) continue;
                            
                            // 使用唯一标识避免重复检测
                            const pairId = e1.id < e2.id ? `${e1.id}-${e2.id}` : `${e2.id}-${e1.id}`;
                            if (checked.has(pairId)) continue;
                            checked.add(pairId);
                            
                            e1.handleCollision(e2);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * 射线碰撞检测（穿透多个敌人）- 优化版
     */
    checkRayCollision(rayBullet, visibleEnemies) {
        const rayStart = rayBullet.rayStart;
        const rayEnd = rayBullet.rayEnd;
        let hitCount = 0;
        
        // 预计算射线方向向量和长度平方
        const rayDir = Vector2.sub(rayEnd, rayStart);
        const rayLenSq = rayDir.magnitudeSquared();
        
        // 避免除以零
        if (rayLenSq < 0.001) return;
        
        // 检测所有可见敌人与射线的碰撞
        for (const enemy of visibleEnemies) {
            if (!enemy.isAlive()) continue;
            
            // 快速排除：检查敌人是否在射线的包围盒内
            const toEnemy = Vector2.sub(enemy.position, rayStart);
            const projection = Vector2.dot(toEnemy, rayDir) / rayLenSq;
            
            // 如果投影点不在线段范围内，跳过
            if (projection < -0.1 || projection > 1.1) continue;
            
            // 精确检测：计算点到线段的距离
            const dist = this.pointToLineDistance(enemy.position, rayStart, rayEnd);
            
            if (dist < enemy.radius + rayBullet.radius) {
                // 射线击中敌人
                const died = enemy.takeDamage(rayBullet.damage);
                this.particles.createHitSpark(enemy.position.x, enemy.position.y);
                this.audio.playHit();
                hitCount++;
                
                if (died) {
                    this.handleEnemyDeath(enemy);
                }
            }
        }
        
        // 射线击中特效
        if (hitCount > 0) {
            console.log(`射线击中 ${hitCount} 个敌人`);
        }
    }
    
    /**
     * 计算点到线段的距离
     */
    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    spawnCollectibles(position, enemyType) {
        const rand = Math.random();
        const isGodMode = this.gameMode === 'god';

        // 根据敌人类型决定掉落
        if (enemyType === 'asteroid') {
            // 小行星掉落矿物
            if (Math.random() < 0.3) {
                this.collectibles.push(new Collectible(position.x, position.y, 'scrapMetal'));
            }
            if (Math.random() < 0.1) {
                this.collectibles.push(new Collectible(position.x + 20, position.y, 'rareMineral'));
            }
            return;
        }

        // 普通敌人掉落
        if (rand < 0.35) {
            this.collectibles.push(new Collectible(position.x, position.y, 'energy'));
        } else if (rand < 0.50) {
            this.collectibles.push(new Collectible(position.x, position.y, 'exp'));
        } else if (rand < 0.58) {
            this.collectibles.push(new Collectible(position.x, position.y, 'health'));
        }

        // 稀有掉落
        if (Math.random() < 0.05) {
            this.collectibles.push(new Collectible(position.x + 15, position.y, 'energyLarge'));
        }
        if (Math.random() < 0.05) {
            this.collectibles.push(new Collectible(position.x - 15, position.y, 'expLarge'));
        }
        
        // 背包道具掉落 + 自动收集机制（统一处理）
        const autoCollectItems = [
            { type: 'missile', chance: 0.08 },
            { type: 'shield', chance: 0.06 },
            { type: 'autoDodge', chance: 0.05 }
        ];
        
        for (const item of autoCollectItems) {
            if (Math.random() < item.chance) {
                // 正常模式：80%概率自动收集
                if (!isGodMode && Math.random() < 0.8) {
                    this.player.inventory[item.type] += 1;
                    console.log(`🎁 自动获得${this.getItemName(item.type)}！`);
                    this.updateInventoryUI();
                } else {
                    // 生成掉落物
                    const offset = Utils.randomRange(-15, 15);
                    this.collectibles.push(new Collectible(
                        position.x + offset, 
                        position.y + offset, 
                        item.type
                    ));
                }
            }
        }
        
        // 巡航导弹掉落已移除（无限制模式）
        // 玩家可以通过升级解锁新的导弹类型
        
        // 无敌模式特殊掉落：时间水晶（5%概率）
        if (isGodMode && Math.random() < 0.05) {
            this.collectibles.push(new Collectible(position.x, position.y + 15, 'timeCrystal'));
        }
    }
    
    /**
     * 获取道具中文名
     */
    getItemName(type) {
        const names = {
            missile: '导弹',
            shield: '护盾',
            autoDodge: '避险'
        };
        return names[type] || type;
    }
    
    /**
     * 处理敌人死亡（统一逻辑）
     */
    handleEnemyDeath(enemy) {
        // 播放爆炸特效
        this.particles.createExplosion(
            enemy.position.x,
            enemy.position.y,
            enemy.color,
            15
        );
        this.particles.createDebris(
            enemy.position.x,
            enemy.position.y,
            enemy.color
        );
        this.audio.playExplosion();

        // 增加分数和击杀数
        this.player.addScore(enemy.scoreValue);
        this.player.addKill();
        
        // 处理升级
        const leveledUp = this.player.addExperience(enemy.scoreValue / 10);
        if (leveledUp) {
            this.updateInventoryUI();
            this.checkLevelUpSelection();
        }

        Utils.vibrate(30);
    }

    collectCollectible(collectible) {
        collectible.active = false;
        const effect = collectible.getCollectEffect();

        switch (effect.type) {
            case 'energy':
                this.player.rechargeEnergy(effect.value);
                break;
            case 'exp':
                const hasItemReward = this.player.addExperience(effect.value);
                if (hasItemReward) {
                    // 如果升级获得道具奖励，更新背包UI
                    this.updateInventoryUI();
                }
                // 检查是否触发升级选择
                this.checkLevelUpSelection();
                break;
            case 'health':
                this.player.heal(effect.value);
                break;
            case 'item':
                this.player.addItem(effect.itemType, effect.value);
                // 更新背包UI
                this.updateInventoryUI();
                break;
            case 'time':
                // 时间水晶 - 延长无敌模式时间
                if (this.gameMode === 'god') {
                    this.godModeTimer += effect.value;
                    console.log('拾取时间水晶！增加', effect.value, '秒');
                }
                break;
        }

        this.particles.createCollectEffect(collectible.position.x, collectible.position.y);
        this.audio.playCollect();
    }
    
    /**
     * 检查是否触发升级选择（每次升级后自动弹出）
     */
    checkLevelUpSelection() {
        if (!this.player) return;
        
        // 如果有技能点未使用，显示升级选择
        if (this.player.skillPoints > 0 && this.state === 'playing') {
            this.state = 'upgrade_selection';
            this.showUpgradeSelection();
        }
    }
    
    /**
     * 显示升级选择弹窗
     */
    showUpgradeSelection() {
        const options = this.player.getLevelUpOptions();
        
        // 保存当前显示的选项，供 applyUpgradeOption 使用
        this.currentUpgradeOptions = options;
        
        const container = document.getElementById('upgrade-selection-options');
        
        if (!container) {
            console.error('未找到升级选项容器');
            return;
        }
        
        console.log('生成升级选项，数量:', options.length);
        
        // 清空现有选项
        container.innerHTML = '';
        
        // 创建选项卡片
        options.forEach((option, index) => {
            const card = document.createElement('div');
            card.className = 'upgrade-option-card';
            card.dataset.option = option.id;
            
            card.innerHTML = `
                <div class="option-icon">${option.icon}</div>
                <div class="option-info">
                    <h4>${option.name}</h4>
                    <p>${option.description}</p>
                </div>
            `;
            
            container.appendChild(card);
            console.log(`创建选项 ${index + 1}:`, option.id, option.name);
        });
        
        // 更新等级显示
        document.getElementById('upgrade-selection-level').textContent = this.player.level;
        
        console.log('显示升级选择弹窗');
        // 显示弹窗
        this.showScreen('upgrade-selection-menu');
    }

    upgradeAttribute(attribute) {
        if (!this.player) return;

        if (this.player.upgradeAttribute(attribute)) {
            this.updateUpgradeUI();
            this.updateHUD();
        }
    }
    
    /**
     * 应用升级选项（新的升级系统）
     */
    applyUpgradeOption(optionId) {
        if (!this.player) return;
        
        console.log('应用升级选项 ID:', optionId);
        
        // 使用保存的当前选项，而不是重新生成
        const options = this.currentUpgradeOptions || [];
        const selectedOption = options.find(opt => opt.id === optionId);
        
        if (selectedOption) {
            console.log('找到升级选项:', selectedOption.name);
            this.player.applyUpgradeOption(selectedOption);
            console.log('升级应用成功，关闭弹窗');
            this.closeUpgradeSelection();
            this.updateHUD();
            console.log('已选择升级:', selectedOption.name);
        } else {
            console.error('未找到升级选项:', optionId);
            console.error('当前可用选项:', options.map(opt => opt.id));
        }
    }
    
    /**
     * 关闭升级选择弹窗
     */
    closeUpgradeSelection() {
        console.log('关闭升级选择弹窗，当前技能点:', this.player.skillPoints);
        this.showScreen('hud');
        this.state = 'playing';
        
        // 只有当还有未使用的技能点时，才检查是否需要再次弹出
        // （例如一次性升多级的情况）
        if (this.player.skillPoints > 0) {
            console.warn(`还有 ${this.player.skillPoints} 个未使用的技能点`);
            // 不自动弹出，让玩家按U键手动打开升级界面
        } else {
            console.log('所有技能点已使用完毕');
        }
    }

    updateUpgradeUI() {
        if (!this.player) return;

        document.getElementById('upgrade-level').textContent = this.player.level;
        document.getElementById('upgrade-points').textContent = this.player.skillPoints;

        // 更新按钮状态
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.disabled = this.player.skillPoints <= 0;
        });
    }

    useInventoryItem(itemType) {
        if (!this.player) return;

        // 检查是否有该道具（无敌模式跳过检查）
        if (this.gameMode !== 'god' && this.player.inventory[itemType] <= 0) {
            console.log('道具不足:', itemType);
            this.showItemCountWarning(itemType);
            return;
        }

        const oldCount = this.player.inventory[itemType];
        
        // 无敌模式：不消耗道具数量
        if (this.gameMode !== 'god') {
            const result = this.player.useItem(itemType);
            
            // 播放特效（根据道具类型）
            this.playItemEffect(itemType, this.player.position.x, this.player.position.y);
            
            // 处理导弹发射
            if (result === 'missile') {
                this.fireMissile();
            }
            
            // 更新UI
            this.updateInventoryUI();
            this.updateHUD();
            
            // 显示使用动画
            this.showItemUseAnimation(itemType, oldCount - 1);
            
            console.log('使用道具:', itemType, '剩余:', this.player.inventory[itemType]);
        } else {
            // 无敌模式：直接执行效果，不减少数量
            this.useItemGodMode(itemType);
            
            // 更新UI
            this.updateInventoryUI();
            this.updateHUD();
            
            // 显示使用动画（但不显示数量变化）
            this.showItemUseAnimationGodMode(itemType);
            
            console.log('【无敌模式】使用道具:', itemType, '数量不变');
        }
    }
    
    /**
     * 播放道具特效
     */
    playItemEffect(itemType, x, y) {
        switch (itemType) {
            case 'shield':
                this.particles.createShieldEffect(x, y);
                break;
            case 'autoDodge':
                this.particles.createAutoDodgeEffect(x, y);
                break;
            case 'energyCrystals':
                this.particles.createEnergyEffect(x, y);
                break;
            case 'scrapMetal':
            case 'rareMinerals':
                this.particles.createHealthEffect(x, y);
                break;
            case 'missile':
                this.particles.createMissileLaunchEffect(x, y);
                break;
        }
    }
    
    /**
     * 无敌模式使用道具
     */
    useItemGodMode(itemType) {
        const px = this.player.position.x;
        const py = this.player.position.y;
        
        switch (itemType) {
            case 'energyCrystals':
                this.player.rechargeEnergy(30);
                this.particles.createEnergyEffect(px, py);
                break;
            case 'scrapMetal':
                this.player.heal(15);
                this.particles.createHealthEffect(px, py);
                break;
            case 'rareMinerals':
                this.player.heal(25);
                this.player.rechargeEnergy(20);
                this.particles.createHealthEffect(px, py);
                break;
            case 'missile':
                this.particles.createMissileLaunchEffect(px, py);
                this.fireMissile();
                break;
            case 'shield':
                this.player.setInvincible(5);
                this.particles.createShieldEffect(px, py);
                break;
            case 'autoDodge':
                this.player.autoDodgeActive = true;
                this.player.autoDodgeTimer = 10;
                this.particles.createAutoDodgeEffect(px, py);
                break;
        }
    }

    // 发射导弹
    fireMissile() {
        if (!this.player || this.enemies.length === 0) return;

        // 找到最近的敌人作为目标
        let nearest = null;
        let nearestDist = Infinity;

        for (const enemy of this.enemies) {
            if (!enemy.isAlive()) continue;

            const dist = this.player.position.distanceSquared(enemy.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        if (!nearest) return;

        // 创建导弹
        const spawnOffset = Vector2.fromAngle(this.player.angle, this.player.radius + 5);
        const spawnPos = Vector2.add(this.player.position, spawnOffset);
        const initialVelocity = Vector2.fromAngle(this.player.angle, 8);

        const missile = new Bullet(
            spawnPos.x,
            spawnPos.y,
            initialVelocity.x,
            initialVelocity.y,
            50,  // 高伤害
            'player',
            'missile'
        );

        // 设置追踪目标
        missile.target = nearest;

        this.bullets.push(missile);
        this.audio.playShoot();

        console.log('发射导弹！目标:', nearest.type);
    }

    /**
     * 显示道具使用动画
     */
    showItemUseAnimation(itemType, newCount) {
        const slot = document.querySelector(`.inventory-slot[data-item="${itemType}"]`);
        if (!slot) return;
        
        // 添加使用动画类
        slot.classList.add('using');
        setTimeout(() => {
            slot.classList.remove('using');
        }, 300);
        
        // 显示数量变化提示
        this.showCountChange(slot, -1);
    }
    
    /**
     * 无敌模式道具使用动画（不显示数量变化）
     */
    showItemUseAnimationGodMode(itemType) {
        const slot = document.querySelector(`.inventory-slot[data-item="${itemType}"]`);
        if (!slot) return;
        
        // 添加使用动画类
        slot.classList.add('using');
        setTimeout(() => {
            slot.classList.remove('using');
        }, 300);
        
        // 不显示数量变化提示（因为数量不变）
    }
    
    /**
     * 显示数量变化提示
     */
    showCountChange(slot, change) {
        const changeEl = document.createElement('div');
        changeEl.className = 'count-change' + (change < 0 ? ' negative' : '');
        changeEl.textContent = change > 0 ? `+${change}` : `${change}`;
        slot.appendChild(changeEl);
        
        // 800ms后移除
        setTimeout(() => {
            changeEl.remove();
        }, 800);
    }
    
    /**
     * 显示道具不足警告
     */
    showItemCountWarning(itemType) {
        const slot = document.querySelector(`.inventory-slot[data-item="${itemType}"]`);
        if (!slot) return;
        
        // 闪烁红色边框
        slot.style.borderColor = '#ef4444';
        slot.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.6)';
        
        setTimeout(() => {
            slot.style.borderColor = '';
            slot.style.boxShadow = '';
        }, 500);
    }

    updateInventoryUI() {
        if (!this.player) return;

        // 更新数量显示（无敌模式显示99+）
        const displayCount = (count) => this.gameMode === 'god' ? '99+' : count;
        
        // 更新HUD界面的道具数量
        document.getElementById('inv-energy').textContent = displayCount(this.player.inventory.energyCrystals);
        document.getElementById('inv-scrap').textContent = displayCount(this.player.inventory.scrapMetal);
        document.getElementById('inv-mineral').textContent = displayCount(this.player.inventory.rareMinerals);
        document.getElementById('inv-missile').textContent = displayCount(this.player.inventory.missile);
        document.getElementById('inv-shield').textContent = displayCount(this.player.inventory.shield);
        document.getElementById('inv-autododge').textContent = displayCount(this.player.inventory.autoDodge);
        
        // 更新背包菜单中的道具数量
        const menuEnergyElement = document.getElementById('inv-menu-energy');
        if (menuEnergyElement) menuEnergyElement.textContent = displayCount(this.player.inventory.energyCrystals);
        
        const menuScrapElement = document.getElementById('inv-menu-scrap');
        if (menuScrapElement) menuScrapElement.textContent = displayCount(this.player.inventory.scrapMetal);
        
        const menuMineralElement = document.getElementById('inv-menu-mineral');
        if (menuMineralElement) menuMineralElement.textContent = displayCount(this.player.inventory.rareMinerals);

        // 隐藏数量为0的道具格子（正常模式）
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            const itemType = slot.dataset.item;
            const count = this.player.inventory[itemType];
            
            if (count <= 0) {
                // 隐藏空道具
                slot.style.display = 'none';
            } else {
                // 显示有数量的道具
                slot.style.display = 'flex';
                slot.classList.remove('empty');
            }
        });
    }

    cleanup() {
        // 清理死亡对象
        this.enemies = this.enemies.filter(e => e.isAlive());
        this.bullets = this.bullets.filter(b => b.isAlive());
        this.cruiseMissiles = this.cruiseMissiles.filter(m => m.active);
        this.collectibles = this.collectibles.filter(c => c.active);
        
        // 定期清理粒子系统（每10秒）
        if (Math.floor(this.gameTime) % 10 === 0 && this.particles.particles.length > 500) {
            this.particles.clear();
        }
    }

    gameOver() {
        this.state = 'gameover';

        // 保存最高分
        this.player.saveHighScore();

        // 更新最终统计
        document.getElementById('final-score').textContent = Utils.formatNumber(this.player.score);
        document.getElementById('final-wave').textContent = this.waveManager.currentWave;
        document.getElementById('final-kills').textContent = this.player.kills;
        document.getElementById('final-level').textContent = this.player.level;
        document.getElementById('final-high-score').textContent = Utils.formatNumber(this.player.highScore);

        this.showScreen('game-over');
        this.audio.stopMusic();
    }

    updateHUD() {
        if (!this.player) return;

        // 血量
        const healthPercent = this.player.getHealthPercent() * 100;
        document.getElementById('health-bar').style.width = `${healthPercent}%`;
        document.getElementById('health-text').textContent =
            `${Math.ceil(this.player.health)}/${Math.ceil(this.player.getMaxHealth())}`;

        // 能源
        const energyPercent = this.player.getEnergyPercent() * 100;
        document.getElementById('energy-bar').style.width = `${energyPercent}%`;
        document.getElementById('energy-text').textContent =
            `${Math.ceil(this.player.energy)}/${Math.ceil(this.player.getMaxEnergy())}`;

        // 经验
        const expPercent = this.player.getExpPercent() * 100;
        document.getElementById('exp-bar').style.width = `${expPercent}%`;
        document.getElementById('level-text').textContent = `Lv.${this.player.level}`;

        // 得分
        document.getElementById('score-value').textContent = Utils.formatNumber(this.player.score);

        // 波次
        document.getElementById('wave-value').textContent = this.waveManager.currentWave;

        // 最高分
        document.getElementById('high-score-value').textContent = Utils.formatNumber(this.player.highScore);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state !== 'playing' && this.state !== 'paused' &&
            this.state !== 'upgrade' && this.state !== 'inventory') return;

        this.ctx.save();

        const offsetX = this.canvas.width / 2 - this.camera.x;
        const offsetY = this.canvas.height / 2 - this.camera.y;
        this.ctx.translate(offsetX, offsetY);

        // 绘制世界边界
        this.renderWorldBounds();

        // 绘制收集物
        for (const collectible of this.collectibles) {
            collectible.render(this.ctx);
        }

        // 绘制粒子
        this.particles.render(this.ctx);

        // 绘制子弹
        for (const bullet of this.bullets) {
            bullet.render(this.ctx);
        }

        // 绘制巡航导弹
        for (const missile of this.cruiseMissiles) {
            missile.render(this.ctx);
        }

        // 绘制敌人
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }

        // 绘制玩家
        if (this.player) {
            this.player.render(this.ctx);
        }

        this.ctx.restore();
    }

    renderWorldBounds() {
        const ctx = this.ctx;
        const bounds = this.worldBounds;

        ctx.save();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 20]);
        ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);

        ctx.setLineDash([]);
        const cornerSize = 30;
        const corners = [
            { x: bounds.left, y: bounds.top },
            { x: bounds.right, y: bounds.top },
            { x: bounds.left, y: bounds.bottom },
            { x: bounds.right, y: bounds.bottom }
        ];

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        for (const corner of corners) {
            ctx.beginPath();
            ctx.moveTo(corner.x, corner.y + cornerSize);
            ctx.lineTo(corner.x, corner.y);
            ctx.lineTo(corner.x + cornerSize, corner.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 更新无敌模式倒计时UI
     */
    updateGodModeTimerUI() {
        const timerValue = document.getElementById('god-timer-value');
        const timerElement = document.getElementById('god-mode-timer');
        const progressBar = document.getElementById('god-timer-progress');
        
        if (!timerValue || !timerElement) return;

        // 无限时间模式不显示倒计时
        if (this.godModeTimer === Infinity || this.godModeTimer > 9999) {
            timerElement.style.display = 'none';
            return;
        }
        
        // 时间为0或负数时隐藏
        if (this.godModeTimer <= 0) {
            timerValue.textContent = '0';
            timerElement.style.display = 'none';
            return;
        }

        const maxTime = 60; // 最大时间
        const progress = Math.min((this.godModeTimer / maxTime) * 100, 100);

        // 更新进度条
        if (progressBar) {
            progressBar.style.width = progress + '%';
            
            // 最后10秒进度条变红
            if (this.godModeTimer <= 10) {
                progressBar.classList.add('warning');
            } else {
                progressBar.classList.remove('warning');
            }
        }

        // 格式化时间显示
        const seconds = Math.ceil(this.godModeTimer);
        timerValue.textContent = seconds + 's';
        
        // 最后10秒红色警告
        if (seconds <= 10) {
            timerValue.classList.add('warning');
        } else {
            timerValue.classList.remove('warning');
        }
    }

    /**
     * 结束无敌模式
     */
    endGodMode() {
        console.log('无敌模式结束！');
        
        // 播放大爆炸特效
        const px = this.player.position.x;
        const py = this.player.position.y;
        this.createGodModeEndEffect(px, py);
        
        // 隐藏倒计时UI
        const timerElement = document.getElementById('god-mode-timer');
        if (timerElement) {
            timerElement.style.display = 'none';
        }
        
        // 取消玩家无敌状态
        if (this.player) {
            this.player.invincible = false;
            this.player.invincibleTimer = 0;
            
            // 恢复正常生命值和能源
            this.player.maxHealth = 100;
            this.player.health = 100;
            this.player.energy = this.player.maxEnergy;
            
            // 清空道具
            this.player.inventory.missile = 0;
            this.player.inventory.shield = 0;
            this.player.inventory.autoDodge = 0;
            this.player.inventory.energyCrystals = 0;
            this.player.inventory.scrapMetal = 0;
            this.player.inventory.rareMinerals = 0;
            
            // 更新UI
            this.updateInventoryUI();
            this.updateHUD();
        }
        
        // 切换到正常模式
        this.gameMode = 'normal';
        this.updateModeIndicator();
        
        // 播放音效提示
        this.audio.playHit();
        
        // 显示警告提示
        this.showGodModeEndWarning();
    }
    
    /**
     * 创建无敌模式结束的大爆炸特效
     */
    createGodModeEndEffect(x, y) {
        // 外层橙色爆炸
        for (let i = 0; i < 40; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(3, 8);
            this.particles.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#f59e0b',
                Utils.randomRange(0.5, 1.0),
                Utils.randomRange(4, 8)
            ));
        }
        
        // 内层红色闪光
        for (let i = 0; i < 20; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const speed = Utils.randomRange(1, 4);
            this.particles.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ef4444',
                Utils.randomRange(0.3, 0.7),
                Utils.randomRange(3, 6)
            ));
        }
        
        // 白色核心闪光
        for (let i = 0; i < 10; i++) {
            const angle = Utils.randomRange(0, Math.PI * 2);
            const dist = Utils.randomRange(0, 10);
            this.particles.particles.push(new Particle(
                x + Math.cos(angle) * dist,
                y + Math.sin(angle) * dist,
                0, 0,
                '#ffffff',
                Utils.randomRange(0.2, 0.5),
                Utils.randomRange(5, 10)
            ));
        }
    }
    
    /**
     * 显示无敌模式结束警告
     */
    showGodModeEndWarning() {
        // 创建一个临时的警告文本
        const warning = document.createElement('div');
        warning.className = 'god-mode-end-warning';
        warning.textContent = '⚠️ 无敌模式已结束';
        document.body.appendChild(warning);
        
        // 2秒后移除
        setTimeout(() => {
            warning.remove();
        }, 2000);
    }
}
