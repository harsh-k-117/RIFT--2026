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
    
    // Add edges
    links.forEach((link, idx) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      elements.push({
        data: {
          id: `edge-${idx}`,
          source: sourceId,
          target: targetId
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
  }, [cyRef.current]);

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
        'label': 'data(label)',
        'font-size': '10px',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#1F2937',
        'text-outline-width': 2,
        'text-outline-color': '#ffffff',
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
        'width': 2,
        'line-color': '#9CA3AF',
        'target-arrow-color': '#9CA3AF',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.2,
        'opacity': 0.7
      }
    },
    {
      selector: 'edge.highlighted',
      style: {
        'width': 3,
        'line-color': '#1F2937',
        'target-arrow-color': '#1F2937',
        'opacity': 1,
        'z-index': 9
      }
    },
    {
      selector: 'edge.faded',
      style: {
        'opacity': 0.1
      }
    }
  ];

  // Cytoscape layout configuration
  const layoutConfig = {
    name: 'cose',
    animate: false,
    fit: true,
    padding: 50,
    nodeRepulsion: 400000,
    idealEdgeLength: 100,
    edgeElasticity: 100,
    nestingFactor: 1.2,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
  };

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
                {nodes.length} Accounts | {links.length} Transactions
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {nodes.filter(n => n.suspicious).length} Suspicious
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
            
            <button
              onClick={fitToScreen}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition font-medium ml-auto"
            >
              📐 Fit to Screen
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Click nodes to view details in side panel. Hover to see tooltips. Selected nodes have a gold border.
            </p>
          </div>
          
          {/* Search Section */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">🔍 Search Account:</label>
              <input
                type="text"
                value={searchAccountId}
                onChange={(e) => setSearchAccountId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter account ID..."
                className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded transition font-medium"
              >
                Find
              </button>
            </div>
            {searchMessage && (
              <div className={`mt-2 text-sm px-3 py-1.5 rounded ${
                searchMessage.includes('✓') ? 'bg-green-100 text-green-700' :
                searchMessage.includes('❌') ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {searchMessage}
              </div>
            )}
          </div>
        </div>

        {/* Graph */}
        <div className="border-2 border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-white overflow-hidden shadow-lg">
          <CytoscapeComponent
            elements={cytoscapeElements}
            style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
            stylesheet={cytoscapeStylesheet}
            layout={layoutConfig}
            cy={(cy) => { cyRef.current = cy; }}
            wheelSensitivity={0.2}
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
