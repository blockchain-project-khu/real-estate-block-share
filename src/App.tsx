
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import MyPage from "./pages/MyPage";
import InvestmentConfirm from "./pages/InvestmentConfirm";
import PropertyRegister from "./pages/PropertyRegister";
import RentConfirm from "./pages/RentConfirm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/property/register" element={<PropertyRegister />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/property/:id/invest" element={<InvestmentConfirm />} />
            <Route path="/property/:id/rent" element={<RentConfirm />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
