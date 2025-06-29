import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DocumentReview from './DocumentReview';
import ContractAnalysis from './ContractAnalysis';
import ComplianceCheck from './ComplianceCheck';
import RiskAssessment from './RiskAssessment';
import ClauseExtraction from './ClauseExtraction';
import LegalResearch from './LegalResearch';
import DocumentDrafting from './DocumentDrafting';
import CaseStrategy from './CaseStrategy';
import DiscoveryManagement from './DiscoveryManagement';
import CitationResearch from './CitationResearch';
import DocumentAutomation from './DocumentAutomation';
import LlmSettings from './LlmSettings';
import UsageDashboard from './UsageDashboard';

interface LlmFunction {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'paralegal';
  component: React.ComponentType<any>;
}

const llmFunctions: LlmFunction[] = [
  // Core Functions (8)
  {
    id: 'document_review',
    name: 'Document Review',
    description: 'Comprehensive legal document analysis and review',
    category: 'core',
    component: DocumentReview
  },
  {
    id: 'contract_analysis',
    name: 'Contract Analysis',
    description: 'Specialized contract review and term extraction',
    category: 'core',
    component: ContractAnalysis
  },
  {
    id: 'compliance_check',
    name: 'Compliance Check',
    description: 'Regulatory compliance verification and audit',
    category: 'core',
    component: ComplianceCheck
  },
  {
    id: 'risk_assessment',
    name: 'Risk Assessment',
    description: 'Legal risk identification and mitigation strategies',
    category: 'core',
    component: RiskAssessment
  },
  {
    id: 'clause_extraction',
    name: 'Clause Extraction',
    description: 'Smart identification and categorization of clauses',
    category: 'core',
    component: ClauseExtraction
  },
  {
    id: 'legal_research',
    name: 'Legal Research',
    description: 'Comprehensive legal research and citation',
    category: 'core',
    component: LegalResearch
  },
  {
    id: 'document_drafting',
    name: 'Document Drafting',
    description: 'AI-assisted legal document creation and revision',
    category: 'core',
    component: DocumentDrafting
  },
  {
    id: 'case_strategy',
    name: 'Case Strategy',
    description: 'Strategic case analysis and planning assistance',
    category: 'core',
    component: CaseStrategy
  },
  // Paralegal+ Functions (3)
  {
    id: 'discovery_management',
    name: 'Discovery Management',
    description: 'Discovery planning and document management',
    category: 'paralegal',
    component: DiscoveryManagement
  },
  {
    id: 'citation_research',
    name: 'Citation Research',
    description: 'Legal citation verification and research',
    category: 'paralegal',
    component: CitationResearch
  },
  {
    id: 'document_automation',
    name: 'Document Automation',
    description: 'Template and workflow automation design',
    category: 'paralegal',
    component: DocumentAutomation
  }
];

export default function LlmMasterInterface() {
  const [activeFunction, setActiveFunction] = useState<string>('document_review');
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Mock firm and user data - in real app these would come from auth context
  const firmId = 1;
  const userId = 1;

  const coreFunctions = llmFunctions.filter(f => f.category === 'core');
  const paralegalFunctions = llmFunctions.filter(f => f.category === 'paralegal');

  const ActiveComponent = llmFunctions.find(f => f.id === activeFunction)?.component;

  if (showSettings) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">LLM Settings</h1>
          <div className="space-x-2">
            <Button onClick={() => setShowDashboard(true)} variant="outline">
              Usage Dashboard
            </Button>
            <Button onClick={() => setShowSettings(false)} variant="outline">
              Back to Functions
            </Button>
          </div>
        </div>
        <LlmSettings firmId={firmId} userId={userId} />
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Usage Dashboard</h1>
          <div className="space-x-2">
            <Button onClick={() => setShowSettings(true)} variant="outline">
              LLM Settings
            </Button>
            <Button onClick={() => setShowDashboard(false)} variant="outline">
              Back to Functions
            </Button>
          </div>
        </div>
        <UsageDashboard />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI-Powered Legal Functions</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive AI assistance for legal workflows
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setShowDashboard(true)} variant="outline">
            Usage Dashboard
          </Button>
          <Button onClick={() => setShowSettings(true)} variant="outline">
            LLM Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Function Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Functions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  Core Functions
                  <Badge variant="secondary" className="ml-2">8</Badge>
                </h3>
                <div className="space-y-1">
                  {coreFunctions.map((func) => (
                    <Button
                      key={func.id}
                      variant={activeFunction === func.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setActiveFunction(func.id)}
                    >
                      <div>
                        <div className="font-medium text-sm">{func.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {func.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  Paralegal+ Functions
                  <Badge variant="secondary" className="ml-2">3</Badge>
                </h3>
                <div className="space-y-1">
                  {paralegalFunctions.map((func) => (
                    <Button
                      key={func.id}
                      variant={activeFunction === func.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setActiveFunction(func.id)}
                    >
                      <div>
                        <div className="font-medium text-sm">{func.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {func.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Function Interface */}
        <div className="lg:col-span-3">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
