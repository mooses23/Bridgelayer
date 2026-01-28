import CalendarWorkspace from './CalendarWorkspace';

interface CalendarPageProps {
  params: { tenantId: string };
}

export default function CalendarPage({ params }: CalendarPageProps) {
  return <CalendarWorkspace tenantId={params.tenantId} />;
}
