import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

interface CaseStats {
  active: number;
  pending: number;
  closed: number;
  total: number;
}

interface CaseStatusChartWidgetProps {
  caseStats: CaseStats;
}

export default function CaseStatusChartWidget({ caseStats }: CaseStatusChartWidgetProps) {
  const data = [
    { name: 'Active', value: caseStats.active || 0, color: '#10b981' },
    { name: 'Pending', value: caseStats.pending || 0, color: '#f59e0b' },
    { name: 'Closed', value: caseStats.closed || 0, color: '#6b7280' }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#6b7280'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Case Status Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {caseStats.total > 0 ? (
          <div className="space-y-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{caseStats.active}</div>
                <div className="text-xs text-green-700">Active</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-600">{caseStats.pending}</div>
                <div className="text-xs text-yellow-700">Pending</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-600">{caseStats.closed}</div>
                <div className="text-xs text-gray-700">Closed</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No case data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}