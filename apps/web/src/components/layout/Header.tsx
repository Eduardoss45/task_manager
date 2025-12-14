import type { FC, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ children }) => {
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900">Jungle Gaming</h1>
      <nav className="flex items-center gap-4">
        <Button variant="ghost">Home</Button>
        <Button variant="ghost">Sobre</Button>
        <Button variant="ghost">Contato</Button>
      </nav>
      {children}
    </header>
  );
};

export default Header;
