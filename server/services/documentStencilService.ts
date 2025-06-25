import { eq, and, isNull, desc, or } from "drizzle-orm";
import { db } from "../db.js";
import { documentStencils, type InsertDocumentStencil, type DocumentStencil } from "../../shared/schema.js";

export class DocumentStencilService {
  // List all stencils for a firm (or global ones if firmId is null)
  async listStencils(firmId?: number): Promise<DocumentStencil[]> {
    if (firmId) {
      // Get firm-specific stencils AND global stencils
      return await db
        .select()
        .from(documentStencils)
        .where(
          and(
            eq(documentStencils.isActive, true),
            or(
              eq(documentStencils.firmId, firmId),
              isNull(documentStencils.firmId)
            )
          )
        )
        .orderBy(desc(documentStencils.createdAt));
    } else {
      // Admin view: get all global stencils
      return await db
        .select()
        .from(documentStencils)
        .where(
          and(
            eq(documentStencils.isActive, true),
            isNull(documentStencils.firmId)
          )
        )
        .orderBy(desc(documentStencils.createdAt));
    }
  }

  // Get a specific stencil by ID
  async getStencil(id: number): Promise<DocumentStencil | null> {
    const result = await db
      .select()
      .from(documentStencils)
      .where(eq(documentStencils.id, id))
      .limit(1);

    return result[0] || null;
  }

  // Create a new document stencil
  async createStencil(data: {
    firmId?: number;
    name: string;
    fileName: string;
    fullText: string;
    description?: string;
    category?: string;
    uploadedBy: number;
  }): Promise<DocumentStencil> {
    const insertData: InsertDocumentStencil = {
      firmId: data.firmId || null,
      name: data.name,
      fileName: data.fileName,
      fullText: data.fullText,
      description: data.description,
      category: data.category,
      uploadedBy: data.uploadedBy,
      isActive: true,
    };

    const result = await db
      .insert(documentStencils)
      .values(insertData)
      .returning();

    return result[0];
  }

  // Update a document stencil
  async updateStencil(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      category: string;
      isActive: boolean;
    }>
  ): Promise<DocumentStencil | null> {
    const result = await db
      .update(documentStencils)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documentStencils.id, id))
      .returning();

    return result[0] || null;
  }

  // Delete a document stencil (soft delete by setting isActive to false)
  async deleteStencil(id: number): Promise<boolean> {
    const result = await db
      .update(documentStencils)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(documentStencils.id, id))
      .returning();

    return result.length > 0;
  }

  // Search stencils by name or category
  async searchStencils(query: string, firmId?: number): Promise<DocumentStencil[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    return await db
      .select()
      .from(documentStencils)
      .where(
        and(
          eq(documentStencils.isActive, true),
          firmId ? 
            or(
              eq(documentStencils.firmId, firmId),
              isNull(documentStencils.firmId)
            ) : 
            isNull(documentStencils.firmId)
        )
      )
      .orderBy(desc(documentStencils.createdAt));
  }

  // Get stencils by category
  async getStencilsByCategory(category: string, firmId?: number): Promise<DocumentStencil[]> {
    return await db
      .select()
      .from(documentStencils)
      .where(
        and(
          eq(documentStencils.isActive, true),
          eq(documentStencils.category, category),
          firmId ? 
            or(
              eq(documentStencils.firmId, firmId),
              isNull(documentStencils.firmId)
            ) : 
            isNull(documentStencils.firmId)
        )
      )
      .orderBy(desc(documentStencils.createdAt));
  }

  // Get a preview snippet of a stencil (first N characters)
  async getStencilPreview(id: number, maxLength: number = 200): Promise<string | null> {
    const stencil = await this.getStencil(id);
    if (!stencil) return null;

    if (stencil.fullText.length <= maxLength) {
      return stencil.fullText;
    }

    return stencil.fullText.substring(0, maxLength) + "...";
  }
}

export const documentStencilService = new DocumentStencilService();
