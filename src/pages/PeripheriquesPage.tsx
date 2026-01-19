/**
 * Page de gestion des périphériques
 */

import { useState, useEffect } from 'react';
import { DeviceManager, DeviceStatus } from '@/services/DeviceManager';
import { Peripherique, TypePeripherique } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  ScanLine, 
  Fingerprint, 
  Eye, 
  Camera,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

const iconMap: Record<TypePeripherique, React.ElementType> = {
  SCANNER_DOCUMENTS: ScanLine,
  SCANNER_EMPREINTES: Fingerprint,
  SCANNER_IRIS: Eye,
  CAMERA_VISAGE: Camera
};

const labelMap: Record<TypePeripherique, string> = {
  SCANNER_DOCUMENTS: 'Scanner de documents',
  SCANNER_EMPREINTES: 'Lecteur d\'empreintes',
  SCANNER_IRIS: 'Scanner iris',
  CAMERA_VISAGE: 'Caméra de capture'
};

const PeripheriquesPage = () => {
  const [devices, setDevices] = useState<Peripherique[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = () => {
    setDevices(DeviceManager.getDevices());
  };

  const handleConnect = async (deviceId: string) => {
    setConnecting(deviceId);
    await DeviceManager.connect(deviceId);
    loadDevices();
    setConnecting(null);
  };

  const handleDisconnect = async (deviceId: string) => {
    setConnecting(deviceId);
    await DeviceManager.disconnect(deviceId);
    loadDevices();
    setConnecting(null);
  };

  const getStatutBadge = (etat: Peripherique['etat']) => {
    const styles = {
      CONNECTE: 'bg-chart-2 text-primary-foreground',
      DECONNECTE: 'bg-secondary text-secondary-foreground border-2',
      EN_COURS: 'bg-chart-4',
      ERREUR: 'bg-destructive text-destructive-foreground'
    };

    const labels = {
      CONNECTE: 'Connecté',
      DECONNECTE: 'Déconnecté',
      EN_COURS: 'En cours...',
      ERREUR: 'Erreur'
    };

    return <Badge className={styles[etat]}>{labels[etat]}</Badge>;
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="border-b-2 border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase">Périphériques</h1>
            <p className="text-muted-foreground">
              Gestion des équipements de capture connectés au poste
            </p>
          </div>
          <Button
            variant="outline"
            className="border-2 shadow-xs hover:shadow-none"
            onClick={loadDevices}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Résumé */}
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 border-2 border-border bg-secondary">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">État des périphériques</p>
                    <p className="text-sm text-muted-foreground">
                      {devices.filter(d => d.etat === 'CONNECTE').length} sur {devices.length} connectés
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-chart-2">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm font-bold">
                      {devices.filter(d => d.etat === 'CONNECTE').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-bold">
                      {devices.filter(d => d.etat !== 'CONNECTE').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des périphériques */}
          <div className="grid gap-4">
            {devices.map((device) => {
              const Icon = iconMap[device.type];
              const isConnecting = connecting === device.id;
              const isConnected = device.etat === 'CONNECTE';

              return (
                <Card 
                  key={device.id} 
                  className={`border-2 transition-all ${isConnected ? 'border-chart-2' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`
                          p-4 border-2 
                          ${isConnected 
                            ? 'bg-chart-2 border-chart-2' 
                            : 'bg-secondary border-border'
                          }
                        `}>
                          <Icon className={`h-8 w-8 ${isConnected ? 'text-primary-foreground' : ''}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">
                            {labelMap[device.type]}
                          </p>
                          <p className="font-bold text-lg">{device.nom}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            ID: {device.id}
                          </p>
                          {device.derniereSynchronisation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Dernière sync: {new Date(device.derniereSynchronisation).toLocaleString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {getStatutBadge(device.etat)}
                        
                        {isConnected ? (
                          <Button
                            variant="outline"
                            className="border-2"
                            onClick={() => handleDisconnect(device.id)}
                            disabled={isConnecting}
                          >
                            {isConnecting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <WifiOff className="h-4 w-4 mr-2" />
                                Déconnecter
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            className="border-2 shadow-xs hover:shadow-none"
                            onClick={() => handleConnect(device.id)}
                            disabled={isConnecting}
                          >
                            {isConnecting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Wifi className="h-4 w-4 mr-2" />
                                Connecter
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Note technique */}
          <Card className="border-2 bg-secondary">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note technique:</strong> Les périphériques sont gérés via le DeviceManager. 
                En production, remplacez les méthodes mock par les drivers réels pour chaque équipement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PeripheriquesPage;
