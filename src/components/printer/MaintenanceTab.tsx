import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/DateInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { formatDate, today, MAINTENANCE_TYPES, type MaintenanceType } from "@/lib/pms";
import { toast } from "sonner";

export function MaintenanceTab({ printerId }: { printerId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [type, setType] = useState<MaintenanceType>("repair");
  const [description, setDescription] = useState("");
  const [technician, setTechnician] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [newPart, setNewPart] = useState("");

  const { data: parts } = useQuery({
    queryKey: ["parts"],
    queryFn: async () => (await supabase.from("parts").select("*").order("name")).data ?? [],
  });

  const { data: records } = useQuery({
    queryKey: ["maintenance", printerId],
    queryFn: async () =>
      (
        await supabase
          .from("maintenance_records")
          .select("*")
          .eq("printer_id", printerId)
          .order("service_date", { ascending: false })
      ).data ?? [],
  });

  function reset() {
    setEditId(null);
    setDate(today());
    setType("repair");
    setDescription("");
    setTechnician("");
    setSelectedParts([]);
    setNewPart("");
  }

  const addPart = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("parts").insert({ name });
      if (error) throw error;
    },
    onSuccess: (_d, name) => {
      qc.invalidateQueries({ queryKey: ["parts"] });
      setSelectedParts((p) => [...p, name]);
      setNewPart("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        printer_id: printerId,
        service_date: date,
        maintenance_type: type,
        description: description || null,
        technician: technician || null,
        replaced_parts: selectedParts,
      };
      if (editId) {
        const { error } = await supabase.from("maintenance_records").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("maintenance_records").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم حفظ سجل الصيانة");
      setOpen(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("maintenance_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("تم حذف السجل");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          إضافة صيانة
        </Button>
      </div>

      <div className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">نوع الصيانة</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">القطع المستبدلة</TableHead>
              <TableHead className="text-right">الفني</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(records ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  لا توجد سجلات صيانة.
                </TableCell>
              </TableRow>
            )}
            {(records ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{formatDate(r.service_date)}</TableCell>
                <TableCell>{MAINTENANCE_TYPES[r.maintenance_type as MaintenanceType]}</TableCell>
                <TableCell className="max-w-xs text-muted-foreground">{r.description || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(r.replaced_parts ?? []).length === 0
                      ? "—"
                      : r.replaced_parts.map((p) => (
                          <Badge key={p} variant="secondary">
                            {p}
                          </Badge>
                        ))}
                  </div>
                </TableCell>
                <TableCell>{r.technician || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditId(r.id);
                        setDate(r.service_date);
                        setType(r.maintenance_type as MaintenanceType);
                        setDescription(r.description ?? "");
                        setTechnician(r.technician ?? "");
                        setSelectedParts(r.replaced_parts ?? []);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل سجل صيانة" : "إضافة سجل صيانة"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <DateInput value={date} onChange={setDate} />
            </div>
            <div className="space-y-2">
              <Label>نوع الصيانة</Label>
              <Select value={type} onValueChange={(v) => setType(v as MaintenanceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MAINTENANCE_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>الوصف</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>الفني</Label>
              <Input value={technician} onChange={(e) => setTechnician(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>القطع المستبدلة</Label>
              <div className="flex flex-wrap gap-2">
                {selectedParts.map((p) => (
                  <Badge key={p} variant="secondary" className="gap-1">
                    {p}
                    <button onClick={() => setSelectedParts((arr) => arr.filter((x) => x !== p))}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select
                value=""
                onValueChange={(v) => setSelectedParts((arr) => (arr.includes(v) ? arr : [...arr, v]))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر قطعة من المكتبة" />
                </SelectTrigger>
                <SelectContent>
                  {(parts ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="إضافة قطعة جديدة للمكتبة"
                  value={newPart}
                  onChange={(e) => setNewPart(e.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={!newPart.trim()}
                  onClick={() => addPart.mutate(newPart.trim())}
                >
                  إضافة
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
