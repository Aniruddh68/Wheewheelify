import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CompareProvider } from "@/context/CompareContext";
import Index from "./pages/Index.tsx";
import BrowseVehicles from "./pages/BrowseVehicles.tsx";
import NotFound from "./pages/NotFound.tsx";
import VehicleDetailsPage from "./pages/VehicleDetailsPage.tsx";
import ComparePage from "./pages/ComparePage.tsx";
import ComparisonTray from "./components/ComparisonTray.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CompareProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<BrowseVehicles />} />
            <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ComparisonTray />
        </BrowserRouter>
      </CompareProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
