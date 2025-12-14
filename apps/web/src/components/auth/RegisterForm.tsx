import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validators/auth";
import type { RegisterFormData } from "@/lib/validators/auth";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthSkeleton } from "./AuthSkeleton";

export function RegisterForm() {
  const { register: registerUser, loading } = useAuthStore();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      await registerUser(data.email, data.username, data.password);
      toast.success("Conta criada com sucesso");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loading) return <AuthSkeleton />;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input {...form.register("email")} />
      </div>

      <div>
        <Label>Username</Label>
        <Input {...form.register("username")} />
        <p className="text-sm text-red-500">{form.formState.errors.username?.message}</p>
      </div>

      <div>
        <Label>Senha</Label>
        <Input type="password" {...form.register("password")} />
      </div>

      <div>
        <Label>Confirmar Senha</Label>
        <Input type="password" {...form.register("confirmPassword")} />
        <p className="text-sm text-red-500">{form.formState.errors.confirmPassword?.message}</p>
      </div>

      <Button className="w-full" type="submit">
        Registrar
      </Button>
    </form>
  );
}
