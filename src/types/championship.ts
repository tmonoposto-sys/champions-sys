export interface Team {
  id: string;
  name: string;
  color: string;
}

export type DriverStatus = 'Titular' | 'Reserva' | 'Expiloto';

export interface Driver {
  id: number;
  name: string;
  team: string;
  number: number;
  estado: DriverStatus;
}

export interface TeamPrincipal {
  teamId: string;
  name: string;
}

export interface GrandPrix {
  id: number;
  name: string;
  country: string;
  flag: string;
  circuit: string;
  isSprint?: boolean;
  isRain?: boolean;
}

export interface QualifyingEntry {
  driverId: number;
  time: string;
}

export interface RaceResult {
  qualifying: QualifyingEntry[];
  race: number[];
  fastestLap?: number;
}

export interface Results {
  [gpId: string]: RaceResult;
}

export interface PointsSystem {
  race: number[];
  sprint: number[];
  fastestLap: number;
}

export interface ChampionshipData {
  championship: {
    name: string;
    season: string;
  };
  teams: Team[];
  drivers: Driver[];
  grandPrix: GrandPrix[];
  results: Results;
  pointsSystem: PointsSystem;
  teamPrincipals: TeamPrincipal[];
}

export interface DriverStanding {
  driver: Driver;
  team: Team;
  points: number;
  wins: number;
  podiums: number;
  position: number;
}

export interface ConstructorStanding {
  team: Team;
  points: number;
  wins: number;
  position: number;
}
