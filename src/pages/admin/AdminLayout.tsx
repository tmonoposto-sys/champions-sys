import React from "react";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Car, 
  MapPin, 
  Trophy, 
  LogOut, 
  Flag,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLayout: React.FC = () => {
  const { isAuthenticated, championship, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { path: "/admin/teams", label: "Escuderías", icon: Car },
    { path: "/admin/drivers", label: "Pilotos", icon: Users },
    { path: "/admin/races", label: "Carreras", icon: MapPin },
    { path: "/admin/results", label: "Resultados", icon: Trophy },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm sm:text-base md:text-lg truncate">{championship?.name}</h1>
              <p className="text-xs text-muted-foreground truncate">Código: {championship?.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link 
              to={`/${championship?.code}`} 
              target="_blank"
              className="hidden sm:block text-xs sm:text-sm text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              Ver página pública
            </Link>
            <Button variant="outline" size="sm" onClick={logout} className="h-8 sm:h-9 text-xs sm:text-sm">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar Desktop */}
        <nav className="hidden lg:block w-64 border-r bg-card min-h-[calc(100vh-57px)] p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive(item.path, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive(item.path, item.exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground active:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;