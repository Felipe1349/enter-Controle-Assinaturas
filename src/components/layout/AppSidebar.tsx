import {
  CalendarDays,
  LayoutDashboard,
  Landmark,
  Receipt,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface ItemNavegacao {
  para: string;
  label: string;
  icone: LucideIcon;
  fim?: boolean;
}

const ITENS: ItemNavegacao[] = [
  { para: "/", label: "Dashboard", icone: LayoutDashboard, fim: true },
  { para: "/clientes", label: "Clientes", icone: Users },
  { para: "/pagamentos", label: "Pagamentos", icone: Receipt },
  { para: "/calendario", label: "Calendário financeiro", icone: CalendarDays },
  { para: "/caixa", label: "Caixa da Empresa", icone: Landmark },
  { para: "/configuracoes", label: "Configurações", icone: Settings },
];

interface AppSidebarProps {
  aoNavegar?: () => void;
}

export function AppSidebar({ aoNavegar }: AppSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-elegant">
          <Wallet className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-sidebar-foreground">
            Controle de Assinaturas
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Cobrança e recorrência
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {ITENS.map((item) => (
          <NavLink
            key={item.para}
            to={item.para}
            end={item.fim}
            onClick={aoNavegar}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icone
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border px-5 py-4">
        <div className="rounded-lg bg-sidebar-accent/60 p-3">
          <p className="text-xs font-semibold text-sidebar-foreground">Cobrança integrada</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Envie a mensagem padrão pelo WhatsApp com um clique em cada cliente.
          </p>
        </div>
        <ThemeToggle showLabel className="w-full justify-start" />
      </div>
    </div>
  );
}
