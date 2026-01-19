/**
 * Page tableau de bord agent
 */

import { useNavigate } from 'react-router-dom';
import { useDemandes } from '@/contexts/DemandesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Demande } from '@/types';
import StatCard from '@/components/dashboard/StatCard';
import RendezVousList from '@/components/dashboard/RendezVousList';
import DemandesList from '@/components/dashboard/DemandesList';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const { demandes, rendezVous, setCurrentDemande, refreshDemandes } = useDemandes();
  const { agent } = useAuth();
  const navigate = useNavigate();

  // Calculer les statistiques
  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE_RDV' || d.statut === 'RDV_CONFIRME').length,
    enCours: demandes.filter(d => 
      ['EN_COURS_INSTRUCTION', 'VERIFICATION_DOCUMENTS', 'CAPTURE_BIOMETRIQUE'].includes(d.statut)
    ).length,
    valides: demandes.filter(d => d.statut === 'VALIDE').length,
    rdvAujourdhui: rendezVous.filter(r => r.date === '2026-01-19').length
  };

  const handleOpenDossier = (demande: Demande) => {
    setCurrentDemande(demande);
    navigate(`/dossier/${demande.id}`);
  };

  const handleOpenFromRdv = (demandeId: string) => {
    const demande = demandes.find(d => d.id === demandeId);
    if (demande) {
      handleOpenDossier(demande);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="border-b-2 border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue, {agent?.prenom} — {agent?.centreNom}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-2 shadow-xs hover:shadow-none"
            onClick={refreshDemandes}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total dossiers"
            value={stats.total}
            icon={<FolderOpen className="h-6 w-6" />}
            description="Demandes reçues"
          />
          <StatCard
            title="En attente"
            value={stats.enAttente}
            icon={<Clock className="h-6 w-6" />}
            description="À traiter"
            variant="warning"
          />
          <StatCard
            title="En cours"
            value={stats.enCours}
            icon={<AlertTriangle className="h-6 w-6" />}
            description="Instruction active"
            variant="primary"
          />
          <StatCard
            title="Validés"
            value={stats.valides}
            icon={<CheckCircle2 className="h-6 w-6" />}
            description="Dossiers complets"
            variant="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agenda */}
          <div className="lg:col-span-1">
            <RendezVousList 
              rendezVous={rendezVous.filter(r => r.date === '2026-01-19')} 
              onOpenDossier={handleOpenFromRdv}
            />
          </div>

          {/* Liste des demandes */}
          <div className="lg:col-span-2">
            <DemandesList 
              demandes={demandes}
              onOpenDossier={handleOpenDossier}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
