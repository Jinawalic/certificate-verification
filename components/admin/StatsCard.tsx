"use client";

import React, { ComponentType } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatsCardTrend {
  /** Percentage or value difference, e.g. "+12.4%" */
  value: string;
  /** True for upward/positive, false for downward, undefined for neutral */
  isPositive?: boolean;
  /** Context label, e.g. "vs last month" */
  label?: string;
}

export interface StatsCardProps {
  /** Metric heading */
  title: string;
  /** Primary metric value */
  value: string | number;
  /** Lucide or React Icon component */
  icon: ComponentType<{ className?: string }>;
  /** Optional trend indicator */
  trend?: StatsCardTrend;
  /** Optional secondary caption / description */
  description?: string;
  /** Additional container CSS classes */
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-emerald-800/30 group ${className}`}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-800/15 group-hover:bg-emerald-800 group-hover:text-white transition-colors shrink-0">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-0">
        <p className="text-2xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
};
