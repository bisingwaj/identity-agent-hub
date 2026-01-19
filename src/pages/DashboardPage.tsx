/**
 * Dashboard - Apple-style minimal, non-scrolling
 */

import { useNavigate } from 'react-router-dom';
import { useDemandes } from '@/contexts/DemandesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Demande } from '@/types';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DashboardPage = () => {
  const { demandes, rendezVous, setCurrentDemande } = useDemandes();
  const { agent } = useAuth();
  const navigate = useNavigate();

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE_RDV' || d.statut === 'RDV_CONFIRME').length,
    enCours: demandes.filter(d => 
      ['EN_COURS_INSTRUCTION', 'VERIFICATION_DOCUMENTS', 'CAPTURE_BIOMETRIQUE'].includes(d.statut)
    ).length,
    valides: demandes.filter(d => d.statut === 'VALIDE').length,
  };

  const todayRdv = rendezVous.filter(r => r.date === '2026-01-19');

  const handleOpenDossier = (demande: Demande) => {
    setCurrentDemande(demande);
    navigate(`/dossier/${demande.id}`);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'RDV_CONFIRME': return 'bg-chart-1/10 text-chart-1';
      case 'EN_COURS_INSTRUCTION': return 'bg-chart-4/10 text-chart-4';
      case 'VALIDE': return 'bg-chart-2/10 text-chart-2';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Tableau de bord</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {agent?.prenom} {agent?.nom}
        </div>
      </header>

      {/* Content - Fixed layout, no scroll */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
            <StatItem icon={FolderOpen} label="Total" value={stats.total} />
            <StatItem icon={Clock} label="En attente" value={stats.enAttente} accent />
            <StatItem icon={AlertCircle} label="En cours" value={stats.enCours} />
            <StatItem icon={CheckCircle2} label="Validés" value={stats.valides} success />
          </div>

          {/* Demandes list */}
          <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
              <h2 className="font-medium">Demandes</h2>
              <span className="text-sm text-muted-foreground">{demandes.length} dossiers</span>
            </div>
            <div className="flex-1 overflow-auto scrollbar-minimal">
              {demandes.map((demande) => (
                <button
                  key={demande.id}
                  onClick={() => handleOpenDossier(demande)}
                  className="w-full flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {demande.citoyen.prenom} {demande.citoyen.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {demande.numeroDossier}
                    </p>
                  </div>
                  <Badge className={`${getStatutColor(demande.statut)} border-0 font-normal`}>
                    {demande.statut === 'RDV_CONFIRME' ? 'RDV' : 
                     demande.statut === 'EN_COURS_INSTRUCTION' ? 'En cours' :
                     demande.statut === 'VALIDE' ? 'Validé' : 'Attente'}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar - Today's appointments */}
        <div className="w-72 border-l border-border bg-card p-5 overflow-hidden flex flex-col shrink-0">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Aujourd'hui</h2>
          </div>
          
          {todayRdv.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun rendez-vous</p>
          ) : (
            <div className="flex-1 overflow-auto scrollbar-minimal space-y-2">
              {todayRdv.map((rdv) => {
                const demande = demandes.find(d => d.id === rdv.demandeId);
                return (
                  <button
                    key={rdv.id}
                    onClick={() => demande && handleOpenDossier(demande)}
                    className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <p className="text-sm font-medium">{rdv.heure}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {rdv.citoyenNom}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat item component
interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  accent?: boolean;
  success?: boolean;
}

const StatItem = ({ icon: Icon, label, value, accent, success }: StatItemProps) => (
  <div className={`
    p-4 rounded-xl border border-border
    ${accent ? 'bg-chart-4/5' : success ? 'bg-chart-2/5' : 'bg-card'}
  `}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`h-4 w-4 ${accent ? 'text-chart-4' : success ? 'text-chart-2' : 'text-muted-foreground'}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default DashboardPage;