import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisFeatures } from "@shared/schema";

interface FeatureTogglesProps {
  features?: AnalysisFeatures;
  onFeaturesUpdate: () => void;
}

export default function FeatureToggles({ features, onFeaturesUpdate }: FeatureTogglesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateFeaturesMutation = useMutation({
    mutationFn: async (updatedFeatures: Partial<AnalysisFeatures>) => {
      await apiRequest("PUT", "/api/features", updatedFeatures);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
      onFeaturesUpdate();
      toast({
        title: "Features Updated",
        description: "AI analysis features have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update features. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFeatureToggle = (feature: keyof AnalysisFeatures, enabled: boolean) => {
    updateFeaturesMutation.mutate({ [feature]: enabled });
  };

  const featureConfig = [
    {
      key: 'summarization' as keyof AnalysisFeatures,
      title: 'Summarization',
      description: 'Generate document summaries',
    },
    {
      key: 'riskAnalysis' as keyof AnalysisFeatures,
      title: 'Risk Analysis',
      description: 'Identify legal risks',
    },
    {
      key: 'clauseExtraction' as keyof AnalysisFeatures,
      title: 'Clause Extraction',
      description: 'Extract and complete clauses',
    },
    {
      key: 'crossReference' as keyof AnalysisFeatures,
      title: 'Cross-Reference',
      description: 'Verify internal references',
    },
    {
      key: 'formatting' as keyof AnalysisFeatures,
      title: 'Formatting Fixes',
      description: 'Correct layout issues',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center legal-blue">
          <ToggleLeft className="mr-3" size={20} />
          AI Analysis Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureConfig.map((config) => (
            <div key={config.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{config.title}</p>
                <p className="text-sm legal-slate">{config.description}</p>
              </div>
              <Switch
                checked={features?.[config.key] ?? false}
                onCheckedChange={(enabled) => handleFeatureToggle(config.key, enabled)}
                disabled={updateFeaturesMutation.isPending}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
