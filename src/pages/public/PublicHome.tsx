import React, { useMemo } from "react";
import { usePublicChampionship } from "./PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Flag } from "lucide-react";

interface DriverStanding {
  driver: { id: string; name: string; number: number };
  team: { id: string; name: string; color: string };
  points: number;
  wins: number;
  position: number;
}

interface ConstructorStanding {
  team: { id: string; name: string; color: string };
  points: number;
  wins: number;
  position: number;
}

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;

const PublicHome: React.FC = () => {
  const { championship, teams, drivers, races, results, getTeamById } = usePublicChampionship();

  const driverStandings = useMemo((): DriverStanding[] => {
    const standings = new Map<string, { points: number; wins: number }>();

    drivers
      .filter((d) => d.estado !== "Expiloto")
      .forEach((driver) => {
        standings.set(driver?._id, { points: 0, wins: 0 });
      });

    results.forEach((result) => {
      const race = races.find((r) => r?._id === result.raceId);
      const points = race?.isSprint ? POINTS_SPRINT : POINTS_RACE;

      result.race.forEach((driverId, position) => {
        const current = standings.get(driverId);
        if (current && points[position]) {
          current.points += points[position];
          if (position === 0) current.wins++;
        }
      });

      // Fastest lap
      if (result.fastestLap) {
        const flPosition = result.race.indexOf(result.fastestLap);
        if (flPosition >= 0 && flPosition < 10) {
          const current = standings.get(result.fastestLap);
          if (current) current.points += POINTS_FASTEST_LAP;
        }
      }
    });

    return drivers
      .filter((d) => d.estado !== "Expiloto")
      .map((driver) => {
        const stats = standings.get(driver?._id) || { points: 0, wins: 0 };
        const team = getTeamById(driver.teamId);
        return {
          driver: { id: driver?._id, name: driver.name, number: driver.number },
          team: team ? { id: team?._id, name: team.name, color: team.color } : { id: "", name: "Sin equipo", color: "#888" },
          points: stats.points,
          wins: stats.wins,
          position: 0,
        };
      })
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
      .map((s, i) => ({ ...s, position: i + 1 }));
  }, [drivers, results, races, getTeamById]);

  const constructorStandings = useMemo((): ConstructorStanding[] => {
    const standings = new Map<string, { points: number; wins: number }>();

    teams.forEach((team) => {
      standings.set(team?._id, { points: 0, wins: 0 });
    });

    results.forEach((result) => {
      const race = races.find((r) => r?._id === result.raceId);
      const points = race?.isSprint ? POINTS_SPRINT : POINTS_RACE;

      result.race.forEach((driverId, position) => {
        const driver = drivers.find((d) => d?._id === driverId);
        if (driver && driver.estado !== "Expiloto") {
          const current = standings.get(driver.teamId);
          if (current && points[position]) {
            current.points += points[position];
            if (position === 0) current.wins++;
          }
        }
      });

      // Fastest lap
      if (result.fastestLap) {
        const driver = drivers.find((d) => d?._id === result.fastestLap);
        const flPosition = result.race.indexOf(result.fastestLap);
        if (driver && driver.estado !== "Expiloto" && flPosition >= 0 && flPosition < 10) {
          const current = standings.get(driver.teamId);
          if (current) current.points += POINTS_FASTEST_LAP;
        }
      }
    });

    return teams
      .map((team) => {
        const stats = standings.get(team?._id) || { points: 0, wins: 0 };
        return {
          team: { id: team?._id, name: team.name, color: team.color },
          points: stats.points,
          wins: stats.wins,
          position: 0,
        };
      })
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
      .map((s, i) => ({ ...s, position: i + 1 }));
  }, [teams, drivers, results, races]);

  const completedRaces = results.length;
  const totalRaces = races.length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{completedRaces}/{totalRaces}</p>
            <p className="text-sm text-muted-foreground">Carreras</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{drivers.filter(d => d.estado === "Titular").length}</p>
            <p className="text-sm text-muted-foreground">Pilotos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Flag className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{teams.length}</p>
            <p className="text-sm text-muted-foreground">Escuderías</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{races.filter(r => r.isSprint).length}</p>
            <p className="text-sm text-muted-foreground">Sprints</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Driver Standings */}
        <Card>
          <CardHeader>
            <CardTitle>Clasificación de Pilotos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {driverStandings.slice(0, 10).map((standing) => (
                <div key={standing.driver.id} className="flex items-center gap-3">
                  <div className="w-8 text-center font-bold">{standing.position}</div>
                  <div
                    className="w-1 h-8 rounded"
                    style={{ backgroundColor: standing.team.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{standing.driver.name}</p>
                    <p className="text-xs text-muted-foreground">{standing.team.name}</p>
                  </div>
                  <div className="font-bold">{standing.points} pts</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Constructor Standings */}
        <Card>
          <CardHeader>
            <CardTitle>Clasificación de Constructores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {constructorStandings.slice(0, 10).map((standing) => (
                <div key={standing.team.id} className="flex items-center gap-3">
                  <div className="w-8 text-center font-bold">{standing.position}</div>
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: standing.team.color }}
                  />
                  <div className="flex-1 font-medium">{standing.team.name}</div>
                  <div className="font-bold">{standing.points} pts</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicHome;
