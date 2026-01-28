import ClientWorkspace from './ClientWorkspace';

interface ClientsPageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { tenantId } = await params;
  return <ClientWorkspace tenantId={tenantId} />;
}
