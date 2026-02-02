import CalendarWorkspace from './CalendarWorkspace';

interface CalendarPageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { tenantId } = await params;
  return <CalendarWorkspace tenantId={tenantId} />;
}
