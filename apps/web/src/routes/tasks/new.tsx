import { CreateTaskPage } from "@/components/tasks/CreateTaskPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateTaskPage />;
}
