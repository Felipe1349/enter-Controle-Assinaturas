import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const CONFIG = {
  total: { label: "Clientes" },
  LUCAS: { label: "Lucas", color: "hsl(var(--primary))" },
  KALLEU: { label: "Kalleu", color: "hsl(var(--accent))" },
  sem_responsavel: { label: "Sem responsável", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig;

interface ClientesPorResponsavelChartProps {
  dados: { chave: string; label: string; total: number }[];
}

export function ClientesPorResponsavelChart({ dados }: ClientesPorResponsavelChartProps) {
  const total = dados.reduce((soma, item) => soma + item.total, 0);
  const visiveis = dados.filter((item) => item.total > 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full">
        <ChartContainer config={CONFIG} className="mx-auto aspect-square max-h-[220px]">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="label" hideLabel className="min-w-[9rem]" />}
            />
            <Pie
              data={visiveis}
              dataKey="total"
              nameKey="label"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
              strokeWidth={0}
            >
              {visiveis.map((item) => (
                <Cell key={item.chave} fill={`var(--color-${item.chave})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">clientes</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {dados.map((item) => (
          <li key={item.chave} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `var(--color-${item.chave})` }}
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
