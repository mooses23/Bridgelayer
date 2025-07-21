// src/app/firmsync/tenant/[tenantId]/clients/components/DocumentUploadsGrid.tsx
// Document uploads grid with AI categorization and webhook triggers

'use client';

import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  category: 'contract' | 'evidence' | 'correspondence' | 'legal_brief' | 'medical' | 'financial' | 'other';
  ai_category?: string;
  ai_confidence?: number;
  tags: string[];
  is_confidential: boolean;
  download_url: string;
  preview_url?: string;
  ai_summary?: string;
  ocr_text?: string;
}

interface DocumentUploadsGridProps {
  clientId: string;
  documents: Document[];
  onUpload: (files: FileList) => void;
  onDelete: (documentId: string) => void;
  onUpdateCategory: (documentId: string, category: string) => void;
  aiCategorizationEnabled?: boolean;
  webhookTriggersEnabled?: boolean;
}

export function DocumentUploadsGrid({
  clientId,
  documents,
  onUpload,
  onDelete,
  onUpdateCategory,
  aiCategorizationEnabled = false,
  webhookTriggersEnabled = false
}: DocumentUploadsGridProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files?.length) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    // Simulate upload process with AI categorization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (aiCategorizationEnabled) {
      // TODO: Replace with actual AI categorization service
      console.log('🤖 AI categorizing uploaded documents...');
    }
    
    if (webhookTriggersEnabled) {
      // TODO: Replace with actual webhook system
      console.log('🔗 Triggering document upload webhooks...');
    }
    
    onUpload(files);
    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (fileType.includes('image')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'evidence': return 'bg-red-100 text-red-800';
      case 'correspondence': return 'bg-green-100 text-green-800';
      case 'legal_brief': return 'bg-purple-100 text-purple-800';
      case 'medical': return 'bg-pink-100 text-pink-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterCategory === 'all') return true;
    return doc.category === filterCategory;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'grid' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm border-l border-gray-300 ${
                viewMode === 'list' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>

          <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer font-medium">
            Upload Files
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-gray-200">
          {[
            { key: 'all', label: 'All Documents' },
            { key: 'contract', label: 'Contracts' },
            { key: 'evidence', label: 'Evidence' },
            { key: 'correspondence', label: 'Correspondence' },
            { key: 'legal_brief', label: 'Legal Briefs' },
            { key: 'medical', label: 'Medical' },
            { key: 'financial', label: 'Financial' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterCategory(filter.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                filterCategory === filter.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Status Bar */}
      {(aiCategorizationEnabled || webhookTriggersEnabled) && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-blue-900">Smart Document Processing Enabled</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-blue-700">
              {aiCategorizationEnabled && <span>• Auto-categorization</span>}
              {webhookTriggersEnabled && <span>• Webhook triggers</span>}
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        className={`mb-6 p-6 border-2 border-dashed rounded-lg transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="text-center">
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin mx-auto w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-600">
                {aiCategorizationEnabled ? 'Uploading and categorizing...' : 'Uploading files...'}
              </p>
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
              <p className="text-gray-600">
                <strong>Drag files here</strong> or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, TXT, JPG, PNG up to 50MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* Documents Display */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-2">
            {filterCategory === 'all' ? 'No documents uploaded yet' : `No ${filterCategory} documents`}
          </p>
          <label className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
            Upload your first document
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                {getFileIcon(doc.file_type)}
                <button
                  onClick={() => onDelete(doc.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <h4 className="font-medium text-gray-900 text-sm mb-1 truncate" title={doc.name}>
                {doc.name}
              </h4>
              
              <p className="text-xs text-gray-500 mb-2">{formatFileSize(doc.file_size)}</p>

              <div className="space-y-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                  {doc.category.replace('_', ' ')}
                </span>

                {doc.ai_category && aiCategorizationEnabled && (
                  <div className="text-xs text-blue-600">
                    🤖 AI: {doc.ai_category} ({doc.ai_confidence}% confidence)
                  </div>
                )}

                {doc.is_confidential && (
                  <div className="flex items-center text-xs text-red-600">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Confidential
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </span>
                  <a
                    href={doc.download_url}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex-shrink-0 mr-3">
                {getFileIcon(doc.file_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                      {doc.category.replace('_', ' ')}
                    </span>
                    {doc.is_confidential && (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    <span>by {doc.uploaded_by}</span>
                    {doc.ai_category && aiCategorizationEnabled && (
                      <span className="text-blue-600">🤖 {doc.ai_category}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.download_url}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {doc.ai_summary && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <strong>AI Summary:</strong> {doc.ai_summary}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
