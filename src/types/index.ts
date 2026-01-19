/**
 * Types centralisés pour le Système National d'Identité - Agent Admin
 */

// ============ AUTHENTIFICATION ============
export type AgentRole = 'AGENT_ADMIN_IDENTIFICATION' | 'SUPERVISEUR' | 'ADMIN_SYSTEME';

export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: AgentRole;
  centreId: string;
  centreNom: string;
}

export interface AuthState {
  agent: Agent | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ============ DEMANDES D'IDENTIFICATION ============
export type StatutDemande = 
  | 'EN_ATTENTE_RDV' 
  | 'RDV_CONFIRME' 
  | 'EN_COURS_INSTRUCTION' 
  | 'VERIFICATION_DOCUMENTS'
  | 'CAPTURE_BIOMETRIQUE'
  | 'EN_VALIDATION'
  | 'VALIDE'
  | 'REJETE';

export interface Demande {
  id: string;
  numeroDossier: string;
  citoyen: {
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string;
    sexe: 'M' | 'F';
    nationalite: string;
    adresse: string;
    telephone: string;
    email: string;
  };
  statut: StatutDemande;
  dateCreation: string;
  dateRendezVous: string | null;
  heureRendezVous: string | null;
  agentAssigne: string | null;
  documents: DocumentScanne[];
  checklist: ChecklistItem[];
  biometrie: BiometrieData | null;
  historique: HistoriqueModification[];
}

// ============ DOCUMENTS ============
export interface DocumentScanne {
  id: string;
  type: 'CNI' | 'PASSEPORT' | 'ACTE_NAISSANCE' | 'JUSTIFICATIF_DOMICILE' | 'PHOTO_IDENTITE';
  nom: string;
  dateNumerisation: string;
  qualite: 'EXCELLENTE' | 'BONNE' | 'ACCEPTABLE' | 'INSUFFISANTE';
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  commentaire?: string;
}

// ============ CHECKLIST ============
export interface ChecklistItem {
  id: string;
  libelle: string;
  obligatoire: boolean;
  valide: boolean;
  commentaire: string;
  dateValidation?: string;
}

// ============ BIOMETRIE ============
export interface EmpreinteDigitale {
  doigt: 'POUCE_GAUCHE' | 'INDEX_GAUCHE' | 'MAJEUR_GAUCHE' | 'ANNULAIRE_GAUCHE' | 'AURICULAIRE_GAUCHE' |
         'POUCE_DROIT' | 'INDEX_DROIT' | 'MAJEUR_DROIT' | 'ANNULAIRE_DROIT' | 'AURICULAIRE_DROIT';
  capturee: boolean;
  qualite: number; // 0-100
  timestamp?: string;
  // Données abstraites - jamais affichées
  dataHash?: string;
}

export interface CaptureIris {
  oeil: 'GAUCHE' | 'DROIT';
  capturee: boolean;
  qualite: number;
  timestamp?: string;
  dataHash?: string;
}

export interface CaptureVisage {
  capturee: boolean;
  qualite: number;
  timestamp?: string;
  dataHash?: string;
}

export interface BiometrieData {
  empreintes: EmpreinteDigitale[];
  iris: CaptureIris[];
  visage: CaptureVisage;
  dateCapture: string;
  agentCapture: string;
}

// ============ HISTORIQUE ============
export interface HistoriqueModification {
  id: string;
  date: string;
  action: string;
  agentId: string;
  agentNom: string;
  details: string;
}

// ============ PERIPHERIQUES ============
export type TypePeripherique = 'SCANNER_DOCUMENTS' | 'SCANNER_EMPREINTES' | 'SCANNER_IRIS' | 'CAMERA_VISAGE';
export type EtatPeripherique = 'CONNECTE' | 'DECONNECTE' | 'EN_COURS' | 'ERREUR';

export interface Peripherique {
  id: string;
  type: TypePeripherique;
  nom: string;
  etat: EtatPeripherique;
  derniereSynchronisation?: string;
}

// ============ LOGS ============
export type TypeLog = 'INFO' | 'ACTION' | 'WARNING' | 'ERROR' | 'BIOMETRIE' | 'DOCUMENT';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: TypeLog;
  action: string;
  details: string;
  agentId: string;
  dossierId?: string;
}

// ============ RENDEZ-VOUS ============
export interface RendezVous {
  id: string;
  demandeId: string;
  citoyenNom: string;
  citoyenPrenom: string;
  date: string;
  heure: string;
  duree: number; // en minutes
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE' | 'ABSENT';
}
