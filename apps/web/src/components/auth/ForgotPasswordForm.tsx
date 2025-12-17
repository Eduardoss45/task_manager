import { useUserConnect } from "@/hooks/auth/useUserConnect";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validators/auth/forgotPasswordValidators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm({ onToken }: { onToken: (t: string) => void }) {
  const { forgotPassword, loading } = useUserConnect();
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    const token = await forgotPassword(data);
    if (token) onToken(token);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Username</Label>
        <Input {...form.register("username")} />
      </div>

      <div>
        <Label>Email</Label>
        <Input {...form.register("email")} />
      </div>

      <Button className="w-full" type="submit" disabled={loading}>
        Gerar token
      </Button>
    </form>
  );
}
