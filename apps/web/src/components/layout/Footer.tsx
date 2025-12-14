import type { FC, ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
}

const Footer: FC<FooterProps> = ({ children }) => {
  return (
    <footer className="w-full bg-gray-800 text-gray-200 py-6 px-6 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm">&copy; 2025 Jungle Gaming. Todos os direitos reservados.</p>
      <div className="flex gap-4 mt-2 md:mt-0">
        <a href="#" className="hover:text-white transition-colors">
          Facebook
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Twitter
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Instagram
        </a>
      </div>
      {children}
    </footer>
  );
};

export default Footer;
