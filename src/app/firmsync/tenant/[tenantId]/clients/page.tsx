import ClientWorkspace from '@/app/firmsync/[tenantId]/clients/ClientWorkspace';

interface ClientsPageProps {
  params: Promise<{
    tenantId: string;
  }>;
}

export default async function TenantClientsPreview({ params }: ClientsPageProps) {
  const { tenantId } = await params;
  return <ClientWorkspace tenantId={tenantId} previewMode />;
}
