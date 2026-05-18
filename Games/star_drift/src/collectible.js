/**
 * 可收集物品类 - 能源矿石、经验球、物资
 */
class Collectible extends Entity {
    constructor(x, y, type = 'energy') {
        super(x, y, 12);

        this.type = type;
        this.active = true;
        this.lifeTime = 15; // 15秒后消失
        this.maxLifeTime = 15;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 2;
        this.bobAmount = 3;

        this.setupByType();
    }

    setupByType() {
        switch (this.type) {
            case 'energy':
                this.color = '#22d3ee';
                this.glowColor = 'rgba(6, 182, 212, 0.5)';
                this.value = 20;
                this.radius = 10;
                break;

            case 'energyLarge':
                this.color = '#06b6d4';
                this.glowColor = 'rgba(6, 182, 212, 0.7)';
                this.value = 50;
                this.radius = 14;
                break;

            case 'exp':
                this.color = '#a855f7';
                this.glowColor = 'rgba(168, 85, 247, 0.5)';
                this.value = 15;
                this.radius = 8;
                break;

            case 'expLarge':
                this.color = '#c084fc';
                this.glowColor = 'rgba(192, 132, 252, 0.6)';
                this.value = 40;
                this.radius = 12;
                break;

            case 'health':
                this.color = '#10b981';
                this.glowColor = 'rgba(16, 185, 129, 0.5)';
                this.value = 25;
                this.radius = 10;
                break;

            case 'scrapMetal':
                this.color = '#9ca3af';
                this.glowColor = 'rgba(156, 163, 175, 0.4)';
                this.value = 1;
                this.radius = 8;
                break;

            case 'rareMineral':
                this.color = '#f59e0b';
                this.glowColor = 'rgba(245, 158, 11, 0.5)';
                this.value = 1;
                this.radius = 10;
                break;

            case 'missile':
                this.color = '#ef4444';
                this.glowColor = 'rgba(239, 68, 68, 0.6)';
                this.value = 1;
                this.radius = 12;
                break;

            case 'shield':
                this.color = '#3b82f6';
                this.glowColor = 'rgba(59, 130, 246, 0.6)';
                this.value = 1;
                this.radius = 11;
                break;

            case 'autoDodge':
                this.color = '#10b981';
                this.glowColor = 'rgba(16, 185, 129, 0.6)';
                this.value = 1;
                this.radius = 11;
                break;

            case 'timeCrystal':
                this.color = '#f472b6';
                this.glowColor = 'rgba(244, 114, 182, 0.7)';
                this.value = 5; // 增加5秒
                this.radius = 13;
                break;

            default:
                this.color = '#22d3ee';
                this.glowColor = 'rgba(6, 182, 212, 0.5)';
                this.value = 20;
                this.radius = 10;
        }
    }

    update(deltaTime, player) {
        if (!this.active) return;

        // 生命周期
        this.lifeTime -= deltaTime;
        if (this.lifeTime <= 0) {
            this.active = false;
            return;
        }

        // 上下浮动动画
        this.bobOffset += deltaTime * this.bobSpeed;
        
        // 磁力吸引：当玩家靠近时，收集物向玩家移动
        if (player && player.isAlive()) {
            const dist = this.position.distance(player.position);
            const magnetRange = 80; // 磁力范围
            
            if (dist < magnetRange) {
                // 计算朝向玩家的方向
                const direction = Vector2.sub(player.position, this.position).normalized();
                // 距离越近，吸引速度越快
                const attractSpeed = (1 - dist / magnetRange) * 200; // 最大200像素/秒
                const moveVector = Vector2.multiply(direction, attractSpeed * deltaTime);
                this.position.add(moveVector);
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();

        const bobY = Math.sin(this.bobOffset) * this.bobAmount;
        const alpha = Math.min(1, this.lifeTime / 3); // 消失前3秒开始淡出
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        
        // 即将消失时的闪烁效果（最后2秒）
        let finalAlpha = alpha;
        if (this.lifeTime < 2) {
            const blinkSpeed = 10;
            const blink = Math.sin(Date.now() / 1000 * blinkSpeed) * 0.5 + 0.5;
            finalAlpha = alpha * blink;
        }

        ctx.globalAlpha = finalAlpha;
        ctx.translate(this.position.x, this.position.y + bobY);

        // 发光效果
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制图标符号
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold ${this.radius}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let symbol = '●';
        switch (this.type) {
            case 'energy':
            case 'energyLarge':
                symbol = '⚡';
                break;
            case 'exp':
            case 'expLarge':
                symbol = '★';
                break;
            case 'health':
                symbol = '+';
                break;
            case 'scrapMetal':
                symbol = '◆';
                break;
            case 'rareMineral':
                symbol = '♦';
                break;
            case 'missile':
                symbol = '🚀';
                break;
            case 'shield':
                symbol = '🛡️';
                break;
            case 'autoDodge':
                symbol = '💨';
                break;
            case 'timeCrystal':
                symbol = '⏳';
                break;
        }
        ctx.fillText(symbol, 0, 1);

        ctx.restore();
    }

    /**
     * 是否存活（可收集）
     */
    isAlive() {
        return this.active && this.lifeTime > 0;
    }

    /**
     * 获取收集后的效果描述
     */
    getCollectEffect() {
        switch (this.type) {
            case 'energy':
            case 'energyLarge':
                return { type: 'energy', value: this.value };
            case 'exp':
            case 'expLarge':
                return { type: 'exp', value: this.value };
            case 'health':
                return { type: 'health', value: this.value };
            case 'scrapMetal':
                return { type: 'item', itemType: 'scrapMetal', value: this.value };
            case 'rareMineral':
                return { type: 'item', itemType: 'rareMinerals', value: this.value };
            case 'missile':
                return { type: 'item', itemType: 'missile', value: this.value };
            case 'shield':
                return { type: 'item', itemType: 'shield', value: this.value };
            case 'autoDodge':
                return { type: 'item', itemType: 'autoDodge', value: this.value };
            case 'timeCrystal':
                return { type: 'time', value: this.value };
            default:
                return { type: 'energy', value: this.value };
        }
    }
}
