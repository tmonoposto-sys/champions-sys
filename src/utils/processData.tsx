import { Driver, Race, RaceResult, Team } from "@/services/api";

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;

export interface DriverStanding {
  driver: { id: string; name: string; number: number, estado: string };
  team: { id: string; name: string; color: string };
  points: number;
  wins: number;
  position: number;
  podiums: number;
}

export interface ConstructorStanding {
  team: { id: string; name: string; color: string };
  points: number;
  wins: number;
  position: number;
}

export const useDriverStandings = (drivers: Driver[], results: RaceResult[], races: Race[], getTeamById: (id: string) => Team): DriverStanding[] => {
    const standings = new Map<string, { points: number; wins: number, podiums: number }>();

    drivers
    .filter((d) => d.estado !== "Expiloto")
    ?.forEach((driver) => {
    standings.set(driver?._id, { points: 0, wins: 0, podiums: 0 });
    });

    results?.forEach((result) => {
        const race = races.find((r) => r?._id === result.raceId);
        const points = race?.isSprint ? POINTS_SPRINT : POINTS_RACE;

        result.race?.forEach((driverId, position) => {
            const current = standings.get(driverId);
            if (current && points[position]) {
                current.points += points[position];
                if (position === 0) current.wins++;
                if (position < 3) current.podiums++;
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
    const stats = standings.get(driver?._id) || { points: 0, wins: 0, podiums: 0 };
    const team = getTeamById(driver.teamId);
    return {
        driver: { id: driver?._id, name: driver.name, number: driver.number, estado: driver.estado },
        team: team ? { id: team?._id, name: team.name, color: team.color } : { id: "", name: "Sin equipo", color: "#888" },
        points: stats.points,
        wins: stats.wins,
        position: 0,
        podiums: stats.podiums
    };
    })
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .map((s, i) => ({ ...s, position: i + 1 }));
}

export const useConstructorStandings = (teams: Team[], results: RaceResult[], races: Race[], drivers: Driver[]): ConstructorStanding[] => {
    const standings = new Map<string, { points: number; wins: number }>();
    teams?.forEach((team) => {
        standings.set(team?._id, { points: 0, wins: 0 });
    });

    results?.forEach((result) => {
        const race = races.find((r) => r?._id === result.raceId);
        const points = race?.isSprint ? POINTS_SPRINT : POINTS_RACE;

        result.race?.forEach((driverId, position) => {
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
}