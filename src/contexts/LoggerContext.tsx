/**
 * Contexte de journalisation pour le suivi des actions
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LogEntry, TypeLog } from '@/types';

interface LoggerContextType {
  logs: LogEntry[];
  log: (type: TypeLog, action: string, details: string, agentId?: string, dossierId?: string) => void;
  clearLogs: () => void;
  getLogsByDossier: (dossierId: string) => LogEntry[];
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

export const LoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const log = useCallback((
    type: TypeLog, 
    action: string, 
    details: string, 
    agentId: string = 'SYSTEM',
    dossierId?: string
  ) => {
    const newLog: LogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      action,
      details,
      agentId,
      dossierId
    };

    setLogs(prev => [newLog, ...prev]);
    
    // Log également dans la console pour le mode debug
    const logStyle = {
      INFO: 'color: #3b82f6',
      ACTION: 'color: #10b981',
      WARNING: 'color: #f59e0b',
      ERROR: 'color: #ef4444',
      BIOMETRIE: 'color: #8b5cf6',
      DOCUMENT: 'color: #06b6d4'
    };
    
    console.log(
      `%c[${type}] ${action}`,
      logStyle[type],
      `\n${details}`,
      dossierId ? `\nDossier: ${dossierId}` : ''
    );
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getLogsByDossier = useCallback((dossierId: string): LogEntry[] => {
    return logs.filter(l => l.dossierId === dossierId);
  }, [logs]);

  return (
    <LoggerContext.Provider value={{ logs, log, clearLogs, getLogsByDossier }}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = (): LoggerContextType => {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error('useLogger doit être utilisé dans un LoggerProvider');
  }
  return context;
};
