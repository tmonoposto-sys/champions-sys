import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Login
import LoginPage from "./pages/LoginPage";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeamsPage from "./pages/admin/TeamsPage";
import DriversPage from "./pages/admin/DriversPage";
import RacesPage from "./pages/admin/RacesPage";
import ResultsPage from "./pages/admin/ResultsPage";

// Public
import PublicLayout from "./pages/public/PublicLayout";
import PublicHome from "./pages/public/PublicHome";
import PublicDrivers from "./pages/public/PublicDrivers";
import PublicConstructors from "./pages/public/PublicConstructors";
import PublicCalendar from "./pages/public/PublicCalendar";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Home redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="races" element={<RacesPage />} />
              <Route path="results" element={<ResultsPage />} />
            </Route>

            {/* Public Championship Routes */}
            <Route path="/:code" element={<PublicLayout />}>
              <Route index element={<PublicHome />} />
              <Route path="drivers" element={<PublicDrivers />} />
              <Route path="constructors" element={<PublicConstructors />} />
              <Route path="calendar" element={<PublicCalendar />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
