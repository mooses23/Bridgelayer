// src/app/firmsync/tenant/docsign/page.tsx
// Document signing workflow - Electronic signature management and document approval processes

export default function DocSignPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DocSign</h1>
            <p className="text-gray-600 mt-2">Electronic document signing and approval workflows</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Send for Signature
          </button>
        </div>

        {/* DocSign Content Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Signatures</h3>
            <p className="text-gray-600">Documents awaiting client or counterparty signatures will be listed here</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Documents</h3>
            <p className="text-gray-600">Fully executed documents and signature history will be available here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
