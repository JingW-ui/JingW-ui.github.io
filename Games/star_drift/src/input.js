/**
 * 输入控制系统 - 虚拟双摇杆 + 触摸/鼠标/键盘
 * 支持：手动发射控制、PC键盘移动、背包/升级快捷键
 */
class InputManager {
    constructor() {
        // 左摇杆 (移动)
        this.leftStick = {
            active: false,
            origin: new Vector2(0, 0),
            current: new Vector2(0, 0),
            vector: new Vector2(0, 0),
            maxDistance: 35,
            element: null,
            knob: null
        };

        // 右摇杆 (瞄准)
        this.rightStick = {
            active: false,
            origin: new Vector2(0, 0),
            current: new Vector2(0, 0),
            vector: new Vector2(0, 0),
            maxDistance: 35,
            element: null,
            knob: null
        };

        // 触摸ID映射
        this.touchMap = new Map();

        // 键盘状态
        this.keys = {};
        this.keysPressed = {}; // 单次触发

        // 鼠标状态
        this.mouse = {
            x: 0,
            y: 0,
            down: false,
            justPressed: false
        };

        // 发射按钮状态
        this.firePressed = false;
        this.fireJustPressed = false;

        this.init();
    }

    init() {
        // 获取摇杆DOM元素
        this.leftStick.element = document.getElementById('joystick-left');
        this.leftStick.knob = this.leftStick.element.querySelector('.joystick-knob');
        this.rightStick.element = document.getElementById('joystick-right');
        this.rightStick.knob = this.rightStick.element.querySelector('.joystick-knob');

        // 绑定触摸事件
        this.bindTouchEvents();

        // 绑定鼠标事件
        this.bindMouseEvents();

        // 绑定键盘事件
        this.bindKeyboardEvents();

        // 更新摇杆基准位置
        this.updateStickPositions();

        // 窗口大小改变时更新位置
        window.addEventListener('resize', () => {
            this.updateStickPositions();
        });

        // 绑定发射按钮事件
        this.bindFireButton();
    }

    updateStickPositions() {
        const updateStick = (stick) => {
            const rect = stick.element.querySelector('.joystick-base').getBoundingClientRect();
            stick.origin.x = rect.left + rect.width / 2;
            stick.origin.y = rect.top + rect.height / 2;
        };

        updateStick(this.leftStick);
        updateStick(this.rightStick);
    }

    bindTouchEvents() {
        const container = document.getElementById('game-container');

        container.addEventListener('touchstart', (e) => {
            // ❗ 关键修复：检查是否点击了UI元素
            const target = e.target;
            
            // 如果点击的是UI元素（按钮、卡片等），不处理游戏输入
            if (this.isUIElement(target)) {
                return; // 让UI元素自己的事件处理器处理
            }
            
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const x = touch.clientX;
                const y = touch.clientY;

                // 判断触摸区域
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // 左半屏 -> 左摇杆
                if (x < screenWidth / 2 && y > screenHeight / 2) {
                    this.startStick(this.leftStick, x, y, touch.identifier);
                }
                // 右半屏 -> 右摇杆
                else if (x >= screenWidth / 2 && y > screenHeight / 2) {
                    this.startStick(this.rightStick, x, y, touch.identifier);
                }
                // 上半屏 -> 发射按钮区域（触摸即发射）
                else if (y <= screenHeight / 2) {
                    this.firePressed = true;
                    this.fireJustPressed = true;
                }
            }
        }, { passive: false });

        container.addEventListener('touchmove', (e) => {
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const stick = this.getStickByTouchId(touch.identifier);

                if (stick) {
                    this.updateStick(stick, touch.clientX, touch.clientY);
                }
            }
        }, { passive: false });

        container.addEventListener('touchend', (e) => {
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const stick = this.getStickByTouchId(touch.identifier);

                if (stick) {
                    this.endStick(stick);
                }
            }

            // 检查是否还有触摸在上半屏
            const screenHeight = window.innerHeight;
            let hasTopTouch = false;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].clientY <= screenHeight / 2) {
                    hasTopTouch = true;
                    break;
                }
            }
            if (!hasTopTouch) {
                this.firePressed = false;
            }
        }, { passive: false });

        container.addEventListener('touchcancel', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const stick = this.getStickByTouchId(touch.identifier);

                if (stick) {
                    this.endStick(stick);
                }
            }
            this.firePressed = false;
        });
    }

    /**
     * 判断是否是UI元素（不应该触发游戏输入的元素）
     */
    isUIElement(element) {
        if (!element) return false;
        
        // 检查元素本身及其父元素是否是UI元素
        let current = element;
        while (current && current !== document.body) {
            // 检查类名
            if (current.classList) {
                // 所有屏幕界面元素
                if (current.classList.contains('screen') ||
                    current.classList.contains('modal') ||
                    current.classList.contains('overlay') ||
                    current.classList.contains('menu-btn') ||
                    current.classList.contains('mode-card') ||
                    current.classList.contains('ship-card') ||
                    current.classList.contains('toggle-btn') ||
                    current.classList.contains('upgrade-btn') ||
                    current.classList.contains('use-item-btn') ||
                    current.classList.contains('inventory-slot') ||
                    current.classList.contains('pause-btn') ||
                    current.classList.contains('auto-aim-btn') ||
                    current.id === 'main-menu' ||
                    current.id === 'hud' ||
                    current.id === 'pause-menu' ||
                    current.id === 'settings-menu' ||
                    current.id === 'upgrade-menu' ||
                    current.id === 'inventory-menu' ||
                    current.id === 'game-over' ||
                    current.id === 'upgrade-selection-menu') {
                    return true;
                }
            }
            
            // 检查标签名
            if (current.tagName === 'BUTTON' || 
                current.tagName === 'INPUT' ||
                current.tagName === 'SELECT' ||
                current.tagName === 'TEXTAREA') {
                return true;
            }
            
            current = current.parentElement;
        }
        
        return false;
    }

    bindMouseEvents() {
        const container = document.getElementById('game-container');

        container.addEventListener('mousedown', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // 检查是否点击了发射按钮
            const fireButton = document.getElementById('fire-button');
            if (fireButton && fireButton.contains(e.target)) {
                this.firePressed = true;
                this.fireJustPressed = true;
                fireButton.classList.add('pressed');
                return;
            }

            // PC端：左键点击 = 发射（全屏有效）
            if (e.button === 0) {
                this.firePressed = true;
                this.fireJustPressed = true;
            }

            // ❌ 移除：不再用鼠标激活虚拟摇杆
            // 虚拟摇杆仅用于触摸设备
        });

        container.addEventListener('mousemove', (e) => {
            // ✅ 只更新鼠标位置（用于瞄准）
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        container.addEventListener('mouseup', (e) => {
            // ✅ 只处理发射按钮释放
            if (e.button === 0) {
                this.firePressed = false;
            }

            // 移除发射按钮样式
            const fireButton = document.getElementById('fire-button');
            if (fireButton) {
                fireButton.classList.remove('pressed');
            }

            // ❌ 移除：不再用鼠标释放虚拟摇杆
            // 虚拟摇杆仅用于触摸设备
        });

        // 阻止右键菜单
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // 防止重复触发
            if (!this.keys[e.code]) {
                this.keysPressed[e.code] = true;
            }
            this.keys[e.code] = true;

            // 空格发射
            if (e.code === 'Space') {
                e.preventDefault();
                this.firePressed = true;
                this.fireJustPressed = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysPressed[e.code] = false;

            // 空格释放
            if (e.code === 'Space') {
                this.firePressed = false;
            }
        });
    }

    bindFireButton() {
        const fireButton = document.getElementById('fire-button');
        if (!fireButton) return;

        // 鼠标事件
        fireButton.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.firePressed = true;
            this.fireJustPressed = true;
            fireButton.classList.add('pressed');
        });

        fireButton.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            this.firePressed = false;
            fireButton.classList.remove('pressed');
        });

        fireButton.addEventListener('mouseleave', (e) => {
            this.firePressed = false;
            fireButton.classList.remove('pressed');
        });

        // 触摸事件
        fireButton.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            this.firePressed = true;
            this.fireJustPressed = true;
            fireButton.classList.add('pressed');
        }, { passive: true });

        fireButton.addEventListener('touchend', (e) => {
            e.stopPropagation();
            this.firePressed = false;
            fireButton.classList.remove('pressed');
        }, { passive: true });
    }

    startStick(stick, x, y, touchId) {
        if (stick.active) return;

        stick.active = true;
        stick.current.set(x, y);
        stick.vector.set(0, 0);
        this.touchMap.set(touchId, stick);

        stick.element.classList.add('active');
        this.updateKnobPosition(stick);
    }

    updateStick(stick, x, y) {
        if (!stick.active) return;

        stick.current.set(x, y);

        // 计算向量
        const dx = x - stick.origin.x;
        const dy = y - stick.origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 归一化并限制最大距离
        if (distance > 0) {
            const clampedDistance = Math.min(distance, stick.maxDistance);
            stick.vector.set(
                (dx / distance) * (clampedDistance / stick.maxDistance),
                (dy / distance) * (clampedDistance / stick.maxDistance)
            );
        } else {
            stick.vector.set(0, 0);
        }

        this.updateKnobPosition(stick);
    }

    endStick(stick) {
        stick.active = false;
        stick.vector.set(0, 0);

        // 清除该摇杆的所有触摸映射
        for (const [id, s] of this.touchMap) {
            if (s === stick) {
                this.touchMap.delete(id);
            }
        }

        stick.element.classList.remove('active');
        this.updateKnobPosition(stick);
    }

    updateKnobPosition(stick) {
        if (stick.active) {
            const dx = stick.current.x - stick.origin.x;
            const dy = stick.current.y - stick.origin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const clampedDistance = Math.min(distance, stick.maxDistance);
            const angle = Math.atan2(dy, dx);

            const knobX = Math.cos(angle) * clampedDistance;
            const knobY = Math.sin(angle) * clampedDistance;

            stick.knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        } else {
            stick.knob.style.transform = 'translate(0px, 0px)';
        }
    }

    getStickByTouchId(touchId) {
        return this.touchMap.get(touchId) || null;
    }

    /**
     * 获取移动输入向量 (左摇杆 或 WASD/方向键)
     */
    getMoveVector() {
        // 优先使用摇杆
        if (this.leftStick.active) {
            return this.leftStick.vector.clone();
        }

        // 键盘输入 - PC端移动
        let x = 0, y = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

        if (x !== 0 || y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            return new Vector2(x / len, y / len);
        }

        return new Vector2(0, 0);
    }

    /**
     * 获取瞄准输入向量 (右摇杆 或 鼠标)
     */
    getAimVector() {
        if (this.rightStick.active) {
            return this.rightStick.vector.clone();
        }

        // PC端：鼠标相对于屏幕中心
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const dx = this.mouse.x - centerX;
        const dy = this.mouse.y - centerY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 10) {
            return new Vector2(dx / len, dy / len);
        }

        return new Vector2(0, 0);
    }

    /**
     * 获取瞄准角度
     */
    getAimAngle() {
        const aim = this.getAimVector();
        if (aim.magnitude() > 0.1) {
            return aim.angle();
        }
        return null;
    }

    /**
     * 是否按下发射键
     */
    isFirePressed() {
        return this.firePressed;
    }

    /**
     * 是否刚按下发射键（单次触发）
     */
    isFireJustPressed() {
        if (this.fireJustPressed) {
            this.fireJustPressed = false;
            return true;
        }
        return false;
    }

    /**
     * 是否有移动输入
     */
    isMoving() {
        return this.leftStick.active || this.keys['KeyW'] || this.keys['KeyS'] ||
               this.keys['KeyA'] || this.keys['KeyD'] || this.keys['ArrowUp'] ||
               this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
    }

    /**
     * 是否有瞄准输入
     */
    isAiming() {
        return this.rightStick.active ||
               (this.mouse.x !== 0 && this.mouse.y !== 0);
    }

    /**
     * 是否按下某个键（单次触发）
     */
    isKeyJustPressed(code) {
        if (this.keysPressed[code]) {
            this.keysPressed[code] = false;
            return true;
        }
        return false;
    }

    /**
     * 更新 (每帧调用)
     */
    update() {
        // 更新摇杆位置
        if (this.leftStick.active || this.rightStick.active) {
            this.updateStickPositions();
        }
    }
}
