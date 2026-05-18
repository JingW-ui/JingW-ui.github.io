/**
 * 游戏入口 - 初始化并启动游戏
 */
(function() {
    'use strict';

    // 全局游戏实例
    window.game = null;
    window.gameSettings = null;

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🚀 深空漂移战机 - 初始化中...');

        // 先加载所有资源
        try {
            await window.resourceManager.loadAllAssets();
            console.log('✅ 资源加载完成，开始游戏初始化...');
        } catch (error) {
            console.error('❗ 资源加载失败:', error);
            // 显示错误提示并阻止游戏初始化
            alert('游戏资源加载失败，请刷新页面重试！\n错误信息: ' + error.message);
            return; // 阻止后续代码执行
        }

        // 初始化游戏
        window.game = new Game();
        window.gameSettings = window.game.settings;

        // 处理iOS音频自动播放限制
        document.addEventListener('touchstart', function initAudio() {
            if (window.game && window.game.audio) {
                window.game.audio.resume();
            }
            document.removeEventListener('touchstart', initAudio);
        }, { once: true });

        document.addEventListener('click', function initAudio() {
            if (window.game && window.game.audio) {
                window.game.audio.resume();
            }
            document.removeEventListener('click', initAudio);
        }, { once: true });

        // 防止页面滚动和缩放
        document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });

        document.addEventListener('gesturechange', function(e) {
            e.preventDefault();
        });

        document.addEventListener('gestureend', function(e) {
            e.preventDefault();
        });

        // 防止右键菜单
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            if (!window.game) return;

            switch (e.code) {
                case 'Escape':
                    if (window.game.state === 'playing') {
                        window.game.pauseGame();
                    } else if (window.game.state === 'paused') {
                        window.game.resumeGame();
                    }
                    break;

                case 'KeyP':
                    if (window.game.state === 'playing') {
                        window.game.pauseGame();
                    } else if (window.game.state === 'paused') {
                        window.game.resumeGame();
                    }
                    break;

                case 'KeyR':
                    if (window.game.state === 'gameover') {
                        window.game.restartGame();
                    }
                    break;
            }
        });

        console.log('✅ 深空漂移战机 - 初始化完成');
    });

    // 错误处理
    window.addEventListener('error', function(e) {
        // 忽略油猴脚本的错误
        if (e.filename && e.filename.includes('userscript')) {
            return;
        }
        console.error('游戏错误:', e.error);
    });

    window.addEventListener('unhandledrejection', function(e) {
        // 忽略油猴脚本的错误
        if (e.reason && e.reason.stack && e.reason.stack.includes('userscript')) {
            return;
        }
        console.error('未处理的Promise错误:', e.reason);
    });
})();
