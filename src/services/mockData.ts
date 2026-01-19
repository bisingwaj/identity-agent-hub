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
    nom: 'KONAN',
    prenom: 'Aya',
    email: 'aya.konan@sni.gov',
    role: 'AGENT_ADMIN_IDENTIFICATION',
    centreId: 'CTR-ABJ-001',
    centreNom: 'Mairie d\'Abobo'
  },
  {
    id: 'AGT-002',
    nom: 'TRAORE',
    prenom: 'Mamadou',
    email: 'mamadou.traore@sni.gov',
    role: 'SUPERVISEUR',
    centreId: 'CTR-ABJ-001',
    centreNom: 'Mairie d\'Abobo'
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
    numeroDossier: 'SNI-2026-00001',
    citoyen: {
      nom: 'KOUAME',
      prenom: 'Jean-Baptiste',
      dateNaissance: '1985-03-15',
      lieuNaissance: 'Abidjan',
      sexe: 'M',
      nationalite: 'Ivoirienne',
      adresse: '123 Rue des Jardins, Cocody, Abidjan',
      telephone: '+225 07 01 02 03 04',
      email: 'jb.kouame@email.ci'
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
    numeroDossier: 'SNI-2026-00002',
    citoyen: {
      nom: 'DIALLO',
      prenom: 'Fatou',
      dateNaissance: '1992-07-22',
      lieuNaissance: 'Bouaké',
      sexe: 'F',
      nationalite: 'Ivoirienne',
      adresse: '45 Avenue de la Paix, Plateau, Abidjan',
      telephone: '+225 05 11 22 33 44',
      email: 'fatou.diallo@email.ci'
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
        agentNom: 'KONAN Aya',
        details: 'Prise en charge du dossier par l\'agent'
      }
    ]
  },
  {
    id: 'DEM-2026-00003',
    numeroDossier: 'SNI-2026-00003',
    citoyen: {
      nom: 'N\'GUESSAN',
      prenom: 'Kouadio',
      dateNaissance: '1978-11-30',
      lieuNaissance: 'Yamoussoukro',
      sexe: 'M',
      nationalite: 'Ivoirienne',
      adresse: '78 Boulevard du Commerce, Treichville, Abidjan',
      telephone: '+225 01 55 66 77 88',
      email: 'k.nguessan@email.ci'
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
        nom: 'Facture CIE',
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
    numeroDossier: 'SNI-2026-00004',
    citoyen: {
      nom: 'YAO',
      prenom: 'Marie-Claire',
      dateNaissance: '1995-02-14',
      lieuNaissance: 'San Pedro',
      sexe: 'F',
      nationalite: 'Ivoirienne',
      adresse: '12 Rue du Port, San Pedro',
      telephone: '+225 07 99 88 77 66',
      email: 'mc.yao@email.ci'
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
    numeroDossier: 'SNI-2026-00005',
    citoyen: {
      nom: 'BAMBA',
      prenom: 'Ibrahim',
      dateNaissance: '1988-09-05',
      lieuNaissance: 'Korhogo',
      sexe: 'M',
      nationalite: 'Ivoirienne',
      adresse: '56 Avenue du Nord, Korhogo',
      telephone: '+225 05 44 33 22 11',
      email: 'i.bamba@email.ci'
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
    citoyenNom: 'KOUAME',
    citoyenPrenom: 'Jean-Baptiste',
    date: '2026-01-19',
    heure: '09:00',
    duree: 45,
    statut: 'PLANIFIE'
  },
  {
    id: 'RDV-002',
    demandeId: 'DEM-2026-00002',
    citoyenNom: 'DIALLO',
    citoyenPrenom: 'Fatou',
    date: '2026-01-19',
    heure: '10:30',
    duree: 45,
    statut: 'EN_COURS'
  },
  {
    id: 'RDV-003',
    demandeId: 'DEM-2026-00003',
    citoyenNom: 'N\'GUESSAN',
    citoyenPrenom: 'Kouadio',
    date: '2026-01-19',
    heure: '14:00',
    duree: 45,
    statut: 'PLANIFIE'
  }
];
