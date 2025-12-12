import ClientWorkspace from '@/app/firmsync/[tenantId]/clients/ClientWorkspace';

interface ClientsPageProps {
  params: {
    tenantId: string;
  };
}

export default function TenantClientsPreview({ params }: ClientsPageProps) {
  return <ClientWorkspace tenantId={params.tenantId} previewMode />;
}
