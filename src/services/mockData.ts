/**
 * Données mock pour simulation
 * À remplacer par des appels API réels
 */

import { 
  Agent, 
  Demande, 
  Peripherique, 
  RendezVous,
  ChecklistItem 
} from '@/types';

// Agent mock pour authentification
export const mockAgents: Agent[] = [
  {
    id: 'AGT-001',
    nom: 'MBEMBA',
    prenom: 'Grâce',
    email: 'grace.mbemba@snib.gov.cg',
    role: 'AGENT_ADMIN_IDENTIFICATION',
    centreId: 'CTR-BZV-001',
    centreNom: 'Mairie centrale de Brazzaville'
  },
  {
    id: 'AGT-002',
    nom: 'MOUANDA',
    prenom: 'Patrick',
    email: 'patrick.mouanda@snib.gov.cg',
    role: 'SUPERVISEUR',
    centreId: 'CTR-BZV-001',
    centreNom: 'Mairie centrale de Brazzaville'
  }
];

// Checklist standard pour vérification administrative
export const checklistStandard: Omit<ChecklistItem, 'valide' | 'commentaire' | 'dateValidation'>[] = [
  { id: 'CHK-001', libelle: 'Identité du demandeur vérifiée', obligatoire: true },
  { id: 'CHK-002', libelle: 'Documents originaux présentés', obligatoire: true },
  { id: 'CHK-003', libelle: 'Cohérence des informations déclarées', obligatoire: true },
  { id: 'CHK-004', libelle: 'Absence de signalement judiciaire', obligatoire: true },
  { id: 'CHK-005', libelle: 'Paiement des frais validé', obligatoire: true },
  { id: 'CHK-006', libelle: 'Photo conforme aux normes', obligatoire: true },
  { id: 'CHK-007', libelle: 'Signature du demandeur obtenue', obligatoire: false },
  { id: 'CHK-008', libelle: 'Informations complémentaires collectées', obligatoire: false },
];

// Demandes mock
export const mockDemandes: Demande[] = [
  {
    id: 'DEM-2026-00001',
    numeroDossier: 'SNIB-2026-00001',
    citoyen: {
      nom: 'NGOUMA',
      prenom: 'Jean-Claude',
      dateNaissance: '1985-03-15',
      lieuNaissance: 'Brazzaville',
      sexe: 'M',
      nationalite: 'Congolaise',
      adresse: '45 Avenue de la Paix, Bacongo, Brazzaville',
      telephone: '+242 06 512 34 56',
      email: 'jc.ngouma@email.cg'
    },
    statut: 'RDV_CONFIRME',
    dateCreation: '2026-01-15T10:30:00',
    dateRendezVous: '2026-01-19',
    heureRendezVous: '09:00',
    agentAssigne: null,
    documents: [],
    checklist: checklistStandard.map(item => ({ 
      ...item, 
      valide: false, 
      commentaire: '' 
    })),
    biometrie: null,
    historique: [
      {
        id: 'HIST-001',
        date: '2026-01-15T10:30:00',
        action: 'Création du dossier',
        agentId: 'SYSTEM',
        agentNom: 'Système',
        details: 'Dossier créé suite à la demande en ligne'
      },
      {
        id: 'HIST-002',
        date: '2026-01-16T14:00:00',
        action: 'Rendez-vous confirmé',
        agentId: 'SYSTEM',
        agentNom: 'Système',
        details: 'RDV fixé au 19/01/2026 à 09:00'
      }
    ]
  },
  {
    id: 'DEM-2026-00002',
    numeroDossier: 'SNIB-2026-00002',
    citoyen: {
      nom: 'OKO',
      prenom: 'Béatrice',
      dateNaissance: '1992-07-22',
      lieuNaissance: 'Pointe-Noire',
      sexe: 'F',
      nationalite: 'Congolaise',
      adresse: '12 Rue Loango, Centre-ville, Pointe-Noire',
      telephone: '+242 05 678 90 12',
      email: 'beatrice.oko@email.cg'
    },
    statut: 'EN_COURS_INSTRUCTION',
    dateCreation: '2026-01-14T08:15:00',
    dateRendezVous: '2026-01-19',
    heureRendezVous: '10:30',
    agentAssigne: 'AGT-001',
    documents: [
      {
        id: 'DOC-001',
        type: 'CNI',
        nom: 'Carte Nationale d\'Identité',
        dateNumerisation: '2026-01-18T11:00:00',
        qualite: 'BONNE',
        statut: 'VALIDE'
      }
    ],
    checklist: checklistStandard.map((item, index) => ({ 
      ...item, 
      valide: index < 3, 
      commentaire: index < 3 ? 'Vérifié' : '' 
    })),
    biometrie: null,
    historique: [
      {
        id: 'HIST-003',
        date: '2026-01-14T08:15:00',
        action: 'Création du dossier',
        agentId: 'SYSTEM',
        agentNom: 'Système',
        details: 'Dossier créé suite à la demande en ligne'
      },
      {
        id: 'HIST-004',
        date: '2026-01-18T09:00:00',
        action: 'Début instruction',
        agentId: 'AGT-001',
        agentNom: 'MBEMBA Grâce',
        details: 'Prise en charge du dossier par l\'agent'
      }
    ]
  },
  {
    id: 'DEM-2026-00003',
    numeroDossier: 'SNIB-2026-00003',
    citoyen: {
      nom: 'MASSAMBA',
      prenom: 'Didier',
      dateNaissance: '1978-11-30',
      lieuNaissance: 'Dolisie',
      sexe: 'M',
      nationalite: 'Congolaise',
      adresse: '8 Boulevard Denis Sassou-Nguesso, Ouenzé, Brazzaville',
      telephone: '+242 06 345 67 89',
      email: 'd.massamba@email.cg'
    },
    statut: 'VERIFICATION_DOCUMENTS',
    dateCreation: '2026-01-13T16:45:00',
    dateRendezVous: '2026-01-19',
    heureRendezVous: '14:00',
    agentAssigne: 'AGT-001',
    documents: [
      {
        id: 'DOC-002',
        type: 'ACTE_NAISSANCE',
        nom: 'Acte de Naissance',
        dateNumerisation: '2026-01-17T10:30:00',
        qualite: 'EXCELLENTE',
        statut: 'VALIDE'
      },
      {
        id: 'DOC-003',
        type: 'JUSTIFICATIF_DOMICILE',
        nom: 'Facture SNE',
        dateNumerisation: '2026-01-17T10:35:00',
        qualite: 'BONNE',
        statut: 'VALIDE'
      }
    ],
    checklist: checklistStandard.map(item => ({ 
      ...item, 
      valide: item.obligatoire, 
      commentaire: item.obligatoire ? 'Conforme' : '' 
    })),
    biometrie: null,
    historique: []
  },
  {
    id: 'DEM-2026-00004',
    numeroDossier: 'SNIB-2026-00004',
    citoyen: {
      nom: 'ITOUA',
      prenom: 'Christelle',
      dateNaissance: '1995-02-14',
      lieuNaissance: 'Owando',
      sexe: 'F',
      nationalite: 'Congolaise',
      adresse: '23 Avenue Marien Ngouabi, Nkayi',
      telephone: '+242 05 901 23 45',
      email: 'c.itoua@email.cg'
    },
    statut: 'EN_ATTENTE_RDV',
    dateCreation: '2026-01-18T11:20:00',
    dateRendezVous: null,
    heureRendezVous: null,
    agentAssigne: null,
    documents: [],
    checklist: checklistStandard.map(item => ({ 
      ...item, 
      valide: false, 
      commentaire: '' 
    })),
    biometrie: null,
    historique: []
  },
  {
    id: 'DEM-2026-00005',
    numeroDossier: 'SNIB-2026-00005',
    citoyen: {
      nom: 'ONDONGO',
      prenom: 'Serge',
      dateNaissance: '1988-09-05',
      lieuNaissance: 'Impfondo',
      sexe: 'M',
      nationalite: 'Congolaise',
      adresse: '67 Rue Matsiona, Moungali, Brazzaville',
      telephone: '+242 06 789 01 23',
      email: 's.ondongo@email.cg'
    },
    statut: 'VALIDE',
    dateCreation: '2026-01-10T09:00:00',
    dateRendezVous: '2026-01-15',
    heureRendezVous: '11:00',
    agentAssigne: 'AGT-001',
    documents: [
      {
        id: 'DOC-004',
        type: 'CNI',
        nom: 'Carte Nationale d\'Identité',
        dateNumerisation: '2026-01-15T11:15:00',
        qualite: 'EXCELLENTE',
        statut: 'VALIDE'
      },
      {
        id: 'DOC-005',
        type: 'ACTE_NAISSANCE',
        nom: 'Acte de Naissance',
        dateNumerisation: '2026-01-15T11:20:00',
        qualite: 'EXCELLENTE',
        statut: 'VALIDE'
      },
      {
        id: 'DOC-006',
        type: 'PHOTO_IDENTITE',
        nom: 'Photo d\'Identité',
        dateNumerisation: '2026-01-15T11:25:00',
        qualite: 'EXCELLENTE',
        statut: 'VALIDE'
      }
    ],
    checklist: checklistStandard.map(item => ({ 
      ...item, 
      valide: true, 
      commentaire: 'Vérifié et conforme',
      dateValidation: '2026-01-15T14:00:00'
    })),
    biometrie: {
      empreintes: [
        { doigt: 'POUCE_DROIT', capturee: true, qualite: 95, timestamp: '2026-01-15T11:30:00' },
        { doigt: 'INDEX_DROIT', capturee: true, qualite: 92, timestamp: '2026-01-15T11:31:00' },
        { doigt: 'MAJEUR_DROIT', capturee: true, qualite: 88, timestamp: '2026-01-15T11:32:00' },
        { doigt: 'ANNULAIRE_DROIT', capturee: true, qualite: 90, timestamp: '2026-01-15T11:33:00' },
        { doigt: 'AURICULAIRE_DROIT', capturee: true, qualite: 85, timestamp: '2026-01-15T11:34:00' },
        { doigt: 'POUCE_GAUCHE', capturee: true, qualite: 94, timestamp: '2026-01-15T11:35:00' },
        { doigt: 'INDEX_GAUCHE', capturee: true, qualite: 91, timestamp: '2026-01-15T11:36:00' },
        { doigt: 'MAJEUR_GAUCHE', capturee: true, qualite: 89, timestamp: '2026-01-15T11:37:00' },
        { doigt: 'ANNULAIRE_GAUCHE', capturee: true, qualite: 87, timestamp: '2026-01-15T11:38:00' },
        { doigt: 'AURICULAIRE_GAUCHE', capturee: true, qualite: 83, timestamp: '2026-01-15T11:39:00' },
      ],
      iris: [
        { oeil: 'DROIT', capturee: true, qualite: 96, timestamp: '2026-01-15T11:40:00' },
        { oeil: 'GAUCHE', capturee: true, qualite: 94, timestamp: '2026-01-15T11:41:00' },
      ],
      visage: { capturee: true, qualite: 98, timestamp: '2026-01-15T11:42:00' },
      dateCapture: '2026-01-15',
      agentCapture: 'AGT-001'
    },
    historique: []
  }
];

// Périphériques mock
export const mockPeripheriques: Peripherique[] = [
  {
    id: 'PER-001',
    type: 'SCANNER_DOCUMENTS',
    nom: 'Scanner Fujitsu FI-7160',
    etat: 'CONNECTE',
    derniereSynchronisation: '2026-01-19T08:00:00'
  },
  {
    id: 'PER-002',
    type: 'SCANNER_EMPREINTES',
    nom: 'Lecteur CrossMatch Guardian',
    etat: 'CONNECTE',
    derniereSynchronisation: '2026-01-19T08:00:00'
  },
  {
    id: 'PER-003',
    type: 'SCANNER_IRIS',
    nom: 'IriShield USB MK2120U',
    etat: 'DECONNECTE'
  },
  {
    id: 'PER-004',
    type: 'CAMERA_VISAGE',
    nom: 'Webcam HD Pro',
    etat: 'CONNECTE',
    derniereSynchronisation: '2026-01-19T08:00:00'
  }
];

// Rendez-vous du jour
export const mockRendezVous: RendezVous[] = [
  {
    id: 'RDV-001',
    demandeId: 'DEM-2026-00001',
    citoyenNom: 'NGOUMA',
    citoyenPrenom: 'Jean-Claude',
    date: '2026-01-19',
    heure: '09:00',
    duree: 45,
    statut: 'PLANIFIE'
  },
  {
    id: 'RDV-002',
    demandeId: 'DEM-2026-00002',
    citoyenNom: 'OKO',
    citoyenPrenom: 'Béatrice',
    date: '2026-01-19',
    heure: '10:30',
    duree: 45,
    statut: 'EN_COURS'
  },
  {
    id: 'RDV-003',
    demandeId: 'DEM-2026-00003',
    citoyenNom: 'MASSAMBA',
    citoyenPrenom: 'Didier',
    date: '2026-01-19',
    heure: '14:00',
    duree: 45,
    statut: 'PLANIFIE'
  }
];
