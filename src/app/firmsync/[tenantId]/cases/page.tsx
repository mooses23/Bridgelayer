import CasesWorkspace from './CasesWorkspace';

interface CasesPageProps {
  params: { tenantId: string };
}

export default function CasesPage({ params }: CasesPageProps) {
  return <CasesWorkspace tenantId={params.tenantId} />;
}
