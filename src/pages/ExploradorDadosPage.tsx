import { useMemo, useState } from "react";
import { useProtocolos } from "@/hooks/useProtocolos";
import { criticidadeBadgeClass, heatClass } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIPOS = [
  "Casa", "Sobrado", "Geminado", "Edifício", "Comércio",
  "Habite-se", "Alvará", "Consulta", "Certidão", "Desdobro",
  "Unificação", "Desmembramento",
];

type SortKey = "numero_protocolo" | "ano_protocolo" | "tipo_processo" | "dias_sem_movimento" | "data_abertura";

export default function ExploradorDadosPage() {
  const data = useProtocolos();
  const [search, setSearch] = useState("");
  const [filtroAno, setFiltroAno] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroGestao, setFiltroGestao] = useState("todos");
  const [filtroPrazo, setFiltroPrazo] = useState("todos");
  const [sortKey, setSortKey] = useState<SortKey>("dias_sem_movimento");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const anos = useMemo(() => [...new Set(data.map(p => p.ano_protocolo))].sort(), [data]);

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.numero_protocolo.toLowerCase().includes(s) ||
        p.tipo_processo.toLowerCase().includes(s) ||
        p.situacao.toLowerCase().includes(s)
      );
    }
    if (filtroAno !== "todos") result = result.filter(p => p.ano_protocolo === Number(filtroAno));
    if (filtroTipo !== "todos") result = result.filter(p => p.tipo_processo === filtroTipo);
    if (filtroGestao !== "todos") result = result.filter(p => p.gestao === filtroGestao);
    if (filtroPrazo !== "todos") result = result.filter(p => p.status_prazo === filtroPrazo);

    result = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

    return result;
  }, [data, search, filtroAno, filtroTipo, filtroGestao, filtroPrazo, sortKey, sortDir]);

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
          <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} registros</p>

      <div className="rounded-lg border overflow-auto max-h-[68vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("numero_protocolo")}>
                Protocolo{sortIcon("numero_protocolo")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("ano_protocolo")}>
                Ano{sortIcon("ano_protocolo")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("tipo_processo")}>
                Tipo{sortIcon("tipo_processo")}
              </TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("data_abertura")}>
                Abertura{sortIcon("data_abertura")}
              </TableHead>
              <TableHead>Últ. Trâmite</TableHead>
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("dias_sem_movimento")}>
                Dias s/ Mov.{sortIcon("dias_sem_movimento")}
              </TableHead>
              <TableHead>Criticidade</TableHead>
              <TableHead>Gestão</TableHead>
              <TableHead>Passivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 200).map(p => (
              <TableRow key={p.id_protocolo}>
                <TableCell className="font-mono text-sm">{p.numero_protocolo}</TableCell>
                <TableCell>{p.ano_protocolo}</TableCell>
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
                  <Badge variant="outline" className={`text-xs ${criticidadeBadgeClass(p.criticidade_prazo)}`}>
                    {p.criticidade_prazo}
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
