export interface Protocolo {
  id_protocolo: number;
  protocolo: string;
  ano_abertura: number;
  tipo_processo: string;
  subtipo_processo: string;
  situacao: "Aberto" | "Em Análise" | "Pendente" | "Encerrado";
  data_abertura: string;
  data_ultimo_tramite: string;
  data_encerramento: string | null;
  dias_sem_movimento: number;
  criticidade: "RECENTE" | "ATENÇÃO" | "LIMITE SLA" | "ATRASADO" | "CRÍTICO" | "GRAVÍSSIMO";
  status_prazo: "NO PRAZO" | "ATRASADO";
  gestao: "GESTÃO ATUAL" | "GESTÃO ANTERIOR";
  passivo_herdado: boolean;
}

export interface AppConfig {
  slaDias: number;
  anoInicioGestao: number;
}
