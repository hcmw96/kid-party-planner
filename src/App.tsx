import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PartyList from "./pages/PartyList";
import CreateEvent from "./pages/CreateEvent";
import PartyPage from "./pages/PartyPage";
import ThankYou from "./pages/ThankYou";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import AdminGuard from "./components/admin/AdminGuard";
import NotFound from "./pages/NotFound";
import HostShell from "./components/native/HostShell";
import { useDespia } from "@/hooks/useDespia";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useDespia();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/party/:eventId" element={<PartyPage />} />
      <Route path="/party/:eventId/thank-you" element={<ThankYou />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminPage />
          </AdminGuard>
        }
      />

      <Route element={<HostShell />}>
        <Route path="/parties" element={<PartyList />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/dashboard/:eventId" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
