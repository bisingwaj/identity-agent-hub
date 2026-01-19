/**
 * Dashboard - Enhanced with agent stats, RDV details panel, and more features
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemandes } from '@/contexts/DemandesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Demande, RendezVous } from '@/types';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Calendar,
  User,
  ArrowUpRight,
  TrendingUp,
  Award,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  Play,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const DashboardPage = () => {
  const { demandes, rendezVous, setCurrentDemande } = useDemandes();
  const { agent } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);

  // Stats calculations
  const stats = useMemo(() => {
    const total = demandes.length;
    const enAttente = demandes.filter(d => d.statut === 'EN_ATTENTE_RDV' || d.statut === 'RDV_CONFIRME').length;
    const enCours = demandes.filter(d => 
      ['EN_COURS_INSTRUCTION', 'VERIFICATION_DOCUMENTS', 'CAPTURE_BIOMETRIQUE'].includes(d.statut)
    ).length;
    const valides = demandes.filter(d => d.statut === 'VALIDE').length;
    const rejetes = demandes.filter(d => d.statut === 'REJETE').length;

    // Agent specific stats
    const agentDossiers = demandes.filter(d => d.agentAssigne === agent?.id);
    const agentValides = agentDossiers.filter(d => d.statut === 'VALIDE').length;
    const agentEnCours = agentDossiers.filter(d => 
      ['EN_COURS_INSTRUCTION', 'VERIFICATION_DOCUMENTS', 'CAPTURE_BIOMETRIQUE'].includes(d.statut)
    ).length;

    // Today's stats (simulated - in real app would use actual dates)
    const todayProcessed = 3; // Mock value
    const weekProcessed = 12; // Mock value
    const avgProcessingTime = 28; // Minutes

    return {
      total, enAttente, enCours, valides, rejetes,
      agentValides, agentEnCours, agentTotal: agentDossiers.length,
      todayProcessed, weekProcessed, avgProcessingTime,
      successRate: total > 0 ? Math.round((valides / total) * 100) : 0
    };
  }, [demandes, agent]);

  const todayRdv = rendezVous.filter(r => r.date === '2026-01-19');

  const handleOpenDossier = (demande: Demande) => {
    setCurrentDemande(demande);
    navigate(`/dossier/${demande.id}`);
  };

  const handleRdvClick = (rdv: RendezVous) => {
    setSelectedRdv(rdv);
  };

  const handleStartRdv = (rdv: RendezVous) => {
    const demande = demandes.find(d => d.id === rdv.demandeId);
    if (demande) {
      handleOpenDossier(demande);
    }
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

  const getRdvStatutColor = (statut: RendezVous['statut']) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-chart-2/10 text-chart-2';
      case 'TERMINE': return 'bg-muted text-muted-foreground';
      case 'ABSENT': return 'bg-destructive/10 text-destructive';
      default: return 'bg-chart-1/10 text-chart-1';
    }
  };

  const selectedDemande = selectedRdv 
    ? demandes.find(d => d.id === selectedRdv.demandeId) 
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-semibold">Tableau de bord</h1>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-sm font-medium">{agent?.prenom} {agent?.nom}</p>
            <p className="text-xs text-muted-foreground">{agent?.centreNom}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {agent?.prenom?.charAt(0)}{agent?.nom?.charAt(0)}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-6 grid grid-cols-3 gap-6 overflow-hidden">
        
        {/* Column 1: Stats + Recent */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Global stats */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <StatCard icon={FolderOpen} label="Total" value={stats.total} />
            <StatCard icon={Clock} label="En attente" value={stats.enAttente} variant="warning" />
            <StatCard icon={AlertCircle} label="En cours" value={stats.enCours} variant="info" />
            <StatCard icon={CheckCircle2} label="Validés" value={stats.valides} variant="success" />
          </div>

          {/* Recent dossiers */}
          <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
            <div className="h-10 px-4 flex items-center justify-between border-b border-border shrink-0">
              <h2 className="text-sm font-medium">Dossiers récents</h2>
              <button 
                onClick={() => navigate('/dossiers')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Voir tout <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1 overflow-auto scrollbar-minimal">
              {demandes.slice(0, 6).map((demande) => (
                <button
                  key={demande.id}
                  onClick={() => handleOpenDossier(demande)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {demande.citoyen.prenom} {demande.citoyen.nom}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {demande.numeroDossier}
                    </p>
                  </div>
                  <Badge className={`${getStatutColor(demande.statut)} border-0 text-[10px]`}>
                    {getStatutLabel(demande.statut)}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Agent stats + Agenda */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Agent performance */}
          <div className="bg-card rounded-xl border border-border p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-chart-4" />
              <h2 className="text-sm font-medium">Mes performances</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-semibold text-chart-4">{stats.todayProcessed}</p>
                <p className="text-[10px] text-muted-foreground">Aujourd'hui</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-semibold text-chart-1">{stats.weekProcessed}</p>
                <p className="text-[10px] text-muted-foreground">Cette semaine</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-semibold text-chart-2">{stats.agentValides}</p>
                <p className="text-[10px] text-muted-foreground">Total validés</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Taux de réussite</span>
                <span className="font-medium">{stats.successRate}%</span>
              </div>
              <Progress value={stats.successRate} className="h-1.5" />
            </div>
          </div>

          {/* Today's agenda */}
          <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
            <div className="h-10 px-4 flex items-center justify-between border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium">Agenda du jour</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {todayRdv.length} RDV
              </Badge>
            </div>
            <div className="flex-1 overflow-auto scrollbar-minimal">
              {todayRdv.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Aucun rendez-vous</p>
                  </div>
                </div>
              ) : (
                todayRdv.map((rdv) => (
                  <button
                    key={rdv.id}
                    onClick={() => handleRdvClick(rdv)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 
                      hover:bg-muted/30 transition-colors text-left
                      ${selectedRdv?.id === rdv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                    `}
                  >
                    <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-chart-1">{rdv.heure.split(':')[0]}</span>
                      <span className="text-[8px] text-chart-1">{rdv.heure.split(':')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {rdv.citoyenPrenom} {rdv.citoyenNom}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Durée: {rdv.duree} min
                      </p>
                    </div>
                    <Badge className={`${getRdvStatutColor(rdv.statut)} border-0 text-[10px]`}>
                      {rdv.statut === 'EN_COURS' ? 'En cours' : 
                       rdv.statut === 'TERMINE' ? 'Terminé' : 
                       rdv.statut === 'ABSENT' ? 'Absent' : 'Planifié'}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 3: RDV Details / Quick actions */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {selectedRdv && selectedDemande ? (
            /* RDV Details Panel */
            <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
              <div className="h-10 px-4 flex items-center justify-between border-b border-border shrink-0">
                <h2 className="text-sm font-medium">Détails du rendez-vous</h2>
                <button 
                  onClick={() => setSelectedRdv(null)}
                  className="p-1 hover:bg-muted rounded-md"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto scrollbar-minimal p-4">
                {/* Citizen info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {selectedDemande.citoyen.prenom.charAt(0)}{selectedDemande.citoyen.nom.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {selectedDemande.citoyen.prenom} {selectedDemande.citoyen.nom}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedDemande.numeroDossier}
                    </p>
                  </div>
                </div>

                {/* RDV time */}
                <div className="bg-chart-1/10 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-chart-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{selectedRdv.heure}</span>
                    <span className="text-xs">• {selectedRdv.duree} minutes</span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedDemande.citoyen.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedDemande.citoyen.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{selectedDemande.citoyen.adresse}</span>
                  </div>
                </div>

                {/* Personal info */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Informations personnelles</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Né(e) le:</span>
                      <p className="font-medium">{new Date(selectedDemande.citoyen.dateNaissance).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lieu:</span>
                      <p className="font-medium">{selectedDemande.citoyen.lieuNaissance}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sexe:</span>
                      <p className="font-medium">{selectedDemande.citoyen.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nationalité:</span>
                      <p className="font-medium">{selectedDemande.citoyen.nationalite}</p>
                    </div>
                  </div>
                </div>

                {/* Dossier status */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Statut du dossier</p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatutColor(selectedDemande.statut)} border-0`}>
                      {getStatutLabel(selectedDemande.statut)}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{selectedDemande.documents.length} documents</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-border shrink-0 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setCurrentDemande(selectedDemande);
                    navigate(`/dossier/${selectedDemande.id}`);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir dossier
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleStartRdv(selectedRdv)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer
                </Button>
              </div>
            </div>
          ) : (
            /* Quick Stats when no RDV selected */
            <>
              <div className="bg-card rounded-xl border border-border p-4 shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <h2 className="text-sm font-medium">Statistiques globales</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Dossiers validés</span>
                    <span className="text-sm font-semibold text-chart-2">{stats.valides}</span>
                  </div>
                  <Progress value={(stats.valides / stats.total) * 100} className="h-1.5" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Temps moyen de traitement</span>
                    <span className="text-sm font-semibold">{stats.avgProcessingTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">En attente de RDV</span>
                    <span className="text-sm font-semibold text-chart-4">{stats.enAttente}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-muted/30 rounded-xl border border-dashed border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground p-6">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Sélectionnez un rendez-vous</p>
                  <p className="text-xs mt-1">
                    Cliquez sur un RDV dans l'agenda pour voir les détails du citoyen
                  </p>
                </div>
              </div>
            </>
          )}
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
    <div className={`${v.bg} rounded-xl border border-border p-3 flex items-center gap-3`}>
      <div className={`h-9 w-9 rounded-lg ${v.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${v.iconColor}`} />
      </div>
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
