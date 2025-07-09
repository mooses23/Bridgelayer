import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plug } from 'lucide-react';

interface SelectionPanelProps {
  dashboardData: any;
  handleEnableIntegration: (integration: any) => void;
  getCategoryColor: (category: string) => string;
  getAuthTypeIcon: (authType: string) => JSX.Element;
}

const SelectionPanel: React.FC<SelectionPanelProps> = ({ dashboardData, handleEnableIntegration, getCategoryColor, getAuthTypeIcon }) => (
  <>
    {/* Integration Categories Filter */}
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
        All Available ({dashboardData?.availableIntegrations.length || 0})
      </Badge>
      {Array.from(new Set(dashboardData?.availableIntegrations.map((i: any) => i.category) || [])).map((category) => (
        <Badge key={category} variant="outline" className="cursor-pointer hover:bg-gray-100">
          {category}
        </Badge>
      ))}
    </div>

    {dashboardData?.availableIntegrations.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Plug className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations Available</h3>
          <p className="text-gray-500 text-center">
            No integrations are currently available for firms to enable.<br />
            Contact your administrator to add integrations to the marketplace.
          </p>
        </CardContent>
      </Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData?.availableIntegrations.map((integration: any) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plug className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <Badge className={getCategoryColor(integration.category)} variant="secondary">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                {getAuthTypeIcon(integration.authType)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-4">{integration.description}</CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* ...existing code for provider and button... */}
                  <Button
                    size="sm"
                    onClick={() => handleEnableIntegration(integration)}
                    className="text-xs"
                  >
                    Enable for Firm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </>
);

export default SelectionPanel;
