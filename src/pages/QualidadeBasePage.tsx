import { useMemo } from "react";
import { useMetadata, useProtocolos } from "@/hooks/useProtocolos";
import { Card, CardContent } from "@/components/ui/card";

export default function QualidadeBasePage() {
  const data = useProtocolos();
  const metadata = useMetadata().data;

  const q = useMemo(() => {
    const ids = data.map(p => p.id);
    const unicos = new Set(ids);
    const revisao = data.filter(p => p.revisao).length;
    const inscricoes = data.filter(p => Boolean(p.inscricao)).length;
    const semData = data.filter(p => !p.data_abertura || !p.data_ultimo_tramite).length;
    const invalidas = data.filter(p => p.data_encerramento && new Date(p.data_encerramento).getTime() < new Date(p.data_abertura).getTime()).length;
    return { total: data.length, unicos: unicos.size, duplicidades: data.length - unicos.size, revisao, alta: data.length - revisao, inscricoes, semData, invalidas };
  }, [data]);

  const items: [string, number][] = [
    ["Protocolos", q.total], ["Protocolos únicos", q.unicos], ["Classificação alta confiança", q.alta], ["Classificação pendente", q.revisao],
    ["Inscrições identificadas", q.inscricoes], ["Duplicidades", q.duplicidades], ["Datas ausentes", q.semData], ["Datas inconsistentes", q.invalidas],
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div><h1 className="text-2xl font-bold">Qualidade da Base</h1><p className="text-sm text-muted-foreground">Base {metadata?.versao_base || "—"} · {metadata?.arquivo_origem || "SEPLAN_BASE_ATUAL.xlsx"}</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold">{value.toLocaleString("pt-BR")}</p></CardContent></Card>)}
      </div>
    </div>
  );
}
