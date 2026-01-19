/**
 * Page Dossiers - Enhanced with table view and more features
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemandes } from '@/contexts/DemandesContext';
import { Demande, StatutDemande } from '@/types';
import { 
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Grid3X3,
  List,
  Filter,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'list';

const DossiersPage = () => {
  const { demandes, setCurrentDemande } = useDemandes();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatutDemande | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDossier, setSelectedDossier] = useState<Demande | null>(null);

  const filteredDemandes = useMemo(() => {
    return demandes.filter(d => {
      const matchSearch = search === '' || 
        d.citoyen.nom.toLowerCase().includes(search.toLowerCase()) ||
        d.citoyen.prenom.toLowerCase().includes(search.toLowerCase()) ||
        d.numeroDossier.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || d.statut === filter;
      return matchSearch && matchFilter;
    });
  }, [demandes, search, filter]);

  // Stats
  const stats = useMemo(() => ({
    total: demandes.length,
    rdv: demandes.filter(d => d.statut === 'RDV_CONFIRME').length,
    enCours: demandes.filter(d => ['EN_COURS_INSTRUCTION', 'VERIFICATION_DOCUMENTS', 'CAPTURE_BIOMETRIQUE'].includes(d.statut)).length,
    valides: demandes.filter(d => d.statut === 'VALIDE').length,
  }), [demandes]);

  const handleOpenDossier = (demande: Demande) => {
    setCurrentDemande(demande);
    navigate(`/dossier/${demande.id}`);
  };

  const getStatutInfo = (statut: StatutDemande) => {
    const config: Record<StatutDemande, { label: string; color: string; icon: React.ElementType }> = {
      'EN_ATTENTE_RDV': { label: 'Attente RDV', color: 'bg-muted text-muted-foreground', icon: Clock },
      'RDV_CONFIRME': { label: 'RDV Confirmé', color: 'bg-chart-1/10 text-chart-1', icon: Clock },
      'EN_COURS_INSTRUCTION': { label: 'En cours', color: 'bg-chart-4/10 text-chart-4', icon: AlertCircle },
      'VERIFICATION_DOCUMENTS': { label: 'Vérification', color: 'bg-chart-3/10 text-chart-3', icon: FileText },
      'CAPTURE_BIOMETRIQUE': { label: 'Biométrie', color: 'bg-chart-1/10 text-chart-1', icon: AlertCircle },
      'EN_VALIDATION': { label: 'Validation', color: 'bg-chart-4/10 text-chart-4', icon: Clock },
      'VALIDE': { label: 'Validé', color: 'bg-chart-2/10 text-chart-2', icon: CheckCircle2 },
      'REJETE': { label: 'Rejeté', color: 'bg-destructive/10 text-destructive', icon: AlertCircle },
    };
    return config[statut];
  };

  const filters: { value: StatutDemande | 'ALL'; label: string; count?: number }[] = [
    { value: 'ALL', label: 'Tous', count: stats.total },
    { value: 'RDV_CONFIRME', label: 'RDV', count: stats.rdv },
    { value: 'EN_COURS_INSTRUCTION', label: 'En cours', count: stats.enCours },
    { value: 'VALIDE', label: 'Validés', count: stats.valides },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center gap-4 px-6 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-semibold">Dossiers</h1>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou numéro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-0"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`
                px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5
                ${filter === f.value 
                  ? 'bg-card text-foreground shadow-sm font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {f.label}
              {f.count !== undefined && (
                <span className={`text-[10px] ${filter === f.value ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <span className="text-sm text-muted-foreground">
          {filteredDemandes.length} résultat{filteredDemandes.length > 1 ? 's' : ''}
        </span>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dossiers list/grid */}
        <div className="flex-1 p-6 overflow-auto scrollbar-minimal">
          {viewMode === 'grid' ? (
            /* Grid view */
            <div className="grid grid-cols-3 gap-4">
              {filteredDemandes.map((demande) => {
                const statutInfo = getStatutInfo(demande.statut);
                const StatusIcon = statutInfo.icon;
                
                return (
                  <button
                    key={demande.id}
                    onClick={() => setSelectedDossier(demande)}
                    onDoubleClick={() => handleOpenDossier(demande)}
                    className={`
                      bg-card rounded-xl border p-5 text-left transition-all flex flex-col
                      ${selectedDossier?.id === demande.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/30 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {demande.citoyen.prenom} {demande.citoyen.nom}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {demande.numeroDossier}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>

                    <div className="flex-1 text-xs text-muted-foreground space-y-1">
                      <p>Né(e) le {new Date(demande.citoyen.dateNaissance).toLocaleDateString('fr-FR')}</p>
                      <p>{demande.citoyen.lieuNaissance}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <Badge className={`${statutInfo.color} border-0 text-[10px]`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statutInfo.label}
                      </Badge>
                      {demande.dateRendezVous && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(demande.dateRendezVous).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* List view */
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Citoyen</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">N° Dossier</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date naissance</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">RDV</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Statut</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemandes.map((demande) => {
                    const statutInfo = getStatutInfo(demande.statut);
                    return (
                      <tr 
                        key={demande.id}
                        onClick={() => setSelectedDossier(demande)}
                        onDoubleClick={() => handleOpenDossier(demande)}
                        className={`
                          border-b border-border last:border-0 cursor-pointer transition-colors
                          ${selectedDossier?.id === demande.id ? 'bg-primary/5' : 'hover:bg-muted/30'}
                        `}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{demande.citoyen.prenom} {demande.citoyen.nom}</p>
                              <p className="text-[10px] text-muted-foreground">{demande.citoyen.lieuNaissance}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-mono">{demande.numeroDossier}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{new Date(demande.citoyen.dateNaissance).toLocaleDateString('fr-FR')}</span>
                        </td>
                        <td className="p-3">
                          {demande.dateRendezVous ? (
                            <span className="text-sm">{new Date(demande.dateRendezVous).toLocaleDateString('fr-FR')}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge className={`${statutInfo.color} border-0 text-[10px]`}>
                            {statutInfo.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {filteredDemandes.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun dossier trouvé</p>
                <p className="text-sm">Modifiez vos critères de recherche</p>
              </div>
            </div>
          )}
        </div>

        {/* Details sidebar */}
        {selectedDossier && (
          <div className="w-80 border-l border-border bg-card p-5 overflow-auto scrollbar-minimal shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Détails</h3>
              <Button size="sm" onClick={() => handleOpenDossier(selectedDossier)}>
                Ouvrir
              </Button>
            </div>

            {/* Citizen info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {selectedDossier.citoyen.prenom.charAt(0)}{selectedDossier.citoyen.nom.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold">
                  {selectedDossier.citoyen.prenom} {selectedDossier.citoyen.nom}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {selectedDossier.numeroDossier}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <Badge className={`${getStatutInfo(selectedDossier.statut).color} border-0`}>
                {getStatutInfo(selectedDossier.statut).label}
              </Badge>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedDossier.citoyen.telephone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{selectedDossier.citoyen.email}</span>
              </div>
            </div>

            {/* Personal info */}
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Né(e) le</span>
                  <p className="font-medium">{new Date(selectedDossier.citoyen.dateNaissance).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Lieu</span>
                  <p className="font-medium">{selectedDossier.citoyen.lieuNaissance}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sexe</span>
                  <p className="font-medium">{selectedDossier.citoyen.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nationalité</span>
                  <p className="font-medium">{selectedDossier.citoyen.nationalite}</p>
                </div>
              </div>
            </div>

            {/* RDV */}
            {selectedDossier.dateRendezVous && (
              <div className="bg-chart-1/10 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-chart-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Rendez-vous</span>
                </div>
                <p className="text-sm">
                  {new Date(selectedDossier.dateRendezVous).toLocaleDateString('fr-FR', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
                {selectedDossier.heureRendezVous && (
                  <p className="text-xs text-muted-foreground">à {selectedDossier.heureRendezVous}</p>
                )}
              </div>
            )}

            {/* Documents count */}
            <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Documents</span>
              <span className="font-medium">{selectedDossier.documents.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DossiersPage;
