/* ============================================================
   练点啥呢？ - Service Worker
   策略:壳层与数据文件 stale-while-revalidate(缓存优先,后台更新)
   —— 二次访问秒开、弱网/离线可用。
   CDN 动图/缩略图不进缓存(体积大,爆配额),交给浏览器 HTTP
   缓存与多节点 fallback 处理。
   版本纪律:数据重新生成或壳层有变时,把 VERSION 递增一位,
   旧缓存会在 activate 阶段整体清除。
   ============================================================ */

const VERSION = 'v2';
const CACHE = 'exercise-db-' + VERSION;
const PRECACHE = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/config.js',
  './assets/js/app.js',
  './assets/data/exercises.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 非 GET(表单等)与跨域 CDN 媒体直接放行
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // 同源资源:stale-while-revalidate;存储不可用时(隐私模式等)直连网络,绝不拦截失败
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const fetchPromise = fetch(e.request).then(res => {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached); // 断网且有缓存时回退缓存
      return cached || fetchPromise;
    }).catch(() => fetch(e.request))
  );
});
