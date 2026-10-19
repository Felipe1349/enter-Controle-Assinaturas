export type OrdenacaoClientes =
  | "vencimento_asc"
  | "vencimento_desc"
  | "nome"
  | "valor_desc"
  | "cadastro_desc";

export const ORDENACOES: { valor: OrdenacaoClientes; label: string }[] = [
  { valor: "vencimento_asc", label: "Vencimento (mais próximo)" },
  { valor: "vencimento_desc", label: "Vencimento (mais distante)" },
  { valor: "nome", label: "Nome (A-Z)" },
  { valor: "valor_desc", label: "Maior valor" },
  { valor: "cadastro_desc", label: "Cadastro mais recente" },
];
