import { Header } from '@/components/Header';
import { DriverStandingsTable } from '@/components/DriverStandingsTable';
import { ConstructorStandingsTable } from '@/components/ConstructorStandingsTable';
import { StatsCard } from '@/components/StatsCard';
import { useChampionshipData } from '@/hooks/useChampionshipData';
import { Link } from 'react-router-dom';
import { Trophy, Users, Flag, Calendar, ArrowRight } from 'lucide-react';
import { countDrivers } from '@/utils/countdrivers';
import { usePublicChampionship } from './public/PublicLayout';

const Index = () => {
  const { data, loading, error, calculateDriverStandings, calculateConstructorStandings } = usePublicChampionship();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando campeonato...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Error cargando datos: {error}</p>
        </div>
      </div>
    );
  }

  const driverStandings = calculateDriverStandings();
  const constructorStandings = calculateConstructorStandings();
  const completedRaces = Object.keys(data.results).length;
  const leader = driverStandings[0];
  const leadingTeam = constructorStandings[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative gradient-f1 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <p className="text-primary-foreground/80 font-semibold mb-2 uppercase tracking-wider text-sm">
              Temporada {data.championship.season}
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground mb-4 leading-tight">
              {data.championship.name}
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-6">
              carrera {completedRaces} de {data.grandPrix.length}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/drivers"
                className="inline-flex items-center gap-2 bg-primary-foreground text-secondary px-6 py-3 rounded font-semibold hover:bg-primary-foreground/90 transition-colors"
              >
                Ver campeonato de pilotos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-primary-foreground text-primary-foreground px-6 py-3 rounded font-semibold hover:bg-primary-foreground/10 transition-colors"
              >
                Calendario
              </Link>
            </div>
          </div>
        </div>
      </section>

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
              value={countDrivers(data.drivers)}
              icon={<Users className="w-5 h-5" />}
            />
            <StatsCard
              title="Carreras"
              value={`${completedRaces}/${data.grandPrix.length}`}
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
                  to="/drivers"
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
                  to="/constructors"
                  className="text-sm text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Ver todo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-4">
                <ConstructorStandingsTable standings={constructorStandings} drivers={data.drivers} teamPrincipals={data.teamPrincipals} compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-secondary-foreground/60 text-sm">
            {data.championship.name} - Temporada {data.championship.season}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
