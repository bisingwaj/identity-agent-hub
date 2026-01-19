/**
 * Dossier Page - Apple-style wizard, non-scrolling panels
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDemandes } from '@/contexts/DemandesContext';
import { useLogger } from '@/contexts/LoggerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Step1Donnees from '@/components/wizard/Step1Donnees';
import Step2Documents from '@/components/wizard/Step2Documents';
import Step3Checklist from '@/components/wizard/Step3Checklist';
import Step4Biometrie from '@/components/wizard/Step4Biometrie';
import Step5Synthese from '@/components/wizard/Step5Synthese';
import { ArrowLeft, Check } from 'lucide-react';

const DossierPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { demandes, currentDemande, setCurrentDemande, updateStatut, addHistorique } = useDemandes();
  const { log } = useLogger();
  const { agent } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      const demande = demandes.find(d => d.id === id);
      if (demande) {
        setCurrentDemande(demande);
        log('ACTION', 'Ouverture dossier', `Dossier ${demande.numeroDossier} ouvert`, agent?.id, id);
        
        if (demande.statut === 'RDV_CONFIRME' || demande.statut === 'EN_ATTENTE_RDV') {
          updateStatut(id, 'EN_COURS_INSTRUCTION');
          addHistorique(id, 'Début instruction', 'Dossier pris en charge par l\'agent');
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, demandes]);

  useEffect(() => {
    return () => setCurrentDemande(null);
  }, []);

  if (!currentDemande) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const steps = [
    { id: 1, label: 'Données' },
    { id: 2, label: 'Documents' },
    { id: 3, label: 'Checklist' },
    { id: 4, label: 'Biométrie' },
    { id: 5, label: 'Synthèse' },
  ];

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    if (step < 5) setCurrentStep(step + 1);
  };

  const handleStepBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId === currentStep) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="font-medium">{currentDemande.citoyen.prenom} {currentDemande.citoyen.nom}</span>
            <span className="text-muted-foreground ml-2 text-sm">{currentDemande.numeroDossier}</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {steps.map((step, i) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!isCompleted && !isCurrent}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors
                  ${isCurrent 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-chart-2/10 text-chart-2 hover:bg-chart-2/20' 
                      : 'text-muted-foreground'
                  }
                `}
              >
                {isCompleted && <Check className="h-3 w-3" />}
                <span className={isCurrent || isCompleted ? 'font-medium' : ''}>{step.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Content - scrollable panel */}
      <div className="flex-1 overflow-auto scrollbar-minimal">
        <div className="max-w-3xl mx-auto p-6">
          {currentStep === 1 && (
            <Step1Donnees demande={currentDemande} onComplete={() => handleStepComplete(1)} />
          )}
          {currentStep === 2 && (
            <Step2Documents demande={currentDemande} onComplete={() => handleStepComplete(2)} onBack={handleStepBack} />
          )}
          {currentStep === 3 && (
            <Step3Checklist demande={currentDemande} onComplete={() => handleStepComplete(3)} onBack={handleStepBack} />
          )}
          {currentStep === 4 && (
            <Step4Biometrie demande={currentDemande} onComplete={() => handleStepComplete(4)} onBack={handleStepBack} />
          )}
          {currentStep === 5 && (
            <Step5Synthese demande={currentDemande} onBack={handleStepBack} onSubmitSuccess={() => setCompletedSteps(prev => [...prev, 5])} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DossierPage;