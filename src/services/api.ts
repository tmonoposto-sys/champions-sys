const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

async function callApi<T>(collection: string, action: string, body: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}/${collection}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Error en la solicitud" };
    }

    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return { error: error instanceof Error ? error.message : "Error de conexión" };
  }
}

// Championships
export const loginChampionship = (username: string, code: string) =>
  callApi<{ success: boolean; championship: { code: string; name: string } }>("championships", "login", { username, code });

export const getChampionship = (code: string) =>
  callApi<{ code: string; name: string }>("championships", "get", { code });

export const createChampionship = (adminKey: string, code: string, name: string, adminUsername: string) =>
  callApi("championships", "create", { adminKey, code, name, adminUsername });

// Teams
export const listTeams = (code: string) =>
  callApi<Team[]>("teams", "list", { code });

export const createTeam = (code: string, name: string, color: string) =>
  callApi("teams", "create", { code, name, color });

export const updateTeam = (id: string, name: string, color: string) =>
  callApi("teams", "update", { id, name, color });

export const deleteTeam = (id: string) =>
  callApi("teams", "delete", { id });

// Drivers
export const listDrivers = (code: string) =>
  callApi<Driver[]>("drivers", "list", { code });

export const createDriver = (code: string, name: string, teamId: string, number: number, estado: string) =>
  callApi("drivers", "create", { code, name, teamId, number, estado });

export const updateDriver = (id: string, name: string, teamId: string, number: number, estado: string) =>
  callApi("drivers", "update", { id, name, teamId, number, estado });

export const deleteDriver = (id: string) =>
  callApi("drivers", "delete", { id });

// Races
export const listRaces = (code: string) =>
  callApi<Race[]>("races", "list", { code });

export const createRace = (code: string, circuitId: string, order: number, isSprint: boolean, isRain: boolean) =>
  callApi("races", "create", { code, circuitId, order, isSprint, isRain });

export const updateRace = (id: string, circuitId: string, order: number, isSprint: boolean, isRain: boolean) =>
  callApi("races", "update", { id, circuitId, order, isSprint, isRain });

export const deleteRace = (id: string) =>
  callApi("races", "delete", { id });

// Results
export const listResults = (code: string) =>
  callApi<RaceResult[]>("results", "list", { code });

export const getRaceResult = (code: string, raceId: string) =>
  callApi<RaceResult>("results", "get", { code, raceId });

export const saveQualifyingResult = (code: string, raceId: string, qualifying: QualifyingEntry[]) =>
  callApi("results", "saveQualifying", { code, raceId, qualifying });

export const saveRaceResult = (code: string, raceId: string, race: string[], fastestLap?: string) =>
  callApi("results", "saveRace", { code, raceId, race, fastestLap });

// Types
export interface Team {
  _id: string;
  championshipCode: string;
  name: string;
  color: string;
}

export interface Driver {
  _id: string;
  championshipCode: string;
  name: string;
  teamId: string;
  number: number;
  estado: string;
}

export interface Race {
  _id: string;
  championshipCode: string;
  circuitId: string;
  order: number;
  isSprint: boolean;
  isRain: boolean;
}

export interface QualifyingEntry {
  driverId: string;
  time: string;
}

export interface RaceResult {
  _id?: string;
  championshipCode: string;
  raceId: string;
  qualifying: QualifyingEntry[];
  race: string[];
  fastestLap?: string;
}
