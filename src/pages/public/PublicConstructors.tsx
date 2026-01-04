import React, { useMemo } from "react";
import { usePublicChampionship } from "./PublicLayout";
import { useConstructorStandings } from "@/utils/processData";
import { Trophy } from "lucide-react";
import { ConstructorStandingsTable } from "@/components/ConstructorStandingsTable";

const PublicConstructors: React.FC = () => {
  const { teams, drivers, races, results } = usePublicChampionship();

  const constructorStandings = useMemo(() => {
    return useConstructorStandings(teams, results, races, drivers);
  }, [teams, results, races, drivers]);

  return (
    <div className="min-h-screen bg-background">
      
      <section className="gradient-f1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
              <Trophy className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary-foreground">Campeonato de Constructores</h1>
              <p className="text-primary-foreground/70">Clasificación de equipos</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <ConstructorStandingsTable
              standings={constructorStandings} 
              drivers={drivers}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicConstructors;
