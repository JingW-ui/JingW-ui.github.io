/**
 * 排序算法注册表
 * Sort Algorithm Registry
 */
class AlgorithmRegistry {
    constructor() {
        this.algorithms = {};
    }

    /**
     * 注册算法
     * @param {string} key - 算法标识
     * @param {Object} animator - 算法动画生成器实例
     */
    register(key, animator) {
        this.algorithms[key] = animator;
    }

    /**
     * 获取算法
     * @param {string} key - 算法标识
     * @returns {Object|null} 算法动画生成器实例
     */
    get(key) {
        return this.algorithms[key] || null;
    }

    /**
     * 获取所有算法keys
     * @returns {string[]}
     */
    getKeys() {
        return Object.keys(this.algorithms);
    }

    /**
     * 获取所有算法信息
     * @returns {Object}
     */
    getAllInfo() {
        const info = {};
        for (const key in this.algorithms) {
            const algo = this.algorithms[key];
            info[key] = {
                name: algo.name,
                englishName: algo.englishName,
                description: algo.description,
                pseudocode: algo.pseudocode
            };
        }
        return info;
    }
}

// 创建全局注册表实例
window.algorithmRegistry = new AlgorithmRegistry();
