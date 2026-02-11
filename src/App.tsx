import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppBackground } from "@/components/AppBackground"; // Import the background
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminScenarios from "./pages/AdminScenarios";
import AdminCompetitionDetail from "./pages/AdminCompetitionDetail";
import JoinCompetition from "./pages/JoinCompetition";
import CompeteInterface from "./pages/CompeteInterface";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Add the global background here */}
        <AppBackground />
        
        {/* Content wrapper with relative positioning to sit on top of background */}
        <div className="relative z-10 min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/scenarios" element={<AdminScenarios />} />
            <Route path="/admin/competitions/:id" element={<AdminCompetitionDetail />} />
            <Route path="/join/:competitionId" element={<JoinCompetition />} />
            <Route path="/compete/:sessionId" element={<CompeteInterface />} />
            <Route path="/leaderboard/:competitionId" element={<Leaderboard />} />
            <Route path="/leaderboard/global" element={<Leaderboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
