import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth";
import { StoreProvider } from "@/context/store";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminProjects from "./pages/admin/AdminProjects";
import LeaderHome from "./pages/leader/LeaderHome";
import MemberHome from "./pages/member/MemberHome";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminOverview /></ProtectedRoute>} />
            <Route path="/admin/teams" element={<ProtectedRoute allow={["admin"]}><AdminTeams /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute allow={["admin"]}><AdminProjects /></ProtectedRoute>} />

            <Route path="/leader" element={<ProtectedRoute allow={["leader"]}><LeaderHome /></ProtectedRoute>} />
            <Route path="/member" element={<ProtectedRoute allow={["member"]}><MemberHome /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
