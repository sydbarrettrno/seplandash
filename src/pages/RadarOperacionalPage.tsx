import { useMemo } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { agrupar, faixasAging, gargalos } from "@/lib/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function RadarOperacionalPage() {
  const data = useProtocolos();
  const ativos = useMemo(() => data.filter(p => p.ativo), [data]);
  const aging = useMemo(() => faixasAging(ativos), [ativos]);
  const categorias = useMemo(() => agrupar(ativos, "tipo_processo").slice(0, 10), [ativos]);
  const responsaveis = useMemo(() => gargalos(ativos).slice(0, 10), [ativos]);
  const maxResp = Math.max(1, ...responsaveis.map(x => x.estoque));

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div><h1 className="text-2xl font-bold">Radar Operacional</h1><p className="text-sm text-muted-foreground">Distribuição da carga atual da SEPLAN.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[30, 60, 90, 120].map(d => <Card key={d}><CardContent className="p-4"><p className="text-xs text-muted-foreground">&gt;{d} dias sem movimento</p><p className="mt-1 text-3xl font-bold">{ativos.filter(p => p.dias_sem_movimento > d).length}</p></CardContent></Card>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-base">Estoque por categoria</CardTitle></CardHeader><CardContent className="h-[360px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={categorias} layout="vertical" margin={{ left: 140, right: 15 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" fontSize={10} /><YAxis type="category" dataKey="nome" width={135} fontSize={10} /><Tooltip /><Bar dataKey="count" name="Protocolos" fill="#0284c7" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Responsáveis com maior estoque</CardTitle></CardHeader><CardContent className="space-y-2">{responsaveis.map(r => <div key={r.responsavel} className="flex items-center gap-3 rounded-md px-2 py-2"><span className="w-56 truncate text-sm font-medium">{r.responsavel}</span><div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-slate-600 rounded-full" style={{ width: `${Math.max(3, (r.estoque / maxResp) * 100)}%` }} /></div><span className="w-12 text-right font-semibold">{r.estoque}</span></div>)}</CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Envelhecimento do estoque</CardTitle></CardHeader><CardContent className="grid grid-cols-2 md:grid-cols-6 gap-3">{aging.map(f => <div key={f.faixa} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{f.faixa} dias</p><p className="text-2xl font-bold">{f.count}</p></div>)}</CardContent></Card>
    </div>
  );
}
