import type { Step } from "react-joyride";

export const NEW_FEATURES_TOUR_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "¡Nuevas funcionalidades!",
    content:
      "Hemos agregado varias mejoras a la plataforma. Te mostramos rápidamente las novedades.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="circuits-btn"]',
    placement: "bottom",
    title: "Circuitos personalizados",
    content:
      "Ahora puedes crear tus propios circuitos además de los de F1. Haz click en este botón para agregar, editar o eliminar circuitos personalizados para tu campeonato.",
    disableBeacon: true,
    data: { route: "/admin/races" },
  },
  {
    target: '[data-tour="page-results"]',
    placement: "bottom",
    title: "Búsqueda en selectores",
    content:
      "Todos los selectores ahora incluyen un buscador integrado. Escribe para filtrar circuitos, pilotos, países y más. ¡Mucho más rápido!",
    disableBeacon: true,
    data: { route: "/admin/results" },
  },
  {
    target: '[data-tour="settings-profile"]',
    placement: "bottom",
    title: "Ajustes: Cambiar usuario",
    content:
      "Nueva sección de configuración. Ahora puedes cambiar tu nombre de usuario directamente desde aquí.",
    disableBeacon: true,
    data: { route: "/admin/settings" },
  },
  {
    target: '[data-tour="settings-danger"]',
    placement: "top",
    title: "Zona de peligro",
    content:
      "Si necesitas reiniciar datos, borrar carreras, pilotos o empezar de cero, usa estas opciones con doble confirmación de seguridad.",
  },
  {
    target: "body",
    placement: "center",
    title: "¡Eso es todo!",
    content:
      "Estas son las novedades. Recuerda que puedes repetir cualquier tour desde la sección de Ajustes.",
  },
];

export const NEW_FEATURES_ROUTE_MAP: Record<number, string> = {
  0: "/admin",
  1: "/admin/races",
  2: "/admin/results",
  3: "/admin/settings",
  4: "/admin/settings",
  5: "/admin/settings",
};
