import React, { useState } from "react";
import { useAuth } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  updateUsername as apiUpdateUsername,
  resetChampionshipData,
} from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  User,
  AlertTriangle,
  Trophy,
  MapPin,
  Users,
  Car,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { useTourStore } from "@/stores/tourStore";

interface DangerAction {
  id: string;
  title: string;
  description: string;
  confirmText: string;
  target: "results" | "races" | "drivers" | "teams" | "all";
  icon: React.ReactNode;
}

const DANGER_ACTIONS: DangerAction[] = [
  {
    id: "results",
    title: "Reiniciar resultados",
    description: "Elimina todos los resultados de clasificación y carrera del campeonato.",
    confirmText: "eliminar resultados",
    target: "results",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    id: "races",
    title: "Borrar todas las carreras",
    description: "Elimina todas las carreras del calendario. Los resultados asociados permanecen.",
    confirmText: "eliminar carreras",
    target: "races",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    id: "drivers",
    title: "Borrar todos los pilotos",
    description: "Elimina todos los pilotos registrados en el campeonato.",
    confirmText: "eliminar pilotos",
    target: "drivers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "teams",
    title: "Borrar todas las escuderías",
    description: "Elimina todas las escuderías del campeonato.",
    confirmText: "eliminar escuderias",
    target: "teams",
    icon: <Car className="h-5 w-5" />,
  },
  {
    id: "all",
    title: "Borrar TODO y empezar de cero",
    description: "Elimina absolutamente toda la información: resultados, carreras, pilotos, escuderías y circuitos personalizados.",
    confirmText: "eliminar todo",
    target: "all",
    icon: <Trash2 className="h-5 w-5" />,
  },
];

const SettingsPage: React.FC = () => {
  const { championship, username, updateUsername } = useAuth();
  const { toast } = useToast();
  const { resetTours, startTour } = useTourStore();

  const [newUsername, setNewUsername] = useState(username || "");
  const [savingUsername, setSavingUsername] = useState(false);

  const [dangerDialog, setDangerDialog] = useState<DangerAction | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [executing, setExecuting] = useState(false);

  const handleUpdateUsername = async () => {
    if (!championship || !username) return;
    const trimmed = newUsername.trim();
    if (trimmed.length < 3) {
      toast({ title: "Error", description: "El usuario debe tener al menos 3 caracteres", variant: "destructive" });
      return;
    }
    if (trimmed === username) {
      toast({ title: "Info", description: "El nombre de usuario es el mismo" });
      return;
    }

    setSavingUsername(true);
    const result = await apiUpdateUsername(championship.code, username, trimmed);
    setSavingUsername(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    updateUsername(trimmed);
    toast({ title: "Éxito", description: "Nombre de usuario actualizado" });
  };

  const openDangerDialog = (action: DangerAction) => {
    setDangerDialog(action);
    setConfirmInput("");
  };

  const handleDangerConfirm = async () => {
    if (!dangerDialog || !championship || !username) return;

    setExecuting(true);
    const result = await resetChampionshipData(championship.code, username, dangerDialog.target);
    setExecuting(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: `${dangerDialog.title} completado` });
    setDangerDialog(null);
    setConfirmInput("");
  };

  return (
    <div className="space-y-6">
      <div data-tour="page-settings">
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-muted-foreground">Administra tu campeonato</p>
      </div>

      {/* Profile */}
      <Card data-tour="settings-profile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="flex-1"
              />
              <Button onClick={handleUpdateUsername} disabled={savingUsername}>
                {savingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Código del campeonato: <span className="font-mono font-bold">{championship?.code}</span></p>
            <p>Nombre: <span className="font-medium">{championship?.name}</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Tutorial
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => { resetTours(); startTour("full"); }}
          >
            Repetir tour completo
          </Button>
          <Button
            variant="outline"
            onClick={() => { resetTours(); startTour("newFeatures"); }}
          >
            Ver novedades
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card data-tour="settings-danger" className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {DANGER_ACTIONS.map((action, i) => (
            <div
              key={action.id}
              className={`flex items-center justify-between gap-4 py-4 ${i < DANGER_ACTIONS.length - 1 ? "border-b" : ""}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="text-red-500 mt-0.5 flex-shrink-0">{action.icon}</div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="flex-shrink-0"
                onClick={() => openDangerDialog(action)}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Confirm Dialog */}
      <Dialog open={!!dangerDialog} onOpenChange={(open) => { if (!open) { setDangerDialog(null); setConfirmInput(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              {dangerDialog?.title}
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. Se perderá toda la información permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">
              Para confirmar, escribe{" "}
              <span className="font-mono font-bold text-red-500">{dangerDialog?.confirmText}</span>{" "}
              en el campo de abajo:
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={dangerDialog?.confirmText}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDangerDialog(null); setConfirmInput(""); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={confirmInput !== dangerDialog?.confirmText || executing}
              onClick={handleDangerConfirm}
            >
              {executing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar eliminación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
