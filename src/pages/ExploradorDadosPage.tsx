import { useMemo, useState } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { criticidadeBadgeClass, heatClass } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortKey = "protocolo" | "ano_abertura" | "tipo_processo" | "dias_sem_movimento" | "data_abertura" | "situacao" | "criticidade";

const CRITICIDADE_ORDER: Record<string, number> = {
  "GRAVÍSSIMO": 6, "CRÍTICO": 5, "ATRASADO": 4, "LIMITE SLA": 3, "ATENÇÃO": 2, "RECENTE": 1,
};

export default function ExploradorDadosPage() {
  const data = useProtocolos();
  const [search, setSearch] = useState("");
  const [filtroAno, setFiltroAno] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroGestao, setFiltroGestao] = useState("todos");
  const [filtroPrazo, setFiltroPrazo] = useState("todos");
  const [filtroCriticidade, setFiltroCriticidade] = useState("todos");
  const [filtroPassivo, setFiltroPassivo] = useState("todos");
  const [sortKey, setSortKey] = useState<SortKey>("dias_sem_movimento");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const anos = useMemo(() => [...new Set(data.map(p => p.ano_abertura))].sort(), [data]);
  const tipos = useMemo(() => [...new Set(data.map(p => p.tipo_processo))].sort(), [data]);

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.protocolo.toLowerCase().includes(s) ||
        p.tipo_processo.toLowerCase().includes(s) ||
        p.situacao.toLowerCase().includes(s)
      );
    }
    if (filtroAno !== "todos") result = result.filter(p => p.ano_abertura === Number(filtroAno));
    if (filtroTipo !== "todos") result = result.filter(p => p.tipo_processo === filtroTipo);
    if (filtroGestao !== "todos") result = result.filter(p => p.gestao === filtroGestao);
    if (filtroPrazo !== "todos") result = result.filter(p => p.status_prazo === filtroPrazo);
    if (filtroCriticidade !== "todos") result = result.filter(p => p.criticidade === filtroCriticidade);
    if (filtroPassivo !== "todos") result = result.filter(p => filtroPassivo === "sim" ? p.passivo_herdado : !p.passivo_herdado);

    result = [...result].sort((a, b) => {
      if (sortKey === "criticidade") {
        const diff = (CRITICIDADE_ORDER[b.criticidade] || 0) - (CRITICIDADE_ORDER[a.criticidade] || 0);
        return sortDir === "asc" ? -diff : diff;
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

    return result;
  }, [data, search, filtroAno, filtroTipo, filtroGestao, filtroPrazo, filtroCriticidade, filtroPassivo, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Explorador de Dados</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar protocolo, tipo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-60"
        />
        <Select value={filtroAno} onValueChange={setFiltroAno}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroGestao} onValueChange={setFiltroGestao}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Gestão" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="GESTÃO ATUAL">Atual</SelectItem>
            <SelectItem value="GESTÃO ANTERIOR">Anterior</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPrazo} onValueChange={setFiltroPrazo}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Prazo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="NO PRAZO">No Prazo</SelectItem>
            <SelectItem value="ATRASADO">Atrasado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroCriticidade} onValueChange={setFiltroCriticidade}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Criticidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="RECENTE">Recente</SelectItem>
            <SelectItem value="ATENÇÃO">Atenção</SelectItem>
            <SelectItem value="LIMITE SLA">Limite SLA</SelectItem>
            <SelectItem value="ATRASADO">Atrasado</SelectItem>
            <SelectItem value="CRÍTICO">Crítico</SelectItem>
            <SelectItem value="GRAVÍSSIMO">Gravíssimo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPassivo} onValueChange={setFiltroPassivo}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Passivo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="sim">Sim</SelectItem>
            <SelectItem value="nao">Não</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} registros</p>

      <div className="rounded-lg border overflow-auto max-h-[68vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("protocolo")}>
                Protocolo{sortIcon("protocolo")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("ano_abertura")}>
                Ano{sortIcon("ano_abertura")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("tipo_processo")}>
                Tipo{sortIcon("tipo_processo")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("situacao")}>
                Situação{sortIcon("situacao")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("data_abertura")}>
                Abertura{sortIcon("data_abertura")}
              </TableHead>
              <TableHead>Últ. Trâmite</TableHead>
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("dias_sem_movimento")}>
                Dias s/ Mov.{sortIcon("dias_sem_movimento")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("criticidade")}>
                Criticidade{sortIcon("criticidade")}
              </TableHead>
              <TableHead>Gestão</TableHead>
              <TableHead>Passivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 200).map(p => (
              <TableRow key={p.id_protocolo}>
                <TableCell className="font-mono text-sm">{p.protocolo}</TableCell>
                <TableCell>{p.ano_abertura}</TableCell>
                <TableCell>{p.tipo_processo}</TableCell>
                <TableCell>{p.situacao}</TableCell>
                <TableCell className="text-sm">{p.data_abertura}</TableCell>
                <TableCell className="text-sm">{p.data_ultimo_tramite}</TableCell>
                <TableCell className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${heatClass(p.dias_sem_movimento)}`}>
                    {p.dias_sem_movimento}
                  </span>
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
                <TableCell>
                  {p.passivo_herdado && <Badge variant="destructive" className="text-xs">Sim</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
