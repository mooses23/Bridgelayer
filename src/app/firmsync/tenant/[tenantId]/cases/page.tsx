import CasesWorkspace from '@/app/firmsync/[tenantId]/cases/CasesWorkspace';

interface TenantCasesPreviewProps {
  params: { tenantId: string };
}

export default function TenantCasesPreview({ params }: TenantCasesPreviewProps) {
  return <CasesWorkspace tenantId={params.tenantId} previewMode />;
}
