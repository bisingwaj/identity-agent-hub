/**
 * Étape 4 - Capture biométrique complète
 */

import { useState, useMemo } from 'react';
import { Demande, EmpreinteDigitale, CaptureIris, CaptureVisage, BiometrieData } from '@/types';
import { useDemandes } from '@/contexts/DemandesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLogger } from '@/contexts/LoggerContext';
import { DeviceManager } from '@/services/DeviceManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Fingerprint, 
  Eye, 
  Camera, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertCircle,
  Hand
} from 'lucide-react';

interface Step4BiometrieProps {
  demande: Demande;
  onComplete: () => void;
  onBack: () => void;
}

// Configuration des doigts
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

  // État local de la biométrie
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

  // Calcul de progression
  const progress = useMemo(() => {
    const fingersDone = biometrie.empreintes.filter(e => e.capturee).length;
    const irisDone = biometrie.iris.filter(i => i.capturee).length;
    const faceDone = biometrie.visage.capturee ? 1 : 0;

    const total = 10 + 2 + 1; // 10 doigts + 2 iris + 1 visage
    const done = fingersDone + irisDone + faceDone;

    return {
      fingersDone,
      irisDone,
      faceDone,
      total,
      done,
      percentage: Math.round((done / total) * 100),
      isComplete: done === total
    };
  }, [biometrie]);

  // Capture empreinte
  const captureFingerprint = async (fingerId: EmpreinteDigitale['doigt']) => {
    setCapturing(fingerId);
    setError(null);

    log('BIOMETRIE', 'Capture empreinte', `Capture de ${fingerId} en cours...`, agent?.id, demande.id);

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
      log('BIOMETRIE', 'Empreinte capturée', `${fingerId} - Qualité: ${result.data.quality}%`, agent?.id, demande.id);
    } else {
      setError(result.error || 'Erreur de capture');
      log('ERROR', 'Échec capture empreinte', result.error || '', agent?.id, demande.id);
    }

    setCapturing(null);
  };

  // Capture iris
  const captureIris = async (eye: 'GAUCHE' | 'DROIT') => {
    setCapturing(`iris-${eye}`);
    setError(null);

    log('BIOMETRIE', 'Capture iris', `Capture œil ${eye} en cours...`, agent?.id, demande.id);

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
      log('BIOMETRIE', 'Iris capturé', `Œil ${eye} - Qualité: ${result.data.quality}%`, agent?.id, demande.id);
    } else {
      setError(result.error || 'Erreur de capture');
      log('ERROR', 'Échec capture iris', result.error || '', agent?.id, demande.id);
    }

    setCapturing(null);
  };

  // Capture visage
  const captureFace = async () => {
    setCapturing('visage');
    setError(null);

    log('BIOMETRIE', 'Capture visage', 'Capture en cours...', agent?.id, demande.id);

    const result = await DeviceManager.captureFace();

    if (result.success && result.data) {
      setBiometrie(prev => ({
        ...prev,
        visage: { 
          capturee: true, 
          qualite: result.data!.quality, 
          timestamp: result.data!.timestamp, 
          dataHash: result.data!.hash 
        }
      }));
      log('BIOMETRIE', 'Visage capturé', `Qualité: ${result.data.quality}%`, agent?.id, demande.id);
    } else {
      setError(result.error || 'Erreur de capture');
      log('ERROR', 'Échec capture visage', result.error || '', agent?.id, demande.id);
    }

    setCapturing(null);
  };

  // Sauvegarde et continuation
  const handleContinue = () => {
    updateBiometrie(demande.id, biometrie);
    onComplete();
  };

  // État des périphériques
  const fingerprintScanner = DeviceManager.getDeviceByType('SCANNER_EMPREINTES');
  const irisScanner = DeviceManager.getDeviceByType('SCANNER_IRIS');
  const camera = DeviceManager.getDeviceByType('CAMERA_VISAGE');

  // Qualité badge
  const getQualityBadge = (quality: number) => {
    if (quality >= 90) return <Badge className="bg-chart-2 text-primary-foreground">{quality}%</Badge>;
    if (quality >= 75) return <Badge className="bg-chart-4">{quality}%</Badge>;
    if (quality >= 60) return <Badge className="bg-chart-5">{quality}%</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">{quality}%</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold uppercase">Capture biométrique</h2>
        <p className="text-muted-foreground">
          Collectez les données biométriques du demandeur
        </p>
      </div>

      {/* Progression globale */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold uppercase">Progression totale</span>
            <span className="font-mono font-bold">{progress.done}/{progress.total}</span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
          <div className="flex items-center gap-6 mt-3 text-sm">
            <span><Fingerprint className="inline h-4 w-4 mr-1" />{progress.fingersDone}/10 empreintes</span>
            <span><Eye className="inline h-4 w-4 mr-1" />{progress.irisDone}/2 iris</span>
            <span><Camera className="inline h-4 w-4 mr-1" />{progress.faceDone}/1 visage</span>
          </div>
        </CardContent>
      </Card>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border-2 border-destructive">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Tabs de capture */}
      <Tabs defaultValue="empreintes" className="w-full">
        <TabsList className="grid grid-cols-3 border-2 p-1 h-auto">
          <TabsTrigger value="empreintes" className="border-2 border-transparent data-[state=active]:border-border data-[state=active]:shadow-xs">
            <Fingerprint className="h-4 w-4 mr-2" />
            Empreintes
          </TabsTrigger>
          <TabsTrigger value="iris" className="border-2 border-transparent data-[state=active]:border-border data-[state=active]:shadow-xs">
            <Eye className="h-4 w-4 mr-2" />
            Iris
          </TabsTrigger>
          <TabsTrigger value="visage" className="border-2 border-transparent data-[state=active]:border-border data-[state=active]:shadow-xs">
            <Camera className="h-4 w-4 mr-2" />
            Visage
          </TabsTrigger>
        </TabsList>

        {/* Tab Empreintes */}
        <TabsContent value="empreintes">
          <Card className="border-2 mt-4">
            <CardHeader className="border-b-2 border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Empreintes digitales
                </CardTitle>
                <Badge className={fingerprintScanner?.etat === 'CONNECTE' ? 'bg-chart-2 text-primary-foreground' : 'bg-destructive text-destructive-foreground'}>
                  {fingerprintScanner?.etat === 'CONNECTE' ? 'Scanner prêt' : 'Scanner non connecté'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Main gauche */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Hand className="h-5 w-5 transform -scale-x-100" />
                  <span className="font-bold uppercase text-sm">Main gauche</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {FINGERS.filter(f => f.hand === 'left').map((finger) => {
                    const data = biometrie.empreintes.find(e => e.doigt === finger.id);
                    const isCapturing = capturing === finger.id;
                    
                    return (
                      <div 
                        key={finger.id}
                        className={`
                          p-4 border-2 text-center transition-all
                          ${data?.capturee ? 'bg-chart-2/5 border-chart-2' : 'border-border'}
                        `}
                      >
                        <div className={`
                          w-10 h-14 mx-auto mb-2 border-2 flex items-center justify-center
                          ${data?.capturee ? 'bg-chart-2 border-chart-2' : 'bg-secondary border-border'}
                        `}>
                          {data?.capturee ? (
                            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <Fingerprint className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs font-bold mb-2">{finger.label}</p>
                        {data?.capturee ? (
                          getQualityBadge(data.qualite)
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 text-xs px-2"
                            onClick={() => captureFingerprint(finger.id)}
                            disabled={isCapturing || fingerprintScanner?.etat !== 'CONNECTE'}
                          >
                            {isCapturing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Capturer'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main droite */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Hand className="h-5 w-5" />
                  <span className="font-bold uppercase text-sm">Main droite</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {FINGERS.filter(f => f.hand === 'right').map((finger) => {
                    const data = biometrie.empreintes.find(e => e.doigt === finger.id);
                    const isCapturing = capturing === finger.id;
                    
                    return (
                      <div 
                        key={finger.id}
                        className={`
                          p-4 border-2 text-center transition-all
                          ${data?.capturee ? 'bg-chart-2/5 border-chart-2' : 'border-border'}
                        `}
                      >
                        <div className={`
                          w-10 h-14 mx-auto mb-2 border-2 flex items-center justify-center
                          ${data?.capturee ? 'bg-chart-2 border-chart-2' : 'bg-secondary border-border'}
                        `}>
                          {data?.capturee ? (
                            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <Fingerprint className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs font-bold mb-2">{finger.label}</p>
                        {data?.capturee ? (
                          getQualityBadge(data.qualite)
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 text-xs px-2"
                            onClick={() => captureFingerprint(finger.id)}
                            disabled={isCapturing || fingerprintScanner?.etat !== 'CONNECTE'}
                          >
                            {isCapturing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Capturer'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Iris */}
        <TabsContent value="iris">
          <Card className="border-2 mt-4">
            <CardHeader className="border-b-2 border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Capture de l'iris
                </CardTitle>
                <Badge className={irisScanner?.etat === 'CONNECTE' ? 'bg-chart-2 text-primary-foreground' : 'bg-destructive text-destructive-foreground'}>
                  {irisScanner?.etat === 'CONNECTE' ? 'Scanner prêt' : 'Scanner non connecté'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                {biometrie.iris.map((iris) => {
                  const isCapturing = capturing === `iris-${iris.oeil}`;
                  
                  return (
                    <div 
                      key={iris.oeil}
                      className={`
                        p-6 border-2 text-center transition-all
                        ${iris.capturee ? 'bg-chart-2/5 border-chart-2' : 'border-border'}
                      `}
                    >
                      <div className={`
                        w-24 h-24 mx-auto mb-4 border-2 rounded-full flex items-center justify-center
                        ${iris.capturee ? 'bg-chart-2 border-chart-2' : 'bg-secondary border-border'}
                      `}>
                        {iris.capturee ? (
                          <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
                        ) : (
                          <Eye className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-bold mb-3">Œil {iris.oeil.toLowerCase()}</p>
                      {iris.capturee ? (
                        <div className="space-y-2">
                          {getQualityBadge(iris.qualite)}
                          <p className="text-xs text-muted-foreground font-mono">
                            {iris.timestamp && new Date(iris.timestamp).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="border-2"
                          onClick={() => captureIris(iris.oeil)}
                          disabled={isCapturing || irisScanner?.etat !== 'CONNECTE'}
                        >
                          {isCapturing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          Démarrer capture
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Visage */}
        <TabsContent value="visage">
          <Card className="border-2 mt-4">
            <CardHeader className="border-b-2 border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Capture du visage
                </CardTitle>
                <Badge className={camera?.etat === 'CONNECTE' ? 'bg-chart-2 text-primary-foreground' : 'bg-destructive text-destructive-foreground'}>
                  {camera?.etat === 'CONNECTE' ? 'Caméra prête' : 'Caméra non connectée'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className={`
                max-w-md mx-auto p-8 border-2 text-center transition-all
                ${biometrie.visage.capturee ? 'bg-chart-2/5 border-chart-2' : 'border-border'}
              `}>
                <div className={`
                  w-40 h-48 mx-auto mb-6 border-2 flex items-center justify-center
                  ${biometrie.visage.capturee ? 'bg-chart-2 border-chart-2' : 'bg-secondary border-border'}
                `}>
                  {biometrie.visage.capturee ? (
                    <CheckCircle2 className="h-16 w-16 text-primary-foreground" />
                  ) : (
                    <Camera className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <p className="font-bold text-lg mb-4">Photo d'identité biométrique</p>
                {biometrie.visage.capturee ? (
                  <div className="space-y-2">
                    {getQualityBadge(biometrie.visage.qualite)}
                    <p className="text-sm text-muted-foreground font-mono">
                      Capturé à {biometrie.visage.timestamp && new Date(biometrie.visage.timestamp).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                ) : (
                  <Button
                    className="border-2 shadow-xs hover:shadow-none"
                    onClick={captureFace}
                    disabled={capturing === 'visage' || camera?.etat !== 'CONNECTE'}
                  >
                    {capturing === 'visage' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    Démarrer capture
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info sécurité */}
      <div className="flex items-start gap-3 p-4 bg-secondary border-2 border-border">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          <p className="font-bold text-foreground">Données sécurisées</p>
          <p>Les données biométriques sont stockées sous forme abstraite et ne sont jamais affichées en clair.</p>
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
          disabled={!progress.isComplete}
        >
          Continuer vers la synthèse
        </Button>
      </div>
    </div>
  );
};

export default Step4Biometrie;
