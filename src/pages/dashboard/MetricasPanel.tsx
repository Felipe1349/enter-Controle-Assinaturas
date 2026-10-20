import { Banknote, Coins, Percent, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useCotacaoGbpBrl } from "@/hooks/use-configuracoes";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { converterValor, descricaoCotacao } from "@/lib/moeda";
import type { MetricasDashboard } from "@/lib/assinaturas";

interface MetricasPanelProps {
  metricas: MetricasDashboard;
}

export function MetricasPanel({ metricas }: MetricasPanelProps) {
  const cotacao = useCotacaoGbpBrl();
  const totalRecebidoEmReais = converterValor(metricas.totalRecebidoMes, "BRL", cotacao);

  const itens: { rotulo: string; valor: string; detalhe: string; icone: LucideIcon }[] = [
    {
      rotulo: "MRR (Receita Mensal Recorrente)",
      valor: formatarMoeda(metricas.mrr),
      detalhe: "Projeção mensal das assinaturas ativas",
      icone: TrendingUp,
    },
    {
      rotulo: "Total recebido no mês",
      valor: formatarMoeda(metricas.totalRecebidoMes),
      detalhe: "Pagamentos registrados no mês corrente",
      icone: Wallet,
    },
    {
      rotulo: "Total em aberto",
      valor: formatarMoeda(metricas.totalEmAberto),
      detalhe: "Vencidos e a vencer até o fim do mês",
      icone: Coins,
    },
    {
      rotulo: "Ticket médio",
      valor: formatarMoeda(metricas.ticketMedio),
      detalhe: "Média por pagamento no mês corrente",
      icone: PiggyBank,
    },
    {
      rotulo: "Total recebido no mês (R$)",
      valor: formatarMoeda(totalRecebidoEmReais, "BRL"),
      detalhe: descricaoCotacao("BRL", cotacao) ?? "Valores salvos em libras",
      icone: Banknote,
    },
    {
      rotulo: "Taxa de inadimplência",
      valor: formatarPercentual(metricas.taxaInadimplencia),
      detalhe: `${metricas.vencidos} de ${metricas.ativos} clientes ativos vencidos`,
      icone: Percent,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Métricas financeiras</h2>
        <p className="text-sm text-muted-foreground">
          Indicadores calculados automaticamente a partir dos pagamentos registrados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {itens.map((item) => (
          <Card key={item.rotulo} className="card-gradient border-border/70 shadow-card">
            <CardContent className="flex items-start gap-3 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icone className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.rotulo}
                </p>
                <p className="mt-1 text-xl font-bold">{item.valor}</p>
                <p className="text-xs text-muted-foreground">{item.detalhe}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
