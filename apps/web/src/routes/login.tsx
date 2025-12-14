import { CardLogin } from "@/components/custom/CardLogin";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <CardLogin />
    </>
  );
}
