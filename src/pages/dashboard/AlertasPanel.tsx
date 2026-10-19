import { AlertTriangle, ArrowRight, BellRing, CalendarClock, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/format";
import {
  diasAteVencimento,
  validadeLabel,
  type AlertasCobranca,
  type FiltroRapido,
} from "@/lib/assinaturas";
import type { ClienteComRelacoes } from "@/types/assinaturas";

interface GrupoAlerta {
  chave: keyof AlertasCobranca;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  tom: string;
  filtro?: FiltroRapido;
}

const GRUPOS: GrupoAlerta[] = [
  {
    chave: "vencidos",
    titulo: "Clientes vencidos",
    descricao: "Cobrar com urgência",
    icone: AlertTriangle,
    tom: "border-status-vencido/30 bg-status-vencido/8 text-status-vencido",
    filtro: "vencidos",
  },
  {
    chave: "vencemHoje",
    titulo: "Vencem hoje",
    descricao: "Cobrança do dia",
    icone: BellRing,
    tom: "border-status-hoje/30 bg-status-hoje/8 text-status-hoje",
    filtro: "vence_hoje",
  },
  {
    chave: "proximos3Dias",
    titulo: "Vencem nos próximos 3 dias",
    descricao: "Atenção preventiva",
    icone: CalendarClock,
    tom: "border-status-atencao/35 bg-status-atencao/10 text-status-atencao",
    filtro: "proximos_3",
  },
  {
    chave: "semPagamento60Dias",
    titulo: "Sem pagamento há mais de 60 dias",
    descricao: "Histórico parado",
    icone: Clock,
    tom: "border-border bg-muted text-muted-foreground",
  },
];

interface AlertasPanelProps {
  alertas: AlertasCobranca;
}

export function AlertasPanel({ alertas }: AlertasPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Alertas de cobrança</h2>
        <p className="text-sm text-muted-foreground">
          Situações que exigem ação imediata do time financeiro.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {GRUPOS.map((grupo) => (
          <AlertaCard key={grupo.chave} grupo={grupo} clientes={alertas[grupo.chave]} />
        ))}
      </div>
    </section>
  );
}

function AlertaCard({ grupo, clientes }: { grupo: GrupoAlerta; clientes: ClienteComRelacoes[] }) {
  const Icone = grupo.icone;
  const visiveis = clientes.slice(0, 4);

  return (
    <Card className="card-gradient flex flex-col border-border/70 shadow-card">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${grupo.tom}`}>
            <Icone className="h-4 w-4" />
          </span>
          <span className="text-2xl font-bold leading-none">{clientes.length}</span>
        </div>
        <div>
          <CardTitle className="text-sm font-semibold leading-snug">{grupo.titulo}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{grupo.descricao}</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2 pt-0">
        {visiveis.length === 0 ? (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Nenhum cliente nesta situação.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {visiveis.map((cliente) => {
              const dias = diasAteVencimento(cliente.proximo_vencimento);
              return (
                <li
                  key={cliente.id}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-2.5 py-2"
                >
                  <Link to={`/clientes/${cliente.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{cliente.nome_completo}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {validadeLabel(dias)} · {formatarMoeda(cliente.valor)}
                    </p>
                  </Link>
                  <WhatsAppButton nome={cliente.nome_completo} whatsapp={cliente.whatsapp} />
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          {clientes.length > visiveis.length ? (
            <span className="text-[11px] text-muted-foreground">
              +{clientes.length - visiveis.length} outros
            </span>
          ) : (
            <span />
          )}
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <Link to={grupo.filtro ? `/clientes?filtro=${grupo.filtro}` : "/clientes"}>
              Ver todos
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
