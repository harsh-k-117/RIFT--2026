import React from 'react';
import FileUpload from '../components/FileUpload';
import GraphVisualization from '../components/GraphVisualization';
import RingsTable from '../components/RingsTable';

function HomePage({ analysisData, setAnalysisData }) {
  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Upload Transaction Data
        </h2>
        <FileUpload onAnalysisComplete={setAnalysisData} />
      </div>

      {/* Results Section */}
      {analysisData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-800">
                {analysisData.total_accounts}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">
                {analysisData.total_transactions}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Suspicious Accounts</p>
              <p className="text-2xl font-bold text-red-600">
                {analysisData.suspicious_accounts_flagged}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-sm">Fraud Rings</p>
              <p className="text-2xl font-bold text-orange-600">
                {analysisData.fraud_rings_detected}
              </p>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Transaction Network
            </h2>
            <GraphVisualization 
              data={analysisData.data} 
              graphData={analysisData.graph}
            />
          </div>

          {/* Fraud Rings Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Detected Fraud Rings
            </h2>
            <RingsTable rings={analysisData.data.fraud_rings} />
          </div>

          {/* Download JSON */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(analysisData.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `aegisgraph-analysis-${analysisData.analysis_id}.json`;
                link.click();
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              📥 Download JSON Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
