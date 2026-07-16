# 代码模式参考

从 60s-web 中提炼的 React + TypeScript 代码模式，适用于信息聚合类项目。

## 目录

- [自定义 Hook 模式](#自定义-hook-模式)
- [状态持久化模式](#状态持久化模式)
- [配置导入导出模式](#配置导入导出模式)
- [搜索过滤模式](#搜索过滤模式)
- [数据适配器模式](#数据适配器模式)
- [导航系统模式](#导航系统模式)
- [错误处理模式](#错误处理模式)
- [性能优化模式](#性能优化模式)

---

## 自定义 Hook 模式

### useApi：请求 + 缓存 + 去重 + 自动刷新

核心特性：
- 请求去重：相同 URL 的并发请求只发一次
- localStorage 缓存：10 分钟 TTL
- 页面可见性检测：不可见时暂停自动刷新
- 离线检测：断网时跳过请求
- 手动刷新：返回 `reload` 方法

```typescript
const inFlightRequests = new Map<string, Promise<RequestResult<unknown>>>();

function requestWithDedupe<T>(cacheKey, base, path, params) {
  const pending = inFlightRequests.get(cacheKey);
  if (pending) return pending as Promise<RequestResult<T>>;

  const request = fetchApi<T>(base, path, params)
    .then((payload) => {
      const data = unwrap(payload);
      const updatedAt = Date.now();
      writeCache(cacheKey, data, updatedAt);
      return { data, updatedAt };
    })
    .finally(() => inFlightRequests.delete(cacheKey));

  inFlightRequests.set(cacheKey, request as Promise<RequestResult<unknown>>);
  return request;
}
```

### usePersistedState（推荐新增）

原项目用大量 `useState` + `useEffect` 做持久化，可以简化为自定义 Hook：

```typescript
function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (raw: string) => T;
  },
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options || {};

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? deserialize(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(state));
    } catch { /* 存储满时静默失败 */ }
  }, [key, state, serialize]);

  return [state, setState];
}

// 使用
const [city, setCity] = usePersistedState("60s-web:city", "上海");
const [settings, setSettings] = usePersistedState("60s-web:settings", DEFAULT_SETTINGS);
```

---

## 状态持久化模式

### 统一前缀

所有 localStorage key 使用统一前缀，避免冲突，便于清理：

```typescript
export const STORAGE_KEYS = {
  apiBase: "60s-web:api-base",
  city: "60s-web:city",
  settings: "60s-web:settings",
  avatar: "60s-web:avatar",
  // ...
} as const;
```

### 批量清理

```typescript
export function clearStoredPrefix(prefix: string) {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(prefix)) localStorage.removeItem(key);
  }
}

// 恢复默认设置
clearStoredPrefix("60s-web:");
```

### 缓存过期

```typescript
const CACHE_TTL = 10 * 60 * 1000;  // 10 分钟

export function readCache<T>(key: string): { data: T; updatedAt: number } | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (Date.now() - parsed.updatedAt > CACHE_TTL) {
    localStorage.removeItem(key);  // 过期自动清理
    return null;
  }
  return parsed;
}
```

---

## 配置导入导出模式

### 版本化导出

```typescript
const CONFIG_EXPORT_VERSION = 1;

type ExportedSettings = {
  apiBase: string;
  city: string;
  searchProvider: SearchProviderId;
  // ...
};

const exportConfig = () => {
  const payload = {
    app: "60s-web",
    version: CONFIG_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: { /* ... */ },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `60s-web-config-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
```

### 严格导入校验

```typescript
function parseImportedConfig(raw: string): ExportedSettings {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { throw new Error("配置文件不是有效 JSON"); }

  if (!isRecord(parsed) || parsed.app !== "60s-web")
    throw new Error("这不是 60s-web 的配置文件");
  if (parsed.version !== CONFIG_EXPORT_VERSION)
    throw new Error("配置文件版本不兼容");

  // 类型安全的字段读取
  const config = parsed.settings;
  return {
    apiBase: readString(config.apiBase, ""),
    city: readString(config.city, "上海"),
    searchProvider: readEnum(config.searchProvider, ["site","bing","google"], "site"),
    // ...
  };
}

// 工具函数
function readString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}
function readBoolean(value: unknown, fallback: boolean, label: string) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new Error(`${label} 配置格式无效`);
  return value;
}
function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T, label: string) {
  if (value === undefined) return fallback;
  if (typeof value === "string" && allowed.includes(value as T)) return value as T;
  throw new Error(`${label} 配置值无效`);
}
```

### 收藏归一化

```typescript
function normalizeEndpointFavorites(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const knownIds = new Set(endpoints.map(e => e.id));
  const assigned = new Set<string>();
  const favorites: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !knownIds.has(item) || assigned.has(item)) continue;
    assigned.add(item);
    favorites.push(item);
  }
  return favorites;  // 去重 + 只保留已知 ID
}
```

---

## 搜索过滤模式

### 多维度搜索

```typescript
const searchMatches = useMemo(() => {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return [];
  return endpoints
    .filter((endpoint) =>
      [endpoint.name, endpoint.path, endpoint.description, categoryLabels[endpoint.category]]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    )
    .slice(0, 8);  // 限制结果数量
}, [query]);
```

### 分类 + 搜索联合过滤

```typescript
function filterTools() {
  toolCards.forEach(card => {
    const category = card.dataset.category;
    const name = card.dataset.name.toLowerCase();
    const desc = card.dataset.desc.toLowerCase();
    const categoryMatch = currentCategory === "all" || category === currentCategory;
    const searchMatch = !currentSearch || name.includes(currentSearch) || desc.includes(currentSearch);
    card.style.display = categoryMatch && searchMatch ? "flex" : "none";
  });
}
```

---

## 数据适配器模式

外部 API 返回的数据结构千奇百怪，用适配器统一处理：

```typescript
// 从多种可能的字段中提取数组
export function toItems(value: unknown): HotItem[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as HotItem[];
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["list", "items", "data", "news", "rank", "movies", "subjects"]) {
      if (Array.isArray(obj[key])) return obj[key] as HotItem[];
    }
  }
  return [];
}

// 热度值格式化（中文万/亿）
export function formatHotValue(value: unknown) {
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num) || num <= 0) return "";
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  return String(Math.round(num));
}

// 汇率数据适配（多种格式）
export function readCurrencyRate(data: ExchangeRate | undefined, code: string) {
  if (!data?.rates) return undefined;
  if (Array.isArray(data.rates)) {
    const match = data.rates.find(item => item.currency === code || item.code === code);
    return Number(match?.rate ?? match?.value) || undefined;
  }
  return data.rates[code];  // Record 格式
}
```

---

## 导航系统模式

### 配置驱动导航

```typescript
export const nav = [
  { id: "home" as const, label: "首页", icon: Home },
  { id: "hot" as const, label: "热榜", icon: BarChart3 },
  { id: "news" as const, label: "新闻", icon: Newspaper },
  { id: "weather" as const, label: "天气", icon: CloudSun },
  { id: "tools" as const, label: "工具", icon: LayoutGrid },
  { id: "settings" as const, label: "设置", icon: Settings },
];

// 渲染
<nav>
  {nav.map(item => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        className={activePage === item.id ? "active" : ""}
        onClick={() => setActivePage(item.id)}
      >
        <Icon size={19} />
        <span className="nav-label">{item.label}</span>
      </button>
    );
  })}
</nav>
```

### 快捷动作（判别联合类型）

```typescript
type QuickActionTarget =
  | { page: "news" | "weather" | "settings" }
  | { page: "hot"; hotTabId: string }
  | { page: "tools"; toolId?: ToolId };

const runQuickAction = (action: QuickActionDefinition) => {
  const { target } = action;
  if (target.page === "hot") {
    const tab = hotTabs.find(t => t.id === target.hotTabId);
    if (tab) setHotTab(tab);
    setActivePage("hot");
    return;
  }
  if (target.page === "tools") {
    if (target.toolId) setActiveTool(target.toolId);
    setActivePage("tools");
    return;
  }
  setActivePage(target.page);
};
```

---

## 错误处理模式

### 优雅降级

```typescript
// Service Worker 注册失败不影响应用
navigator.serviceWorker.register("/sw.js")
  .then(handleSuccess)
  .catch(() => { /* PWA enhancement only */ });

// localStorage 不可用时返回默认值
function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

// API 请求失败显示错误状态
try {
  const data = await fetchApi(base, path, params);
  setState({ data, loading: false });
} catch (error) {
  setState(current => ({
    ...current,
    loading: false,
    error: error instanceof Error ? error.message : "请求失败",
  }));
}
```

### 输入规范化

```typescript
export function normalizeApiBaseInput(base: string) {
  let cleanBase = base.trim();
  if (!cleanBase) throw new Error("请输入 API 地址");

  // 自动补协议
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(cleanBase)) {
    cleanBase = `https://${cleanBase}`;
  }

  const normalized = normalizeApiBase(cleanBase);
  const url = new URL(normalized);

  // 自动补 /v2 路径
  return url.pathname === "/" ? `${normalized}/v2` : normalized;
}
```

---

## 性能优化模式

### useMemo 稳定化参数

```typescript
// 把对象参数序列化为字符串，避免引用变化触发重渲染
const paramsKey = JSON.stringify(params);
const stableParams = useMemo(
  () => JSON.parse(paramsKey) as Record<string, string | undefined>,
  [paramsKey],
);
```

### 请求去重

```typescript
const inFlightRequests = new Map<string, Promise<RequestResult<unknown>>>();

function requestWithDedupe<T>(cacheKey, ...) {
  const pending = inFlightRequests.get(cacheKey);
  if (pending) return pending;  // 复用正在进行的请求
  // ...
}
```

### 页面可见性检测

```typescript
useEffect(() => {
  if (!autoRefresh) return;
  const timer = setInterval(() => {
    // 页面不可见或离线时跳过
    if (document.visibilityState !== "visible" || !navigator.onLine) return;
    load(true);
  }, CACHE_TTL);
  return () => clearInterval(timer);
}, [autoRefresh, load]);
```

### 滚动优化（底部导航自动隐藏）

```typescript
useEffect(() => {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const delta = window.scrollY - lastScrollY;
      if (window.scrollY < 80) setBottomNavHidden(false);
      else if (delta > 12) setBottomNavHidden(true);
      else if (delta < -12) setBottomNavHidden(false);
      lastScrollY = window.scrollY;
      ticking = false;
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

### 事件清理

```typescript
// 头像弹窗：点击外部关闭
useEffect(() => {
  if (!avatarOpen) return;
  const onPointerDown = (e: PointerEvent) => {
    if (e.target instanceof Node && !wrapRef.current?.contains(e.target)) {
      setOpen(false);
    }
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKeyDown);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("keydown", onKeyDown);
  };
}, [avatarOpen]);
```
