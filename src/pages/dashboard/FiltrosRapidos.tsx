import { FILTROS_RAPIDOS, type FiltroRapido } from "@/lib/assinaturas";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const TONS: Record<FiltroRapido, string> = {
  todos: "border-border bg-card text-foreground hover:border-primary/40",
  em_dia: "border-status-em-dia/30 bg-status-em-dia/10 text-status-em-dia hover:bg-status-em-dia/20",
  vence_hoje: "border-status-hoje/30 bg-status-hoje/10 text-status-hoje hover:bg-status-hoje/20",
  proximos_3: "border-status-atencao/35 bg-status-atencao/12 text-status-atencao hover:bg-status-atencao/20",
  vencidos: "border-status-vencido/30 bg-status-vencido/10 text-status-vencido hover:bg-status-vencido/20",
  ativos: "border-primary/25 bg-primary/10 text-primary hover:bg-primary/20",
  inativos: "border-border bg-muted text-muted-foreground hover:bg-muted/70",
};

export function FiltrosRapidos() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Filtros rápidos
        </h2>
        <p className="text-xs text-muted-foreground">
          Atalhos para a carteira de clientes por situação de cobrança.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTROS_RAPIDOS.map((filtro) => (
          <Link
            key={filtro.valor}
            to={`/clientes?filtro=${filtro.valor}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-smooth",
              TONS[filtro.valor],
            )}
          >
            {filtro.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
