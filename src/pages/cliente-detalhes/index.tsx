import { AlertTriangle, ArrowLeft, Banknote, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { ReceberPagamentoDialog } from "@/components/receber-pagamento-dialog";
import { StatusClienteBadge, StatusCobrancaBadge } from "@/components/status-badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCliente } from "@/hooks/use-clientes";
import { usePagamentosDoCliente } from "@/hooks/use-pagamentos";
import { diasAteVencimento, validadeLabel } from "@/lib/assinaturas";

import { ClienteFormDialog } from "../clientes/ClienteFormDialog";
import { DadosCadastraisCard } from "./DadosCadastraisCard";
import { HistoricoPagamentos } from "./HistoricoPagamentos";
import { InformacoesFinanceirasCard } from "./InformacoesFinanceirasCard";
import { LinhaTempo } from "./LinhaTempo";

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { data: cliente, isLoading, isError } = useCliente(id);
  const { data: pagamentos } = usePagamentosDoCliente(id);

  const [formAberto, setFormAberto] = useState(false);
  const [pagamentoAberto, setPagamentoAberto] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (isError || !cliente) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-6 text-sm">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Cliente não encontrado. Volte para a listagem e selecione outro registro.
        </CardContent>
      </Card>
    );
  }

  const dias = diasAteVencimento(cliente.proximo_vencimento);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit text-muted-foreground">
        <Link to="/clientes">
          <ArrowLeft className="h-4 w-4" />
          Voltar para clientes
        </Link>
      </Button>

      <PageHeader
        titulo={cliente.nome_completo}
        descricao={`${cliente.empresas?.nome ?? "Sem empresa"} · plano ${
          cliente.planos?.nome ?? "—"
        } · ${validadeLabel(dias)}`}
        acoes={
          <>
            <WhatsAppButton
              nome={cliente.nome_completo}
              whatsapp={cliente.whatsapp}
              mostrarTexto
              size="sm"
            />
            <Button variant="hero" size="sm" onClick={() => setPagamentoAberto(true)}>
              <Banknote className="h-4 w-4" />
              Receber pagamento
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFormAberto(true)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusCobrancaBadge dias={dias} />
        <StatusClienteBadge status={cliente.status} />
      </div>

      <DadosCadastraisCard cliente={cliente} />
      <InformacoesFinanceirasCard cliente={cliente} pagamentos={pagamentos ?? []} />
      <HistoricoPagamentos pagamentos={pagamentos ?? []} />
      <LinhaTempo cliente={cliente} pagamentos={pagamentos ?? []} />

      <ClienteFormDialog aberto={formAberto} aoMudarAberto={setFormAberto} cliente={cliente} />
      <ReceberPagamentoDialog
        cliente={cliente}
        aberto={pagamentoAberto}
        aoMudarAberto={setPagamentoAberto}
      />
    </div>
  );
};

export default ClienteDetalhes;
