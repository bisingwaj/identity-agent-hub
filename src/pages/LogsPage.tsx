/**
 * Page des journaux (logs)
 */

import { useState } from 'react';
import { useLogger } from '@/contexts/LoggerContext';
import { TypeLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Filter, 
  Trash2,
  Info,
  AlertTriangle,
  XCircle,
  Fingerprint,
  FileImage,
  Zap
} from 'lucide-react';

const iconMap: Record<TypeLog, React.ElementType> = {
  INFO: Info,
  ACTION: Zap,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  BIOMETRIE: Fingerprint,
  DOCUMENT: FileImage
};

const styleMap: Record<TypeLog, string> = {
  INFO: 'bg-chart-1 text-primary-foreground',
  ACTION: 'bg-chart-2 text-primary-foreground',
  WARNING: 'bg-chart-4',
  ERROR: 'bg-destructive text-destructive-foreground',
  BIOMETRIE: 'bg-chart-3 text-primary-foreground',
  DOCUMENT: 'bg-chart-5'
};

const LogsPage = () => {
  const { logs, clearLogs } = useLogger();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!log.action.toLowerCase().includes(query) && 
          !log.details.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (typeFilter !== 'all' && log.type !== typeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="border-b-2 border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase">Journaux d'activité</h1>
            <p className="text-muted-foreground">
              Historique des actions effectuées dans l'application
            </p>
          </div>
          <Button
            variant="outline"
            className="border-2"
            onClick={clearLogs}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer les logs
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Filtres */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] border-2">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="ACTION">Action</SelectItem>
                <SelectItem value="WARNING">Avertissement</SelectItem>
                <SelectItem value="ERROR">Erreur</SelectItem>
                <SelectItem value="BIOMETRIE">Biométrie</SelectItem>
                <SelectItem value="DOCUMENT">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-3">
            {(['INFO', 'ACTION', 'WARNING', 'ERROR', 'BIOMETRIE', 'DOCUMENT'] as TypeLog[]).map((type) => {
              const count = logs.filter(l => l.type === type).length;
              const Icon = iconMap[type];
              return (
                <Card key={type} className="border-2">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className={`p-1.5 ${styleMap[type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{type}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Liste des logs */}
          <Card className="border-2">
            <CardHeader className="border-b-2 border-border pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Entrées de journal
                </span>
                <Badge variant="outline" className="border-2 font-mono">
                  {filteredLogs.length} entrée(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune entrée de journal</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-border max-h-[600px] overflow-auto">
                  {filteredLogs.map((log) => {
                    const Icon = iconMap[log.type];
                    return (
                      <div 
                        key={log.id}
                        className="p-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 ${styleMap[log.type]} flex-shrink-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <p className="font-bold">{log.action}</p>
                              <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                                {new Date(log.timestamp).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {log.details}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <Badge variant="outline" className="text-xs">
                                {log.type}
                              </Badge>
                              {log.dossierId && (
                                <span className="text-muted-foreground font-mono">
                                  Dossier: {log.dossierId}
                                </span>
                              )}
                              <span className="text-muted-foreground">
                                Agent: {log.agentId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
