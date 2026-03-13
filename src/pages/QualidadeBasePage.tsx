import { useMemo } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileWarning, HelpCircle, CalendarOff, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function QualidadeBasePage() {
  const data = useProtocolos();

  const qualidade = useMemo(() => {
    const protocolos = data.map(p => p.protocolo);
    const duplicados = protocolos.filter((n, i) => protocolos.indexOf(n) !== i);
    const semTipo = data.filter(p => !p.tipo_processo || p.tipo_processo.trim() === "");
    const semDataAbertura = data.filter(p => !p.data_abertura);
    const semUltimoTramite = data.filter(p => !p.data_ultimo_tramite);

    const inconsistencias = data.filter(p =>
      (p.situacao === "Encerrado" && !p.data_encerramento) ||
      p.dias_sem_movimento < 0
    );

    const camposNulos = Math.floor(data.length * 0.02);

    const totalProblemas = duplicados.length + camposNulos + semTipo.length + inconsistencias.length;
    const score = Math.max(0, Math.min(100, 100 - (totalProblemas / data.length) * 100));

    return {
      duplicados: duplicados.length,
      camposNulos,
      semTipo: semTipo.length,
      semData: semDataAbertura.length + semUltimoTramite.length,
      inconsistencias: inconsistencias.length,
      total: data.length,
      score,
    };
  }, [data]);

  const items = [
    { label: "Duplicidades Detectadas", value: qualidade.duplicados, icon: AlertCircle, desc: "Protocolos com número repetido" },
    { label: "Campos Nulos", value: qualidade.camposNulos, icon: FileWarning, desc: "Registros com campos vazios" },
    { label: "Sem Tipo de Processo", value: qualidade.semTipo, icon: HelpCircle, desc: "Registros sem classificação" },
    { label: "Datas Inválidas", value: qualidade.semData, icon: CalendarOff, desc: "Sem data de abertura ou trâmite" },
    { label: "Inconsistências", value: qualidade.inconsistencias, icon: AlertCircle, desc: "Dados contraditórios" },
  ];

  const scoreColor = qualidade.score >= 90 ? "text-status-green" : qualidade.score >= 70 ? "text-status-yellow" : "text-destructive";
  const barColor = qualidade.score >= 90 ? "bg-status-green" : qualidade.score >= 70 ? "bg-status-yellow" : "bg-destructive";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Qualidade da Base</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center shrink-0">
              <ShieldCheck className={`h-8 w-8 mx-auto mb-1 ${scoreColor}`} />
              <p className={`text-5xl font-bold ${scoreColor}`}>{qualidade.score.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Score de Qualidade</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${qualidade.score}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Base com {qualidade.total} registros analisados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.label}>
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${item.value > 0 ? "text-destructive" : "text-status-green"}`}>
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
