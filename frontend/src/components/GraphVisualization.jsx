import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { transformGraphData, getNodeColor, getNodeSize } from '../utils/graphHelpers';

function GraphVisualization({ data, graphData }) {
  const graphRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  // Transform graph data
  const graph = transformGraphData(graphData);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Math.min(window.innerWidth - 100, 1200),
        height: Math.min(window.innerHeight - 400, 600)
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fit graph to view on load
  useEffect(() => {
    if (graphRef.current && graph.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 50);
      }, 100);
    }
  }, [graph]);

  const handleNodeHover = (node) => {
    setHoverNode(node);
    if (node) {
      const neighbors = new Set();
      const links = new Set();
      
      graph.links.forEach(link => {
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
    const label = node.id;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // Draw node circle
    const nodeColor = getNodeColor(node);
    const size = getNodeSize(node);
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor;
    ctx.fill();
    
    // Add border for highlighted nodes
    if (hoverNode === node || highlightNodes.has(node.id)) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }
    
    // Draw label
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      node.x - bckgDimensions[0] / 2,
      node.y - size - bckgDimensions[1],
      bckgDimensions[0],
      bckgDimensions[1]
    );
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    ctx.fillText(label, node.x, node.y - size - fontSize / 2);
  };

  const paintLink = (link, ctx, globalScale) => {
    const isHighlighted = highlightLinks.has(link);
    
    ctx.strokeStyle = isHighlighted ? '#666' : '#ccc';
    ctx.lineWidth = isHighlighted ? 2 / globalScale : 1 / globalScale;
    
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
    
    // Draw arrow
    if (isHighlighted) {
      const arrowLength = 8 / globalScale;
      const arrowWidth = 4 / globalScale;
      
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const angle = Math.atan2(dy, dx);
      
      const nodeRadius = getNodeSize(link.target);
      const arrowX = link.target.x - Math.cos(angle) * nodeRadius;
      const arrowY = link.target.y - Math.sin(angle) * nodeRadius;
      
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
    
    return `<div style="padding: 8px; background: #fff; border-radius: 4px;">
      <strong style="color: ${getNodeColor(node)}">${node.id}</strong><br/>
      <strong>⚠️ Suspicion Score: ${node.suspicionScore}</strong><br/>
      Patterns: ${node.patterns.join(', ')}<br/>
      ${node.ringId ? `Ring: ${node.ringId}<br/>` : ''}
      Transactions: ${node.totalTransactions || 0}<br/>
      In: ${node.inDegree || 0} | Out: ${node.outDegree || 0}
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
    <div className="relative">
      {/* Legend */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-sm mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>High Risk (Score ≥60)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Medium Risk (Score 30-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
            <span>Low Risk (Score 1-29)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Normal</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Hover over nodes to see details. Node size represents transaction volume.
        </p>
      </div>

      {/* Graph */}
      <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <ForceGraph2D
          ref={graphRef}
          graphData={graph}
          width={dimensions.width}
          height={dimensions.height}
          nodeCanvasObject={paintNode}
          linkCanvasObject={paintLink}
          onNodeHover={handleNodeHover}
          nodeLabel={getNodeTooltip}
          linkDirectionalArrowLength={0}
          linkDirectionalArrowRelPos={1}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
        />
      </div>
    </div>
  );
}

export default GraphVisualization;
