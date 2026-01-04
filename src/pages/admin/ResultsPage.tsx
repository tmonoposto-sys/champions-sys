import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  listRaces,
  listDrivers,
  getRaceResult,
  saveQualifyingResult,
  saveRaceResult,
  Race,
  Driver,
  QualifyingEntry,
} from "@/services/api";
import { getCircuitById } from "@/data/circuits";
import { Loader2, Trophy, Clock, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ResultsPage: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [qualifying, setQualifying] = useState<QualifyingEntry[]>([]);
  const [raceResults, setRaceResults] = useState<string[]>([]);
  const [fastestLap, setFastestLap] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!championship) return;
    setLoading(true);
    const [racesResult, driversResult] = await Promise.all([
      listRaces(championship.code),
      listDrivers(championship.code),
    ]);
    if (racesResult.data) {
      setRaces(racesResult.data.sort((a, b) => a.order - b.order));
    }
    if (driversResult.data) {
      setDrivers(driversResult.data.filter((d) => d.estado !== "Expiloto"));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [championship]);

  const loadRaceResults = async (race: Race) => {
    if (!championship) return;
    setSelectedRace(race);
    const result = await getRaceResult(championship.code, race?._id);
    if (result.data) {
      setQualifying(result.data.qualifying || []);
      setRaceResults(result.data.race || []);
      setFastestLap(result.data.fastestLap || "");
    } else {
      setQualifying([]);
      setRaceResults([]);
      setFastestLap("");
    }
  };

  const handleSaveQualifying = async () => {
    if (!championship || !selectedRace) return;
    setSaving(true);
    const result = await saveQualifyingResult(
      championship.code,
      selectedRace?._id,
      qualifying
    );
    setSaving(false);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Resultados de clasificación guardados" });
    }
  };

  const handleSaveRace = async () => {
    if (!championship || !selectedRace) return;
    setSaving(true);
    const result = await saveRaceResult(
      championship.code,
      selectedRace?._id,
      raceResults,
      fastestLap === "none" ? undefined : fastestLap
    );
    setSaving(false);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Resultados de carrera guardados" });
    }
  };

  const updateQualifyingTime = (driverId: string, time: string) => {
    setQualifying((prev) => {
      const existing = prev.find((q) => q.driverId === driverId);
      if (existing) {
        return prev.map((q) => (q.driverId === driverId ? { ...q, time } : q));
      }
      return [...prev, { driverId, time }];
    });
  };

  const updateRacePosition = (position: number, driverId: string) => {
    setRaceResults((prev) => {
      const newResults = [...prev];
      // Remove driver from previous position if exists
      const oldIndex = newResults.indexOf(driverId);
      if (oldIndex !== -1) {
        newResults.splice(oldIndex, 1);
      }
      // Insert at new position
      while (newResults.length < position) {
        newResults.push("");
      }
      newResults[position - 1] = driverId;
      return newResults;
    });
  };

  const getDriverName = (driverId: string) => {
    return drivers.find((d) => d?._id === driverId)?.name || "Desconocido";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (races.length === 0 || drivers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {races.length === 0
            ? "Primero debes crear carreras en el calendario."
            : "Primero debes crear pilotos."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resultados</h2>
        <p className="text-muted-foreground">Ingresa los resultados de clasificación y carrera</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Race List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Carreras</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {races.map((race) => {
                  const circuit = getCircuitById(race.circuitId);
                  return (
                    <Button
                      key={race?._id}
                      variant={selectedRace?._id === race?._id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => loadRaceResults(race)}
                    >
                      <span className="mr-2">{circuit?.flag}</span>
                      <span className="truncate">{circuit?.name || race.circuitId}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Form */}
        <div className="lg:col-span-3">
          {selectedRace ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">{getCircuitById(selectedRace.circuitId)?.flag}</span>
                  {getCircuitById(selectedRace.circuitId)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="qualifying">
                  <TabsList className="mb-4">
                    <TabsTrigger value="qualifying" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Clasificación
                    </TabsTrigger>
                    <TabsTrigger value="race" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Carrera
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="qualifying" className="space-y-4">
                    <div className="grid gap-3">
                      {drivers.map((driver) => {
                        const entry = qualifying.find((q) => q.driverId === driver?._id);
                        return (
                          <div key={driver?._id} className="flex items-center gap-4">
                            <div className="w-40 font-medium">{driver.name}</div>
                            <Input
                              placeholder="1:23.456"
                              value={entry?.time || ""}
                              onChange={(e) => updateQualifyingTime(driver?._id, e.target.value)}
                              className="w-32"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <Button onClick={handleSaveQualifying} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar Clasificación
                    </Button>
                  </TabsContent>

                  <TabsContent value="race" className="space-y-4">
                    <div className="grid gap-3">
                      {Array.from({ length: drivers.length }, (_, i) => i + 1).map((position) => (
                        <div key={position} className="flex items-center gap-4">
                          <div className="w-12 font-bold text-lg">P{position}</div>
                          <Select
                            value={raceResults[position - 1] || ""}
                            onValueChange={(value) => updateRacePosition(position, value)}
                          >
                            <SelectTrigger className="w-56">
                              <SelectValue placeholder="Seleccionar piloto" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers.map((driver) => (
                                <SelectItem key={driver?._id} value={driver?._id}>
                                  {driver.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <Label className="mb-2 block">Vuelta Rápida (opcional)</Label>
                      <Select value={fastestLap} onValueChange={setFastestLap}>
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Seleccionar piloto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          {drivers.map((driver) => (
                            <SelectItem key={driver?._id} value={driver?._id}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSaveRace} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar Resultados de Carrera
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Selecciona una carrera para ingresar resultados
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
