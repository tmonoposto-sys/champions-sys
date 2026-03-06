import type { Step } from "react-joyride";

export const FULL_TOUR_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "¡Bienvenido a tu campeonato!",
    content:
      "Este tour te guiará por todas las funcionalidades de la plataforma para que puedas gestionar tu campeonato como un profesional. ¡Empecemos!",
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-nav"]',
    placement: "right",
    title: "Navegación",
    content:
      "Desde aquí puedes acceder a todas las secciones: Escuderías, Pilotos, Carreras, Resultados y Ajustes. En móvil esta barra aparece en la parte inferior.",
  },
  {
    target: '[data-tour="quick-links"]',
    placement: "bottom",
    title: "Accesos rápidos",
    content:
      "Estos accesos directos te llevan a las secciones principales para gestionar tu campeonato rápidamente.",
  },
  {
    target: '[data-tour="public-link"]',
    placement: "top",
    title: "Enlace público",
    content:
      "Comparte este enlace con los participantes para que vean la clasificación, calendario y resultados en tiempo real.",
  },
  {
    target: '[data-tour="page-teams"]',
    placement: "bottom",
    title: "Escuderías",
    content:
      "Aquí creas y gestionas las escuderías (equipos). Cada una tiene un nombre y un color que se usará para identificarla visualmente en toda la plataforma.",
    disableBeacon: true,
    data: { route: "/admin/teams" },
  },
  {
    target: '[data-tour="page-drivers"]',
    placement: "bottom",
    title: "Pilotos",
    content:
      "Registra a los pilotos asignándolos a una escudería, con su número y estado (Titular, Reserva o Expiloto). Los expilotos no aparecen en resultados.",
    disableBeacon: true,
    data: { route: "/admin/drivers" },
  },
  {
    target: '[data-tour="page-races"]',
    placement: "bottom",
    title: "Carreras",
    content:
      "Configura el calendario de carreras. Selecciona circuitos de F1 o crea los tuyos propios. Puedes marcar carreras como Sprint o en Lluvia y el orden se reorganiza automáticamente.",
    disableBeacon: true,
    data: { route: "/admin/races" },
  },
  {
    target: '[data-tour="page-results"]',
    placement: "bottom",
    title: "Resultados",
    content:
      "Ingresa los tiempos de clasificación y el sistema los ordenará automáticamente del más rápido al más lento. En la pestaña de carrera, asigna pilotos a cada posición y elige la vuelta rápida. Al guardar, el sistema calcula automáticamente los puntos y los suma a la clasificación del campeonato.",
    disableBeacon: true,
    data: { route: "/admin/results" },
  },
  {
    target: '[data-tour="page-settings"]',
    placement: "bottom",
    title: "Ajustes",
    content:
      "Cambia tu nombre de usuario o elimina datos del campeonato desde la zona de peligro. También puedes repetir este tutorial desde aquí.",
    disableBeacon: true,
    data: { route: "/admin/settings" },
  },
  {
    target: '[data-tour="whatsapp-card"]',
    placement: "top",
    title: "Comunidad WhatsApp",
    content:
      "Únete al grupo de WhatsApp para reportar errores, sugerir mejoras y estar al día con las novedades de la plataforma.",
    disableBeacon: true,
    data: { route: "/admin" },
  },
  {
    target: "body",
    placement: "center",
    title: "¡Listo para competir!",
    content:
      "Ya conoces todas las herramientas. Empieza creando tus escuderías, luego los pilotos, configura las carreras y registra los resultados. ¡Buena suerte!",
  },
];

export const FULL_TOUR_ROUTE_MAP: Record<number, string> = {
  0: "/admin",
  1: "/admin",
  2: "/admin",
  3: "/admin",
  4: "/admin/teams",
  5: "/admin/drivers",
  6: "/admin/races",
  7: "/admin/results",
  8: "/admin/settings",
  9: "/admin",
  10: "/admin",
};
