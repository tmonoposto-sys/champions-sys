import React, { useMemo } from "react";
import { usePublicChampionship } from "./PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;

const PublicDrivers: React.FC = () => {
  const { drivers, races, results, getTeamById } = usePublicChampionship();

  const standings = useMemo(() => {
    const stats = new Map<string, { points: number; wins: number; podiums: number }>();

    drivers
      .filter((d) => d.estado !== "Expiloto")
      .forEach((driver) => {
        stats.set(driver?._id, { points: 0, wins: 0, podiums: 0 });
      });

    results.forEach((result) => {
      const race = races.find((r) => r?._id === result.raceId);
      const points = race?.isSprint ? POINTS_SPRINT : POINTS_RACE;

      result.race.forEach((driverId, position) => {
        const current = stats.get(driverId);
        if (current && points[position]) {
          current.points += points[position];
          if (position === 0) current.wins++;
          if (position < 3) current.podiums++;
        }
      });

      if (result.fastestLap) {
        const flPosition = result.race.indexOf(result.fastestLap);
        if (flPosition >= 0 && flPosition < 10) {
          const current = stats.get(result.fastestLap);
          if (current) current.points += POINTS_FASTEST_LAP;
        }
      }
    });

    return drivers
      .filter((d) => d.estado !== "Expiloto")
      .map((driver) => {
        const s = stats.get(driver?._id) || { points: 0, wins: 0, podiums: 0 };
        const team = getTeamById(driver.teamId);
        return {
          driver,
          team,
          ...s,
          position: 0,
        };
      })
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
      .map((s, i) => ({ ...s, position: i + 1 }));
  }, [drivers, results, races, getTeamById]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clasificación de Pilotos</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos</TableHead>
                <TableHead>Piloto</TableHead>
                <TableHead>Escudería</TableHead>
                <TableHead className="text-center">Victorias</TableHead>
                <TableHead className="text-center">Podios</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((s) => (
                <TableRow key={s.driver?._id}>
                  <TableCell className="font-bold">{s.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: s.team?.color || "#888" }}
                      >
                        {s.driver.number}
                      </div>
                      <span className="font-medium">{s.driver.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: s.team?.color || "#888" }}
                      />
                      {s.team?.name || "Sin equipo"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{s.wins}</TableCell>
                  <TableCell className="text-center">{s.podiums}</TableCell>
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

export default PublicDrivers;
