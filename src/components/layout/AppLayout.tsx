import { AlertTriangle, Loader2, Menu } from "lucide-react";
import { Suspense, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppLayout() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 border-r border-sidebar-border lg:block">
        <AppSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md md:px-6 lg:px-8">
          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[286px] p-0">
              <SheetTitle className="sr-only">Menu principal</SheetTitle>
              <SheetDescription className="sr-only">
                Navegação entre os módulos do sistema
              </SheetDescription>
              <AppSidebar aoNavegar={() => setMenuAberto(false)} />
            </SheetContent>
          </Sheet>

          <span className="truncate text-sm font-semibold lg:hidden">Controle de Assinaturas</span>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/clientes?filtro=vencidos">
                <AlertTriangle className="h-4 w-4 text-status-vencido" />
                Cobranças em atraso
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2 text-sm">Carregando...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
