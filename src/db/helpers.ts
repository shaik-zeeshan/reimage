import { eq } from "drizzle-orm";
import { db } from ".";
import { filesTable } from "./schema";
import { deleteFileFromBucket } from "../bucket";

export async function getFileFromDatabase(key: string) {
    const files = await db
        .select()
        .from(filesTable)
        .where(eq(filesTable.key, key))
        .limit(1);
    if (!files.length) return;
    return files[0];
}

export async function deleteFile(key: string) {
    const deleted = await deleteFileFromBucket(key);
    if (!deleted) return;

    db.delete(filesTable).where(eq(filesTable.key, key));
}

export async function deleteFiles(_keys: string) { }
