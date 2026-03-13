import { useMemo } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { criticidadeBadgeClass } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CRITICIDADE_ORDER: Record<string, number> = {
  "GRAVÍSSIMO": 6,
  "CRÍTICO": 5,
  "ATRASADO": 4,
  "LIMITE SLA": 3,
  "ATENÇÃO": 2,
  "RECENTE": 1,
};

export default function FilaCriticaPage() {
  const data = useProtocolos();

  const fila = useMemo(() => {
    return data
      .filter(p => p.situacao !== "Encerrado")
      .sort((a, b) => {
        const critDiff = (CRITICIDADE_ORDER[b.criticidade] || 0) - (CRITICIDADE_ORDER[a.criticidade] || 0);
        if (critDiff !== 0) return critDiff;
        const diasDiff = b.dias_sem_movimento - a.dias_sem_movimento;
        if (diasDiff !== 0) return diasDiff;
        return (b.passivo_herdado ? 1 : 0) - (a.passivo_herdado ? 1 : 0);
      });
  }, [data]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fila Crítica</h1>
      <p className="text-sm text-muted-foreground">
        {fila.length} protocolos em aberto, ordenados por criticidade e dias sem movimentação.
      </p>

      <div className="rounded-lg border overflow-auto max-h-[75vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Abertura</TableHead>
              <TableHead>Últ. Trâmite</TableHead>
              <TableHead className="text-right">Dias s/ Mov.</TableHead>
              <TableHead>Criticidade</TableHead>
              <TableHead>Gestão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fila.map(p => (
              <TableRow key={p.id_protocolo}>
                <TableCell className="font-mono text-sm">{p.protocolo}</TableCell>
                <TableCell>{p.ano_abertura}</TableCell>
                <TableCell>{p.tipo_processo}</TableCell>
                <TableCell>{p.situacao}</TableCell>
                <TableCell className="text-sm">{p.data_abertura}</TableCell>
                <TableCell className="text-sm">{p.data_ultimo_tramite}</TableCell>
                <TableCell className={`text-right font-bold ${p.dias_sem_movimento > 120 ? "text-status-red-dark" : p.dias_sem_movimento > 30 ? "text-destructive" : ""}`}>
                  {p.dias_sem_movimento}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${criticidadeBadgeClass(p.criticidade)}`}>
                    {p.criticidade}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={p.gestao === "GESTÃO ANTERIOR" ? "destructive" : "secondary"} className="text-xs">
                    {p.gestao === "GESTÃO ANTERIOR" ? "Anterior" : "Atual"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
