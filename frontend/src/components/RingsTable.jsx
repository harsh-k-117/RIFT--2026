import React, { useState, useMemo } from 'react';

function RingsTable({ rings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'risk_score', direction: 'desc' });
  const [expandedRow, setExpandedRow] = useState(null);

  if (!rings || rings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="inline-block bg-green-500/20 p-4 rounded-full border border-green-500/30 mb-4">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl text-gray-200 font-semibold">No fraud rings detected</p>
        <p className="text-sm text-gray-400 mt-2">This data appears clean ✓</p>
      </div>
    );
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredAndSortedRings = useMemo(() => {
    let filtered = rings.filter(ring =>
      ring.ring_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ring.pattern_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ring.member_accounts?.some(acc => acc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'member_accounts') {
          aVal = a.member_accounts?.length || 0;
          bVal = b.member_accounts?.length || 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [rings, searchTerm, sortConfig]);

  const getRiskBadge = (score) => {
    if (score >= 80) {
      return 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500';
    } else if (score >= 60) {
      return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white border-orange-500';
    } else if (score >= 40) {
      return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-yellow-500';
    }
    return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500';
  };

  const getPatternBadge = (type) => {
    const badges = {
      'Circular Money Flow': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Smurfing Network': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Shell Company Network': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Unknown': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return badges[type] || badges['Unknown'];
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by Ring ID, Pattern Type, or Account ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pl-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
        />
        <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-3 bg-gray-700 hover:bg-gray-600 rounded-full p-1 transition"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-800/30 rounded-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
            <tr>
              <th 
                onClick={() => handleSort('ring_id')}
                className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition group"
              >
                <div className="flex items-center gap-2">
                  Ring ID
                  <SortIcon columnKey="ring_id" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('pattern_type')}
                className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition group"
              >
                <div className="flex items-center gap-2">
                  Pattern Type
                  <SortIcon columnKey="pattern_type" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('member_accounts')}
                className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition group"
              >
                <div className="flex items-center gap-2">
                  Members
                  <SortIcon columnKey="member_accounts" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('risk_score')}
                className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition group"
              >
                <div className="flex items-center gap-2">
                  Risk Score
                  <SortIcon columnKey="risk_score" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredAndSortedRings.map((ring, index) => (
              <React.Fragment key={index}>
                <tr 
                  className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500/20 p-1.5 rounded border border-blue-500/30">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-gray-200">{ring.ring_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg border ${getPatternBadge(ring.pattern_type)}`}>
                      {ring.pattern_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30">
                        <span className="text-purple-300 font-bold text-sm">{ring.member_accounts?.length || 0}</span>
                      </div>
                      <span className="text-gray-400 text-xs">accounts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 inline-flex text-sm font-bold rounded-lg border ${getRiskBadge(ring.risk_score)}`}>
                        {ring.risk_score}
                      </span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${ring.risk_score >= 80 ? 'bg-red-500' : ring.risk_score >= 60 ? 'bg-orange-500' : ring.risk_score >= 40 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                          style={{ width: `${ring.risk_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRow(expandedRow === index ? null : index);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-1 transition"
                    >
                      {expandedRow === index ? 'Hide' : 'Expand'}
                      <svg className={`w-4 h-4 transition-transform ${expandedRow === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </td>
                </tr>
                {expandedRow === index && (
                  <tr className="bg-gray-900/50">
                    <td colSpan="5" className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Member Accounts ({ring.member_accounts?.length || 0})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ring.member_accounts?.map((acc, i) => (
                              <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-xs font-mono border border-gray-700">
                                {acc}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Network Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Pattern:</span>
                              <span className="text-gray-200 font-semibold">{ring.pattern_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Risk Level:</span>
                              <span className={`font-bold ${ring.risk_score >= 80 ? 'text-red-400' : ring.risk_score >= 60 ? 'text-orange-400' : ring.risk_score >= 40 ? 'text-yellow-400' : 'text-blue-400'}`}>
                                {ring.risk_score >= 80 ? 'CRITICAL' : ring.risk_score >= 60 ? 'HIGH' : ring.risk_score >= 40 ? 'MEDIUM' : 'LOW'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedRings.length === 0 && searchTerm && (
        <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-400">No results found for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

export default RingsTable;
