import { AlertTriangle, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagamentos } from "@/hooks/use-pagamentos";
import { registrarPorMes } from "@/lib/pagamentos";
import { formatarData, formatarMoeda } from "@/lib/format";
import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL } from "@/types/assinaturas";

const Pagamentos = () => {
  const { data: pagamentos, isLoading, isError } = usePagamentos();
  const [busca, setBusca] = useState("");
  const [forma, setForma] = useState("todas");
  const [mes, setMes] = useState("todos");

  const meses = useMemo(() => registrarPorMes(pagamentos ?? []), [pagamentos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (pagamentos ?? []).filter((pagamento) => {
      if (forma !== "todas" && pagamento.forma_pagamento !== forma) return false;
      if (mes !== "todos" && pagamento.data_pagamento.slice(0, 7) !== mes) return false;
      if (!termo) return true;
      return (pagamento.clientes?.nome_completo ?? "").toLowerCase().includes(termo);
    });
  }, [pagamentos, busca, forma, mes]);

  const total = filtrados.reduce((soma, pagamento) => soma + Number(pagamento.valor_pago), 0);
  const ticketMedio = filtrados.length > 0 ? total / filtrados.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Histórico de pagamentos"
        descricao="Todos os recebimentos registrados, com forma de pagamento e observações."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ResumoCard rotulo="Pagamentos no filtro" valor={String(filtrados.length)} />
        <ResumoCard rotulo="Total recebido" valor={formatarMoeda(total)} />
        <ResumoCard rotulo="Ticket médio" valor={formatarMoeda(ticketMedio)} />
      </div>

      <Card className="card-gradient border-border/70 shadow-card">
        <CardContent className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-3">
          <Input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Pesquisar por cliente"
          />
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os períodos</SelectItem>
              {meses.map((item) => (
                <SelectItem key={item.valor} value={item.valor}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={forma} onValueChange={setForma}>
            <SelectTrigger>
              <SelectValue placeholder="Forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as formas</SelectItem>
              {FORMAS_PAGAMENTO.map((item) => (
                <SelectItem key={item} value={item}>
                  {FORMA_PAGAMENTO_LABEL[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6 text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Não foi possível carregar os pagamentos.
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, indice) => (
            <Skeleton key={indice} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : (
        <Card className="card-gradient border-border/70 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Receipt className="h-4 w-4 text-primary" />
              Pagamentos registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {filtrados.length === 0 ? (
              <p className="px-6 pb-4 text-sm text-muted-foreground">
                Nenhum pagamento encontrado com os filtros atuais.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data do pagamento</TableHead>
                      <TableHead className="text-right">Valor pago</TableHead>
                      <TableHead>Forma de pagamento</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead className="text-right">Cobrar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtrados.map((pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {pagamento.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/clientes/${pagamento.cliente_id}`}
                            className="text-sm font-semibold hover:text-primary"
                          >
                            {pagamento.clientes?.nome_completo ?? "Cliente removido"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatarData(pagamento.data_pagamento)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {formatarMoeda(pagamento.valor_pago)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {FORMA_PAGAMENTO_LABEL[pagamento.forma_pagamento]}
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                          {pagamento.observacao ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <WhatsAppButton
                              nome={pagamento.clientes?.nome_completo ?? ""}
                              whatsapp={pagamento.clientes?.whatsapp ?? null}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function ResumoCard({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {rotulo}
        </p>
        <p className="mt-1 text-xl font-bold">{valor}</p>
      </CardContent>
    </Card>
  );
}

export default Pagamentos;
