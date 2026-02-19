import { parseCSV } from '../services/csvParser.js';
import { buildGraph } from '../services/graphBuilder.js';
import { detectFraud } from '../services/fraudDetector.js';
import { buildJSONOutput } from '../services/jsonBuilder.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for analysis results
const analysisStore = new Map();

export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const startTime = Date.now();
    const analysisId = uuidv4();

    // Phase 1: Parse CSV
    const csvData = req.file.buffer.toString('utf-8');
    const transactions = parseCSV(csvData);

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({ error: 'Invalid CSV format or empty file' });
    }

    // Phase 2: Build Graph
    const graph = buildGraph(transactions);

    // Phase 3: Detect Fraud (Phase 1 MVP - basic structure only)
    const fraudResults = detectFraud(graph, transactions);

    // Phase 4: Build JSON Output
    const processingTime = (Date.now() - startTime) / 1000;
    const output = buildJSONOutput(fraudResults, graph, processingTime);

    // Build graph visualization data
    const graphData = buildGraphVisualizationData(graph, output);

    // Store results in memory
    analysisStore.set(analysisId, {
      output,
      graph,
      graphData,
      timestamp: new Date()
    });

    // Return response
    res.json({
      analysis_id: analysisId,
      total_accounts: graph.nodes.size,
      total_transactions: transactions.length,
      suspicious_accounts_flagged: output.suspicious_accounts.length,
      fraud_rings_detected: output.fraud_rings.length,
      processing_time_seconds: processingTime,
      data: output,
      graph: graphData
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process CSV',
      message: error.message 
    });
  }
};

export const getAnalysis = (req, res) => {
  const { id } = req.params;
  const result = analysisStore.get(id);

  if (!result) {
    return res.status(404).json({ error: 'Analysis not found' });
  }

  res.json(result.output);
};

/**
 * Build graph visualization data for frontend
 */
const buildGraphVisualizationData = (graph, output) => {
  const nodes = [];
  const links = [];
  
  // Create lookup for suspicious accounts
  const suspiciousMap = new Map();
  output.suspicious_accounts.forEach(acc => {
    suspiciousMap.set(acc.account_id, {
      score: acc.suspicion_score,
      patterns: acc.detected_patterns,
      ringId: acc.ring_id
    });
  });
  
  // Build nodes
  graph.nodes.forEach((nodeData, accountId) => {
    const suspicious = suspiciousMap.get(accountId);
    
    nodes.push({
      id: accountId,
      name: accountId,
      suspicious: !!suspicious,
      suspicionScore: suspicious?.score || 0,
      patterns: suspicious?.patterns || [],
      ringId: suspicious?.ringId || null,
      totalTransactions: nodeData.total_transactions,
      inDegree: nodeData.in_degree,
      outDegree: nodeData.out_degree
    });
  });
  
  // Build links (edges) - deduplicate by using a Set
  const linkSet = new Set();
  graph.edges.forEach(edge => {
    const linkKey = `${edge.from}-${edge.to}`;
    if (!linkSet.has(linkKey)) {
      linkSet.add(linkKey);
      links.push({
        source: edge.from,
        target: edge.to,
        amount: edge.amount,
        timestamp: edge.timestamp
      });
    }
  });
  
  return { nodes, links };
};

export { analysisStore };
