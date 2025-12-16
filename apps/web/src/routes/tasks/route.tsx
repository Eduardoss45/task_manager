import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks")({
  component: TasksLayout,
});

function TasksLayout() {
  return (
    <div className="min-h-screen px-2 py-3 sm:px-4 sm:py-4 md:p-6 bg-gray-50">
      <Outlet />
    </div>
  );
}

