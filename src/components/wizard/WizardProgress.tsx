/**
 * Indicateur de progression du wizard
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
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          {/* Step Circle */}
          <button
            onClick={() => step.completed && onStepClick?.(step.id)}
            disabled={!step.completed}
            className={`
              flex items-center justify-center w-10 h-10 border-2 font-bold transition-all
              ${step.current 
                ? 'bg-primary text-primary-foreground border-primary shadow-xs' 
                : step.completed 
                  ? 'bg-chart-2 text-primary-foreground border-chart-2 cursor-pointer hover:shadow-xs' 
                  : 'bg-card text-muted-foreground border-border'
              }
            `}
          >
            {step.completed ? (
              <Check className="h-5 w-5" />
            ) : (
              step.id
            )}
          </button>

          {/* Step Label */}
          <span className={`
            ml-2 text-xs font-bold uppercase hidden sm:block
            ${step.current ? 'text-foreground' : 'text-muted-foreground'}
          `}>
            {step.label}
          </span>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={`
              flex-1 h-0.5 mx-3
              ${step.completed ? 'bg-chart-2' : 'bg-border'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
};

export default WizardProgress;
