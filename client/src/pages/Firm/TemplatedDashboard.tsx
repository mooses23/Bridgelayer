import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  Upload,
  BarChart3,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';

interface FirmConfig {
  id: string;
  name: string;
  subdomain: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  onboardingComplete: boolean;
  onboardingProgress: number;
  features: {
    documentAnalysis: boolean;
    clientPortal: boolean;
    timeTracking: boolean;
    billing: boolean;
    integrations: boolean;
  };
  templates: {
    id: string;
    name: string;
    category: string;
    enabled: boolean;
  }[];
  integrations: {
    storage: string | null;
    billing: string | null;
    calendar: string | null;
  };
  stats: {
    documentsAnalyzed: number;
    activeClients: number;
    hoursLogged: number;
    recentActivity: number;
  };
}

export function TemplatedDashboard() {
  const { tenantId } = useTenant();

  const { data: firmConfig, isLoading } = useQuery({
    queryKey: ['firm-config', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/onboarding/${tenantId}/config`);
      if (!response.ok) {
        throw new Error('Failed to load firm configuration');
      }
      const data = await response.json();
      return data as FirmConfig;
    },
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!firmConfig) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load firm configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Branding */}
      <div 
        className="rounded-lg p-6 text-white"
        style={{ 
          backgroundColor: firmConfig.branding?.primaryColor || '#3B82F6',
          background: `linear-gradient(135deg, ${firmConfig.branding?.primaryColor || '#3B82F6'} 0%, ${firmConfig.branding?.secondaryColor || '#1E3A8A'} 100%)`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {firmConfig.branding?.logo ? (
              <img 
                src={firmConfig.branding.logo} 
                alt={`${firmConfig.name} logo`}
                className="w-12 h-12 rounded-lg object-cover bg-white/20 p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{firmConfig.name}</h1>
              <p className="text-white/80">{firmConfig.subdomain}.firmsync.com</p>
            </div>
          </div>

          {!firmConfig.onboardingComplete && (
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">Setup Progress</p>
              <div className="w-32">
                <Progress value={firmConfig.onboardingProgress} className="h-2" />
              </div>
              <p className="text-xs text-white/80 mt-1">
                {firmConfig.onboardingProgress}% complete
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Notice */}
      {!firmConfig.onboardingComplete && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              <span>Complete Your Setup</span>
            </CardTitle>
            <CardDescription className="text-amber-700">
              Finish setting up your firm to unlock all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Continue Setup
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Analyzed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firmConfig.stats.documentsAnalyzed}</div>
            <p className="text-xs text-muted-foreground">
              +{firmConfig.stats.recentActivity} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firmConfig.stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              Across all matters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firmConfig.stats.hoursLogged}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Document processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for your firm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Upload className="w-6 h-6" />
                <span>Upload Document</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Users className="w-6 h-6" />
                <span>New Client</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <FileText className="w-6 h-6" />
                <span>Generate Contract</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <MessageSquare className="w-6 h-6" />
                <span>Client Portal</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Status */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              Available tools and integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(firmConfig.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant={enabled ? "default" : "secondary"}>
                  {enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Document Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Document Templates</CardTitle>
          <CardDescription>
            Available templates for your practice areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {firmConfig.templates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  {template.enabled ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.category}</p>
                <Button 
                  size="sm" 
                  variant={template.enabled ? "default" : "outline"}
                  disabled={!template.enabled}
                >
                  {template.enabled ? "Use Template" : "Configure"}
                </Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TemplatedDashboard;