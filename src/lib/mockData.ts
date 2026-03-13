import type { Protocolo } from "./types";

const TIPOS_PROCESSO: { tipo: string; subtipo: string }[] = [
  { tipo: "Alvará de Construção", subtipo: "Residencial" },
  { tipo: "Alvará de Construção", subtipo: "Comercial" },
  { tipo: "Alvará de Construção", subtipo: "Misto" },
  { tipo: "Alvará de Ampliação", subtipo: "Residencial" },
  { tipo: "Alvará de Ampliação", subtipo: "Comercial" },
  { tipo: "Alvará de Demolição", subtipo: "Total" },
  { tipo: "Alvará de Demolição", subtipo: "Parcial" },
  { tipo: "Alvará de Regularização", subtipo: "Residencial" },
  { tipo: "Alvará de Regularização", subtipo: "Comercial" },
  { tipo: "Desmembramento", subtipo: "Urbano" },
  { tipo: "Desmembramento", subtipo: "Rural" },
  { tipo: "Comércio", subtipo: "Licença de Funcionamento" },
  { tipo: "Comércio", subtipo: "Alvará Sanitário" },
  { tipo: "Certidão", subtipo: "Uso do Solo" },
  { tipo: "Certidão", subtipo: "Conclusão de Obra" },
  { tipo: "Certidão", subtipo: "Numeração" },
];

const SITUACOES: Protocolo["situacao"][] = ["Aberto", "Em Análise", "Pendente", "Encerrado"];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function calcCriticidade(dias: number): Protocolo["criticidade"] {
  if (dias <= 7) return "RECENTE";
  if (dias <= 15) return "ATENÇÃO";
  if (dias <= 30) return "LIMITE SLA";
  if (dias <= 60) return "ATRASADO";
  if (dias <= 120) return "CRÍTICO";
  return "GRAVÍSSIMO";
}

export function calcStatusPrazo(dias: number, sla: number): Protocolo["status_prazo"] {
  return dias <= sla ? "NO PRAZO" : "ATRASADO";
}

export function heatClass(dias: number): string {
  if (dias <= 7) return "heat-low";
  if (dias <= 15) return "heat-attention";
  if (dias <= 30) return "heat-limit";
  if (dias <= 120) return "heat-critical";
  return "heat-grave";
}

export function criticidadeBadgeClass(c: Protocolo["criticidade"]): string {
  switch (c) {
    case "RECENTE": return "bg-status-green/15 text-status-green border-status-green/30";
    case "ATENÇÃO": return "bg-status-yellow/15 text-status-yellow border-status-yellow/30";
    case "LIMITE SLA": return "bg-status-orange/15 text-status-orange border-status-orange/30";
    case "ATRASADO": return "bg-status-yellow/15 text-status-yellow border-status-yellow/30";
    case "CRÍTICO": return "bg-status-orange/15 text-status-orange border-status-orange/30";
    case "GRAVÍSSIMO": return "bg-status-red/20 text-status-red border-status-red/40";
  }
}

export function generateMockData(sla: number, anoGestao: number): Protocolo[] {
  const hoje = new Date();
  const hojeStr = fmt(hoje);
  const protocolos: Protocolo[] = [];
  let id = 1;

  for (let i = 0; i < 480; i++) {
    const ano = 2020 + Math.floor(Math.random() * 6);
    const tp = TIPOS_PROCESSO[Math.floor(Math.random() * TIPOS_PROCESSO.length)];
    const abertura = randomDate(new Date(ano, 0, 1), new Date(ano, 11, 28));
    const isEncerrado = Math.random() < 0.35;
    const situacao: Protocolo["situacao"] = isEncerrado
      ? "Encerrado"
      : SITUACOES.filter(s => s !== "Encerrado")[Math.floor(Math.random() * 3)];

    const ultimoTramite = isEncerrado
      ? randomDate(abertura, new Date(Math.min(abertura.getTime() + 365 * 86400000, hoje.getTime())))
      : randomDate(new Date(Math.max(abertura.getTime(), hoje.getTime() - 400 * 86400000)), hoje);

    const encerramento = isEncerrado
      ? randomDate(ultimoTramite, new Date(Math.min(ultimoTramite.getTime() + 90 * 86400000, hoje.getTime())))
      : null;

    const diasSemMov = isEncerrado ? 0 : diffDays(fmt(ultimoTramite), hojeStr);
    const gestao: Protocolo["gestao"] = ano < anoGestao ? "GESTÃO ANTERIOR" : "GESTÃO ATUAL";
    const passivo = gestao === "GESTÃO ANTERIOR" && !isEncerrado;

    protocolos.push({
      id_protocolo: id++,
      protocolo: `${String(Math.floor(Math.random() * 9000) + 1000)}/${ano}`,
      ano_abertura: ano,
      tipo_processo: tp.tipo,
      subtipo_processo: tp.subtipo,
      situacao,
      data_abertura: fmt(abertura),
      data_ultimo_tramite: fmt(ultimoTramite),
      data_encerramento: encerramento ? fmt(encerramento) : null,
      dias_sem_movimento: Math.max(0, diasSemMov),
      criticidade: calcCriticidade(Math.max(0, diasSemMov)),
      status_prazo: calcStatusPrazo(Math.max(0, diasSemMov), sla),
      gestao,
      passivo_herdado: passivo,
    });
  }

  return protocolos;
}
