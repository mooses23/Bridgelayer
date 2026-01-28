import CasesWorkspace from '@/app/firmsync/[tenantId]/cases/CasesWorkspace';

interface TenantCasesPreviewProps {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantCasesPreview({ params }: TenantCasesPreviewProps) {
  const { tenantId } = await params;
  return <CasesWorkspace tenantId={tenantId} previewMode />;
}
