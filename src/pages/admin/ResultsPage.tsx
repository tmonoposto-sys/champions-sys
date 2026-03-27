import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  listRaces, listDrivers, listTeams, listResults, listCustomCircuits,
  getRaceResult, saveQualifyingResult, saveRaceResult,
  Race, Driver, Team, QualifyingEntry, RaceResult, CustomCircuit, RaceEntry,
} from "@/services/api";
import { getCircuitById as getBuiltinCircuit } from "@/data/circuits";
import { Loader2, Trophy, Clock, Save, CheckCircle2, CircleDot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getOrderedQualifyingEntries, getOrderedRaceDriverIds } from "@/utils/raceOrder";

const QUALIFYING_TIME_REGEX = /^[0-9]:[0-5]\d\.\d{3}$/;
type QualyUiStatus = "OK" | "PEN" | "DSQ";

const ResultsPage: React.FC = () => {
  const { championship } = useAuth();
  const { toast } = useToast();

  const [races, setRaces] = useState<Race[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allResults, setAllResults] = useState<RaceResult[]>([]);
  const [customCircuits, setCustomCircuits] = useState<CustomCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [qualifying, setQualifying] = useState<QualifyingEntry[]>([]);
  const [raceResults, setRaceResults] = useState<string[]>([]);
  const [raceEntriesByDriver, setRaceEntriesByDriver] = useState<Record<string, { baseTime: string; status: "OK" | "DNF" | "DSQ" }>>({});
  const [fastestLap, setFastestLap] = useState<string>("none");
  const [saving, setSaving] = useState(false);
  const [qualyUiStatusByDriver, setQualyUiStatusByDriver] = useState<Record<string, QualyUiStatus>>({});

  const getCircuitInfo = useCallback((circuitId: string) => {
    const builtin = getBuiltinCircuit(circuitId);
    if (builtin) return builtin;
    const custom = customCircuits.find((c) => c._id === circuitId);
    if (custom) return { id: custom._id, name: custom.name, circuit: custom.circuit, country: custom.country, flag: custom.flag };
    return null;
  }, [customCircuits]);

  const getTeamForDriver = useCallback((driverId: string) => {
    const driver = drivers.find((d) => d._id === driverId);
    if (!driver) return null;
    return teams.find((t) => t._id === driver.teamId) || null;
  }, [drivers, teams]);

  const completedRaceIds = useMemo(() => {
    return new Set(allResults.filter((r) => r.race && r.race.length > 0).map((r) => r.raceId));
  }, [allResults]);

  const selectedRace = useMemo(() => races.find((r) => r._id === selectedRaceId) || null, [races, selectedRaceId]);

  useEffect(() => {
    if (!championship) return;
    setLoading(true);

    Promise.all([
      listRaces(championship.code),
      listDrivers(championship.code),
      listTeams(championship.code),
      listResults(championship.code),
      listCustomCircuits(championship.code),
    ]).then(([racesRes, driversRes, teamsRes, resultsRes, circuitsRes]) => {
      const sortedRaces = racesRes.data ? racesRes.data.sort((a, b) => a.order - b.order) : [];
      setRaces(sortedRaces);
      if (driversRes.data) setDrivers(driversRes.data.filter((d) => d.estado !== "Expiloto"));
      if (teamsRes.data) setTeams(teamsRes.data);
      const results = resultsRes.data || [];
      setAllResults(results);
      if (circuitsRes.data) setCustomCircuits(circuitsRes.data);

      const completedIds = new Set(results.filter((r) => r.race && r.race.length > 0).map((r) => r.raceId));
      const nextPending = sortedRaces.find((r) => !completedIds.has(r._id));
      if (nextPending) {
        setSelectedRaceId(nextPending._id);
      } else if (sortedRaces.length > 0) {
        setSelectedRaceId(sortedRaces[sortedRaces.length - 1]._id);
      }

      setLoading(false);
    });
  }, [championship]);

  const loadRaceResults = useCallback(async (raceId: string) => {
    if (!championship) return;
    const result = await getRaceResult(championship.code, raceId);
    if (result.data) {
      const loadedQualifying = result.data.qualifying || [];
      setQualifying(loadedQualifying);
      const uiStatus: Record<string, QualyUiStatus> = {};
      drivers.forEach((driver) => {
        const entry = loadedQualifying.find((q) => q.driverId === driver._id);
        if ((entry?.status || "OK") === "DSQ") {
          uiStatus[driver._id] = "DSQ";
        } else if (Number(entry?.penaltySeconds || 0) > 0) {
          uiStatus[driver._id] = "PEN";
        } else {
          uiStatus[driver._id] = "OK";
        }
      });
      setQualyUiStatusByDriver(uiStatus);
      const orderedDriverIds = getOrderedRaceDriverIds(result.data);
      setRaceResults(orderedDriverIds);
      const byDriver: Record<string, { baseTime: string; status: "OK" | "DNF" | "DSQ" }> = {};
      (result.data.raceEntries || []).forEach((entry) => {
        byDriver[entry.driverId] = {
          baseTime: entry.baseTime || "",
          status: entry.status || "OK"
        };
      });
      setRaceEntriesByDriver(byDriver);
      setFastestLap(result.data.fastestLap || "none");
    } else {
      setQualifying([]);
      setRaceResults([]);
      setRaceEntriesByDriver({});
      setFastestLap("none");
      const uiStatus: Record<string, QualyUiStatus> = {};
      drivers.forEach((driver) => {
        uiStatus[driver._id] = "OK";
      });
      setQualyUiStatusByDriver(uiStatus);
    }
  }, [championship, drivers]);

  useEffect(() => {
    if (!selectedRaceId || !championship) return;
    loadRaceResults(selectedRaceId);
  }, [selectedRaceId, championship, loadRaceResults]);

  const formatQualifyingTime = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    const m = digits.slice(0, 1);
    const s = digits.slice(1, 3);
    const ms = digits.slice(3, 6);
    let formatted = m;
    if (digits.length >= 2) formatted += `:${s}`;
    if (digits.length >= 4) formatted += `.${ms}`;
    return formatted;
  };

  const updateQualifyingTime = (driverId: string, rawValue: string) => {
    if (rawValue === "") {
      setQualifying((prev) => prev.filter((q) => q.driverId !== driverId));
      setQualyUiStatusByDriver((prev) => ({ ...prev, [driverId]: "OK" }));
      return;
    }
    const formatted = formatQualifyingTime(rawValue);
    setQualifying((prev) =>
      prev.some((q) => q.driverId === driverId)
        ? prev.map((q) => (q.driverId === driverId ? { ...q, time: formatted } : q))
        : [...prev, { driverId, time: formatted }]
    );
  };

  const updateRacePosition = (position: number, driverId: string) => {
    setRaceResults((prev) => {
      const next = [...prev];
      while (next.length < position) next.push("");

      const oldIndex = next.indexOf(driverId);
      const displaced = next[position - 1];

      next[position - 1] = driverId;

      if (oldIndex !== -1 && oldIndex !== position - 1) {
        next[oldIndex] = displaced || "";
      } else if (displaced && displaced !== driverId) {
        const emptySlot = next.findIndex((v, i) => i !== position - 1 && !v);
        if (emptySlot !== -1) {
          next[emptySlot] = displaced;
        }
      }

      return next;
    });
    setRaceEntriesByDriver((prev) => {
      if (!driverId || prev[driverId]) return prev;
      return {
        ...prev,
        [driverId]: { baseTime: "", status: "OK" }
      };
    });
  };

  const updateRaceEntry = (
    driverId: string,
    patch: Partial<{ baseTime: string; status: "OK" | "DNF" | "DSQ" }>
  ) => {
    if (!driverId) return;
    setRaceEntriesByDriver((prev) => ({
      ...prev,
      [driverId]: {
        baseTime: prev[driverId]?.baseTime || "",
        status: prev[driverId]?.status || "OK",
        ...patch
      }
    }));
  };

  const updateQualifyingPenalty = (driverId: string, penaltySeconds: number) => {
    setQualifying((prev) =>
      prev.some((q) => q.driverId === driverId)
        ? prev.map((q) => (q.driverId === driverId ? { ...q, penaltySeconds } : q))
        : [...prev, { driverId, time: "", penaltySeconds, status: "OK" }]
    );
  };

  const updateQualifyingStatus = (driverId: string, status: "OK" | "DSQ") => {
    setQualifying((prev) =>
      prev.some((q) => q.driverId === driverId)
        ? prev.map((q) => (q.driverId === driverId ? { ...q, status } : q))
        : [...prev, { driverId, time: "", penaltySeconds: 0, status }]
    );
  };

  const cycleQualyStatus = (driverId: string) => {
    const current = qualyUiStatusByDriver[driverId] || "OK";
    const next: QualyUiStatus = current === "OK" ? "PEN" : current === "PEN" ? "DSQ" : "OK";
    setQualyUiStatusByDriver((prev) => ({ ...prev, [driverId]: next }));
    if (next === "DSQ") {
      updateQualifyingStatus(driverId, "DSQ");
      updateQualifyingPenalty(driverId, 0);
      return;
    }
    updateQualifyingStatus(driverId, "OK");
    if (next === "OK") {
      updateQualifyingPenalty(driverId, 0);
    }
  };

  const cycleRaceStatus = (driverId: string) => {
    const current = raceEntriesByDriver[driverId]?.status || "OK";
    const next: "OK" | "DNF" | "DSQ" = current === "OK" ? "DNF" : current === "DNF" ? "DSQ" : "OK";
    updateRaceEntry(driverId, { status: next });
  };

  const handleSaveQualifying = async () => {
    if (!championship || !selectedRace) return;
    const invalid = qualifying.some((q, index) => {
      const status = q.status || "OK";
      if (status === "DSQ") return false;
      if (!q.time || q.time == "") {
        qualifying.splice(index, 1);
        return false;
      }
      if (!QUALIFYING_TIME_REGEX.test(q.time)) return true;
      return false;
    });
    
    if (invalid) {
      toast({ title: "Error", description: "Formato inválido. Usa m:ss.ms", variant: "destructive" });
      return;
    }

    const validTimes = qualifying.filter((q) => (q.status || "OK") === "OK" && q.time && QUALIFYING_TIME_REGEX.test(q.time));
    const dsqAndNoTime = qualifying.filter((q) => (q.status || "OK") === "DSQ");
    const sortedQualifying = getOrderedQualifyingEntries(validTimes)
      .map((entry) => ({
        driverId: entry.driverId,
        time: validTimes.find((v) => v.driverId === entry.driverId)?.time || "",
        penaltySeconds: entry.penaltySeconds,
        status: entry.status
      }))
      .concat(dsqAndNoTime.map((entry) => ({
        driverId: entry.driverId,
        time: entry.time || "",
        penaltySeconds: Number(entry.penaltySeconds || 0),
        status: "DSQ" as const
      })));
    setSaving(true);
    const result = await saveQualifyingResult(championship.code, selectedRace._id, sortedQualifying);
    setSaving(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Clasificación guardada" });
    }
  };

  const handleSaveRace = async () => {
    if (!championship || !selectedRace) return;
    const orderedIds = raceResults.filter(Boolean);
    const trackedIds = Object.keys(raceEntriesByDriver).filter((driverId) => {
      const meta = raceEntriesByDriver[driverId];
      return (meta?.baseTime || "").trim() !== "" || (meta?.status || "OK") !== "OK";
    });
    const uniqueIds = Array.from(new Set([...orderedIds, ...trackedIds]));
    const raceEntries: RaceEntry[] = uniqueIds.map((driverId) => {
      const meta = raceEntriesByDriver[driverId];
      return {
        driverId,
        baseTime: meta?.baseTime || "",
        status: meta?.status || "OK"
      };
    });

    setSaving(true);
    const result = await saveRaceResult(
      championship.code,
      selectedRace._id,
      raceResults,
      fastestLap === "none" ? undefined : fastestLap,
      raceEntries
    );
    setSaving(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Resultados de carrera guardados" });
      setAllResults((prev) => {
        const exists = prev.find((r) => r.raceId === selectedRace._id);
        if (exists) {
          return prev.map((r) => r.raceId === selectedRace._id ? { ...r, race: raceResults, raceEntries } : r);
        }
        return [...prev, { championshipCode: championship.code, raceId: selectedRace._id, qualifying, race: raceResults, raceEntries, fastestLap }];
      });
    }
  };

  const driverOptions = useMemo(() =>
    drivers.map((d) => {
      const team = getTeamForDriver(d._id);
      return {
        value: d._id,
        label: `${d.number} ${d.name} ${team?.name || ""}`,
        render: (
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: team?.color || "#666" }} />
            <span className="font-bold text-xs w-5 text-center">{d.number}</span>
            <span className="truncate">{d.name}</span>
            {team && <span className="text-xs text-muted-foreground ml-auto truncate">{team.name}</span>}
          </div>
        ),
      };
    }),
  [drivers, getTeamForDriver]);

  const titularDrivers = useMemo(
    () => drivers.filter((driver) => driver.estado === "Titular"),
    [drivers]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 data-tour="page-results" className="text-2xl font-bold">Resultados</h2>

      <SearchableSelect
        value={selectedRaceId}
        onValueChange={setSelectedRaceId}
        placeholder="Selecciona una carrera"
        searchPlaceholder="Buscar carrera..."
        triggerClassName="h-14 text-base"
        options={races.map((race) => {
          const circuit = getCircuitInfo(race.circuitId);
          const isCompleted = completedRaceIds.has(race._id);
          return {
            value: race._id,
            label: `${race.order} ${circuit?.flag || ""} ${circuit?.name || race.circuitId}`,
            render: (
              <div className="flex items-center gap-3 w-full">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <CircleDot className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                )}
                <span className="font-bold w-6 text-center">{race.order}</span>
                <span>{circuit?.flag}</span>
                <span className="truncate">{circuit?.name || race.circuitId}</span>
              </div>
            ),
          };
        })}
      />

      {selectedRace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{getCircuitInfo(selectedRace.circuitId)?.flag}</span>
              {getCircuitInfo(selectedRace.circuitId)?.name}
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
                  const entry = qualifying.find((q) => q.driverId === driver._id);
                  const team = getTeamForDriver(driver._id);
                  const uiStatus = qualyUiStatusByDriver[driver._id] || ((entry?.status || "OK") === "DSQ" ? "DSQ" : Number(entry?.penaltySeconds || 0) > 0 ? "PEN" : "OK");
                  return (
                    <div key={driver._id} className="rounded-md border p-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: team?.color || "#666" }} />
                        <span className="font-bold text-sm w-6 text-center">{driver.number}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm">{driver.name}</div>
                          {team && <div className="truncate text-xs text-muted-foreground">{team.name}</div>}
                        </div>
                        <Input
                          placeholder="m:ss.ms"
                          value={entry?.time || ""}
                          className="w-28 text-center flex-shrink-0"
                          inputMode="numeric"
                          onChange={(e) => updateQualifyingTime(driver._id, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant={uiStatus === "OK" ? "outline" : uiStatus === "PEN" ? "secondary" : "destructive"}
                          size="sm"
                          className="h-8 min-w-[56px] px-2 text-xs"
                          onClick={() => cycleQualyStatus(driver._id)}
                        >
                          {uiStatus}
                        </Button>
                        {uiStatus === "PEN" && (
                          <Input
                            placeholder="+seg"
                            type="number"
                            min={0}
                            value={String(entry?.penaltySeconds ?? 0)}
                            className="h-8 w-20 text-center text-xs"
                            onChange={(e) => updateQualifyingPenalty(driver._id, Number(e.target.value || 0))}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button onClick={handleSaveQualifying} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Clasificación
                </Button>
              </TabsContent>

              <TabsContent value="race" className="space-y-4">
                {titularDrivers.map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-10 font-bold text-center text-sm">P{i + 1}</div>
                    <div className="flex-1">
                      <SearchableSelect
                        value={raceResults[i] || ""}
                        onValueChange={(v) => updateRacePosition(i + 1, v)}
                        placeholder="Seleccionar piloto"
                        searchPlaceholder="Buscar piloto..."
                        options={driverOptions}
                        renderSelected={(opt) => {
                          const d = drivers.find((dr) => dr._id === opt.value);
                          if (!d) return opt.label;
                          const team = getTeamForDriver(d._id);
                          return (
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: team?.color || "#666" }} />
                              <span className="font-bold text-xs">{d.number}</span>
                              <span className="truncate">{d.name}</span>
                              <span className="text-xs text-muted-foreground ml-auto truncate hidden sm:inline">{team?.name}</span>
                            </div>
                          );
                        }}
                      />
                    </div>
                    {raceResults[i] && (
                      <Button
                        type="button"
                        variant={
                          (raceEntriesByDriver[raceResults[i]]?.status || "OK") === "OK"
                            ? "outline"
                            : (raceEntriesByDriver[raceResults[i]]?.status || "OK") === "DNF"
                              ? "secondary"
                              : "destructive"
                        }
                        size="sm"
                        className="h-8 min-w-[56px] px-2 text-xs"
                        onClick={() => cycleRaceStatus(raceResults[i])}
                      >
                        {raceEntriesByDriver[raceResults[i]]?.status || "OK"}
                      </Button>
                    )}
                  </div>
                ))}

                <Label>Vuelta rápida</Label>
                <SearchableSelect
                  value={fastestLap}
                  onValueChange={setFastestLap}
                  placeholder="Ninguno"
                  searchPlaceholder="Buscar piloto..."
                  options={[
                    { value: "none", label: "Ninguno" },
                    ...driverOptions,
                  ]}
                />

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
  );
};

export default ResultsPage;
