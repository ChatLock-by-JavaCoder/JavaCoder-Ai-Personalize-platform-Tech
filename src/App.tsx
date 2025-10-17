import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Exams from "./pages/Exams";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";
import ExamInterface from "./pages/ExamInterface";
import PrivacyPolicy from "./pages/Privacypolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/exam/:examId" element={<ExamInterface />} />
                    <Route path="/privacy" element={<PrivacyPolicy/>} />
                    {/* <Route path="/terms" element={<TermsAndConditions/>} /> */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
