import { FirmRepository } from './firm.repository';
import { db } from '../db';
import { firms } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('FirmRepository', () => {
  const firmRepository = new FirmRepository();

  beforeAll(async () => {
    await db.insert(firms).values({
      id: 1,
      name: 'Test Firm',
      slug: 'test-firm',
      onboarded: false
    });
  });

  afterAll(async () => {
    await db.delete(firms).where(eq(firms.id, 1));
  });

  it('should find a firm by ID', async () => {
    const firm = await firmRepository.findById(1);
    expect(firm).toBeDefined();
    expect(firm?.name).toBe('Test Firm');
  });

  it('should find a firm by slug', async () => {
    const firm = await firmRepository.findBySlug('test-firm');
    expect(firm).toBeDefined();
    expect(firm?.slug).toBe('test-firm');
  });

  it('should return undefined for non-existent firm', async () => {
    const firm = await firmRepository.findBySlug('nonexistent-firm');
    expect(firm).toBeUndefined();
  });
});
