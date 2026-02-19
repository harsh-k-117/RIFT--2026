import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { transformGraphData, getNodeColor, getNodeSize } from '../utils/graphHelpers';

function GraphVisualization({ data, graphData }) {
  const graphRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showOnlySuspicious, setShowOnlySuspicious] = useState(false);
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'high', 'medium', 'low', 'normal'

  // Transform graph data
  const graph = transformGraphData(graphData);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      const sidebarWidth = selectedNode ? 350 : 0;
      setDimensions({
        width: Math.min(window.innerWidth - 150 - sidebarWidth, 1400),
        height: 700
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [selectedNode]);

  // Fit graph to view on load
  useEffect(() => {
    if (graphRef.current && graph.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 80);
      }, 200);
    }
  }, [graph]);

  // Filter nodes based on settings
  const filteredGraph = {
    nodes: graph.nodes.filter(node => {
      // Filter by suspicious toggle
      if (showOnlySuspicious && !node.suspicious) return false;
      
      // Filter by risk level
      if (riskFilter === 'high' && node.suspicionScore < 60) return false;
      if (riskFilter === 'medium' && (node.suspicionScore < 30 || node.suspicionScore >= 60)) return false;
      if (riskFilter === 'low' && (node.suspicionScore < 1 || node.suspicionScore >= 30)) return false;
      if (riskFilter === 'normal' && node.suspicionScore > 0) return false;
      
      return true;
    }),
    links: graph.links.filter(link => {
      // Only show links where both nodes are in filtered set
      const nodeIds = new Set(graph.nodes.filter(node => {
        if (showOnlySuspicious && !node.suspicious) return false;
        if (riskFilter === 'high' && node.suspicionScore < 60) return false;
        if (riskFilter === 'medium' && (node.suspicionScore < 30 || node.suspicionScore >= 60)) return false;
        if (riskFilter === 'low' && (node.suspicionScore < 1 || node.suspicionScore >= 30)) return false;
        if (riskFilter === 'normal' && node.suspicionScore > 0) return false;
        return true;
      }).map(n => n.id));
      
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    })
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleNodeHover = (node) => {
    setHoverNode(node);
    if (node) {
      const neighbors = new Set();
      const links = new Set();
      
      filteredGraph.links.forEach(link => {
        if (link.source.id === node.id || link.source === node.id) {
          neighbors.add(link.target.id || link.target);
          links.add(link);
        }
        if (link.target.id === node.id || link.target === node.id) {
          neighbors.add(link.source.id || link.source);
          links.add(link);
        }
      });
      
      setHighlightNodes(neighbors);
      setHighlightLinks(links);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  };

  const paintNode = (node, ctx, globalScale) => {
    // Draw node circle
    const nodeColor = getNodeColor(node);
    const baseSize = node.suspicious ? 8 : 5;
    const size = baseSize + Math.sqrt(node.totalTransactions || 1);
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor;
    ctx.fill();
    
    // Add white border for all nodes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();
    
    // Add highlight border for hovered/connected/selected nodes
    if (hoverNode === node || highlightNodes.has(node.id) || selectedNode?.id === node.id) {
      ctx.strokeStyle = selectedNode?.id === node.id ? '#FBBF24' : '#000';
      ctx.lineWidth = selectedNode?.id === node.id ? 4 / globalScale : 3 / globalScale;
      ctx.stroke();
    }
    
    // No labels - clean node visualization only
  };

  const paintLink = (link, ctx, globalScale) => {
    const isHighlighted = highlightLinks.has(link);
    
    // Make edges more visible by default
    ctx.strokeStyle = isHighlighted ? '#1F2937' : '#9CA3AF';
    ctx.lineWidth = isHighlighted ? 3 / globalScale : 1.2 / globalScale;
    
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
    
    // Draw arrow for highlighted links
    if (isHighlighted) {
      const arrowLength = 10 / globalScale;
      const arrowWidth = 5 / globalScale;
      
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const angle = Math.atan2(dy, dx);
      
      const targetNode = typeof link.target === 'object' ? link.target : filteredGraph.nodes.find(n => n.id === link.target);
      const nodeRadius = targetNode ? (targetNode.suspicious ? 8 : 5) + Math.sqrt(targetNode.totalTransactions || 1) : 5;
      const arrowX = link.target.x - Math.cos(angle) * (nodeRadius + 2);
      const arrowY = link.target.y - Math.sin(angle) * (nodeRadius + 2);
      
      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angle);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-arrowLength, arrowWidth);
      ctx.lineTo(-arrowLength, -arrowWidth);
      ctx.closePath();
      
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      ctx.restore();
    }
  };

  const getNodeTooltip = (node) => {
    if (!node.suspicious) {
      return `<div style="padding: 8px;">
        <strong>${node.id}</strong><br/>
        Transactions: ${node.totalTransactions || 0}<br/>
        Status: Normal ✓
      </div>`;
    }
    
    return `<div style="padding: 10px; background: #fff; border-radius: 4px; border: 2px solid ${getNodeColor(node)};">
      <strong style="color: ${getNodeColor(node)}; font-size: 14px;">${node.id}</strong><br/>
      <strong style="color: #DC2626;">⚠️ Suspicion Score: ${node.suspicionScore}</strong><br/>
      ${node.ringId ? `<strong style="color: #F97316;">🔗 Ring: ${node.ringId}</strong><br/>` : ''}
      <span style="color: #6B7280;">Patterns: ${node.patterns.join(', ')}</span><br/>
      <span style="color: #6B7280;">Transactions: ${node.totalTransactions || 0}</span><br/>
      <span style="color: #6B7280;">In: ${node.inDegree || 0} | Out: ${node.outDegree || 0}</span><br/>
      <span style="font-size: 11px; color: #9CA3AF;">Click to view details →</span>
    </div>`;
  };

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-800/30">
        <div className="text-gray-400">
          <div className="mx-auto bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
            <svg
              className="h-10 w-10 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-200 mb-2">
            No Graph Data
          </h3>
          <p className="text-sm text-gray-400">
            Upload a CSV file to visualize the transaction network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex gap-4">
      {/* Main Graph Area */}
      <div className="flex-1">
        {/* Filters and Controls */}
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-cyan-500/20 p-1.5 rounded border border-cyan-500/30">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-gray-200">Risk Level Legend</h4>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
                  <div className="w-4 h-4 rounded-full bg-red-500 border border-white shadow-lg"></div>
                  <span className="font-semibold text-gray-200">Critical (≥60)</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border border-white shadow-lg"></div>
                  <span className="font-semibold text-gray-200">High (30-59)</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
                  <div className="w-4 h-4 rounded-full bg-yellow-300 border border-white shadow-lg"></div>
                  <span className="font-semibold text-gray-200">Medium (1-29)</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border border-white shadow-lg"></div>
                  <span className="font-semibold text-gray-200">Normal</span>
                </div>
              </div>
            </div>
            <div className="text-right bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600">
              <div className="text-lg font-bold text-cyan-400">
                {filteredGraph.nodes.length} <span className="text-xs text-gray-400">accounts</span>
              </div>
              <div className="text-sm font-semibold text-gray-400">
                {filteredGraph.links.length} transactions
              </div>
              <div className="text-xs text-red-400 mt-1 font-semibold">
                {filteredGraph.nodes.filter(n => n.suspicious).length} suspicious
              </div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="mt-3 pt-3 border-t border-gray-700 flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600">
              <input
                type="checkbox"
                id="showSuspicious"
                checked={showOnlySuspicious}
                onChange={(e) => setShowOnlySuspicious(e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-500 rounded focus:ring-cyan-500"
              />
              <label htmlFor="showSuspicious" className="text-sm font-semibold text-gray-200 cursor-pointer">
                Show Only Suspicious
              </label>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600">
              <label className="text-sm font-semibold text-gray-200">Risk Filter:</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="text-sm bg-gray-800 border border-gray-600 text-gray-200 rounded px-3 py-1 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="high">Critical Only</option>
                <option value="medium">High Only</option>
                <option value="low">Medium Only</option>
                <option value="normal">Normal Only</option>
              </select>
            </div>

            {(showOnlySuspicious || riskFilter !== 'all') && (
              <button
                onClick={() => {
                  setShowOnlySuspicious(false);
                  setRiskFilter('all');
                }}
                className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg transition font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-400">
              <strong className="text-cyan-400">Tip:</strong> Click nodes to view details. Hover to highlight connections. Gold border = selected node.
            </p>
          </div>
        </div>

        {/* Graph */}
        <div className="border-2 border-gray-700 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden shadow-2xl">
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredGraph}
            width={dimensions.width}
            height={dimensions.height}
            nodeCanvasObject={paintNode}
            linkCanvasObject={paintLink}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            nodeLabel={getNodeTooltip}
            linkDirectionalArrowLength={0}
            linkDirectionalArrowRelPos={1}
            cooldownTicks={100}
            onEngineStop={() => graphRef.current?.zoomToFit(400, 80)}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            enableNodeDrag={true}
            enableZoomPanInteraction={true}
            minZoom={0.5}
            maxZoom={8}
          />
        </div>
        
        {/* Controls Info */}
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
            <span>Drag to pan</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span>Scroll to zoom</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            <span>Click nodes for details</span>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl p-4 overflow-y-auto max-h-[750px]">
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="bg-cyan-500/20 p-1.5 rounded border border-cyan-500/30">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-200">Account Details</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-200 transition bg-gray-700 hover:bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Account ID */}
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Account ID</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">{selectedNode.id}</div>
            </div>

            {/* Status Badge */}
            <div className={`p-3 rounded-lg border-2 ${
              selectedNode.suspicious 
                ? 'bg-gradient-to-r from-red-900/50 to-red-800/50 border-red-600' 
                : 'bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-600'
            }`}>
              <div className="text-xs text-gray-300 uppercase font-semibold mb-1">Status</div>
              <div className={`text-lg font-bold flex items-center gap-2 ${
                selectedNode.suspicious ? 'text-red-400' : 'text-green-400'
              }`}>
                {selectedNode.suspicious ? (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>SUSPICIOUS</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>NORMAL</>
                )}
              </div>
            </div>

            {/* Suspicion Score */}
            {selectedNode.suspicious && (
              <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 p-3 rounded-lg border border-red-700">
                <div className="text-xs text-gray-300 uppercase font-semibold mb-1">Suspicion Score</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-red-400">{selectedNode.suspicionScore}</div>
                  <div className="text-xs text-gray-400">/100</div>
                </div>
                <div className="mt-2 bg-gray-800 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      selectedNode.suspicionScore >= 60 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                      selectedNode.suspicionScore >= 30 ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                      'bg-gradient-to-r from-yellow-600 to-yellow-500'
                    }`}
                    style={{ width: `${selectedNode.suspicionScore}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Ring ID */}
            {selectedNode.ringId && (
              <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 p-3 rounded-lg border border-orange-700">
                <div className="text-xs text-gray-300 uppercase font-semibold mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Fraud Ring
                </div>
                <div className="text-lg font-bold text-orange-400 font-mono">{selectedNode.ringId}</div>
              </div>
            )}

            {/* Detected Patterns */}
            {selectedNode.patterns && selectedNode.patterns.length > 0 && (
              <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-3 rounded-lg border border-purple-700">
                <div className="text-xs text-gray-300 uppercase font-semibold mb-2">Detected Patterns</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.patterns.map((pattern, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-purple-600/50 text-purple-200 px-2.5 py-1 rounded-full font-semibold border border-purple-500/50"
                    >
                      {pattern.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Stats */}
            <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-3 rounded-lg border border-blue-700">
              <div className="text-xs text-gray-300 uppercase font-semibold mb-2">Transaction Stats</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                  <div className="text-2xl font-bold text-blue-400">{selectedNode.totalTransactions || 0}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                  <div className="text-2xl font-bold text-green-400">{selectedNode.inDegree || 0}</div>
                  <div className="text-xs text-gray-400">Incoming</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                  <div className="text-2xl font-bold text-orange-400">{selectedNode.outDegree || 0}</div>
                  <div className="text-xs text-gray-400">Outgoing</div>
                </div>
              </div>
            </div>

            {/* Color Indicator */}
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <div className="text-xs text-gray-300 uppercase font-semibold mb-2">Risk Classification</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: getNodeColor(selectedNode) }}
                ></div>
                <span className={`text-sm font-bold ${
                  selectedNode.suspicionScore >= 60 ? 'text-red-400' :
                  selectedNode.suspicionScore >= 30 ? 'text-orange-400' :
                  selectedNode.suspicionScore >= 1 ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {selectedNode.suspicionScore >= 60 ? 'CRITICAL RISK' :
                   selectedNode.suspicionScore >= 30 ? 'HIGH RISK' :
                   selectedNode.suspicionScore >= 1 ? 'MEDIUM RISK' : 'NORMAL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphVisualization;
