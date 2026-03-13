import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfigProvider } from "@/lib/config";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import FilaCriticaPage from "@/pages/FilaCriticaPage";
import RadarOperacionalPage from "@/pages/RadarOperacionalPage";
import QualidadeBasePage from "@/pages/QualidadeBasePage";
import ExploradorDadosPage from "@/pages/ExploradorDadosPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ConfigProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/fila-critica" element={<FilaCriticaPage />} />
              <Route path="/radar" element={<RadarOperacionalPage />} />
              <Route path="/qualidade" element={<QualidadeBasePage />} />
              <Route path="/explorador" element={<ExploradorDadosPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </ConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
