import { Tasks } from "@/components/tasks/Tasks";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/")({
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="gap-6 p-6 w-full min-h-screen">
      <Tasks />
    </div>
  );
}
