import { ChevronRight, Trophy, Clock, Zap, CloudRain, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Driver, Race, RaceResult, Team } from '@/services/api';
import { F1_CIRCUITS } from '@/data/circuits';
import { Switch } from '@/components/ui/switch';
import { getOrderedQualifyingEntries, getOrderedRaceEntries } from '@/utils/raceOrder';

type CircuitInfo = { id: string; name: string; circuit: string; country: string; flag: string } | null;

interface Props {
  gp: Race;
  result?: RaceResult;
  getDriverById: (id: string) => Driver | undefined;
  getTeamById: (teamId: string) => Team | undefined;
  getCircuitInfo?: (circuitId: string) => CircuitInfo;
  drivers: Driver[];
}

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;

export const RaceCard = ({ gp, result, getDriverById, getTeamById, getCircuitInfo, drivers }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [gapMode, setGapMode] = useState<'leader' | 'interval'>('leader');
  const hasResults = !!result?.qualifying?.length;
  const complete = hasResults && !!result?.race?.length;

  const parseLapTimeToSeconds = (lapTime: string): number | null => {
    if (!lapTime || lapTime === "--:--") return null;
    const normalized = lapTime.trim().replace(",", ".");
    if (!normalized.includes(":")) return null;
    const [minutesPart, secondsPart] = normalized.split(":");
    const minutes = Number(minutesPart);
    const seconds = Number(secondsPart);
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  };

  const getEffectiveQualySeconds = (entry: { time: string; penaltySeconds?: number; status?: "OK" | "DSQ" }) => {
    if (entry.status === "DSQ") return null;
    const base = parseLapTimeToSeconds(entry.time || "");
    if (base === null) return null;
    return base + Number(entry.penaltySeconds || 0);
  };

  const orderedQualifying = getOrderedQualifyingEntries(result?.qualifying ?? []);
  const qualyWithTimes = orderedQualifying.map((q) => {
    const driver = drivers?.find(d => d._id === q.driverId);
    if (!driver) return null;
    return {
      ...driver,
      time: q.time,
      penaltySeconds: q.penaltySeconds,
      status: q.status
    };
  }).filter(Boolean);

  const driversWithoutTime = drivers.filter(d => d.estado == "Titular")
    .filter(d => !(result?.qualifying ?? [])?.some(q => q.driverId === d._id))
    .map(d => ({
      ...d,
      time: "--:--",
      penaltySeconds: 0,
      status: "OK" as const
    }));

  const dataShowQualy = [
    ...qualyWithTimes,
    ...driversWithoutTime
  ];

  // Misma parrilla que la columna de clasificación (incluye titulares sin tiempo al final)
  const qualyPositionByDriver = new Map<string, number>();
  dataShowQualy.forEach((entry, index) => {
    qualyPositionByDriver.set(entry._id, index + 1);
  });
  const orderedRaceEntries = getOrderedRaceEntries(result);

  const getPositionStyle = (position: number) => {
    if (position === 0) return "bg-primary text-primary-foreground";
    if (position === 1) return "bg-muted-foreground text-background";
    if (position === 2) return "bg-amber-600 text-foreground";
    return "bg-muted text-foreground";
  };

  const circuit = getCircuitInfo
    ? getCircuitInfo(gp.circuitId)
    : F1_CIRCUITS.find(c => c.id === gp.circuitId) ?? null;
  const flag = circuit?.flag ?? "🏁";
  const name = circuit?.name ?? gp.circuitId ?? "Circuito";
  const circuitName = circuit?.circuit ?? "";

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg overflow-hidden transition-all hover:border-primary/50",
        expanded && "ring-2 ring-primary/20"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left gap-2 sm:gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <span className="text-2xl sm:text-3xl flex-shrink-0">{flag}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{circuitName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {gp.isSprint && (
            <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-500/20 text-amber-500 text-[10px] sm:text-xs font-semibold rounded">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">SPRINT</span>
            </span>
          )}
          {gp.isRain && (
            <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500/20 text-blue-500 text-[10px] sm:text-xs font-semibold rounded">
              <CloudRain className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">LLUVIA</span>
            </span>
          )}
          {complete ? (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap">
              <span className="hidden xs:inline">COMPLETADO</span>
              <span className="xs:hidden">✓</span>
            </span>
          ) : (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted text-muted-foreground text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap">
              <span className="hidden xs:inline">PENDIENTE</span>
              <span className="xs:hidden">○</span>
            </span>
          )}
          <ChevronRight
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform",
              expanded && "rotate-90"
            )}
          />
        </div>
      </button>

      {expanded && hasResults && (
        <div className="border-t border-border p-3 sm:p-4 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Qualifying Results */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">Clasificación</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] sm:text-xs", gapMode === "leader" ? "text-foreground font-semibold" : "text-muted-foreground")}>
                    Leader
                  </span>
                  <Switch
                    checked={gapMode === "interval"}
                    onCheckedChange={(checked) => setGapMode(checked ? "interval" : "leader")}
                  />
                  <span className={cn("text-[10px] sm:text-xs", gapMode === "interval" ? "text-foreground font-semibold" : "text-muted-foreground")}>
                    Interval
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {dataShowQualy?.map((entry, index) => {
                  const team = getTeamById(entry.teamId);
                  const leaderTime = getEffectiveQualySeconds(dataShowQualy[0]);
                  const currentTime = getEffectiveQualySeconds(entry);
                  const previousTime = index > 0 ? getEffectiveQualySeconds(dataShowQualy[index - 1]) : null;
                  let gapText = "--";
                  if (index === 0 && currentTime !== null) {
                    gapText = gapMode === "leader" ? "LEADER" : "INTERVAL";
                  } else if (currentTime !== null) {
                    if (gapMode === "leader" && leaderTime !== null) {
                      gapText = `+${(currentTime - leaderTime).toFixed(3)}s`;
                    } else if (gapMode === "interval" && previousTime !== null) {
                      gapText = `+${(currentTime - previousTime).toFixed(3)}s`;
                    }
                  }

                  return (
                    <div
                      key={`qual-${index}`}
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      <span
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded text-[10px] sm:text-xs font-bold flex-shrink-0",
                          getPositionStyle(index)
                        )}
                      >
                        {index + 1}
                      </span>
                      <div
                        className="w-0.5 sm:w-1 h-4 sm:h-5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: team?.color || '#666' }}
                      />
                      <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
                        <span className="text-foreground font-medium truncate">{entry?.name || 'Unknown'}</span>
                        <span 
                          className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ 
                            backgroundColor: team?.color ? `${team.color}20` : '#66666620',
                            color: team?.color || '#666'
                          }}
                        >
                          {team?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end min-w-[62px]">
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {entry.status === "DSQ" ? "DSQ" : entry.time}
                          {(entry.penaltySeconds || 0) > 0 && entry.status !== "DSQ" ? ` (+${entry.penaltySeconds}s)` : ""}
                        </span>
                        <span className="text-[10px] sm:text-xs text-primary/80 font-mono whitespace-nowrap">{gapText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Race Results */}
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                {gp.isSprint ? (
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                ) : (
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                )}
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  {gp.isSprint ? 'Sprint' : 'Carrera'}
                </h4>
                {gp.isSprint && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">(Puntos reducidos)</span>
                )}
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {orderedRaceEntries.map((raceEntry, index) => {
                  const driverId = raceEntry.driverId;
                  const driver = getDriverById(driverId);
                  const team = driver ? getTeamById(driver.teamId) : undefined;
                  const qualyPosition = qualyPositionByDriver.get(driverId);
                  const racePosition = index + 1;
                  const delta =
                    qualyPosition !== undefined ? qualyPosition - racePosition : null;
                  const racePoints = gp.isSprint ? POINTS_SPRINT : POINTS_RACE;
                  const isClassified = raceEntry.status === "OK";
                  let points = isClassified ? (racePoints[index] || 0) : 0;
                  const hasFastestLap = result.fastestLap === driverId;
                  const fastestLapEligible = hasFastestLap && index < 10;
                  if (fastestLapEligible && isClassified) {
                    points += POINTS_FASTEST_LAP;
                  }
                  return (
                    <div
                      key={`race-${index}`}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm",
                        hasFastestLap && "bg-purple-500/10 -mx-1 sm:-mx-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded"
                      )}
                    >
                      <span
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded text-[10px] sm:text-xs font-bold flex-shrink-0",
                          getPositionStyle(index)
                        )}
                      >
                        {index + 1}
                      </span>
                      <div
                        className="w-0.5 sm:w-1 h-4 sm:h-5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: team?.color || '#666' }}
                      />
                      <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
                        <span className="text-foreground font-medium truncate">{driver?.name || 'Unknown'}</span>
                        <span 
                          className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ 
                            backgroundColor: team?.color ? `${team.color}20` : '#66666620',
                            color: team?.color || '#666'
                          }}
                        >
                          {team?.name || 'Unknown'}
                        </span>
                        {hasFastestLap && (
                          <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-purple-500 font-semibold">
                            <Timer className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden xs:inline">VR</span>
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-semibold whitespace-nowrap min-w-[44px] text-right",
                          delta !== null && delta > 0 && "text-green-500",
                          delta !== null && delta < 0 && "text-red-500",
                          delta !== null && delta === 0 && "text-muted-foreground"
                        )}
                      >
                        {delta === null
                          ? "—"
                          : delta > 0
                            ? `▲ +${delta}`
                            : delta < 0
                              ? `▼ ${delta}`
                              : "↔ 0"}
                      </span>
                      {points > 0 && (
                        <span className={cn(
                          "text-[10px] sm:text-xs font-semibold whitespace-nowrap",
                          fastestLapEligible ? "text-purple-500" : "text-primary"
                        )}>
                          +{points}
                        </span>
                      )}
                      {raceEntry.status !== "OK" && (
                        <span className="text-[10px] sm:text-xs px-1 py-0.5 rounded bg-red-500/15 text-red-500 font-semibold">
                          {raceEntry.status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {expanded && !hasResults && (
        <div className="border-t border-border p-6 sm:p-8 text-center animate-fade-in">
          <p className="text-sm sm:text-base text-muted-foreground">Sin resultados todavía</p>
        </div>
      )}
    </div>
  );
};