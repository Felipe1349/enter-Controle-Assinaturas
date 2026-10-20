import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MoedaCodigo } from "@/lib/format";
import { MOEDAS_VISUALIZACAO } from "@/lib/moeda";
import { cn } from "@/lib/utils";

interface SeletorMoedaProps {
  valor: MoedaCodigo;
  aoMudar: (moeda: MoedaCodigo) => void;
  className?: string;
}

/** Alterna a moeda exibida nos gráficos de receita (apenas visualização). */
export function SeletorMoeda({ valor, aoMudar, className }: SeletorMoedaProps) {
  return (
    <Select value={valor} onValueChange={(novo) => aoMudar(novo as MoedaCodigo)}>
      <SelectTrigger
        aria-label="Moeda de visualização"
        className={cn("h-8 w-[200px] text-xs", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-[60]">
        {MOEDAS_VISUALIZACAO.map((moeda) => (
          <SelectItem key={moeda.valor} value={moeda.valor} className="text-xs">
            {moeda.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
