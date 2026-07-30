import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { LayoutDashboard, Printer, Droplets, Truck, Settings, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AppLayout,
});

const NAV = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { to: "/printers", label: "الطابعات", icon: Printer, exact: false },
  { to: "/toners", label: "مخزون الأحبار", icon: Droplets, exact: false },
  { to: "/suppliers", label: "الموردون", icon: Truck, exact: false },
  { to: "/reports", label: "التقارير", icon: FileText, exact: false },
  { to: "/settings", label: "الإعدادات", icon: Settings, exact: false },
] as const;

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="no-print sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-l border-sidebar-border/70 bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 px-6 py-7">
          <img src="/printersfloss-logo.png" alt="PrintersFloss" className="size-11 shrink-0 object-contain" />
          <div><p className="text-base font-bold leading-tight">PrintersFloss</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {NAV.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: item.exact }} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground data-[status=active]:shadow-sm"><item.icon className="size-[18px]" />{item.label}</Link>)}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center justify-between gap-4 border-b bg-card px-4 py-2">
          <nav className="flex min-w-0 items-center gap-2 overflow-x-auto lg:hidden">
            {NAV.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: item.exact }} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground">{item.label}</Link>)}
          </nav>
          <img src="/printersfloss-header-logo.png" alt="PrintersFloss" className="size-10 shrink-0 object-contain" />
        </header>
        <main className="flex-1 px-5 py-7 lg:px-10 lg:py-10"><Outlet /></main>
      </div>
    </div>
  );
}
