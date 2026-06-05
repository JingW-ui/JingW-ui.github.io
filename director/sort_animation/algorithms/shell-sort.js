/**
 * 希尔排序算法动画生成器
 * Shell Sort Animation Steps Generator
 */
class ShellSortAnimator {
    constructor() {
        this.name = '希尔排序';
        this.englishName = 'Shell Sort';
        this.description = '插入排序的改进版，通过分组+增量减少移动次数。不稳定排序，时间复杂度 O(n^1.3)。';
        this.pseudocode = [
            'gap = n // 2',
            'while gap > 0:',
            '  for i = gap to n-1:',
            '    temp = arr[i]',
            '    j = i',
            '    while j >= gap and arr[j-gap] > temp:',
            '      arr[j] = arr[j-gap]',
            '      j -= gap',
            '    arr[j] = temp',
            '  gap //= 2'
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
        let gap = Math.floor(n / 2);
        let compCount = 0;
        let swapCount = 0;

        while (gap > 0) {
            steps.push({
                type: 'info',
                message: `Gap = ${gap}`,
                pseudocodeLine: 0
            });

            for (let i = gap; i < n; i++) {
                let temp = arr[i];
                let j = i;

                while (j >= gap && arr[j - gap] > temp) {
                    steps.push({
                        type: 'compare',
                        indices: [j - gap, j],
                        pseudocodeLine: 5
                    });
                    compCount++;

                    steps.push({
                        type: 'shift',
                        from: j - gap,
                        to: j,
                        value: arr[j - gap],  // 添加：要移动的值
                        pseudocodeLine: 6
                    });
                    arr[j] = arr[j - gap];
                    swapCount++;
                    j -= gap;
                }

                if (j >= gap) {
                    compCount++; // 最后一次比较失败
                }

                arr[j] = temp;
                steps.push({
                    type: 'insert',
                    index: j,
                    value: temp,
                    pseudocodeLine: 8
                });
            }

            gap = Math.floor(gap / 2);
        }

        // 标记所有为已排序
        for (let i = 0; i < n; i++) {
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
    module.exports = ShellSortAnimator;
}
