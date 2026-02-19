import React, { useState } from 'react';
import HomePage from './pages/HomePage';

function App() {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">👁️ Fraud Netra</h1>
          <p className="text-blue-100 mt-1">Financial Crime Detection Engine</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <HomePage analysisData={analysisData} setAnalysisData={setAnalysisData} />
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>👁️ Fraud Netra | RIFT 2026 Hackathon - Money Muling Detection Engine</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
