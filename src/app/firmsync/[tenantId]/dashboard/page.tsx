import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import type { PortalPageConfiguration } from "@/types";

import DashboardShell from "./DashboardShell";

interface DashboardPageProps {
  params: { tenantId: string };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("portal_layouts")
    .select("configuration")
    .eq("tenant_id", params.tenantId)
    .eq("page_slug", "dashboard")
    .single();

  const configuration = !error && data?.configuration ? (data.configuration as PortalPageConfiguration) : null;

  return <DashboardShell configuration={configuration} />;
}
