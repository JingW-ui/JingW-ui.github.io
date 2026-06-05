/**
 * 快速排序算法动画生成器
 * Quick Sort Animation Steps Generator
 */
class QuickSortAnimator {
    constructor() {
        this.name = '快速排序';
        this.englishName = 'Quick Sort';
        this.description = '选一个基准值，将数组划分为小于和大于两部分，递归处理。不稳定排序，平均时间复杂度 O(n log n)。';
        this.pseudocode = [
            'quick_sort(arr, l, r):',
            '  if l < r:',
            '    pi = partition(arr, l, r)',
            '    quick_sort(arr, l, pi-1)',
            '    quick_sort(arr, pi+1, r)',
            '',
            'partition(arr, l, r):',
            '  pivot = arr[r]',
            '  将小于pivot的放左边',
            '  将大于pivot的放右边'
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
        let compCount = 0;
        let swapCount = 0;

        const quickSort = (l, r) => {
            if (l >= r) return;

            const pivot = arr[r];
            steps.push({
                type: 'pivot',
                index: r,
                value: pivot,
                pseudocodeLine: 7
            });

            let i = l - 1;
            for (let j = l; j < r; j++) {
                steps.push({
                    type: 'compare',
                    indices: [j, r],
                    pseudocodeLine: -1
                });
                compCount++;

                if (arr[j] < pivot) {
                    i++;
                    if (i !== j) {
                        // 保存交换前的值
                        const val1 = arr[i];
                        const val2 = arr[j];
                        
                        // 执行交换
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        
                        steps.push({
                            type: 'swap',
                            indices: [i, j],
                            values: [val2, val1],  // 交换后的值
                            pseudocodeLine: -1
                        });
                        swapCount++;
                    }
                }
            }

            // 保存交换前的值
            const val1 = arr[i + 1];
            const val2 = arr[r];
            
            // 执行交换
            [arr[i + 1], arr[r]] = [arr[r], arr[i + 1]];
            const pi = i + 1;
            
            steps.push({
                type: 'swap',
                indices: [pi, r],
                values: [val2, val1],  // 交换后的值
                pseudocodeLine: -1
            });
            swapCount++;

            steps.push({
                type: 'sorted',
                indices: [pi],
                pseudocodeLine: -1
            });

            quickSort(l, pi - 1);
            quickSort(pi + 1, r);
        };

        quickSort(0, arr.length - 1);

        // 标记所有为已排序
        for (let i = 0; i < arr.length; i++) {
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
    module.exports = QuickSortAnimator;
}
