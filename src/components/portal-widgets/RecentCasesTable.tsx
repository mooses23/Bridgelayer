// src/components/portal-widgets/RecentCasesTable.tsx
import React from 'react';

const RecentCasesTable = () => {
  const cases = [
    { name: 'Johnson v. Smith', lastUpdated: '2025-07-30', status: 'Active' },
    { name: 'Williams Estate', lastUpdated: '2025-07-28', status: 'Pending' },
    { name: 'Brown LLC Formation', lastUpdated: '2025-07-25', status: 'Closed' },
    { name: 'Davis Contract Review', lastUpdated: '2025-07-22', status: 'Active' },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Cases</h3>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              Case Name
            </th>
            <th scope="col" className="px-6 py-3">
              Last Updated
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem, index) => (
            <tr key={index} className="bg-white border-b">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {caseItem.name}
              </th>
              <td className="px-6 py-4">
                {caseItem.lastUpdated}
              </td>
              <td className="px-6 py-4">
                {caseItem.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="#" className="mt-4 inline-block text-blue-600 hover:underline">
        View All Cases
      </a>
    </div>
  );
};

export default RecentCasesTable;
