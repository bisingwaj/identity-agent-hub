/**
 * Étape 3 - Checklist administrative
 */

import { useMemo } from 'react';
import { Demande } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2,
  Star
} from 'lucide-react';

interface Step3ChecklistProps {
  demande: Demande;
  onComplete: () => void;
  onBack: () => void;
}

const Step3Checklist = ({ demande, onComplete, onBack }: Step3ChecklistProps) => {
  const { updateChecklist, updateStatut } = useDemandes();

  // Calculer la progression
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
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold uppercase">Checklist administrative</h2>
        <p className="text-muted-foreground">
          Vérifiez et validez chaque point de contrôle
        </p>
      </div>

      {/* Progression */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold uppercase">Progression</span>
            <span className="font-mono font-bold">{stats.completed}/{stats.total}</span>
          </div>
          <Progress value={stats.percentage} className="h-3" />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-chart-4" />
              <span>
                <span className="font-bold">{stats.requiredCompleted}</span>/{stats.required} obligatoires
              </span>
            </div>
            {stats.allRequiredDone ? (
              <Badge className="bg-chart-2 text-primary-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complet
              </Badge>
            ) : (
              <Badge className="bg-chart-4">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Incomplet
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="border-2">
        <CardHeader className="border-b-2 border-border pb-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Points de contrôle
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {demande.checklist.map((item) => (
              <div 
                key={item.id}
                className={`
                  p-4 border-2 transition-all
                  ${item.valide ? 'bg-chart-2/5 border-chart-2' : 'border-border'}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <Checkbox
                    id={item.id}
                    checked={item.valide}
                    onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                    className="mt-1 h-5 w-5 border-2"
                  />
                  
                  <div className="flex-1 space-y-3">
                    {/* Label */}
                    <div className="flex items-center gap-2">
                      <label 
                        htmlFor={item.id}
                        className={`font-bold cursor-pointer ${item.valide ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.libelle}
                      </label>
                      {item.obligatoire && (
                        <Badge variant="outline" className="border-2 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Obligatoire
                        </Badge>
                      )}
                    </div>

                    {/* Commentaire */}
                    <Textarea
                      placeholder="Ajouter un commentaire..."
                      value={item.commentaire}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      className="border-2 resize-none h-20 text-sm"
                    />

                    {/* Date de validation */}
                    {item.dateValidation && (
                      <p className="text-xs text-muted-foreground font-mono">
                        Validé le {new Date(item.dateValidation).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avertissement si incomplet */}
      {!stats.allRequiredDone && (
        <div className="flex items-start gap-3 p-4 bg-chart-4/10 border-2 border-chart-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-chart-4" />
          <div className="text-sm">
            <p className="font-bold">Checklist incomplète</p>
            <p className="text-muted-foreground">
              Tous les points obligatoires doivent être validés pour continuer.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" className="border-2" onClick={onBack}>
          Retour
        </Button>
        <Button
          className="border-2 shadow-xs hover:shadow-none"
          onClick={handleContinue}
          disabled={!stats.allRequiredDone}
        >
          Continuer vers la biométrie
        </Button>
      </div>
    </div>
  );
};

export default Step3Checklist;
