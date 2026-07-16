---
name: react-dashboard-toolkit
description: 基于 60s-web 项目提炼的 React + TypeScript 信息聚合仪表盘开发最佳实践。涵盖项目结构、类型设计、状态管理、API 封装、CSS 设计系统、PWA 支持等。当用户要开发信息聚合类前端项目、Dashboard 仪表盘、多数据源展示页面、PWA 应用、或想要参考 60s-web 的架构风格时，使用此技能。即使用户没有明确说"参考 60s-web"，只要涉及信息流看板、热榜聚合、天气面板、数据卡片布局、或需要精致 UI 的 React SPA，都应该使用此技能。
---

# React Dashboard Toolkit

从 60s-web 项目中提炼的前端开发最佳实践，用于快速构建高质量的信息聚合类 React 应用。

## 核心理念

这个项目的设计哲学是：**纯前端、零后端、数据源可配置、用户体验优先**。

- 不内置任何 API 地址，用户自行配置数据源
- 所有用户偏好存储在 localStorage，刷新不丢失
- 精致的 UI 动效，但不牺牲性能
- TypeScript 严格模式，类型安全贯穿始终

---

## 1. 项目结构

采用「按职责分层」的组织方式，而非「按功能模块」：

```
src/
├── main.tsx              # 入口：createRoot + StrictMode
├── App.tsx               # 根组件：状态提升 + 页面路由
├── types.ts              # 全局类型定义
├── config.ts             # 常量配置（导航、主题、存储键名等）
├── api.ts                # API 类型 + 端点定义 + 请求工具
├── storage.ts            # localStorage 封装
├── utils.ts              # 纯函数工具（格式化、转换等）
├── cards.ts              # 首页卡片布局逻辑（可拖拽排序）
├── pwa.ts                # Service Worker 注册
├── styles.css            # 全局 CSS（设计系统 + 组件样式）
├── hooks/
│   └── useApi.ts         # 自定义 Hook：API 请求 + 缓存 + 去重
└── components/
    ├── Header.tsx        # 顶部导航 + 头像 + 主题切换
    ├── HomePage.tsx      # 首页双栏布局
    ├── Hot.tsx           # 热榜页面
    ├── News.tsx          # 新闻页面
    ├── Weather.tsx       # 天气页面
    ├── ToolWorkspace.tsx # 工具页面
    ├── SettingsPanel.tsx # 设置面板
    ├── HomeCards.tsx     # 首页卡片组件集合
    ├── MobileBottomNav.tsx # 移动端底部导航
    ├── PwaStatusBar.tsx  # PWA 状态提示
    ├── EndpointLab.tsx   # API 接口实验室
    └── ui.tsx            # 通用 UI 组件（CardTitle、Status、Footer 等）
```

**关键原则：**
- 类型定义集中管理（`types.ts` + `api.ts`）
- 配置项用常量对象（`config.ts`）
- localStorage 操作封装为纯函数（`storage.ts`）
- 自定义 Hook 封装复杂逻辑（`hooks/useApi.ts`）

---

## 2. TypeScript 类型设计

### 2.1 API 状态泛型

```typescript
// types.ts
export type ApiState<T> = {
  data?: T;
  loading: boolean;
  error?: string;
  updatedAt?: Date;
};
```

这个泛型是核心，所有 API 数据都用它包装，UI 组件根据 `loading`/`error`/`data` 三态渲染。

### 2.2 判别联合类型（Discriminated Unions）

用于导航目标、动作类型等需要区分的场景：

```typescript
export type QuickActionDefinition = {
  id: QuickFavoriteId;
  label: string;
  target:
    | { page: "news" | "weather" | "settings" }
    | { page: "hot"; hotTabId: string }
    | { page: "tools"; toolId?: ToolId };
};
```

这样在 `runQuickAction` 中可以通过 `target.page` 做类型 narrowing。

### 2.3 字面量联合类型

```typescript
export type PageId = "home" | "hot" | "news" | "weather" | "tools" | "settings";
export type WallpaperMode = "default" | "mint" | "paper" | "dawn" | "custom";
export type ChromeTheme = "classic" | "floating" | "minimal";
export type ColorTheme = "light" | "dark";
```

避免使用 `string`，用联合类型约束取值范围。

### 2.4 灵活的 API 响应类型

外部 API 返回的数据结构往往不一致，用可选字段 + 索引签名处理：

```typescript
export type ExchangeRate = {
  base?: string;
  rates?:
    | Record<string, number>
    | Array<{ currency?: string; rate?: number | string }>;
  [key: string]: unknown;  // 索引签名兜底
};
```

---

## 3. API 封装模式

### 3.1 数据驱动的端点定义

把所有 API 端点声明为配置数组，而非硬编码在组件里：

```typescript
// api.ts
export type EndpointDefinition = {
  id: string;
  name: string;
  category: ApiCategory;
  path: string;
  method: "GET" | "ANY";
  description: string;
  params?: EndpointParam[];
};

export const endpoints: EndpointDefinition[] = [
  {
    id: "60s",
    name: "每天 60 秒读懂世界",
    category: "periodic",
    path: "/60s",
    method: "GET",
    description: "每日精选新闻、微语、海报",
    params: [{ name: "date", label: "日期", placeholder: "YYYY-MM-DD" }],
  },
  // ... 更多端点
];
```

好处：端点列表可动态渲染为 UI，新增端点只需加一条配置。

### 3.2 URL 构建工具

```typescript
export function buildUrl(
  base: string,
  path: string,
  params: Record<string, string | undefined> = {},
) {
  const cleanBase = normalizeApiBase(base);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${cleanBase}${cleanPath}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
```

### 3.3 输入规范化 + 错误提示

```typescript
export function normalizeApiBase(base: string) {
  const cleanBase = base.trim().replace(/\/+$/, "");
  if (!cleanBase) throw new Error("请输入 API 地址");

  let url: URL;
  try {
    url = new URL(cleanBase);
  } catch {
    throw new Error("API 地址格式无效，请输入完整的 http(s) 地址");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("API 地址仅支持 http 或 https");
  }
  const path = url.pathname.replace(/\/+$/, "");
  return `${url.origin}${path === "/" ? "" : path}`;
}
```

用户输入千奇百怪，规范化函数要：去空格、去末尾斜杠、补协议、校验格式。

---

## 4. useApi Hook

这是项目的核心 Hook，封装了请求、缓存、去重、自动刷新：

```typescript
// hooks/useApi.ts
export function useApi<T>(
  base: string,
  path: string,
  params: Record<string, string | undefined>,
  enabled = true,
  autoRefresh = false,
) {
  const paramsKey = JSON.stringify(params);
  const stableParams = useMemo(
    () => JSON.parse(paramsKey) as Record<string, string | undefined>,
    [paramsKey],
  );
  const requestUrl = useMemo(
    () => tryBuildUrl(base, path, stableParams),
    [base, path, stableParams],
  );
  const cacheKey = useMemo(
    () => (requestUrl ? `60s-web:cache:${requestUrl}` : ""),
    [requestUrl],
  );

  // 初始状态：尝试读缓存
  const [state, setState] = useState<ApiState<T>>(() => {
    if (!enabled) return { loading: enabled };
    if (!requestUrl) return { loading: false, error: "API 地址无效" };
    const cached = readCache<T>(cacheKey);
    if (!cached) return { loading: true };
    return { data: cached.data, loading: false, updatedAt: new Date(cached.updatedAt) };
  });

  const load = useCallback(async (force = false) => {
    if (!enabled || !requestUrl) return;
    if (!force) {
      const cached = readCache<T>(cacheKey);
      if (cached) {
        setState({ data: cached.data, loading: false, updatedAt: new Date(cached.updatedAt) });
        return;
      }
    }
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const { data, updatedAt } = await requestWithDedupe<T>(cacheKey, base, path, stableParams);
      setState({ data, loading: false, updatedAt: new Date(updatedAt) });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "请求失败",
      }));
    }
  }, [base, cacheKey, enabled, path, requestUrl, stableParams]);

  useEffect(() => { void load(false); }, [enabled, load]);

  // 自动刷新（页面不可见时暂停）
  useEffect(() => {
    if (!enabled || !autoRefresh) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      void load(true);
    }, CACHE_TTL);
    return () => window.clearInterval(timer);
  }, [autoRefresh, enabled, load]);

  return { ...state, reload: useCallback(() => load(true), [load]) };
}
```

**核心特性：**
- 请求去重（`inFlightRequests` Map）
- localStorage 缓存（10 分钟 TTL）
- 页面不可见时暂停刷新
- 离线时跳过请求
- 返回 `reload` 方法供手动刷新

---

## 5. localStorage 封装

```typescript
// storage.ts
export function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readCache<T>(key: string): { data: T; updatedAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; updatedAt: number };
    if (!parsed?.updatedAt || Date.now() - parsed.updatedAt > CACHE_TTL) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
```

**要点：**
- 所有函数先检查 `typeof window === "undefined"`（SSR 兼容）
- JSON 解析包裹 try-catch
- 缓存读取自动过期清理
- 统一前缀 `60s-web:` 避免 key 冲突

---

## 6. 配置导出/导入

用户可能换设备、清缓存，提供配置导出/导入功能：

```typescript
const exportConfig = (): ConfigActionResult => {
  const payload = {
    app: "60s-web",
    version: CONFIG_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      apiBase, city, searchProvider, chromeTheme, colorTheme,
      mobileNavMode, wallpaper, avatar: DEFAULT_AVATAR_STATE,
      modules: settings, homeCardLayout, endpointFavorites, quickFavorites,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `60s-web-config-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return { ok: true, message: "配置已导出" };
};

const importConfig = (raw: string): ConfigActionResult => {
  try {
    const config = parseImportedConfig(raw);
    applyImportedSettings(config);
    return { ok: true, message: "配置已导入" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "导入失败" };
  }
};
```

导入时要严格校验：检查 app 名、版本号、字段类型、枚举值合法性。

---

## 7. CSS 设计系统

详细的 CSS 变量、组件样式、动效规范见 `references/ui-design-system.md`。

核心设计语言：

- **主色调**：薄荷绿 `#0f9b8e`（浅色）/ `#37d8c5`（深色）
- **表面材质**：半透明毛玻璃 `rgba(255,255,255,0.92)` + `backdrop-filter: blur(16px)`
- **卡片阴影**：柔和的多层阴影 `0 10px 30px rgba(31,41,55,0.08)`
- **圆角**：8px（卡片）、4px（按钮/输入框）
- **动效**：微交互为主，`transition: all 0.2s ease`
- **三套外壳主题**：经典（固定栏）、悬浮（浮层卡片）、极简（轻边界）

---

## 8. PWA 支持

```typescript
// pwa.ts
export function registerServiceWorker(onUpdate: ServiceWorkerUpdateHandler) {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return () => {};

  const register = () => {
    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        // 检测等待中的更新
        if (registration.waiting && hasActiveController()) {
          onUpdate(registration);
        }
        // 监听新安装
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed") onUpdate(registration);
          });
        });
      })
      .catch(() => { /* PWA 增强，失败不影响应用 */ });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register);
  // ... cleanup
}

export function isStandaloneDisplay() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as any).standalone);
}

export function shouldShowIosInstallHint() {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
  return isIos && isSafari && !isStandaloneDisplay();
}
```

---

## 9. 首页双栏可拖拽布局

首页采用左右双栏，卡片可拖拽排序、上下移动：

```typescript
// cards.ts
export type HomeCardColumn = "left" | "right";
export type HomeCardLayout = Record<HomeCardColumn, HomeCardId[]>;

export const defaultHomeCardLayout: HomeCardLayout = {
  left: ["daily", "hot"],
  right: ["weather", "market", "entertainmentTools", "quote"],
};

export function moveHomeCard(
  layout: HomeCardLayout,
  cardId: HomeCardId,
  targetColumn: HomeCardColumn,
  targetIndex: number,
): HomeCardLayout {
  const next = normalizeHomeCardLayout(layout);
  const sourceColumn = homeCardColumns.find((col) => next[col].includes(cardId));
  if (!sourceColumn) return next;
  const sourceIndex = next[sourceColumn].indexOf(cardId);
  next[sourceColumn].splice(sourceIndex, 1);
  const adjustedIndex = sourceColumn === targetColumn && sourceIndex < targetIndex
    ? targetIndex - 1 : targetIndex;
  next[targetColumn].splice(Math.max(0, Math.min(adjustedIndex, next[targetColumn].length)), 0, cardId);
  return normalizeHomeCardLayout(next);
}
```

拖拽实现：Pointer Events（移动端）+ Mouse Events（桌面端），通过 `document.elementFromPoint` 检测放置目标。

---

## 10. 实用工具函数

```typescript
// utils.ts
export function formatHotValue(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(number) || number <= 0) return "";
  if (number >= 100000000) return `${(number / 100000000).toFixed(1)}亿`;
  if (number >= 10000) return `${(number / 10000).toFixed(1)}万`;
  return String(Math.round(number));
}

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

export function getWallpaperStyle(wallpaper: WallpaperState, colorTheme: ColorTheme): CSSProperties {
  const dark = colorTheme === "dark";
  if (wallpaper.mode === "custom" && wallpaper.src) {
    return {
      backgroundImage: dark
        ? `linear-gradient(180deg, rgba(7,16,15,0.78), rgba(7,16,15,0.9)), url("${wallpaper.src}")`
        : `linear-gradient(180deg, rgba(246,248,248,0.84), rgba(246,248,248,0.9)), url("${wallpaper.src}")`,
      backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
    };
  }
  // ... 其他壁纸模式
}
```

**要点：**
- 工具函数都是纯函数，输入输出确定
- 用 `unknown` 接收外部数据，内部做类型守卫
- 中文格式化（万/亿）

---

## 快速启动新项目

当用户要创建类似项目时，按此顺序：

1. **初始化**：`npm create vite@latest my-app -- --template react-ts`
2. **搭建骨架**：按本文「项目结构」创建文件
3. **定义类型**：先在 `types.ts` 和 `api.ts` 中定义数据类型
4. **封装存储**：复制 `storage.ts` 模式
5. **实现 useApi**：复制 `hooks/useApi.ts`
6. **设计 UI**：参考 `references/ui-design-system.md` 的 CSS 变量和组件
7. **添加 PWA**：复制 `pwa.ts` + `sw.js` + `manifest.webmanifest`
8. **配置导出**：实现配置的序列化/反序列化

## 参考文件

- `references/ui-design-system.md` — 完整的 CSS 设计系统（变量、主题、组件样式、动效、响应式）
- `references/code-patterns.md` — 更多代码模式（错误边界、配置校验、搜索过滤等）
