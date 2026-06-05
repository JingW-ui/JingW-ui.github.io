/**
 * 选择排序算法动画生成器
 * Selection Sort Animation Steps Generator
 */
class SelectionSortAnimator {
    constructor() {
        this.name = '选择排序';
        this.englishName = 'Selection Sort';
        this.description = '每一轮选出最小元素，放到已排序区间末尾。不稳定排序，时间复杂度 O(n²)。';
        this.pseudocode = [
            'for i = 0 to n-1:',
            '  min_idx = i',
            '  for j = i+1 to n:',
            '    if arr[j] < arr[min_idx]:',
            '      min_idx = j',
            '  swap(arr[i], arr[min_idx])'
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
            let minIdx = i;
            steps.push({
                type: 'highlight',
                indices: [i],
                color: 0xffaa00,
                pseudocodeLine: 1
            });

            for (let j = i + 1; j < n; j++) {
                steps.push({
                    type: 'compare',
                    indices: [minIdx, j],
                    pseudocodeLine: 3
                });
                compCount++;

                if (arr[j] < arr[minIdx]) {
                    if (minIdx !== i) {
                        steps.push({
                            type: 'unhighlight',
                            indices: [minIdx],
                            pseudocodeLine: -1
                        });
                    }
                    minIdx = j;
                    steps.push({
                        type: 'highlight',
                        indices: [minIdx],
                        color: 0xff4444,
                        pseudocodeLine: 4
                    });
                }
            }

            if (minIdx !== i) {
                // 保存交换前的值
                const val1 = arr[i];
                const val2 = arr[minIdx];
                
                // 执行交换
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                
                steps.push({
                    type: 'swap',
                    indices: [i, minIdx],
                    values: [val2, val1],  // 交换后的值
                    pseudocodeLine: 5
                });
                swapCount++;
            }

            steps.push({
                type: 'sorted',
                indices: [i],
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
    module.exports = SelectionSortAnimator;
}
