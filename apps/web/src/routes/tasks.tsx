import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="grid grid-cols-12 gap-6 p-6 w-full min-h-screen">
      <p>Tasks</p>
    </div>
  );
}
