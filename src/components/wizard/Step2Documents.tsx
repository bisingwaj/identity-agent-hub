/**
 * Step 2 - Documents - Visual scan interface with preview
 */

import { useState } from 'react';
import { Demande, DocumentScanne } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { useLogger } from '@/contexts/LoggerContext';
import { DeviceManager } from '@/services/DeviceManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ScanLine, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText,
  CreditCard,
  BookOpen,
  Home,
  Camera,
  Eye,
  RotateCcw,
  X,
  Maximize2
} from 'lucide-react';

interface Step2DocumentsProps {
  demande: Demande;
  onComplete: () => void;
  onBack: () => void;
}

const documentTypes = [
  { type: 'CNI', label: 'Carte Nationale d\'Identité', icon: CreditCard, required: true },
  { type: 'PASSEPORT', label: 'Passeport', icon: BookOpen, required: false },
  { type: 'ACTE_NAISSANCE', label: 'Acte de Naissance', icon: FileText, required: true },
  { type: 'JUSTIFICATIF_DOMICILE', label: 'Justificatif de domicile', icon: Home, required: true },
  { type: 'PHOTO_IDENTITE', label: 'Photo d\'identité', icon: Camera, required: true },
] as const;

const Step2Documents = ({ demande, onComplete, onBack }: Step2DocumentsProps) => {
  const { addDocument, updateStatut } = useDemandes();
  const { log } = useLogger();
  const [scanningType, setScanningType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentScanne | null>(null);

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
      setSelectedDoc(newDoc);
      log('DOCUMENT', 'Numérisation réussie', `${label} - ${newDoc.qualite}`, undefined, demande.id);
    } else {
      setError(result.error || 'Erreur de numérisation');
    }
    setScanningType(null);
  };

  const getDocument = (type: string) => demande.documents.find(d => d.type === type);
  const isDocumentScanned = (type: string) => demande.documents.some(d => d.type === type);

  const progress = {
    scanned: demande.documents.length,
    required: documentTypes.filter(d => d.required).length,
    total: documentTypes.length,
    percentage: Math.round((demande.documents.length / documentTypes.filter(d => d.required).length) * 100)
  };

  const handleContinue = () => {
    if (demande.statut === 'RDV_CONFIRME') {
      updateStatut(demande.id, 'VERIFICATION_DOCUMENTS');
    }
    onComplete();
  };

  const getQualityColor = (qualite: DocumentScanne['qualite']) => {
    switch (qualite) {
      case 'EXCELLENTE': return 'text-chart-2';
      case 'BONNE': return 'text-chart-1';
      case 'ACCEPTABLE': return 'text-chart-4';
      case 'INSUFFISANTE': return 'text-destructive';
    }
  };

  const getQualityPercent = (qualite: DocumentScanne['qualite']) => {
    switch (qualite) {
      case 'EXCELLENTE': return 95;
      case 'BONNE': return 80;
      case 'ACCEPTABLE': return 65;
      case 'INSUFFISANTE': return 40;
    }
  };

  const requiredScanned = documentTypes
    .filter(d => d.required)
    .filter(d => isDocumentScanned(d.type)).length;
  const canContinue = requiredScanned >= 3; // At least 3 required docs

  return (
    <div className="h-full flex flex-col">
      {/* Header with progress */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Vérification documentaire</h2>
            <p className="text-sm text-muted-foreground">Numérisez les documents originaux</p>
          </div>
          <Badge className={scannerConnected ? 'bg-chart-2/10 text-chart-2 border-0' : 'bg-destructive/10 text-destructive border-0'}>
            {scannerConnected ? 'Scanner prêt' : 'Scanner déconnecté'}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={Math.min(progress.percentage, 100)} className="h-1.5 flex-1" />
          <span className="text-sm text-muted-foreground">{progress.scanned}/{progress.required} requis</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="shrink-0 mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-destructive/70 hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main content: 2 columns */}
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
        
        {/* Left: Document list */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden">
            <div className="h-10 px-4 flex items-center border-b border-border shrink-0">
              <span className="text-sm font-medium">Documents à numériser</span>
            </div>
            <div className="overflow-auto scrollbar-minimal">
              {documentTypes.map(({ type, label, icon: Icon, required }) => {
                const isScanned = isDocumentScanned(type);
                const isScanning = scanningType === type;
                const doc = getDocument(type);
                const isSelected = selectedDoc?.type === type;
                
                return (
                  <div 
                    key={type} 
                    className={`
                      flex items-center gap-3 p-3 border-b border-border last:border-0 transition-colors
                      ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}
                      ${isScanned ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => isScanned && doc && setSelectedDoc(doc)}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                      ${isScanned ? 'bg-chart-2/10' : 'bg-muted'}
                    `}>
                      {isScanning ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : isScanned ? (
                        <CheckCircle2 className="h-5 w-5 text-chart-2" />
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{label}</p>
                        {required && !isScanned && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">Requis</Badge>
                        )}
                      </div>
                      {isScanned && doc && (
                        <p className={`text-xs ${getQualityColor(doc.qualite)}`}>
                          Qualité: {doc.qualite}
                        </p>
                      )}
                    </div>
                    
                    {!isScanned && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleScan(type, label); }}
                        disabled={!scannerConnected || isScanning}
                        className="shrink-0"
                      >
                        {isScanning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ScanLine className="h-4 w-4 mr-1" />
                            Scan
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick scan all button */}
          <div className="mt-3 shrink-0">
            <Button 
              variant="outline" 
              className="w-full"
              disabled={!scannerConnected || scanningType !== null}
            >
              <ScanLine className="h-4 w-4 mr-2" />
              Scanner tous les documents manquants
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="h-10 px-4 flex items-center justify-between border-b border-border shrink-0">
            <span className="text-sm font-medium">Prévisualisation</span>
            {selectedDoc && (
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <div className="flex-1 p-4 flex flex-col">
            {scanningType ? (
              /* Scanning animation */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-32 h-40 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse" 
                         style={{ animation: 'scan 2s ease-in-out infinite' }} />
                    <ScanLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <p className="text-sm font-medium">Numérisation en cours...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {documentTypes.find(d => d.type === scanningType)?.label}
                  </p>
                </div>
              </div>
            ) : selectedDoc ? (
              /* Document preview */
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Simulated document preview */}
                  <div className="w-48 h-64 bg-card rounded-lg border border-border shadow-lg flex flex-col p-4 relative">
                    <div className="absolute top-2 right-2">
                      <Maximize2 className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    
                    {/* Document header */}
                    <div className="h-4 w-3/4 bg-muted rounded mb-3" />
                    
                    {/* Document icon */}
                    <div className="flex-1 flex items-center justify-center">
                      {documentTypes.find(d => d.type === selectedDoc.type)?.icon && (
                        (() => {
                          const DocIcon = documentTypes.find(d => d.type === selectedDoc.type)!.icon;
                          return <DocIcon className="h-16 w-16 text-muted-foreground/30" />;
                        })()
                      )}
                    </div>
                    
                    {/* Document lines */}
                    <div className="space-y-2 mt-auto">
                      <div className="h-2 w-full bg-muted rounded" />
                      <div className="h-2 w-4/5 bg-muted rounded" />
                      <div className="h-2 w-3/5 bg-muted rounded" />
                    </div>
                  </div>
                  
                  {/* Quality overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Qualité du scan</span>
                      <span className={`text-sm font-semibold ${getQualityColor(selectedDoc.qualite)}`}>
                        {selectedDoc.qualite}
                      </span>
                    </div>
                    <Progress value={getQualityPercent(selectedDoc.qualite)} className="h-1.5" />
                  </div>
                </div>

                {/* Document info */}
                <div className="mt-4 space-y-3 shrink-0">
                  <div>
                    <p className="text-sm font-medium">{selectedDoc.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      Numérisé le {new Date(selectedDoc.dateNumerisation).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <RotateCcw className="h-3 w-3" />
                      Rescanner
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un document</p>
                  <p className="text-xs mt-1">ou scannez un nouveau document</p>
                </div>
              </div>
            )}

            {/* Scanned documents grid */}
            {!scanningType && demande.documents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border shrink-0">
                <p className="text-xs text-muted-foreground mb-2">Documents numérisés</p>
                <div className="flex gap-2 flex-wrap">
                  {demande.documents.map((doc) => {
                    const docType = documentTypes.find(d => d.type === doc.type);
                    const DocIcon = docType?.icon || FileText;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                          ${selectedDoc?.id === doc.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-chart-2/10 hover:bg-chart-2/20'}
                        `}
                      >
                        <DocIcon className="h-5 w-5 text-chart-2" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 shrink-0">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {requiredScanned >= 3 ? (
              <span className="text-chart-2">✓ Minimum requis atteint</span>
            ) : (
              `${3 - requiredScanned} document(s) requis manquant(s)`
            )}
          </span>
          <Button onClick={handleContinue} disabled={!canContinue}>
            Continuer
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 4px); }
        }
      `}</style>
    </div>
  );
};

export default Step2Documents;
