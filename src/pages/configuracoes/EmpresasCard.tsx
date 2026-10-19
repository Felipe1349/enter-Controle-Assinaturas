import { Building2, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmpresas, useExcluirEmpresa, useSalvarEmpresa } from "@/hooks/use-empresas";
import { useClientes } from "@/hooks/use-clientes";
import type { Empresa } from "@/types/assinaturas";

export function EmpresasCard() {
  const { data: empresas, isLoading } = useEmpresas();
  const { data: clientes } = useClientes();
  const salvar = useSalvarEmpresa();
  const excluir = useExcluirEmpresa();

  const [novoNome, setNovoNome] = useState("");
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [paraExcluir, setParaExcluir] = useState<Empresa | null>(null);

  const clientesDaEmpresa = (empresaId: string) =>
    (clientes ?? []).filter((cliente) => cliente.empresa_id === empresaId).length;

  const criar = async () => {
    const nome = novoNome.trim();
    if (nome.length < 2) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    try {
      await salvar.mutateAsync({ nome });
      setNovoNome("");
      toast.success("Empresa cadastrada.");
    } catch {
      toast.error("Não foi possível cadastrar a empresa.");
    }
  };

  const renomear = async () => {
    if (!editando) return;
    const nome = nomeEdicao.trim();
    if (nome.length < 2) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    try {
      await salvar.mutateAsync({ id: editando.id, nome });
      setEditando(null);
      toast.success("Empresa atualizada.");
    } catch {
      toast.error("Não foi possível atualizar a empresa.");
    }
  };

  const confirmarExclusao = async () => {
    if (!paraExcluir) return;
    try {
      await excluir.mutateAsync(paraExcluir.id);
      toast.success("Empresa excluída.");
      setParaExcluir(null);
    } catch {
      toast.error("Não foi possível excluir a empresa.");
    }
  };

  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Building2 className="h-4 w-4 text-primary" />
          Empresas
        </CardTitle>
        <CardDescription>
          Unidades usadas no cadastro de clientes e nos gráficos do dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={novoNome}
            onChange={(evento) => setNovoNome(evento.target.value)}
            placeholder="Nome da nova empresa"
          />
          <Button type="button" onClick={criar} disabled={salvar.isPending} className="sm:w-auto">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-28 rounded-xl" />
        ) : (
          <ul className="space-y-2">
            {(empresas ?? []).map((empresa) => {
              const total = clientesDaEmpresa(empresa.id);
              const emEdicao = editando?.id === empresa.id;
              return (
                <li
                  key={empresa.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                >
                  {emEdicao ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={nomeEdicao}
                        onChange={(evento) => setNomeEdicao(evento.target.value)}
                        className="max-w-xs"
                      />
                      <Button size="icon" variant="ghost" onClick={renomear} title="Salvar">
                        <Check className="h-4 w-4 text-status-em-dia" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditando(null)}
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{empresa.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {total} {total === 1 ? "cliente vinculado" : "clientes vinculados"}
                      </p>
                    </div>
                  )}

                  {!emEdicao ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Renomear"
                        onClick={() => {
                          setEditando(empresa);
                          setNomeEdicao(empresa.nome);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Excluir"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setParaExcluir(empresa)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <AlertDialog open={Boolean(paraExcluir)} onOpenChange={() => setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a empresa {paraExcluir?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              {paraExcluir && clientesDaEmpresa(paraExcluir.id) > 0
                ? `${clientesDaEmpresa(paraExcluir.id)} cliente(s) ficarão sem empresa vinculada. Os cadastros e pagamentos continuam salvos.`
                : "Nenhum cliente está vinculado a esta empresa."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir empresa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
