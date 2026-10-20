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

/** "19/10" a partir de uma data ISO (usado em rótulos de eixo). */
export function formatarDiaMes(iso: string): string {
  const [, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}`;
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

/** Exibe o telefone priorizando números do Reino Unido (+44). */
export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) return "—";
  const texto = telefone.trim();
  const digitos = texto.replace(/\D/g, "");
  if (!digitos) return "—";

  if (digitos.startsWith("44")) {
    const nacional = digitos.slice(2).replace(/^0/, "");
    if (nacional.length > 4) {
      return `+44 ${nacional.slice(0, 4)} ${nacional.slice(4)}`;
    }
    return `+44 ${nacional}`;
  }

  // Já possui outro DDI ou foi cadastrado com pontuação: mostra como está.
  return texto;
}

