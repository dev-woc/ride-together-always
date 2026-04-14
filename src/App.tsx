import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import Community from "./pages/Community";
import MentalHealthResources from "./pages/MentalHealthResources";
import RideSignup from "./pages/RideSignup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/cos/ProtectedRoute";
import CycleOfSupportLanding from "./pages/cos/CycleOfSupportLanding";
import CosSignup from "./pages/cos/CosSignup";
import CosLogin from "./pages/cos/CosLogin";
import CosApply from "./pages/cos/CosApply";
import CosDashboard from "./pages/cos/CosDashboard";
import CosAdmin from "./pages/cos/CosAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/community" element={<Community />} />
            <Route path="/resources" element={<MentalHealthResources />} />
            <Route path="/ride-signup" element={<RideSignup />} />
            <Route path="/admin" element={<Admin />} />

            {/* Cycle of Support */}
            <Route path="/cycle-of-support" element={<CycleOfSupportLanding />} />
            <Route path="/cycle-of-support/signup" element={<CosSignup />} />
            <Route path="/cycle-of-support/login" element={<CosLogin />} />
            <Route path="/cycle-of-support/apply" element={<ProtectedRoute><CosApply /></ProtectedRoute>} />
            <Route path="/cycle-of-support/dashboard" element={<ProtectedRoute><CosDashboard /></ProtectedRoute>} />
            <Route path="/cycle-of-support/admin" element={<ProtectedRoute adminOnly><CosAdmin /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
