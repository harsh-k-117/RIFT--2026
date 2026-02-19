import React from 'react';

function RingsTable({ rings }) {
  if (!rings || rings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No fraud rings detected</p>
        <p className="text-sm mt-2">This data appears clean ✓</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ring ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pattern Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member Count
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member IDs
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rings.map((ring, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {ring.ring_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                  {ring.pattern_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ring.member_accounts?.length || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`font-semibold ${
                    ring.risk_score >= 80
                      ? 'text-red-600'
                      : ring.risk_score >= 50
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {ring.risk_score}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div className="max-w-xs truncate" title={ring.member_accounts?.join(', ')}>
                  {ring.member_accounts?.join(', ')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RingsTable;
