import type { FC, ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserConnect } from "@/hooks/auth/useUserConnect";
import { Label } from "@/components/ui/label";
import { authStore } from "@/store/auth.store";
import { Button } from "../ui/button";

interface HeaderProps {
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ children }) => {
  const user = authStore(state => state.user);
  const { logout } = useUserConnect();

  return (
    <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 items-center justify-between px-3 sm:px-6">
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
          TASK MANAGER
        </h1>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-zinc-200 text-zinc-700">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <Label className="hidden sm:block text-sm text-zinc-600">
                  Olá, <span className="font-medium text-zinc-800">{user.username}</span>
                </Label>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              >
                Sair
              </Button>
            </>
          ) : (
            <Label className="text-sm text-zinc-500">Visitante</Label>
          )}

          {children}
        </div>
      </div>
    </header>
  );
};

export default Header;
