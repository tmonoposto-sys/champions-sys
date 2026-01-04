import { GrandPrix, RaceResult, Driver, Team, PointsSystem } from '@/types/championship';
import { ChevronRight, Trophy, Clock, Zap, CloudRain, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  gp: GrandPrix;
  result?: RaceResult;
  getDriverById: (id: number) => Driver | undefined;
  getTeamById: (teamId: string) => Team | undefined;
  pointsSystem: PointsSystem;
}

export const RaceCard = ({ gp, result, getDriverById, getTeamById, pointsSystem }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const hasResults = result && result?.qualifying?.length > 0;
  const complete = result && result?.qualifying?.length > 0 && result?.race.length > 0;

  const getPositionStyle = (position: number) => {
    if (position === 0) return "bg-primary text-primary-foreground";
    if (position === 1) return "bg-muted-foreground text-background";
    if (position === 2) return "bg-amber-600 text-foreground";
    return "bg-muted text-foreground";
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg overflow-hidden transition-all hover:border-primary/50",
        expanded && "ring-2 ring-primary/20"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{gp.flag}</span>
          <div>
            <h3 className="font-bold text-foreground">{gp.name}</h3>
            <p className="text-sm text-muted-foreground">{gp.circuit}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {gp.isSprint && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded">
              <Zap className="w-3 h-3" />
              SPRINT
            </span>
          )}
          {gp.isRain && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-500 text-xs font-semibold rounded">
              <CloudRain className="w-3 h-3" />
              LLUVIA
            </span>
          )}
          {complete ? (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
              COMPLETADO
            </span>
          ) : (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded">
              PENDIENTE
            </span>
          )}
          <ChevronRight
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              expanded && "rotate-90"
            )}
          />
        </div>
      </button>

      {expanded && hasResults && (
        <div className="border-t border-border p-4 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Qualifying Results */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-foreground">Clasificación</h4>
              </div>
              <div className="space-y-2">
                {result?.qualifying?.map((entry, index) => {
                  const driver = getDriverById(entry.driverId);
                  const team = driver ? getTeamById(driver.team) : undefined;
                  return (
                    <div
                      key={`qual-${index}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={cn(
                          "w-6 h-6 flex items-center justify-center rounded text-xs font-bold",
                          getPositionStyle(index)
                        )}
                      >
                        {index + 1}
                      </span>
                      <div
                        className="w-1 h-5 rounded-full"
                        style={{ backgroundColor: team?.color || '#666' }}
                      />
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-foreground font-medium">{driver?.name || 'Unknown'}</span>
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${team?.color}20` || '#66666620',
                            color: team?.color || '#666'
                          }}
                        >
                          {team?.name || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{entry.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Race Results */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {gp.isSprint ? (
                  <Zap className="w-4 h-4 text-amber-500" />
                ) : (
                  <Trophy className="w-4 h-4 text-primary" />
                )}
                <h4 className="font-semibold text-foreground">
                  {gp.isSprint ? 'Sprint' : 'Carrera'}
                </h4>
                {gp.isSprint && (
                  <span className="text-xs text-muted-foreground">(Puntos reducidos)</span>
                )}
              </div>
              <div className="space-y-2">
                {result?.race?.map((driverId, index) => {
                  const driver = getDriverById(driverId);
                  const team = driver ? getTeamById(driver.team) : undefined;
                  const racePoints = gp.isSprint ? pointsSystem.sprint : pointsSystem.race;
                  let points = racePoints[index] || 0;
                  const hasFastestLap = result.fastestLap === driverId;
                  const fastestLapEligible = hasFastestLap && index < 10;
                  if (fastestLapEligible) {
                    points += pointsSystem.fastestLap;
                  }
                  return (
                    <div
                      key={`race-${index}`}
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        hasFastestLap && "bg-purple-500/10 -mx-2 px-2 py-1 rounded"
                      )}
                    >
                      <span
                        className={cn(
                          "w-6 h-6 flex items-center justify-center rounded text-xs font-bold",
                          getPositionStyle(index)
                        )}
                      >
                        {index + 1}
                      </span>
                      <div
                        className="w-1 h-5 rounded-full"
                        style={{ backgroundColor: team?.color || '#666' }}
                      />
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-foreground font-medium">{driver?.name || 'Unknown'}</span>
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${team?.color}20` || '#66666620',
                            color: team?.color || '#666'
                          }}
                        >
                          {team?.name || 'Unknown'}
                        </span>
                        {hasFastestLap && (
                          <span className="flex items-center gap-1 text-xs text-purple-500 font-semibold">
                            <Timer className="w-3 h-3" />
                            VR
                          </span>
                        )}
                      </div>
                      {points > 0 && (
                        <span className={cn(
                          "text-xs font-semibold",
                          fastestLapEligible ? "text-purple-500" : "text-primary"
                        )}>
                          +{points}
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
        <div className="border-t border-border p-8 text-center animate-fade-in">
          <p className="text-muted-foreground">Sin resultados todavía</p>
        </div>
      )}
    </div>
  );
};
