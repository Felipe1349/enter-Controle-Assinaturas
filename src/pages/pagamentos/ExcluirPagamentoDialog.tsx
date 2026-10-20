import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useExcluirPagamento } from "@/hooks/use-pagamentos";
import { formatarData, formatarMoeda } from "@/lib/format";
import { FORMA_PAGAMENTO_LABEL } from "@/types/assinaturas";
import type { PagamentoComCliente } from "@/types/assinaturas";

interface ExcluirPagamentoDialogProps {
  pagamento: PagamentoComCliente | null;
  aoMudarAberto: (aberto: boolean) => void;
}

export function ExcluirPagamentoDialog({ pagamento, aoMudarAberto }: ExcluirPagamentoDialogProps) {
  const excluir = useExcluirPagamento();

  const confirmar = async () => {
    if (!pagamento) return;
    try {
      const resultado = await excluir.mutateAsync(pagamento);
      toast.success("Pagamento excluído.", {
        description: resultado.vencimentoRevertidoPara
          ? `Próximo vencimento do cliente voltou para ${formatarData(resultado.vencimentoRevertidoPara)}.`
          : "O próximo vencimento do cliente não foi alterado.",
      });
      aoMudarAberto(false);
    } catch {
      toast.error("Não foi possível excluir o pagamento. Tente novamente.");
    }
  };

  return (
    <AlertDialog open={Boolean(pagamento)} onOpenChange={aoMudarAberto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir o pagamento de {pagamento ? formatarMoeda(pagamento.valor_pago) : ""}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pagamento
              ? `${pagamento.clientes?.nome_completo ?? "Cliente removido"} · ${formatarData(
                  pagamento.data_pagamento,
                )} · ${FORMA_PAGAMENTO_LABEL[pagamento.forma_pagamento]}. `
              : ""}
            Use esta ação apenas para registros lançados por engano (por exemplo, cobranças
            duplicadas). Se este for o pagamento mais recente do cliente, o próximo vencimento
            volta para a data anterior. A exclusão não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmar}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {excluir.isPending ? "Excluindo..." : "Excluir pagamento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
