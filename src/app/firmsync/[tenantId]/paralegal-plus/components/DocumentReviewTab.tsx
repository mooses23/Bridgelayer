// src/app/firmsync/[tenantId]/paralegal-plus/components/DocumentReviewTab.tsx
// AI-powered document review and analysis

'use client';

import { useState } from 'react';

interface DocumentReviewTabProps {
  tenantId: string;
  previewMode?: boolean;
}

interface ReviewedDocument {
  id: string;
  name: string;
  uploadedAt: string;
  status: 'reviewing' | 'completed' | 'flagged';
  summary?: string;
  keyFindings?: string[];
  issues?: Array<{ type: string; description: string; severity: string }>;
  metadata?: {
    pages: number;
    wordCount: number;
    parties: string[];
    dates: string[];
  };
}

export function DocumentReviewTab({ tenantId, previewMode = false }: DocumentReviewTabProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<ReviewedDocument[]>([
    {
      id: '1',
      name: 'Settlement_Agreement_Draft.pdf',
      uploadedAt: '2024-01-20T10:30:00Z',
      status: 'completed',
      summary: 'Settlement agreement between plaintiff and defendant resolving all claims. Total settlement amount $450,000 with structured payment terms.',
      keyFindings: [
        'Payment terms: $200,000 upfront, $250,000 over 24 months',
        'Mutual release of all claims',
        'Confidentiality provisions included',
        'No admission of liability clause present',
      ],
      issues: [
        {
          type: 'Missing Provision',
          description: 'No indemnification clause for future claims',
          severity: 'Medium',
        },
      ],
      metadata: {
        pages: 12,
        wordCount: 3420,
        parties: ['Smith Corp', 'Johnson LLC'],
        dates: ['2024-02-15', '2024-03-01'],
      },
    },
  ]);

  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || previewMode) return;

    const newDocuments: ReviewedDocument[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      uploadedAt: new Date().toISOString(),
      status: 'reviewing',
    }));

    setUploadedDocuments((prev) => [...newDocuments, ...prev]);

    // Simulate AI review
    newDocuments.forEach((doc, index) => {
      setTimeout(() => {
        setUploadedDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  status: 'completed',
                  summary: 'AI analysis completed. Document has been reviewed for key terms, obligations, and potential issues.',
                  keyFindings: [
                    'Contract term: 12 months with automatic renewal',
                    'Payment obligations: Net 30 days',
                    'Termination clause: 60 days written notice',
                  ],
                  metadata: {
                    pages: Math.floor(Math.random() * 20) + 5,
                    wordCount: Math.floor(Math.random() * 5000) + 1000,
                    parties: ['Party A', 'Party B'],
                    dates: [new Date().toISOString().split('T')[0]],
                  },
                }
              : d
          )
        );
      }, 3000 + index * 1000);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const currentDocument = uploadedDocuments.find((doc) => doc.id === selectedDocument);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Review</h2>
        <p className="text-gray-600 mb-6">
          Upload documents for AI-powered analysis. Get summaries, extract key terms, and identify potential issues.
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-700 font-medium mb-2">
            Drag and drop documents here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports PDF, DOCX, TXT (Max 50MB per file)
          </p>
          <label
            htmlFor="file-upload"
            className={`inline-block px-4 py-2 rounded-md font-medium cursor-pointer ${
              previewMode
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Select Files
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={previewMode}
            className="hidden"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded Documents ({uploadedDocuments.length})
            </h3>

            <div className="space-y-3">
              {uploadedDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedDocument === doc.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          doc.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'reviewing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status === 'reviewing' && '🔄 '}
                        {doc.status === 'completed' && '✓ '}
                        {doc.status === 'flagged' && '⚠ '}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="col-span-12 lg:col-span-7">
          {currentDocument ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentDocument.name}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded {new Date(currentDocument.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Download
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    Share
                  </button>
                </div>
              </div>

              {currentDocument.status === 'reviewing' ? (
                <div className="text-center py-12">
                  <svg className="animate-spin w-10 h-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">AI is reviewing document...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Metadata */}
                  {currentDocument.metadata && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Pages</p>
                        <p className="text-lg font-semibold text-gray-900">{currentDocument.metadata.pages}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Word Count</p>
                        <p className="text-lg font-semibold text-gray-900">{currentDocument.metadata.wordCount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Parties</p>
                        <p className="text-lg font-semibold text-gray-900">{currentDocument.metadata.parties.length}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Key Dates</p>
                        <p className="text-lg font-semibold text-gray-900">{currentDocument.metadata.dates.length}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {currentDocument.summary && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{currentDocument.summary}</p>
                    </div>
                  )}

                  {/* Key Findings */}
                  {currentDocument.keyFindings && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Findings</h4>
                      <ul className="space-y-2">
                        {currentDocument.keyFindings.map((finding, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Issues */}
                  {currentDocument.issues && currentDocument.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Potential Issues</h4>
                      <div className="space-y-3">
                        {currentDocument.issues.map((issue, index) => (
                          <div key={index} className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-1">
                              <span className="font-medium text-gray-900">{issue.type}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  issue.severity === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : issue.severity === 'Medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a document to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
