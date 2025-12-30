import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/resources/validators/auth/loginValidators';
import type { LoginFormData } from '@/resources/validators/auth/loginValidators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserConnect } from '@/hooks/auth/useUserConnect';
import { AuthSkeleton } from './AuthSkeleton';

export function LoginForm() {
  const { login, loading } = useUserConnect();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    await login(data);
  }

  if (loading) return <AuthSkeleton />;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input {...form.register('email')} />
        <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
      </div>

      <div>
        <Label>Senha</Label>
        <Input type="password" {...form.register('password')} />
        <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
      </div>

      <Button className="w-full" type="submit">
        Entrar
      </Button>
    </form>
  );
}
