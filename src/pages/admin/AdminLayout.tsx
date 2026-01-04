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
  LayoutDashboard
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg">{championship?.name}</h1>
              <p className="text-xs text-muted-foreground">Código: {championship?.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to={`/${championship?.code}`} 
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Ver página pública
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 border-r bg-card min-h-[calc(100vh-57px)] p-4">
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
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
