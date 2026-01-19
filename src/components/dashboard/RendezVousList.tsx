/**
 * Liste des rendez-vous du jour
 */

import { RendezVous } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

interface RendezVousListProps {
  rendezVous: RendezVous[];
  onOpenDossier: (demandeId: string) => void;
}

const RendezVousList = ({ rendezVous, onOpenDossier }: RendezVousListProps) => {
  const getStatutBadge = (statut: RendezVous['statut']) => {
    const styles = {
      PLANIFIE: 'bg-secondary text-secondary-foreground border-2',
      EN_COURS: 'bg-chart-2 text-primary-foreground',
      TERMINE: 'bg-chart-3 text-primary-foreground',
      ANNULE: 'bg-destructive text-destructive-foreground',
      ABSENT: 'bg-chart-4 text-foreground'
    };

    const labels = {
      PLANIFIE: 'Planifié',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
      ANNULE: 'Annulé',
      ABSENT: 'Absent'
    };

    return (
      <Badge className={styles[statut]}>
        {labels[statut]}
      </Badge>
    );
  };

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="border-b-2 border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg uppercase">
            <Calendar className="h-5 w-5" />
            Agenda du jour
          </CardTitle>
          <Badge variant="outline" className="border-2">
            {rendezVous.length} RDV
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rendezVous.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun rendez-vous prévu aujourd'hui</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-border">
            {rendezVous.map((rdv) => (
              <div key={rdv.id} className="p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Heure */}
                    <div className="text-center border-2 border-border bg-secondary p-2 min-w-[60px]">
                      <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-bold font-mono">{rdv.heure}</p>
                    </div>

                    {/* Citoyen */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 border-2 border-border bg-card">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">
                          {rdv.citoyenPrenom} {rdv.citoyenNom}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {rdv.demandeId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatutBadge(rdv.statut)}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 shadow-2xs hover:shadow-none"
                      onClick={() => onOpenDossier(rdv.demandeId)}
                    >
                      Ouvrir
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RendezVousList;
