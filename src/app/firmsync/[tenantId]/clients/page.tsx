import ClientWorkspace from './ClientWorkspace';

interface ClientsPageProps {
  params: { tenantId: string };
}

export default function ClientsPage({ params }: ClientsPageProps) {
  return <ClientWorkspace tenantId={params.tenantId} />;
}
