import React, { useMemo } from "react";
import { usePublicChampionship } from "./PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Flag, ArrowRight } from "lucide-react";
import { useConstructorStandings, useDriverStandings } from "@/utils/processData";
import { StatsCard } from "@/components/StatsCard";
import { Link } from 'react-router-dom';
import { DriverStandingsTable } from "@/components/DriverStandingsTable";
import { ConstructorStandingsTable } from "@/components/ConstructorStandingsTable";

const PublicHome: React.FC = () => {
  const { championship, teams, drivers, races, results, getTeamById } = usePublicChampionship();

  const driverStandings = useMemo(() => {
    return useDriverStandings(drivers, results, races, getTeamById);
  }, [drivers, results, races, getTeamById]);

  const constructorStandings = useMemo(() => {
    return useConstructorStandings(teams, results, races, drivers);
  }, [teams, results, races, drivers]);

  const completedRaces = results.length;
  const totalRaces = races.length;

  const leader = driverStandings[0];
  const leadingTeam = constructorStandings[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Stats Section */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Líder"
              value={leader?.driver.name || '-'}
              subtitle={`${leader?.points || 0} puntos`}
              icon={<Trophy className="w-5 h-5" />}
              color={leader?.team?.color}
            />
            <StatsCard
              title="Equipo Líder"
              value={leadingTeam?.team.name || '-'}
              subtitle={`${leadingTeam?.points || 0} puntos`}
              icon={<Flag className="w-5 h-5" />}
              color={leadingTeam?.team.color}
            />
            <StatsCard
              title="Pilotos"
              value={drivers.filter(driver => driver.estado !== "Expiloto").length}
              icon={<Users className="w-5 h-5" />}
            />
            <StatsCard
              title="Carreras"
              value={`${completedRaces}/${totalRaces}`}
              icon={<Calendar className="w-5 h-5" />}
            />
          </div>
        </div>
      </section>

      {/* Standings Preview */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Drivers */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Campeonato de Pilotos</h2>
                <Link
                  to="drivers"
                  className="text-sm text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Ver todo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-4">
                <DriverStandingsTable standings={driverStandings} compact />
              </div>
            </div>

            {/* Constructors */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Campeonato de Constructores</h2>
                <Link
                  to="constructors"
                  className="text-sm text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Ver todo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-4">
                <ConstructorStandingsTable standings={constructorStandings} drivers={drivers} compact />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicHome;
