/**
 * Step 1 - Clean minimal data view
 */

import { useState } from 'react';
import { Demande } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Save, X, Clock } from 'lucide-react';

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
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'dateNaissance', label: 'Date de naissance', type: 'date' },
    { key: 'lieuNaissance', label: 'Lieu de naissance' },
    { key: 'nationalite', label: 'Nationalité' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'email', label: 'Email', type: 'email' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Données déclarées</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Informations saisies par le citoyen
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 gap-5">
          {fields.map((field) => {
            const inputType = 'type' in field ? field.type : 'text';
            return (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">
                  {field.label}
                </Label>
                {isEditing ? (
                  <Input
                    type={inputType}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [field.key]: e.target.value 
                    }))}
                  />
                ) : (
                  <p className="text-sm font-medium py-2">
                    {demande.citoyen[field.key as keyof typeof demande.citoyen]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      {demande.historique.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Historique</h3>
          </div>
          <div className="space-y-3">
            {demande.historique.slice(-3).reverse().map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">{entry.action}</span>
                  <span className="text-muted-foreground"> — {entry.details}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(entry.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-end pt-2">
        <Button onClick={onComplete}>
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default Step1Donnees;