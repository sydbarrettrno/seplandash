import type { Protocolo } from "@/lib/types";

export type Periodo = 2025 | 2026 | "all";

function anoDaData(value?: string | null) {
  if (!value) return null;
  const m = String(value).match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}

function diasEntre(inicio?: string | null, fim?: string | null) {
  if (!inicio || !fim) return null;
  const a = new Date(inicio);
  const b = new Date(fim);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export function mediana(values: number[]) {
  if (!values.length) return 0;
  const arr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

export function percentil90(values: number[]) {
  if (!values.length) return 0;
  const arr = [...values].sort((a, b) => a - b);
  return arr[Math.min(arr.length - 1, Math.ceil(arr.length * 0.9) - 1)];
}

function noPeriodo(value: string | null, periodo: Periodo) {
  if (periodo === "all") return Boolean(value);
  return anoDaData(value) === periodo;
}

export function calcularStats(data: Protocolo[], periodo: Periodo, limiar: number) {
  const recebidos = data.filter(p => noPeriodo(p.data_abertura, periodo));
  const concluidos = data.filter(p => noPeriodo(p.data_encerramento, periodo));
  const ativos = data.filter(p => p.ativo);
  const parados = ativos.filter(p => p.dias_sem_movimento > limiar);
  const tempos = concluidos
    .map(p => diasEntre(p.data_abertura, p.data_encerramento))
    .filter((v): v is number => v !== null);

  return {
    recebidos,
    concluidos,
    ativos,
    parados,
    tempoMediano: mediana(tempos),
    tempoMedio: tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0,
    p90: percentil90(tempos),
    saldo: recebidos.length - concluidos.length,
    percentualParados: ativos.length ? (parados.length / ativos.length) * 100 : 0,
  };
}

export function serieMensal(data: Protocolo[], periodo: Periodo) {
  const map = new Map<string, { mes: string; recebidos: number; concluidos: number }>();

  const add = (dateValue: string | null, campo: "recebidos" | "concluidos") => {
    if (!dateValue) return;
    const ano = anoDaData(dateValue);
    if (periodo !== "all" && ano !== periodo) return;
    const key = dateValue.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) return;
    if (!map.has(key)) map.set(key, { mes: key, recebidos: 0, concluidos: 0 });
    map.get(key)![campo]++;
  };

  data.forEach(p => {
    add(p.data_abertura, "recebidos");
    add(p.data_encerramento, "concluidos");
  });

  return [...map.values()]
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .map(v => ({ ...v, saldo: v.recebidos - v.concluidos }));
}

export function faixasAging(ativos: Protocolo[]) {
  const faixas = [
    { faixa: "0–15", count: 0 },
    { faixa: "16–30", count: 0 },
    { faixa: "31–60", count: 0 },
    { faixa: "61–90", count: 0 },
    { faixa: "91–120", count: 0 },
    { faixa: ">120", count: 0 },
  ];
  ativos.forEach(p => {
    const d = p.dias_sem_movimento;
    if (d <= 15) faixas[0].count++;
    else if (d <= 30) faixas[1].count++;
    else if (d <= 60) faixas[2].count++;
    else if (d <= 90) faixas[3].count++;
    else if (d <= 120) faixas[4].count++;
    else faixas[5].count++;
  });
  return faixas;
}

export function agrupar(ativos: Protocolo[], campo: "status_operacional" | "tipo_processo") {
  const map = new Map<string, number>();
  ativos.forEach(p => {
    const key = p[campo] || "Não identificado";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()]
    .map(([nome, count]) => ({ nome, count }))
    .sort((a, b) => b.count - a.count);
}

export function gargalos(ativos: Protocolo[]) {
  const map = new Map<string, Protocolo[]>();
  ativos.forEach(p => {
    const key = p.responsavel || "Não identificado";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  });
  return [...map.entries()]
    .map(([responsavel, rows]) => ({
      responsavel,
      estoque: rows.length,
      d30: rows.filter(p => p.dias_sem_movimento > 30).length,
      d60: rows.filter(p => p.dias_sem_movimento > 60).length,
      mediana: Math.round(mediana(rows.map(p => p.dias_sem_movimento))),
    }))
    .sort((a, b) => b.estoque - a.estoque);
}
