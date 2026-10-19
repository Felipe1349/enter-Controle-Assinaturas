import { CalendarCheck, CalendarPlus, History } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarData, formatarMoeda } from "@/lib/format";
import { FORMA_PAGAMENTO_LABEL } from "@/types/assinaturas";
import type { ClienteComRelacoes, Pagamento } from "@/types/assinaturas";

interface LinhaTempoProps {
  cliente: ClienteComRelacoes;
  pagamentos: Pagamento[];
}

interface Evento {
  id: string;
  data: string;
  titulo: string;
  descricao: string;
  icone: typeof CalendarPlus;
  tom: string;
}

export function LinhaTempo({ cliente, pagamentos }: LinhaTempoProps) {
  const eventos: Evento[] = [
    {
      id: "cadastro",
      data: cliente.data_cadastro,
      titulo: "Cliente cadastrado",
      descricao: `Entrada na carteira ${cliente.empresas?.nome ? `pela empresa ${cliente.empresas.nome}` : ""} no plano ${
        cliente.planos?.nome ?? "—"
      }.`,
      icone: CalendarPlus,
      tom: "bg-primary/10 text-primary",
    },
    ...pagamentos.map((pagamento) => ({
      id: pagamento.id,
      data: pagamento.data_pagamento,
      titulo: `Pagamento de ${formatarMoeda(pagamento.valor_pago)}`,
      descricao: `${FORMA_PAGAMENTO_LABEL[pagamento.forma_pagamento]}${
        pagamento.vencimento_novo
          ? ` · vencimento atualizado para ${formatarData(pagamento.vencimento_novo)}`
          : ""
      }${pagamento.observacao ? ` · ${pagamento.observacao}` : ""}`,
      icone: CalendarCheck,
      tom: "bg-status-em-dia/12 text-status-em-dia",
    })),
  ].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="h-4 w-4 text-primary" />
          Linha do tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l border-border/70 pl-6">
          {eventos.map((evento) => {
            const Icone = evento.icone;
            return (
              <li key={evento.id} className="relative">
                <span
                  className={`absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full border border-border/70 ${evento.tom}`}
                >
                  <Icone className="h-3.5 w-3.5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatarData(evento.data)}
                </p>
                <p className="text-sm font-semibold">{evento.titulo}</p>
                <p className="text-xs text-muted-foreground">{evento.descricao}</p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
