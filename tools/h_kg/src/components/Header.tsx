import { Moon, Search, Sun } from "lucide-react";
import type { ColorTheme } from "../types";

export function Header({
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
}: {
  theme: ColorTheme;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="icon-wrap" aria-hidden="true">
          🫀
        </span>
        <span>心血管疾病知识图谱</span>
      </div>
      <div className="header-actions">
        <div className="header-search">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="搜索实体..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === "light" ? "切换暗色" : "切换亮色"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
