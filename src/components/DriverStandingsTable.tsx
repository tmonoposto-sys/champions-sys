import { DriverStanding } from '@/types/championship';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
  standings: DriverStanding[];
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

export const DriverStandingsTable = ({ standings, compact = false }: Props) => {
  const displayStandings = compact ? standings.slice(0, 5) : standings;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">POS</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">PILOTO</th>
            {!compact && (
              <>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground hidden sm:table-cell">EQUIPO</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground hidden lg:table-cell">ESTADO</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground hidden md:table-cell">VICTORIAS</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground hidden md:table-cell">PODIOS</th>
              </>
            )}
            <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">PTS</th>
          </tr>
        </thead>
        <tbody>
          {displayStandings.map((standing, index) => (
            <tr
              key={standing.driver.id}
              className={cn(
                "border-b border-border/50 hover:bg-muted/50 transition-colors animate-slide-up",
                standing.position <= 3 && "bg-card"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
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
                    className="w-1 h-10 rounded-full"
                    style={{ backgroundColor: standing.team?.color || '#666' }}
                  />
                  <span className="text-lg font-bold text-muted-foreground w-6">{standing.driver.number}</span>
                  <div>
                    <p className="font-bold text-foreground">{standing.driver.name}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">{standing.team?.name}</p>
                  </div>
                </div>
              </td>
              {!compact && (
              <>
                  <td className="py-4 px-2 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{standing.team?.name}</span>
                  </td>
                  <td className="py-4 px-2 text-center hidden lg:table-cell">
                    <Badge variant={getStatusVariant(standing.driver.estado)}>{standing.driver.estado}</Badge>
                  </td>
                  <td className="py-4 px-2 text-center hidden md:table-cell">
                    <span className="text-sm font-semibold text-foreground">{standing.wins}</span>
                  </td>
                  <td className="py-4 px-2 text-center hidden md:table-cell">
                    <span className="text-sm font-semibold text-foreground">{standing.podiums}</span>
                  </td>
                </>
              )}
              <td className="py-4 px-2 text-right">
                <span className="text-lg font-bold text-foreground">{standing.points}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
