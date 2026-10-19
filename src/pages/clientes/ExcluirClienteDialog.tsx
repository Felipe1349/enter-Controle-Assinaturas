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
import { useExcluirCliente } from "@/hooks/use-clientes";
import type { ClienteComRelacoes } from "@/types/assinaturas";

interface ExcluirClienteDialogProps {
  cliente: ClienteComRelacoes | null;
  aoMudarAberto: (aberto: boolean) => void;
}

export function ExcluirClienteDialog({ cliente, aoMudarAberto }: ExcluirClienteDialogProps) {
  const excluir = useExcluirCliente();

  const confirmar = async () => {
    if (!cliente) return;
    try {
      await excluir.mutateAsync(cliente.id);
      toast.success("Cliente excluído.", {
        description: "Os pagamentos vinculados também foram removidos do histórico.",
      });
      aoMudarAberto(false);
    } catch {
      toast.error("Não foi possível excluir o cliente. Tente novamente.");
    }
  };

  return (
    <AlertDialog open={Boolean(cliente)} onOpenChange={aoMudarAberto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {cliente?.nome_completo}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação remove o cliente e todo o histórico de pagamentos vinculado a ele. Não é
            possível desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmar}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {excluir.isPending ? "Excluindo..." : "Excluir cliente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
