import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrinterImage } from "@/components/PrinterImage";
import { PrinterFormDialog, useLookups } from "@/components/PrinterFormDialog";
import { TonerHistoryTab } from "@/components/printer/TonerHistoryTab";
import { MaintenanceTab } from "@/components/printer/MaintenanceTab";
import { TransfersTab } from "@/components/printer/TransfersTab";
import { PRINTER_STATUS, STATUS_CLASS, formatDate, type PrinterStatus } from "@/lib/pms";
import { ArrowRight, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/printers/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الطابعة — PrintersFloss" },
      { name: "description", content: "بيانات الطابعة وسجل الأحبار والصيانة والنقل." },
      { property: "og:title", content: "تفاصيل الطابعة — PrintersFloss" },
      { property: "og:description", content: "بيانات الطابعة وسجل الأحبار والصيانة والنقل." },
    ],
  }),
  component: PrinterDetails,
});

function PrinterDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: lookups } = useLookups();
  const [editOpen, setEditOpen] = useState(false);

  const { data: printer, isLoading } = useQuery({
    queryKey: ["printer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("printers").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("printers")
        .update({ is_favorite: !printer?.is_favorite })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("printers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف الطابعة");
      navigate({ to: "/printers" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">جارٍ التحميل…</p>;
  if (!printer)
    return (
      <div className="surface-panel p-12 text-center">
        <p className="text-muted-foreground">الطابعة غير موجودة.</p>
        <Link to="/printers" className="mt-4 inline-block text-primary underline">
          العودة للقائمة
        </Link>
      </div>
    );

  const nameOf = (list: { id: string; name: string }[] | undefined, key: string | null) =>
    list?.find((x) => x.id === key)?.name ?? "—";

  const info: [string, string][] = [
    ["رقم الأصل", printer.asset_id],
    ["الرقم التسلسلي", printer.serial_number || "—"],
    ["الشركة المصنّعة", printer.manufacturer || "—"],
    ["الموديل", printer.model || "—"],
    ["الفرع", nameOf(lookups?.branches, printer.branch_id)],
    ["القسم", nameOf(lookups?.departments, printer.department_id)],
    ["الشخص المسؤول", nameOf(lookups?.persons, printer.responsible_person_id)],
    ["عنوان IP", printer.ip_address || "—"],
    ["تاريخ الشراء", formatDate(printer.purchase_date)],
    ["انتهاء الضمان", formatDate(printer.warranty_expiry)],
    ["ملاحظات", printer.notes || "—"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/printers">
            <Button variant="ghost" size="icon">
              <ArrowRight className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {printer.name}
              <Badge variant="outline" className={STATUS_CLASS[printer.status as PrinterStatus]}>
                {PRINTER_STATUS[printer.status as PrinterStatus]}
              </Badge>
            </h1>
            <p className="font-mono text-sm text-muted-foreground" dir="ltr">
              {printer.asset_id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toggleFavorite.mutate()}>
            <Star className={`size-4 ${printer.is_favorite ? "fill-warning text-warning" : ""}`} />
            {printer.is_favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            تعديل
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-destructive"
            onClick={() => {
              if (confirm("هل تريد حذف هذه الطابعة وكل سجلاتها؟")) remove.mutate();
            }}
          >
            <Trash2 className="size-4" />
            حذف
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">البيانات الأساسية</TabsTrigger>
          <TabsTrigger value="toner">سجل الأحبار</TabsTrigger>
          <TabsTrigger value="maintenance">سجل الصيانة</TabsTrigger>
          <TabsTrigger value="transfers">سجل النقل</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="surface-panel overflow-hidden lg:col-span-1">
              <PrinterImage path={printer.image_url} alt={printer.name} className="h-64 w-full" />
            </div>
            <dl className="surface-panel grid gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:col-span-2">
              {info.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="toner" className="mt-4">
          <TonerHistoryTab printerId={printer.id} />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <MaintenanceTab printerId={printer.id} />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <TransfersTab printer={printer} />
        </TabsContent>

      </Tabs>

      <PrinterFormDialog open={editOpen} onOpenChange={setEditOpen} printer={printer} />
    </div>
  );
}
