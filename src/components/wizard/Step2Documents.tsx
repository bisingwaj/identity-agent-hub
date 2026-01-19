/**
 * Étape 2 - Vérification documentaire avec scanner
 */

import { useState } from 'react';
import { Demande, DocumentScanne } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { useLogger } from '@/contexts/LoggerContext';
import { DeviceManager } from '@/services/DeviceManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  FileImage
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
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  // Vérifier état du scanner
  const scanner = DeviceManager.getDeviceByType('SCANNER_DOCUMENTS');
  const scannerConnected = scanner?.etat === 'CONNECTE';

  const handleScan = async (type: typeof documentTypes[number]['type'], label: string) => {
    setScanningType(type);
    setScanError(null);
    setScanSuccess(null);

    log('DOCUMENT', 'Début numérisation', `Scan de ${label} en cours...`, undefined, demande.id);

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
      setScanSuccess(`${label} numérisé avec succès`);
      log('DOCUMENT', 'Numérisation réussie', `${label} - Qualité: ${newDoc.qualite}`, undefined, demande.id);
    } else {
      setScanError(result.error || 'Erreur de numérisation');
      log('ERROR', 'Échec numérisation', result.error || 'Erreur inconnue', undefined, demande.id);
    }

    setScanningType(null);
  };

  const getQualiteBadge = (qualite: DocumentScanne['qualite']) => {
    const styles = {
      EXCELLENTE: 'bg-chart-2 text-primary-foreground',
      BONNE: 'bg-chart-4',
      ACCEPTABLE: 'bg-chart-5',
      INSUFFISANTE: 'bg-destructive text-destructive-foreground'
    };
    return <Badge className={styles[qualite]}>{qualite}</Badge>;
  };

  const isDocumentScanned = (type: string) => {
    return demande.documents.some(d => d.type === type);
  };

  const handleContinue = () => {
    if (demande.statut === 'RDV_CONFIRME') {
      updateStatut(demande.id, 'VERIFICATION_DOCUMENTS');
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold uppercase">Vérification documentaire</h2>
        <p className="text-muted-foreground">
          Numérisez les documents originaux présentés par le citoyen
        </p>
      </div>

      {/* État du scanner */}
      <Card className={`border-2 ${scannerConnected ? 'border-chart-2' : 'border-destructive'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 border-2 ${scannerConnected ? 'bg-chart-2 border-chart-2' : 'bg-destructive border-destructive'}`}>
                <ScanLine className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold">{scanner?.nom || 'Scanner non détecté'}</p>
                <p className="text-sm text-muted-foreground">
                  {scannerConnected ? 'Connecté et prêt' : 'Non connecté'}
                </p>
              </div>
            </div>
            <Badge className={scannerConnected ? 'bg-chart-2 text-primary-foreground' : 'bg-destructive text-destructive-foreground'}>
              {scannerConnected ? 'EN LIGNE' : 'HORS LIGNE'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {scanError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border-2 border-destructive">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm font-medium text-destructive">{scanError}</p>
        </div>
      )}

      {scanSuccess && (
        <div className="flex items-center gap-3 p-4 bg-chart-2/10 border-2 border-chart-2">
          <CheckCircle2 className="h-5 w-5 text-chart-2 flex-shrink-0" />
          <p className="text-sm font-medium">{scanSuccess}</p>
        </div>
      )}

      {/* Types de documents */}
      <Card className="border-2">
        <CardHeader className="border-b-2 border-border pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents à numériser
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map(({ type, label }) => {
              const isScanned = isDocumentScanned(type);
              const isScanning = scanningType === type;
              
              return (
                <div 
                  key={type}
                  className={`
                    p-4 border-2 transition-all
                    ${isScanned ? 'bg-chart-2/5 border-chart-2' : 'border-border'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 border-2 ${isScanned ? 'bg-chart-2 border-chart-2' : 'bg-secondary border-border'}`}>
                        <FileImage className={`h-5 w-5 ${isScanned ? 'text-primary-foreground' : ''}`} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{label}</p>
                        {isScanned && (
                          <p className="text-xs text-muted-foreground">
                            Numérisé le {new Date(demande.documents.find(d => d.type === type)!.dateNumerisation).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>

                    {isScanned ? (
                      <CheckCircle2 className="h-6 w-6 text-chart-2" />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-2"
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
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documents numérisés */}
      {demande.documents.length > 0 && (
        <Card className="border-2">
          <CardHeader className="border-b-2 border-border pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Documents numérisés
              </span>
              <Badge variant="outline" className="border-2">
                {demande.documents.length} document(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {demande.documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-secondary border-2 border-transparent"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <div>
                      <p className="font-bold text-sm">{doc.nom}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {new Date(doc.dateNumerisation).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getQualiteBadge(doc.qualite)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-secondary border-2 border-border">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          <p className="font-bold text-foreground">Important</p>
          <p>Les documents doivent être des originaux. Aucun upload manuel n'est autorisé.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" className="border-2" onClick={onBack}>
          Retour
        </Button>
        <Button
          className="border-2 shadow-xs hover:shadow-none"
          onClick={handleContinue}
          disabled={demande.documents.length === 0}
        >
          Continuer vers la checklist
        </Button>
      </div>
    </div>
  );
};

export default Step2Documents;
