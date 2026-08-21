import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50/40">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b px-4 bg-white/90 backdrop-blur shrink-0">
            <SidebarTrigger className="mr-3" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">SEPLAN</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm text-muted-foreground">Gestão à Vista</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
