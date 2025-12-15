import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks")({
  component: TasksLayout,
});

function TasksLayout() {
  return (
    <div className="p-6 min-h-screen">
      <Outlet />
    </div>
  );
}
