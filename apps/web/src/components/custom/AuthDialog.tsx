import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

import { authService } from "@/services/authService";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3),
});

type FormData = z.infer<typeof registerSchema>;

export default function AuthDialog() {
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
  });

  async function onSubmit(data: FormData) {
    try {
      if (isRegistering) {
        await authService.register(data.email, data.username!, data.password);
        toast.success("Registrado com sucesso");
      } else {
        await authService.login(data.email, data.password);
        toast.success("Login realizado");
      }
      window.location.reload(); // força hydrate
    } catch {
      toast.error("Erro ao autenticar");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Entrar / Registrar</Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Email" {...form.register("email")} />

          {isRegistering && <Input placeholder="Username" {...form.register("username")} />}

          <Input type="password" placeholder="Senha" {...form.register("password")} />

          <Button type="submit" className="w-full">
            {isRegistering ? "Registrar" : "Entrar"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Já tem conta? Entrar" : "Não tem conta? Registrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
