/**
 * Layout principal de l'application agent
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  LogOut,
  Cpu,
  FileText,
  User
} from 'lucide-react';

const AppLayout = () => {
  const { agent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/dossiers', label: 'Dossiers', icon: FolderOpen },
    { path: '/peripheriques', label: 'Périphériques', icon: Cpu },
    { path: '/logs', label: 'Journaux', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 border-2 border-border bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold uppercase text-sm">SNI</h1>
              <p className="text-xs text-muted-foreground">Agent Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 h-11 border-2 ${
                  isActive ? 'shadow-xs' : 'border-transparent'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Agent Info */}
        <div className="p-4 border-t-2 border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 border-2 border-border bg-secondary">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">
                {agent?.prenom} {agent?.nom}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {agent?.centreNom}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-2"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
