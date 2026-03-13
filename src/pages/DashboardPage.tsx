import { useMemo } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, FolderOpen, CheckCircle, AlertTriangle,
  TrendingUp, ArrowDownUp, Calendar, PackageOpen
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const PIE_COLORS = ["hsl(142,60%,40%)", "hsl(0,72%,51%)"];

export default function DashboardPage() {
  const data = useProtocolos();

  const stats = useMemo(() => {
    const abertos = data.filter(p => p.situacao !== "Encerrado");
    const encerrados = data.filter(p => p.situacao === "Encerrado");
    const atrasados = abertos.filter(p => p.status_prazo === "ATRASADO");
    const passivo = data.filter(p => p.passivo_herdado);
    const now = new Date();
    const mesAtual = now.getMonth();
    const anoAtual = now.getFullYear();
    const entradasMes = data.filter(p => {
      const d = new Date(p.data_abertura);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });
    const encerramentosMes = encerrados.filter(p => {
      if (!p.data_encerramento) return false;
      const d = new Date(p.data_encerramento);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    return {
      total: data.length,
      abertos: abertos.length,
      encerrados: encerrados.length,
      atrasados: atrasados.length,
      percAtraso: abertos.length ? ((atrasados.length / abertos.length) * 100).toFixed(1) : "0",
      passivo: passivo.length,
      entradasMes: entradasMes.length,
      encerramentosMes: encerramentosMes.length,
      saldoMensal: entradasMes.length - encerramentosMes.length,
    };
  }, [data]);

  const monthlyChart = useMemo(() => {
    const months: Record<string, { entradas: number; encerramentos: number }> = {};
    const fmt = (d: string) => d.slice(0, 7);
    data.forEach(p => {
      const m = fmt(p.data_abertura);
      if (!months[m]) months[m] = { entradas: 0, encerramentos: 0 };
      months[m].entradas++;
    });
    data.filter(p => p.data_encerramento).forEach(p => {
      const m = fmt(p.data_encerramento!);
      if (!months[m]) months[m] = { entradas: 0, encerramentos: 0 };
      months[m].encerramentos++;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([mes, v]) => ({ mes, ...v }));
  }, [data]);

  const tipoAbertos = useMemo(() => {
    const map: Record<string, number> = {};
    data.filter(p => p.situacao !== "Encerrado").forEach(p => {
      map[p.tipo_processo] = (map[p.tipo_processo] || 0) + 1;
    });
    return Object.entries(map)
      .map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const faixasInatividade = useMemo(() => {
    const abertos = data.filter(p => p.situacao !== "Encerrado");
    const faixas = [
      { faixa: "0–7d", count: 0 },
      { faixa: "8–15d", count: 0 },
      { faixa: "16–30d", count: 0 },
      { faixa: "31–60d", count: 0 },
      { faixa: "61–120d", count: 0 },
      { faixa: "120+d", count: 0 },
    ];
    abertos.forEach(p => {
      const d = p.dias_sem_movimento;
      if (d <= 7) faixas[0].count++;
      else if (d <= 15) faixas[1].count++;
      else if (d <= 30) faixas[2].count++;
      else if (d <= 60) faixas[3].count++;
      else if (d <= 120) faixas[4].count++;
      else faixas[5].count++;
    });
    return faixas;
  }, [data]);

  const prazoChart = useMemo(() => {
    const abertos = data.filter(p => p.situacao !== "Encerrado");
    const noPrazo = abertos.filter(p => p.status_prazo === "NO PRAZO").length;
    const atrasado = abertos.filter(p => p.status_prazo === "ATRASADO").length;
    return [
      { name: "No Prazo", value: noPrazo },
      { name: "Atrasado", value: atrasado },
    ];
  }, [data]);

  const passivoTipo = useMemo(() => {
    const map: Record<string, number> = {};
    data.filter(p => p.passivo_herdado).forEach(p => {
      map[p.tipo_processo] = (map[p.tipo_processo] || 0) + 1;
    });
    return Object.entries(map)
      .map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const cards = [
    { label: "Total de Protocolos", value: stats.total, icon: FileText, accent: false },
    { label: "Em Aberto", value: stats.abertos, icon: FolderOpen, accent: false },
    { label: "Encerrados", value: stats.encerrados, icon: CheckCircle, accent: false },
    { label: "Atrasados", value: stats.atrasados, icon: AlertTriangle, accent: true },
    { label: "% Atraso", value: `${stats.percAtraso}%`, icon: TrendingUp, accent: true },
    { label: "Passivo Herdado", value: stats.passivo, icon: PackageOpen, accent: true },
    { label: "Entradas no Mês", value: stats.entradasMes, icon: Calendar, accent: false },
    { label: "Encerramentos no Mês", value: stats.encerramentosMes, icon: Calendar, accent: false },
    { label: "Saldo Mensal", value: stats.saldoMensal > 0 ? `+${stats.saldoMensal}` : stats.saldoMensal, icon: ArrowDownUp, accent: stats.saldoMensal > 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map(c => (
          <Card key={c.label} className={c.accent ? "border-status-red/30" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <c.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
              </div>
              <p className={`text-2xl font-bold ${c.accent ? "text-status-red" : ""}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line: entradas x encerramentos */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Entradas × Encerramentos por Mês</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                <XAxis dataKey="mes" fontSize={10} tickFormatter={v => v.slice(5)} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entradas" stroke="hsl(200,70%,45%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="encerramentos" stroke="hsl(142,60%,40%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut: prazo */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">No Prazo × Atrasado</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={prazoChart} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {prazoChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar: tipo abertos */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Abertos por Tipo</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tipoAbertos} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                <XAxis type="number" fontSize={10} />
                <YAxis type="category" dataKey="tipo" fontSize={10} width={75} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(200,70%,45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar: faixas inatividade */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Faixas de Inatividade</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faixasInatividade}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                <XAxis dataKey="faixa" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {faixasInatividade.map((_, i) => {
                    const colors = ["hsl(142,60%,40%)", "hsl(45,93%,47%)", "hsl(25,95%,53%)", "hsl(0,72%,51%)", "hsl(0,72%,41%)", "hsl(0,72%,30%)"];
                    return <Cell key={i} fill={colors[i]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar horizontal: passivo por tipo */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Passivo Herdado por Tipo</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passivoTipo} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                <XAxis type="number" fontSize={10} />
                <YAxis type="category" dataKey="tipo" fontSize={10} width={75} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
