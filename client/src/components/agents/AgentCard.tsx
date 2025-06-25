import { useDrag } from 'react-dnd';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: Record<string, any>;
  description?: string;
}

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

export function AgentCard({ agent, className = '' }: AgentCardProps) {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'AGENT',
    item: { id: agent.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card
      ref={dragRef}
      className={`${className} ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardHeader>
        <h3 className="font-semibold">{agent.name}</h3>
        <Badge variant="outline">{agent.type}</Badge>
      </CardHeader>
      
      <CardContent>
        {agent.description && (
          <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
        )}
        <div className="space-y-1">
          {Object.entries(agent.capabilities).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span>{' '}
              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50">
        <div className="text-xs text-gray-500">Drag to assign to document type</div>
      </CardFooter>
    </Card>
  );
}
