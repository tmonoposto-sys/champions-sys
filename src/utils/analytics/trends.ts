import { EntityStats } from "./championshipEngine";

export interface TrendResult {
  entityId: string;
  entityName: string;
  window: number;
  samples: number[];
  average: number;
  trend: "up" | "down" | "flat";
}

export const getEntityTrend = (entity: EntityStats, window = 5): TrendResult => {
  const samples = entity.perRacePoints.slice(-window);
  const average = samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 0;

  let trend: "up" | "down" | "flat" = "flat";
  if (samples.length >= 2) {
    const half = Math.ceil(samples.length / 2);
    const firstHalfAvg = samples.slice(0, half).reduce((sum, value) => sum + value, 0) / half;
    const secondHalf = samples.slice(half);
    const secondHalfAvg = secondHalf.length ? secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length : firstHalfAvg;
    const diff = secondHalfAvg - firstHalfAvg;
    if (diff > 1) trend = "up";
    else if (diff < -1) trend = "down";
  }

  return {
    entityId: entity.id,
    entityName: entity.name,
    window,
    samples,
    average,
    trend
  };
};
