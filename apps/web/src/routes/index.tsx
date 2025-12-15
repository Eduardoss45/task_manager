import { Modal } from "@/components/tasks/Modal";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Modal />
    </div>
  );
}
