import { Search, SlidersHorizontal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILTROS_RAPIDOS, type FiltroRapido } from "@/lib/assinaturas";
import { ORDENACOES, type OrdenacaoClientes } from "@/lib/ordenacao-clientes";
import { cn } from "@/lib/utils";
import type { Empresa, Plano } from "@/types/assinaturas";

interface FiltrosClientesProps {
  busca: string;
  aoMudarBusca: (valor: string) => void;
  empresaId: string;
  aoMudarEmpresa: (valor: string) => void;
  status: string;
  aoMudarStatus: (valor: string) => void;
  planoId: string;
  aoMudarPlano: (valor: string) => void;
  filtro: FiltroRapido;
  aoMudarFiltro: (valor: FiltroRapido) => void;
  ordenacao: OrdenacaoClientes;
  aoMudarOrdenacao: (valor: OrdenacaoClientes) => void;
  empresas: Empresa[];
  planos: Plano[];
}

export function FiltrosClientes({
  busca,
  aoMudarBusca,
  empresaId,
  aoMudarEmpresa,
  status,
  aoMudarStatus,
  planoId,
  aoMudarPlano,
  filtro,
  aoMudarFiltro,
  ordenacao,
  aoMudarOrdenacao,
  empresas,
  planos,
}: FiltrosClientesProps) {
  return (
    <Card className="card-gradient border-border/70 shadow-card">
      <CardContent className="space-y-4 p-4 lg:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(evento) => aoMudarBusca(evento.target.value)}
              placeholder="Pesquisar por nome, e-mail ou WhatsApp"
              className="pl-9"
            />
          </div>

          <Select value={empresaId} onValueChange={aoMudarEmpresa}>
            <SelectTrigger>
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select value={status} onValueChange={aoMudarStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planoId} onValueChange={aoMudarPlano}>
              <SelectTrigger>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os planos</SelectItem>
                {planos.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros rápidos
            </span>
            {FILTROS_RAPIDOS.map((item) => (
              <button
                key={item.valor}
                type="button"
                onClick={() => aoMudarFiltro(item.valor)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-smooth",
                  filtro === item.valor
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:w-72">
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ordenar
            </span>
            <Select value={ordenacao} onValueChange={(valor) => aoMudarOrdenacao(valor as OrdenacaoClientes)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDENACOES.map((item) => (
                  <SelectItem key={item.valor} value={item.valor}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
