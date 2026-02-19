import React, { useState } from 'react';
import { uploadCSV } from '../services/api';

function FileUpload({ onAnalysisComplete, setSystemStatus }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSystemStatus && setSystemStatus('loading');

    try {
      // Loading stages for UX
      setLoadingStage('Uploading file...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStage('Building transaction graph...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStage('Running fraud detection algorithms...');
      const result = await uploadCSV(file);
      
      setLoadingStage('Analyzing mule networks...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAnalysisComplete(result);
      
      // Success animation
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-500 animate-bounce z-50';
      toast.innerHTML = '<div class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="font-bold">Analysis Complete!</span></div>';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to process file');
      setSystemStatus && setSystemStatus('error');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-cyan-500 bg-cyan-500/10 scale-105'
              : 'border-gray-600 hover:border-cyan-500/50 bg-gray-800/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Background graphic */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
              <line x1="100" y1="40" x2="100" y2="160" stroke="currentColor" strokeWidth="1"/>
              <line x1="40" y1="100" x2="160" y2="100" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer relative z-10">
            <div>
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                <svg
                  className="h-8 w-8 text-blue-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-gray-200 text-lg font-semibold mb-2">
                Drop your CSV file here or{' '}
                <span className="text-cyan-400 underline">browse</span>
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Required format: transaction_id, sender_id, receiver_id, amount, timestamp
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-300 text-sm">CSV files only</span>
              </div>
            </div>
          </label>
          
          {file && (
            <div className="mt-6 bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded border border-green-500/30">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-200 font-semibold text-sm">Loaded: {file.name}</p>
                    <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="text-green-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full mt-4 py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 text-lg ${
            !file || loading
              ? 'bg-gray-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="space-y-2">
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="animate-pulse">{loadingStage}</span>
              </span>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run Fraud Detection
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;
