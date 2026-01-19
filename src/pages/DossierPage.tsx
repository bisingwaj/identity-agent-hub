/**
 * Page d'instruction du dossier - Wizard complet
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDemandes } from '@/contexts/DemandesContext';
import { useLogger } from '@/contexts/LoggerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WizardProgress from '@/components/wizard/WizardProgress';
import Step1Donnees from '@/components/wizard/Step1Donnees';
import Step2Documents from '@/components/wizard/Step2Documents';
import Step3Checklist from '@/components/wizard/Step3Checklist';
import Step4Biometrie from '@/components/wizard/Step4Biometrie';
import Step5Synthese from '@/components/wizard/Step5Synthese';
import { 
  ArrowLeft, 
  User,
  Calendar,
  FileText
} from 'lucide-react';

const DossierPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { demandes, currentDemande, setCurrentDemande, updateStatut, addHistorique } = useDemandes();
  const { log } = useLogger();
  const { agent } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Charger le dossier
  useEffect(() => {
    if (id) {
      const demande = demandes.find(d => d.id === id);
      if (demande) {
        setCurrentDemande(demande);
        log('ACTION', 'Ouverture dossier', `Dossier ${demande.numeroDossier} ouvert`, agent?.id, id);
        
        // Si le dossier n'est pas encore en instruction, le passer en instruction
        if (demande.statut === 'RDV_CONFIRME' || demande.statut === 'EN_ATTENTE_RDV') {
          updateStatut(id, 'EN_COURS_INSTRUCTION');
          addHistorique(id, 'Début instruction', 'Dossier pris en charge par l\'agent');
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, demandes]);

  // Nettoyer à la sortie
  useEffect(() => {
    return () => {
      setCurrentDemande(null);
    };
  }, []);

  if (!currentDemande) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chargement du dossier...</p>
      </div>
    );
  }

  // Définir les étapes
  const steps = [
    { id: 1, label: 'Données', completed: completedSteps.includes(1), current: currentStep === 1 },
    { id: 2, label: 'Documents', completed: completedSteps.includes(2), current: currentStep === 2 },
    { id: 3, label: 'Checklist', completed: completedSteps.includes(3), current: currentStep === 3 },
    { id: 4, label: 'Biométrie', completed: completedSteps.includes(4), current: currentStep === 4 },
    { id: 5, label: 'Synthèse', completed: completedSteps.includes(5), current: currentStep === 5 },
  ];

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    if (step < 5) {
      setCurrentStep(step + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId === currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmitSuccess = () => {
    setCompletedSteps(prev => [...prev, 5]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b-2 border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold uppercase">
                  Instruction du dossier
                </h1>
                <Badge variant="outline" className="border-2 font-mono">
                  {currentDemande.numeroDossier}
                </Badge>
              </div>
            </div>
          </div>

          {/* Info citoyen */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold">
                {currentDemande.citoyen.prenom} {currentDemande.citoyen.nom}
              </span>
            </div>
            {currentDemande.dateRendezVous && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(currentDemande.dateRendezVous).toLocaleDateString('fr-FR')}
                  {currentDemande.heureRendezVous && ` à ${currentDemande.heureRendezVous}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{currentDemande.documents.length} doc(s)</span>
            </div>
          </div>
        </div>

        {/* Wizard Progress */}
        <WizardProgress 
          steps={steps} 
          onStepClick={handleStepClick}
        />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Step1Donnees 
              demande={currentDemande}
              onComplete={() => handleStepComplete(1)}
            />
          )}
          {currentStep === 2 && (
            <Step2Documents 
              demande={currentDemande}
              onComplete={() => handleStepComplete(2)}
              onBack={handleStepBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Checklist 
              demande={currentDemande}
              onComplete={() => handleStepComplete(3)}
              onBack={handleStepBack}
            />
          )}
          {currentStep === 4 && (
            <Step4Biometrie 
              demande={currentDemande}
              onComplete={() => handleStepComplete(4)}
              onBack={handleStepBack}
            />
          )}
          {currentStep === 5 && (
            <Step5Synthese 
              demande={currentDemande}
              onBack={handleStepBack}
              onSubmitSuccess={handleSubmitSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DossierPage;
