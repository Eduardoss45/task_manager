import type { FC, ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
}

const Footer: FC<FooterProps> = ({ children }) => {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex flex-col gap-3 px-3 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs sm:text-sm text-zinc-400">
          © 2025 <span className="font-medium text-zinc-300">Task Manager</span>. Todos os direitos
          reservados.
        </p>

        {children && (
          <div className="flex justify-center gap-4 text-xs sm:text-sm text-zinc-400">
            {children}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
