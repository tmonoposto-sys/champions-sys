import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConstructorStanding } from '@/utils/processData';
import { Driver } from '@/services/api';

interface Props {
  standings: ConstructorStanding[];
  drivers: Driver[];
  compact?: boolean;
}

const getStatusVariant = (estado: string) => {
  switch (estado) {
    case 'Titular':
      return 'default';
    case 'Reserva':
      return 'secondary';
    case 'Expiloto':
      return 'outline';
    default:
      return 'default';
  }
};

export const ConstructorStandingsTable = ({ standings, drivers, compact = false }: Props) => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const displayStandings = compact ? standings.slice(0, 5) : standings;

  const getTeamDrivers = (teamId: string) => {
    return drivers.filter(driver => driver.teamId === teamId);
  };

  // const getTeamPrincipal = (teamId: string) => {
  //   return teamPrincipals.find(tp => tp.teamId === teamId);
  // };

  const toggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-muted-foreground">POS</th>
            <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-muted-foreground">EQUIPO</th>
            {!compact && (
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-muted-foreground hidden sm:table-cell">VICTORIAS</th>
            )}
            <th className="text-right py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-muted-foreground">PTS</th>
            <th className="w-8 sm:w-10"></th>
          </tr>
        </thead>
        <tbody>
          {displayStandings.map((standing, index) => {
            const teamDrivers = getTeamDrivers(standing.team.id);
            //const principal = getTeamPrincipal(standing.team.id);
            const isExpanded = expandedTeam === standing.team.id;

            return (
              <>
                <tr
                  key={standing.team.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/50 transition-colors animate-slide-up cursor-pointer",
                    standing.position <= 3 && "bg-card",
                    isExpanded && "bg-muted/30"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => toggleTeam(standing.team.id)}
                >
                  <td className="py-2 sm:py-4 px-1 sm:px-2">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded text-xs sm:text-sm font-bold",
                        standing.position === 1 && "bg-primary text-primary-foreground",
                        standing.position === 2 && "bg-muted-foreground text-background",
                        standing.position === 3 && "bg-amber-600 text-foreground",
                        standing.position > 3 && "text-foreground"
                      )}
                    >
                      {standing.position}
                    </span>
                  </td>
                  <td className="py-2 sm:py-4 px-1 sm:px-2">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div
                        className="w-2 sm:w-4 h-8 sm:h-10 rounded flex-shrink-0"
                        style={{ backgroundColor: standing.team.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm sm:text-base text-foreground block truncate">{standing.team.name}</span>
                        {/* {principal && (
                          <p className="text-xs text-muted-foreground">Jefe: {principal.name}</p>
                        )} */}
                      </div>
                    </div>
                  </td>
                  {!compact && (
                    <td className="py-2 sm:py-4 px-1 sm:px-2 text-center hidden sm:table-cell">
                      <span className="text-xs sm:text-sm font-semibold text-foreground">{standing.wins}</span>
                    </td>
                  )}
                  <td className="py-2 sm:py-4 px-1 sm:px-2 text-right">
                    <span className="text-sm sm:text-base md:text-lg font-bold text-foreground">{standing.points}</span>
                  </td>
                  <td className="py-2 sm:py-4 px-1 sm:px-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${standing.team.id}-drivers`}>
                    <td colSpan={5} className="bg-muted/20 px-2 sm:px-4 py-2 sm:py-3">
                      <div className="pl-4 sm:pl-8">
                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">Pilotos del equipo:</p>
                        <div className="space-y-1.5 sm:space-y-2">
                          {teamDrivers.map(driver => (
                            <div key={driver._id} className="flex items-center gap-2 sm:gap-3 text-foreground flex-wrap">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">#{driver.number}</span>
                              <span className="font-medium text-xs sm:text-sm">{driver.name}</span>
                              <Badge variant={getStatusVariant(driver.estado)} className="text-[10px] sm:text-xs">
                                {driver.estado}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};