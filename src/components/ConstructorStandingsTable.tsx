import { useState } from 'react';
import { ConstructorStanding, Driver, TeamPrincipal } from '@/types/championship';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  standings: ConstructorStanding[];
  drivers: Driver[];
  teamPrincipals: TeamPrincipal[];
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

export const ConstructorStandingsTable = ({ standings, drivers, teamPrincipals, compact = false }: Props) => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const displayStandings = compact ? standings.slice(0, 5) : standings;

  const getTeamDrivers = (teamId: string) => {
    return drivers.filter(driver => driver.team === teamId);
  };

  const getTeamPrincipal = (teamId: string) => {
    return teamPrincipals.find(tp => tp.teamId === teamId);
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">POS</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">EQUIPO</th>
            {!compact && (
              <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground hidden sm:table-cell">VICTORIAS</th>
            )}
            <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">PTS</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {displayStandings.map((standing, index) => {
            const teamDrivers = getTeamDrivers(standing.team.id);
            const principal = getTeamPrincipal(standing.team.id);
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
                  <td className="py-4 px-2">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded text-sm font-bold",
                        standing.position === 1 && "bg-primary text-primary-foreground",
                        standing.position === 2 && "bg-muted-foreground text-background",
                        standing.position === 3 && "bg-amber-600 text-foreground",
                        standing.position > 3 && "text-foreground"
                      )}
                    >
                      {standing.position}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-10 rounded"
                        style={{ backgroundColor: standing.team.color }}
                      />
                      <div>
                        <span className="font-bold text-foreground">{standing.team.name}</span>
                        {principal && (
                          <p className="text-xs text-muted-foreground">Jefe: {principal.name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {!compact && (
                    <td className="py-4 px-2 text-center hidden sm:table-cell">
                      <span className="text-sm font-semibold text-foreground">{standing.wins}</span>
                    </td>
                  )}
                  <td className="py-4 px-2 text-right">
                    <span className="text-lg font-bold text-foreground">{standing.points}</span>
                  </td>
                  <td className="py-4 px-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${standing.team.id}-drivers`}>
                    <td colSpan={5} className="bg-muted/20 px-4 py-3">
                      <div className="pl-8">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Pilotos del equipo:</p>
                        <div className="space-y-2">
                          {teamDrivers.map(driver => (
                            <div key={driver.id} className="flex items-center gap-3 text-foreground">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-mono">#{driver.number}</span>
                              <span className="font-medium">{driver.name}</span>
                              <Badge variant={getStatusVariant(driver.estado)}>{driver.estado}</Badge>
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