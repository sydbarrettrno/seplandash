export interface Protocolo {
  id_protocolo: number;
  numero_protocolo: string;
  ano_protocolo: number;
  tipo_processo: string;
  tipo_macro: string;
  situacao: "Aberto" | "Em Análise" | "Pendente" | "Encerrado";
  data_abertura: string;
  data_ultimo_tramite: string;
  data_encerramento: string | null;
  dias_sem_movimento: number;
  dias_desde_abertura: number;
  status_prazo: "NO PRAZO" | "ATRASADO";
  criticidade_prazo: "RECENTE" | "ATENÇÃO" | "LIMITE SLA" | "ATRASADO" | "CRÍTICO" | "GRAVÍSSIMO";
  gestao: "GESTÃO ATUAL" | "GESTÃO ANTERIOR";
  passivo_herdado: boolean;
}

export interface AppConfig {
  slaDias: number;
  anoInicioGestao: number;
}
