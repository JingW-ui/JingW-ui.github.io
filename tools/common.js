/*
 * tools/common.js — 编号工具共享工具函数层（经典脚本，无构建）
 * 通过 <script src="../common.js"> 在页面内联脚本之前加载。
 * 暴露全局：configureToast / showToast / copyText / escapeHtml / downloadBlob
 *
 * showToast 默认复刻 Family A（右下角 #1f2328, 1800ms, 复用 #_toast 元素）。
 * 需要其他视觉家族时，在 common.js 标签后调用 configureToast({...}) 一次，
 * 现有 showToast(msg) 调用点零改动。支持 Family C（每次新建后移除，底部居中）。
 */
(function (global) {
  'use strict';
  var _toastCfg = {
    reuse: true, duration: 1800, remove: false, removeDelay: 300,
    styles: { position: 'fixed', bottom: '24px', right: '24px', background: '#1f2328',
      color: '#fff', padding: '8px 18px', borderRadius: '6px', fontSize: '13px',
      zIndex: '9999', transition: 'opacity .3s' }
  };
  function styleText(s) { var r = ''; for (var k in s) r += k + ':' + s[k] + ';'; return r; }
  function configureToast(opts) {
    if (!opts) return;
    if (opts.styles) Object.assign(_toastCfg.styles, opts.styles);
    ['reuse', 'duration', 'remove', 'removeDelay'].forEach(function (k) {
      if (opts[k] !== undefined) _toastCfg[k] = opts[k];
    });
  }
  function showToast(msg, opts) {
    var cfg = { reuse: _toastCfg.reuse, duration: _toastCfg.duration,
      remove: _toastCfg.remove, removeDelay: _toastCfg.removeDelay, styles: _toastCfg.styles };
    if (opts) {
      if (opts.styles) cfg.styles = Object.assign({}, cfg.styles, opts.styles);
      ['reuse', 'duration', 'remove', 'removeDelay'].forEach(function (k) {
        if (opts[k] !== undefined) cfg[k] = opts[k];
      });
    }
    var t;
    if (cfg.reuse) {
      t = document.getElementById('_toast');
      if (!t) {
        t = document.createElement('div'); t.id = '_toast';
        t.style.cssText = styleText(cfg.styles);
        document.body.appendChild(t);
      }
      t.textContent = msg; t.style.opacity = '1';
      clearTimeout(t._to);
      t._to = setTimeout(function () { t.style.opacity = '0'; }, cfg.duration);
    } else {
      t = document.createElement('div');
      Object.assign(t.style, cfg.styles);
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(function () {
        t.style.opacity = '0';
        setTimeout(function () { t.remove(); }, cfg.removeDelay);
      }, cfg.duration);
    }
  }
  function copyText(text, msg) {
    function done() { showToast(msg !== undefined ? msg : '已复制'); }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
  }
  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = (s === null || s === undefined) ? '' : String(s);
    return d.innerHTML;
  }
  function downloadBlob(content, filename, mime) {
    mime = mime || 'text/plain;charset=utf-8';
    var blob = (content instanceof Blob) ? content : new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  global.configureToast = configureToast; global.showToast = showToast;
  global.copyText = copyText; global.escapeHtml = escapeHtml; global.downloadBlob = downloadBlob;
})(window);
