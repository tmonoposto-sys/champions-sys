import { EntityStats } from "./championshipEngine";

export interface ComparisonResult {
  leftId: string;
  rightId: string;
  leftName: string;
  rightName: string;
  leftPoints: number;
  rightPoints: number;
  leftWins: number;
  rightWins: number;
  pointsDelta: number;
  winsDelta: number;
  raceByRaceDelta: number[];
}

export const compareEntities = (left: EntityStats, right: EntityStats): ComparisonResult => {
  const maxLength = Math.max(left.perRacePoints.length, right.perRacePoints.length);
  const raceByRaceDelta = Array.from({ length: maxLength }).map((_, index) => {
    return (left.perRacePoints[index] || 0) - (right.perRacePoints[index] || 0);
  });

  return {
    leftId: left.id,
    rightId: right.id,
    leftName: left.name,
    rightName: right.name,
    leftPoints: left.points,
    rightPoints: right.points,
    leftWins: left.wins,
    rightWins: right.wins,
    pointsDelta: left.points - right.points,
    winsDelta: left.wins - right.wins,
    raceByRaceDelta
  };
};
