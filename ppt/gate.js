/*
 * /ppt/ 访问口令门 —— 纯前端遮挡层
 *
 * ⚠️ 这不是安全机制。它挡的是「搜索引擎收录」和「随手点进来的人」。
 *    挡不住：查看源码、直接 curl 资源路径、离线爆破口令哈希。
 *    内容若升级为公司机密，必须改为服务端/边缘鉴权（如 Cloudflare Access）。
 *
 * 换口令：修改下面 PASS_HASH 一行即可。生成方法（浏览器控制台）：
 *   crypto.subtle.digest('SHA-256', new TextEncoder().encode('新口令'))
 *     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
 */
(function () {
  'use strict';

  // 当前口令的 SHA-256（明文不出现在源码里）
  // ⚠️ 当前口令强度极低，等于没有保护。要真正设防请在此更换并重新生成哈希。
  var PASS_HASH = '615ed7fb1504b0c724a296d7a69e6c7b2f9ea2c57c1d8206c5afdf392ebdfd25';

  var GUARD_ID = 'ppt-gate-guard';
  var SESSION_KEY = 'ppt_ok';

  // 会话内已验证过就直接放行：
  // 注意必须「解锁」而不是简单 return —— ppt-locked 是写在 <html> 上的，
  // 直接 return 会让页面永久隐藏且没有输入框可交互。
  var alreadyOk = false;
  try {
    alreadyOk = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (e) { /* 隐私模式等场景下 sessionStorage 可能不可用，继续走验证 */ }

  if (alreadyOk) {
    document.documentElement.classList.remove('ppt-locked');
    document.dispatchEvent(new CustomEvent('ppt:unlocked'));
    return;
  }

  // ---- 默认遮挡：内容先藏起来 ----
  // 关键：锁定的类必须由「页面自己的 <style>」先加上（见 index.html 里的
  // html.ppt-locked body { visibility: hidden }），本脚本只负责解锁。
  // 这样即使本脚本被拦掉/禁用 JS，内容依然是隐藏的 —— 失败方向是安全的。
  // 这里只补遮罩层的样式，不承担「藏内容」的职责。
  var style = document.createElement('style');
  style.textContent = [
    'html.ppt-locked body { visibility: hidden !important; }',
    'html.ppt-locked #' + GUARD_ID + ', html.ppt-locked #' + GUARD_ID + ' * { visibility: visible !important; }',
    '#' + GUARD_ID + ' {',
    '  position: fixed; inset: 0; z-index: 99999;',
    '  display: flex; align-items: center; justify-content: center;',
    '  background: linear-gradient(135deg, #e7f1f0 0%, #dfe9ec 50%, #e6edf2 100%);',
    '  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;',
    '  opacity: 1; transition: opacity .35s ease;',
    '}',
    '#' + GUARD_ID + '.hide { opacity: 0; pointer-events: none; }',
    '#' + GUARD_ID + ' .g-box {',
    '  background: rgba(255,255,255,.62); backdrop-filter: blur(24px) saturate(150%);',
    '  -webkit-backdrop-filter: blur(24px) saturate(150%);',
    '  border: 1px solid rgba(255,255,255,.75); border-radius: 24px;',
    '  box-shadow: 0 12px 40px rgba(20,40,50,.12);',
    '  padding: 40px 44px; width: min(380px, calc(100vw - 40px)); text-align: center;',
    '}',
    '#' + GUARD_ID + ' .g-icon { font-size: 30px; margin-bottom: 12px; }',
    '#' + GUARD_ID + ' h2 { font-size: 1.05rem; color: #2c3e50; font-weight: 650; margin-bottom: 6px; }',
    '#' + GUARD_ID + ' p { font-size: .76rem; color: #8e9aaf; margin-bottom: 22px; line-height: 1.6; }',
    '#' + GUARD_ID + ' input {',
    '  width: 100%; padding: 11px 16px; border: 1px solid rgba(255,255,255,.85);',
    '  border-radius: 14px; background: rgba(255,255,255,.75); color: #2c3e50;',
    '  font-size: .88rem; text-align: center; letter-spacing: .18em; outline: none;',
    '  transition: border-color .25s, box-shadow .25s; font-family: inherit;',
    '}',
    '#' + GUARD_ID + ' input:focus { border-color: #2dd4bf; box-shadow: 0 0 0 3px rgba(45,212,191,.18); }',
    '#' + GUARD_ID + ' button {',
    '  width: 100%; margin-top: 12px; padding: 11px; border: none; border-radius: 14px;',
    '  background: linear-gradient(120deg, #2dd4bf, #3b82f6); color: #fff;',
    '  font-size: .86rem; font-weight: 600; cursor: pointer; font-family: inherit;',
    '  transition: filter .25s, transform .25s;',
    '}',
    '#' + GUARD_ID + ' button:hover { filter: brightness(1.06); transform: translateY(-1px); }',
    '#' + GUARD_ID + ' .g-err { color: #e36d6e; font-size: .74rem; margin-top: 12px; min-height: 1em; }',
    '@media (max-width: 480px) { #' + GUARD_ID + ' .g-box { padding: 30px 24px; } }'
  ].join('\n');
  document.head.appendChild(style);

  function sha256Hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function unlock(guard) {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* 忽略 */ }
    guard.classList.add('hide');
    document.documentElement.classList.remove('ppt-locked');
    setTimeout(function () { guard.remove(); }, 400);
    // 解锁后再启动页面自身的入场动画逻辑
    document.dispatchEvent(new CustomEvent('ppt:unlocked'));
  }

  function build() {
    var guard = document.createElement('div');
    guard.id = GUARD_ID;
    guard.innerHTML =
      '<div class="g-box">' +
        '<div class="g-icon">🔒</div>' +
        '<h2>演示文稿</h2>' +
        '<p>请输入访问口令</p>' +
        '<input type="password" id="g-input" autocomplete="off" inputmode="numeric" aria-label="访问口令">' +
        '<button id="g-btn" type="button">进入</button>' +
        '<div class="g-err" id="g-err"></div>' +
      '</div>';
    document.body.appendChild(guard);

    var input = guard.querySelector('#g-input');
    var btn = guard.querySelector('#g-btn');
    var err = guard.querySelector('#g-err');

    function attempt() {
      var val = input.value;
      if (!val) { err.textContent = '请输入口令'; return; }
      sha256Hex(val).then(function (hex) {
        if (hex === PASS_HASH) {
          unlock(guard);
        } else {
          err.textContent = '口令不正确';
          input.value = '';
          input.focus();
        }
      }).catch(function () {
        err.textContent = '当前环境不支持校验，请使用现代浏览器';
      });
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attempt();
    });
    input.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
