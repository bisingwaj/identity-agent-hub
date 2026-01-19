/**
 * Page Dossiers - Apple-style grid layout, non-scrolling
 */

import { useNavigate } from 'react-router-dom';
import { useDemandes } from '@/contexts/DemandesContext';
import { Demande, StatutDemande } from '@/types';
import { 
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

const DossiersPage = () => {
  const { demandes, setCurrentDemande } = useDemandes();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatutDemande | 'ALL'>('ALL');

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

  const filters: { value: StatutDemande | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'RDV_CONFIRME', label: 'RDV' },
    { value: 'EN_COURS_INSTRUCTION', label: 'En cours' },
    { value: 'VALIDE', label: 'Validés' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header with search and filters */}
      <header className="h-14 flex items-center gap-4 px-6 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-semibold">Dossiers</h1>
        
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
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
                px-3 py-1.5 rounded-md text-sm transition-colors
                ${filter === f.value 
                  ? 'bg-card text-foreground shadow-sm font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-sm text-muted-foreground">
          {filteredDemandes.length} résultat{filteredDemandes.length > 1 ? 's' : ''}
        </span>
      </header>

      {/* Grid of dossiers - fills available space */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full grid grid-cols-3 gap-4 auto-rows-fr">
          {filteredDemandes.slice(0, 9).map((demande) => {
            const statutInfo = getStatutInfo(demande.statut);
            const StatusIcon = statutInfo.icon;
            
            return (
              <button
                key={demande.id}
                onClick={() => handleOpenDossier(demande)}
                className="bg-card rounded-xl border border-border p-5 text-left hover:border-primary/30 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {demande.citoyen.prenom} {demande.citoyen.nom}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {demande.numeroDossier}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>

                <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <p>Né(e) le {new Date(demande.citoyen.dateNaissance).toLocaleDateString('fr-FR')}</p>
                  <p>{demande.citoyen.lieuNaissance}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <Badge className={`${statutInfo.color} border-0 font-normal`}>
                    <StatusIcon className="h-3 w-3 mr-1.5" />
                    {statutInfo.label}
                  </Badge>
                  {demande.dateRendezVous && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(demande.dateRendezVous).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Empty state if no results */}
          {filteredDemandes.length === 0 && (
            <div className="col-span-3 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun dossier trouvé</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DossiersPage;
