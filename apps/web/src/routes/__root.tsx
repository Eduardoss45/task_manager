import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { useUserConnect } from "@/hooks/auth/useUserConnect";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { bootstrapSession, hydrated } = useUserConnect();

  useEffect(() => {
    bootstrapSession();
  }, []);

  if (!hydrated) {
    return <div className="p-8 animate-pulse">Carregando sessão...</div>;
  }
  return (
    <>
      <Header />
      <Outlet />
      <Toaster richColors position="top-right" />
      <Footer />
    </>
  );
}
