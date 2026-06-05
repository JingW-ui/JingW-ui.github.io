/**
 * 归并排序算法动画生成器
 * Merge Sort Animation Steps Generator
 */
class MergeSortAnimator {
    constructor() {
        this.name = '归并排序';
        this.englishName = 'Merge Sort';
        this.description = '分治法：拆分成两半，分别排序，合并两个有序数组。稳定排序，时间复杂度 O(n log n)。';
        this.pseudocode = [
            'merge_sort(arr, l, r):',
            '  if l < r:',
            '    m = (l+r) // 2',
            '    merge_sort(arr, l, m)',
            '    merge_sort(arr, m+1, r)',
            '    merge(arr, l, m, r)',
            '',
            'merge(arr, l, m, r):',
            '  合并两个有序子数组'
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

        const mergeSort = (l, r) => {
            if (l >= r) return;

            const m = Math.floor((l + r) / 2);
            steps.push({
                type: 'split',
                range: [l, r],
                mid: m,
                pseudocodeLine: 2
            });

            mergeSort(l, m);
            mergeSort(m + 1, r);
            merge(l, m, r);
        };

        const merge = (l, m, r) => {
            const left = arr.slice(l, m + 1);
            const right = arr.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;

            steps.push({
                type: 'merge-start',
                range: [l, r],
                pseudocodeLine: 7
            });

            while (i < left.length && j < right.length) {
                steps.push({
                    type: 'compare',
                    indices: [l + i, m + 1 + j],
                    pseudocodeLine: -1
                });
                compCount++;

                if (left[i] <= right[j]) {
                    arr[k] = left[i];
                    steps.push({
                        type: 'place',
                        index: k,
                        value: left[i],
                        pseudocodeLine: -1
                    });
                    i++;
                } else {
                    arr[k] = right[j];
                    steps.push({
                        type: 'place',
                        index: k,
                        value: right[j],
                        pseudocodeLine: -1
                    });
                    j++;
                }
                swapCount++;
                k++;
            }

            while (i < left.length) {
                arr[k] = left[i];
                steps.push({
                    type: 'place',
                    index: k,
                    value: left[i],
                    pseudocodeLine: -1
                });
                i++;
                k++;
                swapCount++;
            }

            while (j < right.length) {
                arr[k] = right[j];
                steps.push({
                    type: 'place',
                    index: k,
                    value: right[j],
                    pseudocodeLine: -1
                });
                j++;
                k++;
                swapCount++;
            }
        };

        mergeSort(0, arr.length - 1);

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
    module.exports = MergeSortAnimator;
}
