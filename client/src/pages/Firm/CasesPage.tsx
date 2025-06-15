export default function CasesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          <p className="mt-2 text-gray-600">Manage your active cases and legal matters</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-4">
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option>All Practice Areas</option>
            <option>Corporate Law</option>
            <option>Litigation</option>
            <option>Employment</option>
          </select>
          <input 
            type="text" 
            placeholder="Search cases..." 
            className="border border-gray-300 rounded-md px-3 py-2 flex-1"
          />
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Case Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matter Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Attorney
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Deadline
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                CASE-2025-001
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ABC Corporation
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Contract Dispute
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Sarah Johnson
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Jan 20, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                CASE-2025-002
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                XYZ LLC
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Employment Matter
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Michael Chen
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Jan 25, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}