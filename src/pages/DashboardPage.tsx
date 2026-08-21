import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMetadata } from "@/hooks/useProtocolos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox, CheckCircle2, Layers3, Clock3, AlertTriangle, Database, ArrowUpRight, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from "recharts";

interface PeriodStats { recebidos:number; concluidos:number; estoque:number; parados30:number; perc_parados30:number; tempo_mediano:number; tempo_medio:number; p90:number; saldo:number }
interface Summary {
  periods: Record<string, PeriodStats>;
  monthly: { mes:string; recebidos:number; concluidos:number }[];
  aging: { faixa:string; count:number }[];
  status: { nome:string; count:number }[];
  categorias: { nome:string; count:number }[];
  responsaveis: { responsavel:string; estoque:number; d30:number; d60:number; mediana:number }[];
}

async function loadSummary(): Promise<Summary> {
  const r = await fetch("/generated/dashboard-summary.json", { cache: "no-cache" });
  if (!r.ok) throw new Error("Falha ao carregar resumo gerencial");
  return r.json();
}

function Kpi({ title, value, help, icon:Icon, accent="sky" }: { title:string; value:string; help:string; icon:typeof Inbox; accent?:"sky"|"green"|"amber" }) {
  const border = accent === "green" ? "border-l-emerald-500" : accent === "amber" ? "border-l-amber-500" : "border-l-sky-600";
  return <Card className={`border-l-4 ${border}`}><CardContent className="p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</span><Icon className="h-4 w-4 text-muted-foreground" /></div><div className="text-3xl font-bold tracking-tight">{value}</div><p className="mt-1 text-xs text-muted-foreground">{help}</p></CardContent></Card>;
}

function monthLabel(v:string) { const [y,m]=v.split("-"); return `${m}/${y.slice(2)}`; }

export default function DashboardPage() {
  const [period, setPeriod] = useState<"2025"|"2026"|"all">("2026");
  const summary = useQuery({ queryKey:["dashboard-summary-v07"], queryFn:loadSummary, staleTime:300000 });
  const metadata = useMetadata();
  const data = summary.data;
  const stats = data?.periods[period];
  const monthly = useMemo(() => data?.monthly.filter(x => period === "all" || x.mes.startsWith(period)) ?? [], [data, period]);

  if (summary.isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-sky-700" /></div>;
  if (!data || !stats) return <Card><CardContent className="p-6 text-destructive">Não foi possível carregar os indicadores.</CardContent></Card>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-sky-700"><Database className="h-3.5 w-3.5" />BASE REAL · 2025+</div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão à Vista</h1>
          <p className="mt-1 text-sm text-muted-foreground">Situação operacional da SEPLAN em uma leitura rápida.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["2026","2025","all"] as const).map(p => <Button key={p} size="sm" variant={period===p?"default":"outline"} onClick={()=>setPeriod(p)}>{p==="all"?"2025+":p}</Button>)}
          <div className="rounded-md border bg-white px-3 py-2 text-xs text-muted-foreground">Atualizado em <strong className="text-foreground">{metadata.data?.data_referencia ? new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(metadata.data.data_referencia)) : "20/08/2026 18:58"}</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi title="Recebidos" value={stats.recebidos.toLocaleString("pt-BR")} help={`aberturas em ${period==="all"?"2025+":period}`} icon={Inbox} />
        <Kpi title="Concluídos" value={stats.concluidos.toLocaleString("pt-BR")} help="por DataEncerramento" icon={CheckCircle2} accent="green" />
        <Kpi title="Estoque atual" value={stats.estoque.toLocaleString("pt-BR")} help="protocolos ativos" icon={Layers3} />
        <Kpi title="Tempo mediano" value={`${stats.tempo_mediano} d`} help={`média ${stats.tempo_medio} d · P90 ${stats.p90} d`} icon={Clock3} />
        <Kpi title="Parados >30 dias" value={stats.parados30.toLocaleString("pt-BR")} help={`${stats.perc_parados30.toFixed(1)}% do estoque`} icon={AlertTriangle} accent="amber" />
      </div>

      <Card className="border-amber-200 bg-amber-50/60"><CardContent className="flex items-center gap-3 p-4"><div className="rounded-full bg-amber-100 p-2 text-amber-700"><ArrowUpRight className="h-5 w-5" /></div><div><p className="text-sm font-semibold">Saldo do período: +{stats.saldo.toLocaleString("pt-BR")} processos</p><p className="text-xs text-muted-foreground">Entradas superaram conclusões no recorte selecionado. Isso sinaliza pressão sobre o estoque, não prazo legal.</p></div></CardContent></Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-base">Entradas × conclusões</CardTitle><p className="text-xs text-muted-foreground">Fluxo mensal calculado pelas datas formais da base.</p></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="mes" tickFormatter={monthLabel} fontSize={11}/><YAxis fontSize={11}/><Tooltip labelFormatter={v=>monthLabel(String(v))}/><Legend/><Line type="monotone" dataKey="recebidos" name="Recebidos" stroke="#0284c7" strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="concluidos" name="Concluídos" stroke="#16a34a" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Idade sem movimentação</CardTitle><p className="text-xs text-muted-foreground">Estoque atual por faixa de inatividade.</p></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.aging} layout="vertical"><XAxis type="number" fontSize={10}/><YAxis type="category" dataKey="faixa" width={55} fontSize={11}/><Tooltip/><Bar dataKey="count" name="Protocolos" radius={[0,5,5,0]}>{data.aging.map((_,i)=><Cell key={i} fill={["#94a3b8","#38bdf8","#f59e0b","#f97316","#ef4444","#991b1b"][i]}/>)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Onde estão os processos?</CardTitle><p className="text-xs text-muted-foreground">Distribuição do estoque por status operacional.</p></CardHeader><CardContent className="space-y-2">{data.status.map(s=><div key={s.nome} className="flex items-center gap-3 rounded-md px-2 py-2"><span className="w-48 truncate text-sm font-medium">{s.nome}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-sky-600" style={{width:`${s.count/data.status[0].count*100}%`}}/></div><strong className="w-14 text-right text-sm">{s.count.toLocaleString("pt-BR")}</strong></div>)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Principais demandas no estoque</CardTitle><p className="text-xs text-muted-foreground">Classificação pendente aparece separadamente, sem inferência forçada.</p></CardHeader><CardContent className="space-y-2">{data.categorias.slice(0,8).map(s=><div key={s.nome} className="flex items-center gap-3 rounded-md px-2 py-2"><span className="w-60 truncate text-sm font-medium">{s.nome}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-slate-600" style={{width:`${s.count/data.categorias[0].count*100}%`}}/></div><strong className="w-14 text-right text-sm">{s.count.toLocaleString("pt-BR")}</strong></div>)}</CardContent></Card>
      </div>

      <Card><CardHeader className="pb-2"><CardTitle className="text-base">Onde estão as pendências?</CardTitle><p className="text-xs text-muted-foreground">Concentração do estoque por responsável/gargalo identificado.</p></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Responsável</th><th className="py-2 text-right">Estoque</th><th className="py-2 text-right">&gt;30 d</th><th className="py-2 text-right">&gt;60 d</th><th className="py-2 text-right">Idade mediana</th></tr></thead><tbody>{data.responsaveis.slice(0,8).map(r=><tr key={r.responsavel} className="border-b last:border-0"><td className="py-3 font-medium">{r.responsavel}</td><td className="py-3 text-right font-semibold">{r.estoque}</td><td className="py-3 text-right">{r.d30}</td><td className="py-3 text-right">{r.d60}</td><td className="py-3 text-right">{r.mediana} d</td></tr>)}</tbody></table></div></CardContent></Card>
    </div>
  );
}
