/**
 * Layout principal - Apple-style minimal design
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderOpen, 
  LogOut,
  Cpu,
  FileText,
  ChevronRight
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
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - Minimal */}
      <aside className="w-56 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-xs">SNI</span>
            </div>
            <span className="font-medium text-sm">Agent Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                  transition-colors duration-150
                  ${isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Agent Info - Bottom */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {agent?.prenom} {agent?.nom}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {agent?.centreNom}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - No scroll on container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
