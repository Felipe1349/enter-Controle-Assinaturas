import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatarMoeda, formatarMoedaCompacta, type MoedaCodigo } from "@/lib/format";
import { converterValor } from "@/lib/moeda";
import type { ReceitaSemanal } from "@/lib/assinaturas";

const CONFIG = {
  total: { label: "Recebido", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

interface ReceitaSemanalChartProps {
  dados: ReceitaSemanal[];
  moeda: MoedaCodigo;
  cotacao: number;
}

export function ReceitaSemanalChart({ dados, moeda, cotacao }: ReceitaSemanalChartProps) {
  const dadosVisiveis = dados.map((item) => ({
    ...item,
    total: converterValor(item.total, moeda, cotacao),
  }));
  const faixas = new Map(dadosVisiveis.map((item) => [item.rotulo, item.faixa]));

  return (
    <ChartContainer config={CONFIG} className="aspect-auto h-[280px] w-full">
      <BarChart data={dadosVisiveis} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="gradiente-receita-semanal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.95} />
            <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(valor: number) => formatarMoedaCompacta(valor, moeda)}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={
            <ChartTooltipContent
              nameKey="rotulo"
              labelFormatter={(valor) => faixas.get(String(valor)) ?? valor}
              formatter={(value) => formatarMoeda(Number(value), moeda)}
            />
          }
        />
        <Bar
          dataKey="total"
          fill="url(#gradiente-receita-semanal)"
          radius={[6, 6, 0, 0]}
          maxBarSize={38}
        />
      </BarChart>
    </ChartContainer>
  );
}
