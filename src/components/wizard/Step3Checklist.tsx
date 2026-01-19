/**
 * Step 3 - Checklist - Clean minimal
 */

import { useMemo } from 'react';
import { Demande } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Step3ChecklistProps {
  demande: Demande;
  onComplete: () => void;
  onBack: () => void;
}

const Step3Checklist = ({ demande, onComplete, onBack }: Step3ChecklistProps) => {
  const { updateChecklist, updateStatut } = useDemandes();

  const stats = useMemo(() => {
    const total = demande.checklist.length;
    const completed = demande.checklist.filter(c => c.valide).length;
    const required = demande.checklist.filter(c => c.obligatoire);
    const requiredCompleted = required.filter(c => c.valide).length;
    const allRequiredDone = requiredCompleted === required.length;

    return {
      total,
      completed,
      percentage: Math.round((completed / total) * 100),
      required: required.length,
      requiredCompleted,
      allRequiredDone
    };
  }, [demande.checklist]);

  const handleCheckChange = (itemId: string, checked: boolean) => {
    updateChecklist(demande.id, itemId, { valide: checked });
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    updateChecklist(demande.id, itemId, { commentaire: comment });
  };

  const handleContinue = () => {
    if (demande.statut === 'VERIFICATION_DOCUMENTS' || demande.statut === 'EN_COURS_INSTRUCTION') {
      updateStatut(demande.id, 'CAPTURE_BIOMETRIQUE');
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Checklist administrative</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Validez chaque point de contrôle
        </p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progression</span>
          <span className="text-sm font-medium">{stats.completed}/{stats.total}</span>
        </div>
        <Progress value={stats.percentage} className="h-2" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {stats.requiredCompleted}/{stats.required} obligatoires
          </span>
          {stats.allRequiredDone ? (
            <span className="text-xs text-chart-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Complet
            </span>
          ) : (
            <span className="text-xs text-chart-4 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Incomplet
            </span>
          )}
        </div>
      </div>

      {/* Checklist items */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {demande.checklist.map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={item.valide}
                onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor={item.id}
                    className={`text-sm font-medium cursor-pointer ${item.valide ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.libelle}
                  </label>
                  {item.obligatoire && (
                    <span className="text-xs text-chart-4">Obligatoire</span>
                  )}
                </div>
                <Textarea
                  placeholder="Commentaire optionnel..."
                  value={item.commentaire}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  className="resize-none h-16 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      {!stats.allRequiredDone && (
        <div className="p-3 rounded-lg bg-chart-4/10 text-sm text-chart-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Tous les points obligatoires doivent être validés
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleContinue} disabled={!stats.allRequiredDone}>
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default Step3Checklist;