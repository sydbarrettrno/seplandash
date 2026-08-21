import { useMemo, useState } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 100;

export default function ExploradorDadosPage() {
  const data = useProtocolos();
  const [search, setSearch] = useState("");
  const [ano, setAno] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [page, setPage] = useState(0);

  const anos = useMemo(() => [...new Set(data.map(p => p.ano_abertura))].sort(), [data]);
  const statuses = useMemo(() => [...new Set(data.map(p => p.status_operacional).filter(Boolean))].sort(), [data]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data
      .filter(p => ano === "todos" || p.ano_abertura === Number(ano))
      .filter(p => status === "todos" || p.status_operacional === status)
      .filter(p => !s || [p.protocolo, p.tipo_processo, p.status_operacional, p.responsavel, p.inscricao].some(v => (v || "").toLowerCase().includes(s)))
      .sort((a, b) => b.dias_sem_movimento - a.dias_sem_movimento);
  }, [data, search, ano, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div><h1 className="text-2xl font-bold">Processos</h1><p className="text-sm text-muted-foreground">Consulta operacional da base 2025+.</p></div>
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Buscar protocolo, inscrição, categoria ou responsável" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="min-w-[320px] flex-1" />
        <Select value={ano} onValueChange={v => { setAno(v); setPage(0); }}><SelectTrigger className="w-32"><SelectValue placeholder="Ano" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem>{anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent></Select>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(0); }}><SelectTrigger className="w-56"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os status</SelectItem>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{filtered.length.toLocaleString("pt-BR")} protocolos</p><p className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</p></div>
      <div className="rounded-lg border bg-card overflow-auto max-h-[70vh]">
        <Table><TableHeader className="sticky top-0 z-10 bg-card"><TableRow><TableHead>Protocolo</TableHead><TableHead>Abertura</TableHead><TableHead>Categoria</TableHead><TableHead>Status</TableHead><TableHead>Responsável</TableHead><TableHead className="text-right">Dias s/ mov.</TableHead><TableHead>Inscrição</TableHead><TableHead>Qualidade</TableHead></TableRow></TableHeader><TableBody>
          {pageRows.map(p => <TableRow key={p.id}><TableCell className="font-mono text-xs">{p.protocolo}</TableCell><TableCell className="text-xs">{p.data_abertura}</TableCell><TableCell className="max-w-64 truncate">{p.tipo_processo}</TableCell><TableCell><Badge variant="outline">{p.status_operacional}</Badge></TableCell><TableCell className="max-w-56 truncate">{p.responsavel}</TableCell><TableCell className="text-right font-semibold">{p.dias_sem_movimento}</TableCell><TableCell className="font-mono text-xs">{p.inscricao || "—"}</TableCell><TableCell>{p.revisao ? <Badge variant="destructive">Revisar</Badge> : <Badge variant="secondary">Alta confiança</Badge>}</TableCell></TableRow>)}
        </TableBody></Table>
      </div>
      <div className="flex justify-end gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Próxima</Button></div>
    </div>
  );
}
