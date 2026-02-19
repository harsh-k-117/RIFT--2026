import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { getNodeColor } from '../utils/graphHelpers';

function GraphVisualization({ data, graphData }) {
  const cyRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showOnlySuspicious, setShowOnlySuspicious] = useState(false);
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchAccountId, setSearchAccountId] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [cytoscapeElements, setCytoscapeElements] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoverNodeId, setHoverNodeId] = useState(null);

  // Cytoscape layout configuration - maximally spread nodes apart
  const layoutConfig = {
    name: 'cose',
    animate: false,
    fit: true,
    padding: 100,
    nodeRepulsion: 4000000,        // Very high repulsion to push nodes apart
    idealEdgeLength: 200,          // Long edges for maximum spacing
    edgeElasticity: 20,            // Very low elasticity
    nestingFactor: 1,
    gravity: 0.1,                  // Almost no gravity - let nodes spread
    numIter: 3000,                 // Many iterations for convergence
    initialTemp: 1000,             // High starting temperature
    coolingFactor: 0.90,           // Slower cooling for better spread
    minTemp: 1.0,
    randomize: true,               // Randomize starting positions
    nodeOverlap: 100,              // Prevent any overlap
    componentSpacing: 150          // Space between disconnected components
  };

  // Aggregate edges: combine multiple transactions between same nodes
  const aggregateEdges = (links) => {
    const edgeMap = new Map();
    
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const key = `${sourceId}->${targetId}`;
      
      if (edgeMap.has(key)) {
        const existing = edgeMap.get(key);
        existing.txCount += 1;
        existing.totalAmount += link.amount || 0;
      } else {
        edgeMap.set(key, {
          source: sourceId,
          target: targetId,
          txCount: 1,
          totalAmount: link.amount || 0
        });
      }
    });
    
    return Array.from(edgeMap.values());
  };

  // Transform data to Cytoscape format
  const transformToCytoscapeFormat = (nodes, links) => {
    const elements = [];
    
    // Add nodes
    nodes.forEach(node => {
      elements.push({
        data: {
          id: node.id,
          label: node.id,
          suspicious: node.suspicious || false,
          suspicionScore: node.suspicionScore || 0,
          patterns: node.patterns || [],
          ringId: node.ringId || null,
          totalTransactions: node.totalTransactions || 0,
          inDegree: node.inDegree || 0,
          outDegree: node.outDegree || 0,
          degree: (node.inDegree || 0) + (node.outDegree || 0)
        }
      });
    });
    
    // Aggregate and add edges
    const aggregatedEdges = aggregateEdges(links);
    aggregatedEdges.forEach((edge, idx) => {
      elements.push({
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          txCount: edge.txCount,
          totalAmount: edge.totalAmount
        }
      });
    });
    
    return elements;
  };

  // Filter nodes based on settings
  const getFilteredData = () => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };
    
    const filteredNodes = graphData.nodes.filter(node => {
      if (showOnlySuspicious && !node.suspicious) return false;
      
      const score = node.suspicionScore || 0;
      if (riskFilter === 'high' && score < 60) return false;
      if (riskFilter === 'medium' && (score < 30 || score >= 60)) return false;
      if (riskFilter === 'low' && (score < 1 || score >= 30)) return false;
      if (riskFilter === 'normal' && score > 0) return false;
      
      return true;
    });
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
    
    return { nodes: filteredNodes, links: filteredLinks };
  };

  // Update Cytoscape elements when data or filters change
  useEffect(() => {
    const { nodes, links } = getFilteredData();
    const elements = transformToCytoscapeFormat(nodes, links);
    setCytoscapeElements(elements);
  }, [graphData, showOnlySuspicious, riskFilter]);

  // Re-run layout when new graph data is loaded (CSV upload)
  useEffect(() => {
    if (!cyRef.current || !graphData || graphData.nodes.length === 0) return;
    
    const cy = cyRef.current;
    // Small delay to ensure elements are mounted
    const timer = setTimeout(() => {
      const layout = cy.layout(layoutConfig);
      layout.run();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [graphData]);

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

  // Initialize Cytoscape event handlers
  useEffect(() => {
    if (!cyRef.current) return;
    
    const cy = cyRef.current;
    
    // Track zoom level for conditional labels
    cy.on('zoom', () => {
      setZoomLevel(cy.zoom());
    });
    
    // Node hover handlers
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      setHoverNodeId(node.id());
      
      // Highlight connected edges
      const connectedEdges = node.connectedEdges();
      connectedEdges.addClass('hover-highlight');
      
      // Show tooltip
      const data = node.data();
      const tooltipContent = `
        <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); 
                    padding: 12px; 
                    border-radius: 8px; 
                    border: 2px solid ${data.suspicious ? '#EF4444' : '#3B82F6'}; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    color: #E5E7EB;
                    font-family: system-ui, -apple-system, sans-serif;
                    min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #F9FAFB;">${data.id}</div>
          ${data.suspicious ? `
            <div style="background: rgba(239, 68, 68, 0.2); padding: 6px; border-radius: 4px; margin-bottom: 6px;">
              <span style="color: #FCA5A5;">⚠️ Suspicion Score:</span> 
              <span style="font-weight: bold; color: #FEE2E2;">${data.suspicionScore}</span>
            </div>
          ` : '<div style="color: #86EFAC; font-size: 12px;">✓ Normal Account</div>'}
          ${data.ringId ? `<div style="color: #FCD34D; font-size: 12px;">🔗 Ring: ${data.ringId}</div>` : ''}
          <div style="font-size: 11px; color: #9CA3AF; margin-top: 6px; padding-top: 6px; border-top: 1px solid #4B5563;">
            Transactions: ${data.totalTransactions || 0}<br/>
            In: ${data.inDegree || 0} | Out: ${data.outDegree || 0}
          </div>
        </div>
      `;
      
      node.popperRefObj?.destroy();
      const popperInstance = node.popper({
        content: () => {
          const div = document.createElement('div');
          div.innerHTML = tooltipContent;
          document.body.appendChild(div);
          return div;
        },
        popper: {
          placement: 'top',
          modifiers: [
            { name: 'offset', options: { offset: [0, 10] } }
          ]
        }
      });
      
      node.popperRefObj = popperInstance;
    });
    
    cy.on('mouseout', 'node', (evt) => {
      const node = evt.target;
      setHoverNodeId(null);
      cy.elements('.hover-highlight').removeClass('hover-highlight');
      
      // Remove tooltip
      if (node.popperRefObj) {
        const popperDiv = node.popperRefObj.state?.elements?.popper;
        if (popperDiv) popperDiv.remove();
        node.popperRefObj.destroy();
        node.popperRefObj = null;
      }
    });
    
    // Edge hover handlers for aggregated transaction info
    cy.on('mouseover', 'edge', (evt) => {
      const edge = evt.target;
      const data = edge.data();
      
      if (data.txCount > 1) {
        const tooltipContent = `
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); 
                      padding: 10px; 
                      border-radius: 6px; 
                      border: 2px solid #60A5FA;
                      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                      color: #E5E7EB;
                      font-family: system-ui, -apple-system, sans-serif;">
            <div style="font-weight: bold; color: #93C5FD; margin-bottom: 4px;">
              ${data.source} → ${data.target}
            </div>
            <div style="font-size: 11px; color: #D1D5DB;">
              Transactions: <span style="font-weight: bold; color: #FCD34D;">${data.txCount}</span><br/>
              ${data.totalAmount > 0 ? `Total: <span style="color: #86EFAC;">$${data.totalAmount.toLocaleString()}</span>` : ''}
            </div>
          </div>
        `;
        
        edge.popperRefObj?.destroy();
        const popperInstance = edge.popper({
          content: () => {
            const div = document.createElement('div');
            div.innerHTML = tooltipContent;
            document.body.appendChild(div);
            return div;
          },
          popper: {
            placement: 'top'
          }
        });
        
        edge.popperRefObj = popperInstance;
      }
    });
    
    cy.on('mouseout', 'edge', (evt) => {
      const edge = evt.target;
      if (edge.popperRefObj) {
        const popperDiv = edge.popperRefObj.state?.elements?.popper;
        if (popperDiv) popperDiv.remove();
        edge.popperRefObj.destroy();
        edge.popperRefObj = null;
      }
    });
    
    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = {
        id: node.data('id'),
        suspicious: node.data('suspicious'),
        suspicionScore: node.data('suspicionScore'),
        patterns: node.data('patterns'),
        ringId: node.data('ringId'),
        totalTransactions: node.data('totalTransactions'),
        inDegree: node.data('inDegree'),
        outDegree: node.data('outDegree')
      };
      
      setSelectedNode(nodeData);
      
      // Highlight connected nodes
      const neighbors = node.neighborhood();
      cy.elements().removeClass('highlighted faded');
      node.addClass('highlighted');
      neighbors.addClass('highlighted');
      cy.elements().not(neighbors.union(node)).addClass('faded');
      
      // Center on node
      cy.animate({
        center: { eles: node },
        zoom: 2,
        duration: 500
      });
    });
    
    // Click on background to deselect
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('highlighted faded');
      }
    });
    
    return () => {
      cy.removeAllListeners();
    };
  }, []);

  // Fit graph to view
  const fitToScreen = () => {
    if (cyRef.current) {
      cyRef.current.fit(null, 50);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!searchAccountId.trim()) {
      setSearchMessage('⚠️ Please enter an account ID');
      return;
    }
    
    if (!cyRef.current) return;
    
    const cy = cyRef.current;
    const node = cy.getElementById(searchAccountId.trim());
    
    if (node.length === 0) {
      setSearchMessage(`❌ Account "${searchAccountId}" not found in dataset`);
      return;
    }
    
    // Check if visible (not filtered out)
    if (node.style('display') === 'none') {
      setSearchMessage(`⚠️ Account "${searchAccountId}" exists but is filtered out. Clear filters to view.`);
      return;
    }
    
    // Focus on node
    const nodeData = {
      id: node.data('id'),
      suspicious: node.data('suspicious'),
      suspicionScore: node.data('suspicionScore'),
      patterns: node.data('patterns'),
      ringId: node.data('ringId'),
      totalTransactions: node.data('totalTransactions'),
      inDegree: node.data('inDegree'),
      outDegree: node.data('outDegree')
    };
    
    setSelectedNode(nodeData);
    setSearchMessage(`✓ Focused on ${searchAccountId.trim()}`);
    
    // Highlight and center
    const neighbors = node.neighborhood();
    cy.elements().removeClass('highlighted faded');
    node.addClass('highlighted');
    neighbors.addClass('highlighted');
    cy.elements().not(neighbors.union(node)).addClass('faded');
    
    cy.animate({
      center: { eles: node },
      zoom: 2,
      duration: 500
    });
  };

  // Cytoscape stylesheet
  const cytoscapeStylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele) => {
          const score = ele.data('suspicionScore') || 0;
          if (!ele.data('suspicious')) return '#3B82F6'; // blue
          if (score >= 60) return '#EF4444'; // red
          if (score >= 30) return '#F97316'; // orange
          return '#FCD34D'; // yellow
        },
        'width': (ele) => {
          const degree = ele.data('degree') || 0;
          const baseSize = ele.data('suspicious') ? 25 : 20;
          return Math.min(baseSize + Math.sqrt(degree) * 3, 60);
        },
        'height': (ele) => {
          const degree = ele.data('degree') || 0;
          const baseSize = ele.data('suspicious') ? 25 : 20;
          return Math.min(baseSize + Math.sqrt(degree) * 3, 60);
        },
        // Conditional labels: show only for suspicious nodes or when zoomed in
        'label': (ele) => {
          const isSuspicious = ele.data('suspicious');
          const isHovered = ele.id() === hoverNodeId;
          if (isHovered || isSuspicious || zoomLevel > 1.5) {
            return ele.data('label');
          }
          return '';
        },
        'font-size': '11px',
        'font-weight': 'bold',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 5,
        'color': '#E5E7EB',
        'text-outline-width': 3,
        'text-outline-color': '#1F2937',
        'border-width': 2,
        'border-color': '#ffffff',
        'overlay-opacity': 0
      }
    },
    {
      selector: 'node.highlighted',
      style: {
        'border-width': 4,
        'border-color': '#FBBF24',
        'z-index': 10
      }
    },
    {
      selector: 'node.faded',
      style: {
        'opacity': 0.3
      }
    },
    {
      selector: 'edge',
      style: {
        'width': (ele) => {
          const txCount = ele.data('txCount') || 1;
          return Math.min(1 + Math.log(txCount), 5);
        },
        'line-color': '#4B5563',
        'target-arrow-color': '#4B5563',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1,
        'opacity': 0.4
      }
    },
    {
      selector: 'edge.hover-highlight',
      style: {
        'line-color': '#60A5FA',
        'target-arrow-color': '#60A5FA',
        'width': 3,
        'opacity': 0.9,
        'z-index': 999
      }
    },
    {
      selector: 'edge.highlighted',
      style: {
        'width': 4,
        'line-color': '#FBBF24',
        'target-arrow-color': '#FBBF24',
        'opacity': 1,
        'z-index': 999,
        'arrow-scale': 1.5
      }
    },
    {
      selector: 'edge.faded',
      style: {
        'opacity': 0.1
      }
    }
  ];

  const { nodes, links } = getFilteredData();

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
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
    <div className="relative flex gap-6 w-full">
      {/* Main Graph Area */}
      <div className="flex-1 min-w-0">
        {/* Premium Controls Panel */}
        <div className="mb-6 glass-card p-6 rounded-xl border border-white/10 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-white/90" style={{fontFamily: 'Space Grotesk, sans-serif'}}>⚡ Threat Level Classification</h4>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="glass px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition">
                  <div className="w-3 h-3 rounded-full bg-red-500 status-pulse"></div>
                  <span className="font-medium text-gray-300 text-xs">Critical ≥60</span>
                </div>
                <div className="glass px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition">
                  <div className="w-3 h-3 rounded-full bg-orange-500 status-pulse"></div>
                  <span className="font-medium text-gray-300 text-xs">High 30-59</span>
                </div>
                <div className="glass px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition">
                  <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                  <span className="font-medium text-gray-300 text-xs">Medium 1-29</span>
                </div>
                <div className="glass px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-gray-300 text-xs">Normal</span>
                </div>
              </div>
            </div>
            <div className="glass-strong px-5 py-3 rounded-xl border border-white/10">
              <div className="text-sm font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                {nodes.length} <span className="text-xs text-gray-400 font-normal">Accounts</span> • {links.length} <span className="text-xs text-gray-400 font-normal">Transactions</span>
              </div>
              <div className="text-xs text-red-400 mt-1.5 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full status-pulse"></div>
                {nodes.filter(n => n.suspicious).length} Flagged
              </div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-3 items-center flex-wrap">
            <div className="glass px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/5 transition">
              <input
                type="checkbox"
                id="showSuspicious"
                checked={showOnlySuspicious}
                onChange={(e) => setShowOnlySuspicious(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded cursor-pointer"
              />
              <label htmlFor="showSuspicious" className="text-xs font-semibold text-gray-300 cursor-pointer">
                🎯 Suspicious Only
              </label>
            </div>
            
            <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-400">Risk Level:</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="text-xs font-semibold glass border-0 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                className="text-xs glass hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg transition font-semibold"
              >
                ✕ Clear
              </button>
            )}
            
            <button
              onClick={fitToScreen}
              className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition font-semibold ml-auto shadow-lg hover:shadow-blue-500/50"
            >
              🎯 Fit View
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="glass px-4 py-3 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 <strong className="text-blue-400">Pro Tip:</strong> Click nodes for focus mode • Hover to reveal connections • Zoom for labels
              </p>
            </div>
          </div>
          
          {/* Search Section */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="glass px-3 py-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchAccountId}
                onChange={(e) => setSearchAccountId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search account ID..."
                className="flex-1 text-sm glass border-0 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-lg transition font-semibold shadow-lg hover:shadow-blue-500/50"
              >
                Find
              </button>
            </div>
            {searchMessage && (
              <div className={`mt-3 text-xs px-4 py-2 rounded-lg glass-card font-semibold ${
                searchMessage.includes('✓') ? 'text-green-400 border-green-500/20' :
                searchMessage.includes('❌') ? 'text-red-400 border-red-500/20' :
                'text-yellow-400 border-yellow-500/20'
              }`}>
                {searchMessage}
              </div>
            )}
          </div>
        </div>

        {/* Premium Graph Container */}
        <div className="glass-card border-white/10 rounded-2xl overflow-hidden shadow-2xl relative w-full" 
             style={{ 
               background: 'linear-gradient(135deg, rgba(26, 31, 46, 0.9) 0%, rgba(45, 55, 72, 0.8) 50%, rgba(26, 32, 44, 0.9) 100%)',
               boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
               minHeight: '600px'
             }}>
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
            animation: 'pulse-glow 4s ease-in-out infinite'
          }}></div>
          <CytoscapeComponent
            elements={cytoscapeElements}
            style={{ 
              width: `${dimensions.width}px`, 
              height: `${dimensions.height}px`,
              background: 'transparent'
            }}
            stylesheet={cytoscapeStylesheet}
            layout={layoutConfig}
            cy={(cy) => { cyRef.current = cy; }}
            wheelSensitivity={0.2}
          />
        </div>
        
        {/* Premium Controls Info */}
        <div className="mt-4 text-xs text-center glass px-6 py-3 rounded-xl border border-white/10 shadow-lg">
          <span className="text-gray-400">
            🕹️ <strong className="text-blue-400">Navigation:</strong> Drag to pan • Scroll to zoom • Click to investigate • Hover for intel
          </span>
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
