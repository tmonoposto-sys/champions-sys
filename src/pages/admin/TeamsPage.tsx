import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { listTeams, createTeam, updateTeam, deleteTeam, Team } from "@/services/api";
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

const TeamsPage: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#ff0000" });
  const [saving, setSaving] = useState(false);

  const loadTeams = async () => {
    if (!championship) return;
    setLoading(true);
    const result = await listTeams(championship.code);
    if (result.data) {
      setTeams(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeams();
  }, [championship]);

  const openCreateDialog = () => {
    setEditingTeam(null);
    setFormData({ name: "", color: "#ff0000" });
    setDialogOpen(true);
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setFormData({ name: team.name, color: team.color });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!championship) return;
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }

    setSaving(true);
    
    let result;
    if (editingTeam) {
      result = await updateTeam(editingTeam?._id, formData.name, formData.color);
    } else {
      result = await createTeam(championship.code, formData.name, formData.color);
    }

    setSaving(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: editingTeam ? "Escudería actualizada" : "Escudería creada" });
    setDialogOpen(false);
    loadTeams();
  };

  const handleDelete = async () => {
    if (!deletingTeam) return;
    
    const result = await deleteTeam(deletingTeam?._id);
    
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({ title: "Éxito", description: "Escudería eliminada" });
    setDeleteDialogOpen(false);
    setDeletingTeam(null);
    loadTeams();
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
          <h2 className="text-2xl font-bold">Escuderías</h2>
          <p className="text-muted-foreground">Gestiona los equipos del campeonato</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Escudería
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay escuderías registradas. Crea la primera.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teams.map((team) => (
            <Card key={team?._id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="font-medium">{team.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(team)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeletingTeam(team);
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
            <DialogTitle>{editingTeam ? "Editar Escudería" : "Nueva Escudería"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la escudería"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#ff0000"
                />
              </div>
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
            <AlertDialogTitle>¿Eliminar escudería?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{deletingTeam?.name}" permanentemente.
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

export default TeamsPage;
