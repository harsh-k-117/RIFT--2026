import React, { useState } from 'react';
import HomePage from './pages/HomePage';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [systemStatus, setSystemStatus] = useState('ready');

  const getStatusInfo = () => {
    if (analysisData) return { text: 'Analysis Complete', color: 'bg-green-500', dot: '●' };
    if (systemStatus === 'loading') return { text: 'Processing...', color: 'bg-yellow-500', dot: '●' };
    return { text: 'System Ready', color: 'bg-blue-500', dot: '●' };
  };

  const status = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 border-b border-blue-800 shadow-2xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-4xl">👁️</div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Fraud Netra
                  </h1>
                  <p className="text-blue-300 text-sm mt-0.5 font-medium">
                    Real-time Money Mule Detection using Graph Intelligence
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
              <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}></div>
              <span className="text-gray-300 text-sm font-medium">{status.text}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <HomePage 
          analysisData={analysisData} 
          setAnalysisData={setAnalysisData}
          setSystemStatus={setSystemStatus}
        />
      </main>

      <footer className="bg-gray-900/80 border-t border-gray-800 text-gray-400 py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">👁️ <span className="text-blue-400 font-semibold">Fraud Netra</span> | Financial Crime Intelligence Dashboard | RIFT 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
