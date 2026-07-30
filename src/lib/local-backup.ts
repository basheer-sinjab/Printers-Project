import { exportLocalData, restoreLocalData } from "@/integrations/supabase/client";

type BackupImage = {
  path: string;
  type: string;
  dataUrl: string;
};

type LocalBackup = {
  version: 1;
  exportedAt: string;
  data: Record<string, Record<string, unknown>[]>;
  images: BackupImage[];
};

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function createLocalBackup() {
  const data = await exportLocalData();
  const imagePaths = [...new Set(
    (data.printers ?? [])
      .map((printer) => printer.image_url)
      .filter((path): path is string => typeof path === "string" && path.startsWith("/uploads/printers/")),
  )];

  const images = await Promise.all(
    imagePaths.map(async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`تعذر تضمين الصورة ${path} في النسخة الاحتياطية`);
      const blob = await response.blob();
      return { path, type: blob.type, dataUrl: await blobToDataUrl(blob) };
    }),
  );

  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data, images } satisfies LocalBackup);
}

export async function restoreLocalBackup(file: File) {
  let backup: LocalBackup;
  try {
    backup = JSON.parse(await file.text()) as LocalBackup;
  } catch {
    throw new Error("ملف النسخة الاحتياطية غير صالح");
  }

  if (backup.version !== 1 || !backup.data || !Array.isArray(backup.images)) {
    throw new Error("تنسيق النسخة الاحتياطية غير مدعوم");
  }

  for (const image of backup.images) {
    if (typeof image.path !== "string" || typeof image.dataUrl !== "string") {
      throw new Error("تحتوي النسخة الاحتياطية على صورة غير صالحة");
    }
    const formData = new FormData();
    formData.append("image", await (await fetch(image.dataUrl)).blob(), "backup-image");
    formData.append("path", image.path);
    const response = await fetch("/api/printer-images/restore", { method: "POST", body: formData });
    if (!response.ok) throw new Error((await response.json()).message ?? "تعذر استعادة الصور");
  }

  await restoreLocalData(backup.data);
}
