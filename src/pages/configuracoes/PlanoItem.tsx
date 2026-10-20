import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Plano } from "@/types/assinaturas";

interface PlanoItemProps {
  plano: Plano;
  vinculados: number;
  valores: { valor: string; intervalo: string } | undefined;
  salvando: boolean;
  aoMudarValor: (campo: "valor" | "intervalo", valor: string) => void;
  aoSalvar: () => void;
  aoExcluir: () => void;
}

/** Linha de plano ordenável por arrastar (mouse, toque e teclado). */
export function PlanoItem({
  plano,
  vinculados,
  valores,
  salvando,
  aoMudarValor,
  aoSalvar,
  aoExcluir,
}: PlanoItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: plano.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "grid grid-cols-1 items-end gap-3 rounded-lg border border-border/60 bg-background/60 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]",
        isDragging && "relative z-20 border-primary/50 shadow-elegant",
      )}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Arrastar plano ${plano.nome} para reordenar`}
          title="Arraste para reordenar"
          className="mt-0.5 cursor-grab touch-none rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{plano.nome}</p>
          <p className="text-xs text-muted-foreground">
            Vencimento a cada {plano.intervalo_dias} dias · {vinculados}{" "}
            {vinculados === 1 ? "cliente" : "clientes"}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`valor-${plano.id}`}>Valor padrão (£)</Label>
        <Input
          id={`valor-${plano.id}`}
          inputMode="decimal"
          value={valores?.valor ?? ""}
          onChange={(evento) => aoMudarValor("valor", evento.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`intervalo-${plano.id}`}>Intervalo (dias)</Label>
        <Input
          id={`intervalo-${plano.id}`}
          inputMode="numeric"
          value={valores?.intervalo ?? ""}
          onChange={(evento) => aoMudarValor("intervalo", evento.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={aoSalvar} disabled={salvando}>
          <Save className="h-4 w-4" />
          Salvar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Excluir plano"
          aria-label={`Excluir plano ${plano.nome}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={aoExcluir}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
