import React, { useState } from "react";
import { useAuth } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, MapPin, Trophy, Check, Copy, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";


const AdminDashboard: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const publicLink = `${window.location.origin}/${championship?.code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      toast({
        title: "Enlace copiado",
        description: "El enlace fue copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

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

      <div data-tour="quick-links" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <Card data-tour="public-link">
        <CardHeader>
          <CardTitle>Enlace Público</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Comparte este enlace para que otros vean tu campeonato:
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-muted px-3 py-2 rounded text-sm flex-1 truncate">
              {publicLink}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card data-tour="whatsapp-card" className="border-green-500/30 bg-green-500/5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="bg-green-500/10 rounded-lg p-3">
            <MessageCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Comunidad WhatsApp</CardTitle>
            <p className="text-sm text-muted-foreground">
              Únete al grupo para reportar errores, sugerir mejoras y estar al día con las novedades.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
            <a
              href="https://chat.whatsapp.com/FFaQq5L35ktBhjiko6ZUG0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Unirse al grupo
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
