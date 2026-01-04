import React from "react";
import { usePublicChampionship } from "./PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { getCircuitById } from "@/data/circuits";
import { Zap, CloudRain, Timer, CheckCircle } from "lucide-react";

const PublicCalendar: React.FC = () => {
  const { races, results, drivers, getDriverById } = usePublicChampionship();

  const getWinner = (raceId: string) => {
    const result = results.find((r) => r.raceId === raceId);
    if (result?.race?.[0]) {
      const driver = drivers.find((d) => d?._id === result.race[0]);
      return driver?.name;
    }
    return null;
  };

  const hasResults = (raceId: string) => {
    const result = results.find((r) => r.raceId === raceId);
    return result && result.race && result.race.length > 0;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendario</h1>

      <div className="grid gap-4">
        {races.map((race) => {
          const circuit = getCircuitById(race.circuitId);
          const winner = getWinner(race?._id);
          const completed = hasResults(race?._id);

          return (
            <Card key={race?._id} className={completed ? "border-green-500/30" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {race.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl">{circuit?.flag}</span>
                      <span className="font-bold text-lg">{circuit?.name || race.circuitId}</span>
                      {race.isSprint && (
                        <span className="bg-yellow-500/20 text-yellow-600 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Sprint
                        </span>
                      )}
                      {race.isRain && (
                        <span className="bg-blue-500/20 text-blue-600 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <CloudRain className="h-3 w-3" /> Lluvia
                        </span>
                      )}
                      {completed && (
                        <span className="bg-green-500/20 text-green-600 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Completada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{circuit?.circuit}</p>
                  </div>
                  {winner && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Ganador</p>
                      <p className="font-bold">{winner}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PublicCalendar;
