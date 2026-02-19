import React from 'react';
import FileUpload from '../components/FileUpload';
import GraphVisualization from '../components/GraphVisualization';
import RingsTable from '../components/RingsTable';

function HomePage({ analysisData, setAnalysisData, setSystemStatus }) {
  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">
              Transaction Data Upload
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Upload CSV with transaction_id, sender_id, receiver_id, amount, timestamp
            </p>
          </div>
        </div>
        <FileUpload onAnalysisComplete={setAnalysisData} setSystemStatus={setSystemStatus} />
      </div>

      {/* Results Section */}
      {analysisData && (
        <>
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Transactions Card */}
            <div className="group bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl shadow-lg border border-blue-700/50 p-6 hover:shadow-blue-500/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-blue-300 text-sm font-medium uppercase tracking-wide">Total Transactions</p>
              <p className="text-4xl font-bold text-white mt-2 group-hover:text-blue-300 transition-colors">
                {analysisData.total_transactions.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-2">Analyzed in dataset</p>
            </div>

            {/* Unique Accounts Card */}
            <div className="group bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl shadow-lg border border-purple-700/50 p-6 hover:shadow-purple-500/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-purple-300 text-sm font-medium uppercase tracking-wide">Unique Accounts</p>
              <p className="text-4xl font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                {analysisData.total_accounts.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-2">Network participants</p>
            </div>

            {/* Suspicious Accounts Card */}
            <div className="group bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-xl shadow-lg border border-orange-700/50 p-6 hover:shadow-orange-500/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-orange-300 text-sm font-medium uppercase tracking-wide">Suspicious Accounts</p>
              <p className="text-4xl font-bold text-white mt-2 group-hover:text-orange-300 transition-colors">
                {analysisData.suspicious_accounts_flagged.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-2">⚠ High-risk entities detected</p>
            </div>

            {/* Fraud Rings Card */}
            <div className="group bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-xl shadow-lg border border-red-700/50 p-6 hover:shadow-red-500/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-red-300 text-sm font-medium uppercase tracking-wide">Fraud Rings Detected</p>
              <p className="text-4xl font-bold text-white mt-2 group-hover:text-red-300 transition-colors">
                {analysisData.fraud_rings_detected.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-2">🚨 Criminal networks identified</p>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/30">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">
                    Transaction Intelligence Network
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Interactive graph-based fraud pattern analysis
                  </p>
                </div>
              </div>
            </div>
            <GraphVisualization 
              data={analysisData.data} 
              graphData={analysisData.graph}
            />
          </div>

          {/* Fraud Rings Table */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-100">
                  Detected Fraud Networks
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Identified suspicious transaction clusters
                </p>
              </div>
            </div>
            <RingsTable rings={analysisData.data.fraud_rings} />
          </div>

          {/* Download Report */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">Export Investigation Report</h3>
                  <p className="text-gray-400 text-sm">Complete analysis in JSON format</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(analysisData.data, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `fraud-netra-analysis-${analysisData.analysis_id}.json`;
                  link.click();
                  
                  // Success toast simulation
                  const toast = document.createElement('div');
                  toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg border border-green-500 animate-bounce';
                  toast.innerText = '✓ Report downloaded successfully';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 3000);
                }}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Download JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
