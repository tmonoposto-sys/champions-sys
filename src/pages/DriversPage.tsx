import { Header } from '@/components/Header';
import { DriverStandingsTable } from '@/components/DriverStandingsTable';
import { useChampionshipData } from '@/hooks/useChampionshipData';
import { Users } from 'lucide-react';

const DriversPage = () => {
  const { data, loading, error, calculateDriverStandings } = useChampionshipData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Error cargando datos</p>
      </div>
    );
  }

  const standings = calculateDriverStandings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
            <DriverStandingsTable standings={standings} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DriversPage;
