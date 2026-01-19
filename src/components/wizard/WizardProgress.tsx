/**
 * Wizard Progress - Minimal pills style (kept for reference, not used in new design)
 */

import { Check } from 'lucide-react';

interface WizardStep {
  id: number;
  label: string;
  completed: boolean;
  current: boolean;
}

interface WizardProgressProps {
  steps: WizardStep[];
  onStepClick?: (stepId: number) => void;
}

const WizardProgress = ({ steps, onStepClick }: WizardProgressProps) => {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step) => (
        <button
          key={step.id}
          onClick={() => step.completed && onStepClick?.(step.id)}
          disabled={!step.completed && !step.current}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors
            ${step.current 
              ? 'bg-primary text-primary-foreground font-medium' 
              : step.completed 
                ? 'bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 cursor-pointer' 
                : 'text-muted-foreground'
            }
          `}
        >
          {step.completed && <Check className="h-3 w-3" />}
          <span>{step.label}</span>
        </button>
      ))}
    </div>
  );
};

export default WizardProgress;