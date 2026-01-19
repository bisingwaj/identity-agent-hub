/**
 * Step 4 - Biometrics - Clean minimal
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Fingerprint, 
  Eye, 
  Camera, 
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Step4BiometrieProps {
  demande: Demande;
  onComplete: () => void;
  onBack: () => void;
}

const FINGERS: { id: EmpreinteDigitale['doigt']; label: string; hand: 'left' | 'right' }[] = [
  { id: 'POUCE_GAUCHE', label: 'Pouce', hand: 'left' },
  { id: 'INDEX_GAUCHE', label: 'Index', hand: 'left' },
  { id: 'MAJEUR_GAUCHE', label: 'Majeur', hand: 'left' },
  { id: 'ANNULAIRE_GAUCHE', label: 'Annulaire', hand: 'left' },
  { id: 'AURICULAIRE_GAUCHE', label: 'Auriculaire', hand: 'left' },
  { id: 'POUCE_DROIT', label: 'Pouce', hand: 'right' },
  { id: 'INDEX_DROIT', label: 'Index', hand: 'right' },
  { id: 'MAJEUR_DROIT', label: 'Majeur', hand: 'right' },
  { id: 'ANNULAIRE_DROIT', label: 'Annulaire', hand: 'right' },
  { id: 'AURICULAIRE_DROIT', label: 'Auriculaire', hand: 'right' },
];

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

  const [capturing, setCapturing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleContinue = () => {
    updateBiometrie(demande.id, biometrie);
    onComplete();
  };

  const fingerprintScanner = DeviceManager.getDeviceByType('SCANNER_EMPREINTES');
  const irisScanner = DeviceManager.getDeviceByType('SCANNER_IRIS');
  const camera = DeviceManager.getDeviceByType('CAMERA_VISAGE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Capture biométrique</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Collecte des données biométriques
        </p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progression</span>
          <span className="text-sm font-medium">{progress.done}/{progress.total}</span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span><Fingerprint className="inline h-3 w-3 mr-1" />{progress.fingersDone}/10</span>
          <span><Eye className="inline h-3 w-3 mr-1" />{progress.irisDone}/2</span>
          <span><Camera className="inline h-3 w-3 mr-1" />{progress.faceDone}/1</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="empreintes" className="w-full">
        <TabsList className="grid grid-cols-3 h-10">
          <TabsTrigger value="empreintes" className="text-sm">
            <Fingerprint className="h-4 w-4 mr-2" />Empreintes
          </TabsTrigger>
          <TabsTrigger value="iris" className="text-sm">
            <Eye className="h-4 w-4 mr-2" />Iris
          </TabsTrigger>
          <TabsTrigger value="visage" className="text-sm">
            <Camera className="h-4 w-4 mr-2" />Visage
          </TabsTrigger>
        </TabsList>

        {/* Fingerprints */}
        <TabsContent value="empreintes" className="mt-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Empreintes digitales</span>
              <Badge className={fingerprintScanner?.etat === 'CONNECTE' ? 'bg-chart-2/10 text-chart-2' : 'bg-destructive/10 text-destructive'}>
                {fingerprintScanner?.etat === 'CONNECTE' ? 'Prêt' : 'Déconnecté'}
              </Badge>
            </div>
            
            {/* Left hand */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3">Main gauche</p>
              <div className="grid grid-cols-5 gap-2">
                {FINGERS.filter(f => f.hand === 'left').map((finger) => {
                  const data = biometrie.empreintes.find(e => e.doigt === finger.id);
                  const isCapturing = capturing === finger.id;
                  return (
                    <button
                      key={finger.id}
                      onClick={() => captureFingerprint(finger.id)}
                      disabled={isCapturing || fingerprintScanner?.etat !== 'CONNECTE' || data?.capturee}
                      className={`
                        p-3 rounded-lg border text-center transition-colors
                        ${data?.capturee 
                          ? 'bg-chart-2/10 border-chart-2/30' 
                          : 'border-border hover:bg-muted'
                        }
                      `}
                    >
                      {isCapturing ? (
                        <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                      ) : data?.capturee ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto text-chart-2" />
                      ) : (
                        <Fingerprint className="h-5 w-5 mx-auto text-muted-foreground" />
                      )}
                      <span className="text-xs mt-1 block">{finger.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Right hand */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">Main droite</p>
              <div className="grid grid-cols-5 gap-2">
                {FINGERS.filter(f => f.hand === 'right').map((finger) => {
                  const data = biometrie.empreintes.find(e => e.doigt === finger.id);
                  const isCapturing = capturing === finger.id;
                  return (
                    <button
                      key={finger.id}
                      onClick={() => captureFingerprint(finger.id)}
                      disabled={isCapturing || fingerprintScanner?.etat !== 'CONNECTE' || data?.capturee}
                      className={`
                        p-3 rounded-lg border text-center transition-colors
                        ${data?.capturee 
                          ? 'bg-chart-2/10 border-chart-2/30' 
                          : 'border-border hover:bg-muted'
                        }
                      `}
                    >
                      {isCapturing ? (
                        <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                      ) : data?.capturee ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto text-chart-2" />
                      ) : (
                        <Fingerprint className="h-5 w-5 mx-auto text-muted-foreground" />
                      )}
                      <span className="text-xs mt-1 block">{finger.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Iris */}
        <TabsContent value="iris" className="mt-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Capture iris</span>
              <Badge className={irisScanner?.etat === 'CONNECTE' ? 'bg-chart-2/10 text-chart-2' : 'bg-destructive/10 text-destructive'}>
                {irisScanner?.etat === 'CONNECTE' ? 'Prêt' : 'Déconnecté'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {biometrie.iris.map((iris) => {
                const isCapturing = capturing === `iris-${iris.oeil}`;
                return (
                  <button
                    key={iris.oeil}
                    onClick={() => captureIris(iris.oeil)}
                    disabled={isCapturing || irisScanner?.etat !== 'CONNECTE' || iris.capturee}
                    className={`
                      p-6 rounded-lg border text-center transition-colors
                      ${iris.capturee 
                        ? 'bg-chart-2/10 border-chart-2/30' 
                        : 'border-border hover:bg-muted'
                      }
                    `}
                  >
                    <div className="w-16 h-16 mx-auto rounded-full border-2 border-current flex items-center justify-center mb-3">
                      {isCapturing ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : iris.capturee ? (
                        <CheckCircle2 className="h-8 w-8 text-chart-2" />
                      ) : (
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="font-medium">Œil {iris.oeil.toLowerCase()}</p>
                    {iris.capturee && (
                      <p className="text-xs text-muted-foreground mt-1">Qualité: {iris.qualite}%</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Face */}
        <TabsContent value="visage" className="mt-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Capture visage</span>
              <Badge className={camera?.etat === 'CONNECTE' ? 'bg-chart-2/10 text-chart-2' : 'bg-destructive/10 text-destructive'}>
                {camera?.etat === 'CONNECTE' ? 'Prête' : 'Déconnectée'}
              </Badge>
            </div>
            <div className="flex flex-col items-center py-8">
              <div className={`
                w-32 h-40 rounded-xl border-2 flex items-center justify-center mb-4
                ${biometrie.visage.capturee ? 'bg-chart-2/10 border-chart-2/30' : 'border-border'}
              `}>
                {capturing === 'visage' ? (
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                ) : biometrie.visage.capturee ? (
                  <CheckCircle2 className="h-12 w-12 text-chart-2" />
                ) : (
                  <Camera className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              {biometrie.visage.capturee ? (
                <p className="text-sm text-muted-foreground">Qualité: {biometrie.visage.qualite}%</p>
              ) : (
                <Button
                  onClick={captureFace}
                  disabled={capturing === 'visage' || camera?.etat !== 'CONNECTE'}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capturer
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleContinue} disabled={!progress.isComplete}>
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default Step4Biometrie;