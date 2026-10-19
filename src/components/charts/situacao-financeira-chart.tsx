import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { SITUACAO_LABEL, type SituacaoFinanceira } from "@/lib/assinaturas";

const CONFIG = {
  total: { label: "Clientes" },
  em_dia: { label: SITUACAO_LABEL.em_dia, color: "hsl(var(--status-em-dia))" },
  proximos_7: { label: SITUACAO_LABEL.proximos_7, color: "hsl(var(--status-atencao))" },
  vence_hoje: { label: SITUACAO_LABEL.vence_hoje, color: "hsl(var(--status-hoje))" },
  vencidos: { label: SITUACAO_LABEL.vencidos, color: "hsl(var(--status-vencido))" },
} satisfies ChartConfig;

interface SituacaoFinanceiraChartProps {
  dados: { situacao: SituacaoFinanceira; label: string; total: number }[];
}

export function SituacaoFinanceiraChart({ dados }: SituacaoFinanceiraChartProps) {
  const total = dados.reduce((soma, item) => soma + item.total, 0);
  const visiveis = dados.filter((item) => item.total > 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full">
        <ChartContainer config={CONFIG} className="mx-auto aspect-square max-h-[230px]">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="label" hideLabel className="min-w-[9rem]" />}
            />
            <Pie
              data={visiveis.length > 0 ? visiveis : [{ situacao: "em_dia", label: "Sem clientes", total: 1 }]}
              dataKey="total"
              nameKey="label"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
              strokeWidth={0}
            >
              {(visiveis.length > 0 ? visiveis : [{ situacao: "em_dia" as SituacaoFinanceira }]).map(
                (item) => (
                  <Cell key={item.situacao} fill={`var(--color-${item.situacao})`} />
                ),
              )}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">assinaturas ativas</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {dados.map((item) => (
          <li key={item.situacao} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `var(--color-${item.situacao})` }}
              />
              {item.label}
            </span>
            <span className="font-semibold">
              {item.total}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({total > 0 ? Math.round((item.total / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
