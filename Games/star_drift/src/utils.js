/**
 * 工具函数集合
 */
const Utils = {
    /**
     * 随机范围 [min, max]
     */
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * 随机整数 [min, max]
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * 随机选择数组元素
     */
    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * 角度转弧度
     */
    degToRad(deg) {
        return deg * Math.PI / 180;
    },

    /**
     * 弧度转角度
     */
    radToDeg(rad) {
        return rad * 180 / Math.PI;
    },

    /**
     * 限制数值范围
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * 线性插值
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * 平滑插值 (ease-out)
     */
    lerpSmooth(a, b, t) {
        return this.lerp(a, b, 1 - Math.pow(1 - t, 3));
    },

    /**
     * 角度归一化到 [-PI, PI]
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    },

    /**
     * 角度差 (最短方向)
     */
    angleDifference(a, b) {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return diff;
    },

    /**
     * 平滑角度插值
     */
    lerpAngle(a, b, t) {
        const diff = this.angleDifference(a, b);
        return a + diff * t;
    },

    /**
     * 检测圆形碰撞
     */
    circleCollision(pos1, radius1, pos2, radius2) {
        const distSq = pos1.distanceSquared(pos2);
        const radiusSum = radius1 + radius2;
        return distSq < radiusSum * radiusSum;
    },

    /**
     * 检测点是否在圆内
     */
    pointInCircle(point, center, radius) {
        return point.distanceSquared(center) < radius * radius;
    },

    /**
     * 检测点是否在矩形内
     */
    pointInRect(point, x, y, width, height) {
        return point.x >= x && point.x <= x + width &&
               point.y >= y && point.y <= y + height;
    },

    /**
     * 检测矩形碰撞
     */
    rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 &&
               y1 < y2 + h2 && y1 + h1 > y2;
    },

    /**
     * 获取世界边界内的随机位置
     */
    randomPositionInWorld(worldWidth, worldHeight, margin = 50) {
        return new Vector2(
            this.randomRange(margin, worldWidth - margin),
            this.randomRange(margin, worldHeight - margin)
        );
    },

    /**
     * 获取屏幕外的随机生成位置
     */
    randomSpawnPosition(cameraX, cameraY, screenWidth, screenHeight, spawnDistance = 100) {
        const side = this.randomInt(0, 3);
        let x, y;

        switch (side) {
            case 0: // 上
                x = cameraX + this.randomRange(-screenWidth/2, screenWidth/2);
                y = cameraY - screenHeight/2 - spawnDistance;
                break;
            case 1: // 右
                x = cameraX + screenWidth/2 + spawnDistance;
                y = cameraY + this.randomRange(-screenHeight/2, screenHeight/2);
                break;
            case 2: // 下
                x = cameraX + this.randomRange(-screenWidth/2, screenWidth/2);
                y = cameraY + screenHeight/2 + spawnDistance;
                break;
            case 3: // 左
                x = cameraX - screenWidth/2 - spawnDistance;
                y = cameraY + this.randomRange(-screenHeight/2, screenHeight/2);
                break;
        }

        return new Vector2(x, y);
    },

    /**
     * 格式化数字 (千分位)
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * 创建颜色渐变
     */
    colorGradient(color1, color2, t) {
        const r = Math.round(this.lerp(color1.r, color2.r, t));
        const g = Math.round(this.lerp(color1.g, color2.g, t));
        const b = Math.round(this.lerp(color1.b, color2.b, t));
        return `rgb(${r},${g},${b})`;
    },

    /**
     * 十六进制颜色转RGB对象
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * 振动反馈
     */
    vibrate(pattern = 50) {
        if (navigator.vibrate && window.gameSettings && window.gameSettings.vibration) {
            navigator.vibrate(pattern);
        }
    },

    /**
     * 存储本地数据
     */
    saveData(key, data) {
        try {
            localStorage.setItem(`dsdf_${key}`, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    },

    /**
     * 读取本地数据
     */
    loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`dsdf_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
            return defaultValue;
        }
    },

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
