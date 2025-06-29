import {
  type Folder,
  type InsertFolder,
  folders,
} from "../../shared/schema";
import { db } from "../db";
import { eq, and } from "drizzle-orm";

export class FolderStorage {
  // Folder management
  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const [folder] = await db
      .insert(folders)
      .values(insertFolder)
      .returning();
    return folder;
  }

  async getFirmFolders(firmId: number): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.firmId, firmId));
  }

  async getFolderById(id: number, firmId: number): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.firmId, firmId)));
    return folder || undefined;
  }

  async updateFolder(id: number, updates: Partial<Folder>): Promise<Folder | undefined> {
    const [folder] = await db
      .update(folders)
      .set(updates)
      .where(eq(folders.id, id))
      .returning();
    return folder || undefined;
  }

  async deleteFolder(id: number, firmId: number): Promise<boolean> {
    const result = await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.firmId, firmId)));
    return (result.rowCount ?? 0) > 0;
  }
}
