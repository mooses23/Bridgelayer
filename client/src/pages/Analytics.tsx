import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Users,
  Filter,
  Calendar
} from "lucide-react";
import { useState } from "react";

interface AnalyticsData {
  documentsUploadedThisWeek: number;
  reviewStats: {
    aiReviewed: number;
    humanReviewed: number;
    percentageAiReviewed: number;
  };
  topFlaggedClauses: Array<{
    clause: string;
    count: number;
  }>;
  averageReviewTime: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  mostActiveParalegal: {
    name: string;
    documentCount: number;
  };
  weeklyUploadTrend: Array<{
    date: string;
    count: number;
  }>;
  documentTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
}

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedDocType, setSelectedDocType] = useState("all");

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", selectedPeriod, selectedDocType],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Failed to load analytics data. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const totalRiskDocs = analytics.riskDistribution.low + analytics.riskDistribution.medium + analytics.riskDistribution.high;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDocType} onValueChange={setSelectedDocType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Document Types</SelectItem>
              <SelectItem value="nda">NDAs</SelectItem>
              <SelectItem value="contract">Contracts</SelectItem>
              <SelectItem value="lease">Leases</SelectItem>
              <SelectItem value="employment">Employment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents This Week</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.documentsUploadedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Analysis</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.reviewStats.percentageAiReviewed}%</div>
            <p className="text-xs text-muted-foreground">
              Processed with automated review
            </p>
            <div className="mt-2">
              <Progress value={analytics.reviewStats.percentageAiReviewed} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Review Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageReviewTime}</div>
            <p className="text-xs text-muted-foreground">
              minutes per document
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{analytics.mostActiveParalegal.name}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.mostActiveParalegal.documentCount} documents processed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="types">Document Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Review Statistics</CardTitle>
                <CardDescription>Breakdown of document review methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Automated Review</span>
                  <Badge variant="secondary">{analytics.reviewStats.aiReviewed} docs</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manual Review</span>
                  <Badge variant="outline">{analytics.reviewStats.humanReviewed} docs</Badge>
                </div>
                <Progress 
                  value={analytics.reviewStats.percentageAiReviewed} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground">
                  {analytics.reviewStats.percentageAiReviewed}% automated processing efficiency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Flagged Clauses</CardTitle>
                <CardDescription>Most frequently identified risk areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.topFlaggedClauses.map((clause, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{clause.clause}</span>
                    </div>
                    <Badge variant="destructive">{clause.count}</Badge>
                  </div>
                ))}
                {analytics.topFlaggedClauses.length === 0 && (
                  <p className="text-sm text-muted-foreground">No flagged clauses this period</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
              <CardDescription>Document classification by risk assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Low Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {totalRiskDocs > 0 ? Math.round((analytics.riskDistribution.low / totalRiskDocs) * 100) : 0}%
                    </span>
                    <Badge variant="secondary">{analytics.riskDistribution.low}</Badge>
                  </div>
                </div>
                <Progress value={totalRiskDocs > 0 ? (analytics.riskDistribution.low / totalRiskDocs) * 100 : 0} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {totalRiskDocs > 0 ? Math.round((analytics.riskDistribution.medium / totalRiskDocs) * 100) : 0}%
                    </span>
                    <Badge variant="secondary">{analytics.riskDistribution.medium}</Badge>
                  </div>
                </div>
                <Progress value={totalRiskDocs > 0 ? (analytics.riskDistribution.medium / totalRiskDocs) * 100 : 0} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>High Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {totalRiskDocs > 0 ? Math.round((analytics.riskDistribution.high / totalRiskDocs) * 100) : 0}%
                    </span>
                    <Badge variant="destructive">{analytics.riskDistribution.high}</Badge>
                  </div>
                </div>
                <Progress value={totalRiskDocs > 0 ? (analytics.riskDistribution.high / totalRiskDocs) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Upload Trend</CardTitle>
              <CardDescription>Document upload activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyUploadTrend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{day.count}</span>
                    </div>
                  </div>
                ))}
                {analytics.weeklyUploadTrend.length === 0 && (
                  <p className="text-sm text-muted-foreground">No upload data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Type Distribution</CardTitle>
              <CardDescription>Breakdown by document categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.documentTypeDistribution.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type.type.replace('_', ' ')}</span>
                    <Badge variant="outline">{type.count}</Badge>
                  </div>
                ))}
                {analytics.documentTypeDistribution.length === 0 && (
                  <p className="text-sm text-muted-foreground">No document type data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}