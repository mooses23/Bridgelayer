import ParalegalWorkspace from './ParalegalWorkspace';

interface ParalegalPlusPageProps {
  params: { tenantId: string };
}

export default function ParalegalPlusPage({ params }: ParalegalPlusPageProps) {
  return <ParalegalWorkspace tenantId={params.tenantId} />;
}
