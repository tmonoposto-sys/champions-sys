import { Header } from '@/components/Header';
import { RaceCard } from '@/components/RaceCard';
import { useChampionshipData } from '@/hooks/useChampionshipData';
import { Calendar } from 'lucide-react';

const CalendarPage = () => {
  const { data, loading, error, getDriverById, getTeamById } = useChampionshipData();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="gradient-f1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-primary-foreground">Calendario {data.championship.season}</h1>
              <p className="text-primary-foreground/70">{data.grandPrix.length} Grandes Premios</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {data.grandPrix.map(gp => (
              <RaceCard
                key={gp.id}
                gp={gp}
                result={data.results[gp.id.toString()]}
                getDriverById={getDriverById}
                getTeamById={getTeamById}
                pointsSystem={data.pointsSystem}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;
