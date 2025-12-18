import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks")({
  component: TasksLayout,
});

function TasksLayout() {
  return (
    <div className="min-h-screen py-3 sm:px-4 sm:py-4 md:p-6 bg-gray-50 container mx-auto px-4">
      <Outlet />
    </div>
  );
}
