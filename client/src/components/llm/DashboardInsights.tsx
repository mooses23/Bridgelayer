import React from 'react';
import { useQuery } from '@tanstack/react-query';
import llmApi from '@/lib/llmApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DashboardInsights() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['insights', 'dashboard'],
    queryFn: () => llmApi.getInsights('dashboard')
  });

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent>Error loading dashboard insights.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>AI Dashboard Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );
}
