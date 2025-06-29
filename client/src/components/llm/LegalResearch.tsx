import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Clock, ExternalLink, Scale } from 'lucide-react';
import llmApi from '@/lib/llmApi';

interface LegalResearchProps {
  firmId: number;
  userId: number;
}

const LegalResearch: React.FC<LegalResearchProps> = ({ firmId, userId }) => {
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [researchResults, setResearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const practiceAreas = [
    'Corporate Law', 'Criminal Law', 'Family Law', 'Immigration Law', 'Employment Law',
    'Real Estate Law', 'Tax Law', 'Intellectual Property', 'Environmental Law',
    'Healthcare Law', 'Securities Law', 'Bankruptcy Law', 'Contract Law', 'Tort Law',
    'Constitutional Law', 'Administrative Law', 'Civil Rights', 'Privacy Law',
    'International Law', 'Entertainment Law', 'Sports Law', 'Energy Law'
  ];

  const handleResearch = async () => {
    if (!query.trim()) {
      setError('Please enter a research query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmApi.getLegalResearch(
        firmId, 
        userId, 
        query,
        jurisdiction || undefined,
        practiceArea || undefined
      );
      setResearchResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform legal research');
    } finally {
      setLoading(false);
    }
  };

  const renderResearchSummary = (summary: any) => {
    if (!summary) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Research Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.executive_summary && (
              <div>
                <h4 className="font-semibold mb-2">Executive Summary</h4>
                <p className="text-sm leading-relaxed">{summary.executive_summary}</p>
              </div>
            )}
            
            {summary.key_findings && summary.key_findings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Key Findings</h4>
                <ul className="space-y-1">
                  {summary.key_findings.map((finding: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.legal_principles && summary.legal_principles.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Legal Principles</h4>
                <div className="flex flex-wrap gap-1">
                  {summary.legal_principles.map((principle: string, index: number) => (
                    <Badge key={index} variant="outline">{principle}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCaseLaw = (cases: any[]) => {
    if (!cases || cases.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Relevant Case Law
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cases.map((case_item: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-blue-700">{case_item.case_name}</h4>
                  {case_item.year && (
                    <Badge variant="outline">{case_item.year}</Badge>
                  )}
                </div>

                {case_item.citation && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Citation:</strong> {case_item.citation}
                  </div>
                )}

                {case_item.court && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Court:</strong> {case_item.court}
                  </div>
                )}

                {case_item.summary && (
                  <p className="text-sm mb-3 leading-relaxed">{case_item.summary}</p>
                )}

                {case_item.holding && (
                  <div className="bg-blue-50 p-3 rounded mb-3">
                    <strong className="text-sm">Holding:</strong>
                    <p className="text-sm mt-1">{case_item.holding}</p>
                  </div>
                )}

                {case_item.relevance && (
                  <div className="text-sm">
                    <strong>Relevance:</strong> {case_item.relevance}
                  </div>
                )}

                {case_item.key_quotes && case_item.key_quotes.length > 0 && (
                  <div className="mt-3">
                    <strong className="text-sm">Key Quotes:</strong>
                    {case_item.key_quotes.map((quote: string, idx: number) => (
                      <blockquote key={idx} className="mt-2 pl-4 border-l-2 border-gray-300 text-sm italic">
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStatutes = (statutes: any[]) => {
    if (!statutes || statutes.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Relevant Statutes & Regulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statutes.map((statute: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{statute.title}</h4>
                  {statute.jurisdiction && (
                    <Badge variant="secondary">{statute.jurisdiction}</Badge>
                  )}
                </div>

                {statute.citation && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Citation:</strong> {statute.citation}
                  </div>
                )}

                {statute.summary && (
                  <p className="text-sm mb-3 leading-relaxed">{statute.summary}</p>
                )}

                {statute.relevant_sections && statute.relevant_sections.length > 0 && (
                  <div className="mb-3">
                    <strong className="text-sm">Relevant Sections:</strong>
                    <ul className="mt-1 space-y-1">
                      {statute.relevant_sections.map((section: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {section}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {statute.applicability && (
                  <div className="text-sm">
                    <strong>Applicability:</strong> {statute.applicability}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSecondaryAuthorities = (authorities: any[]) => {
    if (!authorities || authorities.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Secondary Authorities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {authorities.map((authority: any, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium">{authority.title}</h5>
                  <Badge variant="outline">{authority.type}</Badge>
                </div>

                {authority.author && (
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Author:</strong> {authority.author}
                  </div>
                )}

                {authority.source && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Source:</strong> {authority.source}
                  </div>
                )}

                {authority.summary && (
                  <p className="text-sm leading-relaxed">{authority.summary}</p>
                )}

                {authority.url && (
                  <a href={authority.url} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2">
                    <ExternalLink className="h-3 w-3" />
                    View Source
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Research</CardTitle>
          <p className="text-sm text-gray-600">
            Comprehensive legal research and citation
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Research Query</label>
            <Textarea
              placeholder="Enter your legal research question or topic (e.g., 'employment at-will doctrine exceptions', 'GDPR compliance requirements for US companies')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium mb-2">Practice Area (optional)</label>
              <Select value={practiceArea} onValueChange={setPracticeArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select practice area" />
                </SelectTrigger>
                <SelectContent>
                  {practiceAreas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleResearch} 
            disabled={loading || !query.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Conduct Research
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

      {researchResults && (
        <div className="space-y-4">
          {/* Research Summary */}
          {renderResearchSummary(researchResults.summary)}

          {/* Case Law */}
          {renderCaseLaw(researchResults.case_law)}

          {/* Statutes */}
          {renderStatutes(researchResults.statutes)}

          {/* Secondary Authorities */}
          {renderSecondaryAuthorities(researchResults.secondary_authorities)}

          {/* Research Recommendations */}
          {researchResults.recommendations && researchResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Research Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {researchResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Search className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Search Strategy */}
          {researchResults.search_strategy && (
            <Card>
              <CardHeader>
                <CardTitle>Research Methodology</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p><strong>Search Terms Used:</strong> {researchResults.search_strategy.terms_used}</p>
                  <p><strong>Databases Searched:</strong> {researchResults.search_strategy.databases}</p>
                  {researchResults.search_strategy.limitations && (
                    <p><strong>Limitations:</strong> {researchResults.search_strategy.limitations}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default LegalResearch;
