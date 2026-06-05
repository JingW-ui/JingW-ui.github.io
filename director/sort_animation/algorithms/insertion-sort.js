/**
 * 插入排序算法动画生成器
 * Insertion Sort Animation Steps Generator
 */
class InsertionSortAnimator {
    constructor() {
        this.name = '插入排序';
        this.englishName = 'Insertion Sort';
        this.description = '像整理扑克牌，将每个元素插入到已排序部分的正确位置。稳定排序，时间复杂度 O(n²)。';
        this.pseudocode = [
            'for i = 1 to n-1:',
            '  key = arr[i]',
            '  j = i - 1',
            '  while j >= 0 and arr[j] > key:',
            '    arr[j+1] = arr[j]',
            '    j -= 1',
            '  arr[j+1] = key'
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

        steps.push({
            type: 'sorted',
            indices: [0],
            pseudocodeLine: -1
        });

        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;

            steps.push({
                type: 'highlight',
                indices: [i],
                color: 0xffaa00,
                pseudocodeLine: 1
            });

            while (j >= 0 && arr[j] > key) {
                steps.push({
                    type: 'compare',
                    indices: [j, j + 1],  // 修复：比较 j 和 j+1 位置
                    pseudocodeLine: 3
                });
                compCount++;

                steps.push({
                    type: 'shift',
                    from: j,
                    to: j + 1,
                    value: arr[j],  // 添加：要移动的值
                    pseudocodeLine: 4
                });
                arr[j + 1] = arr[j];
                swapCount++;
                j--;
            }

            if (j >= 0) {
                compCount++; // 最后一次比较失败
            }

            arr[j + 1] = key;
            steps.push({
                type: 'insert',
                index: j + 1,
                value: key,
                pseudocodeLine: 6
            });
        }

        // 标记所有为已排序
        for (let k = 0; k < n; k++) {
            steps.push({
                type: 'sorted',
                indices: [k],
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
    module.exports = InsertionSortAnimator;
}
