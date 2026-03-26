import { Driver, Race, RaceResult, Team } from "@/services/api";
import { getCircuitTrackProfile, TrackProfile } from "@/data/circuits";

const POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const POINTS_FASTEST_LAP = 1;

export interface EntityStats {
  id: string;
  name: string;
  points: number;
  wins: number;
  perRacePoints: number[];
  raceSamples: Array<{
    points: number;
    isSprint: boolean;
    isRain: boolean;
    trackProfile: TrackProfile;
  }>;
}

export interface TitleNeedTheoretical {
  leaderName: string;
  contenderName: string;
  pointsGapToLeader: number;
  remainingRaces: number;
  maxPointsAvailable: number;
  canStillWin: boolean;
  minPointsToPassLeader: number;
}

export interface TitleNeedRealistic {
  projectedLeaderFinal: number;
  projectedContenderFinal: number;
  contenderTitleProbability: number;
  contenderTitleProbabilityRaw: number;
  expectedDeltaToLeader: number;
  simulations: number;
  contenderTitleScenarios: number;
  leaderTitleScenarios: number;
  swingRequiredPerRace: number;
  recommendedTargetPerRace: number;
  insight: string;
  contenderTop3Probability: number;
  contenderTop3ProbabilityRaw: number;
  contenderChampionProbability: number;
  factorBreakdown: {
    form: number;
    sprint: number;
    rain: number;
    trackProfile: number;
  };
  keyFactor: "form" | "sprint" | "rain" | "trackProfile";
}

interface CompletedRaceEvent {
  race: Race;
  result: RaceResult;
}

interface EntityFactorStats {
  baseAvg: number;
  formAvg: number;
  sprintAvg: number;
  rainAvg: number;
  profileAvg: Record<TrackProfile, number>;
}

const getRacePointsTable = (race: Race) => (race.isSprint ? POINTS_SPRINT : POINTS_RACE);

export const getCompletedRaceEvents = (races: Race[], results: RaceResult[]): CompletedRaceEvent[] => {
  const raceById = new Map(races.map((race) => [race._id, race]));

  return results
    .map((result) => {
      const race = raceById.get(result.raceId);
      if (!race) return null;
      if (!result.race?.length) return null;
      return { race, result };
    })
    .filter((event): event is CompletedRaceEvent => Boolean(event))
    .sort((a, b) => a.race.order - b.race.order);
};

export const getRemainingRacesCount = (races: Race[], results: RaceResult[]) => {
  const completedRaceIds = new Set(getCompletedRaceEvents(races, results).map((event) => event.race._id));
  return races.filter((race) => !completedRaceIds.has(race._id)).length;
};

export const computeDriverStats = (
  drivers: Driver[],
  races: Race[],
  results: RaceResult[]
): EntityStats[] => {
  const activeDrivers = drivers.filter((driver) => driver.estado !== "Expiloto");
  const statsMap = new Map<string, EntityStats>();

  activeDrivers.forEach((driver) => {
    statsMap.set(driver._id, {
      id: driver._id,
      name: driver.name,
      points: 0,
      wins: 0,
      perRacePoints: [],
      raceSamples: []
    });
  });

  const events = getCompletedRaceEvents(races, results);
  events.forEach(({ race, result }) => {
    const pointsTable = getRacePointsTable(race);
    const racePointsByDriver = new Map<string, number>();

    result.race.forEach((driverId, index) => {
      const points = pointsTable[index] || 0;
      racePointsByDriver.set(driverId, points);
      const stat = statsMap.get(driverId);
      if (!stat) return;
      stat.points += points;
      if (index === 0) stat.wins += 1;
    });

    if (result.fastestLap) {
      const flPos = result.race.indexOf(result.fastestLap);
      if (flPos >= 0 && flPos < 10) {
        racePointsByDriver.set(result.fastestLap, (racePointsByDriver.get(result.fastestLap) || 0) + POINTS_FASTEST_LAP);
        const stat = statsMap.get(result.fastestLap);
        if (stat) stat.points += POINTS_FASTEST_LAP;
      }
    }

    statsMap.forEach((stat) => {
      const points = racePointsByDriver.get(stat.id) || 0;
      stat.perRacePoints.push(points);
      stat.raceSamples.push({
        points,
        isSprint: race.isSprint,
        isRain: race.isRain,
        trackProfile: getCircuitTrackProfile(race.circuitId)
      });
    });
  });

  return [...statsMap.values()].sort((a, b) => b.points - a.points || b.wins - a.wins);
};

export const computeConstructorStats = (
  teams: Team[],
  drivers: Driver[],
  races: Race[],
  results: RaceResult[]
): EntityStats[] => {
  const driverById = new Map(drivers.map((driver) => [driver._id, driver]));
  const statsMap = new Map<string, EntityStats>();

  teams.forEach((team) => {
    statsMap.set(team._id, {
      id: team._id,
      name: team.name,
      points: 0,
      wins: 0,
      perRacePoints: [],
      raceSamples: []
    });
  });

  const events = getCompletedRaceEvents(races, results);
  events.forEach(({ race, result }) => {
    const pointsTable = getRacePointsTable(race);
    const racePointsByTeam = new Map<string, number>();

    result.race.forEach((driverId, index) => {
      const driver = driverById.get(driverId);
      if (!driver) return;
      const points = pointsTable[index] || 0;
      racePointsByTeam.set(driver.teamId, (racePointsByTeam.get(driver.teamId) || 0) + points);
      const stat = statsMap.get(driver.teamId);
      if (!stat) return;
      stat.points += points;
      if (index === 0) stat.wins += 1;
    });

    if (result.fastestLap) {
      const flDriver = driverById.get(result.fastestLap);
      const flPos = result.race.indexOf(result.fastestLap);
      if (flDriver && flPos >= 0 && flPos < 10) {
        racePointsByTeam.set(flDriver.teamId, (racePointsByTeam.get(flDriver.teamId) || 0) + POINTS_FASTEST_LAP);
        const stat = statsMap.get(flDriver.teamId);
        if (stat) stat.points += POINTS_FASTEST_LAP;
      }
    }

    statsMap.forEach((stat) => {
      const points = racePointsByTeam.get(stat.id) || 0;
      stat.perRacePoints.push(points);
      stat.raceSamples.push({
        points,
        isSprint: race.isSprint,
        isRain: race.isRain,
        trackProfile: getCircuitTrackProfile(race.circuitId)
      });
    });
  });

  return [...statsMap.values()].sort((a, b) => b.points - a.points || b.wins - a.wins);
};

export const getTitleNeedTheoretical = (
  contender: EntityStats,
  leader: EntityStats,
  remainingRaces: number,
  isConstructor: boolean
): TitleNeedTheoretical => {
  const maxPerRace = isConstructor ? POINTS_RACE[0] + POINTS_RACE[1] + POINTS_FASTEST_LAP : POINTS_RACE[0] + POINTS_FASTEST_LAP;
  const maxPointsAvailable = remainingRaces * maxPerRace;
  const pointsGapToLeader = Math.max(0, leader.points - contender.points);
  const minPointsToPassLeader = pointsGapToLeader + (leader.wins >= contender.wins ? 1 : 0);
  const canStillWin = contender.points + maxPointsAvailable >= leader.points;

  return {
    leaderName: leader.name,
    contenderName: contender.name,
    pointsGapToLeader,
    remainingRaces,
    maxPointsAvailable,
    canStillWin,
    minPointsToPassLeader
  };
};

const averageLastN = (values: number[], n: number) => {
  const tail = values.slice(-n);
  if (!tail.length) return 0;
  return tail.reduce((sum, value) => sum + value, 0) / tail.length;
};

const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const buildEntityFactorStats = (entity: EntityStats, trendWindow: number): EntityFactorStats => {
  const samples = entity.raceSamples;
  const baseAvg = average(entity.perRacePoints);
  const formAvg = averageLastN(entity.perRacePoints, trendWindow);
  const sprintAvg = average(samples.filter((s) => s.isSprint).map((s) => s.points)) || baseAvg;
  const rainAvg = average(samples.filter((s) => s.isRain).map((s) => s.points)) || baseAvg;

  const profileAvg: Record<TrackProfile, number> = {
    rapido: average(samples.filter((s) => s.trackProfile === "rapido").map((s) => s.points)) || baseAvg,
    tecnico: average(samples.filter((s) => s.trackProfile === "tecnico").map((s) => s.points)) || baseAvg,
    mixto: average(samples.filter((s) => s.trackProfile === "mixto").map((s) => s.points)) || baseAvg
  };

  return { baseAvg, formAvg, sprintAvg, rainAvg, profileAvg };
};

const getRemainingRacesDetailed = (races: Race[], results: RaceResult[]) => {
  const completedRaceIds = new Set(getCompletedRaceEvents(races, results).map((event) => event.race._id));
  return races
    .filter((race) => !completedRaceIds.has(race._id))
    .sort((a, b) => a.order - b.order);
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getTitleNeedRealistic = (
  contender: EntityStats,
  leader: EntityStats,
  remainingRaces: number,
  trendWindow = 5,
  context?: {
    allEntities?: EntityStats[];
    races?: Race[];
    results?: RaceResult[];
    maxPointsPerRace?: number;
  }
): TitleNeedRealistic => {
  const contenderFeatures = buildEntityFactorStats(contender, trendWindow);
  const leaderFeatures = buildEntityFactorStats(leader, trendWindow);
  const contenderAvg = contenderFeatures.formAvg;
  const leaderAvg = leaderFeatures.formAvg;

  const projectedContenderFinal = contender.points + contenderAvg * remainingRaces;
  const projectedLeaderFinal = leader.points + leaderAvg * remainingRaces;
  const expectedDeltaToLeader = projectedLeaderFinal - projectedContenderFinal;
  const swingRequiredPerRace = remainingRaces > 0 ? expectedDeltaToLeader / remainingRaces : expectedDeltaToLeader;
  const recommendedTargetPerRace = contenderAvg + Math.max(0, swingRequiredPerRace);

  const simulations = 5000;
  let contenderTitleScenarios = 0;
  let leaderTitleScenarios = 0;
  let contenderTop3Scenarios = 0;

  const allEntities = context?.allEntities?.length ? context.allEntities : [leader, contender];
  const featuresByEntity = new Map(allEntities.map((entity) => [entity.id, buildEntityFactorStats(entity, trendWindow)]));
  const remainingDetailed = context?.races && context?.results
    ? getRemainingRacesDetailed(context.races, context.results)
    : Array.from({ length: remainingRaces }).map(
        (_, idx) =>
          ({
            _id: `sim-${idx}`,
            championshipCode: "",
            circuitId: "unknown",
            order: idx + 1,
            isSprint: false,
            isRain: false
          } as Race)
      );
  const maxPointsPerRace = context?.maxPointsPerRace || 26;

  for (let i = 0; i < simulations; i++) {
    const totals = new Map<string, number>();
    allEntities.forEach((entity) => totals.set(entity.id, entity.points));

    for (const race of remainingDetailed) {
      const profile = getCircuitTrackProfile(race.circuitId);
      allEntities.forEach((entity) => {
        const feature = featuresByEntity.get(entity.id);
        if (!feature) return;

        const sprintWeight = race.isSprint ? feature.sprintAvg : feature.baseAvg;
        const rainWeight = race.isRain ? feature.rainAvg : feature.baseAvg;
        const profileWeight = feature.profileAvg[profile];
        const expected =
          feature.baseAvg * 0.35 +
          feature.formAvg * 0.30 +
          sprintWeight * 0.15 +
          rainWeight * 0.10 +
          profileWeight * 0.10;
        const variance = Math.max(2.2, expected * 0.28);
        const randomDelta = (Math.random() - 0.5) * 2 * variance;
        const racePoints = Math.max(0, Math.min(maxPointsPerRace, expected + randomDelta));
        totals.set(entity.id, (totals.get(entity.id) || 0) + racePoints);
      });
    }

    const ranked = allEntities
      .map((entity) => ({ entity, points: totals.get(entity.id) || entity.points }))
      .sort((a, b) => b.points - a.points || b.entity.wins - a.entity.wins);
    const contenderPosition = ranked.findIndex((entry) => entry.entity.id === contender.id);
    const leaderPosition = ranked.findIndex((entry) => entry.entity.id === leader.id);

    if (contenderPosition === 0) {
      contenderTitleScenarios += 1;
    }
    if (leaderPosition === 0) {
      leaderTitleScenarios += 1;
    }
    if (contenderPosition >= 0 && contenderPosition < 3) contenderTop3Scenarios += 1;
  }

  const contenderTitleProbabilityRaw = clamp(Number((((contenderTitleScenarios / simulations) * 100)).toFixed(2)), 0, 100);
  const contenderTop3ProbabilityRaw = clamp(Number((((contenderTop3Scenarios / simulations) * 100)).toFixed(2)), 0, 100);

  const maxAvail = Math.max(1, remainingRaces * maxPointsPerRace);
  const currentGap = Math.max(0, leader.points - contender.points);
  const titlePriorMean = clamp(0.55 - currentGap / (maxAvail * 1.25), 0.015, 0.65);
  const titlePriorStrength = 40;
  const titleSmoothed =
    ((contenderTitleScenarios + titlePriorMean * titlePriorStrength) / (simulations + titlePriorStrength)) * 100;

  const top3PriorMean = clamp(0.65 - currentGap / (maxAvail * 2), 0.10, 0.90);
  const top3PriorStrength = 30;
  const top3Smoothed =
    ((contenderTop3Scenarios + top3PriorMean * top3PriorStrength) / (simulations + top3PriorStrength)) * 100;

  const contenderTitleProbability = clamp(Number(titleSmoothed.toFixed(2)), 0, 100);
  const contenderTop3Probability = clamp(Number(top3Smoothed.toFixed(2)), 0, 100);
  const factorBreakdown = {
    form: contenderFeatures.formAvg - leaderFeatures.formAvg,
    sprint: contenderFeatures.sprintAvg - leaderFeatures.sprintAvg,
    rain: contenderFeatures.rainAvg - leaderFeatures.rainAvg,
    trackProfile:
      (contenderFeatures.profileAvg.rapido + contenderFeatures.profileAvg.tecnico + contenderFeatures.profileAvg.mixto) / 3 -
      (leaderFeatures.profileAvg.rapido + leaderFeatures.profileAvg.tecnico + leaderFeatures.profileAvg.mixto) / 3
  };
  const keyFactor = (Object.entries(factorBreakdown).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0]?.[0] ||
    "form") as "form" | "sprint" | "rain" | "trackProfile";
  const insight =
    remainingRaces === 0
      ? "Temporada cerrada: el resultado depende de la tabla final actual."
      : swingRequiredPerRace <= 0
        ? `${contender.name} llega con tendencia suficiente para pelear el título si mantiene el ritmo.`
        : `${contender.name} necesita recortar ~${swingRequiredPerRace.toFixed(1)} pts por carrera frente a ${leader.name}. Factor clave: ${keyFactor}. Prob. simulada ${contenderTitleProbabilityRaw.toFixed(2)}%, ajustada ${contenderTitleProbability.toFixed(2)}%.`;

  return {
    projectedLeaderFinal,
    projectedContenderFinal,
    contenderTitleProbability,
    contenderTitleProbabilityRaw,
    expectedDeltaToLeader,
    simulations,
    contenderTitleScenarios,
    leaderTitleScenarios,
    swingRequiredPerRace,
    recommendedTargetPerRace,
    insight,
    contenderTop3Probability,
    contenderTop3ProbabilityRaw,
    contenderChampionProbability: contenderTitleProbability,
    factorBreakdown,
    keyFactor
  };
};
