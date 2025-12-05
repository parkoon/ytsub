import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 border-b border-dashed backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">
            Tube<span className="text-primary">Wiki</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
