import { t as cn } from "./utils-0-yik925.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as resolveImage } from "./pms-ALghGJ54.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { f as Printer } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PrinterImage-WihmddPu.js
var import_jsx_runtime = require_jsx_runtime();
function PrinterImage({ path, alt, className }) {
	const { data } = useQuery({
		queryKey: ["img", path],
		queryFn: () => resolveImage(path),
		enabled: !!path,
		staleTime: 18e5
	});
	if (!path || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center justify-center bg-secondary text-muted-foreground", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-10 opacity-40" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: data,
		alt,
		loading: "lazy",
		className: cn("object-cover", className)
	});
}
//#endregion
export { PrinterImage as t };
