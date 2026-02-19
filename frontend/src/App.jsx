import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [systemStatus, setSystemStatus] = useState('ready');

  // Create floating particles
  useEffect(() => {
    const particles = document.querySelector('.particles-container');
    if (!particles) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${15 + Math.random() * 15}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particles.appendChild(particle);
    }
  }, []);

  const getStatusInfo = () => {
    if (analysisData) return { text: 'System Active', color: 'bg-green-500', icon: '✓' };
    if (systemStatus === 'loading') return { text: 'Analyzing...', color: 'bg-yellow-500', icon: '◐' };
    return { text: 'System Active', color: 'bg-green-500', icon: '●' };
  };

  const status = getStatusInfo();

  return (
    <div className="min-h-screen w-full relative cyber-grid">
      {/* Floating Particles Background */}
      <div className="particles-container fixed inset-0 z-0 pointer-events-none"></div>

      {/* Premium Navbar with Glassmorphism */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center gap-4 animate-slide-in-left">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <span className="gradient-text">Fraud Netra</span>
                </h1>
                <p className="text-blue-300/80 text-xs font-medium tracking-wide">
                  Graph Intelligence for Financial Crime Detection
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="animate-slide-in-right">
              <div className="glass px-6 py-3 rounded-full flex items-center gap-3 shadow-lg hover:scale-105 transition-transform">
                <div className={`w-2.5 h-2.5 rounded-full ${status.color} status-pulse shadow-lg`}></div>
                <span className="text-gray-200 text-sm font-semibold tracking-wide">
                  {status.text}
                </span>
                <span className={`text-lg ${status.color.replace('bg-', 'text-')}`}>{status.icon}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10">
        <HomePage 
          analysisData={analysisData} 
          setAnalysisData={setAnalysisData}
          setSystemStatus={setSystemStatus}
        />
      </main>

      {/* Premium Footer */}
      <footer className="relative z-10 mt-20 glass-strong border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              <span className="font-semibold gradient-text-static">Fraud Netra</span> 
              <span className="mx-2">•</span>
              Financial Crime Intelligence Platform
              <span className="mx-2">•</span>
              RIFT 2026
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/10 transition cursor-pointer">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/10 transition cursor-pointer">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
