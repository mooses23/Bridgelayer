import CasesWorkspace from './CasesWorkspace';

interface CasesPageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function CasesPage({ params }: CasesPageProps) {
  const { tenantId } = await params;
  return <CasesWorkspace tenantId={tenantId} />;
}
