/**
 * Contexte de gestion des demandes d'identification
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Demande, DocumentScanne, ChecklistItem, BiometrieData, HistoriqueModification, StatutDemande } from '@/types';
import { mockDemandes, mockRendezVous } from '@/services/mockData';
import { RendezVous } from '@/types';
import { useLogger } from '@/contexts/LoggerContext';
import { useAuth } from '@/contexts/AuthContext';

interface DemandesContextType {
  demandes: Demande[];
  rendezVous: RendezVous[];
  currentDemande: Demande | null;
  setCurrentDemande: (demande: Demande | null) => void;
  updateDemandeData: (id: string, updates: Partial<Demande['citoyen']>) => void;
  addDocument: (id: string, document: DocumentScanne) => void;
  updateChecklist: (id: string, checklistItemId: string, updates: Partial<ChecklistItem>) => void;
  updateBiometrie: (id: string, biometrie: BiometrieData) => void;
  updateStatut: (id: string, statut: StatutDemande) => void;
  addHistorique: (id: string, action: string, details: string) => void;
  submitDossier: (id: string) => Promise<boolean>;
  refreshDemandes: () => void;
}

const DemandesContext = createContext<DemandesContextType | undefined>(undefined);

export const DemandesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demandes, setDemandes] = useState<Demande[]>(mockDemandes);
  const [rendezVous] = useState<RendezVous[]>(mockRendezVous);
  const [currentDemande, setCurrentDemande] = useState<Demande | null>(null);
  
  const { log } = useLogger();
  const { agent } = useAuth();

  const addHistorique = useCallback((id: string, action: string, details: string) => {
    const histEntry: HistoriqueModification = {
      id: `HIST-${Date.now()}`,
      date: new Date().toISOString(),
      action,
      agentId: agent?.id || 'SYSTEM',
      agentNom: agent ? `${agent.nom} ${agent.prenom}` : 'Système',
      details
    };

    setDemandes(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, historique: [...d.historique, histEntry] };
      }
      return d;
    }));

    // Mettre à jour currentDemande si c'est le même dossier
    setCurrentDemande(prev => {
      if (prev?.id === id) {
        return { ...prev, historique: [...prev.historique, histEntry] };
      }
      return prev;
    });
  }, [agent]);

  const updateDemandeData = useCallback((id: string, updates: Partial<Demande['citoyen']>) => {
    setDemandes(prev => prev.map(d => {
      if (d.id === id) {
        const updated = { ...d, citoyen: { ...d.citoyen, ...updates } };
        return updated;
      }
      return d;
    }));

    setCurrentDemande(prev => {
      if (prev?.id === id) {
        return { ...prev, citoyen: { ...prev.citoyen, ...updates } };
      }
      return prev;
    });

    log('ACTION', 'Modification données', `Données citoyen modifiées pour dossier ${id}`, agent?.id, id);
    addHistorique(id, 'Modification données', `Champs modifiés: ${Object.keys(updates).join(', ')}`);
  }, [agent, log, addHistorique]);

  const addDocument = useCallback((id: string, document: DocumentScanne) => {
    setDemandes(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, documents: [...d.documents, document] };
      }
      return d;
    }));

    setCurrentDemande(prev => {
      if (prev?.id === id) {
        return { ...prev, documents: [...prev.documents, document] };
      }
      return prev;
    });

    log('DOCUMENT', 'Document numérisé', `${document.nom} ajouté au dossier ${id}`, agent?.id, id);
    addHistorique(id, 'Document ajouté', `${document.nom} numérisé avec qualité ${document.qualite}`);
  }, [agent, log, addHistorique]);

  const updateChecklist = useCallback((id: string, checklistItemId: string, updates: Partial<ChecklistItem>) => {
    const updateFn = (d: Demande) => {
      if (d.id === id) {
        return {
          ...d,
          checklist: d.checklist.map(item => 
            item.id === checklistItemId 
              ? { ...item, ...updates, dateValidation: updates.valide ? new Date().toISOString() : undefined }
              : item
          )
        };
      }
      return d;
    };

    setDemandes(prev => prev.map(updateFn));
    setCurrentDemande(prev => prev ? updateFn(prev) : null);

    log('ACTION', 'Checklist mise à jour', `Item ${checklistItemId} modifié`, agent?.id, id);
  }, [agent, log]);

  const updateBiometrie = useCallback((id: string, biometrie: BiometrieData) => {
    setDemandes(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, biometrie };
      }
      return d;
    }));

    setCurrentDemande(prev => {
      if (prev?.id === id) {
        return { ...prev, biometrie };
      }
      return prev;
    });

    log('BIOMETRIE', 'Données biométriques mises à jour', `Biométrie capturée pour dossier ${id}`, agent?.id, id);
  }, [agent, log]);

  const updateStatut = useCallback((id: string, statut: StatutDemande) => {
    setDemandes(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, statut };
      }
      return d;
    }));

    setCurrentDemande(prev => {
      if (prev?.id === id) {
        return { ...prev, statut };
      }
      return prev;
    });

    log('ACTION', 'Changement de statut', `Dossier ${id} passé en ${statut}`, agent?.id, id);
    addHistorique(id, 'Changement de statut', `Nouveau statut: ${statut}`);
  }, [agent, log, addHistorique]);

  const submitDossier = useCallback(async (id: string): Promise<boolean> => {
    // Simulation d'envoi - À remplacer par API réelle
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateStatut(id, 'EN_VALIDATION');
    log('ACTION', 'Dossier soumis', `Dossier ${id} envoyé pour validation`, agent?.id, id);
    addHistorique(id, 'Soumission', 'Dossier envoyé pour validation par le superviseur');
    
    return true;
  }, [updateStatut, log, agent, addHistorique]);

  const refreshDemandes = useCallback(() => {
    setDemandes(mockDemandes);
    log('INFO', 'Actualisation', 'Liste des demandes actualisée');
  }, [log]);

  return (
    <DemandesContext.Provider value={{
      demandes,
      rendezVous,
      currentDemande,
      setCurrentDemande,
      updateDemandeData,
      addDocument,
      updateChecklist,
      updateBiometrie,
      updateStatut,
      addHistorique,
      submitDossier,
      refreshDemandes
    }}>
      {children}
    </DemandesContext.Provider>
  );
};

export const useDemandes = (): DemandesContextType => {
  const context = useContext(DemandesContext);
  if (!context) {
    throw new Error('useDemandes doit être utilisé dans un DemandesProvider');
  }
  return context;
};
