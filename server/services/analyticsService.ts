import { storage } from '../storage.js';
import { db } from '../db.js';
import { documents, documentAnalyses, auditLogs, users } from '@shared/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';

export interface AnalyticsData {
  documentsUploadedThisWeek: number;
  reviewStats: {
    aiReviewed: number;
    humanReviewed: number;
    percentageAiReviewed: number;
  };
  topFlaggedClauses: Array<{
    clause: string;
    count: number;
  }>;
  averageReviewTime: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  mostActiveParalegal: {
    name: string;
    documentCount: number;
  };
  weeklyUploadTrend: Array<{
    date: string;
    count: number;
  }>;
  documentTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
}

export class AnalyticsService {
  static async getFirmAnalytics(firmId: number): Promise<AnalyticsData> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Documents uploaded this week
    const documentsThisWeek = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(
        eq(documents.firmId, firmId),
        gte(documents.uploadedAt, oneWeekAgo)
      ));

    // Review statistics
    const totalDocuments = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(eq(documents.firmId, firmId));

    const analyzedDocuments = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(
        eq(documents.firmId, firmId),
        eq(documents.status, 'analyzed')
      ));

    const aiReviewedCount = analyzedDocuments[0]?.count || 0;
    const totalCount = totalDocuments[0]?.count || 0;
    const humanReviewedCount = totalCount - aiReviewedCount;

    // Top flagged clauses from analyses
    const topClauses = await this.getTopFlaggedClauses(firmId);

    // Average review time calculation
    const avgReviewTime = await this.calculateAverageReviewTime(firmId);

    // Risk distribution
    const riskDistribution = await this.getRiskDistribution(firmId);

    // Most active paralegal
    const mostActive = await this.getMostActiveParalegal(firmId);

    // Weekly upload trend
    const weeklyTrend = await this.getWeeklyUploadTrend(firmId);

    // Document type distribution
    const typeDistribution = await this.getDocumentTypeDistribution(firmId);

    return {
      documentsUploadedThisWeek: documentsThisWeek[0]?.count || 0,
      reviewStats: {
        aiReviewed: aiReviewedCount,
        humanReviewed: humanReviewedCount,
        percentageAiReviewed: totalCount > 0 ? Math.round((aiReviewedCount / totalCount) * 100) : 0,
      },
      topFlaggedClauses: topClauses,
      averageReviewTime: avgReviewTime,
      riskDistribution,
      mostActiveParalegal: mostActive,
      weeklyUploadTrend: weeklyTrend,
      documentTypeDistribution: typeDistribution,
    };
  }

  private static async getTopFlaggedClauses(firmId: number): Promise<Array<{ clause: string; count: number }>> {
    try {
      // Get all risk analyses for the firm
      const riskAnalyses = await db
        .select({
          result: documentAnalyses.result,
        })
        .from(documentAnalyses)
        .innerJoin(documents, eq(documents.id, documentAnalyses.documentId))
        .where(and(
          eq(documents.firmId, firmId),
          eq(documentAnalyses.analysisType, 'risk')
        ));

      const clauseCounts: Record<string, number> = {};

      // Parse analysis results to extract flagged clauses
      riskAnalyses.forEach(analysis => {
        const result = analysis.result as any;
        if (result?.risks && Array.isArray(result.risks)) {
          result.risks.forEach((risk: any) => {
            if (risk.type || risk.clause) {
              const clauseName = risk.type || risk.clause || 'Unknown';
              clauseCounts[clauseName] = (clauseCounts[clauseName] || 0) + 1;
            }
          });
        }
      });

      return Object.entries(clauseCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([clause, count]) => ({ clause, count }));
    } catch (error) {
      console.error('Error getting top flagged clauses:', error);
      return [];
    }
  }

  private static async calculateAverageReviewTime(firmId: number): Promise<number> {
    try {
      const reviewedDocs = await db
        .select({
          uploadedAt: documents.uploadedAt,
          analyzedAt: documents.analyzedAt,
        })
        .from(documents)
        .where(and(
          eq(documents.firmId, firmId),
          eq(documents.status, 'analyzed')
        ));

      if (reviewedDocs.length === 0) return 0;

      const totalMinutes = reviewedDocs.reduce((sum, doc) => {
        if (doc.uploadedAt && doc.analyzedAt) {
          const diff = new Date(doc.analyzedAt).getTime() - new Date(doc.uploadedAt).getTime();
          return sum + (diff / (1000 * 60)); // Convert to minutes
        }
        return sum;
      }, 0);

      return Math.round(totalMinutes / reviewedDocs.length);
    } catch (error) {
      console.error('Error calculating average review time:', error);
      return 0;
    }
  }

  private static async getRiskDistribution(firmId: number) {
    try {
      // Scan review logs for risk levels
      const firmPath = path.join(process.cwd(), 'firms', `firm_${firmId.toString().padStart(3, '0')}`);
      const reviewLogsPath = path.join(firmPath, 'review_logs');
      
      const distribution = { low: 0, medium: 0, high: 0 };

      try {
        const files = await fs.readdir(reviewLogsPath);
        const metaFiles = files.filter(f => f.endsWith('_meta.json'));

        for (const metaFile of metaFiles) {
          const metaPath = path.join(reviewLogsPath, metaFile);
          const metaContent = await fs.readFile(metaPath, 'utf-8');
          const meta = JSON.parse(metaContent);
          
          if (meta.riskLevel) {
            distribution[meta.riskLevel as keyof typeof distribution]++;
          }
        }
      } catch (fsError) {
        // If file system approach fails, use database
        const docs = await db
          .select({ documentType: documents.documentType })
          .from(documents)
          .where(eq(documents.firmId, firmId));

        docs.forEach(doc => {
          // Simple risk classification based on document type
          const type = doc.documentType?.toLowerCase() || '';
          if (type.includes('nda') || type.includes('contract')) {
            distribution.low++;
          } else if (type.includes('lease') || type.includes('employment')) {
            distribution.medium++;
          } else if (type.includes('settlement') || type.includes('litigation')) {
            distribution.high++;
          } else {
            distribution.medium++;
          }
        });
      }

      return distribution;
    } catch (error) {
      console.error('Error getting risk distribution:', error);
      return { low: 0, medium: 0, high: 0 };
    }
  }

  private static async getMostActiveParalegal(firmId: number) {
    try {
      const paralegalActivity = await db
        .select({
          userId: documents.userId,
          count: sql<number>`count(*)`,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(documents)
        .innerJoin(users, eq(users.id, documents.userId))
        .where(and(
          eq(documents.firmId, firmId),
          eq(users.role, 'paralegal')
        ))
        .groupBy(documents.userId, users.firstName, users.lastName)
        .orderBy(desc(sql`count(*)`))
        .limit(1);

      if (paralegalActivity.length > 0) {
        const most = paralegalActivity[0];
        return {
          name: `${most.firstName} ${most.lastName}`,
          documentCount: most.count,
        };
      }

      return { name: 'N/A', documentCount: 0 };
    } catch (error) {
      console.error('Error getting most active paralegal:', error);
      return { name: 'N/A', documentCount: 0 };
    }
  }

  private static async getWeeklyUploadTrend(firmId: number) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyUploads = await db
        .select({
          date: sql<string>`date(${documents.uploadedAt})`,
          count: sql<number>`count(*)`,
        })
        .from(documents)
        .where(and(
          eq(documents.firmId, firmId),
          gte(documents.uploadedAt, sevenDaysAgo)
        ))
        .groupBy(sql`date(${documents.uploadedAt})`)
        .orderBy(sql`date(${documents.uploadedAt})`);

      return dailyUploads.map(day => ({
        date: day.date,
        count: day.count,
      }));
    } catch (error) {
      console.error('Error getting weekly upload trend:', error);
      return [];
    }
  }

  private static async getDocumentTypeDistribution(firmId: number) {
    try {
      const typeDistribution = await db
        .select({
          type: documents.documentType,
          count: sql<number>`count(*)`,
        })
        .from(documents)
        .where(eq(documents.firmId, firmId))
        .groupBy(documents.documentType)
        .orderBy(desc(sql`count(*)`));

      return typeDistribution.map(item => ({
        type: item.type || 'Unknown',
        count: item.count,
      }));
    } catch (error) {
      console.error('Error getting document type distribution:', error);
      return [];
    }
  }
}