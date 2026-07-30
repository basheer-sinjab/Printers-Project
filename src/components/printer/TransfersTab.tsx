import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/DateInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeftRight } from "lucide-react";
import { formatDate, today } from "@/lib/pms";
import { useLookups } from "@/components/PrinterFormDialog";
import { toast } from "sonner";

type Printer = {
  id: string;
  branch_id: string | null;
  department_id: string | null;
  responsible_person_id: string | null;
};

export function TransfersTab({ printer }: { printer: Printer }) {
  const qc = useQueryClient();
  const { data: lookups } = useLookups();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today());
  const [branch, setBranch] = useState("");
  const [dept, setDept] = useState("");
  const [person, setPerson] = useState("");
  const [reason, setReason] = useState("");

  const { data: transfers } = useQuery({
    queryKey: ["transfers", printer.id],
    queryFn: async () =>
      (
        await supabase
          .from("printer_transfers")
          .select("*")
          .eq("printer_id", printer.id)
          .order("transfer_date", { ascending: false })
      ).data ?? [],
  });


  const save = useMutation({
    mutationFn: async () => {
      const deptName = lookups?.departments.find((d) => d.id === dept)?.name ?? null;
      const personName = lookups?.persons.find((x) => x.id === person)?.name ?? null;
      const { error } = await supabase.from("printer_transfers").insert({
        printer_id: printer.id,
        transfer_date: date,
        old_department: lookups?.departments.find((d) => d.id === printer.department_id)?.name ?? null,
        old_person: lookups?.persons.find((x) => x.id === printer.responsible_person_id)?.name ?? null,
        new_department: deptName,
        new_person: personName,
        notes: reason || null,
      });
      if (error) throw error;
      const { error: upErr } = await supabase
        .from("printers")
        .update({
          branch_id: branch || printer.branch_id,
          department_id: dept || printer.department_id,
          responsible_person_id: person || printer.responsible_person_id,
        })
        .eq("id", printer.id);
      if (upErr) throw upErr;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم تسجيل النقل وتحديث موقع الطابعة");
      setOpen(false);
      setReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            setBranch(printer.branch_id ?? "");
            setDept(printer.department_id ?? "");
            setPerson(printer.responsible_person_id ?? "");
            setDate(today());
            setOpen(true);
          }}
        >
          <ArrowLeftRight className="size-4" />
          نقل الطابعة
        </Button>
      </div>

      <div className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">من</TableHead>
              <TableHead className="text-right">إلى</TableHead>
              <TableHead className="text-right">السبب</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(transfers ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  لا توجد عمليات نقل.
                </TableCell>
              </TableRow>
            )}
            {(transfers ?? []).map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDate(t.transfer_date)}</TableCell>
                <TableCell>
                  {t.old_department || "—"}
                  <div className="text-xs text-muted-foreground">{t.old_person || "—"}</div>
                </TableCell>
                <TableCell>
                  {t.new_department || "—"}
                  <div className="text-xs text-muted-foreground">{t.new_person || "—"}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.notes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>نقل الطابعة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>تاريخ النقل</Label>
              <DateInput value={date} onChange={setDate} />
            </div>
            <Picker label="الفرع الجديد" value={branch} onChange={setBranch} options={lookups?.branches} />
            <Picker label="القسم الجديد" value={dept} onChange={setDept} options={lookups?.departments} />
            <Picker label="المسؤول الجديد" value={person} onChange={setPerson} options={lookups?.persons} />
            <div className="space-y-2">
              <Label>سبب النقل</Label>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              حفظ النقل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="اختر" />
        </SelectTrigger>
        <SelectContent>
          {(options ?? []).map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
