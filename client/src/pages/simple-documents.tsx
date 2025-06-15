import { useState } from "react";

export default function SimpleDocuments() {
  const [documentType, setDocumentType] = useState("");
  const [county, setCounty] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const documentTypes = [
    { id: 'eviction-notice', name: 'Eviction Notice' },
    { id: 'rent-demand', name: 'Rent Demand Letter' },
    { id: 'lease-agreement', name: 'Lease Agreement' },
    { id: 'employment-contract', name: 'Employment Contract' }
  ];

  const counties = [
    'Los Angeles County',
    'Orange County', 
    'Riverside County',
    'San Bernardino County'
  ];

  const handleGenerate = async () => {
    if (!documentType || !county || !tenantName || !propertyAddress || !rentAmount) {
      alert("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType,
          county,
          formData: {
            tenantName,
            propertyAddress,
            rentAmount,
            noticeDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      setGeneratedDocument(data.document);
    } catch (error) {
      alert("Error generating document: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
        Document Generator
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Configuration Panel */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Document Configuration</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Document Type *</label>
            <select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">Select document type</option>
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>County/Region *</label>
            <select 
              value={county} 
              onChange={(e) => setCounty(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">Select county</option>
              {counties.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tenant Name *</label>
            <input 
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Enter tenant name"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Property Address *</label>
            <textarea 
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Enter property address"
              rows={3}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Rent Amount *</label>
            <input 
              type="text"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              placeholder="Enter rent amount"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: isGenerating ? '#9ca3af' : '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '16px',
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? 'Generating Document...' : 'Generate Document'}
          </button>
        </div>

        {/* Generated Document Panel */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Generated Document</h2>
          
          {generatedDocument ? (
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', minHeight: '400px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
                {generatedDocument}
              </pre>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '400px',
              color: '#6b7280' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>No document generated yet</p>
              <p style={{ fontSize: '14px' }}>Configure your document settings and click Generate Document</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}