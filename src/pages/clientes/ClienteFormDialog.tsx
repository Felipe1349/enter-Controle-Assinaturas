import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { useEmpresas } from "@/hooks/use-empresas";
import { useSalvarCliente } from "@/hooks/use-clientes";
import { usePlanos } from "@/hooks/use-planos";
import { adicionarDias, hojeISO } from "@/lib/assinaturas";
import type { ClienteComRelacoes } from "@/types/assinaturas";

const esquema = z.object({
  nome_completo: z.string().trim().min(3, "Informe o nome completo do cliente"),
  email: z
    .string()
    .trim()
    .refine((valor) => valor === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor), "E-mail inválido"),
  whatsapp: z
    .string()
    .trim()
    .refine((valor) => valor === "" || valor.replace(/\D/g, "").length >= 10, "Informe o WhatsApp com DDD"),
  empresa_id: z.string().min(1, "Selecione a empresa"),
  plano_id: z.string().min(1, "Selecione o plano"),
  valor: z
    .string()
    .min(1, "Informe o valor da assinatura")
    .refine((valor) => Number(valor.replace(",", ".")) > 0, "O valor deve ser maior que zero"),
  data_cadastro: z.string().min(10, "Informe a data de cadastro"),
  proximo_vencimento: z.string().min(10, "Informe o próximo vencimento"),
  status: z.enum(["ativo", "inativo"]),
  observacoes: z.string(),
});

type Valores = z.infer<typeof esquema>;

interface ClienteFormDialogProps {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  cliente?: ClienteComRelacoes | null;
}

export function ClienteFormDialog({ aberto, aoMudarAberto, cliente }: ClienteFormDialogProps) {
  const { data: empresas } = useEmpresas();
  const { data: planos } = usePlanos();
  const salvar = useSalvarCliente();
  const [vencimentoManual, setVencimentoManual] = useState(false);

  const form = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nome_completo: "",
      email: "",
      whatsapp: "",
      empresa_id: "",
      plano_id: "",
      valor: "",
      data_cadastro: hojeISO(),
      proximo_vencimento: adicionarDias(hojeISO(), 30),
      status: "ativo",
      observacoes: "",
    },
  });

  const dataCadastro = form.watch("data_cadastro");
  const planoId = form.watch("plano_id");

  useEffect(() => {
    if (!aberto) return;
    setVencimentoManual(Boolean(cliente));
    if (cliente) {
      form.reset({
        nome_completo: cliente.nome_completo,
        email: cliente.email ?? "",
        whatsapp: cliente.whatsapp ?? "",
        empresa_id: cliente.empresa_id ?? "",
        plano_id: cliente.plano_id ?? "",
        valor: String(cliente.valor),
        data_cadastro: cliente.data_cadastro,
        proximo_vencimento: cliente.proximo_vencimento,
        status: cliente.status,
        observacoes: cliente.observacoes ?? "",
      });
      return;
    }
    const hoje = hojeISO();
    const plano = planos?.[0];
    form.reset({
      nome_completo: "",
      email: "",
      whatsapp: "",
      empresa_id: empresas?.[0]?.id ?? "",
      plano_id: plano?.id ?? "",
      valor: plano ? String(plano.valor_padrao) : "",
      data_cadastro: hoje,
      proximo_vencimento: adicionarDias(hoje, plano?.intervalo_dias ?? 30),
      status: "ativo",
      observacoes: "",
    });
  }, [aberto, cliente, empresas, planos, form]);

  // O primeiro vencimento acompanha o plano enquanto o usuário não editar a data manualmente.
  useEffect(() => {
    if (!aberto || vencimentoManual || !dataCadastro) return;
    const plano = planos?.find((item) => item.id === planoId);
    form.setValue("proximo_vencimento", adicionarDias(dataCadastro, plano?.intervalo_dias ?? 30));
  }, [aberto, dataCadastro, planoId, vencimentoManual, planos, form]);

  const aoTrocarPlano = (novoPlanoId: string) => {
    form.setValue("plano_id", novoPlanoId);
    const plano = planos?.find((item) => item.id === novoPlanoId);
    if (plano) {
      form.setValue("valor", String(plano.valor_padrao));
      if (!vencimentoManual && dataCadastro) {
        form.setValue("proximo_vencimento", adicionarDias(dataCadastro, plano.intervalo_dias));
      }
    }
  };

  const enviar = async (valores: Valores) => {
    try {
      await salvar.mutateAsync({ id: cliente?.id, dados: valores });
      toast.success(cliente ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.");
      aoMudarAberto(false);
    } catch {
      toast.error("Não foi possível salvar o cliente. Tente novamente.");
    }
  };

  const erros = form.formState.errors;

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            {cliente
              ? "Atualize os dados cadastrais, o plano e o próximo vencimento."
              : "Cadastre a assinatura definindo empresa, plano, valor e vencimento."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(enviar)}>
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome completo</Label>
            <Input id="nome_completo" {...form.register("nome_completo")} />
            {erros.nome_completo ? (
              <p className="text-xs text-destructive">{erros.nome_completo.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {erros.email ? <p className="text-xs text-destructive">{erros.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" placeholder="(11) 98765-0000" {...form.register("whatsapp")} />
              {erros.whatsapp ? (
                <p className="text-xs text-destructive">{erros.whatsapp.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={form.watch("empresa_id")}
                onValueChange={(valor) => form.setValue("empresa_id", valor, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {(empresas ?? []).map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.empresa_id ? (
                <p className="text-xs text-destructive">{erros.empresa_id.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={form.watch("plano_id")} onValueChange={aoTrocarPlano}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {(planos ?? []).map((plano) => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome} · {plano.intervalo_dias} dias
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.plano_id ? (
                <p className="text-xs text-destructive">{erros.plano_id.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor da assinatura (R$)</Label>
              <Input id="valor" inputMode="decimal" {...form.register("valor")} />
              {erros.valor ? <p className="text-xs text-destructive">{erros.valor.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_cadastro">Data de cadastro</Label>
              <Input id="data_cadastro" type="date" {...form.register("data_cadastro")} />
              {erros.data_cadastro ? (
                <p className="text-xs text-destructive">{erros.data_cadastro.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proximo_vencimento">Próximo vencimento</Label>
              <Input
                id="proximo_vencimento"
                type="date"
                {...form.register("proximo_vencimento", {
                  onChange: () => setVencimentoManual(true),
                })}
              />
              {erros.proximo_vencimento ? (
                <p className="text-xs text-destructive">{erros.proximo_vencimento.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(valor) => form.setValue("status", valor as Valores["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" rows={2} {...form.register("observacoes")} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => aoMudarAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : cliente ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
