export type Criticidade =
  | "RECENTE"
  | "ATENÇÃO"
  | "ATRASADO"
  | "CRÍTICO"
  | "GRAVÍSSIMO";

export interface Protocolo {
  id: string;
  id_protocolo: number;
  protocolo: string;
  ano_abertura: number;
  tipo_processo: string;
  subtipo_processo: string;
  situacao: string;
  data_abertura: string;
  data_ultimo_tramite: string;
  data_encerramento: string | null;
  dias_sem_movimento: number;
  criticidade: Criticidade;
  status_prazo: "NO PRAZO" | "ATRASADO";
  gestao: "GESTÃO ATUAL";
  passivo_herdado: false;
  status_operacional: string;
  responsavel: string;
  prioridade: string;
  faixa_inatividade: string;
  inscricao: string;
  revisao: boolean;
  ativo: boolean;
}

export interface RawProtocolo {
  id: string;
  numero: string;
  ano: number;
  data_abertura: string;
  data_ultimo_tramite: string;
  data_encerramento: string;
  situacao: string;
  categoria: string;
  status: string;
  responsavel: string;
  prioridade: string;
  dias_sem_movimento: number | null;
  faixa_inatividade: string;
  inscricao: string;
  revisao: boolean;
}

export interface BaseMetadata {
  versao_base: string;
  arquivo_origem: string;
  data_referencia: string;
  total_registros: number;
  total_protocolos_unicos: number;
  anos: Record<string, number>;
  gerado_em: string;
}

export interface AppConfig {
  slaDias: number;
  anoInicioGestao: number;
}
