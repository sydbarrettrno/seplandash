import type { BaseMetadata, Protocolo, RawProtocolo, Criticidade } from "@/lib/types";

const TERMINAIS = new Set(["ENCERRADO", "ARQUIVADO", "CANCELADO"]);

type MatrixPayload = {
  columns: (keyof RawProtocolo)[];
  rows: unknown[][];
};

function criticidade(dias: number): Criticidade {
  if (dias > 120) return "GRAVÍSSIMO";
  if (dias > 60) return "CRÍTICO";
  if (dias > 30) return "ATRASADO";
  if (dias > 15) return "ATENÇÃO";
  return "RECENTE";
}

function normalizar(raw: RawProtocolo, index: number): Protocolo {
  const dias = Number.isFinite(raw.dias_sem_movimento) ? Number(raw.dias_sem_movimento) : 0;
  const encerradoFormal = Boolean(raw.data_encerramento);
  const situacaoTerminal = TERMINAIS.has((raw.situacao || "").trim().toUpperCase());
  const ativo = !encerradoFormal && !situacaoTerminal;
  const numero = Number((raw.id || "").split("-").pop()) || index + 1;

  return {
    id: raw.id,
    id_protocolo: raw.ano * 100000 + numero,
    protocolo: raw.numero || raw.id,
    ano_abertura: raw.ano,
    tipo_processo: raw.categoria || "Classificação pendente",
    subtipo_processo: raw.status || "",
    situacao: raw.situacao || "",
    data_abertura: raw.data_abertura || "",
    data_ultimo_tramite: raw.data_ultimo_tramite || "",
    data_encerramento: raw.data_encerramento || null,
    dias_sem_movimento: dias,
    criticidade: criticidade(dias),
    status_prazo: dias > 30 ? "ATRASADO" : "NO PRAZO",
    gestao: "GESTÃO ATUAL",
    passivo_herdado: false,
    status_operacional: raw.status || "",
    responsavel: raw.responsavel || "Não identificado",
    prioridade: raw.prioridade || "",
    faixa_inatividade: raw.faixa_inatividade || "",
    inscricao: raw.inscricao || "",
    revisao: Boolean(raw.revisao),
    ativo,
  };
}

function expandir(payload: MatrixPayload): RawProtocolo[] {
  return payload.rows.map(row =>
    Object.fromEntries(payload.columns.map((col, i) => [col, row[i]])) as unknown as RawProtocolo
  );
}

async function carregarArquivo(url: string): Promise<RawProtocolo[]> {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Falha ao carregar ${url}: ${response.status}`);
  const payload = (await response.json()) as MatrixPayload;
  return expandir(payload);
}

export async function carregarProtocolos(): Promise<Protocolo[]> {
  const [a2025, a2026] = await Promise.all([
    carregarArquivo("/generated/protocolos-2025.json"),
    carregarArquivo("/generated/protocolos-2026.json"),
  ]);
  return [...a2025, ...a2026].map(normalizar);
}

export async function carregarMetadata(): Promise<BaseMetadata> {
  const response = await fetch("/generated/metadata.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`Falha ao carregar metadata: ${response.status}`);
  return response.json();
}
