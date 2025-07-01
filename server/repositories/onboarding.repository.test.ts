import { OnboardingRepository } from './onboarding.repository';
import { db } from '../db';
import { firms } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('OnboardingRepository', () => {
  const onboardingRepository = new OnboardingRepository();

  beforeAll(async () => {
    await db.insert(firms).values({
      id: 2,
      name: 'Onboarding Firm',
      slug: 'onboarding-firm',
      onboarded: false
    });
  });

  afterAll(async () => {
    await db.delete(firms).where(eq(firms.id, 2));
  });

  it('should update onboarding status', async () => {
    await onboardingRepository.updateOnboardingStatus(2, true);
    const firm = await db.select().from(firms).where(eq(firms.id, 2));
    expect(firm[0].onboarded).toBe(true);
  });

  it('should retrieve onboarding status', async () => {
    const status = await onboardingRepository.getOnboardingStatus(2);
    expect(status).toBe(true);
  });
});
