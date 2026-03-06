import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  listRaces, createRace, updateRace, deleteRace, Race,
  listCustomCircuits, createCustomCircuit, updateCustomCircuit, deleteCustomCircuit, CustomCircuit,
} from "@/services/api";
import { F1_CIRCUITS, getCircuitById as getBuiltinCircuit } from "@/data/circuits";
import { COUNTRIES } from "@/data/countries";
import { Plus, Pencil, Trash2, Loader2, Zap, CloudRain, Settings } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";

const RacesPage: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [customCircuits, setCustomCircuits] = useState<CustomCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [circuitsDialogOpen, setCircuitsDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [deletingRace, setDeletingRace] = useState<Race | null>(null);
  const [formData, setFormData] = useState({
    circuitId: "",
    order: 1,
    isSprint: false,
    isRain: false,
  });
  const [saving, setSaving] = useState(false);

  // Circuit CRUD state
  const [circuitForm, setCircuitForm] = useState({ name: "", circuit: "", country: "", flag: "" });
  const [editingCircuit, setEditingCircuit] = useState<CustomCircuit | null>(null);
  const [savingCircuit, setSavingCircuit] = useState(false);

  const getCircuitInfo = useCallback((circuitId: string) => {
    const builtin = getBuiltinCircuit(circuitId);
    if (builtin) return builtin;
    const custom = customCircuits.find((c) => c._id === circuitId);
    if (custom) return { id: custom._id, name: custom.name, circuit: custom.circuit, country: custom.country, flag: custom.flag };
    return null;
  }, [customCircuits]);

  const loadRaces = async () => {
    if (!championship) return;
    setLoading(true);
    const result = await listRaces(championship.code);
    if (result.data) {
      setRaces(result.data.sort((a, b) => a.order - b.order));
    }
    setLoading(false);
  };

  const loadCustomCircuits = async () => {
    if (!championship) return;
    const result = await listCustomCircuits(championship.code);
    if (result.data) {
      setCustomCircuits(result.data);
    }
  };

  useEffect(() => {
    if (!championship) return;
    Promise.all([loadRaces(), loadCustomCircuits()]);
  }, [championship]);

  const openCreateDialog = () => {
    setEditingRace(null);
    setFormData({ circuitId: "", order: races.length + 1, isSprint: false, isRain: false });
    setDialogOpen(true);
  };

  const openEditDialog = (race: Race) => {
    setEditingRace(race);
    setFormData({ circuitId: race.circuitId, order: race.order, isSprint: race.isSprint, isRain: race.isRain });
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
      result = await updateRace(editingRace._id, formData.circuitId, formData.order, formData.isSprint, formData.isRain);
    } else {
      result = await createRace(championship.code, formData.circuitId, formData.order, formData.isSprint, formData.isRain);
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
    const result = await deleteRace(deletingRace._id);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }
    toast({ title: "Éxito", description: "Carrera eliminada" });
    setDeleteDialogOpen(false);
    setDeletingRace(null);
    loadRaces();
  };

  // Circuit CRUD
  const resetCircuitForm = () => {
    setCircuitForm({ name: "", circuit: "", country: "", flag: "" });
    setEditingCircuit(null);
  };

  const handleSaveCircuit = async () => {
    if (!championship) return;
    if (!circuitForm.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }

    setSavingCircuit(true);
    let result;
    if (editingCircuit) {
      result = await updateCustomCircuit(editingCircuit._id, circuitForm.name.trim(), circuitForm.circuit.trim(), circuitForm.country.trim(), circuitForm.flag.trim());
    } else {
      result = await createCustomCircuit(championship.code, circuitForm.name.trim(), circuitForm.circuit.trim(), circuitForm.country.trim(), circuitForm.flag.trim());
    }
    setSavingCircuit(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: editingCircuit ? "Circuito actualizado" : "Circuito creado" });
    resetCircuitForm();
    loadCustomCircuits();
  };

  const handleDeleteCircuit = async (id: string) => {
    const result = await deleteCustomCircuit(id);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }
    toast({ title: "Éxito", description: "Circuito eliminado" });
    loadCustomCircuits();
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
      <div data-tour="page-races" className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Carreras</h2>
          <p className="text-muted-foreground">Configura el calendario del campeonato</p>
        </div>
        <div className="flex gap-2">
          <Button data-tour="circuits-btn" variant="outline" onClick={() => { resetCircuitForm(); setCircuitsDialogOpen(true); }}>
            <Settings className="h-4 w-4 mr-2" />
            Circuitos
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carrera
          </Button>
        </div>
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
            const circuit = getCircuitInfo(race.circuitId);
            return (
              <Card key={race._id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {race.order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
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
                    <Button variant="outline" size="sm" onClick={() => { setDeletingRace(race); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Race Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRace ? "Editar Carrera" : "Nueva Carrera"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Circuito</Label>
              <SearchableSelect
                value={formData.circuitId}
                onValueChange={(value) => setFormData({ ...formData, circuitId: value })}
                placeholder="Selecciona un circuito"
                searchPlaceholder="Buscar circuito..."
                groups={[
                  {
                    label: "Circuitos F1",
                    options: F1_CIRCUITS.map((c) => ({ value: c.id, label: `${c.flag} ${c.name}` })),
                  },
                  ...(customCircuits.length > 0 ? [{
                    label: "Circuitos Personalizados",
                    options: customCircuits.map((c) => ({ value: c._id, label: `${c.flag || "🏁"} ${c.name}` })),
                  }] : []),
                ]}
              />
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
              <Checkbox id="isSprint" checked={formData.isSprint} onCheckedChange={(checked) => setFormData({ ...formData, isSprint: checked === true })} />
              <Label htmlFor="isSprint" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" /> Carrera Sprint
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isRain" checked={formData.isRain} onCheckedChange={(checked) => setFormData({ ...formData, isRain: checked === true })} />
              <Label htmlFor="isRain" className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-blue-500" /> Carrera en Lluvia
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

      {/* Manage Circuits Dialog */}
      <Dialog open={circuitsDialogOpen} onOpenChange={setCircuitsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Circuitos Personalizados</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre del GP *</Label>
                  <Input
                    placeholder="Ej: Gran Premio de Roma"
                    value={circuitForm.name}
                    onChange={(e) => setCircuitForm({ ...circuitForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nombre del Circuito</Label>
                  <Input
                    placeholder="Ej: Circuito de Roma"
                    value={circuitForm.circuit}
                    onChange={(e) => setCircuitForm({ ...circuitForm, circuit: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">País</Label>
                  <SearchableSelect
                    value={circuitForm.country}
                    onValueChange={(value) => {
                      const match = COUNTRIES.find((c) => c.name === value);
                      setCircuitForm({ ...circuitForm, country: value, flag: match?.flag || "🏁" });
                    }}
                    placeholder="Selecciona un país"
                    searchPlaceholder="Buscar país..."
                    options={COUNTRIES.map((c) => ({ value: c.name, label: `${c.flag} ${c.name}` }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bandera</Label>
                  <Input
                    value={circuitForm.flag || "🏁"}
                    disabled
                    className="text-center text-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCircuit} disabled={savingCircuit} size="sm">
                  {savingCircuit ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCircuit ? "Actualizar" : "Agregar"}
                </Button>
                {editingCircuit && (
                  <Button variant="outline" size="sm" onClick={resetCircuitForm}>Cancelar</Button>
                )}
              </div>
            </div>

            <Separator />

            {customCircuits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay circuitos personalizados.</p>
            ) : (
              <div className="space-y-2">
                {customCircuits.map((c) => (
                  <div key={c._id} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.flag || "🏁"} {c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.circuit} — {c.country}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCircuit(c);
                          setCircuitForm({ name: c.name, circuit: c.circuit, country: c.country, flag: c.flag });
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCircuit(c._id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RacesPage;
