const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "GBP",
});

const MOEDA_COMPACTA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "GBP",
  notation: "compact",
  maximumFractionDigits: 1,
});

const DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatarMoeda(valor: number | null | undefined): string {
  return MOEDA.format(Number(valor ?? 0));
}

export function formatarMoedaCompacta(valor: number | null | undefined): string {
  return MOEDA_COMPACTA.format(Number(valor ?? 0));
}

export function formatarPercentual(valor: number): string {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

/** Converte "YYYY-MM-DD" (ou timestamp ISO) em Date no horário local, sem fuso. */
export function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1);
}

/** Converte Date em "YYYY-MM-DD" usando o calendário local. */
export function paraISO(data: Date): string {
  const mes = `${data.getMonth() + 1}`.padStart(2, "0");
  const dia = `${data.getDate()}`.padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "—";
  return DATA.format(paraData(iso));
}



const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const MESES_ABREVIADOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function nomeDoMes(mes: number): string {
  return MESES[mes] ?? "";
}

/** Converte "£ 1.234,56" ou "1234,56" em número. */
export function paraNumero(texto: string | number): number {
  if (typeof texto === "number") return texto;
  const limpo = texto.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const valor = Number.parseFloat(limpo);
  return Number.isNaN(valor) ? 0 : valor;
}

export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) return "—";
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return telefone;
}

