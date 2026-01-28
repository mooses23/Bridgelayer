// src/app/firmsync/[tenantId]/paralegal-plus/page.tsx
// AI-powered paralegal assistance - Document review, legal research, and automated workflows

import ParalegalWorkspace from './ParalegalWorkspace';

interface ParalegalPlusPageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function ParalegalPlusPage({ params }: ParalegalPlusPageProps) {
  const { tenantId } = await params;
  return <ParalegalWorkspace tenantId={tenantId} />;
}
