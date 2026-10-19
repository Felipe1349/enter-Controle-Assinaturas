import { Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarData, formatarMoeda } from "@/lib/format";
import { FORMA_PAGAMENTO_LABEL } from "@/types/assinaturas";
import type { Pagamento } from "@/types/assinaturas";

interface HistoricoPagamentosProps {
  pagamentos: Pagamento[];
}

export function HistoricoPagamentos({ pagamentos }: HistoricoPagamentosProps) {
  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Receipt className="h-4 w-4 text-primary" />
          Histórico de pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {pagamentos.length === 0 ? (
          <p className="px-6 pb-4 text-sm text-muted-foreground">
            Nenhum pagamento registrado para este cliente.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ID</TableHead>
                  <TableHead>Data do pagamento</TableHead>
                  <TableHead className="text-right">Valor pago</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {pagamento.id.slice(0, 8)}
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
                    <TableCell className="text-xs text-muted-foreground">
                      {pagamento.vencimento_anterior
                        ? `${formatarData(pagamento.vencimento_anterior)} → ${formatarData(
                            pagamento.vencimento_novo,
                          )}`
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {pagamento.observacao ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
