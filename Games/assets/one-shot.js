/*!
 * Games/assets/one-shot.js — Claude Opus 5.5「一句话 one-shot」实测卡标签 + 悬停门户面板
 *
 * 自包含：样式注入 + 配置 + 逻辑，hub 页只需一行引用：
 *   <script src="assets/one-shot.js" defer></script>
 *
 * 提示词原文照录上游 README（riba2534/claude-opus-5-5-demo），一字未改。
 * 门户面板挂 body（position:fixed），绕开 .game-card 的 overflow:hidden + hover transform 裁剪。
 */
(function () {
    'use strict';

    var CSS = [
        '/* one-shot 标签（左上角，紫调玻璃，镜像 src-badge 体系） */',
        '.os-badge {',
        '    position: absolute;',
        '    top: 8px;',
        '    left: 8px;',
        '    z-index: 2;',
        '    border: 1px solid rgba(190, 140, 255, 0.35);',
        '    border-radius: 999px;',
        '    padding: 3px 9px;',
        '    background: rgba(138, 43, 226, 0.28);',
        '    backdrop-filter: blur(6px);',
        '    -webkit-backdrop-filter: blur(6px);',
        '    color: #f3e8ff;',
        '    font-size: 11px;',
        '    font-weight: 600;',
        '    letter-spacing: 0.4px;',
        '    line-height: 1.4;',
        '    font-family: inherit;',
        '    cursor: pointer;',
        '    transition: background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;',
        '}',
        '.os-badge:hover {',
        '    background: rgba(138, 43, 226, 0.45);',
        '    border-color: rgba(190, 140, 255, 0.6);',
        '    transform: scale(1.05);',
        '}',
        '/* one-shot 门户提示面板（fixed 挂 body，不受卡片 overflow:hidden 裁剪） */',
        '.os-tip {',
        '    position: fixed;',
        '    z-index: 999;',
        '    max-width: 340px;',
        '    padding: 13px 14px 11px;',
        '    border-radius: 12px;',
        '    background: rgba(16, 24, 34, 0.92);',
        '    backdrop-filter: blur(16px) saturate(140%);',
        '    -webkit-backdrop-filter: blur(16px) saturate(140%);',
        '    border: 1px solid rgba(190, 140, 255, 0.3);',
        '    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);',
        '    color: #e8edf4;',
        '    font-size: 12.5px;',
        '    line-height: 1.55;',
        '    opacity: 0;',
        '    visibility: hidden;',
        '    pointer-events: none;',
        '    transition: opacity 0.15s ease;',
        '}',
        '.os-tip.show { opacity: 1; visibility: visible; pointer-events: auto; }',
        '.os-head { font-weight: 700; color: #d8b4fe; letter-spacing: 0.5px; margin-bottom: 7px; }',
        '.os-row { display: flex; gap: 8px; margin-bottom: 2px; }',
        '.os-row span { color: #8b98a9; min-width: 44px; }',
        '.os-row b { color: #fff; font-weight: 600; }',
        '.os-label {',
        '    margin: 8px 0 5px;',
        '    padding-top: 8px;',
        '    border-top: 1px solid rgba(255, 255, 255, 0.08);',
        '    color: #8b98a9;',
        '    font-size: 11.5px;',
        '    letter-spacing: 0.5px;',
        '}',
        '.os-quote {',
        '    margin: 0 0 8px;',
        '    padding: 7px 10px;',
        '    border-left: 3px solid rgba(138, 43, 226, 0.55);',
        '    background: rgba(138, 43, 226, 0.10);',
        '    border-radius: 0 8px 8px 0;',
        '    white-space: pre-line;',
        '}',
        '.os-src {',
        '    display: flex;',
        '    align-items: center;',
        '    gap: 6px;',
        '    padding-top: 8px;',
        '    border-top: 1px solid rgba(255, 255, 255, 0.08);',
        '    color: #9ecbff;',
        '    font-size: 12px;',
        '    text-decoration: none;',
        '}',
        '.os-src:hover { color: #c3e0ff; text-decoration: underline; }',
        '.os-src svg { width: 13px; height: 13px; fill: currentColor; flex: none; }'
    ].join('\n');

    var ONE_SHOT_REPO = 'riba2534/claude-opus-5-5-demo';
    var GH_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68.09-1.36.09-2 .27-1.55-1.04-2.22-.82-2.22-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>';

    // 提示词原文（一字未改，\n 保留上游 README 的换行结构）
    var ONE_SHOT = {
        'pelican-bike': { prompt: '生成一个鹈鹕骑自行车的 3D 页面，尽可能把你所有的能力全部都用上. 然后上传到 CDN 上, 把访问链接给我' },
        'cf-transport-ship': { prompt: '尽可能真实的还原穿越火线中的运输船地图，我需要一个真实的枪战游戏，生成一个3d页面，尽可能发挥你的所有能力\n做完之后上传到 CDN 上 把链接发给我' },
        'qq-speed': { prompt: '尽可能真实地还原 QQ 飞车中的游戏地图。我需要一个真实的 QQ 飞车游戏，包括游戏的各种键位以及漂移玩法,生成一个3D 页面，尽可能发挥你的所有能力。\n做完之后上传到 CDN 上 把链接发给我' }
    };

    function init() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('#games-container .game-card'));
        if (!cards.length) return;

        var osTip = document.createElement('div');
        osTip.className = 'os-tip';
        osTip.setAttribute('role', 'tooltip');
        document.body.appendChild(osTip);
        var osCurBadge = null, osShowTimer = null, osHideTimer = null;
        var osSlugOf = function (c) { return (c.dataset.href || '').replace(/^\/?Games\//, '').replace(/\/+$/, ''); };

        function osRender(card) {
            var cfg = ONE_SHOT[osSlugOf(card)];
            if (!cfg) return;
            osTip.innerHTML =
                '<div class="os-head">⚡ ONE-SHOT · 一句话完整生成</div>' +
                '<div class="os-row"><span>agent</span><b>Claude Code CLI</b></div>' +
                '<div class="os-row"><span>model</span><b>Claude Opus 5.5</b></div>' +
                '<div class="os-label">提示词原文 · 一字未改</div>' +
                '<blockquote class="os-quote"></blockquote>' +
                '<a class="os-src" href="https://github.com/' + ONE_SHOT_REPO + '" target="_blank" rel="noopener noreferrer">' + GH_ICON + '源: ' + ONE_SHOT_REPO + '</a>';
            osTip.querySelector('.os-quote').textContent = cfg.prompt;
        }

        function osPlace(badge) {
            var r = badge.getBoundingClientRect();
            var w = Math.min(340, window.innerWidth - 24);
            var left = Math.min(Math.max(r.left, 12), window.innerWidth - 12 - w);
            osTip.style.width = w + 'px';
            osTip.style.left = left + 'px';
            osTip.classList.add('show');                 // 先可见才能量高度
            var top = r.bottom + 8;
            if (top + osTip.offsetHeight > window.innerHeight - 12) top = r.top - osTip.offsetHeight - 8;
            osTip.style.top = Math.max(top, 12) + 'px';
        }

        function osHideNow() {
            clearTimeout(osShowTimer);
            clearTimeout(osHideTimer);
            osTip.classList.remove('show');
            if (osCurBadge) osCurBadge.setAttribute('aria-expanded', 'false');
            osCurBadge = null;
        }
        var osHideSoon = function () { clearTimeout(osShowTimer); clearTimeout(osHideTimer); osHideTimer = setTimeout(osHideNow, 90); };
        var osShow = function (badge, card) {
            if (osCurBadge === badge) return;
            clearTimeout(osHideTimer);
            clearTimeout(osShowTimer);
            osShowTimer = setTimeout(function () {
                osRender(card);
                if (!osTip.querySelector('.os-quote')) return; // 配置缺失保护
                osCurBadge = badge;
                badge.setAttribute('aria-expanded', 'true');
                osPlace(badge);
            }, 150);
        };

        Object.keys(ONE_SHOT).forEach(function (slug) {
            var card = null;
            for (var i = 0; i < cards.length; i++) {
                if (osSlugOf(cards[i]) === slug) { card = cards[i]; break; }
            }
            if (!card) return;
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'os-badge';
            b.textContent = '⚡ one-shot';
            b.setAttribute('aria-haspopup', 'dialog');
            b.setAttribute('aria-expanded', 'false');
            b.setAttribute('aria-label', 'one-shot 实测：agent Claude Code CLI，model Claude Opus 5.5，一句提示词完整生成');
            b.addEventListener('mouseenter', function () { osShow(b, card); });
            b.addEventListener('mouseleave', osHideSoon);
            b.addEventListener('focus', function () { osShow(b, card); });
            b.addEventListener('blur', osHideSoon);
            b.addEventListener('click', function (e) {
                e.stopPropagation();                      // 防触发卡片跳转（触屏主路径）
                if (osCurBadge === b && osTip.classList.contains('show')) { osHideNow(); return; }
                clearTimeout(osShowTimer);
                clearTimeout(osHideTimer);
                osRender(card);
                if (!osTip.querySelector('.os-quote')) return;
                osCurBadge = b;
                b.setAttribute('aria-expanded', 'true');
                osPlace(b);
            });
            card.appendChild(b);
        });

        osTip.addEventListener('mouseenter', function () { clearTimeout(osHideTimer); });  // 移入面板可点源仓库链接
        osTip.addEventListener('mouseleave', osHideSoon);
        document.addEventListener('click', function (e) { if (osCurBadge && !osTip.contains(e.target)) osHideNow(); });
        window.addEventListener('scroll', osHideNow, true);
        window.addEventListener('resize', osHideNow);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') osHideNow(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
