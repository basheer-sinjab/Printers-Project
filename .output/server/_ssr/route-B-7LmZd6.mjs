import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as FileText, f as Printer, g as LayoutDashboard, i as Truck, u as Settings, v as Droplets } from "../_libs/lucide-react.mjs";
import { d as Outlet, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-B-7LmZd6.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "لوحة التحكم",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/printers",
		label: "الطابعات",
		icon: Printer,
		exact: false
	},
	{
		to: "/toners",
		label: "مخزون الأحبار",
		icon: Droplets,
		exact: false
	},
	{
		to: "/suppliers",
		label: "الموردون",
		icon: Truck,
		exact: false
	},
	{
		to: "/reports",
		label: "التقارير",
		icon: FileText,
		exact: false
	},
	{
		to: "/settings",
		label: "الإعدادات",
		icon: Settings,
		exact: false
	}
];
function AppLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "no-print sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-l border-sidebar-border/70 bg-sidebar text-sidebar-foreground lg:flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-6 py-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/printersfloss-logo.png",
					alt: "PrintersFloss",
					className: "size-11 shrink-0 object-contain"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-bold leading-tight",
					children: "PrintersFloss"
				}) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 space-y-1 px-4",
				children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					activeOptions: { exact: item.exact },
					className: "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground data-[status=active]:shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-[18px]" }), item.label]
				}, item.to))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "no-print flex items-center justify-between gap-4 border-b bg-card px-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex min-w-0 items-center gap-2 overflow-x-auto lg:hidden",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						activeOptions: { exact: item.exact },
						className: "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground",
						children: item.label
					}, item.to))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/printersfloss-header-logo.png",
					alt: "PrintersFloss",
					className: "size-10 shrink-0 object-contain"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 px-5 py-7 lg:px-10 lg:py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})]
		})]
	});
}
//#endregion
export { AppLayout as component };
