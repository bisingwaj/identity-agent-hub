/**
 * Step 5 - Summary - Clean minimal
 */

import { useState, useMemo } from 'react';
import { Demande } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  User, 
  ClipboardCheck, 
  Fingerprint, 
  CheckCircle2, 
  XCircle,
  Send,
  Loader2
} from 'lucide-react';

interface Step5SyntheseProps {
  demande: Demande;
  onBack: () => void;
  onSubmitSuccess: () => void;
}

const Step5Synthese = ({ demande, onBack, onSubmitSuccess }: Step5SyntheseProps) => {
  const { submitDossier } = useDemandes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(demande.statut === 'EN_VALIDATION');

  const completude = useMemo(() => {
    const checks = {
      donnees: true,
      documents: demande.documents.length >= 2,
      checklist: demande.checklist.filter(c => c.obligatoire).every(c => c.valide),
      biometrie: demande.biometrie !== null && 
        demande.biometrie.empreintes.every(e => e.capturee) &&
        demande.biometrie.iris.every(i => i.capturee) &&
        demande.biometrie.visage.capturee
    };
    const completedCount = Object.values(checks).filter(Boolean).length;
    return { checks, completedCount, total: 4, isComplete: Object.values(checks).every(Boolean) };
  }, [demande]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await submitDossier(demande.id);
    setIsSubmitting(false);
    if (success) {
      setSubmitted(true);
      onSubmitSuccess();
    }
  };

  const sections = [
    { 
      key: 'donnees', 
      icon: User, 
      label: 'Identité',
      content: `${demande.citoyen.prenom} ${demande.citoyen.nom}`
    },
    { 
      key: 'documents', 
      icon: FileText, 
      label: 'Documents',
      content: `${demande.documents.length} document(s)`
    },
    { 
      key: 'checklist', 
      icon: ClipboardCheck, 
      label: 'Checklist',
      content: `${demande.checklist.filter(c => c.valide).length}/${demande.checklist.length}`
    },
    { 
      key: 'biometrie', 
      icon: Fingerprint, 
      label: 'Biométrie',
      content: demande.biometrie 
        ? `${demande.biometrie.empreintes.filter(e => e.capturee).length + demande.biometrie.iris.filter(i => i.capturee).length + (demande.biometrie.visage.capturee ? 1 : 0)}/13`
        : '0/13'
    },
  ];

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-chart-2/10 rounded-xl p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-chart-2 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dossier soumis</h2>
          <p className="text-muted-foreground">
            Le dossier a été envoyé pour validation
          </p>
          <p className="text-sm font-mono mt-4 text-muted-foreground">
            {demande.numeroDossier}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Synthèse du dossier</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Vérification avant soumission
        </p>
      </div>

      {/* Status */}
      <div className={`rounded-xl p-4 flex items-center gap-4 ${completude.isComplete ? 'bg-chart-2/10' : 'bg-chart-4/10'}`}>
        {completude.isComplete ? (
          <CheckCircle2 className="h-8 w-8 text-chart-2 shrink-0" />
        ) : (
          <XCircle className="h-8 w-8 text-chart-4 shrink-0" />
        )}
        <div>
          <p className="font-medium">{completude.isComplete ? 'Dossier complet' : 'Dossier incomplet'}</p>
          <p className="text-sm text-muted-foreground">{completude.completedCount}/{completude.total} sections</p>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {sections.map(({ key, icon: Icon, label, content }) => {
          const isComplete = completude.checks[key as keyof typeof completude.checks];
          return (
            <div key={key} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isComplete ? 'bg-chart-2/10' : 'bg-muted'}`}>
                  <Icon className={`h-4 w-4 ${isComplete ? 'text-chart-2' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{content}</p>
                </div>
              </div>
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dossier info */}
      <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">N° Dossier</span>
        <span className="font-mono font-medium">{demande.numeroDossier}</span>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleSubmit} disabled={!completude.isComplete || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Envoi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Soumettre
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step5Synthese;