export interface F1Circuit {
  id: string;
  name: string;
  circuit: string;
  country: string;
  flag: string;
}

export type TrackProfile = "rapido" | "tecnico" | "mixto";

export const F1_CIRCUITS: F1Circuit[] = [
  { id: "bahrain", name: "Gran Premio de Bahréin", circuit: "Circuito Internacional de Bahréin", country: "Bahréin", flag: "🇧🇭" },
  { id: "saudi", name: "Gran Premio de Arabia Saudita", circuit: "Circuito Callejero de Yeda", country: "Arabia Saudita", flag: "🇸🇦" },
  { id: "australia", name: "Gran Premio de Australia", circuit: "Circuito de Albert Park", country: "Australia", flag: "🇦🇺" },
  { id: "japan", name: "Gran Premio de Japón", circuit: "Circuito de Suzuka", country: "Japón", flag: "🇯🇵" },
  { id: "china", name: "Gran Premio de China", circuit: "Circuito Internacional de Shanghái", country: "China", flag: "🇨🇳" },
  { id: "miami", name: "Gran Premio de Miami", circuit: "Autódromo Internacional de Miami", country: "Estados Unidos", flag: "🇺🇸" },
  { id: "imola", name: "Gran Premio de Emilia-Romaña", circuit: "Autódromo Enzo y Dino Ferrari", country: "Italia", flag: "🇮🇹" },
  { id: "monaco", name: "Gran Premio de Mónaco", circuit: "Circuito de Mónaco", country: "Mónaco", flag: "🇲🇨" },
  { id: "canada", name: "Gran Premio de Canadá", circuit: "Circuito Gilles Villeneuve", country: "Canadá", flag: "🇨🇦" },
  { id: "spain", name: "Gran Premio de España", circuit: "Circuit de Barcelona-Catalunya", country: "España", flag: "🇪🇸" },
  { id: "austria", name: "Gran Premio de Austria", circuit: "Red Bull Ring", country: "Austria", flag: "🇦🇹" },
  { id: "silverstone", name: "Gran Premio de Gran Bretaña", circuit: "Circuito de Silverstone", country: "Reino Unido", flag: "🇬🇧" },
  { id: "hungary", name: "Gran Premio de Hungría", circuit: "Hungaroring", country: "Hungría", flag: "🇭🇺" },
  { id: "belgium", name: "Gran Premio de Bélgica", circuit: "Circuito de Spa-Francorchamps", country: "Bélgica", flag: "🇧🇪" },
  { id: "netherlands", name: "Gran Premio de Países Bajos", circuit: "Circuito de Zandvoort", country: "Países Bajos", flag: "🇳🇱" },
  { id: "monza", name: "Gran Premio de Italia", circuit: "Autódromo Nacional de Monza", country: "Italia", flag: "🇮🇹" },
  { id: "azerbaijan", name: "Gran Premio de Azerbaiyán", circuit: "Circuito Callejero de Bakú", country: "Azerbaiyán", flag: "🇦🇿" },
  { id: "singapore", name: "Gran Premio de Singapur", circuit: "Circuito Callejero de Marina Bay", country: "Singapur", flag: "🇸🇬" },
  { id: "usa", name: "Gran Premio de Estados Unidos", circuit: "Circuito de las Américas", country: "Estados Unidos", flag: "🇺🇸" },
  { id: "mexico", name: "Gran Premio de México", circuit: "Autódromo Hermanos Rodríguez", country: "México", flag: "🇲🇽" },
  { id: "brazil", name: "Gran Premio de Brasil", circuit: "Autódromo José Carlos Pace", country: "Brasil", flag: "🇧🇷" },
  { id: "lasvegas", name: "Gran Premio de Las Vegas", circuit: "Circuito Callejero de Las Vegas", country: "Estados Unidos", flag: "🇺🇸" },
  { id: "qatar", name: "Gran Premio de Catar", circuit: "Circuito Internacional de Losail", country: "Catar", flag: "🇶🇦" },
  { id: "abudhabi", name: "Gran Premio de Abu Dabi", circuit: "Circuito de Yas Marina", country: "Emiratos Árabes Unidos", flag: "🇦🇪" },
  { id: "turkey", name: "Gran Premio de Turquía", circuit: "Istanbul Park", country: "Turquía", flag: "🇹🇷" },
  { id: "germany", name: "Gran Premio de Alemania", circuit: "Hockenheimring", country: "Alemania", flag: "🇩🇪" },
  { id: "europe", name: "Gran Premio de Europa", circuit: "Circuito Urbano de Valencia", country: "España", flag: "🇪🇸" },
  { id: "tuscan", name: "Gran Premio de la Toscana", circuit: "Autodromo Internazionale del Mugello", country: "Italia", flag: "🇮🇹" },
  { id: "malaysia", name: "Gran Premio de Malasia", circuit: "Sepang International Circuit", country: "Malasia", flag: "🇲🇾" },
  { id: "france", name: "Gran Premio de Francia", circuit: "Circuit Paul Ricard", country: "Francia", flag: "🇫🇷" },
  { id: "illinois", name: "Gran Premio de Illinois", circuit: "Chicago Street Circuit", country: "Estados Unidos", flag: "🇺🇸" },
  { id: "south_africa", name: "Gran Premio de Sudáfrica", circuit: "Kyalami Grand Prix Circuit", country: "Sudáfrica", flag: "🇿🇦" },
  { id: "andalucia", name: "Gran Premio de Andalucía", circuit: "Circuito de Jerez – Ángel Nieto", country: "España", flag: "🇪🇸" }
];

export const getCircuitById = (id: string): F1Circuit | undefined => {
  return F1_CIRCUITS.find(c => c.id === id);
};

const TRACK_PROFILE_BY_CIRCUIT: Record<string, TrackProfile> = {
  bahrain: "mixto",
  saudi: "rapido",
  australia: "rapido",
  japan: "tecnico",
  china: "mixto",
  miami: "rapido",
  imola: "tecnico",
  monaco: "tecnico",
  canada: "rapido",
  spain: "tecnico",
  austria: "rapido",
  silverstone: "rapido",
  hungary: "tecnico",
  belgium: "rapido",
  netherlands: "tecnico",
  monza: "rapido",
  azerbaijan: "rapido",
  singapore: "tecnico",
  usa: "mixto",
  mexico: "mixto",
  brazil: "mixto",
  lasvegas: "rapido",
  qatar: "rapido",
  abudhabi: "mixto",
  turkey: "mixto",
  germany: "rapido",
  europe: "mixto",
  tuscan: "rapido",
  malaysia: "mixto",
  france: "rapido",
  illinois: "rapido",
  south_africa: "rapido",
  andalucia: "tecnico"
};

export const getCircuitTrackProfile = (circuitId: string): TrackProfile => {
  return TRACK_PROFILE_BY_CIRCUIT[circuitId] || "mixto";
};
