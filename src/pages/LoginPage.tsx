import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/authStore";
import { loginChampionship, createChampionship } from "@/services/api";
import { Flag, Plus, MessageCircle } from "lucide-react";

function generateCode(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const generatedCode = useMemo(() => generateCode(regName), [regName]);

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim() || !regUsername.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (!generatedCode) {
      toast({
        title: "Error",
        description: "El nombre del campeonato debe generar un código válido",
        variant: "destructive",
      });
      return;
    }

    setRegLoading(true);
    const result = await createChampionship(regName.trim(), regUsername.trim());
    setRegLoading(false);

    if (result.error) {
      toast({
        title: "Error al crear campeonato",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    if (result.data?.success) {
      toast({
        title: "¡Campeonato creado!",
        description: `"${regName.trim()}" se creó con código ${result.data.code}`,
      });
      setCode(result.data.code);
      setUsername(regUsername.trim());
      setRegName("");
      setRegUsername("");
      setActiveTab("login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Flag className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Panel de Administración</CardTitle>
          <CardDescription>
            Administra tu campeonato o crea uno nuevo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Nuevo Campeonato</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
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
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regName">Nombre del Campeonato</Label>
                  <Input
                    id="regName"
                    type="text"
                    placeholder="Ej: Monoposto Champions F1"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={regLoading}
                  />
                  {generatedCode && (
                    <p className="text-xs text-muted-foreground">
                      Código generado: <span className="font-mono font-semibold text-foreground">{generatedCode}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regUsername">Nombre de Usuario Admin</Label>
                  <Input
                    id="regUsername"
                    type="text"
                    placeholder="Ej: adminchampions"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    disabled={regLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={regLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {regLoading ? "Creando..." : "Crear Campeonato"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <a
        href="https://chat.whatsapp.com/FFaQq5L35ktBhjiko6ZUG0"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        Comunidad — Reportar errores y mejoras
      </a>
    </div>
  );
};

export default LoginPage;
