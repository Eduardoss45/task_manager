import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CardLogin() {
  return (
    <div className="my-5 flex justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Faça login na sua conta</CardTitle>
          <CardDescription>Insira seu e-mail abaixo para acessar sua conta</CardDescription>
          <CardAction>
            <Button variant="link">Registre-se</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="m@exemplo.com" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Conecte-se
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
