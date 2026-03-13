import { useMemo } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Flame, Skull, PackageOpen } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function RadarOperacionalPage() {
  const data = useProtocolos();

  const abertos = useMemo(() => data.filter(p => p.situacao !== "Encerrado"), [data]);

  const indicadores = useMemo(() => {
    const d30 = abertos.filter(p => p.dias_sem_movimento >= 30).length;
    const d60 = abertos.filter(p => p.dias_sem_movimento >= 60).length;
    const d120 = abertos.filter(p => p.dias_sem_movimento >= 120).length;
    const d365 = abertos.filter(p => p.dias_sem_movimento >= 365).length;
    const passivoAtrasado = data.filter(p => p.passivo_herdado && p.status_prazo === "ATRASADO").length;

    const map: Record<string, number> = {};
    abertos.filter(p => p.dias_sem_movimento >= 30).forEach(p => {
      map[p.tipo_processo] = (map[p.tipo_processo] || 0) + 1;
    });
    const represamento = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([tipo, count]) => ({ tipo, count }));

    return { d30, d60, d120, d365, passivoAtrasado, represamento };
  }, [abertos, data]);

  const cards = [
    { label: "30+ dias parado", value: indicadores.d30, icon: Clock, color: "text-status-yellow" },
    { label: "60+ dias parado", value: indicadores.d60, icon: AlertTriangle, color: "text-status-orange" },
    { label: "120+ dias parado", value: indicadores.d120, icon: Flame, color: "text-status-red" },
    { label: "365+ dias parado", value: indicadores.d365, icon: Skull, color: "text-status-red-dark" },
    { label: "Passivo herdado atrasado", value: indicadores.passivoAtrasado, icon: PackageOpen, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Radar Operacional</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-4 text-center">
              <c.icon className={`h-8 w-8 mx-auto mb-2 ${c.color}`} />
              <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Tipos com Maior Represamento (30+ dias)</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={indicadores.represamento} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
              <XAxis type="number" fontSize={10} />
              <YAxis type="category" dataKey="tipo" fontSize={10} width={115} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
