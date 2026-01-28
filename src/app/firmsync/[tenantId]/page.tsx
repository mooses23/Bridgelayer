import { redirect } from 'next/navigation';

export default async function TenantPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  redirect(`/firmsync/${tenantId}/dashboard`);
}
