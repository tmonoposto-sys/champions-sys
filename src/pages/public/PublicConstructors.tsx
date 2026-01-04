import React, { useMemo } from "react";
import { usePublicChampionship } from "./PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;

const PublicConstructors: React.FC = () => {
  const { teams, drivers, races, results } = usePublicChampionship();

  const standings = useMemo(() => {
    const stats = new Map<string, { points: number; wins: number }>();

    teams.forEach((team) => {
      stats.set(team?._id, { points: 0, wins: 0 });
    });

    results.forEach((result) => {
      const race = races.find((r) => r?._id === result.raceId);
      const points = race?.isSprint ? POINTS_SPRINT : POINTS_RACE;

      result.race.forEach((driverId, position) => {
        const driver = drivers.find((d) => d?._id === driverId);
        if (driver && driver.estado !== "Expiloto") {
          const current = stats.get(driver.teamId);
          if (current && points[position]) {
            current.points += points[position];
            if (position === 0) current.wins++;
          }
        }
      });

      if (result.fastestLap) {
        const driver = drivers.find((d) => d?._id === result.fastestLap);
        const flPosition = result.race.indexOf(result.fastestLap);
        if (driver && driver.estado !== "Expiloto" && flPosition >= 0 && flPosition < 10) {
          const current = stats.get(driver.teamId);
          if (current) current.points += POINTS_FASTEST_LAP;
        }
      }
    });

    return teams
      .map((team) => {
        const s = stats.get(team?._id) || { points: 0, wins: 0 };
        const teamDrivers = drivers.filter((d) => d.teamId === team?._id && d.estado !== "Expiloto");
        return {
          team,
          drivers: teamDrivers,
          ...s,
          position: 0,
        };
      })
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
      .map((s, i) => ({ ...s, position: i + 1 }));
  }, [teams, drivers, results, races]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clasificación de Constructores</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos</TableHead>
                <TableHead>Escudería</TableHead>
                <TableHead>Pilotos</TableHead>
                <TableHead className="text-center">Victorias</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((s) => (
                <TableRow key={s.team?._id}>
                  <TableCell className="font-bold">{s.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: s.team.color }}
                      />
                      <span className="font-medium">{s.team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {s.drivers.map((d) => d.name).join(", ") || "Sin pilotos"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{s.wins}</TableCell>
                  <TableCell className="text-right font-bold">{s.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicConstructors;
