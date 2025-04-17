import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ItemsProvider } from "./context/ItemsContext";
import { TransactionsProvider } from "./context/TransactionsContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ItemManagement from "./pages/ItemManagement";
import Marketplace from "./pages/Marketplace";
import ItemDetails from "./pages/ItemDetails";
import AccountSettings from "./pages/AccountSettings";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ItemsProvider>
        <TransactionsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/items" element={<ProtectedRoute><ItemManagement /></ProtectedRoute>} />
                <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                <Route path="/marketplace/:itemId" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TransactionsProvider>
      </ItemsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
