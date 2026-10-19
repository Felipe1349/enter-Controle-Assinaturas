import { Banknote, CalendarClock, Repeat, Wallet } from "lucide-react";

import { StatusCobrancaBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diasAteVencimento, intervaloDoPlano, validadeLabel } from "@/lib/assinaturas";
import { formatarData, formatarMoeda } from "@/lib/format";
import { FORMA_PAGAMENTO_LABEL } from "@/types/assinaturas";
import type { ClienteComRelacoes, Pagamento } from "@/types/assinaturas";

interface InformacoesFinanceirasCardProps {
  cliente: ClienteComRelacoes;
  pagamentos: Pagamento[];
}

export function InformacoesFinanceirasCard({
  cliente,
  pagamentos,
}: InformacoesFinanceirasCardProps) {
  const dias = diasAteVencimento(cliente.proximo_vencimento);
  const intervalo = intervaloDoPlano(cliente.planos);
  const totalRecebido = pagamentos.reduce((total, item) => total + Number(item.valor_pago), 0);
  const ultimoPagamento = pagamentos[0];

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Wallet className="h-4 w-4 text-primary" />
          Informações financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Indicador
            rotulo="Valor da assinatura"
            valor={formatarMoeda(cliente.valor)}
            detalhe={`Plano ${cliente.planos?.nome ?? "—"}`}
            icone={<Banknote className="h-4 w-4" />}
          />
          <Indicador
            rotulo="Total recebido"
            valor={formatarMoeda(totalRecebido)}
            detalhe={`${pagamentos.length} pagamento(s) registrado(s)`}
            icone={<Repeat className="h-4 w-4" />}
          />
          <Indicador
            rotulo="Último pagamento"
            valor={ultimoPagamento ? formatarData(ultimoPagamento.data_pagamento) : "Nunca pagou"}
            detalhe={
              ultimoPagamento
                ? `${formatarMoeda(ultimoPagamento.valor_pago)} · ${
                    FORMA_PAGAMENTO_LABEL[ultimoPagamento.forma_pagamento]
                  }`
                : "Sem histórico de pagamentos"
            }
            icone={<CalendarClock className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Próximo vencimento
            </p>
            <p className="text-lg font-bold">{formatarData(cliente.proximo_vencimento)}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {validadeLabel(dias)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <StatusCobrancaBadge dias={dias} />
            <span className="text-xs text-muted-foreground">
              Periodicidade de {intervalo} dias
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Indicador({
  rotulo,
  valor,
  detalhe,
  icone,
}: {
  rotulo: string;
  valor: string;
  detalhe: string;
  icone: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icone}
        {rotulo}
      </p>
      <p className="mt-1 text-lg font-bold">{valor}</p>
      <p className="text-xs text-muted-foreground">{detalhe}</p>
    </div>
  );
}
