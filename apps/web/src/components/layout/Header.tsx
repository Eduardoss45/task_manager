import type { FC, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { authStore } from "@/store/auth.store";

interface HeaderProps {
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ children }) => {
  const user = authStore(state => state.user);
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900">TASK MANAGER</h1>

      <nav className="flex items-center gap-4">
        {user ? (
          <Label className="text-sm text-gray-700">
            Olá, <span className="font-medium">{user.username}</span>
          </Label>
        ) : (
          <Label className="text-sm text-gray-500">Visitante</Label>
        )}
      </nav>

      {children}
    </header>
  );
};

export default Header;
