# 排序算法动画可视化 - 模块化架构

## 📁 项目结构

```
sort_animation/
├── index.html              # 主文件（Three.js场景 + UI + 动画引擎）
├── algorithms/             # 算法模块目录
│   ├── registry.js         # 算法注册表
│   ├── bubble-sort.js      # 冒泡排序
│   ├── selection-sort.js   # 选择排序
│   ├── insertion-sort.js   # 插入排序
│   ├── shell-sort.js       # 希尔排序
│   ├── merge-sort.js       # 归并排序
│   └── quick-sort.js       # 快速排序
└── README.md               # 项目说明
```

## 🎯 架构设计

### 核心思想
- **算法与视图分离**：每个算法独立文件，只负责生成动画步骤
- **注册表模式**：统一管理和访问所有算法
- **可扩展**：添加新算法只需创建新文件并注册

### 数据流
```
用户选择算法 
  ↓
从注册表获取算法实例
  ↓
调用 algorithm.generateSteps(arrayData)
  ↓
返回 { steps, comparisons, swaps, sortedArray }
  ↓
动画引擎执行 steps
```

## 🔧 如何添加新算法

### 步骤 1: 创建算法文件
在 `algorithms/` 目录下创建新文件，例如 `heap-sort.js`：

```javascript
/**
 * 堆排序算法动画生成器
 * Heap Sort Animation Steps Generator
 */
class HeapSortAnimator {
    constructor() {
        this.name = '堆排序';
        this.englishName = 'Heap Sort';
        this.description = '利用堆数据结构进行选择排序。不稳定排序，时间复杂度 O(n log n)。';
        this.pseudocode = [
            'build_max_heap(arr)',
            'for i = n-1 down to 1:',
            '  swap(arr[0], arr[i])',
            '  heapify(arr, 0, i)'
        ];
    }

    generateSteps(arrayData) {
        const steps = [];
        const arr = [...arrayData];
        let compCount = 0;
        let swapCount = 0;

        // 实现你的算法逻辑
        // 推入步骤到 steps 数组
        // 步骤类型：compare, swap, sorted, highlight, etc.

        return {
            steps,
            comparisons: compCount,
            swaps: swapCount,
            sortedArray: arr
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeapSortAnimator;
}
```

### 步骤 2: 在 index.html 中引入

```html
<!-- 算法模块 -->
<script src="algorithms/registry.js"></script>
<script src="algorithms/bubble-sort.js"></script>
<!-- ... 其他算法 ... -->
<script src="algorithms/heap-sort.js"></script>  <!-- 新增 -->
```

### 步骤 3: 注册算法

在 `index.html` 的 `initAlgorithms()` 函数中添加：

```javascript
function initAlgorithms() {
    window.algorithmRegistry.register('bubble', new BubbleSortAnimator());
    window.algorithmRegistry.register('selection', new SelectionSortAnimator());
    window.algorithmRegistry.register('insertion', new InsertionSortAnimator());
    window.algorithmRegistry.register('shell', new ShellSortAnimator());
    window.algorithmRegistry.register('merge', new MergeSortAnimator());
    window.algorithmRegistry.register('quick', new QuickSortAnimator());
    window.algorithmRegistry.register('heap', new HeapSortAnimator());  // 新增
}
```

### 步骤 4: 在 UI 中添加选项

在 `index.html` 的控制面板中添加单选按钮：

```html
<div class="algorithm-option">
    <input type="radio" name="algorithm" id="heap" value="heap">
    <label for="heap">堆排序 (Heap Sort)</label>
</div>
```

完成！✨

## 📊 动画步骤类型

算法可以生成以下类型的步骤：

| 类型 | 说明 | 参数 |
|------|------|------|
| `compare` | 比较两个元素 | `indices: [i, j]` |
| `swap` | 交换两个元素 | `indices: [i, j], values: [v1, v2]` |
| `sorted` | 标记为已排序 | `indices: [i]` |
| `highlight` | 高亮元素 | `indices: [i], color: 0xRRGGBB` |
| `unhighlight` | 取消高亮 | `indices: [i]` |
| `shift` | 移动元素 | `from: i, to: j` |
| `insert` | 插入元素 | `index: i, value: v` |
| `place` | 放置元素 | `index: i, value: v` |
| `split` | 分割范围 | `range: [l, r], mid: m` |
| `merge-start` | 开始合并 | `range: [l, r]` |
| `pivot` | 标记基准值 | `index: i, value: v` |
| `info` | 显示信息 | `message: string` |

## 🎨 自定义动画

每个步骤可以指定伪代码行号进行高亮：

```javascript
steps.push({
    type: 'compare',
    indices: [j, j + 1],
    pseudocodeLine: 2  // 高亮第2行伪代码
});
```

## 🚀 优势

1. **单一职责**：每个文件只负责一个算法
2. **易于维护**：修改某个算法不影响其他算法
3. **可测试**：可以单独测试每个算法的 `generateSteps` 方法
4. **可扩展**：添加新算法只需3步
5. **可复用**：算法逻辑可以在其他项目中复用

## 📝 注意事项

1. 算法文件必须定义在全局作用域（浏览器环境）
2. 每个算法类必须有 `name`, `englishName`, `description`, `pseudocode` 属性
3. `generateSteps` 方法必须返回包含 `steps`, `comparisons`, `swaps` 的对象
4. 步骤中的索引必须与 `arrayData` 的索引对应

## 🎬 使用示例

```javascript
// 获取算法
const bubbleSort = window.algorithmRegistry.get('bubble');

// 生成动画步骤
const result = bubbleSort.generateSteps([5, 3, 8, 1, 9]);

// 查看结果
console.log(result.steps);        // 动画步骤数组
console.log(result.comparisons);  // 比较次数
console.log(result.swaps);        // 交换次数
console.log(result.sortedArray);  // [1, 3, 5, 8, 9]
```

## 🌟 未来扩展

- [ ] 添加更多算法（堆排序、计数排序、桶排序等）
- [ ] 支持算法对比模式（同时运行多个算法）
- [ ] 添加音效系统
- [ ] 支持自定义颜色主题
- [ ] 添加算法复杂度可视化图表

---

**导演提示**：每个算法都有自己独特的"性格"，通过颜色和动画让观众感受到它们的差异！🎭
