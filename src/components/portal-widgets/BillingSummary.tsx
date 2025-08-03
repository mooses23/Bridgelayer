// src/components/portal-widgets/BillingSummary.tsx
import React from 'react';

const BillingSummary = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Overview</h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">$1,250.00</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Overdue Invoices</p>
          <p className="text-xl font-semibold text-yellow-600">2</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Next Payment Due</p>
          <p className="text-md text-gray-700">August 15, 2025</p>
        </div>
      </div>
      <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
        View Billing
      </button>
    </div>
  );
};

export default BillingSummary;
