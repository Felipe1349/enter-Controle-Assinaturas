import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const CONFIG = {
  total: { label: "Clientes", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

interface ClientesPorEmpresaChartProps {
  dados: { empresa: string; total: number }[];
}

export function ClientesPorEmpresaChart({ dados }: ClientesPorEmpresaChartProps) {
  return (
    <ChartContainer config={CONFIG} className="aspect-auto h-[240px] w-full">
      <BarChart data={dados} layout="vertical" margin={{ left: 4, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="empresa"
          tickLine={false}
          axisLine={false}
          width={104}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={<ChartTooltipContent nameKey="empresa" />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={[0, 8, 8, 0]} barSize={22} />
      </BarChart>
    </ChartContainer>
  );
}
