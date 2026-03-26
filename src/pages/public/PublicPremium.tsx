import React, { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { BarChart3, Crown, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublicChampionship } from "./PublicLayout";
import { usePublicFiltersStore } from "@/stores/publicFiltersStore";
import {
  computeConstructorStats,
  computeDriverStats,
  getRemainingRacesCount,
  getTitleNeedRealistic,
  getTitleNeedTheoretical
} from "@/utils/analytics/championshipEngine";
import { compareEntities } from "@/utils/analytics/comparisons";
import { getEntityTrend } from "@/utils/analytics/trends";

const formatTrend = (trend: "up" | "down" | "flat") => {
  if (trend === "up") return "Subiendo";
  if (trend === "down") return "Bajando";
  return "Estable";
};

const PublicPremium: React.FC = () => {
  const { code = "" } = useParams<{ code: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { teams, drivers, races, results } = usePublicChampionship();
  const { getFilters, setFilters } = usePublicFiltersStore();
  const filters = getFilters(code);

  const driverStats = useMemo(() => computeDriverStats(drivers, races, results), [drivers, races, results]);
  const constructorStats = useMemo(
    () => computeConstructorStats(teams, drivers, races, results),
    [teams, drivers, races, results]
  );
  const remainingRaces = useMemo(() => getRemainingRacesCount(races, results), [races, results]);

  const activeStats = filters.mode === "drivers" ? driverStats : constructorStats;

  useEffect(() => {
    if (!code) return;
    const mode = searchParams.get("mode");
    const left = searchParams.get("left");
    const right = searchParams.get("right");
    const trend = Number(searchParams.get("trend") || "");
    const scope = searchParams.get("scope");

    const patch: Partial<typeof filters> = {};
    if (mode === "drivers" || mode === "constructors") patch.mode = mode;
    if (left) patch.leftEntityId = left;
    if (right) patch.rightEntityId = right;
    if ([3, 5, 8].includes(trend)) patch.trendWindow = trend;
    if (scope === "all" || scope === "completed") patch.raceScope = scope;

    if (Object.keys(patch).length) {
      setFilters(code, patch);
    }
    // Solo hydrate inicial desde URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (!code || !activeStats.length) return;
    const left = filters.leftEntityId || activeStats[0]?.id || "";
    const right = filters.rightEntityId || activeStats[1]?.id || activeStats[0]?.id || "";

    if (left !== filters.leftEntityId || right !== filters.rightEntityId) {
      setFilters(code, { leftEntityId: left, rightEntityId: right });
    }
  }, [activeStats, code, filters.leftEntityId, filters.rightEntityId, setFilters]);

  useEffect(() => {
    if (!code) return;
    const next = new URLSearchParams(searchParams);
    next.set("mode", filters.mode);
    next.set("left", filters.leftEntityId || "");
    next.set("right", filters.rightEntityId || "");
    next.set("trend", String(filters.trendWindow));
    next.set("scope", filters.raceScope);
    setSearchParams(next, { replace: true });
  }, [code, filters.leftEntityId, filters.mode, filters.raceScope, filters.rightEntityId, filters.trendWindow, searchParams, setSearchParams]);

  const leftEntity = activeStats.find((item) => item.id === filters.leftEntityId) || activeStats[0];
  const rightEntity = activeStats.find((item) => item.id === filters.rightEntityId) || activeStats[1] || activeStats[0];
  const comparison = leftEntity && rightEntity ? compareEntities(leftEntity, rightEntity) : null;
  const leftTrend = leftEntity ? getEntityTrend(leftEntity, filters.trendWindow) : null;
  const rightTrend = rightEntity ? getEntityTrend(rightEntity, filters.trendWindow) : null;

  const driversLeader = driverStats[0];
  const driversContender = driverStats[1];
  const constructorsLeader = constructorStats[0];
  const constructorsContender = constructorStats[1];

  const driversNeedTheoretical =
    driversLeader && driversContender
      ? getTitleNeedTheoretical(driversContender, driversLeader, remainingRaces, false)
      : null;
  const constructorsNeedTheoretical =
    constructorsLeader && constructorsContender
      ? getTitleNeedTheoretical(constructorsContender, constructorsLeader, remainingRaces, true)
      : null;

  const driversNeedRealistic =
    driversLeader && driversContender
      ? getTitleNeedRealistic(driversContender, driversLeader, remainingRaces, filters.trendWindow, {
          allEntities: driverStats,
          races,
          results,
          maxPointsPerRace: 26
        })
      : null;
  const constructorsNeedRealistic =
    constructorsLeader && constructorsContender
      ? getTitleNeedRealistic(constructorsContender, constructorsLeader, remainingRaces, filters.trendWindow, {
          allEntities: constructorStats,
          races,
          results,
          maxPointsPerRace: 44
        })
      : null;

  return (
    <div className="min-h-screen bg-background">
      <section className="gradient-f1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary-foreground">Panel Premium</h1>
              <p className="text-primary-foreground/70">
                Comparativas, tendencias y motor de campeonato para pilotos y constructores
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparativas y tendencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={filters.mode}
                onValueChange={(value) =>
                  setFilters(code, {
                    mode: value as "drivers" | "constructors",
                    leftEntityId: "",
                    rightEntityId: ""
                  })
                }
              >
                <TabsList>
                  <TabsTrigger value="drivers">Pilotos</TabsTrigger>
                  <TabsTrigger value="constructors">Constructores</TabsTrigger>
                </TabsList>
                <TabsContent value={filters.mode} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <select
                      className="border border-border rounded-md px-3 py-2 bg-background"
                      value={leftEntity?.id || ""}
                      onChange={(e) => setFilters(code, { leftEntityId: e.target.value })}
                    >
                      {activeStats.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border border-border rounded-md px-3 py-2 bg-background"
                      value={rightEntity?.id || ""}
                      onChange={(e) => setFilters(code, { rightEntityId: e.target.value })}
                    >
                      {activeStats.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border border-border rounded-md px-3 py-2 bg-background"
                      value={String(filters.trendWindow)}
                      onChange={(e) => setFilters(code, { trendWindow: Number(e.target.value) })}
                    >
                      <option value="3">Últimas 3</option>
                      <option value="5">Últimas 5</option>
                      <option value="8">Últimas 8</option>
                    </select>
                    <select
                      className="border border-border rounded-md px-3 py-2 bg-background"
                      value={filters.raceScope}
                      onChange={(e) => setFilters(code, { raceScope: e.target.value as "completed" | "all" })}
                    >
                      <option value="completed">Solo completadas</option>
                      <option value="all">Todas (vista general)</option>
                    </select>
                  </div>

                  {comparison && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{comparison.leftName} vs {comparison.rightName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p>Puntos: <strong>{comparison.leftPoints}</strong> vs <strong>{comparison.rightPoints}</strong></p>
                          <p>Victorias: <strong>{comparison.leftWins}</strong> vs <strong>{comparison.rightWins}</strong></p>
                          <p>Delta puntos: <strong>{comparison.pointsDelta > 0 ? "+" : ""}{comparison.pointsDelta}</strong></p>
                          <p>Delta victorias: <strong>{comparison.winsDelta > 0 ? "+" : ""}{comparison.winsDelta}</strong></p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Tendencia últimas {filters.trendWindow}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {leftTrend && (
                            <p>
                              <strong>{leftTrend.entityName}:</strong> {formatTrend(leftTrend.trend)} (prom. {leftTrend.average.toFixed(1)} pts)
                            </p>
                          )}
                          {rightTrend && (
                            <p>
                              <strong>{rightTrend.entityName}:</strong> {formatTrend(rightTrend.trend)} (prom. {rightTrend.average.toFixed(1)} pts)
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Qué necesita para ser campeón - Pilotos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {driversNeedTheoretical && driversNeedRealistic ? (
                  <>
                    <p className="flex items-center gap-2"><Swords className="w-4 h-4" /> Retador: <strong>{driversNeedTheoretical.contenderName}</strong></p>
                    <p>Líder actual: <strong>{driversNeedTheoretical.leaderName}</strong></p>
                    <p>Gap actual: <strong>{driversNeedTheoretical.pointsGapToLeader}</strong> pts</p>
                    <p>Carreras restantes: <strong>{driversNeedTheoretical.remainingRaces}</strong></p>
                    <p>Máximo teórico disponible: <strong>{driversNeedTheoretical.maxPointsAvailable}</strong> pts</p>
                    <p>Necesita al menos: <strong>{driversNeedTheoretical.minPointsToPassLeader}</strong> pts más que el líder</p>
                    <p>¿Sigue vivo matemáticamente?: <strong>{driversNeedTheoretical.canStillWin ? "Sí" : "No"}</strong></p>
                    <p className="pt-1 border-t">
                      Proyección realista: <strong>{driversNeedRealistic.projectedContenderFinal.toFixed(1)}</strong> vs{" "}
                      <strong>{driversNeedRealistic.projectedLeaderFinal.toFixed(1)}</strong>
                    </p>
                    <p>Prob. título (simulación directa): <strong>{driversNeedRealistic.contenderTitleProbabilityRaw.toFixed(2)}%</strong></p>
                    <p>Prob. título (ajustada): <strong>{driversNeedRealistic.contenderTitleProbability.toFixed(2)}%</strong></p>
                    <p>Probabilidad top3 (directa/ajustada): <strong>{driversNeedRealistic.contenderTop3ProbabilityRaw.toFixed(2)}%</strong> / <strong>{driversNeedRealistic.contenderTop3Probability.toFixed(2)}%</strong></p>
                    <p>Escenarios ganados: <strong>{driversNeedRealistic.contenderTitleScenarios}</strong> / {driversNeedRealistic.simulations}</p>
                    <p>Objetivo por carrera: <strong>{driversNeedRealistic.recommendedTargetPerRace.toFixed(1)} pts</strong></p>
                    <p>Desglose factores: forma {driversNeedRealistic.factorBreakdown.form.toFixed(2)} | sprint {driversNeedRealistic.factorBreakdown.sprint.toFixed(2)} | lluvia {driversNeedRealistic.factorBreakdown.rain.toFixed(2)} | pista {driversNeedRealistic.factorBreakdown.trackProfile.toFixed(2)}</p>
                    <p className="text-muted-foreground">{driversNeedRealistic.insight}</p>
                  </>
                ) : (
                  <p>No hay datos suficientes.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qué necesita para ser campeón - Constructores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {constructorsNeedTheoretical && constructorsNeedRealistic ? (
                  <>
                    <p className="flex items-center gap-2"><Crown className="w-4 h-4" /> Retador: <strong>{constructorsNeedTheoretical.contenderName}</strong></p>
                    <p>Líder actual: <strong>{constructorsNeedTheoretical.leaderName}</strong></p>
                    <p>Gap actual: <strong>{constructorsNeedTheoretical.pointsGapToLeader}</strong> pts</p>
                    <p>Carreras restantes: <strong>{constructorsNeedTheoretical.remainingRaces}</strong></p>
                    <p>Máximo teórico disponible: <strong>{constructorsNeedTheoretical.maxPointsAvailable}</strong> pts</p>
                    <p>Necesita al menos: <strong>{constructorsNeedTheoretical.minPointsToPassLeader}</strong> pts más que el líder</p>
                    <p>¿Sigue vivo matemáticamente?: <strong>{constructorsNeedTheoretical.canStillWin ? "Sí" : "No"}</strong></p>
                    <p className="pt-1 border-t">
                      Proyección realista: <strong>{constructorsNeedRealistic.projectedContenderFinal.toFixed(1)}</strong> vs{" "}
                      <strong>{constructorsNeedRealistic.projectedLeaderFinal.toFixed(1)}</strong>
                    </p>
                    <p>Prob. título (simulación directa): <strong>{constructorsNeedRealistic.contenderTitleProbabilityRaw.toFixed(2)}%</strong></p>
                    <p>Prob. título (ajustada): <strong>{constructorsNeedRealistic.contenderTitleProbability.toFixed(2)}%</strong></p>
                    <p>Probabilidad top3 (directa/ajustada): <strong>{constructorsNeedRealistic.contenderTop3ProbabilityRaw.toFixed(2)}%</strong> / <strong>{constructorsNeedRealistic.contenderTop3Probability.toFixed(2)}%</strong></p>
                    <p>Escenarios ganados: <strong>{constructorsNeedRealistic.contenderTitleScenarios}</strong> / {constructorsNeedRealistic.simulations}</p>
                    <p>Objetivo por carrera: <strong>{constructorsNeedRealistic.recommendedTargetPerRace.toFixed(1)} pts</strong></p>
                    <p>Desglose factores: forma {constructorsNeedRealistic.factorBreakdown.form.toFixed(2)} | sprint {constructorsNeedRealistic.factorBreakdown.sprint.toFixed(2)} | lluvia {constructorsNeedRealistic.factorBreakdown.rain.toFixed(2)} | pista {constructorsNeedRealistic.factorBreakdown.trackProfile.toFixed(2)}</p>
                    <p className="text-muted-foreground">{constructorsNeedRealistic.insight}</p>
                  </>
                ) : (
                  <p>No hay datos suficientes.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicPremium;
