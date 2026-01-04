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

const QUALIFYING_TIME_REGEX = /^[0-9]:[0-5]\d\.\d{3}$/;

const ResultsPage: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();

  const [races, setRaces] = useState<Race[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [qualifying, setQualifying] = useState<QualifyingEntry[]>([]);
  const [raceResults, setRaceResults] = useState<string[]>([]);
  const [fastestLap, setFastestLap] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!championship) return;
    setLoading(true);

    Promise.all([
      listRaces(championship.code),
      listDrivers(championship.code),
    ]).then(([racesResult, driversResult]) => {
      if (racesResult.data) {
        setRaces(racesResult.data.sort((a, b) => a.order - b.order));
      }
      if (driversResult.data) {
        setDrivers(driversResult.data.filter((d) => d.estado !== "Expiloto"));
      }
      setLoading(false);
    });
  }, [championship]);

  const loadRaceResults = async (race: Race) => {
    if (!championship) return;
    setSelectedRace(race);

    const result = await getRaceResult(championship.code, race._id);
    if (result.data) {
      setQualifying(result.data.qualifying || []);
      setRaceResults(result.data.race || []);
      setFastestLap(result.data.fastestLap || "none");
    } else {
      setQualifying([]);
      setRaceResults([]);
      setFastestLap("none");
    }
  };

  const timeToMs = (time: string): number => {
    const [m, rest] = time.split(":");
    const [s, ms] = rest.split(".");
    return Number(m) * 60000 + Number(s) * 1000 + Number(ms);
  };

  const formatQualifyingTime = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    let m = digits.slice(0, 1);
    let s = digits.slice(1, 3);
    let ms = digits.slice(3, 6);

    let result = m;
    if (digits.length >= 2) result += `:${s}`;
    if (digits.length >= 4) result += `.${ms}`;
    return result;
  };

  const updateQualifyingTime = (driverId: string, rawValue: string) => {
    if (rawValue === "") {
      setQualifying((prev) =>
        prev.filter((q) => q.driverId !== driverId)
      );
      return;
    }

    const formatted = formatQualifyingTime(rawValue);

    setQualifying((prev) =>
      prev.some((q) => q.driverId === driverId)
        ? prev.map((q) =>
            q.driverId === driverId ? { ...q, time: formatted } : q
          )
        : [...prev, { driverId, time: formatted }]
    );
  };

  const updateRacePosition = (position: number, driverId: string) => {
    setRaceResults((prev) => {
      const next = [...prev];
      const oldIndex = next.indexOf(driverId);
      if (oldIndex !== -1) next.splice(oldIndex, 1);
      while (next.length < position) next.push("");
      next[position - 1] = driverId;
      return next;
    });
  };

  const handleSaveQualifying = async () => {
    if (!championship || !selectedRace) return;

    const invalid = qualifying.some(
      (q) => !QUALIFYING_TIME_REGEX.test(q.time)
    );

    if (invalid) {
      toast({
        title: "Error",
        description: "Formato inválido. Usa m:ss.ms",
        variant: "destructive",
      });
      return;
    }

    // ✅ ORDENAR SOLO ANTES DE ENVIAR
    const sortedQualifying = [...qualifying].sort(
      (a, b) => timeToMs(a.time) - timeToMs(b.time)
    );

    setSaving(true);
    const result = await saveQualifyingResult(
      championship.code,
      selectedRace._id,
      sortedQualifying
    );
    setSaving(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Clasificación guardada" });
    }
  };

  const handleSaveRace = async () => {
    if (!championship || !selectedRace) return;

    setSaving(true);
    const result = await saveRaceResult(
      championship.code,
      selectedRace._id,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resultados</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Carreras</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {races.map((race) => {
                const circuit = getCircuitById(race.circuitId);
                return (
                  <Button
                    key={race._id}
                    variant={selectedRace?._id === race._id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => loadRaceResults(race)}
                  >
                    <span className="mr-2">{circuit?.flag}</span>
                    {circuit?.name}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedRace && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {getCircuitById(selectedRace.circuitId)?.name}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="qualifying">
                  <TabsList>
                    <TabsTrigger value="qualifying">
                      <Clock className="h-4 w-4 mr-2" /> Clasificación
                    </TabsTrigger>
                    <TabsTrigger value="race">
                      <Trophy className="h-4 w-4 mr-2" /> Carrera
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="qualifying" className="space-y-4">
                    {drivers.map((driver) => {
                      const entry = qualifying.find(
                        (q) => q.driverId === driver._id
                      );
                      return (
                        <div key={driver._id} className="flex gap-4 items-center">
                          <div className="w-40">{driver.name}</div>
                          <Input
                            placeholder="m:ss.ms"
                            value={entry?.time || ""}
                            className="w-32 text-center"
                            inputMode="numeric"
                            onChange={(e) =>
                              updateQualifyingTime(driver._id, e.target.value)
                            }
                          />
                        </div>
                      );
                    })}

                    <Button onClick={handleSaveQualifying} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Clasificación
                    </Button>
                  </TabsContent>

                  <TabsContent value="race" className="space-y-4">
                    {drivers.map((_, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-12 font-bold">P{i + 1}</div>
                        <Select
                          value={raceResults[i] || ""}
                          onValueChange={(v) =>
                            updateRacePosition(i + 1, v)
                          }
                        >
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Seleccionar piloto" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((d) => (
                              <SelectItem key={d._id} value={d._id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                    <Label>Vuelta rápida</Label>
                    <Select value={fastestLap} onValueChange={setFastestLap}>
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {drivers.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={handleSaveRace} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Carrera
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;