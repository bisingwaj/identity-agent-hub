/**
 * Étape 1 - Données déclarées par le citoyen
 */

import { useState } from 'react';
import { Demande } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Edit2, 
  Save, 
  X,
  History 
} from 'lucide-react';

interface Step1DonneesProps {
  demande: Demande;
  onComplete: () => void;
}

const Step1Donnees = ({ demande, onComplete }: Step1DonneesProps) => {
  const { updateDemandeData } = useDemandes();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(demande.citoyen);

  const handleSave = () => {
    updateDemandeData(demande.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(demande.citoyen);
    setIsEditing(false);
  };

  const fields = [
    { key: 'nom', label: 'Nom', icon: User },
    { key: 'prenom', label: 'Prénom', icon: User },
    { key: 'dateNaissance', label: 'Date de naissance', icon: Calendar, type: 'date' },
    { key: 'lieuNaissance', label: 'Lieu de naissance', icon: MapPin },
    { key: 'nationalite', label: 'Nationalité', icon: MapPin },
    { key: 'adresse', label: 'Adresse', icon: MapPin },
    { key: 'telephone', label: 'Téléphone', icon: Phone },
    { key: 'email', label: 'Email', icon: Mail, type: 'email' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase">Données déclarées</h2>
          <p className="text-muted-foreground">
            Informations saisies par le citoyen lors de sa demande
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                className="border-2"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                className="border-2 shadow-xs hover:shadow-none"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="border-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Formulaire */}
      <Card className="border-2">
        <CardHeader className="border-b-2 border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Identité du demandeur
            </CardTitle>
            <Badge variant="outline" className="border-2">
              Sexe: {demande.citoyen.sexe === 'M' ? 'Masculin' : 'Féminin'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(({ key, label, icon: Icon, type }) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Icon className="h-3 w-3" />
                  {label}
                </Label>
                {isEditing ? (
                  <Input
                    type={'type' in { key, label, icon, ...('type' in arguments ? { type } : {}) } ? (arguments as any).type || 'text' : 'text'}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [key]: e.target.value 
                    }))}
                    className="border-2"
                  />
                ) : (
                  <p className="font-medium p-3 bg-secondary border-2 border-transparent">
                    {demande.citoyen[key as keyof typeof demande.citoyen]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historique des modifications */}
      <Card className="border-2">
        <CardHeader className="border-b-2 border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5" />
            Historique des modifications
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {demande.historique.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune modification enregistrée
            </p>
          ) : (
            <div className="space-y-3">
              {demande.historique.slice(-5).reverse().map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-start gap-3 p-3 bg-secondary border-2 border-transparent"
                >
                  <div className="w-2 h-2 mt-2 bg-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{entry.action}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(entry.date).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Par: {entry.agentNom}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-end">
        <Button
          className="border-2 shadow-xs hover:shadow-none"
          onClick={onComplete}
        >
          Continuer vers la vérification documentaire
        </Button>
      </div>
    </div>
  );
};

export default Step1Donnees;
