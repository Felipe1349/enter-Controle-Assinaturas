import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCriarDespesaFixa } from "@/hooks/use-caixa";
import { paraNumero } from "@/lib/format";

interface DespesaFixaDialogProps {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}

export function DespesaFixaDialog({ aberto, aoMudarAberto }: DespesaFixaDialogProps) {
  const criar = useCriarDespesaFixa();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dia, setDia] = useState("");

  useEffect(() => {
    if (!aberto) return;
    setDescricao("");
    setValor("");
    setDia("");
  }, [aberto]);

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const valorNumero = paraNumero(valor);
    const diaNumero = Number(dia);

    if (descricao.trim().length < 2) {
      toast.error("Informe a descrição da despesa.");
      return;
    }
    if (valorNumero <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }
    if (!Number.isInteger(diaNumero) || diaNumero < 1 || diaNumero > 31) {
      toast.error("O dia do vencimento deve ser entre 1 e 31.");
      return;
    }

    try {
      await criar.mutateAsync({
        descricao: descricao.trim(),
        valor: valorNumero,
        dia_vencimento: diaNumero,
      });
      toast.success("Despesa fixa cadastrada.", {
        description: "O lançamento do mês é gerado automaticamente.",
      });
      aoMudarAberto(false);
    } catch {
      toast.error("Não foi possível cadastrar a despesa fixa.");
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova despesa fixa</DialogTitle>
          <DialogDescription>
            Repetida todo mês automaticamente, sem duplicar lançamentos.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={enviar}>
          <div className="space-y-2">
            <Label htmlFor="fixa-descricao">Descrição</Label>
            <Input
              id="fixa-descricao"
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              placeholder="Ex.: Aluguel"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fixa-valor">Valor (R$)</Label>
              <Input
                id="fixa-valor"
                inputMode="decimal"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
                placeholder="Ex.: 1500,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixa-dia">Dia do vencimento</Label>
              <Input
                id="fixa-dia"
                inputMode="numeric"
                value={dia}
                onChange={(evento) => setDia(evento.target.value)}
                placeholder="Ex.: 5"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => aoMudarAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
