import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StatusCliente } from "@/types/assinaturas";

const CONFIG = {
  total: { label: "Clientes" },
  ativo: { label: "Ativo", color: "hsl(var(--status-em-dia))" },
  inativo: { label: "Inativo", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig;

const ORDEM: StatusCliente[] = ["ativo", "inativo"];

interface ClientesPorStatusChartProps {
  dados: { status: StatusCliente; label: string; total: number }[];
}

export function ClientesPorStatusChart({ dados }: ClientesPorStatusChartProps) {
  const total = dados.reduce((soma, item) => soma + item.total, 0);
  const ordenados = [...dados].sort(
    (a, b) => ORDEM.indexOf(a.status) - ORDEM.indexOf(b.status),
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full">
        <ChartContainer config={CONFIG} className="mx-auto aspect-square max-h-[220px]">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="label" hideLabel className="min-w-[9rem]" />}
            />
            <Pie
              data={ordenados}
              dataKey="total"
              nameKey="label"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
              strokeWidth={0}
            >
              {ordenados.map((item) => (
                <Cell key={item.status} fill={`var(--color-${item.status})`} />
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
        {ordenados.map((item) => (
          <li key={item.status} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `var(--color-${item.status})` }}
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
