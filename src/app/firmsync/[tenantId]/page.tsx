import { redirect } from 'next/navigation';

export default function TenantPage({ params }: { params: { tenantId: string } }) {
  redirect(`/firmsync/${params.tenantId}/dashboard`);
}
