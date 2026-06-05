/**
 * 冒泡排序算法动画生成器
 * Bubble Sort Animation Steps Generator
 */
class BubbleSortAnimator {
    constructor() {
        this.name = '冒泡排序';
        this.englishName = 'Bubble Sort';
        this.description = '相邻元素两两比较，把较大的元素"冒"到右侧。稳定排序，时间复杂度 O(n²)。';
        this.pseudocode = [
            'for i = 0 to n-1:',
            '  for j = 0 to n-i-2:',
            '    if arr[j] > arr[j+1]:',
            '      swap(arr[j], arr[j+1])'
        ];
    }

    /**
     * 生成动画步骤
     * @param {Array} arrayData - 原始数组
     * @returns {Object} { steps, comparisons, swaps }
     */
    generateSteps(arrayData) {
        const steps = [];
        const arr = [...arrayData];
        const n = arr.length;
        let compCount = 0;
        let swapCount = 0;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // 比较
                steps.push({
                    type: 'compare',
                    indices: [j, j + 1],
                    pseudocodeLine: 2
                });
                compCount++;

                // 交换
                if (arr[j] > arr[j + 1]) {
                    // 先保存交换前的值
                    const val1 = arr[j];
                    const val2 = arr[j + 1];

                    // 执行交换
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

                    steps.push({
                        type: 'swap',
                        indices: [j, j + 1],
                        values: [val2, val1],  // 交换后的值
                        pseudocodeLine: 3
                    });
                    swapCount++;
                }
            }
            // 标记已排序
            steps.push({
                type: 'sorted',
                indices: [n - i - 1],
                pseudocodeLine: -1
            });
        }

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
    module.exports = BubbleSortAnimator;
}
