import { del, get, put } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// All CV file handling lives in this one file, so switching storage provider
// later (e.g. Cloudflare R2) means changing only this file.
//
// Production: a PRIVATE Vercel Blob store (files can't be opened by URL).
// Local dev with no BLOB_READ_WRITE_TOKEN: files go to ./.uploads (git-ignored).
const useLocalDisk = process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN;

const LOCAL_DIR = path.resolve(process.cwd(), ".uploads");

function localPath(key: string) {
  const full = path.resolve(LOCAL_DIR, key);
  if (!full.startsWith(LOCAL_DIR + path.sep)) throw new Error("Invalid path");
  return full;
}

/** Saves the file and returns the storage pathname to keep in the database. */
export async function saveCv(key: string, file: File): Promise<string> {
  if (useLocalDisk) {
    const full = localPath(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, Buffer.from(await file.arrayBuffer()));
    return key;
  }
  const blob = await put(key, file, { access: "private", addRandomSuffix: true });
  return blob.pathname;
}

/** Returns the file contents, or null if it can't be found. */
export async function readCv(pathname: string): Promise<BodyInit | null> {
  if (useLocalDisk) {
    try {
      return new Uint8Array(await readFile(localPath(pathname)));
    } catch {
      return null;
    }
  }
  const result = await get(pathname, { access: "private" });
  if (result?.statusCode !== 200) return null;
  return result.stream;
}

/** Best-effort delete (used to clean up if saving the application fails). */
export async function deleteCv(pathname: string): Promise<void> {
  try {
    if (useLocalDisk) {
      await unlink(localPath(pathname));
    } else {
      await del(pathname);
    }
  } catch (error) {
    console.error("Could not delete CV file", error);
  }
}
