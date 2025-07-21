// Protected by middleware (admin-only access)
// src/app/firmsync/admin/dashboard/page.tsx
// Admin dashboard with overview metrics and quick actions

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to FirmSync Admin
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Build custom law firm portals with integrated SaaS tools and AI-powered features
          </p>
          <div className="flex space-x-4">
            <a 
              href="/firmsync/admin/firms"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add New Firm
            </a>
            <a 
              href="/firmsync/admin/preview"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Preview Portal
            </a>
          </div>
        </div>

        {/* Coming Soon Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Coming Soon: FirmSync Admin Dashboard Metrics
            </h3>
            <p className="text-gray-600 mb-6">
              Real-time analytics, tenant portal usage, integration status, and AI agent performance metrics will be displayed here.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="bg-gray-50 rounded p-3">
                <div className="font-medium">Active Tenants</div>
                <div className="text-lg font-bold text-gray-400">--</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="font-medium">AI Interactions</div>
                <div className="text-lg font-bold text-gray-400">--</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a 
            href="/firmsync/admin/firms"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🏢</span>
              <h3 className="text-lg font-semibold text-gray-900">Manage Firms</h3>
            </div>
            <p className="text-gray-600">Add new law firms and configure tenant settings</p>
          </a>

          <a 
            href="/firmsync/admin/integrations"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🔗</span>
              <h3 className="text-lg font-semibold text-gray-900">Configure Integrations</h3>
            </div>
            <p className="text-gray-600">Set up external SaaS tool integrations per tenant</p>
          </a>

          <a 
            href="/firmsync/admin/llm"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🤖</span>
              <h3 className="text-lg font-semibold text-gray-900">AI Agents</h3>
            </div>
            <p className="text-gray-600">Configure AI agents for each tenant portal tab</p>
          </a>
        </div>
      </div>
    </div>
  );
}
