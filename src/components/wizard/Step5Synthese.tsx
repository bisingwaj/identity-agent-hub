/**
 * Étape 5 - Synthèse et soumission du dossier
 */

import { useState, useMemo } from 'react';
import { Demande } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  User, 
  ClipboardCheck, 
  Fingerprint, 
  CheckCircle2, 
  XCircle,
  Send,
  Loader2,
  AlertTriangle,
  Calendar
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

  // Vérifier la complétude
  const completude = useMemo(() => {
    const checks = {
      donnees: true, // Toujours rempli
      documents: demande.documents.length >= 2,
      checklist: demande.checklist.filter(c => c.obligatoire).every(c => c.valide),
      biometrie: demande.biometrie !== null && 
        demande.biometrie.empreintes.every(e => e.capturee) &&
        demande.biometrie.iris.every(i => i.capturee) &&
        demande.biometrie.visage.capturee
    };

    const completedCount = Object.values(checks).filter(Boolean).length;
    const isComplete = Object.values(checks).every(Boolean);

    return { checks, completedCount, total: 4, isComplete };
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold uppercase">Synthèse du dossier</h2>
        <p className="text-muted-foreground">
          Récapitulatif avant soumission pour validation
        </p>
      </div>

      {/* Statut de complétude */}
      <Card className={`border-2 ${completude.isComplete ? 'border-chart-2' : 'border-chart-4'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {completude.isComplete ? (
                <div className="p-2 border-2 border-chart-2 bg-chart-2">
                  <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                </div>
              ) : (
                <div className="p-2 border-2 border-chart-4 bg-chart-4">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="font-bold">
                  {completude.isComplete ? 'Dossier complet' : 'Dossier incomplet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {completude.completedCount}/{completude.total} sections validées
                </p>
              </div>
            </div>
            <Badge className={completude.isComplete ? 'bg-chart-2 text-primary-foreground' : 'bg-chart-4'}>
              {completude.isComplete ? 'Prêt' : 'À compléter'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Récapitulatif */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identité */}
        <Card className="border-2">
          <CardHeader className="border-b-2 border-border pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Identité
              </span>
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-sm">
            <p><strong>Nom:</strong> {demande.citoyen.nom}</p>
            <p><strong>Prénom:</strong> {demande.citoyen.prenom}</p>
            <p><strong>Né(e) le:</strong> {new Date(demande.citoyen.dateNaissance).toLocaleDateString('fr-FR')}</p>
            <p><strong>À:</strong> {demande.citoyen.lieuNaissance}</p>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="border-2">
          <CardHeader className="border-b-2 border-border pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </span>
              {completude.checks.documents ? (
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-sm">
            {demande.documents.length === 0 ? (
              <p className="text-muted-foreground">Aucun document numérisé</p>
            ) : (
              demande.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <span>{doc.nom}</span>
                  <Badge variant="outline" className="text-xs">{doc.qualite}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="border-2">
          <CardHeader className="border-b-2 border-border pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Checklist
              </span>
              {completude.checks.checklist ? (
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm">
            <div className="space-y-1">
              {demande.checklist.filter(c => c.obligatoire).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  {item.valide ? (
                    <CheckCircle2 className="h-4 w-4 text-chart-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  <span className={!item.valide ? 'text-muted-foreground' : ''}>{item.libelle}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Biométrie */}
        <Card className="border-2">
          <CardHeader className="border-b-2 border-border pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                Biométrie
              </span>
              {completude.checks.biometrie ? (
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm">
            {demande.biometrie ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Empreintes digitales</span>
                  <Badge variant="outline">
                    {demande.biometrie.empreintes.filter(e => e.capturee).length}/10
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Iris</span>
                  <Badge variant="outline">
                    {demande.biometrie.iris.filter(i => i.capturee).length}/2
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visage</span>
                  <Badge variant="outline">
                    {demande.biometrie.visage.capturee ? '1/1' : '0/1'}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Non capturée</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="border-2" />

      {/* Informations dossier */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground">N° Dossier:</span>
                <span className="font-mono font-bold ml-2">{demande.numeroDossier}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date création:</span>
                <span className="ml-2">{new Date(demande.dateCreation).toLocaleDateString('fr-FR')}</span>
              </div>
              {demande.dateRendezVous && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(demande.dateRendezVous).toLocaleDateString('fr-FR')} {demande.heureRendezVous}</span>
                </div>
              )}
            </div>
            <Badge variant="outline" className="border-2">
              {demande.statut.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {submitted ? (
        <div className="flex items-center gap-3 p-6 bg-chart-2/10 border-2 border-chart-2">
          <CheckCircle2 className="h-8 w-8 text-chart-2 flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">Dossier soumis avec succès</p>
            <p className="text-muted-foreground">
              Le dossier a été envoyé pour validation par le superviseur.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          <Button variant="outline" className="border-2" onClick={onBack}>
            Retour
          </Button>
          <Button
            className="border-2 shadow-xs hover:shadow-none"
            onClick={handleSubmit}
            disabled={!completude.isComplete || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Soumission en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Soumettre pour validation
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Step5Synthese;
