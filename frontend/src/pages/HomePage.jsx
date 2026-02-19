import React, { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload';
import GraphVisualization from '../components/GraphVisualization';
import RingsTable from '../components/RingsTable';

function HomePage({ analysisData, setAnalysisData, setSystemStatus }) {
  const [counters, setCounters] = useState({
    transactions: 0,
    accounts: 0,
    suspicious: 0,
    rings: 0
  });

  // Animated counter effect
  useEffect(() => {
    if (!analysisData) return;
    
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      transactions: analysisData.total_transactions || 0,
      accounts: analysisData.total_accounts || 0,
      suspicious: analysisData.suspicious_accounts_flagged || 0,
      rings: analysisData.fraud_rings_detected || 0
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounters({
        transactions: Math.floor(targets.transactions * easeOut),
        accounts: Math.floor(targets.accounts * easeOut),
        suspicious: Math.floor(targets.suspicious * easeOut),
        rings: Math.floor(targets.rings * easeOut)
      });

      if (step >= steps) {
        setCounters(targets);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [analysisData]);

  return (
    <div className="w-full pb-20">
      {/* Hero Section */}
      {!analysisData && (
        <div className="relative overflow-hidden w-full py-12">
          <div className="max-w-7xl mx-auto px-6 py-12 w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Hero Text */}
              <div className="space-y-6 animate-slide-in-left">
                <div className="inline-block">
                  <div className="glass px-4 py-2 rounded-full text-sm font-semibold text-blue-300 border border-blue-500/30 mb-4">
                    🚀 Powered by Graph Intelligence AI
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <span className="gradient-text text-glow">
                    Financial Crime
                  </span>
                  <br />
                  <span className="text-white text-shadow-lg">
                    Intelligence Engine
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed font-light">
                  Detect hidden <span className="text-red-400 font-semibold">money mule networks</span> using 
                  advanced graph intelligence and real-time forensic analysis.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="glass-card px-6 py-4 rounded-xl">
                    <div className="text-3xl font-bold gradient-text-static">99.2%</div>
                    <div className="text-xs text-gray-400 mt-1">Detection Rate</div>
                  </div>
                  <div className="glass-card px-6 py-4 rounded-xl">
                    <div className="text-3xl font-bold gradient-text-static">&lt;0.3s</div>
                    <div className="text-xs text-gray-400 mt-1">Analysis Speed</div>
                  </div>
                  <div className="glass-card px-6 py-4 rounded-xl">
                    <div className="text-3xl font-bold gradient-text-static">Real-time</div>
                    <div className="text-xs text-gray-400 mt-1">Processing</div>
                  </div>
                </div>
              </div>

              {/* Right: Animated Network Visualization */}
              <div className="relative animate-slide-in-right animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
                <div className="relative glass-card p-8 rounded-2xl">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Animated network nodes */}
                    <circle cx="100" cy="100" r="8" fill="#EF4444" className="animate-pulse">
                      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="60" cy="60" r="6" fill="#F59E0B" opacity="0.8">
                      <animate attributeName="cy" values="60;55;60" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="140" cy="60" r="6" fill="#F59E0B" opacity="0.8">
                      <animate attributeName="cy" values="60;65;60" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="60" cy="140" r="6" fill="#3B82F6" opacity="0.6">
                      <animate attributeName="cx" values="60;55;60" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="140" cy="140" r="6" fill="#3B82F6" opacity="0.6">
                      <animate attributeName="cx" values="140;145;140" dur="3.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="100" cy="30" r="5" fill="#10B981" opacity="0.7" />
                    <circle cx="30" cy="100" r="5" fill="#10B981" opacity="0.7" />
                    <circle cx="170" cy="100" r="5" fill="#10B981" opacity="0.7" />
                    <circle cx="100" cy="170" r="5" fill="#10B981" opacity="0.7" />

                    {/* Animated connecting lines */}
                    <line x1="100" y1="100" x2="60" y2="60" stroke="#60A5FA" strokeWidth="1" opacity="0.3">
                      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                    </line>
                    <line x1="100" y1="100" x2="140" y2="60" stroke="#60A5FA" strokeWidth="1" opacity="0.3">
                      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.3s" repeatCount="indefinite" />
                    </line>
                    <line x1="100" y1="100" x2="60" y2="140" stroke="#60A5FA" strokeWidth="1" opacity="0.3">
                      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.7s" repeatCount="indefinite" />
                    </line>
                    <line x1="100" y1="100" x2="140" y2="140" stroke="#60A5FA" strokeWidth="1" opacity="0.3">
                      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.1s" repeatCount="indefinite" />
                    </line>
                    <line x1="60" y1="60" x2="140" y2="60" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
                    <line x1="60" y1="140" x2="140" y2="140" stroke="#3B82F6" strokeWidth="1" opacity="0.2" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 -right-4 glass px-4 py-2 rounded-lg text-xs text-gray-300 font-semibold">
                  🔍 Live Network Analysis
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Upload Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-fade-in-up">
          <FileUpload 
            onAnalysisComplete={setAnalysisData} 
            setSystemStatus={setSystemStatus} 
          />
        </div>
      </div>

      {/* Results Section */}
      {analysisData && (
        <div className="max-w-7xl mx-auto px-6 space-y-12 py-12">
          {/* Premium Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Transactions */}
            <div className="card-premium glass-card p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-3 rounded-xl border border-blue-500/30">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full status-pulse"></div>
              </div>
              <div className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">
                Total Transactions
              </div>
              <div className="text-4xl font-bold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                {counters.transactions.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Analyzed in dataset</div>
            </div>

            {/* Unique Accounts */}
            <div className="card-premium glass-card p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-3 rounded-xl border border-purple-500/30">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-purple-500 rounded-full status-pulse"></div>
              </div>
              <div className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2">
                Unique Accounts
              </div>
              <div className="text-4xl font-bold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                {counters.accounts.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Network participants</div>
            </div>

            {/* Suspicious Accounts */}
            <div className="card-premium glass-card p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-3 rounded-xl border border-orange-500/30">
                  <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-orange-500 rounded-full status-pulse"></div>
              </div>
              <div className="text-sm font-semibold text-orange-300 uppercase tracking-wider mb-2">
                Suspicious Accounts
              </div>
              <div className="text-4xl font-bold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                {counters.suspicious.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">⚠ High-risk entities flagged</div>
            </div>

            {/* Fraud Rings */}
            <div className="card-premium glass-card p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-3 rounded-xl border border-red-500/30">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-red-500 rounded-full status-pulse"></div>
              </div>
              <div className="text-sm font-semibold text-red-300 uppercase tracking-wider mb-2">
                Fraud Rings Detected
              </div>
              <div className="text-4xl font-bold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                {counters.rings.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">🚨 Criminal networks identified</div>
            </div>
          </div>

          {/* Graph Intelligence Section */}
          <div className="glass-card p-8 rounded-2xl border border-white/10 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/10 p-3 rounded-xl border border-cyan-500/30">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                    Transaction Intelligence Network
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Interactive forensic graph visualization
                  </p>
                </div>
              </div>
            </div>
            <GraphVisualization 
              data={analysisData.data} 
              graphData={analysisData.graph}
            />
          </div>

          {/* Fraud Rings Panel */}
          <div className="glass-card p-8 rounded-2xl border border-white/10 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-3 rounded-xl border border-red-500/30">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  Detected Fraud Networks
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Identified suspicious transaction clusters
                </p>
              </div>
            </div>
            <RingsTable rings={analysisData.data.fraud_rings} />
          </div>

          {/* Export Section */}
          <div className="glass-card p-8 rounded-2xl border border-green-500/20 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 p-3 rounded-xl border border-green-500/30">
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                    Export Investigation Report
                  </h3>
                  <p className="text-gray-400 text-sm">Complete forensic analysis in JSON format</p>
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
                  
                  const toast = document.createElement('div');
                  toast.className = 'fixed bottom-4 right-4 glass-strong px-6 py-4 rounded-xl border border-green-500 shadow-2xl z-50';
                  toast.innerHTML = '<div class="flex items-center gap-3"><svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-white font-semibold">Report downloaded successfully!</span></div>';
                  document.body.appendChild(toast);
                  setTimeout(() => {
                    toast.style.animation = 'fadeInUp 0.3s ease-out reverse';
                    setTimeout(() => toast.remove(), 300);
                  }, 2500);
                }}
                className="btn-premium flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Download JSON Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
