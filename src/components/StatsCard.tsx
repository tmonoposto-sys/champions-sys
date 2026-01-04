import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
}

export const StatsCard = ({ title, value, subtitle, icon, color }: Props) => {
  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 md:p-5 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="flex items-end gap-1.5 sm:gap-2">
        {color && (
          <div
            className="w-0.5 sm:w-1 h-6 sm:h-7 md:h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">{value}</p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};