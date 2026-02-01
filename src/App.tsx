import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import WaiterDashboard from "./pages/WaiterDashboard";
import KitchenDashboard from "./pages/KitchenDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { WaiterAuthProvider } from "@/contexts/WaiterAuthContext";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseWaiter } from "@/lib/supabase-waiter";

const queryClient = new QueryClient();

const App = () => {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    // Lazy import these to avoid bundling in prod if possible, 
    // but for now top-level import with conditional usage is fine for valid dead code elimination or just simple dev check.
    // We need to import them at top level actually.
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* 
         DEV MODE CONCURRENT AUTH STRUCTURE 
         We split the app into multiple authentication zones based on routes.
      */}
        {isDev ? (
          <BrowserRouter>
            <Routes>
              {/* 1. Admin Zone - Uses AdminAuthProvider */}
              <Route path="/admin/*" element={
                <AdminAuthProvider>
                  <Routes>
                    <Route path="/" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="login" element={<Login supabaseClient={supabaseAdmin} />} />
                  </Routes>
                </AdminAuthProvider>
              } />

              {/* 2. Waiter Zone - Uses WaiterAuthProvider */}
              <Route path="/waiter/*" element={
                <WaiterAuthProvider>
                  <Routes>
                    <Route path="/" element={
                      <ProtectedRoute allowedRoles={['waiter']}>
                        <WaiterDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={
                      <ProtectedRoute allowedRoles={['waiter']}>
                        <WaiterDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="login" element={<Login supabaseClient={supabaseWaiter} />} />
                  </Routes>
                </WaiterAuthProvider>
              } />

              {/* 3. Kitchen Zone - Uses Default AuthProvider */}
              <Route path="/kitchen/*" element={
                <AuthProvider>
                  <Routes>
                    <Route path="/" element={
                      <ProtectedRoute allowedRoles={['waiter', 'admin', 'chef']}>
                        <KitchenDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={
                      <ProtectedRoute allowedRoles={['waiter', 'admin', 'chef']}>
                        <KitchenDashboard />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </AuthProvider>
              } />

              {/* 4. Standard/Public Zone - Uses Default AuthProvider */}
              <Route path="*" element={
                <AuthProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />

                    {/* Redirect Admin/Waiter root access to their specific login zones if strictly separate? 
                                Or just let them fall through. 
                                For now, standard routes: */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthProvider>
              } />
            </Routes>
          </BrowserRouter>
        ) : (
          /* PRODUCTION STRUCTURE (Standard) */
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Waiter Routes */}
                <Route
                  path="/waiter/*"
                  element={
                    <ProtectedRoute allowedRoles={['waiter']}>
                      <WaiterDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Kitchen Routes */}
                <Route
                  path="/kitchen/*"
                  element={
                    <ProtectedRoute allowedRoles={['waiter', 'admin']}>
                      <KitchenDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="/admin-login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
