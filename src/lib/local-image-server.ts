import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { randomUUID } from "node:crypto";

const UPLOADS_PATH = "/uploads/printers/";
const UPLOADS_DIRECTORY = join(process.cwd(), "uploads", "printers");
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const mimeTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function getFilename(path: string) {
  if (!path.startsWith(UPLOADS_PATH)) return null;
  const filename = path.slice(UPLOADS_PATH.length);
  return filename && basename(filename) === filename ? filename : null;
}

function extensionFor(file: File) {
  const extension = extname(file.name).toLowerCase();
  if (mimeTypes[extension]) return extension;
  return Object.entries(mimeTypes).find(([, mimeType]) => mimeType === file.type)?.[0] ?? null;
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ message }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}

async function saveImage(file: File, requestedPath?: string) {
  if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
    throw new Error("يجب اختيار صورة لا يتجاوز حجمها 10 ميغابايت");
  }

  const extension = extensionFor(file);
  if (!extension) throw new Error("صيغة الصورة غير مدعومة");

  const requestedFilename = requestedPath ? getFilename(requestedPath) : null;
  if (requestedPath && !requestedFilename) throw new Error("مسار الصورة غير صالح");

  const filename = requestedFilename ?? `${randomUUID()}${extension}`;
  await mkdir(UPLOADS_DIRECTORY, { recursive: true });
  await writeFile(join(UPLOADS_DIRECTORY, filename), Buffer.from(await file.arrayBuffer()));
  return `${UPLOADS_PATH}${filename}`;
}

export async function handleLocalImageRequest(request: Request) {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname.startsWith(UPLOADS_PATH)) {
    const filename = getFilename(url.pathname);
    if (!filename) return new Response("Not found", { status: 404 });

    try {
      const extension = extname(filename).toLowerCase();
      const contentType = mimeTypes[extension];
      if (!contentType) return new Response("Not found", { status: 404 });
      const image = await readFile(join(UPLOADS_DIRECTORY, filename));
      return new Response(image, {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
          "content-type": contentType,
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  if (url.pathname === "/api/printer-images" && request.method === "POST") {
    try {
      const image = (await request.formData()).get("image");
      if (!(image instanceof File)) return badRequest("لم يتم اختيار صورة");
      return Response.json({ path: await saveImage(image) }, { status: 201 });
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "تعذر رفع الصورة");
    }
  }

  if (url.pathname === "/api/printer-images/restore" && request.method === "POST") {
    try {
      const formData = await request.formData();
      const image = formData.get("image");
      const path = formData.get("path");
      if (!(image instanceof File) || typeof path !== "string") return badRequest("بيانات الاستعادة غير صالحة");
      return Response.json({ path: await saveImage(image, path) });
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "تعذر استعادة الصورة");
    }
  }

  if (url.pathname === "/api/printer-images" && request.method === "DELETE") {
    const filename = getFilename(url.searchParams.get("path") ?? "");
    if (!filename) return badRequest("مسار الصورة غير صالح");

    try {
      await unlink(join(UPLOADS_DIRECTORY, filename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return new Response(null, { status: 204 });
  }

  return null;
}
