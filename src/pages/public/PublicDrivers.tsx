import React, { useMemo } from "react";
import { usePublicChampionship } from "./PublicLayout";
import { useDriverStandings } from "@/utils/processData";
import { Users } from 'lucide-react';
import { DriverStandingsTable } from "@/components/DriverStandingsTable";

const PublicDrivers: React.FC = () => {
  const { drivers, races, results, getTeamById } = usePublicChampionship();

  const driverStandings = useMemo(() => {
    return useDriverStandings(drivers, results, races, getTeamById);
  }, [drivers, results, races, getTeamById]);

  return (
      <div className="min-h-screen bg-background">      
      <section className="gradient-f1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary-foreground">Campeonato de Pilotos</h1>
              <p className="text-primary-foreground/70">Clasificación actualizada</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <DriverStandingsTable standings={driverStandings} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicDrivers;
