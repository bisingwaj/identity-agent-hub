/**
 * Carte de statistique pour le dashboard
 */

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-chart-2 text-primary-foreground',
    warning: 'bg-chart-4'
  };

  return (
    <Card className={`border-2 shadow-xs ${variantStyles[variant]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={`text-xs font-bold uppercase ${
              variant === 'primary' || variant === 'success' 
                ? 'text-primary-foreground/80' 
                : 'text-muted-foreground'
            }`}>
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className={`text-sm ${
                variant === 'primary' || variant === 'success'
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              }`}>
                {description}
              </p>
            )}
          </div>
          <div className={`p-2 border-2 ${
            variant === 'primary' || variant === 'success'
              ? 'border-primary-foreground/30 bg-primary-foreground/10'
              : 'border-border bg-secondary'
          }`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
