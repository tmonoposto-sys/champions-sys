import React, { useEffect, useState, useRef } from "react";
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from "react-joyride";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";
import { useTourStore } from "@/stores/tourStore";
import { listTeams } from "@/services/api";
import { FULL_TOUR_STEPS, FULL_TOUR_ROUTE_MAP } from "@/tours/fullTour";
import { NEW_FEATURES_TOUR_STEPS, NEW_FEATURES_ROUTE_MAP } from "@/tours/newFeaturesTour";

function waitForElement(selector: string, maxWait = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (selector === "body" || document.querySelector(selector)) {
      resolve(true);
      return;
    }
    const interval = 200;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      if (document.querySelector(selector) || elapsed >= maxWait) {
        clearInterval(timer);
        resolve(!!document.querySelector(selector));
      }
    }, interval);
  });
}

const TOUR_STYLES = {
  options: {
    zIndex: 10000,
    primaryColor: "hsl(var(--primary))",
    backgroundColor: "hsl(var(--card))",
    textColor: "hsl(var(--card-foreground))",
    arrowColor: "hsl(var(--card))",
    overlayColor: "rgba(0, 0, 0, 0.6)",
  },
  tooltipContainer: { textAlign: "left" as const },
  buttonNext: {
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
  },
  buttonBack: {
    color: "hsl(var(--muted-foreground))",
    marginRight: "8px",
    fontSize: "14px",
  },
  buttonSkip: { color: "hsl(var(--muted-foreground))", fontSize: "13px" },
  tooltip: {
    borderRadius: "8px",
    padding: "16px",
    maxWidth: "min(90vw, 380px)",
  },
};

const LOCALE = {
  back: "Anterior",
  close: "Cerrar",
  last: "Finalizar",
  next: "Siguiente",
  open: "Abrir",
  skip: "Omitir tour",
};

const TourProvider: React.FC = () => {
  const navigate = useNavigate();
  const { championship } = useAuth();
  const {
    fullTourDone,
    newFeaturesTourDone,
    activeTour,
    startTour,
  } = useTourStore();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const checkedRef = useRef(false);

  const stepsRef = useRef(FULL_TOUR_STEPS);
  const routeMapRef = useRef(FULL_TOUR_ROUTE_MAP);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const steps = activeTour === "full" ? FULL_TOUR_STEPS : NEW_FEATURES_TOUR_STEPS;
  const routeMap = activeTour === "full" ? FULL_TOUR_ROUTE_MAP : NEW_FEATURES_ROUTE_MAP;

  stepsRef.current = steps;
  routeMapRef.current = routeMap;

  // Auto-start tours (runs once)
  useEffect(() => {
    if (checkedRef.current || activeTour || !championship) return;

    let cancelled = false;

    const checkAndStart = async () => {
      if (cancelled) return;
      checkedRef.current = true;

      try {
        const storeState = useTourStore.getState();
        const fDone = storeState.fullTourDone;
        const nDone = storeState.newFeaturesTourDone;

        if (!fDone) {
          const result = await listTeams(championship.code);
          if (cancelled) return;

          if (!result.data || result.data.length === 0) {
            startTour("full");
          } else {
            useTourStore.setState({ fullTourDone: true });
            if (!nDone) {
              startTour("newFeatures");
            }
          }
        } else if (!nDone) {
          startTour("newFeatures");
        }
      } catch {
        // API error - silently skip
      }
    };

    const timer = setTimeout(checkAndStart, 800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeTour, championship, startTour]);

  // When activeTour changes, navigate to first step and start
  useEffect(() => {
    if (!activeTour) {
      setRun(false);
      setStepIndex(0);
      setPendingStep(null);
      return;
    }

    let cancelled = false;

    const init = async () => {
      const route = routeMapRef.current[0];
      if (route && window.location.pathname !== route) {
        navigateRef.current(route);
      }
      const target = stepsRef.current[0]?.target as string;
      await waitForElement(target);
      if (!cancelled) {
        setStepIndex(0);
        setPendingStep(null);
        setRun(true);
      }
    };

    init();

    return () => { cancelled = true; };
  }, [activeTour]);

  // Handle pendingStep: navigate + wait + then advance
  useEffect(() => {
    if (pendingStep === null) return;

    let cancelled = false;

    const advance = async () => {
      const targetRoute = routeMapRef.current[pendingStep];
      const targetSelector = stepsRef.current[pendingStep]?.target as string;

      if (targetRoute && window.location.pathname !== targetRoute) {
        setRun(false);
        navigateRef.current(targetRoute);
      }

      await waitForElement(targetSelector);

      if (!cancelled) {
        setStepIndex(pendingStep);
        setPendingStep(null);
        setRun(true);
      }
    };

    advance();

    return () => { cancelled = true; };
  }, [pendingStep]);

  const finishCurrentTour = () => {
    setRun(false);
    setPendingStep(null);
    const currentTour = useTourStore.getState().activeTour;
    if (currentTour === "full") {
      useTourStore.setState({ fullTourDone: true, activeTour: null });
    } else if (currentTour === "newFeatures") {
      useTourStore.setState({ newFeaturesTourDone: true, activeTour: null });
    } else {
      useTourStore.setState({ activeTour: null });
    }
  };

  // Callback ref so Joyride always calls the latest version
  const callbackRef = useRef<(data: CallBackProps) => void>(() => {});
  callbackRef.current = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      finishCurrentTour();
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
        finishCurrentTour();
        return;
      }

      const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;

      if (nextIndex >= stepsRef.current.length) {
        finishCurrentTour();
        return;
      }

      if (nextIndex >= 0) {
        setPendingStep(nextIndex);
      }
    }
  };

  const handleCallback = (data: CallBackProps) => callbackRef.current(data);

  if (!activeTour) return null;

  return (
    <Joyride
      key={activeTour}
      steps={steps}
      stepIndex={stepIndex}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableScrolling={false}
      scrollOffset={100}
      callback={handleCallback}
      styles={TOUR_STYLES}
      locale={LOCALE}
      floaterProps={{ disableAnimation: true }}
    />
  );
};

export default TourProvider;
