import TaskDetailsPage from "@/components/tasks/TaskDetailsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/$taskId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { taskId } = Route.useParams();
  return <TaskDetailsPage taskId={taskId} />;
}
