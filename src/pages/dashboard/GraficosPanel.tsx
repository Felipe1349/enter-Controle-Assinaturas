import { ClientesPorEmpresaChart } from "@/components/charts/clientes-por-empresa-chart";
import { ClientesPorStatusChart } from "@/components/charts/clientes-por-status-chart";
import { ReceitaMensalChart } from "@/components/charts/receita-mensal-chart";
import { SituacaoFinanceiraChart } from "@/components/charts/situacao-financeira-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SituacaoFinanceira } from "@/lib/assinaturas";
import type { StatusCliente } from "@/types/assinaturas";

interface GraficosPanelProps {
  porStatus: { status: StatusCliente; label: string; total: number }[];
  porEmpresa: { empresa: string; total: number }[];
  receitaMensal: { mes: string; rotulo: string; total: number }[];
  porSituacao: { situacao: SituacaoFinanceira; label: string; total: number }[];
}

export function GraficosPanel({
  porStatus,
  porEmpresa,
  receitaMensal,
  porSituacao,
}: GraficosPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Gráficos</h2>
        <p className="text-sm text-muted-foreground">
          Distribuição da base, receita mensal e situação financeira das assinaturas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GraficoCard
          titulo="Clientes por status"
          descricao="Assinaturas ativas e inativas"
        >
          <ClientesPorStatusChart dados={porStatus} />
        </GraficoCard>

        <GraficoCard titulo="Clientes por empresa" descricao="Distribuição por unidade">
          <ClientesPorEmpresaChart dados={porEmpresa} />
        </GraficoCard>

        <GraficoCard
          titulo="Receita mensal"
          descricao="Total recebido nos últimos 12 meses"
          className="lg:col-span-2"
        >
          <ReceitaMensalChart dados={receitaMensal} />
        </GraficoCard>

        <GraficoCard
          titulo="Situação financeira"
          descricao="Em dia, vence hoje, próximos 7 dias e vencidos"
          className="lg:col-span-2"
        >
          <SituacaoFinanceiraChart dados={porSituacao} />
        </GraficoCard>
      </div>
    </section>
  );
}

interface GraficoCardProps {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
  className?: string;
}

function GraficoCard({ titulo, descricao, children, className }: GraficoCardProps) {
  return (
    <Card className={cn("card-gradient border-border/70 shadow-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
