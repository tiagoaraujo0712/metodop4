import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { loadState } from "@/lib/store";
import InstallPWA from "@/components/InstallPWA";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import P4Flow from "./pages/P4Flow";
import Coach from "./pages/Coach";
import Progress from "./pages/Progress";
import MetodoP4 from "./pages/MetodoP4";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const state = loadState();
  return state.user?.onboardingComplete ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/p4" element={<P4Flow />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/metodo" element={<MetodoP4 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPWA />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
