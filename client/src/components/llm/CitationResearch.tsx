import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, ExternalLink, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface CitationResearchProps {
  firmId: number;
  userId: number;
}

const CitationResearch: React.FC<CitationResearchProps> = ({ firmId, userId }) => {
  const [query, setQuery] = useState('');
  const [citationStyle, setCitationStyle] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [citationResults, setCitationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const citationStyles = [
    'Bluebook', 'ALWD', 'APA', 'MLA', 'Chicago', 'Harvard', 'Local Court Rules'
  ];

  const jurisdictions = [
    'Federal', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
    'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
    'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
    'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const handleCitationResearch = async () => {
    if (!query.trim()) {
      setError('Please enter a research query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getCitationResearch(
        firmId, 
        userId, 
        query,
        citationStyle || undefined,
        jurisdiction || undefined
      );
      setCitationResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform citation research');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const renderCitationValidation = (validation: any) => {
    if (!validation) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Citation Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validation.validated_citations && validation.validated_citations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Validated Citations</h4>
                <div className="space-y-3">
                  {validation.validated_citations.map((citation: any, index: number) => (
                    <div key={index} className="border rounded p-3 bg-green-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-mono text-sm">{citation.formatted_citation}</div>
                          {citation.case_name && (
                            <div className="text-sm text-gray-600 mt-1">{citation.case_name}</div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Badge variant="secondary">Valid</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(citation.formatted_citation)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {citation.verification_details && (
                        <div className="text-xs text-gray-500">
                          <strong>Verified:</strong> {citation.verification_details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation.citation_errors && validation.citation_errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-red-700">Citation Errors</h4>
                <div className="space-y-3">
                  {validation.citation_errors.map((error: any, index: number) => (
                    <div key={index} className="border rounded p-3 bg-red-50">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-red-700">{error.original_citation}</div>
                          <div className="text-sm text-red-600 mt-1">{error.error_description}</div>
                        </div>
                      </div>
                      {error.suggested_correction && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <strong className="text-sm">Suggested Correction:</strong>
                          <div className="font-mono text-sm mt-1">{error.suggested_correction}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => copyToClipboard(error.suggested_correction)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Correction
                          </Button>
                        </div>
                      )}
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

  const renderCitationFormats = (formats: any) => {
    if (!formats) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Citation Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(formats).map(([style, citations]: [string, any]) => (
              <div key={style}>
                <h4 className="font-semibold mb-2 capitalize">{style} Format</h4>
                <div className="space-y-2">
                  {Array.isArray(citations) ? citations.map((citation: any, index: number) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm flex-1">{citation.formatted || citation}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(citation.formatted || citation)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {citation.notes && (
                        <div className="text-xs text-gray-500 mt-1">{citation.notes}</div>
                      )}
                    </div>
                  )) : (
                    <div className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm flex-1">{citations}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(citations)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRelatedCitations = (related: any[]) => {
    if (!related || related.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Related Legal Authorities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {related.map((authority: any, index: number) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium">{authority.title}</h5>
                    <div className="font-mono text-sm text-blue-600 mt-1">{authority.citation}</div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Badge variant="outline">{authority.type}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(authority.citation)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {authority.relevance && (
                  <p className="text-sm text-gray-600 mb-2">{authority.relevance}</p>
                )}

                {authority.key_holdings && authority.key_holdings.length > 0 && (
                  <div>
                    <strong className="text-sm">Key Holdings:</strong>
                    <ul className="mt-1 space-y-1">
                      {authority.key_holdings.map((holding: string, holdingIndex: number) => (
                        <li key={holdingIndex} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {holding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {authority.pinpoint_citations && authority.pinpoint_citations.length > 0 && (
                  <div className="mt-2">
                    <strong className="text-sm">Pinpoint Citations:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {authority.pinpoint_citations.map((pin: string, pinIndex: number) => (
                        <Badge key={pinIndex} variant="outline" className="text-xs">
                          {pin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {authority.shepardizing_status && (
                  <div className="mt-2 text-sm">
                    <strong>Status:</strong>
                    <Badge variant={authority.shepardizing_status === 'positive' ? 'secondary' : 
                                   authority.shepardizing_status === 'negative' ? 'destructive' : 'default'}
                           className="ml-1">
                      {authority.shepardizing_status}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCitationGuidance = (guidance: any) => {
    if (!guidance) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Citation Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {guidance.style_notes && (
              <div>
                <h5 className="font-medium mb-2">Style Notes</h5>
                <ul className="space-y-1">
                  {guidance.style_notes.map((note: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.common_mistakes && guidance.common_mistakes.length > 0 && (
              <div>
                <h5 className="font-medium mb-2 text-red-700">Common Mistakes to Avoid</h5>
                <ul className="space-y-1">
                  {guidance.common_mistakes.map((mistake: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.best_practices && guidance.best_practices.length > 0 && (
              <div>
                <h5 className="font-medium mb-2 text-green-700">Best Practices</h5>
                <ul className="space-y-1">
                  {guidance.best_practices.map((practice: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.jurisdiction_specific && (
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="font-medium mb-2">Jurisdiction-Specific Notes</h5>
                <p className="text-sm">{guidance.jurisdiction_specific}</p>
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
          <CardTitle>Citation Research</CardTitle>
          <p className="text-sm text-gray-600">
            Legal citation verification and research
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Research Query</label>
            <Textarea
              placeholder="Enter your citation research request (e.g., 'find cases about employment discrimination', 'verify citation format for Brown v. Board', 'format this case in Bluebook style')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Citation Style (optional)</label>
              <Select value={citationStyle} onValueChange={setCitationStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select citation style" />
                </SelectTrigger>
                <SelectContent>
                  {citationStyles.map((style) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jurisdiction (optional)</label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleCitationResearch} 
            disabled={loading || !query.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Researching Citations...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Research Citations
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

      {citationResults && (
        <div className="space-y-4">
          {/* Citation Summary */}
          {citationResults.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Research Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{citationResults.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Citation Validation */}
          {renderCitationValidation(citationResults.validation)}

          {/* Citation Formats */}
          {renderCitationFormats(citationResults.formats)}

          {/* Related Citations */}
          {renderRelatedCitations(citationResults.related_authorities)}

          {/* Citation Guidance */}
          {renderCitationGuidance(citationResults.guidance)}

          {/* Recommendations */}
          {citationResults.recommendations && citationResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Research Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {citationResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
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

export default CitationResearch;
