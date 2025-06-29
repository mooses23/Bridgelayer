import {
  type Firm,
  type InsertFirm,
  type FirmAnalysisSettings,
  type InsertFirmAnalysisSettings,
  type FirmBillingSettings,
  type InsertFirmBillingSettings,
  firms,
  firmAnalysisSettings,
  firmBillingSettings,
} from "../../shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export class FirmStorage {
  // Firm management
  async createFirm(insertFirm: InsertFirm): Promise<Firm> {
    const [firm] = await db
      .insert(firms)
      .values(insertFirm)
      .returning();
    return firm;
  }

  async getFirm(id: number): Promise<Firm | undefined> {
    const [firm] = await db.select().from(firms).where(eq(firms.id, id));
    return firm || undefined;
  }

  async getFirmById(id: number): Promise<Firm | undefined> {
    return this.getFirm(id);
  }

  async getFirmBySlug(slug: string): Promise<Firm | undefined> {
    const [firm] = await db.select().from(firms).where(eq(firms.slug, slug));
    return firm || undefined;
  }

  async updateFirm(id: number, updates: Partial<Firm>): Promise<Firm | undefined> {
    const [firm] = await db
      .update(firms)
      .set(updates)
      .where(eq(firms.id, id))
      .returning();
    return firm || undefined;
  }

  async getAllFirms(): Promise<Firm[]> {
    return await db.select().from(firms).orderBy(firms.name);
  }

  // Firm analysis settings
  async getFirmAnalysisSettings(firmId: number): Promise<FirmAnalysisSettings | undefined> {
    const [settings] = await db
      .select()
      .from(firmAnalysisSettings)
      .where(eq(firmAnalysisSettings.firmId, firmId));
    return settings || undefined;
  }

  async updateFirmAnalysisSettings(firmId: number, updates: Partial<FirmAnalysisSettings>): Promise<FirmAnalysisSettings> {
    const [settings] = await db
      .update(firmAnalysisSettings)
      .set(updates)
      .where(eq(firmAnalysisSettings.firmId, firmId))
      .returning();
    return settings;
  }

  async createFirmAnalysisSettings(insertSettings: InsertFirmAnalysisSettings): Promise<FirmAnalysisSettings> {
    const [settings] = await db
      .insert(firmAnalysisSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  // Firm billing settings
  async getFirmBillingSettings(firmId: number): Promise<FirmBillingSettings | undefined> {
    const [settings] = await db
      .select()
      .from(firmBillingSettings)
      .where(eq(firmBillingSettings.firmId, firmId));
    return settings || undefined;
  }

  async createFirmBillingSettings(insertSettings: InsertFirmBillingSettings): Promise<FirmBillingSettings> {
    const [settings] = await db
      .insert(firmBillingSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateFirmBillingSettings(firmId: number, updates: Partial<FirmBillingSettings>): Promise<FirmBillingSettings | undefined> {
    const [settings] = await db
      .update(firmBillingSettings)
      .set(updates)
      .where(eq(firmBillingSettings.firmId, firmId))
      .returning();
    return settings || undefined;
  }
}
