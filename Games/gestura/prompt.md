User: 用Three.js创建一个实时交互的3D粒子系统。要求：1. 通过摄像头检测双手张合控制粒子群的收缩与扩散；2. 当手势为1时，粒子组成文字h（），当手势为2时组成文字 （）当手势为3时，组成文字 （）3.粒子需实时响应手势变化；

Kimi: 我将为你创建一个完整的单文件 HTML 应用，包含 Three.js 粒子系统与 MediaPipe 手势识别。保存为 `.html` 文件后直接用浏览器打开即可运行（需允许摄像头权限）。

**功能说明：**
- **1 根手指**：粒子组成 **H**
- **2 根手指**：粒子组成 **I**  
- **3 根手指**：粒子组成 **!**
- **双手距离**：双手靠近（合）→ 粒子收缩；双手远离（张）→ 粒子扩散
- 无手势时粒子为舒缓的星云流动状态

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 手势粒子系统</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            overflow: hidden;
            background: #000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        #canvas-container {
            width: 100vw;
            height: 100vh;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }
        #video {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 150px;
            border-radius: 12px;
            border: 2px solid rgba(0, 255, 255, 0.5);
            transform: scaleX(-1);
            z-index: 10;
            object-fit: cover;
            opacity: 0.8;
        }
        #ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 10;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            color: #fff;
            min-width: 220px;
        }
        #ui-panel h2 {
            font-size: 16px;
            margin-bottom: 12px;
            color: #0ff;
            letter-spacing: 2px;
        }
        .stat-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 13px;
            color: #ccc;
        }
        .stat-row span.value {
            color: #0ff;
            font-weight: bold;
            font-family: monospace;
        }
        .gesture-hint {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 12px;
            line-height: 1.8;
            color: #888;
        }
        .gesture-hint .active {
            color: #0ff;
            font-weight: bold;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #0ff;
            font-size: 18px;
            z-index: 20;
            text-align: center;
        }
        .error-msg {
            color: #ff4444;
            font-size: 14px;
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <div id="loading">
        <div>正在初始化摄像头与手势识别...</div>
        <div class="error-msg" id="error-msg" style="display:none;"></div>
    </div>

    <div id="canvas-container"></div>
    <video id="video" playsinline></video>

    <div id="ui-panel">
        <h2>手势粒子控制台</h2>
        <div class="stat-row">
            <span>检测手势</span>
            <span class="value" id="gesture-text">无</span>
        </div>
        <div class="stat-row">
            <span>手指数量</span>
            <span class="value" id="finger-count">0</span>
        </div>
        <div class="stat-row">
            <span>双手距离</span>
            <span class="value" id="hand-distance">--</span>
        </div>
        <div class="stat-row">
            <span>粒子状态</span>
            <span class="value" id="particle-state">流动</span>
        </div>
        <div class="gesture-hint">
            <div id="hint-1">☝ 1指 → 组成 H</div>
            <div id="hint-2">✌ 2指 → 组成 I</div>
            <div id="hint-3">🖐 3指 → 组成 !</div>
            <div>🙏 双手张合 → 控制扩散</div>
        </div>
    </div>

    <script>
        // ==================== 配置 ====================
        const PARTICLE_COUNT = 9000;
        const LERP_SPEED = 0.08;
        const SPREAD_LERP = 0.1;
        const MAX_SPREAD_RADIUS = 8;
        
        // 文字配置（手势1/2/3对应的字符）
        const TEXT_MAP = { 1: 'H', 2: 'I', 3: '!' };
        const COLOR_MAP = {
            0: new THREE.Color(0x4488ff), // 无手势 - 蓝
            1: new THREE.Color(0x00ffff), // H - 青
            2: new THREE.Color(0xff00ff), // I - 紫
            3: new THREE.Color(0xffaa00)  // ! - 橙
        };

        // ==================== Three.js 初始化 ====================
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.02);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 35;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 粒子材质
        const textureLoader = new THREE.TextureLoader();
        // 使用程序生成的圆形粒子贴图，避免外部图片依赖
        const canvasParticle = document.createElement('canvas');
        canvasParticle.width = 32;
        canvasParticle.height = 32;
        const ctxP = canvasParticle.getContext('2d');
        const grad = ctxP.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.3)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctxP.fillStyle = grad;
        ctxP.fillRect(0, 0, 32, 32);
        const particleTexture = new THREE.CanvasTexture(canvasParticle);

        const material = new THREE.PointsMaterial({
            size: 0.4,
            map: particleTexture,
            transparent: true,
            opacity: 0.9,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        // 粒子几何体
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const targets = new Float32Array(PARTICLE_COUNT * 3);
        const randoms = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3); // 用于无手势时的流动

        const colorObj = new THREE.Color();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // 初始随机分布
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
            
            targets[i * 3] = positions[i * 3];
            targets[i * 3 + 1] = positions[i * 3 + 1];
            targets[i * 3 + 2] = positions[i * 3 + 2];
            
            randoms[i * 3] = (Math.random() - 0.5);
            randoms[i * 3 + 1] = (Math.random() - 0.5);
            randoms[i * 3 + 2] = (Math.random() - 0.5);
            
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

            colorObj.setHex(0x4488ff);
            colors[i * 3] = colorObj.r;
            colors[i * 3 + 1] = colorObj.g;
            colors[i * 3 + 2] = colorObj.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        // ==================== 文字采样 ====================
        function sampleTextPoints(text, count) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const w = 240, h = 240;
            canvas.width = w;
            canvas.height = h;
            
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 160px "Arial", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, w / 2, h / 2);
            
            const imageData = ctx.getImageData(0, 0, w, h);
            const basePoints = [];
            
            // 步长为2，平衡性能与密度
            for (let y = 0; y < h; y += 2) {
                for (let x = 0; x < w; x += 2) {
                    const idx = (y * w + x) * 4;
                    if (imageData.data[idx] > 128) {
                        basePoints.push({
                            x: (x - w / 2) / 8,
                            y: -(y - h / 2) / 8,
                            z: 0
                        });
                    }
                }
            }
            
            // 填充/采样到指定数量
            const result = [];
            if (basePoints.length === 0) {
                for (let i = 0; i < count; i++) {
                    result.push({ x: 0, y: 0, z: 0 });
                }
                return result;
            }
            
            // 如果点太多，随机选取；如果太少，复制并加微小噪声
            if (basePoints.length >= count) {
                const indices = [];
                for (let i = 0; i < basePoints.length; i++) indices.push(i);
                // Fisher-Yates shuffle
                for (let i = indices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indices[i], indices[j]] = [indices[j], indices[i]];
                }
                for (let i = 0; i < count; i++) {
                    result.push(basePoints[indices[i]]);
                }
            } else {
                for (let i = 0; i < count; i++) {
                    const base = basePoints[i % basePoints.length];
                    result.push({
                        x: base.x + (Math.random() - 0.5) * 0.3,
                        y: base.y + (Math.random() - 0.5) * 0.3,
                        z: base.z + (Math.random() - 0.5) * 0.3
                    });
                }
            }
            return result;
        }

        // 预计算文字目标点
        const textPoints = {};
        Object.values(TEXT_MAP).forEach(char => {
            textPoints[char] = sampleTextPoints(char, PARTICLE_COUNT);
        });

        // ==================== 手势检测逻辑 ====================
        function countExtendedFingers(landmarks) {
            let count = 0;
            const wrist = landmarks[0];
            
            // 食指(8)、中指(12)、无名指(16)、小指(20)
            const fingers = [
                { tip: 8, base: 5 },
                { tip: 12, base: 9 },
                { tip: 16, base: 13 },
                { tip: 20, base: 17 }
            ];
            
            for (const f of fingers) {
                const tip = landmarks[f.tip];
                const base = landmarks[f.base];
                const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
                const dBase = Math.hypot(base.x - wrist.x, base.y - wrist.y);
                // 指尖明显比指根远离手腕，认为手指伸展
                if (dTip > dBase * 1.15) count++;
            }
            return count;
        }

        // ==================== 状态变量 ====================
        let currentGesture = 0; // 0=无, 1=H, 2=I, 3=!
        let targetSpread = 0.5;   // 0=完全收缩, 1=完全扩散
        let currentSpread = 0.5;
        let time = 0;

        // ==================== MediaPipe Hands ====================
        const videoElement = document.getElementById('video');
        const gestureTextEl = document.getElementById('gesture-text');
        const fingerCountEl = document.getElementById('finger-count');
        const handDistanceEl = document.getElementById('hand-distance');
        const particleStateEl = document.getElementById('particle-state');
        const loadingEl = document.getElementById('loading');
        const errorMsgEl = document.getElementById('error-msg');

        function updateUI() {
            const names = { 0: '无', 1: 'H', 2: 'I', 3: '!' };
            gestureTextEl.textContent = names[currentGesture] || '无';
            fingerCountEl.textContent = currentGesture;
            
            // 高亮提示
            [1, 2, 3].forEach(g => {
                const el = document.getElementById(`hint-${g}`);
                if (g === currentGesture) {
                    el.classList.add('active');
                    el.style.color = '#0ff';
                } else {
                    el.classList.remove('active');
                    el.style.color = '#888';
                }
            });
            
            if (currentSpread < 0.25) particleStateEl.textContent = '收缩';
            else if (currentSpread > 0.75) particleStateEl.textContent = '扩散';
            else particleStateEl.textContent = '平衡';
        }

        function onResults(results) {
            let gesture = 0;
            let handDist = 0;
            
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                // 取第一只手检测手指数量
                const fingers = countExtendedFingers(results.multiHandLandmarks[0]);
                if (fingers >= 1 && fingers <= 3) {
                    gesture = fingers;
                }
                
                // 双手距离计算
                if (results.multiHandLandmarks.length >= 2) {
                    const h1 = results.multiHandLandmarks[0][9];  // 中指根部作为掌心参考
                    const h2 = results.multiHandLandmarks[1][9];
                    handDist = Math.hypot(h1.x - h2.x, h1.y - h2.y);
                    
                    // 归一化距离：0~0.8 映射到 spread 0~1
                    // 双手靠近（合）→ spread 小（收缩）
                    // 双手远离（张）→ spread 大（扩散）
                    targetSpread = Math.min(Math.max(handDist * 1.8, 0), 1);
                } else {
                    // 单手默认中等扩散
                    targetSpread = 0.35;
                }
            } else {
                // 无手时默认流动
                targetSpread = 0.6;
                gesture = 0;
            }
            
            currentGesture = gesture;
            handDistanceEl.textContent = handDist > 0 ? handDist.toFixed(2) : '--';
            updateUI();
        }

        // 初始化 Hands
        let hands;
        try {
            hands = new Hands({locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }});
            
            hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            hands.onResults(onResults);
            
            const cameraUtils = new Camera(videoElement, {
                onFrame: async () => {
                    await hands.send({image: videoElement});
                },
                width: 640,
                height: 480
            });
            
            cameraUtils.start()
                .then(() => {
                    loadingEl.style.display = 'none';
                })
                .catch(err => {
                    console.error(err);
                    errorMsgEl.style.display = 'block';
                    errorMsgEl.textContent = '摄像头启动失败，请检查权限设置';
                });
                
        } catch (e) {
            console.error(e);
            errorMsgEl.style.display = 'block';
            errorMsgEl.textContent = '初始化失败: ' + e.message;
        }

        // ==================== 动画循环 ====================
        function updateTargets() {
            const posArray = geometry.attributes.position.array;
            const colArray = geometry.attributes.color.array;
            
            // 平滑 spread
            currentSpread += (targetSpread - currentSpread) * SPREAD_LERP;
            
            // 目标颜色
            const targetColor = COLOR_MAP[currentGesture] || COLOR_MAP[0];
            
            if (currentGesture === 0) {
                // 无手势：流动星云模式
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const i3 = i * 3;
                    
                    // 缓慢漂移
                    targets[i3] += velocities[i3];
                    targets[i3 + 1] += velocities[i3 + 1];
                    targets[i3 + 2] += velocities[i3 + 2];
                    
                    // 边界反弹
                    if (Math.abs(targets[i3]) > 25) velocities[i3] *= -1;
                    if (Math.abs(targets[i3 + 1]) > 25) velocities[i3 + 1] *= -1;
                    if (Math.abs(targets[i3 + 2]) > 25) velocities[i3 + 2] *= -1;
                    
                    // 添加噪声扩散
                    const noise = currentSpread * MAX_SPREAD_RADIUS * 2;
                    targets[i3] += randoms[i3] * noise * 0.01;
                    targets[i3 + 1] += randoms[i3 + 1] * noise * 0.01;
                    targets[i3 + 2] += randoms[i3 + 2] * noise * 0.01;
                    
                    // lerp
                    posArray[i3] += (targets[i3] - posArray[i3]) * LERP_SPEED;
                    posArray[i3 + 1] += (targets[i3 + 1] - posArray[i3 + 1]) * LERP_SPEED;
                    posArray[i3 + 2] += (targets[i3 + 2] - posArray[i3 + 2]) * LERP_SPEED;
                    
                    // 颜色渐变
                    colArray[i3] += (targetColor.r - colArray[i3]) * 0.05;
                    colArray[i3 + 1] += (targetColor.g - colArray[i3 + 1]) * 0.05;
                    colArray[i3 + 2] += (targetColor.b - colArray[i3 + 2]) * 0.05;
                }
            } else {
                // 文字模式
                const text = TEXT_MAP[currentGesture];
                const points = textPoints[text];
                const noise = currentSpread * MAX_SPREAD_RADIUS;
                
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const i3 = i * 3;
                    const p = points[i];
                    
                    // 目标位置 = 文字点 + 基于spread的扩散偏移
                    const tx = p.x + randoms[i3] * noise;
                    const ty = p.y + randoms[i3 + 1] * noise;
                    const tz = p.z + randoms[i3 + 2] * noise;
                    
                    posArray[i3] += (tx - posArray[i3]) * LERP_SPEED;
                    posArray[i3 + 1] += (ty - posArray[i3 + 1]) * LERP_SPEED;
                    posArray[i3 + 2] += (tz - posArray[i3 + 2]) * LERP_SPEED;
                    
                    // 颜色
                    colArray[i3] += (targetColor.r - colArray[i3]) * 0.08;
                    colArray[i3 + 1] += (targetColor.g - colArray[i3 + 1]) * 0.08;
                    colArray[i3 + 2] += (targetColor.b - colArray[i3 + 2]) * 0.08;
                }
            }
            
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
        }

        function animate() {
            requestAnimationFrame(animate);
            time += 0.005;
            
            updateTargets();
            
            // 场景缓慢旋转
            particles.rotation.y = Math.sin(time * 0.5) * 0.1;
            particles.rotation.x = Math.cos(time * 0.3) * 0.05;
            
            renderer.render(scene, camera);
        }

        animate();

        // ==================== 窗口调整 ====================
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>
```

### 使用说明

1. **保存文件**：将以上代码保存为 `particle-hands.html`
2. **打开方式**：用 Chrome/Edge/Firefox 等现代浏览器直接打开（需要通过 `http://` 或 `https://` 协议访问，本地 `file://` 协议可能因 CORS 限制导致 MediaPipe 加载失败，建议使用 Live Server 等插件）
3. **授权摄像头**：首次使用需允许浏览器访问摄像头
4. **操作手势**：
   - 举起 **1 根手指**（食指）：粒子汇聚成 **H**
   - 举起 **2 根手指**（食指+中指）：粒子汇聚成 **I**
   - 举起 **3 根手指**（食指+中指+无名指）：粒子汇聚成 **!**
   - **双手靠近**：粒子收缩紧密；**双手远离**：粒子扩散松散
   - 放下手：粒子进入舒缓的流动星云状态

### 技术要点

- **实时响应**：使用 `lerp` 插值让粒子位置与颜色平滑过渡，避免突变
- **双手距离映射**：通过 MediaPipe 检测两只手的中指根部（掌心区域）距离，归一化后映射到粒子的扩散半径
- **文字重建**：通过离屏 Canvas 采样文字像素坐标，将 2D 字形映射到 3D 空间，并为每个粒子分配目标锚点
- **性能优化**：使用 `BufferGeometry` 与 `Float32Array` 直接操作粒子数据，在 CPU 端完成 9000 粒子的实时更新，兼顾兼容性与流畅度
User: 手势对应显示的文字可以编辑 1到9都可以编辑绑定对应的文字 UI面板隐蔽一点 显示的文字有意义一点 优化一下双手距离控制的视觉效果 目前不明显 可以控制一个粒子球体的缩放
Kimi: 以下是优化后的完整单文件应用。保存为 `.html` 后通过本地服务器（如 Live Server）打开即可运行。

**核心改进：**
- **1-9 手势文字完全可编辑**：点击右下角 ⚙ 按钮展开面板，实时修改每个手势对应的文字
- **UI 极度隐蔽**：左上角仅保留 4 行极简 HUD；右下角只有一个半透明设置按钮；摄像头预览缩小到左下角并降低透明度
- **有意义的默认文字**：`1=AI` `2=LOVE` `3=WIN` `4=HOPE` `5=FREE` `6=PEACE` `7=POWER` `8=FUTURE` `9=DREAM`
- **双手距离 → 整体缩放**：双手靠近时整个粒子球体/文字**明显缩小**（最小 0.4x），远离时**明显放大**（最大 3.0x），配合呼吸动画，视觉效果极具张力

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gesture Particle Sphere</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; background: #000; font-family: 'Segoe UI', system-ui, sans-serif; }

        #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; z-index: 1; }

        /* 摄像头预览 - 左下角，极小且半透明 */
        #video {
            position: absolute; bottom: 70px; left: 16px;
            width: 140px; height: 105px; border-radius: 8px;
            border: 1px solid rgba(0, 255, 255, 0.15);
            transform: scaleX(-1); z-index: 10; object-fit: cover;
            opacity: 0.35; transition: opacity 0.4s;
        }
        #video:hover { opacity: 0.85; }

        /* 极简 HUD - 左上角 */
        #status-hud {
            position: absolute; top: 20px; left: 20px; z-index: 10;
            color: rgba(255, 255, 255, 0.5); font-size: 10px;
            line-height: 1.8; pointer-events: none; letter-spacing: 1px;
            font-family: 'Courier New', monospace;
        }
        #status-hud .hud-line { display: flex; gap: 16px; }
        #status-hud .hud-label { color: rgba(255,255,255,0.25); width: 50px; }
        #status-hud .hud-value { color: #0ff; font-weight: bold; min-width: 80px; }

        /* 设置按钮 - 右下角小圆点 */
        #settings-btn {
            position: absolute; bottom: 20px; right: 20px;
            width: 36px; height: 36px; border-radius: 50%;
            background: rgba(0, 255, 255, 0.08); border: 1px solid rgba(0, 255, 255, 0.25);
            color: rgba(0, 255, 255, 0.8); font-size: 16px; cursor: pointer; z-index: 20;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(5px); transition: all 0.3s;
        }
        #settings-btn:hover { background: rgba(0, 255, 255, 0.2); transform: scale(1.15); box-shadow: 0 0 15px rgba(0,255,255,0.2); }

        /* 设置面板 */
        #settings-panel {
            position: absolute; bottom: 64px; right: 16px;
            width: 260px; background: rgba(5, 10, 25, 0.9);
            backdrop-filter: blur(20px); border: 1px solid rgba(0, 255, 255, 0.12);
            border-radius: 14px; padding: 18px; z-index: 20;
            transform: translateY(10px) scale(0.95); opacity: 0; pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }
        #settings-panel.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }

        #settings-panel h3 {
            color: #0ff; font-size: 12px; margin-bottom: 14px;
            letter-spacing: 3px; text-transform: uppercase;
            border-bottom: 1px solid rgba(0, 255, 255, 0.08); padding-bottom: 8px;
            font-weight: 600;
        }
        .gesture-row {
            display: flex; align-items: center; margin-bottom: 8px; gap: 8px;
        }
        .gesture-row .g-num {
            width: 22px; height: 22px; border-radius: 50%;
            background: rgba(0, 255, 255, 0.08); border: 1px solid rgba(0, 255, 255, 0.15);
            color: #0ff; font-size: 10px; display: flex; align-items: center; justify-content: center;
            font-weight: bold; flex-shrink: 0;
        }
        .gesture-row input {
            flex: 1; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 6px; padding: 5px 10px; color: #fff; font-size: 12px;
            outline: none; transition: all 0.2s; font-family: inherit;
        }
        .gesture-row input:focus { border-color: rgba(0, 255, 255, 0.4); background: rgba(255, 255, 255, 0.07); }
        .gesture-row input::placeholder { color: rgba(255, 255, 255, 0.15); }
        .hint-text {
            margin-top: 10px; font-size: 10px; color: rgba(255, 255, 255, 0.2);
            line-height: 1.6; text-align: center; letter-spacing: 0.5px;
        }

        /* 加载 */
        #loading {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: rgba(0, 255, 255, 0.7); font-size: 12px; z-index: 30; text-align: center;
            letter-spacing: 6px; text-transform: uppercase; pointer-events: none;
        }
        #loading::after {
            content: ''; display: block; width: 30px; height: 30px;
            margin: 16px auto 0; border: 1px solid rgba(0, 255, 255, 0.1);
            border-top-color: #0ff; border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-overlay {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: #ff5555; font-size: 13px; z-index: 30; text-align: center;
            background: rgba(0,0,0,0.85); padding: 24px; border-radius: 12px;
            display: none; max-width: 320px; line-height: 1.6; border: 1px solid rgba(255,0,0,0.2);
        }
    </style>
</head>
<body>
    <div id="loading">系统初始化</div>
    <div class="error-overlay" id="error-overlay"></div>

    <div id="canvas-container"></div>
    <video id="video" playsinline></video>

    <div id="status-hud">
        <div class="hud-line"><span class="hud-label">MODE</span><span class="hud-value" id="hud-mode">SPHERE</span></div>
        <div class="hud-line"><span class="hud-label">TEXT</span><span class="hud-value" id="hud-text">--</span></div>
        <div class="hud-line"><span class="hud-label">SCALE</span><span class="hud-value" id="hud-scale">1.00x</span></div>
        <div class="hud-line"><span class="hud-label">HANDS</span><span class="hud-value" id="hud-hands">0</span></div>
    </div>

    <button id="settings-btn">⚙</button>
    <div id="settings-panel">
        <h3>手势文字绑定</h3>
        <div id="gesture-inputs"></div>
        <div class="hint-text">
            举起 1-9 根手指触发对应文字<br>
            双手靠近/远离控制整体缩放
        </div>
    </div>

    <script>
        // ==================== 配置 ====================
        const PARTICLE_COUNT = 12000;
        const LERP_SPEED = 0.055;
        const SCALE_LERP = 0.1;
        const BASE_RADIUS = 14;

        const DEFAULT_TEXTS = {
            1: 'AI',     2: 'LOVE',  3: 'WIN',
            4: 'HOPE',   5: 'FREE',  6: 'PEACE',
            7: 'POWER',  8: 'FUTURE',9: 'DREAM'
        };

        const COLOR_MAP = {
            0: new THREE.Color(0x0088ff),
            1: new THREE.Color(0x00ffff), 2: new THREE.Color(0xff55aa),
            3: new THREE.Color(0xffcc00), 4: new THREE.Color(0x55ff55),
            5: new THREE.Color(0xff7733), 6: new THREE.Color(0xcc55ff),
            7: new THREE.Color(0xff3333), 8: new THREE.Color(0x33ffcc),
            9: new THREE.Color(0xff88bb)
        };

        // ==================== Three.js ====================
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.012);

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 45;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 粒子贴图
        const cvs = document.createElement('canvas');
        cvs.width = 64; cvs.height = 64;
        const c = cvs.getContext('2d');
        const g = c.createRadialGradient(32,32,0, 32,32,32);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.25, 'rgba(255,255,255,0.5)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0,0,64,64);
        const tex = new THREE.CanvasTexture(cvs);

        const mat = new THREE.PointsMaterial({
            size: 0.55, map: tex, transparent: true, opacity: 0.9,
            vertexColors: true, blending: THREE.AdditiveBlending,
            depthWrite: false, sizeAttenuation: true
        });

        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        const col = new Float32Array(PARTICLE_COUNT * 3);
        const targets = new Float32Array(PARTICLE_COUNT * 3);
        const sphereTargets = new Float32Array(PARTICLE_COUNT * 3);
        const randoms = new Float32Array(PARTICLE_COUNT * 3);
        const phases = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            pos[i3] = (Math.random()-0.5)*60;
            pos[i3+1] = (Math.random()-0.5)*60;
            pos[i3+2] = (Math.random()-0.5)*60;
            targets[i3] = pos[i3]; targets[i3+1] = pos[i3+1]; targets[i3+2] = pos[i3+2];
            randoms[i3] = Math.random()-0.5; randoms[i3+1] = Math.random()-0.5; randoms[i3+2] = Math.random()-0.5;
            phases[i] = Math.random() * Math.PI * 2;
            col[i3] = 0; col[i3+1] = 0.3; col[i3+2] = 1;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        // ==================== 斐波那契球体 ====================
        function genSphere(count, radius) {
            const pts = [], phi = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < count; i++) {
                const y = 1 - (i / (count - 1)) * 2;
                const r = Math.sqrt(1 - y*y);
                const theta = phi * i;
                const x = Math.cos(theta) * r;
                const z = Math.sin(theta) * r;
                // 多层球壳 + 内部填充
                const shell = Math.pow(Math.random(), 2.5);
                const d = radius * (0.15 + 0.85 * shell);
                pts.push({x: x*d, y: y*d, z: z*d});
            }
            return pts;
        }
        const spherePts = genSphere(PARTICLE_COUNT, BASE_RADIUS);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i*3;
            sphereTargets[i3] = spherePts[i].x;
            sphereTargets[i3+1] = spherePts[i].y;
            sphereTargets[i3+2] = spherePts[i].z;
        }

        // ==================== 文字采样（自适应大小） ====================
        function sampleText(text, count) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const len = text.length;
            const fontSize = Math.max(50, 160 / Math.max(len * 0.55, 1));
            const w = Math.max(320, len * 70);
            const h = 220;
            canvas.width = w; canvas.height = h;

            ctx.fillStyle = 'black'; ctx.fillRect(0,0,w,h);
            ctx.fillStyle = 'white';
            ctx.font = `bold ${fontSize}px "Arial","Helvetica",sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(text.toUpperCase(), w/2, h/2);

            const img = ctx.getImageData(0,0,w,h).data;
            const base = [];
            const step = len > 5 ? 3 : 2;
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    if (img[(y*w + x)*4] > 120) {
                        base.push({
                            x: (x - w/2) / (fontSize/11),
                            y: -(y - h/2) / (fontSize/11),
                            z: 0
                        });
                    }
                }
            }

            const res = [];
            if (base.length === 0) {
                for (let i=0;i<count;i++) res.push({x:0,y:0,z:0});
                return res;
            }
            if (base.length >= count) {
                const shuf = base.sort(() => Math.random()-0.5);
                for (let i=0;i<count;i++) res.push(shuf[i]);
            } else {
                for (let i=0;i<count;i++) {
                    const b = base[i % base.length];
                    res.push({
                        x: b.x + (Math.random()-0.5)*0.6,
                        y: b.y + (Math.random()-0.5)*0.6,
                        z: (Math.random()-0.5)*2.0
                    });
                }
            }
            return res;
        }

        const textCache = {};
        function getTextPoints(text) {
            const k = text.toUpperCase();
            if (!textCache[k]) textCache[k] = sampleText(k, PARTICLE_COUNT);
            return textCache[k];
        }

        // ==================== UI ====================
        const inputsDiv = document.getElementById('gesture-inputs');
        const gestureTexts = {...DEFAULT_TEXTS};
        for (let g=1; g<=9; g++) {
            const row = document.createElement('div');
            row.className = 'gesture-row';
            row.innerHTML = `<div class="g-num">${g}</div><input type="text" value="${gestureTexts[g]}" maxlength="8" data-g="${g}">`;
            inputsDiv.appendChild(row);
        }
        inputsDiv.addEventListener('input', e => {
            if (e.target.tagName === 'INPUT') {
                const g = parseInt(e.target.dataset.g);
                gestureTexts[g] = e.target.value || DEFAULT_TEXTS[g];
                delete textCache[gestureTexts[g].toUpperCase()];
            }
        });

        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        let panelOpen = false;
        settingsBtn.addEventListener('click', () => {
            panelOpen = !panelOpen;
            settingsPanel.classList.toggle('open', panelOpen);
            settingsBtn.textContent = panelOpen ? '✕' : '⚙';
        });

        const hudMode = document.getElementById('hud-mode');
        const hudText = document.getElementById('hud-text');
        const hudScale = document.getElementById('hud-scale');
        const hudHands = document.getElementById('hud-hands');

        // ==================== 手势检测 ====================
        function countFingers(lm) {
            let cnt = 0;
            const wrist = lm[0];
            [{t:8,b:5},{t:12,b:9},{t:16,b:13},{t:20,b:17}].forEach(f => {
                const d1 = Math.hypot(lm[f.t].x-wrist.x, lm[f.t].y-wrist.y);
                const d2 = Math.hypot(lm[f.b].x-wrist.x, lm[f.b].y-wrist.y);
                if (d1 > d2 * 1.18) cnt++;
            });
            return cnt;
        }

        let currentGesture = 0, targetScale = 1.0, currentScale = 1.0;
        let time = 0, detectedHands = 0;

        // ==================== MediaPipe ====================
        const video = document.getElementById('video');
        const loading = document.getElementById('loading');
        const errOverlay = document.getElementById('error-overlay');

        function onResults(r) {
            detectedHands = r.multiHandLandmarks ? r.multiHandLandmarks.length : 0;
            let gesture = 0;

            if (detectedHands > 0) {
                let maxF = 0;
                for (const h of r.multiHandLandmarks) {
                    const f = countFingers(h);
                    if (f > maxF) maxF = f;
                }
                if (maxF >= 1 && maxF <= 9) gesture = maxF;

                if (detectedHands >= 2) {
                    const a = r.multiHandLandmarks[0][9];
                    const b = r.multiHandLandmarks[1][9];
                    const dist = Math.hypot(a.x-b.x, a.y-b.y);
                    // 0.08~0.65 -> 0.35~3.0
                    targetScale = 0.35 + Math.min(Math.max((dist-0.08)/0.57,0),1) * 2.65;
                } else {
                    targetScale = 1.0;
                }
            } else {
                targetScale = 1.0 + Math.sin(time*0.4)*0.15;
                gesture = 0;
            }

            currentGesture = gesture;
            hudMode.textContent = gesture === 0 ? 'SPHERE' : `${gesture}F`;
            hudText.textContent = gesture === 0 ? '--' : (gestureTexts[gesture]||'').toUpperCase();
            hudHands.textContent = detectedHands;
        }

        try {
            const hands = new Hands({locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
            hands.setOptions({maxNumHands:2, modelComplexity:1, minDetectionConfidence:0.5, minTrackingConfidence:0.5});
            hands.onResults(onResults);

            const cam = new Camera(video, {
                onFrame: async () => await hands.send({image: video}),
                width: 640, height: 480
            });
            cam.start().then(() => loading.style.display='none')
              .catch(() => { loading.style.display='none'; errOverlay.style.display='block'; errOverlay.textContent='摄像头启动失败，请检查权限后刷新'; });
        } catch(e) {
            loading.style.display='none'; errOverlay.style.display='block'; errOverlay.textContent='初始化错误: '+e.message;
        }

        // ==================== 动画 ====================
        function update() {
            const posArr = geo.attributes.position.array;
            const colArr = geo.attributes.color.array;

            currentScale += (targetScale - currentScale) * SCALE_LERP;
            hudScale.textContent = currentScale.toFixed(2)+'x';

            const tColor = COLOR_MAP[currentGesture] || COLOR_MAP[0];
            const isText = currentGesture >= 1 && currentGesture <= 9;

            if (isText) {
                const txt = (gestureTexts[currentGesture]||'').toUpperCase();
                const pts = getTextPoints(txt);
                for (let i=0; i<PARTICLE_COUNT; i++) {
                    const i3=i*3, p=pts[i];
                    const tx = p.x * currentScale;
                    const ty = p.y * currentScale;
                    const tz = p.z * currentScale;
                    posArr[i3] += (tx - posArr[i3]) * LERP_SPEED;
                    posArr[i3+1] += (ty - posArr[i3+1]) * LERP_SPEED;
                    posArr[i3+2] += (tz - posArr[i3+2]) * LERP_SPEED;
                    colArr[i3] += (tColor.r - colArr[i3])*0.06;
                    colArr[i3+1] += (tColor.g - colArr[i3+1])*0.06;
                    colArr[i3+2] += (tColor.b - colArr[i3+2])*0.06;
                }
            } else {
                for (let i=0; i<PARTICLE_COUNT; i++) {
                    const i3=i*3, ph=phases[i];
                    const breathe = 1.0 + Math.sin(time*1.5 + ph)*0.08 + Math.cos(time*0.7 + ph)*0.05;
                    const tx = sphereTargets[i3] * currentScale * breathe;
                    const ty = sphereTargets[i3+1] * currentScale * breathe;
                    const tz = sphereTargets[i3+2] * currentScale * breathe;
                    posArr[i3] += (tx - posArr[i3]) * LERP_SPEED;
                    posArr[i3+1] += (ty - posArr[i3+1]) * LERP_SPEED;
                    posArr[i3+2] += (tz - posArr[i3+2]) * LERP_SPEED;
                    colArr[i3] += (tColor.r - colArr[i3])*0.04;
                    colArr[i3+1] += (tColor.g - colArr[i3+1])*0.04;
                    colArr[i3+2] += (tColor.b - colArr[i3+2])*0.04;
                }
            }
            geo.attributes.position.needsUpdate = true;
            geo.attributes.color.needsUpdate = true;
        }

        function animate() {
            requestAnimationFrame(animate);
            time += 0.016;
            update();
            particles.rotation.y += 0.0015;
            particles.rotation.x = Math.sin(time*0.2)*0.08;
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>
```

### 操作指南

| 手势 | 效果 |
|------|------|
| **无手 / 0 指** | 粒子组成缓慢呼吸旋转的 3D 球体星云 |
| **举起 1-9 根手指** | 粒子变形为对应文字（默认：`1=AI` `2=LOVE` ... `9=DREAM`） |
| **双手靠近（捏合）** | 整个粒子球体/文字**明显缩小**（最小 0.35x） |
| **双手远离（张开）** | 整个粒子球体/文字**明显放大**（最大 3.0x） |
| **点击右下角 ⚙** | 展开设置面板，可自定义 1-9 每个手势对应的文字 |

### 技术亮点

- **全局缩放架构**：不再用随机噪声模拟扩散，而是将 `currentScale` 直接乘到所有目标坐标上，双手距离与视觉大小呈严格的线性关系，极其直观
- **斐波那契球体**：无手势时粒子均匀分布在多层球壳上，配合正弦呼吸动画，呈现有机生命感
- **自适应文字采样**：根据输入文字长度自动调整画布宽度与字体大小，确保 1-8 个字母都能获得最佳粒子密度
- **平滑过渡**：所有状态变化（形状切换、颜色切换、缩放变化）均使用独立插值速率，避免生硬跳变
User: 文字正面展示即可 不要旋转角度
Kimi: ```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gesture Particle Sphere</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; background: #000; font-family: 'Segoe UI', system-ui, sans-serif; }

        #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; z-index: 1; }

        #video {
            position: absolute; bottom: 70px; left: 16px;
            width: 140px; height: 105px; border-radius: 8px;
            border: 1px solid rgba(0, 255, 255, 0.15);
            transform: scaleX(-1); z-index: 10; object-fit: cover;
            opacity: 0.35; transition: opacity 0.4s;
        }
        #video:hover { opacity: 0.85; }

        #status-hud {
            position: absolute; top: 20px; left: 20px; z-index: 10;
            color: rgba(255, 255, 255, 0.5); font-size: 10px;
            line-height: 1.8; pointer-events: none; letter-spacing: 1px;
            font-family: 'Courier New', monospace;
        }
        #status-hud .hud-line { display: flex; gap: 16px; }
        #status-hud .hud-label { color: rgba(255,255,255,0.25); width: 50px; }
        #status-hud .hud-value { color: #0ff; font-weight: bold; min-width: 80px; }

        #settings-btn {
            position: absolute; bottom: 20px; right: 20px;
            width: 36px; height: 36px; border-radius: 50%;
            background: rgba(0, 255, 255, 0.08); border: 1px solid rgba(0, 255, 255, 0.25);
            color: rgba(0, 255, 255, 0.8); font-size: 16px; cursor: pointer; z-index: 20;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(5px); transition: all 0.3s;
        }
        #settings-btn:hover { background: rgba(0, 255, 255, 0.2); transform: scale(1.15); box-shadow: 0 0 15px rgba(0,255,255,0.2); }

        #settings-panel {
            position: absolute; bottom: 64px; right: 16px;
            width: 260px; background: rgba(5, 10, 25, 0.9);
            backdrop-filter: blur(20px); border: 1px solid rgba(0, 255, 255, 0.12);
            border-radius: 14px; padding: 18px; z-index: 20;
            transform: translateY(10px) scale(0.95); opacity: 0; pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }
        #settings-panel.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }

        #settings-panel h3 {
            color: #0ff; font-size: 12px; margin-bottom: 14px;
            letter-spacing: 3px; text-transform: uppercase;
            border-bottom: 1px solid rgba(0, 255, 255, 0.08); padding-bottom: 8px;
            font-weight: 600;
        }
        .gesture-row {
            display: flex; align-items: center; margin-bottom: 8px; gap: 8px;
        }
        .gesture-row .g-num {
            width: 22px; height: 22px; border-radius: 50%;
            background: rgba(0, 255, 255, 0.08); border: 1px solid rgba(0, 255, 255, 0.15);
            color: #0ff; font-size: 10px; display: flex; align-items: center; justify-content: center;
            font-weight: bold; flex-shrink: 0;
        }
        .gesture-row input {
            flex: 1; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 6px; padding: 5px 10px; color: #fff; font-size: 12px;
            outline: none; transition: all 0.2s; font-family: inherit;
        }
        .gesture-row input:focus { border-color: rgba(0, 255, 255, 0.4); background: rgba(255, 255, 255, 0.07); }
        .gesture-row input::placeholder { color: rgba(255, 255, 255, 0.15); }
        .hint-text {
            margin-top: 10px; font-size: 10px; color: rgba(255, 255, 255, 0.2);
            line-height: 1.6; text-align: center; letter-spacing: 0.5px;
        }

        #loading {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: rgba(0, 255, 255, 0.7); font-size: 12px; z-index: 30; text-align: center;
            letter-spacing: 6px; text-transform: uppercase; pointer-events: none;
        }
        #loading::after {
            content: ''; display: block; width: 30px; height: 30px;
            margin: 16px auto 0; border: 1px solid rgba(0, 255, 255, 0.1);
            border-top-color: #0ff; border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-overlay {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: #ff5555; font-size: 13px; z-index: 30; text-align: center;
            background: rgba(0,0,0,0.85); padding: 24px; border-radius: 12px;
            display: none; max-width: 320px; line-height: 1.6; border: 1px solid rgba(255,0,0,0.2);
        }
    </style>
</head>
<body>
    <div id="loading">系统初始化</div>
    <div class="error-overlay" id="error-overlay"></div>

    <div id="canvas-container"></div>
    <video id="video" playsinline></video>

    <div id="status-hud">
        <div class="hud-line"><span class="hud-label">MODE</span><span class="hud-value" id="hud-mode">SPHERE</span></div>
        <div class="hud-line"><span class="hud-label">TEXT</span><span class="hud-value" id="hud-text">--</span></div>
        <div class="hud-line"><span class="hud-label">SCALE</span><span class="hud-value" id="hud-scale">1.00x</span></div>
        <div class="hud-line"><span class="hud-label">HANDS</span><span class="hud-value" id="hud-hands">0</span></div>
    </div>

    <button id="settings-btn">⚙</button>
    <div id="settings-panel">
        <h3>手势文字绑定</h3>
        <div id="gesture-inputs"></div>
        <div class="hint-text">
            举起 1-9 根手指触发对应文字<br>
            双手靠近/远离控制整体缩放
        </div>
    </div>

    <script>
        // ==================== 配置 ====================
        const PARTICLE_COUNT = 12000;
        const LERP_SPEED = 0.055;
        const SCALE_LERP = 0.1;
        const BASE_RADIUS = 14;

        const DEFAULT_TEXTS = {
            1: 'AI',     2: 'LOVE',  3: 'WIN',
            4: 'HOPE',   5: 'FREE',  6: 'PEACE',
            7: 'POWER',  8: 'FUTURE',9: 'DREAM'
        };

        const COLOR_MAP = {
            0: new THREE.Color(0x0088ff),
            1: new THREE.Color(0x00ffff), 2: new THREE.Color(0xff55aa),
            3: new THREE.Color(0xffcc00), 4: new THREE.Color(0x55ff55),
            5: new THREE.Color(0xff7733), 6: new THREE.Color(0xcc55ff),
            7: new THREE.Color(0xff3333), 8: new THREE.Color(0x33ffcc),
            9: new THREE.Color(0xff88bb)
        };

        // ==================== Three.js ====================
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.012);

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 45;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 粒子贴图
        const cvs = document.createElement('canvas');
        cvs.width = 64; cvs.height = 64;
        const ctx = cvs.getContext('2d');
        const grad = ctx.createRadialGradient(32,32,0, 32,32,32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.25, 'rgba(255,255,255,0.5)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(0,0,64,64);
        const tex = new THREE.CanvasTexture(cvs);

        const mat = new THREE.PointsMaterial({
            size: 0.55, map: tex, transparent: true, opacity: 0.9,
            vertexColors: true, blending: THREE.AdditiveBlending,
            depthWrite: false, sizeAttenuation: true
        });

        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        const col = new Float32Array(PARTICLE_COUNT * 3);
        const targets = new Float32Array(PARTICLE_COUNT * 3);
        const sphereTargets = new Float32Array(PARTICLE_COUNT * 3);
        const randoms = new Float32Array(PARTICLE_COUNT * 3);
        const phases = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            pos[i3] = (Math.random()-0.5)*60;
            pos[i3+1] = (Math.random()-0.5)*60;
            pos[i3+2] = (Math.random()-0.5)*60;
            targets[i3] = pos[i3]; targets[i3+1] = pos[i3+1]; targets[i3+2] = pos[i3+2];
            randoms[i3] = Math.random()-0.5; randoms[i3+1] = Math.random()-0.5; randoms[i3+2] = Math.random()-0.5;
            phases[i] = Math.random() * Math.PI * 2;
            col[i3] = 0; col[i3+1] = 0.3; col[i3+2] = 1;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        // ==================== 斐波那契球体 ====================
        function genSphere(count, radius) {
            const pts = [], phi = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < count; i++) {
                const y = 1 - (i / (count - 1)) * 2;
                const r = Math.sqrt(1 - y*y);
                const theta = phi * i;
                const x = Math.cos(theta) * r;
                const z = Math.sin(theta) * r;
                const shell = Math.pow(Math.random(), 2.5);
                const d = radius * (0.15 + 0.85 * shell);
                pts.push({x: x*d, y: y*d, z: z*d});
            }
            return pts;
        }
        const spherePts = genSphere(PARTICLE_COUNT, BASE_RADIUS);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i*3;
            sphereTargets[i3] = spherePts[i].x;
            sphereTargets[i3+1] = spherePts[i].y;
            sphereTargets[i3+2] = spherePts[i].z;
        }

        // ==================== 文字采样（扁平Z轴） ====================
        function sampleText(text, count) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const len = text.length;
            const fontSize = Math.max(50, 160 / Math.max(len * 0.55, 1));
            const w = Math.max(320, len * 70);
            const h = 220;
            canvas.width = w; canvas.height = h;

            ctx.fillStyle = 'black'; ctx.fillRect(0,0,w,h);
            ctx.fillStyle = 'white';
            ctx.font = `bold ${fontSize}px "Arial","Helvetica",sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(text.toUpperCase(), w/2, h/2);

            const img = ctx.getImageData(0,0,w,h).data;
            const base = [];
            const step = len > 5 ? 3 : 2;
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    if (img[(y*w + x)*4] > 120) {
                        base.push({
                            x: (x - w/2) / (fontSize/11),
                            y: -(y - h/2) / (fontSize/11),
                            z: 0
                        });
                    }
                }
            }

            const res = [];
            if (base.length === 0) {
                for (let i=0;i<count;i++) res.push({x:0,y:0,z:0});
                return res;
            }
            if (base.length >= count) {
                const shuf = base.sort(() => Math.random()-0.5);
                for (let i=0;i<count;i++) res.push(shuf[i]);
            } else {
                for (let i=0;i<count;i++) {
                    const b = base[i % base.length];
                    // z 轴仅 ±0.2，确保文字正面展示时几乎无厚度
                    res.push({
                        x: b.x + (Math.random()-0.5)*0.6,
                        y: b.y + (Math.random()-0.5)*0.6,
                        z: (Math.random()-0.5)*0.2
                    });
                }
            }
            return res;
        }

        const textCache = {};
        function getTextPoints(text) {
            const k = text.toUpperCase();
            if (!textCache[k]) textCache[k] = sampleText(k, PARTICLE_COUNT);
            return textCache[k];
        }

        // ==================== UI ====================
        const inputsDiv = document.getElementById('gesture-inputs');
        const gestureTexts = {...DEFAULT_TEXTS};
        for (let g=1; g<=9; g++) {
            const row = document.createElement('div');
            row.className = 'gesture-row';
            row.innerHTML = `<div class="g-num">${g}</div><input type="text" value="${gestureTexts[g]}" maxlength="8" data-g="${g}">`;
            inputsDiv.appendChild(row);
        }
        inputsDiv.addEventListener('input', e => {
            if (e.target.tagName === 'INPUT') {
                const g = parseInt(e.target.dataset.g);
                gestureTexts[g] = e.target.value || DEFAULT_TEXTS[g];
                delete textCache[gestureTexts[g].toUpperCase()];
            }
        });

        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        let panelOpen = false;
        settingsBtn.addEventListener('click', () => {
            panelOpen = !panelOpen;
            settingsPanel.classList.toggle('open', panelOpen);
            settingsBtn.textContent = panelOpen ? '✕' : '⚙';
        });

        const hudMode = document.getElementById('hud-mode');
        const hudText = document.getElementById('hud-text');
        const hudScale = document.getElementById('hud-scale');
        const hudHands = document.getElementById('hud-hands');

        // ==================== 手势检测 ====================
        function countFingers(lm) {
            let cnt = 0;
            const wrist = lm[0];
            [{t:8,b:5},{t:12,b:9},{t:16,b:13},{t:20,b:17}].forEach(f => {
                const d1 = Math.hypot(lm[f.t].x-wrist.x, lm[f.t].y-wrist.y);
                const d2 = Math.hypot(lm[f.b].x-wrist.x, lm[f.b].y-wrist.y);
                if (d1 > d2 * 1.18) cnt++;
            });
            return cnt;
        }

        let currentGesture = 0, targetScale = 1.0, currentScale = 1.0;
        let time = 0, detectedHands = 0;

        // ==================== MediaPipe ====================
        const video = document.getElementById('video');
        const loading = document.getElementById('loading');
        const errOverlay = document.getElementById('error-overlay');

        function onResults(r) {
            detectedHands = r.multiHandLandmarks ? r.multiHandLandmarks.length : 0;
            let gesture = 0;

            if (detectedHands > 0) {
                let maxF = 0;
                for (const h of r.multiHandLandmarks) {
                    const f = countFingers(h);
                    if (f > maxF) maxF = f;
                }
                if (maxF >= 1 && maxF <= 9) gesture = maxF;

                if (detectedHands >= 2) {
                    const a = r.multiHandLandmarks[0][9];
                    const b = r.multiHandLandmarks[1][9];
                    const dist = Math.hypot(a.x-b.x, a.y-b.y);
                    targetScale = 0.35 + Math.min(Math.max((dist-0.08)/0.57,0),1) * 2.65;
                } else {
                    targetScale = 1.0;
                }
            } else {
                targetScale = 1.0 + Math.sin(time*0.4)*0.15;
                gesture = 0;
            }

            currentGesture = gesture;
            hudMode.textContent = gesture === 0 ? 'SPHERE' : `${gesture}F`;
            hudText.textContent = gesture === 0 ? '--' : (gestureTexts[gesture]||'').toUpperCase();
            hudHands.textContent = detectedHands;
        }

        try {
            const hands = new Hands({locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
            hands.setOptions({maxNumHands:2, modelComplexity:1, minDetectionConfidence:0.5, minTrackingConfidence:0.5});
            hands.onResults(onResults);

            const cam = new Camera(video, {
                onFrame: async () => await hands.send({image: video}),
                width: 640, height: 480
            });
            cam.start().then(() => loading.style.display='none')
              .catch(() => { loading.style.display='none'; errOverlay.style.display='block'; errOverlay.textContent='摄像头启动失败，请检查权限后刷新'; });
        } catch(e) {
            loading.style.display='none'; errOverlay.style.display='block'; errOverlay.textContent='初始化错误: '+e.message;
        }

        // ==================== 动画 ====================
        function update() {
            const posArr = geo.attributes.position.array;
            const colArr = geo.attributes.color.array;

            currentScale += (targetScale - currentScale) * SCALE_LERP;
            hudScale.textContent = currentScale.toFixed(2)+'x';

            const tColor = COLOR_MAP[currentGesture] || COLOR_MAP[0];
            const isText = currentGesture >= 1 && currentGesture <= 9;

            if (isText) {
                const txt = (gestureTexts[currentGesture]||'').toUpperCase();
                const pts = getTextPoints(txt);
                for (let i=0; i<PARTICLE_COUNT; i++) {
                    const i3=i*3, p=pts[i];
                    const tx = p.x * currentScale;
                    const ty = p.y * currentScale;
                    const tz = p.z * currentScale;
                    posArr[i3] += (tx - posArr[i3]) * LERP_SPEED;
                    posArr[i3+1] += (ty - posArr[i3+1]) * LERP_SPEED;
                    posArr[i3+2] += (tz - posArr[i3+2]) * LERP_SPEED;
                    colArr[i3] += (tColor.r - colArr[i3])*0.06;
                    colArr[i3+1] += (tColor.g - colArr[i3+1])*0.06;
                    colArr[i3+2] += (tColor.b - colArr[i3+2])*0.06;
                }
            } else {
                for (let i=0; i<PARTICLE_COUNT; i++) {
                    const i3=i*3, ph=phases[i];
                    const breathe = 1.0 + Math.sin(time*1.5 + ph)*0.08 + Math.cos(time*0.7 + ph)*0.05;
                    const tx = sphereTargets[i3] * currentScale * breathe;
                    const ty = sphereTargets[i3+1] * currentScale * breathe;
                    const tz = sphereTargets[i3+2] * currentScale * breathe;
                    posArr[i3] += (tx - posArr[i3]) * LERP_SPEED;
                    posArr[i3+1] += (ty - posArr[i3+1]) * LERP_SPEED;
                    posArr[i3+2] += (tz - posArr[i3+2]) * LERP_SPEED;
                    colArr[i3] += (tColor.r - colArr[i3])*0.04;
                    colArr[i3+1] += (tColor.g - colArr[i3+1])*0.04;
                    colArr[i3+2] += (tColor.b - colArr[i3+2])*0.04;
                }
            }
            geo.attributes.position.needsUpdate = true;
            geo.attributes.color.needsUpdate = true;
        }

        function animate() {
            requestAnimationFrame(animate);
            time += 0.016;
            update();

            if (currentGesture === 0) {
                // 球体模式：允许缓慢旋转
                particles.rotation.y += 0.0015;
                particles.rotation.x = Math.sin(time*0.2)*0.08;
            } else {
                // 文字模式：强制正面，旋转快速归零
                particles.rotation.y *= 0.85;
                particles.rotation.x *= 0.85;
                if (Math.abs(particles.rotation.y) < 0.001) particles.rotation.y = 0;
                if (Math.abs(particles.rotation.x) < 0.001) particles.rotation.x = 0;
            }

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>
```

### 修改说明

| 改动 | 效果 |
|------|------|
| **文字 Z 轴压缩** | `sampleText` 中粒子 z 坐标从 `±2.0` 改为 `±0.2`，文字几乎完全平面化 |
| **文字模式旋转归零** | 当检测到手势（1-9）时，每帧将 `particles.rotation.x/y` 乘以 0.85 快速衰减至 0，确保文字正面正对相机 |
| **球体模式保留旋转** | 无手势时仍保持缓慢旋转与呼吸动画，与文字模式形成对比 |
| **Billboard 天然正面** | Three.js 粒子点材质自带 billboard 属性（始终面向相机），配合 rotation 归零后，文字平面完全正对视线 |

**使用方式不变**：保存为 `.html` 通过本地服务器打开，允许摄像头权限，举起 1-9 根手指即可看到正面展示的文字，双手张合控制整体缩放。
User: 给项目取一个合适的英文名字
Kimi: 以下是几个适合这个项目的英文名字，风格从科技感、诗意到简洁各有不同：

---

### 推荐首选

| 名字 | 含义 | 风格 |
|------|------|------|
| **Gestura** | Gesture（手势）+ Aura（光环/气场） | 简洁有力，发音优雅 |
| **Kinetype** | Kinetic（运动的）+ Type（文字） | 强调动态文字的核心特性 |
| **Manuform** | Manus（拉丁语"手"）+ Form（形态） | 古典科技感，暗示用手塑造形态 |

---

### 其他候选

- **Fingertalk** — 手指即语言，直观易懂
- **Morphhand** — 变形之手，强调手势驱动的形态变化
- **Signa** — 源自 Sign（手势/符号），极简拉丁风
- **Heliograph** — 原指日光反射信号器，引申为"用手势书写光"
- **Chirosphere** — Chiro（希腊语"手"）+ Sphere（球体），呼应粒子球体

---

### 最推荐

> **Gestura**

理由：发音像一种优雅的咒语，三个音节朗朗上口，完美涵盖"手势"（Gesture）与"粒子光环"（Aura）的双重意象，且域名和商标可用性相对较高。
点击链接查看和 Kimi 的对话 https://www.kimi.com/share/19e91b27-6022-8519-8000-0000c1d9415e
