import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useParams, Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { getChampionship, listTeams, listDrivers, listRaces, listResults, Team, Driver, Race, RaceResult } from "@/services/api";
import { getCircuitById } from "@/data/circuits";
import { Loader2, Flag, Users, Car, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChampionshipContextType {
  championship: { code: string; name: string } | null;
  teams: Team[];
  drivers: Driver[];
  races: Race[];
  results: RaceResult[];
  loading: boolean;
  getTeamById: (id: string) => Team | undefined;
  getDriverById: (id: string) => Driver | undefined;
}

const ChampionshipContext = createContext<ChampionshipContextType | undefined>(undefined);

export const usePublicChampionship = () => {
  const context = useContext(ChampionshipContext);
  if (!context) {
    throw new Error("usePublicChampionship must be used within PublicLayout");
  }
  return context;
};

const PublicLayout: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const [championship, setChampionship] = useState<{ code: string; name: string } | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!code) return;
      
      setLoading(true);
      const champResult = await getChampionship(code);
      
      if (champResult.error || !champResult.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setChampionship(champResult.data);

      const [teamsResult, driversResult, racesResult, resultsResult] = await Promise.all([
        listTeams(code),
        listDrivers(code),
        listRaces(code),
        listResults(code),
      ]);

      if (teamsResult.data) setTeams(teamsResult.data);
      if (driversResult.data) setDrivers(driversResult.data);
      if (racesResult.data) setRaces(racesResult.data.sort((a, b) => a.order - b.order));
      if (resultsResult.data) setResults(resultsResult.data);

      setLoading(false);
    };

    loadData();
  }, [code]);

  const getTeamById = (id: string) => teams.find((t) => t?._id === id);
  const getDriverById = (id: string) => drivers.find((d) => d?._id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Campeonato no encontrado</h1>
          <p className="text-muted-foreground">El código "{code}" no existe.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: `/${code}`, label: "Inicio", icon: Flag, exact: true },
    { path: `/${code}/drivers`, label: "Pilotos", icon: Users },
    { path: `/${code}/constructors`, label: "Constructores", icon: Car },
    { path: `/${code}/calendar`, label: "Calendario", icon: Calendar },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <ChampionshipContext.Provider value={{ championship, teams, drivers, races, results, loading, getTeamById, getDriverById }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <Link to={`/${code}`} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <span className="font-bold text-base sm:text-lg md:text-xl truncate">{championship?.name}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-md text-sm transition-colors whitespace-nowrap",
                    isActive(item.path, item.exact)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          {/* Mobile Nav */}
          <nav className="md:hidden flex border-t overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 text-xs sm:text-sm whitespace-nowrap min-w-0",
                  isActive(item.path, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </header>

        {/* Content */}
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Outlet />
        </main>
      </div>
    </ChampionshipContext.Provider>
  );
};

export default PublicLayout;