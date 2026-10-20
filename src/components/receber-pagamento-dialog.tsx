import { Banknote, CalendarClock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useRegistrarPagamento } from "@/hooks/use-clientes";
import { calcularNovoVencimento, hojeISO, intervaloDoPlano } from "@/lib/assinaturas";
import { formatarData, formatarMoeda, paraNumero } from "@/lib/format";
import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL, FORMA_PAGAMENTO_PADRAO } from "@/types/assinaturas";
import type { ClienteComRelacoes, FormaPagamento, PagamentoFormulario } from "@/types/assinaturas";

type ClientePagamento = Pick<
  ClienteComRelacoes,
  "id" | "nome_completo" | "valor" | "proximo_vencimento" | "planos"
>;

interface ReceberPagamentoDialogProps {
  cliente: ClientePagamento | null;
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}

export function ReceberPagamentoDialog({
  cliente,
  aberto,
  aoMudarAberto,
}: ReceberPagamentoDialogProps) {
  const registrar = useRegistrarPagamento();
  const form = useForm<PagamentoFormulario>({
    defaultValues: {
      valor_pago: "",
      data_pagamento: hojeISO(),
      forma_pagamento: FORMA_PAGAMENTO_PADRAO,
      observacao: "",
    },
  });

  useEffect(() => {
    if (!aberto || !cliente) return;
    form.reset({
      valor_pago: String(cliente.valor),
      data_pagamento: hojeISO(),
      forma_pagamento: FORMA_PAGAMENTO_PADRAO,
      observacao: "",
    });
  }, [aberto, cliente, form]);

  if (!cliente) return null;

  const dataPagamento = form.watch("data_pagamento");
  const valorPago = form.watch("valor_pago");
  const intervalo = intervaloDoPlano(cliente.planos);
  const novoVencimento = dataPagamento
    ? calcularNovoVencimento(cliente.proximo_vencimento, dataPagamento, intervalo)
    : cliente.proximo_vencimento;

  const enviar = async (valores: PagamentoFormulario) => {
    if (paraNumero(valores.valor_pago) <= 0) {
      toast.error("Informe um valor recebido maior que zero.");
      return;
    }
    try {
      const resultado = await registrar.mutateAsync({ cliente, dados: valores });
      toast.success("Pagamento registrado.", {
        description: `Próximo vencimento: ${formatarData(resultado.vencimentoNovo)}`,
      });
      aoMudarAberto(false);
    } catch {
      toast.error("Não foi possível registrar o pagamento. Tente novamente.");
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            Receber pagamento
          </DialogTitle>
          <DialogDescription>
            {cliente.nome_completo} · vencimento atual em {formatarData(cliente.proximo_vencimento)}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(enviar)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valor_pago">Valor recebido (£)</Label>
              <Input id="valor_pago" inputMode="decimal" {...form.register("valor_pago")} />
              <p className="text-xs text-muted-foreground">
                Valor da assinatura: {formatarMoeda(cliente.valor)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_pagamento">Data do pagamento</Label>
              <Input id="data_pagamento" type="date" {...form.register("data_pagamento")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <Select
              value={form.watch("forma_pagamento")}
              onValueChange={(valor) =>
                form.setValue("forma_pagamento", valor as FormaPagamento)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGAMENTO.map((forma) => (
                  <SelectItem key={forma} value={forma}>
                    {FORMA_PAGAMENTO_LABEL[forma]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea id="observacao" rows={2} {...form.register("observacao")} />
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <CalendarClock className="h-4 w-4" />
              Novo vencimento: {formatarData(novoVencimento)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Plano {cliente.planos?.nome ?? "—"} · periodicidade de {intervalo} dias · valor recebido{" "}
              {formatarMoeda(paraNumero(valorPago))}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => aoMudarAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="hero" disabled={registrar.isPending}>
              {registrar.isPending ? "Registrando..." : "Confirmar recebimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
