import { ChevronRight, Trophy, Clock, Zap, CloudRain, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Driver, Race, RaceResult, Team } from '@/services/api';
import { F1_CIRCUITS } from '@/data/circuits';

interface Props {
  gp: Race;
  result?: RaceResult;
  getDriverById: (id: string) => Driver | undefined;
  getTeamById: (teamId: string) => Team | undefined;
}

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;

export const RaceCard = ({ gp, result, getDriverById, getTeamById }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const hasResults = result && result?.qualifying?.length > 0;
  const complete = result && result?.qualifying?.length > 0 && result?.race.length > 0;

  const getPositionStyle = (position: number) => {
    if (position === 0) return "bg-primary text-primary-foreground";
    if (position === 1) return "bg-muted-foreground text-background";
    if (position === 2) return "bg-amber-600 text-foreground";
    return "bg-muted text-foreground";
  };

  const circuit = F1_CIRCUITS.find(c => c.id === gp.circuitId);

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
          <span className="text-2xl sm:text-3xl flex-shrink-0">{circuit.flag}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{circuit.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{circuit.circuit}</p>
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
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">Clasificación</h4>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {result?.qualifying?.map((entry, index) => {
                  const driver = getDriverById(entry.driverId);
                  const team = driver ? getTeamById(driver.teamId) : undefined;
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
                        <span className="text-foreground font-medium truncate">{driver?.name || 'Unknown'}</span>
                        <span 
                          className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ 
                            backgroundColor: `${team?.color}20` || '#66666620',
                            color: team?.color || '#666'
                          }}
                        >
                          {team?.name || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-mono whitespace-nowrap">{entry.time}</span>
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
                {result?.race?.map((driverId, index) => {
                  const driver = getDriverById(driverId);
                  const team = driver ? getTeamById(driver.teamId) : undefined;
                  const racePoints = gp.isSprint ? POINTS_SPRINT : POINTS_RACE;
                  let points = racePoints[index] || 0;
                  const hasFastestLap = result.fastestLap === driverId;
                  const fastestLapEligible = hasFastestLap && index < 10;
                  if (fastestLapEligible) {
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
                            backgroundColor: `${team?.color}20` || '#66666620',
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
                      {points > 0 && (
                        <span className={cn(
                          "text-[10px] sm:text-xs font-semibold whitespace-nowrap",
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
        <div className="border-t border-border p-6 sm:p-8 text-center animate-fade-in">
          <p className="text-sm sm:text-base text-muted-foreground">Sin resultados todavía</p>
        </div>
      )}
    </div>
  );
};