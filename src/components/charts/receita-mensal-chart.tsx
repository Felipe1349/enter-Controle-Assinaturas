import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatarMoeda, formatarMoedaCompacta } from "@/lib/format";

const CONFIG = {
  total: { label: "Recebido", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

interface ReceitaMensalChartProps {
  dados: { mes: string; rotulo: string; total: number }[];
}

export function ReceitaMensalChart({ dados }: ReceitaMensalChartProps) {
  return (
    <ChartContainer config={CONFIG} className="aspect-auto h-[280px] w-full">
      <BarChart data={dados} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="gradiente-receita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          tickFormatter={(valor: number) => formatarMoedaCompacta(valor)}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={
            <ChartTooltipContent
              nameKey="rotulo"
              formatter={(value) => formatarMoeda(Number(value))}
            />
          }
        />
        <Bar dataKey="total" fill="url(#gradiente-receita)" radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ChartContainer>
  );
}
