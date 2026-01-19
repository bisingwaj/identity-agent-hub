/**
 * Liste des demandes avec filtres
 */

import { useState, useMemo } from 'react';
import { Demande, StatutDemande } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight,
  User
} from 'lucide-react';

interface DemandesListProps {
  demandes: Demande[];
  onOpenDossier: (demande: Demande) => void;
}

const statutLabels: Record<StatutDemande, string> = {
  EN_ATTENTE_RDV: 'En attente RDV',
  RDV_CONFIRME: 'RDV confirmé',
  EN_COURS_INSTRUCTION: 'En instruction',
  VERIFICATION_DOCUMENTS: 'Vérif. documents',
  CAPTURE_BIOMETRIQUE: 'Capture bio.',
  EN_VALIDATION: 'En validation',
  VALIDE: 'Validé',
  REJETE: 'Rejeté'
};

const getStatutStyle = (statut: StatutDemande): string => {
  const styles: Record<StatutDemande, string> = {
    EN_ATTENTE_RDV: 'bg-secondary text-secondary-foreground border-2 border-border',
    RDV_CONFIRME: 'bg-chart-1 text-primary-foreground',
    EN_COURS_INSTRUCTION: 'bg-chart-4',
    VERIFICATION_DOCUMENTS: 'bg-chart-5',
    CAPTURE_BIOMETRIQUE: 'bg-chart-2 text-primary-foreground',
    EN_VALIDATION: 'bg-chart-3 text-primary-foreground',
    VALIDE: 'bg-primary text-primary-foreground',
    REJETE: 'bg-destructive text-destructive-foreground'
  };
  return styles[statut];
};

const DemandesList = ({ demandes, onOpenDossier }: DemandesListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredDemandes = useMemo(() => {
    return demandes.filter(d => {
      // Filtre recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchNom = d.citoyen.nom.toLowerCase().includes(query);
        const matchPrenom = d.citoyen.prenom.toLowerCase().includes(query);
        const matchId = d.numeroDossier.toLowerCase().includes(query);
        if (!matchNom && !matchPrenom && !matchId) return false;
      }

      // Filtre statut
      if (statutFilter !== 'all' && d.statut !== statutFilter) return false;

      // Filtre date
      if (dateFilter && d.dateRendezVous !== dateFilter) return false;

      return true;
    });
  }, [demandes, searchQuery, statutFilter, dateFilter]);

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="border-b-2 border-border pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-lg uppercase">
            <FolderOpen className="h-5 w-5" />
            Demandes d'identification
          </CardTitle>
          <Badge variant="outline" className="border-2 font-mono">
            {filteredDemandes.length} / {demandes.length}
          </Badge>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher (nom, ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2"
            />
          </div>

          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="w-[180px] border-2">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statutLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 border-2 w-[180px]"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredDemandes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-border">
            {filteredDemandes.map((demande) => (
              <div 
                key={demande.id} 
                className="p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="p-3 border-2 border-border bg-card">
                      <User className="h-6 w-6" />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">
                          {demande.citoyen.prenom} {demande.citoyen.nom}
                        </p>
                        <Badge className={getStatutStyle(demande.statut)}>
                          {statutLabels[demande.statut]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="font-mono">{demande.numeroDossier}</span>
                        {demande.dateRendezVous && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(demande.dateRendezVous).toLocaleDateString('fr-FR')}
                            {demande.heureRendezVous && ` à ${demande.heureRendezVous}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    className="border-2 shadow-xs hover:shadow-none"
                    onClick={() => onOpenDossier(demande)}
                  >
                    Ouvrir le dossier
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DemandesList;
