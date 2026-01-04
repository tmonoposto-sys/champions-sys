import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { listRaces, createRace, updateRace, deleteRace, Race } from "@/services/api";
import { F1_CIRCUITS, getCircuitById } from "@/data/circuits";
import { Plus, Pencil, Trash2, Loader2, Zap, CloudRain } from "lucide-react";
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

const RacesPage: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [deletingRace, setDeletingRace] = useState<Race | null>(null);
  const [formData, setFormData] = useState({
    circuitId: "",
    order: 1,
    isSprint: false,
    isRain: false,
  });
  const [saving, setSaving] = useState(false);

  const loadRaces = async () => {
    if (!championship) return;
    setLoading(true);
    const result = await listRaces(championship.code);
    if (result.data) {
      setRaces(result.data.sort((a, b) => a.order - b.order));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRaces();
  }, [championship]);

  const openCreateDialog = () => {
    setEditingRace(null);
    setFormData({
      circuitId: "",
      order: races.length + 1,
      isSprint: false,
      isRain: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (race: Race) => {
    setEditingRace(race);
    setFormData({
      circuitId: race.circuitId,
      order: race.order,
      isSprint: race.isSprint,
      isRain: race.isRain,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!championship) return;
    if (!formData.circuitId) {
      toast({ title: "Error", description: "Selecciona un circuito", variant: "destructive" });
      return;
    }

    setSaving(true);

    let result;
    if (editingRace) {
      result = await updateRace(
        editingRace?._id,
        formData.circuitId,
        formData.order,
        formData.isSprint,
        formData.isRain
      );
    } else {
      result = await createRace(
        championship.code,
        formData.circuitId,
        formData.order,
        formData.isSprint,
        formData.isRain
      );
    }

    setSaving(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: editingRace ? "Carrera actualizada" : "Carrera creada" });
    setDialogOpen(false);
    loadRaces();
  };

  const handleDelete = async () => {
    if (!deletingRace) return;

    const result = await deleteRace(deletingRace?._id);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: "Carrera eliminada" });
    setDeleteDialogOpen(false);
    setDeletingRace(null);
    loadRaces();
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
          <h2 className="text-2xl font-bold">Carreras</h2>
          <p className="text-muted-foreground">Configura el calendario del campeonato</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Carrera
        </Button>
      </div>

      {races.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay carreras registradas. Crea la primera.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {races.map((race) => {
            const circuit = getCircuitById(race.circuitId);
            return (
              <Card key={race?._id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {race.order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{circuit?.flag}</span>
                        <span className="font-medium">{circuit?.name || race.circuitId}</span>
                        {race.isSprint && (
                          <span className="bg-yellow-500/20 text-yellow-600 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Sprint
                          </span>
                        )}
                        {race.isRain && (
                          <span className="bg-blue-500/20 text-blue-600 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <CloudRain className="h-3 w-3" /> Lluvia
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{circuit?.circuit}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(race)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingRace(race);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRace ? "Editar Carrera" : "Nueva Carrera"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Circuito</Label>
              <Select
                value={formData.circuitId}
                onValueChange={(value) => setFormData({ ...formData, circuitId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un circuito" />
                </SelectTrigger>
                <SelectContent>
                  {F1_CIRCUITS.map((circuit) => (
                    <SelectItem key={circuit.id} value={circuit.id}>
                      {circuit.flag} {circuit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSprint"
                checked={formData.isSprint}
                onCheckedChange={(checked) => setFormData({ ...formData, isSprint: checked === true })}
              />
              <Label htmlFor="isSprint" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Carrera Sprint
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRain"
                checked={formData.isRain}
                onCheckedChange={(checked) => setFormData({ ...formData, isRain: checked === true })}
              />
              <Label htmlFor="isRain" className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-blue-500" />
                Carrera en Lluvia
              </Label>
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
            <AlertDialogTitle>¿Eliminar carrera?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la carrera permanentemente.
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

export default RacesPage;
