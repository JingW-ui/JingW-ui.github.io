import { Loader2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function CardTitle({
  icon,
  title,
  right,
}: {
  icon: ReactNode;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="card-title">
      <span>
        {icon}
        <b>{title}</b>
      </span>
      {right}
    </div>
  );
}

export function EmptyState({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="empty-state" role="status">
      <Sparkles size={20} />
      <b>{title}</b>
      <small>{desc}</small>
    </div>
  );
}

export function StatusBadge({
  loading,
}: {
  loading: boolean;
}) {
  if (loading)
    return (
      <span className="stat-chip">
        <Loader2 size={12} className="spin" /> 加载中
      </span>
    );
  return <span className="stat-chip">就绪</span>;
}
