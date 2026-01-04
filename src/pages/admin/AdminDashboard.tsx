import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, MapPin, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { championship } = useAuth();

  const quickLinks = [
    { path: "/admin/teams", label: "Gestionar Escuderías", icon: Car, description: "Añade y edita equipos" },
    { path: "/admin/drivers", label: "Gestionar Pilotos", icon: Users, description: "Añade y edita pilotos" },
    { path: "/admin/races", label: "Gestionar Carreras", icon: MapPin, description: "Configura el calendario" },
    { path: "/admin/results", label: "Gestionar Resultados", icon: Trophy, description: "Ingresa resultados" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración de {championship?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <link.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{link.label}</CardTitle>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enlace Público</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Comparte este enlace para que otros vean tu campeonato:
          </p>
          <code className="bg-muted px-3 py-2 rounded text-sm block">
            {window.location.origin}/{championship?.code}
          </code>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
