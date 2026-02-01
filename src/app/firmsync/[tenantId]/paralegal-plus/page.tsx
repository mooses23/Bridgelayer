// src/app/firmsync/[tenantId]/paralegal-plus/page.tsx
// AI-powered paralegal assistance - Document review, legal research, and automated workflows

import { ParalegalWorkspace } from './ParalegalWorkspace';

interface ParalegalPlusPageProps {
  params: { tenantId: string };
}

export default function ParalegalPlusPage({ params }: ParalegalPlusPageProps) {
  return <ParalegalWorkspace tenantId={params.tenantId} />;
}
