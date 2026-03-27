import { Driver, Race, RaceResult, Team } from "@/services/api";

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;
const PODIUM_TARGETS = [1, 2, 3] as const;

export type PodiumTarget = 1 | 2 | 3;

export interface PodiumMathStatus {
  target: PodiumTarget;
  canFight: boolean;
  isClinched: boolean;
}

export interface CompetitiveStatus {
  p1: PodiumMathStatus;
  p2: PodiumMathStatus;
  p3: PodiumMathStatus;
}

export interface CompetitiveMarker {
  target: PodiumTarget;
  type: "clinched" | "fight";
}

export interface DriverStanding {
  driver: { id: string; name: string; number: number, estado: string };
  team: { id: string; name: string; color: string };
  points: number;
  wins: number;
  position: number;
  podiums: number;
  competitiveStatus: CompetitiveStatus;
}

export interface ConstructorStanding {
  team: { id: string; name: string; color: string };
  points: number;
  wins: number;
  position: number;
  competitiveStatus: CompetitiveStatus;
}

interface ComparableStanding {
  points: number;
  wins: number;
}

const compareByPointsAndWins = (a: ComparableStanding, b: ComparableStanding) => {
  return b.points - a.points || b.wins - a.wins;
};

const getRemainingRaces = (races: Race[], results: RaceResult[]) => {
  const playedRaceIds = new Set(results.map((result) => result.raceId));
  return races.filter((race) => !playedRaceIds.has(race._id));
};

const getDriverRemainingPotential = (remainingRaces: Race[]) => {
  return remainingRaces.reduce(
    (acc, race) => {
      const winnerPoints = race.isSprint ? POINTS_SPRINT[0] : POINTS_RACE[0];
      acc.maxPoints += winnerPoints + POINTS_FASTEST_LAP;
      acc.maxWins += 1;
      return acc;
    },
    { maxPoints: 0, maxWins: 0 }
  );
};

const getConstructorRemainingPotential = (remainingRaces: Race[]) => {
  return remainingRaces.reduce(
    (acc, race) => {
      const points = race.isSprint ? POINTS_SPRINT : POINTS_RACE;
      const bestTwoDrivers = (points[0] || 0) + (points[1] || 0);
      acc.maxPoints += bestTwoDrivers + POINTS_FASTEST_LAP;
      acc.maxWins += 1;
      return acc;
    },
    { maxPoints: 0, maxWins: 0 }
  );
};

const buildCompetitiveStatus = (
  current: ComparableStanding,
  allCurrent: ComparableStanding[],
  maxPointsToAdd: number,
  maxWinsToAdd: number
): CompetitiveStatus => {
  const currentSorted = [...allCurrent].sort(compareByPointsAndWins);
  const candidateBest = { points: current.points + maxPointsToAdd, wins: current.wins + maxWinsToAdd };
  const candidateWorst = { points: current.points, wins: current.wins };

  const statusByTarget = PODIUM_TARGETS.reduce((acc, target) => {
    const targetStanding = currentSorted[target - 1] ?? { points: 0, wins: 0 };
    const canFight = compareByPointsAndWins(candidateBest, targetStanding) <= 0;

    const rivalsThatCanPass = allCurrent.reduce((count, rival) => {
      if (rival === current) return count;

      const rivalBest = {
        points: rival.points + maxPointsToAdd,
        wins: rival.wins + maxWinsToAdd
      };

      if (compareByPointsAndWins(rivalBest, candidateWorst) < 0) {
        return count + 1;
      }

      return count;
    }, 0);

    const isClinched = rivalsThatCanPass < target;

    acc[`p${target}` as keyof CompetitiveStatus] = {
      target,
      canFight,
      isClinched
    };

    return acc;
  }, {} as CompetitiveStatus);

  return statusByTarget;
};

export const getCompetitiveMarker = (status: CompetitiveStatus): CompetitiveMarker | null => {
  // Si todavía puede pelear por una corona superior, se prioriza mostrar lucha.
  const fight = PODIUM_TARGETS.find((target) => status[`p${target}` as keyof CompetitiveStatus].canFight);
  if (fight) {
    return { target: fight, type: "fight" };
  }

  // Solo mostrar corona cuando ya no hay una posición mejor por pelear.
  const clinched = PODIUM_TARGETS.find((target) => status[`p${target}` as keyof CompetitiveStatus].isClinched);
  if (clinched) {
    return { target: clinched, type: "clinched" };
  }

  return null;
};

export const useDriverStandings = (drivers: Driver[], results: RaceResult[], races: Race[], getTeamById: (id: string) => Team): DriverStanding[] => {
    const standings = new Map<string, { points: number; wins: number, podiums: number }>();
    const remainingRaces = getRemainingRaces(races, results);
    const remainingPotential = getDriverRemainingPotential(remainingRaces);

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

    const computedStandings = drivers
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
        podiums: stats.podiums,
        competitiveStatus: {
          p1: { target: 1, canFight: false, isClinched: false },
          p2: { target: 2, canFight: false, isClinched: false },
          p3: { target: 3, canFight: false, isClinched: false }
        }
    };
    })
    .sort((a, b) => compareByPointsAndWins(a, b))
    .map((s, i) => ({ ...s, position: i + 1 }));

    const allCurrent = computedStandings.map((standing) => ({ points: standing.points, wins: standing.wins }));

    return computedStandings.map((standing) => ({
      ...standing,
      competitiveStatus: buildCompetitiveStatus(
        { points: standing.points, wins: standing.wins },
        allCurrent,
        remainingPotential.maxPoints,
        remainingPotential.maxWins
      )
    }));
}

export const useConstructorStandings = (teams: Team[], results: RaceResult[], races: Race[], drivers: Driver[]): ConstructorStanding[] => {
    const standings = new Map<string, { points: number; wins: number }>();
    const remainingRaces = getRemainingRaces(races, results);
    const remainingPotential = getConstructorRemainingPotential(remainingRaces);
    teams?.forEach((team) => {
        standings.set(team?._id, { points: 0, wins: 0 });
    });

    results?.forEach((result) => {
        const race = races.find((r) => r?._id === result.raceId);
        const points = race?.isSprint ? POINTS_SPRINT : POINTS_RACE;

        result.race?.forEach((driverId, position) => {
            const driver = drivers.find((d) => d?._id === driverId);
            if (driver) {
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

    const computedStandings = teams
    .map((team) => {
    const stats = standings.get(team?._id) || { points: 0, wins: 0 };
    return {
        team: { id: team?._id, name: team.name, color: team.color },
        points: stats.points,
        wins: stats.wins,
        position: 0,
        competitiveStatus: {
          p1: { target: 1, canFight: false, isClinched: false },
          p2: { target: 2, canFight: false, isClinched: false },
          p3: { target: 3, canFight: false, isClinched: false }
        }
    };
    })
    .sort((a, b) => compareByPointsAndWins(a, b))
    .map((s, i) => ({ ...s, position: i + 1 }));

    const allCurrent = computedStandings.map((standing) => ({ points: standing.points, wins: standing.wins }));

    return computedStandings.map((standing) => ({
      ...standing,
      competitiveStatus: buildCompetitiveStatus(
        { points: standing.points, wins: standing.wins },
        allCurrent,
        remainingPotential.maxPoints,
        remainingPotential.maxWins
      )
    }));
}