import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Clock, Calendar, Users, FileText, CheckCircle } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface DiscoveryManagementProps {
  firmId: number;
  userId: number;
}

const DiscoveryManagement: React.FC<DiscoveryManagementProps> = ({ firmId, userId }) => {
  const [caseId, setCaseId] = useState<number | null>(null);
  const [discoveryType, setDiscoveryType] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [discoveryPlan, setDiscoveryPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoveryTypes = [
    'Document Requests', 'Interrogatories', 'Depositions', 'Requests for Admission',
    'Expert Discovery', 'Electronic Discovery', 'Third Party Subpoenas', 'Medical Records',
    'Financial Records', 'ESI Management', 'Discovery Plan', 'Discovery Schedule'
  ];

  const handleGenerateDiscoveryPlan = async () => {
    if (!caseId) {
      setError('Please enter a case ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getDiscoveryManagement(
        firmId, 
        userId, 
        caseId,
        discoveryType || undefined,
        userQuery
      );
      setDiscoveryPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate discovery plan');
    } finally {
      setLoading(false);
    }
  };

  const renderDiscoveryOverview = (overview: any) => {
    if (!overview) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Discovery Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.case_summary && (
              <div>
                <h4 className="font-semibold mb-2">Case Summary</h4>
                <p className="text-sm leading-relaxed">{overview.case_summary}</p>
              </div>
            )}

            {overview.discovery_goals && overview.discovery_goals.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Discovery Goals</h4>
                <ul className="space-y-1">
                  {overview.discovery_goals.map((goal: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {overview.key_issues && overview.key_issues.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Key Issues for Discovery</h4>
                <div className="flex flex-wrap gap-1">
                  {overview.key_issues.map((issue: string, index: number) => (
                    <Badge key={index} variant="outline">{issue}</Badge>
                  ))}
                </div>
              </div>
            )}

            {overview.estimated_timeline && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {overview.estimated_timeline}
                  </div>
                  <div className="text-sm text-blue-700">Est. Timeline</div>
                </div>
                {overview.estimated_cost && (
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {overview.estimated_cost}
                    </div>
                    <div className="text-sm text-green-700">Est. Cost</div>
                  </div>
                )}
                {overview.complexity_level && (
                  <div className="text-center p-3 bg-yellow-50 rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {overview.complexity_level}
                    </div>
                    <div className="text-sm text-yellow-700">Complexity</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDiscoveryRequests = (requests: any[]) => {
    if (!requests || requests.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recommended Discovery Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{request.type}</h4>
                  <div className="flex gap-2">
                    {request.priority && (
                      <Badge variant={request.priority === 'high' ? 'destructive' : 
                                    request.priority === 'medium' ? 'default' : 'secondary'}>
                        {request.priority} priority
                      </Badge>
                    )}
                    {request.deadline && (
                      <Badge variant="outline">{request.deadline}</Badge>
                    )}
                  </div>
                </div>

                {request.description && (
                  <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                )}

                {request.specific_requests && request.specific_requests.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium mb-2">Specific Requests:</h5>
                    <ul className="space-y-1">
                      {request.specific_requests.map((req: string, reqIndex: number) => (
                        <li key={reqIndex} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.rationale && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <strong>Rationale:</strong> {request.rationale}
                  </div>
                )}

                {request.potential_objections && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                    <strong>Potential Objections:</strong> {request.potential_objections}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDiscoverySchedule = (schedule: any) => {
    if (!schedule) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Discovery Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule.phases && schedule.phases.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Discovery Phases</h4>
                <div className="space-y-3">
                  {schedule.phases.map((phase: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{phase.phase}</h5>
                        <Badge variant="outline">{phase.duration}</Badge>
                      </div>
                      {phase.description && (
                        <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                      )}
                      {phase.milestones && phase.milestones.length > 0 && (
                        <div>
                          <strong className="text-sm">Key Milestones:</strong>
                          <ul className="mt-1 space-y-1">
                            {phase.milestones.map((milestone: string, milIndex: number) => (
                              <li key={milIndex} className="text-sm flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                {milestone}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {schedule.critical_deadlines && schedule.critical_deadlines.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Critical Deadlines</h4>
                <div className="space-y-2">
                  {schedule.critical_deadlines.map((deadline: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded bg-red-50">
                      <span className="text-sm font-medium">{deadline.task}</span>
                      <Badge variant="destructive">{deadline.date}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderESIConsiderations = (esi: any) => {
    if (!esi) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Electronic Discovery Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {esi.data_sources && esi.data_sources.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Potential Data Sources</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {esi.data_sources.map((source: string, index: number) => (
                    <Badge key={index} variant="outline">{source}</Badge>
                  ))}
                </div>
              </div>
            )}

            {esi.preservation_requirements && (
              <div>
                <h4 className="font-semibold mb-2">Preservation Requirements</h4>
                <p className="text-sm leading-relaxed">{esi.preservation_requirements}</p>
              </div>
            )}

            {esi.collection_strategy && (
              <div>
                <h4 className="font-semibold mb-2">Collection Strategy</h4>
                <p className="text-sm leading-relaxed">{esi.collection_strategy}</p>
              </div>
            )}

            {esi.review_considerations && (
              <div>
                <h4 className="font-semibold mb-2">Review Considerations</h4>
                <ul className="space-y-1">
                  {esi.review_considerations.map((consideration: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {consideration}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {esi.cost_estimates && (
              <div className="bg-yellow-50 p-3 rounded">
                <h4 className="font-semibold mb-2">Cost Estimates</h4>
                <div className="text-sm">
                  {Object.entries(esi.cost_estimates).map(([category, cost]: [string, any]) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}:</span>
                      <span className="font-medium">{cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDepositionPlan = (depositions: any) => {
    if (!depositions) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Deposition Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {depositions.recommended_witnesses && depositions.recommended_witnesses.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommended Witnesses</h4>
                <div className="space-y-2">
                  {depositions.recommended_witnesses.map((witness: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{witness.name || witness.role}</h5>
                        <Badge variant={witness.priority === 'high' ? 'destructive' : 
                                      witness.priority === 'medium' ? 'default' : 'secondary'}>
                          {witness.priority} priority
                        </Badge>
                      </div>
                      {witness.rationale && (
                        <p className="text-sm text-gray-600 mb-2">{witness.rationale}</p>
                      )}
                      {witness.key_topics && witness.key_topics.length > 0 && (
                        <div>
                          <strong className="text-sm">Key Topics:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {witness.key_topics.map((topic: string, topicIndex: number) => (
                              <Badge key={topicIndex} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {depositions.sequence_recommendation && (
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-semibold mb-2">Sequence Recommendation</h4>
                <p className="text-sm">{depositions.sequence_recommendation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Discovery Management</CardTitle>
          <p className="text-sm text-gray-600">
            Discovery planning and document management
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Case ID</label>
            <Input
              type="number"
              placeholder="Enter case ID"
              value={caseId || ''}
              onChange={(e) => setCaseId(e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discovery Type (optional)</label>
            <Select value={discoveryType} onValueChange={setDiscoveryType}>
              <SelectTrigger>
                <SelectValue placeholder="Select discovery type" />
              </SelectTrigger>
              <SelectContent>
                {discoveryTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Discovery Focus (optional)
            </label>
            <Textarea
              placeholder="What specific discovery aspects would you like to focus on? (e.g., electronic discovery, witness depositions, document requests)"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerateDiscoveryPlan} 
            disabled={loading || !caseId}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Generating Discovery Plan...
              </>
            ) : (
              <>
                <FolderOpen className="mr-2 h-4 w-4" />
                Generate Discovery Plan
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {discoveryPlan && (
        <div className="space-y-4">
          {/* Discovery Overview */}
          {renderDiscoveryOverview(discoveryPlan.overview)}

          {/* Discovery Requests */}
          {renderDiscoveryRequests(discoveryPlan.discovery_requests)}

          {/* Discovery Schedule */}
          {renderDiscoverySchedule(discoveryPlan.schedule)}

          {/* ESI Considerations */}
          {renderESIConsiderations(discoveryPlan.esi_considerations)}

          {/* Deposition Plan */}
          {renderDepositionPlan(discoveryPlan.deposition_plan)}

          {/* Recommendations */}
          {discoveryPlan.recommendations && discoveryPlan.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Discovery Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {discoveryPlan.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscoveryManagement;
