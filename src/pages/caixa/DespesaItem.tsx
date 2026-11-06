import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAtualizarLancamento } from "@/hooks/use-caixa";
import { hojeISO } from "@/lib/assinaturas";
import { formatarData, formatarMoeda } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DespesaLancamento } from "@/types/caixa";

interface DespesaItemProps {
  despesa: DespesaLancamento;
  aoEditar: (despesa: DespesaLancamento) => void;
  aoExcluir: (despesa: DespesaLancamento) => void;
}

export function DespesaItem({ despesa, aoEditar, aoExcluir }: DespesaItemProps) {
  const atualizar = useAtualizarLancamento();
  const paga = despesa.status === "pago";

  const alternarStatus = async () => {
    try {
      await atualizar.mutateAsync({
        id: despesa.id,
        dados: {
          status: paga ? "pendente" : "pago",
          pago_em: paga ? null : hojeISO(),
        },
      });
      toast.success(paga ? "Despesa marcada como pendente." : "Despesa marcada como paga.");
    } catch {
      toast.error("Não foi possível atualizar a despesa.");
    }
  };

  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
        paga
          ? "border-status-em-dia/30 bg-status-em-dia/8"
          : "border-status-hoje/30 bg-status-hoje/8",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{despesa.descricao}</p>
        <p className="text-xs text-muted-foreground">
          {formatarData(despesa.data_vencimento)}
          {despesa.categoria ? ` · ${despesa.categoria}` : ""}
          {despesa.fixa_id ? " · fixa" : ""}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">{formatarMoeda(despesa.valor, "BRL")}</span>
        <Badge
          variant="outline"
          className={
            paga
              ? "border-status-em-dia/30 bg-status-em-dia/10 text-status-em-dia"
              : "border-status-hoje/30 bg-status-hoje/10 text-status-hoje"
          }
        >
          {paga ? "Pago" : "Pendente"}
        </Badge>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={alternarStatus}
          disabled={atualizar.isPending}
        >
          {paga ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {paga ? "Reabrir" : "Pagar"}
        </Button>
        {!despesa.fixa_id ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Editar despesa"
            onClick={() => aoEditar(despesa)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Excluir despesa"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => aoExcluir(despesa)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
