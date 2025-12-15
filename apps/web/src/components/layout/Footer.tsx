import type { FC, ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
}

const Footer: FC<FooterProps> = ({ children }) => {
  return (
    <footer className="w-full bg-gray-800 text-gray-200 py-6 px-6 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm">&copy; 2025 TASK MANAGER. Todos os direitos reservados.</p>
      {children}
    </footer>
  );
};

export default Footer;
