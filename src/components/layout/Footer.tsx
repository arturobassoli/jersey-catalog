import { Shirt } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#39FF14]/20 py-6 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#39FF14] font-oswald font-extrabold uppercase tracking-wider text-lg">
          <Shirt className="h-5 w-5" />
          JCM
        </div>
        <p className="text-gray-500 text-sm">
          © 2025 Jersey Collection Manager
        </p>
      </div>
    </footer>
  );
}
