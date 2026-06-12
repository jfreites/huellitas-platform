import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-stone-50 dark:bg-stone-900/50 mt-auto py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-foreground/60">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🐾</span>
            <span className="font-bold text-foreground">Huellitas</span>
            <span>&copy; {new Date().getFullYear()} - Conectando mascotas con sus familias.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/reportes" className="hover:text-lost transition-colors">
              Ver Catálogo
            </Link>
            <Link href="/reportes/nuevo" className="hover:text-lost transition-colors">
              Reportar Mascota
            </Link>
            <a href="https://github.com/jfreites/huellitas-platform" target="_blank" rel="noopener noreferrer" className="hover:text-lost transition-colors">
              Código Abierto
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-foreground/40">
          Esta plataforma es un MVP diseñado para la búsqueda y resguardo rápido de animales de compañía en situaciones de extravío. Por favor, <strong>reporta con responsabilidad</strong>.
        </div>
      </div>
    </footer>
  );
}
