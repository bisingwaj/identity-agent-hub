/**
 * Step 2 - Documents - Clean minimal
 */

import { useState } from 'react';
import { Demande, DocumentScanne } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { useLogger } from '@/contexts/LoggerContext';
import { DeviceManager } from '@/services/DeviceManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ScanLine, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';

interface Step2DocumentsProps {
  demande: Demande;
  onComplete: () => void;
  onBack: () => void;
}

const documentTypes = [
  { type: 'CNI', label: 'Carte Nationale d\'Identité' },
  { type: 'PASSEPORT', label: 'Passeport' },
  { type: 'ACTE_NAISSANCE', label: 'Acte de Naissance' },
  { type: 'JUSTIFICATIF_DOMICILE', label: 'Justificatif de domicile' },
  { type: 'PHOTO_IDENTITE', label: 'Photo d\'identité' },
] as const;

const Step2Documents = ({ demande, onComplete, onBack }: Step2DocumentsProps) => {
  const { addDocument, updateStatut } = useDemandes();
  const { log } = useLogger();
  const [scanningType, setScanningType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanner = DeviceManager.getDeviceByType('SCANNER_DOCUMENTS');
  const scannerConnected = scanner?.etat === 'CONNECTE';

  const handleScan = async (type: typeof documentTypes[number]['type'], label: string) => {
    setScanningType(type);
    setError(null);
    log('DOCUMENT', 'Début numérisation', `Scan de ${label}`, undefined, demande.id);

    const result = await DeviceManager.scanDocument();

    if (result.success && result.data) {
      const newDoc: DocumentScanne = {
        id: `DOC-${Date.now()}`,
        type,
        nom: label,
        dateNumerisation: result.data.timestamp,
        qualite: result.data.quality >= 90 ? 'EXCELLENTE' : 
                 result.data.quality >= 75 ? 'BONNE' : 
                 result.data.quality >= 60 ? 'ACCEPTABLE' : 'INSUFFISANTE',
        statut: 'EN_ATTENTE'
      };
      addDocument(demande.id, newDoc);
      log('DOCUMENT', 'Numérisation réussie', `${label} - ${newDoc.qualite}`, undefined, demande.id);
    } else {
      setError(result.error || 'Erreur de numérisation');
    }
    setScanningType(null);
  };

  const isDocumentScanned = (type: string) => demande.documents.some(d => d.type === type);

  const handleContinue = () => {
    if (demande.statut === 'RDV_CONFIRME') {
      updateStatut(demande.id, 'VERIFICATION_DOCUMENTS');
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Vérification documentaire</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Numérisez les documents originaux
          </p>
        </div>
        <Badge className={scannerConnected ? 'bg-chart-2/10 text-chart-2' : 'bg-destructive/10 text-destructive'}>
          {scannerConnected ? 'Scanner connecté' : 'Scanner déconnecté'}
        </Badge>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Document list */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {documentTypes.map(({ type, label }) => {
          const isScanned = isDocumentScanned(type);
          const isScanning = scanningType === type;
          const doc = demande.documents.find(d => d.type === type);
          
          return (
            <div key={type} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isScanned ? 'bg-chart-2/10' : 'bg-muted'}`}>
                  {isScanned ? (
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  {isScanned && doc && (
                    <p className="text-xs text-muted-foreground">
                      Qualité: {doc.qualite}
                    </p>
                  )}
                </div>
              </div>
              
              {!isScanned && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleScan(type, label)}
                  disabled={!scannerConnected || isScanning}
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4 mr-2" />
                      Scanner
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 inline mr-2" />
        Documents originaux uniquement. Aucun upload manuel autorisé.
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleContinue} disabled={demande.documents.length === 0}>
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default Step2Documents;