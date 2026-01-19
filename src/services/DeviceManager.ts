/**
 * DeviceManager - Gestionnaire abstrait des périphériques
 * 
 * Cette classe fournit une interface unifiée pour interagir avec
 * les différents périphériques de capture (scanner, biométrie).
 * 
 * Toutes les méthodes sont mockées mais structurées pour être
 * facilement remplacées par de vrais drivers.
 */

import { TypePeripherique, EtatPeripherique, Peripherique } from '@/types';
import { mockPeripheriques } from './mockData';

export interface ScanResult {
  success: boolean;
  data?: {
    hash: string;
    quality: number;
    timestamp: string;
  };
  error?: string;
}

export interface DeviceStatus {
  connected: boolean;
  ready: boolean;
  error?: string;
}

class DeviceManagerClass {
  private devices: Map<string, Peripherique> = new Map();
  private listeners: Map<string, ((status: DeviceStatus) => void)[]> = new Map();

  constructor() {
    // Initialiser avec les périphériques mock
    mockPeripheriques.forEach(device => {
      this.devices.set(device.id, { ...device });
    });
  }

  /**
   * Récupérer tous les périphériques
   */
  getDevices(): Peripherique[] {
    return Array.from(this.devices.values());
  }

  /**
   * Récupérer un périphérique par son type
   */
  getDeviceByType(type: TypePeripherique): Peripherique | undefined {
    return Array.from(this.devices.values()).find(d => d.type === type);
  }

  /**
   * Récupérer le statut d'un périphérique
   */
  getStatus(deviceId: string): DeviceStatus {
    const device = this.devices.get(deviceId);
    if (!device) {
      return { connected: false, ready: false, error: 'Périphérique non trouvé' };
    }
    
    return {
      connected: device.etat === 'CONNECTE',
      ready: device.etat === 'CONNECTE',
      error: device.etat === 'ERREUR' ? 'Erreur du périphérique' : undefined
    };
  }

  /**
   * Connecter un périphérique (mock)
   */
  async connect(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    // Simulation de connexion
    this.updateDeviceState(deviceId, 'EN_COURS');
    
    await this.simulateDelay(1000);
    
    // 90% de succès
    const success = Math.random() > 0.1;
    
    this.updateDeviceState(deviceId, success ? 'CONNECTE' : 'ERREUR');
    
    return success;
  }

  /**
   * Déconnecter un périphérique
   */
  async disconnect(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) return;

    this.updateDeviceState(deviceId, 'DECONNECTE');
  }

  /**
   * Scanner un document
   */
  async scanDocument(): Promise<ScanResult> {
    const scanner = this.getDeviceByType('SCANNER_DOCUMENTS');
    
    if (!scanner || scanner.etat !== 'CONNECTE') {
      return { 
        success: false, 
        error: 'Scanner de documents non connecté' 
      };
    }

    // Simulation de scan
    await this.simulateDelay(2000);
    
    // 85% de succès
    if (Math.random() > 0.15) {
      const qualities = ['EXCELLENTE', 'BONNE', 'ACCEPTABLE'] as const;
      const qualityIndex = Math.floor(Math.random() * 3);
      
      return {
        success: true,
        data: {
          hash: this.generateHash(),
          quality: 70 + Math.floor(Math.random() * 30),
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return { 
      success: false, 
      error: 'Échec de la numérisation. Veuillez réessayer.' 
    };
  }

  /**
   * Capturer une empreinte digitale
   */
  async captureFingerprint(finger: string): Promise<ScanResult> {
    const scanner = this.getDeviceByType('SCANNER_EMPREINTES');
    
    if (!scanner || scanner.etat !== 'CONNECTE') {
      return { 
        success: false, 
        error: 'Lecteur d\'empreintes non connecté' 
      };
    }

    // Simulation de capture
    await this.simulateDelay(1500);
    
    // 90% de succès
    if (Math.random() > 0.1) {
      return {
        success: true,
        data: {
          hash: this.generateHash(),
          quality: 75 + Math.floor(Math.random() * 25),
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return { 
      success: false, 
      error: 'Qualité insuffisante. Veuillez repositionner le doigt.' 
    };
  }

  /**
   * Capturer l'iris
   */
  async captureIris(eye: 'GAUCHE' | 'DROIT'): Promise<ScanResult> {
    const scanner = this.getDeviceByType('SCANNER_IRIS');
    
    if (!scanner || scanner.etat !== 'CONNECTE') {
      return { 
        success: false, 
        error: 'Scanner iris non connecté' 
      };
    }

    // Simulation de capture
    await this.simulateDelay(2500);
    
    // 85% de succès
    if (Math.random() > 0.15) {
      return {
        success: true,
        data: {
          hash: this.generateHash(),
          quality: 80 + Math.floor(Math.random() * 20),
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return { 
      success: false, 
      error: 'Capture échouée. Assurez-vous que l\'œil est bien centré.' 
    };
  }

  /**
   * Capturer le visage
   */
  async captureFace(): Promise<ScanResult> {
    const camera = this.getDeviceByType('CAMERA_VISAGE');
    
    if (!camera || camera.etat !== 'CONNECTE') {
      return { 
        success: false, 
        error: 'Caméra non connectée' 
      };
    }

    // Simulation de capture
    await this.simulateDelay(2000);
    
    // 95% de succès
    if (Math.random() > 0.05) {
      return {
        success: true,
        data: {
          hash: this.generateHash(),
          quality: 85 + Math.floor(Math.random() * 15),
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return { 
      success: false, 
      error: 'Visage non détecté. Veuillez regarder la caméra.' 
    };
  }

  /**
   * Mettre à jour l'état d'un périphérique
   */
  private updateDeviceState(deviceId: string, etat: EtatPeripherique): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.etat = etat;
      device.derniereSynchronisation = new Date().toISOString();
      this.devices.set(deviceId, device);
      
      // Notifier les listeners
      this.notifyListeners(deviceId);
    }
  }

  /**
   * Ajouter un listener pour les changements d'état
   */
  addStatusListener(deviceId: string, callback: (status: DeviceStatus) => void): () => void {
    const listeners = this.listeners.get(deviceId) || [];
    listeners.push(callback);
    this.listeners.set(deviceId, listeners);

    // Retourner une fonction de cleanup
    return () => {
      const current = this.listeners.get(deviceId) || [];
      this.listeners.set(deviceId, current.filter(l => l !== callback));
    };
  }

  private notifyListeners(deviceId: string): void {
    const listeners = this.listeners.get(deviceId) || [];
    const status = this.getStatus(deviceId);
    listeners.forEach(callback => callback(status));
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateHash(): string {
    // Génère un hash fictif pour représenter les données biométriques
    // Dans un vrai système, ce serait le hash des données capturées
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

// Export singleton
export const DeviceManager = new DeviceManagerClass();
