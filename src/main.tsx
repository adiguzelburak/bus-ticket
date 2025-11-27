import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./app/i18n";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <div className="isolate"></div>
      <Toaster position="top-center" />
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
