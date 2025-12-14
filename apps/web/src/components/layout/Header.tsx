import type { FC, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth.store";

interface HeaderProps {
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ children }) => {
  const user = useAuthStore(state => state.user);


  console.log(user)
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900">Jungle Gaming</h1>

      <nav className="flex items-center gap-4">
        {user && <Label className="text-sm text-gray-700">{user.username ?? user.email}</Label>}
      </nav>

      {children}
    </header>
  );
};

export default Header;
