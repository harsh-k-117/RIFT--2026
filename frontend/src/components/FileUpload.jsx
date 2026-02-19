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
    <div className="space-y-6">
      {/* Premium Glass Card Container */}
      <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/10 p-3 rounded-xl border border-blue-500/30">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              Transaction Data Upload
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Begin forensic analysis by uploading transaction CSV
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Premium Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-500 ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10 scale-[1.02] shadow-lg shadow-blue-500/20'
                : file
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-gray-600/50 hover:border-blue-500/50 bg-gray-900/30 hover:bg-gray-900/50'
            }`}
            style={{
              animation: dragActive ? 'border-glow 1.5s ease-in-out infinite' : 'none'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
                animation: 'grid-move 20s linear infinite'
              }}></div>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            
            <label htmlFor="file-upload" className="cursor-pointer relative z-10 block">
              {!file ? (
                <div className="space-y-4">
                  {/* Animated Upload Icon */}
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/10 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg animate-float">
                    <svg
                      className="h-10 w-10 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  
                  <div>
                    <p className="text-white text-xl font-bold mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                      Drop transaction CSV to begin forensic analysis
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      or <span className="gradient-text-static font-semibold cursor-pointer hover:underline">click to browse</span>
                    </p>
                  </div>

                  <div className="flex justify-center gap-4 text-xs text-gray-500 mt-6">
                    <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      CSV Format Required
                    </div>
                    <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Instant Processing
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs mt-4">
                    Required fields: transaction_id, sender_id, receiver_id, amount, timestamp
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Success State */}
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-2xl flex items-center justify-center border border-green-500/30 shadow-lg">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold text-sm">{file.name}</p>
                          <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(2)} KB • CSV File</p>
                        </div>
                      </div>
                      <div className="text-green-400 status-pulse">✓</div>
                    </div>
                  </div>
                  <p className="text-green-400 text-sm font-semibold">
                    ✓ Dataset loaded successfully
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="glass-card border-red-500/30 p-4 rounded-xl animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-red-300 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Premium Action Button */}
          <button
            type="submit"
            disabled={!file || loading}
            className={`w-full py-5 px-8 rounded-xl font-bold text-white transition-all duration-500 text-lg relative overflow-hidden ${
              !file || loading
                ? 'bg-gray-700/50 cursor-not-allowed opacity-50'
                : 'btn-premium shadow-2xl'
            }`}
            style={{fontFamily: 'Space Grotesk, sans-serif'}}
          >
            {loading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
                  <span className="animate-pulse font-semibold">{loadingStage || 'Processing...'}</span>
                </div>
                
                {/* Premium Progress Bar */}
                <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)',
                      backgroundSize: '200% 100%',
                      animation: 'gradientShift 2s ease infinite'
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Run Fraud Detection</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FileUpload;
