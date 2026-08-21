import { useMemo, useState } from "react";
import { useMetadata, useProtocolosQuery } from "@/hooks/useProtocolos";
import type { Protocolo } from "@/lib/types";
import { agrupar, calcularStats, faixasAging, gargalos, serieMensal, type Periodo } from "@/lib/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Inbox, CheckCircle2, Layers3, Clock3, AlertTriangle, RefreshCw, ArrowDownRight, ArrowUpRight, Database } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from "recharts";

const PAGE_SIZE = 50;

function formatarMes(valor: string) {
  const [ano, mes] = valor.split("-");
  return `${mes}/${ano.slice(2)}`;
}

function formatarData(valor?: string | null) {
  if (!valor) return "—";
  const date = new Date(valor);
  if (Number.isNaN(date.getTime())) return valor;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function KpiCard({ titulo, valor, apoio, icon: Icon, tom = "normal", onClick }: { titulo: string; valor: string | number; apoio: string; icon: typeof Inbox; tom?: "normal" | "positivo" | "atencao"; onClick: () => void; }) {
  const accent = tom === "positivo" ? "border-l-emerald-500" : tom === "atencao" ? "border-l-amber-500" : "border-l-sky-600";
  return (
    <Card onClick={onClick} className={`cursor-pointer border-l-4 ${accent} transition hover:-translate-y-0.5 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-3xl font-bold tracking-tight">{valor}</p>
        <p className="mt-1 text-xs text-muted-foreground">{apoio}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const protocolosQuery = useProtocolosQuery();
  const metadataQuery = useMetadata();
  const data = protocolosQuery.data ?? [];
  const [periodo, setPeriodo] = useState<Periodo>(2026);
  const [limiar, setLimiar] = useState(30);
  const [drill, setDrill] = useState<{ titulo: string; rows: Protocolo[] } | null>(null);
  const [pagina, setPagina] = useState(0);

  const stats = useMemo(() => calcularStats(data, periodo, limiar), [data, periodo, limiar]);
  const monthly = useMemo(() => serieMensal(data, periodo), [data, periodo]);
  const aging = useMemo(() => faixasAging(stats.ativos), [stats.ativos]);
  const status = useMemo(() => agrupar(stats.ativos, "status_operacional").slice(0, 8), [stats.ativos]);
  const categorias = useMemo(() => agrupar(stats.ativos, "tipo_processo").slice(0, 8), [stats.ativos]);
  const bottlenecks = useMemo(() => gargalos(stats.ativos).slice(0, 8), [stats.ativos]);

  const periodoLabel = periodo === "all" ? "2025+" : String(periodo);
  const saldoBom = stats.saldo <= 0;
  const drillRows = drill?.rows ?? [];
  const pageRows = drillRows.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(drillRows.length / PAGE_SIZE));

  const abrir = (titulo: string, rows: Protocolo[]) => {
    setPagina(0);
    setDrill({ titulo, rows });
  };

  if (protocolosQuery.isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-muted-foreground" /><p className="text-sm text-muted-foreground">Carregando base SEPLAN…</p></div></div>;
  }

  if (protocolosQuery.isError) {
    return <Card className="border-destructive/30"><CardContent className="p-6"><p className="font-semibold text-destructive">Não foi possível carregar a base.</p><p className="mt-1 text-sm text-muted-foreground">O dashboard não substitui falha de leitura por dados simulados.</p></CardContent></Card>;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-sky-700"><Database className="h-3.5 w-3.5" />BASE REAL 2025+</div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestão à Vista</h1>
          <p className="mt-1 text-sm text-muted-foreground">Processos, capacidade operacional e pontos de atenção da SEPLAN.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[2026, 2025, "all"].map(item => <Button key={String(item)} size="sm" variant={periodo === item ? "default" : "outline"} onClick={() => setPeriodo(item as Periodo)}>{item === "all" ? "2025+" : item}</Button>)}
          <div className="ml-1 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">Atualizado em <span className="font-semibold text-foreground">{metadataQuery.data?.data_referencia ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(metadataQuery.data.data_referencia)) : "—"}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard titulo="Recebidos" valor={stats.recebidos.length.toLocaleString("pt-BR")} apoio={`abertos em ${periodoLabel}`} icon={Inbox} onClick={() => abrir(`Recebidos · ${periodoLabel}`, stats.recebidos)} />
        <KpiCard titulo="Concluídos" valor={stats.concluidos.length.toLocaleString("pt-BR")} apoio={`encerrados formalmente em ${periodoLabel}`} icon={CheckCircle2} tom="positivo" onClick={() => abrir(`Concluídos · ${periodoLabel}`, stats.concluidos)} />
        <KpiCard titulo="Estoque atual" valor={stats.ativos.length.toLocaleString("pt-BR")} apoio="protocolos ativos na base" icon={Layers3} onClick={() => abrir("Estoque atual", stats.ativos)} />
        <KpiCard titulo="Tempo mediano" valor={`${Math.round(stats.tempoMediano)} d`} apoio={`média ${stats.tempoMedio} d · P90 ${stats.p90} d`} icon={Clock3} onClick={() => abrir(`Concluídos · ${periodoLabel}`, stats.concluidos)} />
        <KpiCard titulo={`Parados >${limiar} dias`} valor={stats.parados.length.toLocaleString("pt-BR")} apoio={`${stats.percentualParados.toFixed(1)}% do estoque`} icon={AlertTriangle} tom="atencao" onClick={() => abrir(`Parados >${limiar} dias`, stats.parados)} />
      </div>

      <Card className={saldoBom ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/60"}>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${saldoBom ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{saldoBom ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}</div>
            <div><p className="text-sm font-semibold">{saldoBom ? `Conclusões superam entradas em ${Math.abs(stats.saldo).toLocaleString("pt-BR")}` : `Entraram ${stats.saldo.toLocaleString("pt-BR")} processos a mais do que foram concluídos`}</p><p className="text-xs text-muted-foreground">Saldo do período selecionado: recebidos − concluídos.</p></div>
          </div>
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Parado:</span>{[15, 30, 60, 90, 120].map(d => <Button key={d} size="sm" variant={limiar === d ? "default" : "ghost"} className="h-7 px-2 text-xs" onClick={() => setLimiar(d)}>{d}d</Button>)}</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-base">Entradas × conclusões</CardTitle><p className="text-xs text-muted-foreground">Fluxo mensal de protocolos em {periodoLabel}.</p></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthly} margin={{ left: 4, right: 12, top: 10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" tickFormatter={formatarMes} fontSize={11} /><YAxis fontSize={11} /><Tooltip labelFormatter={v => formatarMes(String(v))} /><Legend /><Line type="monotone" dataKey="recebidos" name="Recebidos" stroke="#0284c7" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="concluidos" name="Concluídos" stroke="#16a34a" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Idade sem movimentação</CardTitle><p className="text-xs text-muted-foreground">Distribuição do estoque atual.</p></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={aging} layout="vertical" margin={{ left: 8, right: 12 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" fontSize={10} /><YAxis type="category" dataKey="faixa" width={54} fontSize={11} /><Tooltip /><Bar dataKey="count" name="Protocolos" radius={[0, 5, 5, 0]}>{aging.map((_, i) => { const colors = ["#94a3b8", "#38bdf8", "#f59e0b", "#f97316", "#ef4444", "#991b1b"]; return <Cell key={i} fill={colors[i]} />; })}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Onde estão os processos?</CardTitle><p className="text-xs text-muted-foreground">Status operacional do estoque atual.</p></CardHeader><CardContent className="space-y-2">{status.map(item => { const rows = stats.ativos.filter(p => p.status_operacional === item.nome); const pct = stats.ativos.length ? (item.count / stats.ativos.length) * 100 : 0; return <button key={item.nome} onClick={() => abrir(item.nome, rows)} className="group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/60"><span className="w-44 truncate text-sm font-medium">{item.nome}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-sky-600" style={{ width: `${Math.max(2, pct)}%` }} /></div><span className="w-14 text-right text-sm font-semibold">{item.count.toLocaleString("pt-BR")}</span></button>; })}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Principais demandas no estoque</CardTitle><p className="text-xs text-muted-foreground">Categorias finais; revisão aparece separadamente.</p></CardHeader><CardContent className="space-y-2">{categorias.map(item => { const rows = stats.ativos.filter(p => p.tipo_processo === item.nome); const pct = stats.ativos.length ? (item.count / stats.ativos.length) * 100 : 0; return <button key={item.nome} onClick={() => abrir(item.nome, rows)} className="group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/60"><span className="w-56 truncate text-sm font-medium">{item.nome}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-slate-600" style={{ width: `${Math.max(2, pct)}%` }} /></div><span className="w-14 text-right text-sm font-semibold">{item.count.toLocaleString("pt-BR")}</span></button>; })}</CardContent></Card>
      </div>

      <Card><CardHeader className="pb-2"><CardTitle className="text-base">Onde estão as pendências?</CardTitle><p className="text-xs text-muted-foreground">Responsáveis com maior estoque ativo.</p></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Responsável</TableHead><TableHead className="text-right">Estoque</TableHead><TableHead className="text-right">&gt;30 dias</TableHead><TableHead className="text-right">&gt;60 dias</TableHead><TableHead className="text-right">Idade mediana</TableHead></TableRow></TableHeader><TableBody>{bottlenecks.map(item => <TableRow key={item.responsavel} className="cursor-pointer" onClick={() => abrir(item.responsavel, stats.ativos.filter(p => p.responsavel === item.responsavel))}><TableCell className="font-medium">{item.responsavel}</TableCell><TableCell className="text-right font-semibold">{item.estoque}</TableCell><TableCell className="text-right">{item.d30}</TableCell><TableCell className="text-right">{item.d60}</TableCell><TableCell className="text-right">{item.mediana} d</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>

      <Dialog open={Boolean(drill)} onOpenChange={open => !open && setDrill(null)}><DialogContent className="max-w-6xl"><DialogHeader><DialogTitle>{drill?.titulo}</DialogTitle><DialogDescription>{drillRows.length.toLocaleString("pt-BR")} protocolos compõem este indicador.</DialogDescription></DialogHeader><div className="max-h-[58vh] overflow-auto rounded-md border"><Table><TableHeader className="sticky top-0 bg-background"><TableRow><TableHead>Protocolo</TableHead><TableHead>Abertura</TableHead><TableHead>Categoria</TableHead><TableHead>Status</TableHead><TableHead>Responsável</TableHead><TableHead className="text-right">Sem mov.</TableHead><TableHead>Inscrição</TableHead></TableRow></TableHeader><TableBody>{pageRows.map(p => <TableRow key={p.id}><TableCell className="font-mono text-xs">{p.protocolo}</TableCell><TableCell className="text-xs">{formatarData(p.data_abertura)}</TableCell><TableCell className="max-w-56 truncate text-xs">{p.tipo_processo}</TableCell><TableCell className="text-xs">{p.status_operacional}</TableCell><TableCell className="max-w-48 truncate text-xs">{p.responsavel}</TableCell><TableCell className="text-right text-xs font-semibold">{p.dias_sem_movimento} d</TableCell><TableCell className="font-mono text-xs">{p.inscricao || "—"}</TableCell></TableRow>)}</TableBody></Table></div><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Página {pagina + 1} de {totalPages}</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button><Button size="sm" variant="outline" disabled={pagina >= totalPages - 1} onClick={() => setPagina(p => p + 1)}>Próxima</Button></div></div></DialogContent></Dialog>
    </div>
  );
}
