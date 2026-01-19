/**
 * Dashboard - Apple-style balanced grid, non-scrolling
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
  Calendar,
  User,
  ArrowUpRight
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

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'RDV_CONFIRME': return 'RDV';
      case 'EN_COURS_INSTRUCTION': return 'En cours';
      case 'VALIDE': return 'Validé';
      default: return 'Attente';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-semibold">Tableau de bord</h1>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-medium">
              {agent?.prenom?.charAt(0)}{agent?.nom?.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{agent?.prenom} {agent?.nom}</span>
        </div>
      </header>

      {/* Main grid - 2 rows, balanced */}
      <div className="flex-1 p-6 grid grid-rows-[auto_1fr] gap-6 overflow-hidden">
        
        {/* Row 1: Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={FolderOpen} label="Total dossiers" value={stats.total} />
          <StatCard icon={Clock} label="En attente" value={stats.enAttente} variant="warning" />
          <StatCard icon={AlertCircle} label="En cours" value={stats.enCours} variant="info" />
          <StatCard icon={CheckCircle2} label="Validés" value={stats.valides} variant="success" />
        </div>

        {/* Row 2: Two equal columns */}
        <div className="grid grid-cols-2 gap-6 overflow-hidden">
          
          {/* Left: Recent dossiers */}
          <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
            <div className="h-12 px-5 flex items-center justify-between border-b border-border shrink-0">
              <h2 className="font-medium">Dossiers récents</h2>
              <button 
                onClick={() => navigate('/dossiers')}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Voir tout
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {demandes.slice(0, 5).map((demande, index) => (
                <button
                  key={demande.id}
                  onClick={() => handleOpenDossier(demande)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors text-left"
                  style={{ height: 'calc(100% / 5)' }}
                >
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {demande.citoyen.prenom} {demande.citoyen.nom}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {demande.numeroDossier}
                    </p>
                  </div>
                  <Badge className={`${getStatutColor(demande.statut)} border-0 text-xs`}>
                    {getStatutLabel(demande.statut)}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Today's schedule */}
          <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
            <div className="h-12 px-5 flex items-center justify-between border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-medium">Agenda du jour</h2>
              </div>
              <Badge variant="outline" className="text-xs">
                {todayRdv.length} RDV
              </Badge>
            </div>
            <div className="flex-1 overflow-hidden">
              {todayRdv.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun rendez-vous</p>
                  </div>
                </div>
              ) : (
                todayRdv.slice(0, 5).map((rdv) => {
                  const demande = demandes.find(d => d.id === rdv.demandeId);
                  return (
                    <button
                      key={rdv.id}
                      onClick={() => demande && handleOpenDossier(demande)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors text-left"
                      style={{ height: 'calc(100% / 5)' }}
                    >
                      <div className="h-9 w-9 rounded-lg bg-chart-1/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-chart-1">{rdv.heure.split(':')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {rdv.citoyenPrenom} {rdv.citoyenNom}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rdv.heure} • {rdv.duree} min
                        </p>
                      </div>
                      <Badge className={`
                        border-0 text-xs
                        ${rdv.statut === 'EN_COURS' ? 'bg-chart-2/10 text-chart-2' : 
                          rdv.statut === 'TERMINE' ? 'bg-muted text-muted-foreground' : 
                          'bg-chart-1/10 text-chart-1'}
                      `}>
                        {rdv.statut === 'EN_COURS' ? 'En cours' : 
                         rdv.statut === 'TERMINE' ? 'Terminé' : 'Planifié'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat card component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  variant?: 'default' | 'warning' | 'info' | 'success';
}

const StatCard = ({ icon: Icon, label, value, variant = 'default' }: StatCardProps) => {
  const variants = {
    default: { bg: 'bg-card', iconBg: 'bg-muted', iconColor: 'text-muted-foreground' },
    warning: { bg: 'bg-chart-4/5', iconBg: 'bg-chart-4/10', iconColor: 'text-chart-4' },
    info: { bg: 'bg-chart-1/5', iconBg: 'bg-chart-1/10', iconColor: 'text-chart-1' },
    success: { bg: 'bg-chart-2/5', iconBg: 'bg-chart-2/10', iconColor: 'text-chart-2' },
  };
  const v = variants[variant];

  return (
    <div className={`${v.bg} rounded-xl border border-border p-4 flex items-center gap-4`}>
      <div className={`h-11 w-11 rounded-lg ${v.iconBg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${v.iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default DashboardPage;