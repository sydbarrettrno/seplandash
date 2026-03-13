import { useMemo } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { criticidadeBadgeClass } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function FilaCriticaPage() {
  const data = useProtocolos();

  const fila = useMemo(() => {
    return data
      .filter(p => p.situacao !== "Encerrado")
      .sort((a, b) => b.dias_sem_movimento - a.dias_sem_movimento);
  }, [data]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fila Crítica</h1>
      <p className="text-sm text-muted-foreground">
        {fila.length} protocolos em aberto, ordenados por dias sem movimentação.
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
                <TableCell className="font-mono text-sm">{p.numero_protocolo}</TableCell>
                <TableCell>{p.ano_protocolo}</TableCell>
                <TableCell>{p.tipo_processo}</TableCell>
                <TableCell>{p.situacao}</TableCell>
                <TableCell className="text-sm">{p.data_abertura}</TableCell>
                <TableCell className="text-sm">{p.data_ultimo_tramite}</TableCell>
                <TableCell className={`text-right font-bold ${p.dias_sem_movimento > 120 ? "text-status-red-dark" : p.dias_sem_movimento > 30 ? "text-status-red" : ""}`}>
                  {p.dias_sem_movimento}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${criticidadeBadgeClass(p.criticidade_prazo)}`}>
                    {p.criticidade_prazo}
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
