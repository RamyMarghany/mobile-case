"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const Providers = ({ children }: { children: React.ReactNode }) => {
  // use queryClient for caching
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
export default Providers;
