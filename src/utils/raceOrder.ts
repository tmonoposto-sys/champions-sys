import { QualifyingEntry, RaceResult } from "@/services/api";

export type RaceEntryStatus = "OK" | "DNF" | "DSQ";

export interface NormalizedRaceEntry {
  driverId: string;
  baseTime: string;
  status: RaceEntryStatus;
  finalSeconds: number;
}

export interface NormalizedQualifyingEntry {
  driverId: string;
  time: string;
  penaltySeconds: number;
  status: "OK" | "DSQ";
  finalSeconds: number;
}

const parseRaceTimeToSeconds = (value: string): number | null => {
  if (!value) return null;
  const normalized = value.trim().replace(",", ".");
  if (normalized === "--:--") return null;
  if (!normalized.includes(":")) return null;

  const [minutesPart, secondsPart] = normalized.split(":");
  const minutes = Number(minutesPart);
  const seconds = Number(secondsPart);
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  return minutes * 60 + seconds;
};

export const getOrderedRaceEntries = (result?: RaceResult): NormalizedRaceEntry[] => {
  if (!result) return [];

  if (result.raceEntries?.length) {
    const normalized = result.raceEntries.map((entry, index) => {
      const baseSeconds = parseRaceTimeToSeconds(entry.baseTime || "");
      const fallbackByLegacyOrder = result.race?.indexOf(entry.driverId);
      const fallbackSeconds =
        fallbackByLegacyOrder !== undefined && fallbackByLegacyOrder >= 0
          ? 100000 + fallbackByLegacyOrder
          : 100000 + index;
      const status: RaceEntryStatus = entry.status || "OK";

      return {
        driverId: entry.driverId,
        baseTime: entry.baseTime || "--:--",
        status,
        finalSeconds: baseSeconds ?? fallbackSeconds
      };
    });

    const classified = normalized
      .filter((entry) => entry.status === "OK")
      .sort((a, b) => a.finalSeconds - b.finalSeconds);
    const nonClassified = normalized
      .filter((entry) => entry.status !== "OK")
      .sort((a, b) => a.status.localeCompare(b.status));

    return [...classified, ...nonClassified];
  }

  return (result.race || []).map((driverId, index) => ({
    driverId,
    baseTime: "--:--",
    status: "OK",
    finalSeconds: index
  }));
};

export const getOrderedRaceDriverIds = (result?: RaceResult): string[] => {
  return getOrderedRaceEntries(result).map((entry) => entry.driverId);
};

const parseQualifyingTimeToSeconds = (value: string): number | null => {
  if (!value) return null;
  const normalized = value.trim().replace(",", ".");
  if (!normalized.includes(":")) return null;
  const [minutesPart, secondsPart] = normalized.split(":");
  const minutes = Number(minutesPart);
  const seconds = Number(secondsPart);
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  return minutes * 60 + seconds;
};

export const getOrderedQualifyingEntries = (qualifying: QualifyingEntry[]): NormalizedQualifyingEntry[] => {
  const normalized = qualifying.map((entry, index) => {
    const baseSeconds = parseQualifyingTimeToSeconds(entry.time);
    const penaltySeconds = Number(entry.penaltySeconds || 0);
    const status = entry.status || "OK";
    return {
      driverId: entry.driverId,
      time: entry.time,
      penaltySeconds,
      status,
      finalSeconds: (baseSeconds ?? 100000 + index) + penaltySeconds
    };
  });

  const ok = normalized
    .filter((entry) => entry.status === "OK")
    .sort((a, b) => a.finalSeconds - b.finalSeconds);
  const dsq = normalized.filter((entry) => entry.status === "DSQ");

  return [...ok, ...dsq];
};
