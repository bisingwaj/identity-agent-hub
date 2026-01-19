/**
 * Contexte d'authentification pour la gestion des sessions agent
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Agent, AuthState } from '@/types';
import { mockAgents } from '@/services/mockData';
import { useLogger } from '@/contexts/LoggerContext';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    agent: null,
    token: null,
    isAuthenticated: false
  });
  
  const { log } = useLogger();

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulation d'authentification - À remplacer par API réelle
    // Pour la démo, on accepte n'importe quel mot de passe
    const agent = mockAgents.find(a => a.email.toLowerCase() === email.toLowerCase());
    
    if (agent && password.length >= 4) {
      const mockToken = `mock-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      setAuthState({
        agent,
        token: mockToken,
        isAuthenticated: true
      });
      
      log('ACTION', 'Connexion agent', `Agent ${agent.prenom} ${agent.nom} connecté`, agent.id);
      
      return true;
    }
    
    log('WARNING', 'Échec connexion', `Tentative de connexion échouée pour ${email}`);
    return false;
  }, [log]);

  const logout = useCallback(() => {
    if (authState.agent) {
      log('ACTION', 'Déconnexion agent', `Agent ${authState.agent.prenom} ${authState.agent.nom} déconnecté`, authState.agent.id);
    }
    
    setAuthState({
      agent: null,
      token: null,
      isAuthenticated: false
    });
  }, [authState.agent, log]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
