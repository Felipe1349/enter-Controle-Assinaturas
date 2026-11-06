import { useState } from "react";

import { ClientesPorEmpresaChart } from "@/components/charts/clientes-por-empresa-chart";
import { ClientesPorResponsavelChart } from "@/components/charts/clientes-por-responsavel-chart";
import { ClientesPorStatusChart } from "@/components/charts/clientes-por-status-chart";
import { ReceitaMensalChart } from "@/components/charts/receita-mensal-chart";
import { ReceitaSemanalChart } from "@/components/charts/receita-semanal-chart";
import { SeletorMoeda } from "@/components/charts/seletor-moeda";
import { SituacaoFinanceiraChart } from "@/components/charts/situacao-financeira-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCotacaoGbpBrl } from "@/hooks/use-configuracoes";
import type { MoedaCodigo } from "@/lib/format";
import { descricaoCotacao } from "@/lib/moeda";
import { cn } from "@/lib/utils";
import type { ReceitaSemanal, SituacaoFinanceira } from "@/lib/assinaturas";
import type { StatusCliente } from "@/types/assinaturas";

interface GraficosPanelProps {
  porStatus: { status: StatusCliente; label: string; total: number }[];
  porEmpresa: { empresa: string; total: number }[];
  porResponsavel: { chave: string; label: string; total: number }[];
  receitaMensal: { mes: string; rotulo: string; total: number }[];
  receitaSemanal: ReceitaSemanal[];
  porSituacao: { situacao: SituacaoFinanceira; label: string; total: number }[];
}

export function GraficosPanel({
  porStatus,
  porEmpresa,
  porResponsavel,
  receitaMensal,
  receitaSemanal,
  porSituacao,
}: GraficosPanelProps) {
  // Moeda só de visualização: os valores gravados continuam em libras.
  const [moeda, setMoeda] = useState<MoedaCodigo>("GBP");
  const cotacao = useCotacaoGbpBrl();
  const notaCotacao = descricaoCotacao(moeda, cotacao);
  const comNota = (texto: string) => (notaCotacao ? `${texto} · ${notaCotacao}` : texto);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Gráficos</h2>
        <p className="text-sm text-muted-foreground">
          Distribuição da base, receita mensal e situação financeira das assinaturas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
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
          titulo="Clientes por responsável"
          descricao="Carteira de Lucas, Kalleo e cadastros sem responsável"
        >
          <ClientesPorResponsavelChart dados={porResponsavel} />
        </GraficoCard>

        <GraficoCard
          titulo="Receita mensal"
          descricao={comNota("Total recebido nos últimos 12 meses")}
          className="lg:col-span-2 xl:col-span-3"
          acoes={<SeletorMoeda valor={moeda} aoMudar={setMoeda} />}
        >
          <ReceitaMensalChart dados={receitaMensal} moeda={moeda} cotacao={cotacao} />
        </GraficoCard>

        <GraficoCard
          titulo="Receita semanal"
          descricao={comNota("Total recebido nas últimas 12 semanas (segunda a domingo)")}
          className="lg:col-span-2 xl:col-span-3"
          acoes={<SeletorMoeda valor={moeda} aoMudar={setMoeda} />}
        >
          <ReceitaSemanalChart dados={receitaSemanal} moeda={moeda} cotacao={cotacao} />
        </GraficoCard>

        <GraficoCard
          titulo="Situação financeira"
          descricao="Em dia, vence hoje, próximos 7 dias e vencidos"
          className="lg:col-span-2 xl:col-span-3"
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
  acoes?: React.ReactNode;
}

function GraficoCard({ titulo, descricao, children, className, acoes }: GraficoCardProps) {
  return (
    <Card className={cn("card-gradient border-border/70 shadow-card", className)}>
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base font-semibold">{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </div>
        {acoes ? <div className="shrink-0 sm:pt-0.5">{acoes}</div> : null}
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
