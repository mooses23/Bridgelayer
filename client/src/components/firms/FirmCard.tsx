import { memo } from 'react';
import { Building2, BarChart, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Firm } from '@/types/firm';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FirmCardProps {
  firm: Firm;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onReset: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  setup: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800',
} as const;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const FirmCard = memo(({ firm, onView, onEdit, onReset }: FirmCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold truncate">
          {firm.name}
        </CardTitle>
        <Badge className={statusColors[firm.status]}>
          {firm.status.charAt(0).toUpperCase() + firm.status.slice(1)}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Firm Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{firm.practiceArea}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{firm.userCount} users</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span>{firm.metrics.apiUsage.toLocaleString()} req/day</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span>Last active {formatDate(firm.lastActive)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Created on {formatDate(firm.createdAt)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Progress Bar for Setup Status */}
        {firm.status === 'setup' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${firm.onboarding.progress}%` }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(firm.id)}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(firm.id)}
          >
            Edit Config
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReset(firm.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Reset
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
));

FirmCard.displayName = 'FirmCard';

export default FirmCard;
