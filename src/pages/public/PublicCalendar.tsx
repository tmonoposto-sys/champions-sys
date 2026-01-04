import React from "react";
import { usePublicChampionship } from "./PublicLayout";
import { Calendar } from "lucide-react";
import { RaceCard } from "@/components/RaceCard";

const PublicCalendar: React.FC = () => {
  const { drivers, races, results, getDriverById, getTeamById } = usePublicChampionship();

  return (
    <div className="min-h-screen bg-background">
      <section className="gradient-f1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-primary-foreground/70">{races?.length} Grandes Premios</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {races?.map(gp => (
              <RaceCard
                key={gp._id}
                gp={gp}
                result={results?.find(r => r.raceId === gp._id)}
                getDriverById={getDriverById}
                getTeamById={getTeamById}
                drivers={drivers}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );

};

export default PublicCalendar;
