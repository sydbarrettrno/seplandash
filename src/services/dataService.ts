import type { BaseMetadata, Protocolo, RawProtocolo, Criticidade } from "@/lib/types";

const TERMINAIS = new Set(["ENCERRADO", "ARQUIVADO", "CANCELADO"]);
type MatrixPayload = { columns: (keyof RawProtocolo)[]; rows: unknown[][] };

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
    id: raw.id, id_protocolo: raw.ano * 100000 + numero, protocolo: raw.numero || raw.id,
    ano_abertura: raw.ano, tipo_processo: raw.categoria || "Classificação pendente", subtipo_processo: raw.status || "",
    situacao: raw.situacao || "", data_abertura: raw.data_abertura || "", data_ultimo_tramite: raw.data_ultimo_tramite || "",
    data_encerramento: raw.data_encerramento || null, dias_sem_movimento: dias, criticidade: criticidade(dias),
    status_prazo: dias > 30 ? "ATRASADO" : "NO PRAZO", gestao: "GESTÃO ATUAL", passivo_herdado: false,
    status_operacional: raw.status || "", responsavel: raw.responsavel || "Não identificado", prioridade: raw.prioridade || "",
    faixa_inatividade: raw.faixa_inatividade || "", inscricao: raw.inscricao || "", revisao: Boolean(raw.revisao), ativo,
  };
}

function expandir(payload: MatrixPayload): RawProtocolo[] {
  return payload.rows.map(row => Object.fromEntries(payload.columns.map((col, i) => [col, row[i]])) as unknown as RawProtocolo);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gunzipBase64(base64: string): Promise<string> {
  const stream = new Blob([base64ToBytes(base64)]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

async function carregarAno(ano: 2025 | 2026, partes: number): Promise<RawProtocolo[]> {
  const respostas = await Promise.all(Array.from({ length: partes }, (_, i) => fetch(`/generated/protocolos-${ano}.part${i + 1}.b64`, { cache: "no-cache" })));
  if (respostas.some(r => !r.ok)) throw new Error(`Falha ao carregar dados de ${ano}`);
  const textos = await Promise.all(respostas.map(r => r.text()));
  return expandir(JSON.parse(await gunzipBase64(textos.join(""))) as MatrixPayload);
}

export async function carregarProtocolos(): Promise<Protocolo[]> {
  const [a2025, a2026] = await Promise.all([carregarAno(2025, 3), carregarAno(2026, 2)]);
  return [...a2025, ...a2026].map(normalizar);
}

export async function carregarMetadata(): Promise<BaseMetadata> {
  const response = await fetch("/generated/metadata.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`Falha ao carregar metadata: ${response.status}`);
  return response.json();
}
