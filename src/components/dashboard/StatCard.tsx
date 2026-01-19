/**
 * StatCard - Clean minimal
 */

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const StatCard = ({ title, value, icon, description, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/5',
    success: 'bg-chart-2/5',
    warning: 'bg-chart-4/5'
  };

  return (
    <div className={`p-4 rounded-xl border border-border ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
};

export default StatCard;