import {
  LayoutDashboard, AlertTriangle, Radar, ShieldCheck, Database, Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppConfig } from "@/lib/config";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Fila Crítica", url: "/fila-critica", icon: AlertTriangle },
  { title: "Radar Operacional", url: "/radar", icon: Radar },
  { title: "Qualidade da Base", url: "/qualidade", icon: ShieldCheck },
  { title: "Explorador de Dados", url: "/explorador", icon: Database },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { config, setConfig } = useAppConfig();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="p-4 pb-2">
            <h2 className="text-lg font-bold text-sidebar-primary-foreground">SEPLAN</h2>
            <p className="text-xs text-sidebar-foreground/60">Dashboard Analítico</p>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <>
            <Separator className="my-2 bg-sidebar-border" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50">
                <Settings className="h-3 w-3 mr-1 inline" /> Configuração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 space-y-3">
                  <div>
                    <Label className="text-xs text-sidebar-foreground/70">SLA (dias)</Label>
                    <Input
                      type="number"
                      value={config.slaDias}
                      onChange={e => setConfig({ ...config, slaDias: Number(e.target.value) || 30 })}
                      className="h-8 text-sm bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-sidebar-foreground/70">Ano início gestão</Label>
                    <Input
                      type="number"
                      value={config.anoInicioGestao}
                      onChange={e => setConfig({ ...config, anoInicioGestao: Number(e.target.value) || 2025 })}
                      className="h-8 text-sm bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                    />
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
