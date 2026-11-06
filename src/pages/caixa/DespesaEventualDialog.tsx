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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtualizarLancamento, useCriarLancamento } from "@/hooks/use-caixa";
import { hojeISO } from "@/lib/assinaturas";
import { competenciaDe } from "@/lib/caixa";
import { paraNumero } from "@/lib/format";
import { CATEGORIAS_DESPESA } from "@/types/caixa";
import type { DespesaLancamento } from "@/types/caixa";

interface DespesaEventualDialogProps {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  despesa?: DespesaLancamento | null;
  competencia: string;
}

export function DespesaEventualDialog({
  aberto,
  aoMudarAberto,
  despesa,
  competencia,
}: DespesaEventualDialogProps) {
  const criar = useCriarLancamento();
  const atualizar = useAtualizarLancamento();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Outros");
  const [data, setData] = useState(hojeISO());

  useEffect(() => {
    if (!aberto) return;
    setDescricao(despesa?.descricao ?? "");
    setValor(despesa ? String(despesa.valor) : "");
    setCategoria(despesa?.categoria ?? "Outros");
    setData(despesa?.data_vencimento ?? hojeISO());
  }, [aberto, despesa]);

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const valorNumero = paraNumero(valor);

    if (descricao.trim().length < 2) {
      toast.error("Informe a descrição da despesa.");
      return;
    }
    if (valorNumero <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }
    if (!data) {
      toast.error("Informe a data da despesa.");
      return;
    }

    try {
      if (despesa) {
        await atualizar.mutateAsync({
          id: despesa.id,
          dados: {
            descricao: descricao.trim(),
            valor: valorNumero,
            categoria,
            data_vencimento: data,
          },
        });
        toast.success("Despesa atualizada.");
      } else {
        await criar.mutateAsync({
          descricao: descricao.trim(),
          valor: valorNumero,
          categoria,
          data_vencimento: data,
          competencia: competencia || competenciaDe(data),
        });
        toast.success("Despesa lançada.");
      }
      aoMudarAberto(false);
    } catch {
      toast.error("Não foi possível salvar a despesa.");
    }
  };

  const salvando = criar.isPending || atualizar.isPending;

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          <DialogDescription>Despesa eventual, lançada uma única vez.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={enviar}>
          <div className="space-y-2">
            <Label htmlFor="eventual-descricao">Descrição</Label>
            <Input
              id="eventual-descricao"
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              placeholder="Ex.: Compra de material"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventual-valor">Valor (R$)</Label>
              <Input
                id="eventual-valor"
                inputMode="decimal"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_DESPESA.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 sm:w-56">
            <Label htmlFor="eventual-data">Data da despesa</Label>
            <Input
              id="eventual-data"
              type="date"
              value={data}
              onChange={(evento) => setData(evento.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => aoMudarAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : despesa ? "Salvar" : "Lançar despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
