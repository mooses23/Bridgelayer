// src/app/firmsync/tenant/dashboard/page.tsx
// Main dashboard for FirmSync tenant - Overview of firm activities, metrics, and quick actions

export default function TenantDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Firm Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your firm&apos;s command center</p>
        </div>

        {/* Dashboard Content Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Cases</h3>
            <p className="text-gray-600">Overview of active cases and recent updates</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Activity</h3>
            <p className="text-gray-600">Latest client interactions and communications</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Deadlines</h3>
            <p className="text-gray-600">Important dates and calendar reminders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
