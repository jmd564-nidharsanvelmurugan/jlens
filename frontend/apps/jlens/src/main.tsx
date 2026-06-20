import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner'
import { AuthProvider } from "./auth/auth-provider";

import "./index.css";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Avoid refetching on focus
      staleTime: 10 * 1000, // 10 sec stale time
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <AuthProvider>
      <Toaster 
        position="bottom-right" 
        expand={false} 
        toastOptions={{
          style: {
            background: '#4c1d95',
            color: '#ffffff',
            width: '100%',
            fontWeight: 'bold'
          },
        }}
      />
      <App />
    </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
