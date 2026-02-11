/**
 * Application principale - Système National d'Identification Biométrique - Agent Admin
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { LoggerProvider } from "@/contexts/LoggerContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemandesProvider } from "@/contexts/DemandesContext";

// Layout
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DossiersPage from "@/pages/DossiersPage";
import DossierPage from "@/pages/DossierPage";
import PeripheriquesPage from "@/pages/PeripheriquesPage";
import LogsPage from "@/pages/LogsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LoggerProvider>
      <AuthProvider>
        <DemandesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Page de connexion */}
                <Route path="/" element={<LoginPage />} />
                
                {/* Routes protégées */}
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/dossiers" element={<DossiersPage />} />
                  <Route path="/dossier/:id" element={<DossierPage />} />
                  <Route path="/peripheriques" element={<PeripheriquesPage />} />
                  <Route path="/logs" element={<LogsPage />} />
                  <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
                </Route>
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DemandesProvider>
      </AuthProvider>
    </LoggerProvider>
  </QueryClientProvider>
);

export default App;
