import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCompetitionDetail from "./pages/AdminCompetitionDetail";
import AdminScenarios from "./pages/AdminScenarios";
import JoinCompetition from "./pages/JoinCompetition";
import CompeteInterface from "./pages/CompeteInterface";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join/:competitionId" element={<JoinCompetition />} />
          <Route path="/compete/:competitionId" element={<CompeteInterface />} />
          <Route path="/leaderboard/:competitionId" element={<Leaderboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/competitions/:id" element={<ProtectedRoute><AdminCompetitionDetail /></ProtectedRoute>} />
          <Route path="/admin/scenarios" element={<ProtectedRoute><AdminScenarios /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
