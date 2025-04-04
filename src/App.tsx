
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { isConfigValid } from "./lib/supabase";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow">
            {!isConfigValid && (
              <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 m-4" role="alert">
                <h3 className="font-bold">Supabase Configuration Required</h3>
                <p>To use this application, you need to set up Supabase environment variables:</p>
                <ol className="list-decimal ml-5 mt-2">
                  <li>Sign up for a free Supabase account at <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">https://supabase.com</a></li>
                  <li>Create a new project</li>
                  <li>Find your project URL and anon key in the project's API settings</li>
                  <li>Update the variables in src/lib/supabase.ts with your project details</li>
                </ol>
              </div>
            )}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
