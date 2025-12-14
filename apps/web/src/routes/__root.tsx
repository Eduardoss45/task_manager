import { Outlet, createRootRoute } from "@tanstack/react-router";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex flex-col min-h-screen justify-center">
      <Header />
      <main className="flex-1 mx-12 my-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
