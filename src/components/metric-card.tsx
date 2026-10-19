import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TomMetrica = "primary" | "success" | "warning" | "danger" | "neutral";

const ESTILOS_TOM: Record<TomMetrica, { icone: string; valor: string; barra: string }> = {
  primary: {
    icone: "bg-primary/10 text-primary",
    valor: "text-foreground",
    barra: "from-primary/70 to-primary/0",
  },
  success: {
    icone: "bg-status-em-dia/12 text-status-em-dia",
    valor: "text-status-em-dia",
    barra: "from-status-em-dia/70 to-status-em-dia/0",
  },
  warning: {
    icone: "bg-status-hoje/12 text-status-hoje",
    valor: "text-status-hoje",
    barra: "from-status-hoje/70 to-status-hoje/0",
  },
  danger: {
    icone: "bg-status-vencido/12 text-status-vencido",
    valor: "text-status-vencido",
    barra: "from-status-vencido/70 to-status-vencido/0",
  },
  neutral: {
    icone: "bg-muted text-muted-foreground",
    valor: "text-foreground",
    barra: "from-muted-foreground/40 to-muted-foreground/0",
  },
};

interface MetricCardProps {
  titulo: string;
  valor: string;
  descricao?: string;
  icone: LucideIcon;
  tom?: TomMetrica;
  className?: string;
}

export function MetricCard({
  titulo,
  valor,
  descricao,
  icone: Icone,
  tom = "primary",
  className,
}: MetricCardProps) {
  const estilos = ESTILOS_TOM[tom];

  return (
    <Card
      className={cn(
        "card-gradient group relative overflow-hidden border-border/70 shadow-card transition-smooth hover:-translate-y-0.5 hover:border-primary/30",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", estilos.barra)} />
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {titulo}
          </p>
          <p className={cn("text-2xl font-bold leading-tight", estilos.valor)}>{valor}</p>
          {descricao ? (
            <p className="text-xs text-muted-foreground">{descricao}</p>
          ) : null}
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", estilos.icone)}>
          <Icone className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
