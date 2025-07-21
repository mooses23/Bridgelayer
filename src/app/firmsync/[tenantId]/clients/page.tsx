// src/app/firmsync/tenant/clients/page.tsx
// Client management interface - Add, edit, view client information and contact details

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">Manage your client relationships and information</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add New Client
          </button>
        </div>

        {/* Clients Content Placeholder */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Directory</h3>
            <p className="text-gray-600">Client list, contact information, and case associations will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
