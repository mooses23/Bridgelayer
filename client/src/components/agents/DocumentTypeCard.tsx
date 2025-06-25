import { useDrop } from 'react-dnd';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: Record<string, any>;
  description?: string;
}

interface DocumentType {
  id: string;
  name: string;
  type: string;
  assignedAgentId?: string;
}

interface DocumentTypeCardProps {
  documentType: DocumentType;
  assignedAgent?: Agent;
  onAssign: (docTypeId: string, agentId: string) => void;
  onTest: () => void;
}

export function DocumentTypeCard({ 
  documentType, 
  assignedAgent,
  onAssign,
  onTest 
}: DocumentTypeCardProps) {
  const [{ isOver }, dropRef] = useDrop({
    accept: 'AGENT',
    drop: (item: { id: string }) => {
      onAssign(documentType.id, item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Card
      ref={dropRef}
      className={`${isOver ? 'ring-2 ring-blue-500' : ''}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{documentType.name}</h3>
            <Badge variant="secondary">{documentType.type}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onTest}>
            Test
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {assignedAgent ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">Assigned Agent:</div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium">{assignedAgent.name}</div>
              <div className="text-xs text-gray-600">{assignedAgent.type}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Drop an agent here to assign
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 justify-end">
        {assignedAgent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAssign(documentType.id, '')}
          >
            Remove Assignment
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
