import { Banknote, Eye, Pencil, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusClienteBadge, StatusCobrancaBadge } from "@/components/status-badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { diasAteVencimento, validadeLabel } from "@/lib/assinaturas";
import { formatarData, formatarMoeda, formatarTelefone } from "@/lib/format";
import type { ClienteComRelacoes } from "@/types/assinaturas";

interface ClientesTabelaProps {
  clientes: ClienteComRelacoes[];
  aoEditar: (cliente: ClienteComRelacoes) => void;
  aoReceber: (cliente: ClienteComRelacoes) => void;
  aoExcluir: (cliente: ClienteComRelacoes) => void;
}

export function ClientesTabela({
  clientes,
  aoEditar,
  aoReceber,
  aoExcluir,
}: ClientesTabelaProps) {
  if (clientes.length === 0) {
    return <EstadoVazio />;
  }

  return (
    <>
      <Card className="card-gradient hidden border-border/70 shadow-card md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1040px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[210px]">Nome completo</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Próximo vencimento</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => {
                  const dias = diasAteVencimento(cliente.proximo_vencimento);
                  return (
                    <TableRow key={cliente.id} className="group">
                      <TableCell>
                        <Link
                          to={`/clientes/${cliente.id}`}
                          className="font-semibold transition-colors hover:text-primary"
                        >
                          {cliente.nome_completo}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Responsável: {cliente.responsavel ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{formatarTelefone(cliente.whatsapp)}</span>
                          {cliente.status === "ativo" ? (
                            <WhatsAppButton nome={cliente.nome_completo} whatsapp={cliente.whatsapp} />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatarData(cliente.data_cadastro)}
                      </TableCell>
                      <TableCell className="text-sm">{cliente.empresas?.nome ?? "—"}</TableCell>
                      <TableCell className="text-sm">{cliente.planos?.nome ?? "—"}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        {formatarMoeda(cliente.valor)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{formatarData(cliente.proximo_vencimento)}</p>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {validadeLabel(dias)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          {cliente.status === "ativo" ? <StatusCobrancaBadge dias={dias} /> : null}
                          <StatusClienteBadge status={cliente.status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title="Ver detalhes">
                            <Link to={`/clientes/${cliente.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar cliente"
                            onClick={() => aoEditar(cliente)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Receber pagamento"
                            onClick={() => aoReceber(cliente)}
                          >
                            <Banknote className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Excluir cliente"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => aoExcluir(cliente)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:hidden">
        {clientes.map((cliente) => {
          const dias = diasAteVencimento(cliente.proximo_vencimento);
          return (
            <Card key={cliente.id} className="card-gradient border-border/70 shadow-card">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/clientes/${cliente.id}`}
                      className="block truncate font-semibold hover:text-primary"
                    >
                      {cliente.nome_completo}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {cliente.empresas?.nome ?? "—"} · {cliente.planos?.nome ?? "—"}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-sm font-bold">
                    {formatarMoeda(cliente.valor)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cliente.status === "ativo" ? <StatusCobrancaBadge dias={dias} /> : null}
                  <StatusClienteBadge status={cliente.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className="font-medium">{formatarData(cliente.proximo_vencimento)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Validade</p>
                    <p className="font-medium uppercase">{validadeLabel(dias)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cadastro</p>
                    <p className="font-medium">{formatarData(cliente.data_cadastro)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{formatarTelefone(cliente.whatsapp)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                  {cliente.status === "ativo" ? (
                    <WhatsAppButton
                      nome={cliente.nome_completo}
                      whatsapp={cliente.whatsapp}
                      mostrarTexto
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Inativo — sem cobrança</span>
                  )}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Editar"
                      onClick={() => aoEditar(cliente)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Receber pagamento"
                      onClick={() => aoReceber(cliente)}
                    >
                      <Banknote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Excluir"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => aoExcluir(cliente)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function EstadoVazio() {
  return (
    <Card className="border-dashed border-border shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Users className="h-5 w-5" />
        </span>
        <p className="font-semibold">Nenhum cliente encontrado</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ajuste a pesquisa e os filtros ou cadastre um novo cliente para começar.
        </p>
      </CardContent>
    </Card>
  );
}
