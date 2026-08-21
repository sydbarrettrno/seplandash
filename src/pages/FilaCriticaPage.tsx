import { useMemo } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function FilaCriticaPage() {
  const data = useProtocolos();
  const fila = useMemo(
    () => data.filter(p => p.ativo && p.dias_sem_movimento > 30).sort((a, b) => b.dias_sem_movimento - a.dias_sem_movimento),
    [data]
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Fila Crítica</h1>
        <p className="text-sm text-muted-foreground">{fila.length.toLocaleString("pt-BR")} protocolos ativos com mais de 30 dias sem movimentação.</p>
      </div>
      <div className="rounded-lg border bg-card overflow-auto max-h-[78vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow><TableHead>Protocolo</TableHead><TableHead>Categoria</TableHead><TableHead>Status</TableHead><TableHead>Responsável</TableHead><TableHead>Abertura</TableHead><TableHead>Últ. Trâmite</TableHead><TableHead className="text-right">Dias s/ mov.</TableHead><TableHead>Inscrição</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {fila.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.protocolo}</TableCell>
                <TableCell className="max-w-64 truncate">{p.tipo_processo}</TableCell>
                <TableCell><Badge variant="outline">{p.status_operacional}</Badge></TableCell>
                <TableCell className="max-w-56 truncate">{p.responsavel}</TableCell>
                <TableCell>{p.data_abertura}</TableCell>
                <TableCell>{p.data_ultimo_tramite?.slice(0, 10)}</TableCell>
                <TableCell className="text-right font-bold text-destructive">{p.dias_sem_movimento}</TableCell>
                <TableCell className="font-mono text-xs">{p.inscricao || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
