/**
 * Step 4 - Biometrics - Visual preview with real-time capture display
 */

import { useState, useMemo } from 'react';
import { Demande, EmpreinteDigitale, BiometrieData } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLogger } from '@/contexts/LoggerContext';
import { DeviceManager } from '@/services/DeviceManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Fingerprint, 
  Eye, 
  Camera, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  Hand,
  Scan,
  RotateCcw
} from 'lucide-react';

interface Step4BiometrieProps {
  demande: Demande;
  onComplete: () => void;
  onBack: () => void;
}

const FINGERS: { id: EmpreinteDigitale['doigt']; label: string; short: string; hand: 'left' | 'right'; position: number }[] = [
  { id: 'POUCE_GAUCHE', label: 'Pouce gauche', short: 'Pouce', hand: 'left', position: 0 },
  { id: 'INDEX_GAUCHE', label: 'Index gauche', short: 'Index', hand: 'left', position: 1 },
  { id: 'MAJEUR_GAUCHE', label: 'Majeur gauche', short: 'Majeur', hand: 'left', position: 2 },
  { id: 'ANNULAIRE_GAUCHE', label: 'Annulaire gauche', short: 'Annul.', hand: 'left', position: 3 },
  { id: 'AURICULAIRE_GAUCHE', label: 'Auriculaire gauche', short: 'Auric.', hand: 'left', position: 4 },
  { id: 'POUCE_DROIT', label: 'Pouce droit', short: 'Pouce', hand: 'right', position: 0 },
  { id: 'INDEX_DROIT', label: 'Index droit', short: 'Index', hand: 'right', position: 1 },
  { id: 'MAJEUR_DROIT', label: 'Majeur droit', short: 'Majeur', hand: 'right', position: 2 },
  { id: 'ANNULAIRE_DROIT', label: 'Annulaire droit', short: 'Annul.', hand: 'right', position: 3 },
  { id: 'AURICULAIRE_DROIT', label: 'Auriculaire droit', short: 'Auric.', hand: 'right', position: 4 },
];

type CaptureType = 'fingerprint' | 'iris' | 'face';

const Step4Biometrie = ({ demande, onComplete, onBack }: Step4BiometrieProps) => {
  const { updateBiometrie } = useDemandes();
  const { agent } = useAuth();
  const { log } = useLogger();

  const [biometrie, setBiometrie] = useState<BiometrieData>(() => 
    demande.biometrie || {
      empreintes: FINGERS.map(f => ({ doigt: f.id, capturee: false, qualite: 0 })),
      iris: [
        { oeil: 'GAUCHE', capturee: false, qualite: 0 },
        { oeil: 'DROIT', capturee: false, qualite: 0 }
      ],
      visage: { capturee: false, qualite: 0 },
      dateCapture: new Date().toISOString().split('T')[0],
      agentCapture: agent?.id || ''
    }
  );

  const [activeTab, setActiveTab] = useState<CaptureType>('fingerprint');
  const [capturing, setCapturing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFinger, setSelectedFinger] = useState<EmpreinteDigitale['doigt'] | null>(null);
  const [selectedEye, setSelectedEye] = useState<'GAUCHE' | 'DROIT' | null>(null);

  const progress = useMemo(() => {
    const fingersDone = biometrie.empreintes.filter(e => e.capturee).length;
    const irisDone = biometrie.iris.filter(i => i.capturee).length;
    const faceDone = biometrie.visage.capturee ? 1 : 0;
    const total = 13;
    const done = fingersDone + irisDone + faceDone;
    return {
      fingersDone, irisDone, faceDone,
      total, done,
      percentage: Math.round((done / total) * 100),
      isComplete: done === total
    };
  }, [biometrie]);

  const captureFingerprint = async (fingerId: EmpreinteDigitale['doigt']) => {
    setCapturing(fingerId);
    setSelectedFinger(fingerId);
    setError(null);
    log('BIOMETRIE', 'Capture empreinte', fingerId, agent?.id, demande.id);
    const result = await DeviceManager.captureFingerprint(fingerId);
    if (result.success && result.data) {
      setBiometrie(prev => ({
        ...prev,
        empreintes: prev.empreintes.map(e => 
          e.doigt === fingerId 
            ? { ...e, capturee: true, qualite: result.data!.quality, timestamp: result.data!.timestamp, dataHash: result.data!.hash }
            : e
        )
      }));
    } else {
      setError(result.error || 'Erreur de capture');
    }
    setCapturing(null);
  };

  const captureIris = async (eye: 'GAUCHE' | 'DROIT') => {
    setCapturing(`iris-${eye}`);
    setSelectedEye(eye);
    setError(null);
    const result = await DeviceManager.captureIris(eye);
    if (result.success && result.data) {
      setBiometrie(prev => ({
        ...prev,
        iris: prev.iris.map(i => 
          i.oeil === eye 
            ? { ...i, capturee: true, qualite: result.data!.quality, timestamp: result.data!.timestamp, dataHash: result.data!.hash }
            : i
        )
      }));
    } else {
      setError(result.error || 'Erreur de capture');
    }
    setCapturing(null);
  };

  const captureFace = async () => {
    setCapturing('visage');
    setError(null);
    const result = await DeviceManager.captureFace();
    if (result.success && result.data) {
      setBiometrie(prev => ({
        ...prev,
        visage: { capturee: true, qualite: result.data!.quality, timestamp: result.data!.timestamp, dataHash: result.data!.hash }
      }));
    } else {
      setError(result.error || 'Erreur de capture');
    }
    setCapturing(null);
  };

  const resetCapture = (type: 'finger' | 'iris' | 'face', id?: string) => {
    if (type === 'finger' && id) {
      setBiometrie(prev => ({
        ...prev,
        empreintes: prev.empreintes.map(e => 
          e.doigt === id ? { ...e, capturee: false, qualite: 0 } : e
        )
      }));
    } else if (type === 'iris' && id) {
      setBiometrie(prev => ({
        ...prev,
        iris: prev.iris.map(i => 
          i.oeil === id ? { ...i, capturee: false, qualite: 0 } : i
        )
      }));
    } else if (type === 'face') {
      setBiometrie(prev => ({
        ...prev,
        visage: { capturee: false, qualite: 0 }
      }));
    }
  };

  const handleContinue = () => {
    updateBiometrie(demande.id, biometrie);
    onComplete();
  };

  const fingerprintScanner = DeviceManager.getDeviceByType('SCANNER_EMPREINTES');
  const irisScanner = DeviceManager.getDeviceByType('SCANNER_IRIS');
  const camera = DeviceManager.getDeviceByType('CAMERA_VISAGE');

  const tabs = [
    { id: 'fingerprint' as CaptureType, label: 'Empreintes', icon: Fingerprint, count: `${progress.fingersDone}/10` },
    { id: 'iris' as CaptureType, label: 'Iris', icon: Eye, count: `${progress.irisDone}/2` },
    { id: 'face' as CaptureType, label: 'Visage', icon: Camera, count: `${progress.faceDone}/1` },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header with progress */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Capture biométrique</h2>
            <p className="text-sm text-muted-foreground">Collecte des données biométriques</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-semibold">{progress.percentage}%</span>
            <p className="text-xs text-muted-foreground">{progress.done}/{progress.total} captures</p>
          </div>
        </div>
        <Progress value={progress.percentage} className="h-1.5" />
      </div>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-destructive/70 hover:text-destructive">×</button>
        </div>
      )}

      {/* Main content: 2 columns */}
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
        
        {/* Left: Controls */}
        <div className="flex flex-col overflow-hidden">
          {/* Tab buttons */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-card text-foreground shadow-sm font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{tab.count}</Badge>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto scrollbar-minimal">
            {/* Fingerprints */}
            {activeTab === 'fingerprint' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scanner d'empreintes</span>
                  <Badge className={fingerprintScanner?.etat === 'CONNECTE' ? 'bg-chart-2/10 text-chart-2 border-0' : 'bg-destructive/10 text-destructive border-0'}>
                    {fingerprintScanner?.etat === 'CONNECTE' ? 'Connecté' : 'Déconnecté'}
                  </Badge>
                </div>

                {/* Left hand */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hand className="h-4 w-4 text-muted-foreground transform scale-x-[-1]" />
                    <span className="text-sm font-medium">Main gauche</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {FINGERS.filter(f => f.hand === 'left').map((finger) => {
                      const data = biometrie.empreintes.find(e => e.doigt === finger.id);
                      const isCapturing = capturing === finger.id;
                      const isSelected = selectedFinger === finger.id;
                      return (
                        <button
                          key={finger.id}
                          onClick={() => data?.capturee ? setSelectedFinger(finger.id) : captureFingerprint(finger.id)}
                          disabled={isCapturing || fingerprintScanner?.etat !== 'CONNECTE'}
                          className={`
                            relative p-2.5 rounded-lg border text-center transition-all
                            ${isSelected ? 'ring-2 ring-primary' : ''}
                            ${data?.capturee 
                              ? 'bg-chart-2/10 border-chart-2/30' 
                              : 'border-border hover:bg-muted hover:border-primary/30'
                            }
                          `}
                        >
                          {isCapturing ? (
                            <Loader2 className="h-5 w-5 mx-auto animate-spin text-primary" />
                          ) : data?.capturee ? (
                            <CheckCircle2 className="h-5 w-5 mx-auto text-chart-2" />
                          ) : (
                            <Fingerprint className="h-5 w-5 mx-auto text-muted-foreground" />
                          )}
                          <span className="text-[10px] mt-1 block text-muted-foreground">{finger.short}</span>
                          {data?.capturee && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-chart-2 rounded-full text-[8px] text-primary-foreground flex items-center justify-center font-medium">
                              {data.qualite}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right hand */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hand className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Main droite</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {FINGERS.filter(f => f.hand === 'right').map((finger) => {
                      const data = biometrie.empreintes.find(e => e.doigt === finger.id);
                      const isCapturing = capturing === finger.id;
                      const isSelected = selectedFinger === finger.id;
                      return (
                        <button
                          key={finger.id}
                          onClick={() => data?.capturee ? setSelectedFinger(finger.id) : captureFingerprint(finger.id)}
                          disabled={isCapturing || fingerprintScanner?.etat !== 'CONNECTE'}
                          className={`
                            relative p-2.5 rounded-lg border text-center transition-all
                            ${isSelected ? 'ring-2 ring-primary' : ''}
                            ${data?.capturee 
                              ? 'bg-chart-2/10 border-chart-2/30' 
                              : 'border-border hover:bg-muted hover:border-primary/30'
                            }
                          `}
                        >
                          {isCapturing ? (
                            <Loader2 className="h-5 w-5 mx-auto animate-spin text-primary" />
                          ) : data?.capturee ? (
                            <CheckCircle2 className="h-5 w-5 mx-auto text-chart-2" />
                          ) : (
                            <Fingerprint className="h-5 w-5 mx-auto text-muted-foreground" />
                          )}
                          <span className="text-[10px] mt-1 block text-muted-foreground">{finger.short}</span>
                          {data?.capturee && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-chart-2 rounded-full text-[8px] text-primary-foreground flex items-center justify-center font-medium">
                              {data.qualite}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Iris */}
            {activeTab === 'iris' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scanner d'iris</span>
                  <Badge className={irisScanner?.etat === 'CONNECTE' ? 'bg-chart-2/10 text-chart-2 border-0' : 'bg-destructive/10 text-destructive border-0'}>
                    {irisScanner?.etat === 'CONNECTE' ? 'Connecté' : 'Déconnecté'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {biometrie.iris.map((iris) => {
                    const isCapturing = capturing === `iris-${iris.oeil}`;
                    const isSelected = selectedEye === iris.oeil;
                    return (
                      <button
                        key={iris.oeil}
                        onClick={() => iris.capturee ? setSelectedEye(iris.oeil) : captureIris(iris.oeil)}
                        disabled={isCapturing || irisScanner?.etat !== 'CONNECTE'}
                        className={`
                          relative bg-card rounded-xl border p-6 text-center transition-all
                          ${isSelected ? 'ring-2 ring-primary' : ''}
                          ${iris.capturee 
                            ? 'border-chart-2/30 bg-chart-2/5' 
                            : 'border-border hover:bg-muted hover:border-primary/30'
                          }
                        `}
                      >
                        <div className={`
                          w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center mb-3
                          ${iris.capturee ? 'border-chart-2 bg-chart-2/10' : 'border-muted-foreground/30'}
                        `}>
                          {isCapturing ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                          ) : iris.capturee ? (
                            <div className="relative">
                              <Eye className="h-10 w-10 text-chart-2" />
                              <CheckCircle2 className="absolute -bottom-1 -right-1 h-5 w-5 text-chart-2 bg-card rounded-full" />
                            </div>
                          ) : (
                            <Eye className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <p className="font-medium">Œil {iris.oeil.toLowerCase()}</p>
                        {iris.capturee && (
                          <p className="text-xs text-chart-2 mt-1">Qualité: {iris.qualite}%</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Face */}
            {activeTab === 'face' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Caméra visage</span>
                  <Badge className={camera?.etat === 'CONNECTE' ? 'bg-chart-2/10 text-chart-2 border-0' : 'bg-destructive/10 text-destructive border-0'}>
                    {camera?.etat === 'CONNECTE' ? 'Connectée' : 'Déconnectée'}
                  </Badge>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center">
                  <div className={`
                    w-32 h-40 rounded-2xl border-2 flex items-center justify-center mb-4
                    ${biometrie.visage.capturee ? 'border-chart-2 bg-chart-2/10' : 'border-muted-foreground/30'}
                  `}>
                    {capturing === 'visage' ? (
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    ) : biometrie.visage.capturee ? (
                      <div className="relative">
                        <Camera className="h-12 w-12 text-chart-2" />
                        <CheckCircle2 className="absolute -bottom-1 -right-1 h-6 w-6 text-chart-2 bg-card rounded-full" />
                      </div>
                    ) : (
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  {biometrie.visage.capturee ? (
                    <p className="text-sm text-chart-2">Qualité: {biometrie.visage.qualite}%</p>
                  ) : (
                    <Button
                      onClick={captureFace}
                      disabled={capturing === 'visage' || camera?.etat !== 'CONNECTE'}
                      className="gap-2"
                    >
                      <Scan className="h-4 w-4" />
                      Capturer le visage
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="h-10 px-4 flex items-center justify-between border-b border-border shrink-0">
            <span className="text-sm font-medium">Prévisualisation</span>
            <Badge variant="outline" className="text-[10px]">Temps réel</Badge>
          </div>
          
          <div className="flex-1 p-4 flex flex-col">
            {/* Preview area */}
            <div className="flex-1 bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
              {capturing ? (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Capture en cours...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {capturing.startsWith('iris') ? 'Scanner iris actif' : 
                     capturing === 'visage' ? 'Caméra active' : 'Scanner empreintes actif'}
                  </p>
                </div>
              ) : activeTab === 'fingerprint' && selectedFinger ? (
                <FingerprintPreview 
                  finger={FINGERS.find(f => f.id === selectedFinger)!}
                  data={biometrie.empreintes.find(e => e.doigt === selectedFinger)}
                  onReset={() => resetCapture('finger', selectedFinger)}
                  onRecapture={() => captureFingerprint(selectedFinger)}
                  disabled={fingerprintScanner?.etat !== 'CONNECTE'}
                />
              ) : activeTab === 'iris' && selectedEye ? (
                <IrisPreview 
                  eye={selectedEye}
                  data={biometrie.iris.find(i => i.oeil === selectedEye)}
                  onReset={() => resetCapture('iris', selectedEye)}
                  onRecapture={() => captureIris(selectedEye)}
                  disabled={irisScanner?.etat !== 'CONNECTE'}
                />
              ) : activeTab === 'face' && biometrie.visage.capturee ? (
                <FacePreview 
                  data={biometrie.visage}
                  onReset={() => resetCapture('face')}
                  onRecapture={captureFace}
                  disabled={camera?.etat !== 'CONNECTE'}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Scan className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un élément à capturer</p>
                  <p className="text-xs mt-1">ou cliquez pour scanner</p>
                </div>
              )}
            </div>

            {/* Captured items grid */}
            <div className="mt-4 shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Éléments capturés</p>
              <div className="flex gap-2 flex-wrap">
                {biometrie.empreintes.filter(e => e.capturee).slice(0, 5).map((e) => (
                  <div 
                    key={e.doigt} 
                    className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center cursor-pointer hover:bg-chart-2/20 transition-colors"
                    onClick={() => { setActiveTab('fingerprint'); setSelectedFinger(e.doigt); }}
                  >
                    <Fingerprint className="h-4 w-4 text-chart-2" />
                  </div>
                ))}
                {biometrie.empreintes.filter(e => e.capturee).length > 5 && (
                  <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center text-[10px] font-medium text-chart-2">
                    +{biometrie.empreintes.filter(e => e.capturee).length - 5}
                  </div>
                )}
                {biometrie.iris.filter(i => i.capturee).map((i) => (
                  <div 
                    key={i.oeil} 
                    className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center cursor-pointer hover:bg-chart-1/20 transition-colors"
                    onClick={() => { setActiveTab('iris'); setSelectedEye(i.oeil); }}
                  >
                    <Eye className="h-4 w-4 text-chart-1" />
                  </div>
                ))}
                {biometrie.visage.capturee && (
                  <div 
                    className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center cursor-pointer hover:bg-chart-3/20 transition-colors"
                    onClick={() => setActiveTab('face')}
                  >
                    <Camera className="h-4 w-4 text-chart-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-between pt-4 shrink-0">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleContinue} disabled={!progress.isComplete}>
          Continuer
          {!progress.isComplete && <span className="ml-2 text-xs opacity-70">({progress.done}/{progress.total})</span>}
        </Button>
      </div>
    </div>
  );
};

// Preview components
interface FingerprintPreviewProps {
  finger: typeof FINGERS[0];
  data?: { capturee: boolean; qualite: number };
  onReset: () => void;
  onRecapture: () => void;
  disabled: boolean;
}

const FingerprintPreview = ({ finger, data, onReset, onRecapture, disabled }: FingerprintPreviewProps) => (
  <div className="text-center p-6">
    {/* Simulated fingerprint visual */}
    <div className="w-32 h-40 mx-auto mb-4 rounded-2xl bg-gradient-to-b from-muted to-muted/50 border border-border flex items-center justify-center relative overflow-hidden">
      {data?.capturee ? (
        <>
          {/* Fingerprint pattern simulation */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute border border-foreground/30 rounded-full"
                style={{
                  width: `${20 + i * 8}px`,
                  height: `${30 + i * 10}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
          <Fingerprint className="h-16 w-16 text-chart-2 relative z-10" />
        </>
      ) : (
        <Fingerprint className="h-16 w-16 text-muted-foreground" />
      )}
    </div>
    
    <h3 className="font-medium">{finger.label}</h3>
    {data?.capturee && (
      <>
        <p className="text-sm text-chart-2 mt-1">Qualité: {data.qualite}%</p>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1">
            <RotateCcw className="h-3 w-3" />
            Supprimer
          </Button>
          <Button size="sm" onClick={onRecapture} disabled={disabled} className="gap-1">
            <Scan className="h-3 w-3" />
            Recapturer
          </Button>
        </div>
      </>
    )}
  </div>
);

interface IrisPreviewProps {
  eye: 'GAUCHE' | 'DROIT';
  data?: { capturee: boolean; qualite: number };
  onReset: () => void;
  onRecapture: () => void;
  disabled: boolean;
}

const IrisPreview = ({ eye, data, onReset, onRecapture, disabled }: IrisPreviewProps) => (
  <div className="text-center p-6">
    {/* Simulated iris visual */}
    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-b from-muted to-muted/50 border border-border flex items-center justify-center relative overflow-hidden">
      {data?.capturee ? (
        <>
          {/* Iris pattern simulation */}
          <div className="absolute inset-4 rounded-full bg-chart-1/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-foreground/80" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Eye className="h-8 w-8 text-chart-1 opacity-50" />
          </div>
        </>
      ) : (
        <Eye className="h-16 w-16 text-muted-foreground" />
      )}
    </div>
    
    <h3 className="font-medium">Œil {eye.toLowerCase()}</h3>
    {data?.capturee && (
      <>
        <p className="text-sm text-chart-1 mt-1">Qualité: {data.qualite}%</p>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1">
            <RotateCcw className="h-3 w-3" />
            Supprimer
          </Button>
          <Button size="sm" onClick={onRecapture} disabled={disabled} className="gap-1">
            <Scan className="h-3 w-3" />
            Recapturer
          </Button>
        </div>
      </>
    )}
  </div>
);

interface FacePreviewProps {
  data: { capturee: boolean; qualite: number };
  onReset: () => void;
  onRecapture: () => void;
  disabled: boolean;
}

const FacePreview = ({ data, onReset, onRecapture, disabled }: FacePreviewProps) => (
  <div className="text-center p-6">
    {/* Simulated face visual */}
    <div className="w-32 h-40 mx-auto mb-4 rounded-2xl bg-gradient-to-b from-muted to-muted/50 border border-border flex items-center justify-center relative overflow-hidden">
      {data.capturee ? (
        <>
          {/* Face outline simulation */}
          <div className="absolute top-6 w-20 h-24 rounded-full border-2 border-foreground/20" />
          <div className="absolute top-20 w-8 h-4 rounded-full bg-foreground/10" />
          <Camera className="h-12 w-12 text-chart-3 relative z-10" />
        </>
      ) : (
        <Camera className="h-16 w-16 text-muted-foreground" />
      )}
    </div>
    
    <h3 className="font-medium">Photo d'identité</h3>
    {data.capturee && (
      <>
        <p className="text-sm text-chart-3 mt-1">Qualité: {data.qualite}%</p>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1">
            <RotateCcw className="h-3 w-3" />
            Supprimer
          </Button>
          <Button size="sm" onClick={onRecapture} disabled={disabled} className="gap-1">
            <Scan className="h-3 w-3" />
            Recapturer
          </Button>
        </div>
      </>
    )}
  </div>
);

export default Step4Biometrie;
