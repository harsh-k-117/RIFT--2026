import React, { useState, useMemo } from 'react';

function RingsTable({ rings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'risk_score', direction: 'desc' });
  const [expandedRow, setExpandedRow] = useState(null);

  if (!rings || rings.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl border border-green-500/20">
        <div className="inline-block bg-gradient-to-br from-green-500/20 to-emerald-600/10 p-5 rounded-2xl border border-green-500/30 mb-4 shadow-lg">
          <svg className="w-14 h-14 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-2xl text-white font-bold mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          No Fraud Rings Detected
        </p>
        <p className="text-sm text-gray-400">Dataset appears clean • No suspicious patterns identified</p>
        <div className="mt-6 inline-block glass px-6 py-3 rounded-xl">
          <span className="text-xs text-green-400 font-semibold">✓ All Clear</span>
        </div>
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
    <div className="space-y-5">
      {/* Premium Search Bar */}
      <div className="glass-card p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search by Ring ID, Pattern Type, or Account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass border-0 rounded-xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-medium"
            style={{fontFamily: 'Space Grotesk, sans-serif'}}
          />
          <svg className="absolute left-4 top-4 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3.5 glass hover:bg-white/10 rounded-lg p-1.5 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800/30 rounded-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
            <tr>
              <th 
                onClick={() => handleSort('ring_id')}
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-400 transition group"
                style={{fontFamily: 'Space Grotesk, sans-serif'}}
              >
                <div className="flex items-center gap-2">
                  🎯 Ring ID
                  <SortIcon columnKey="ring_id" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('pattern_type')}
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-400 transition group"
                style={{fontFamily: 'Space Grotesk, sans-serif'}}
              >
                <div className="flex items-center gap-2">
                  🧩 Pattern Type
                  <SortIcon columnKey="pattern_type" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('member_accounts')}
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-400 transition group"
                style={{fontFamily: 'Space Grotesk, sans-serif'}}
              >
                <div className="flex items-center gap-2">
                  👥 Members
                  <SortIcon columnKey="member_accounts" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('risk_score')}
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-400 transition group"
                style={{fontFamily: 'Space Grotesk, sans-serif'}}
              >
                <div className="flex items-center gap-2">
                  ⚡ Risk Score
                  <SortIcon columnKey="risk_score" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAndSortedRings.map((ring, index) => (
              <React.Fragment key={index}>
                <tr 
                  className="hover:bg-white/5 transition-all duration-200 cursor-pointer group"
                  onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/10 p-2 rounded-xl border border-blue-500/30">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{ring.ring_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-4 py-2 inline-flex text-xs font-bold rounded-xl border ${ getPatternBadge(ring.pattern_type)}`}>
                      {ring.pattern_type}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="glass-strong px-4 py-2 rounded-xl border border-purple-500/30">
                        <span className="text-purple-300 font-bold text-sm" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{ring.member_accounts?.length || 0}</span>
                      </div>
                      <span className="text-gray-400 text-xs">nodes</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <span className={`px-5 py-2 inline-flex text-sm font-bold rounded-xl border shadow-lg ${getRiskBadge(ring.risk_score)}`} style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                        {ring.risk_score}
                      </span>
                      <div className="w-28 glass-strong rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${ring.risk_score >= 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : ring.risk_score >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : ring.risk_score >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                          style={{ width: `${ring.risk_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRow(expandedRow === index ? null : index);
                      }}
                      className="glass hover:bg-white/10 px-4 py-2 rounded-lg text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                      {expandedRow === index ? 'Collapse' : 'Details'}
                      <svg className={`w-4 h-4 transition-transform duration-300 ${expandedRow === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </td>
                </tr>
                {expandedRow === index && (
                  <tr className="glass-strong animate-fade-in-up">
                    <td colSpan="5" className="px-6 py-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="glass-card p-5 rounded-xl border border-white/10">
                          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Network Members <span className="text-blue-400">({ring.member_accounts?.length || 0})</span>
                          </h4>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {ring.member_accounts?.map((acc, i) => (
                              <span key={i} className="glass hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg text-xs font-mono border border-white/10 transition">
                                {acc}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="glass-card p-5 rounded-xl border border-white/10">
                          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Forensic Analysis
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center glass px-4 py-3 rounded-lg">
                              <span className="text-gray-400">Pattern Type:</span>
                              <span className="text-white font-semibold">{ring.pattern_type}</span>
                            </div>
                            <div className="flex justify-between items-center glass px-4 py-3 rounded-lg">
                              <span className="text-gray-400">Threat Level:</span>
                              <span className={`font-bold ${
                                ring.risk_score >= 80 ? 'text-red-400' : 
                                ring.risk_score >= 60 ? 'text-orange-400' : 
                                ring.risk_score >= 40 ? 'text-yellow-400' : 'text-blue-400'
                              }`}>
                                {ring.risk_score >= 80 ? '🔴 CRITICAL' : ring.risk_score >= 60 ? '🟠 HIGH' : ring.risk_score >= 40 ? '🟡 MEDIUM' : '🔵 LOW'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center glass px-4 py-3 rounded-lg">
                              <span className="text-gray-400">Risk Score:</span>
                              <span className="text-white font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{ring.risk_score}/100</span>
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
        <div className="text-center py-12 glass-card rounded-2xl border border-white/10">
          <div className="inline-block glass px-6 py-6 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg font-semibold mb-2">No Results Found</p>
          <p className="text-gray-500 text-sm">No rings match "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

export default RingsTable;
