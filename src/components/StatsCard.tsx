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
    <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        {color && (
          <div
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
