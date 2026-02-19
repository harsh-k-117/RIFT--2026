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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Graph Data
          </h3>
          <p className="text-sm text-gray-600">
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
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-sm mb-2">🎨 Color Legend:</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow"></div>
                  <span className="font-medium">High Risk (≥60)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow"></div>
                  <span className="font-medium">Medium Risk (30-59)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-300 border-2 border-white shadow"></div>
                  <span className="font-medium">Low Risk (1-29)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                  <span className="font-medium">Normal</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">
                {filteredGraph.nodes.length} Accounts | {filteredGraph.links.length} Transactions
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {filteredGraph.nodes.filter(n => n.suspicious).length} Suspicious
              </div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSuspicious"
                checked={showOnlySuspicious}
                onChange={(e) => setShowOnlySuspicious(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="showSuspicious" className="text-sm font-medium text-gray-700">
                Show Only Suspicious
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter by Risk:</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Levels</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="low">Low Risk Only</option>
                <option value="normal">Normal Only</option>
              </select>
            </div>

            {(showOnlySuspicious || riskFilter !== 'all') && (
              <button
                onClick={() => {
                  setShowOnlySuspicious(false);
                  setRiskFilter('all');
                }}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Click nodes to view details in side panel. Hover to highlight connections. Selected nodes have a gold border.
            </p>
          </div>
        </div>

        {/* Graph */}
        <div className="border-2 border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-white overflow-hidden shadow-lg">
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
        <div className="mt-2 text-xs text-gray-500 text-center">
          🖱️ Drag to pan | Scroll to zoom | Click nodes to select | Drag nodes to reposition
        </div>
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div className="w-80 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 overflow-y-auto max-h-[750px]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-800">Node Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Account ID */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Account ID</div>
              <div className="text-lg font-bold text-gray-800">{selectedNode.id}</div>
            </div>

            {/* Status Badge */}
            <div className={`p-3 rounded border-2 ${
              selectedNode.suspicious 
                ? 'bg-red-50 border-red-300' 
                : 'bg-green-50 border-green-300'
            }`}>
              <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Status</div>
              <div className={`text-lg font-bold ${
                selectedNode.suspicious ? 'text-red-600' : 'text-green-600'
              }`}>
                {selectedNode.suspicious ? '⚠️ SUSPICIOUS' : '✓ NORMAL'}
              </div>
            </div>

            {/* Suspicion Score */}
            {selectedNode.suspicious && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded border border-red-200">
                <div className="text-xs text-gray-600 uppercase font-semibold mb-1">Suspicion Score</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-red-600">{selectedNode.suspicionScore}</div>
                  <div className="text-xs text-gray-500">/100</div>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      selectedNode.suspicionScore >= 60 ? 'bg-red-500' :
                      selectedNode.suspicionScore >= 30 ? 'bg-orange-500' :
                      'bg-yellow-400'
                    }`}
                    style={{ width: `${selectedNode.suspicionScore}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Ring ID */}
            {selectedNode.ringId && (
              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                <div className="text-xs text-gray-600 uppercase font-semibold mb-1">🔗 Fraud Ring</div>
                <div className="text-lg font-bold text-orange-600">{selectedNode.ringId}</div>
              </div>
            )}

            {/* Detected Patterns */}
            {selectedNode.patterns && selectedNode.patterns.length > 0 && (
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <div className="text-xs text-gray-600 uppercase font-semibold mb-2">Detected Patterns</div>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.patterns.map((pattern, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium"
                    >
                      {pattern.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Stats */}
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="text-xs text-gray-600 uppercase font-semibold mb-2">Transaction Stats</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedNode.totalTransactions || 0}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedNode.inDegree || 0}</div>
                  <div className="text-xs text-gray-600">Incoming</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{selectedNode.outDegree || 0}</div>
                  <div className="text-xs text-gray-600">Outgoing</div>
                </div>
              </div>
            </div>

            {/* Color Indicator */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="text-xs text-gray-600 uppercase font-semibold mb-2">Risk Level</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: getNodeColor(selectedNode) }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {selectedNode.suspicionScore >= 60 ? 'High Risk' :
                   selectedNode.suspicionScore >= 30 ? 'Medium Risk' :
                   selectedNode.suspicionScore >= 1 ? 'Low Risk' : 'Normal'}
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
