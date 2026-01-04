import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { loginChampionship } from "@/services/api";
import { Flag } from "lucide-react";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !code.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const result = await loginChampionship(username.trim(), code.trim().toUpperCase());
    
    setLoading(false);

    if (result.error) {
      toast({
        title: "Error de autenticación",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    if (result.data?.success && result.data?.championship) {
      login(username.trim(), result.data.championship.code, result.data.championship.name);
      toast({
        title: "¡Bienvenido!",
        description: `Conectado a ${result.data.championship.name}`,
      });
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Flag className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Panel de Administración</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para administrar tu campeonato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código del Campeonato</Label>
              <Input
                id="code"
                type="text"
                placeholder="Ej: F1RACING2024"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="uppercase"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
