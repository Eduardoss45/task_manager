import { useUserConnect } from '@/hooks/auth/useUserConnect';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/resources/validators/auth/resetPasswordValidators';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ResetPasswordForm({ token, onSuccess }: { token: string; onSuccess: () => void }) {
  const { resetPassword, loading } = useUserConnect();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    const ok = await resetPassword({
      token: data.token,
      newPassword: data.newPassword,
    });

    if (ok) {
      onSuccess();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
      <Input type="password" placeholder="Nova senha" {...form.register('newPassword')} />

      <Input type="password" placeholder="Confirmar senha" {...form.register('confirmPassword')} />

      <Button className="w-full" type="submit" disabled={loading}>
        Resetar senha
      </Button>
    </form>
  );
}
