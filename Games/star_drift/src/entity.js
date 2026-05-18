/**
 * 游戏实体基类
 */
class Entity {
    constructor(x, y, radius = 10) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.radius = radius;
        this.angle = 0;
        this.active = true;
        this.mass = 1;
        this.friction = 1; // 摩擦系数 (1 = 无摩擦)
    }

    /**
     * 应用力
     */
    applyForce(force) {
        this.acceleration.add(Vector2.multiply(force, 1 / this.mass));
    }

    /**
     * 更新物理
     */
    updatePhysics(deltaTime, inertiaDecay = 0.98) {
        // 应用加速度
        const scaledAcceleration = Vector2.multiply(this.acceleration, deltaTime * 60);
        this.velocity.add(scaledAcceleration);

        // 应用惯性衰减 (默认 0.98 每帧，更平滑的减速)
        if (inertiaDecay < 1) {
            this.velocity.multiply(inertiaDecay);
        }

        // 如果速度非常小，直接设为零以避免浮点误差
        const speed = this.velocity.magnitude();
        if (speed < 0.01) {
            this.velocity.set(0, 0);
        }

        // 限制最大速度（防止过快）
        const maxSpeed = 1000;
        if (speed > maxSpeed) {
            this.velocity.normalize().multiply(maxSpeed);
        }

        // 更新位置
        const scaledVelocity = Vector2.multiply(this.velocity, deltaTime * 60);
        this.position.add(scaledVelocity);

        // 重置加速度
        this.acceleration.set(0, 0);
    }

    /**
     * 弹性反弹
     */
    bounce(normal, bounceFactor = 0.7) {
        // 确保法向量是单位向量
        const unitNormal = normal.normalized();
        
        // 计算速度在法线方向的分量
        const dot = this.velocity.dot(unitNormal);
        
        // 只有当物体朝向表面移动时才反弹
        if (dot < 0) {
            // 反射公式: v' = v - 2(v·n)n
            const reflection = Vector2.multiply(unitNormal, 2 * dot);
            this.velocity.sub(reflection);
            
            // 应用反弹系数
            this.velocity.multiply(bounceFactor);
        }
    }

    /**
     * 检测与另一个实体的碰撞
     */
    checkCollision(other) {
        return Utils.circleCollision(this.position, this.radius, other.position, other.radius);
    }

    /**
     * 处理碰撞
     */
    handleCollision(other) {
        const diff = Vector2.sub(this.position, other.position);
        const dist = diff.magnitude();

        if (dist < this.radius + other.radius && dist > 0.001) {
            // 计算单位法向量（只计算一次）
            const normal = diff.normalized();
            
            // 分离重叠的物体
            const overlap = this.radius + other.radius - dist;
            const separation = Vector2.multiply(normal, overlap * 0.5);
            this.position.add(separation);
            other.position.sub(separation);

            // 计算相对速度
            const relativeVelocity = Vector2.sub(this.velocity, other.velocity);
            const velocityAlongNormal = relativeVelocity.dot(normal);

            // 如果物体正在分离，则不处理
            if (velocityAlongNormal > 0) return;

            // 计算冲量
            const restitution = 0.7;
            const impulse = -(1 + restitution) * velocityAlongNormal;
            const impulseVector = Vector2.multiply(normal, impulse / 2);

            // 应用冲量
            this.velocity.add(impulseVector);
            other.velocity.sub(impulseVector);
        }
    }

    /**
     * 更新 (子类重写)
     */
    update(deltaTime) {
        this.updatePhysics(deltaTime);
    }

    /**
     * 渲染 (子类重写)
     */
    render(ctx) {
        // 基类不渲染
    }

    /**
     * 是否存活
     */
    isAlive() {
        return this.active;
    }

    /**
     * 销毁
     */
    destroy() {
        this.active = false;
    }

    /**
     * 检查是否在屏幕边界内
     */
    isInBounds(canvasWidth, canvasHeight, margin = 0) {
        return this.position.x >= -margin && 
               this.position.x <= canvasWidth + margin &&
               this.position.y >= -margin && 
               this.position.y <= canvasHeight + margin;
    }

    /**
     * 包装到屏幕另一侧（环绕效果）
     */
    wrapAround(canvasWidth, canvasHeight) {
        if (this.position.x < -this.radius) {
            this.position.x = canvasWidth + this.radius;
        } else if (this.position.x > canvasWidth + this.radius) {
            this.position.x = -this.radius;
        }

        if (this.position.y < -this.radius) {
            this.position.y = canvasHeight + this.radius;
        } else if (this.position.y > canvasHeight + this.radius) {
            this.position.y = -this.radius;
        }
    }
}
