"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  subtext?: string;
  trend?: string;
  color: string; 
};

export const StatCard: React.FC<Props> = ({ icon: Icon, value, label, subtext, trend, color }) => (
  <div className="group relative bg-card rounded-xl p-4 sm:p-6 border border-border hover:border-muted-foreground/30 transition-all duration-300 hover:shadow-lg min-w-0 overflow-hidden">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className={`p-2 sm:p-3 rounded-lg ${color} bg-opacity-10 shrink-0`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-white`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium shrink-0">
          <TrendingUp className="w-4 h-4" />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div className="space-y-1 min-w-0">
      <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight break-words">{value}</div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      {subtext && <div className="text-xs text-muted-foreground break-words">{subtext}</div>}
    </div>
  </div>
);
