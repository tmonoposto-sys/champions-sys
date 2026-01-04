import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  listTeams,
  Driver,
  Team,
} from "@/services/api";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DriversPage: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    teamId: "",
    number: 0,
    estado: "Titular",
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!championship) return;
    setLoading(true);
    const [driversResult, teamsResult] = await Promise.all([
      listDrivers(championship.code),
      listTeams(championship.code),
    ]);
    if (driversResult.data) setDrivers(driversResult.data);
    if (teamsResult.data) setTeams(teamsResult.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [championship]);

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t?._id === teamId)?.name || "Sin equipo";
  };

  const getTeamColor = (teamId: string) => {
    return teams.find((t) => t?._id === teamId)?.color || "#888888";
  };

  const openCreateDialog = () => {
    setEditingDriver(null);
    setFormData({ name: "", teamId: "", number: 0, estado: "Titular" });
    setDialogOpen(true);
  };

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      teamId: driver.teamId,
      number: driver.number,
      estado: driver.estado,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!championship) return;
    if (!formData.name.trim() || !formData.teamId) {
      toast({ title: "Error", description: "Nombre y equipo son requeridos", variant: "destructive" });
      return;
    }

    setSaving(true);

    let result;
    if (editingDriver) {
      result = await updateDriver(
        editingDriver?._id,
        formData.name,
        formData.teamId,
        formData.number,
        formData.estado
      );
    } else {
      result = await createDriver(
        championship.code,
        formData.name,
        formData.teamId,
        formData.number,
        formData.estado
      );
    }

    setSaving(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: editingDriver ? "Piloto actualizado" : "Piloto creado" });
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!deletingDriver) return;

    const result = await deleteDriver(deletingDriver?._id);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: "Piloto eliminado" });
    setDeleteDialogOpen(false);
    setDeletingDriver(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pilotos</h2>
          <p className="text-muted-foreground">Gestiona los pilotos del campeonato</p>
        </div>
        <Button onClick={openCreateDialog} disabled={teams.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Piloto
        </Button>
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="py-4 text-center text-muted-foreground">
            Primero debes crear al menos una escudería.
          </CardContent>
        </Card>
      )}

      {drivers.length === 0 && teams.length > 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay pilotos registrados. Crea el primero.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drivers.map((driver) => (
            <Card key={driver?._id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getTeamColor(driver.teamId) }}
                  >
                    {driver.number}
                  </div>
                  <div>
                    <span className="font-medium">{driver.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {getTeamName(driver.teamId)} • {driver.estado}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(driver)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeletingDriver(driver);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDriver ? "Editar Piloto" : "Nuevo Piloto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del piloto"
              />
            </div>
            <div className="space-y-2">
              <Label>Escudería</Label>
              <Select
                value={formData.teamId}
                onValueChange={(value) => setFormData({ ...formData, teamId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una escudería" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team?._id} value={team?._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 0 })}
                placeholder="Número del piloto"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Titular">Titular</SelectItem>
                  <SelectItem value="Reserva">Reserva</SelectItem>
                  <SelectItem value="Expiloto">Expiloto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar piloto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{deletingDriver?.name}" permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriversPage;
