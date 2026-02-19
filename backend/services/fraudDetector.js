/**
 * Fraud Detection Engine
 * Phase 2: Full implementation with all detection algorithms
 * Following RIFT_2026_HACKATHON.md specification
 */

export const detectFraud = (graph, transactions) => {
  const fraudRings = [];
  const accountPatterns = new Map(); // Track patterns per account
  let ringIdCounter = 1;

  // 1. Detect Cycles (length 3-5)
  const cycles = detectCycles(graph);
  cycles.forEach(cycle => {
    const ringId = `RING-${String(ringIdCounter++).padStart(3, '0')}`;
    fraudRings.push({
      ring_id: ringId,
      member_accounts: cycle,
      pattern_type: 'cycle',
      risk_score: 90
    });
    
    // Mark all members
    cycle.forEach(accountId => {
      if (!accountPatterns.has(accountId)) {
        accountPatterns.set(accountId, { patterns: [], rings: [], scores: [] });
      }
      accountPatterns.get(accountId).patterns.push('cycle');
      accountPatterns.get(accountId).rings.push(ringId);
      accountPatterns.get(accountId).scores.push(40);
    });
  });

  // 2. Detect Smurfing (fan-in and fan-out)
  const smurfRings = detectSmurfing(graph, transactions);
  smurfRings.forEach(smurf => {
    const ringId = `RING-${String(ringIdCounter++).padStart(3, '0')}`;
    fraudRings.push({
      ring_id: ringId,
      member_accounts: smurf.members,
      pattern_type: smurf.type,
      risk_score: smurf.riskScore
    });
    
    // Mark aggregator
    if (!accountPatterns.has(smurf.aggregator)) {
      accountPatterns.set(smurf.aggregator, { patterns: [], rings: [], scores: [] });
    }
    accountPatterns.get(smurf.aggregator).patterns.push('smurf_aggregator');
    accountPatterns.get(smurf.aggregator).rings.push(ringId);
    accountPatterns.get(smurf.aggregator).scores.push(35);
    
    // Mark participants
    smurf.participants.forEach(participantId => {
      if (!accountPatterns.has(participantId)) {
        accountPatterns.set(participantId, { patterns: [], rings: [], scores: [] });
      }
      accountPatterns.get(participantId).patterns.push('smurf_participant');
      accountPatterns.get(participantId).rings.push(ringId);
      accountPatterns.get(participantId).scores.push(20);
    });
  });

  // 3. Detect Shell Networks
  const shellChains = detectShellNetworks(graph);
  shellChains.forEach(chain => {
    const ringId = `RING-${String(ringIdCounter++).padStart(3, '0')}`;
    fraudRings.push({
      ring_id: ringId,
      member_accounts: chain.members,
      pattern_type: 'shell_network',
      risk_score: chain.riskScore
    });
    
    chain.intermediates.forEach(accountId => {
      if (!accountPatterns.has(accountId)) {
        accountPatterns.set(accountId, { patterns: [], rings: [], scores: [] });
      }
      accountPatterns.get(accountId).patterns.push('shell_intermediate');
      accountPatterns.get(accountId).rings.push(ringId);
      accountPatterns.get(accountId).scores.push(30);
    });
  });

  // 4. Build suspicious accounts list with scores
  const suspiciousAccounts = [];
  accountPatterns.forEach((data, accountId) => {
    const node = graph.nodes.get(accountId);
    
    // False positive control: don't flag legitimate merchants
    if (isLegitimateAccount(node, data.patterns.includes('cycle'))) {
      return;
    }
    
    const suspicionScore = calculateSuspicionScore(node, data.patterns, data.scores);
    
    suspiciousAccounts.push({
      account_id: accountId,
      suspicion_score: suspicionScore,
      detected_patterns: [...new Set(data.patterns)],
      ring_id: data.rings[0] || null
    });
  });

  // Sort by suspicion score descending
  suspiciousAccounts.sort((a, b) => b.suspicion_score - a.suspicion_score);

  return {
    suspiciousAccounts,
    fraudRings
  };
};

/**
 * Cycle detection using DFS
 * Detect cycles of length 3-5 only
 */
const detectCycles = (graph) => {
  const cycles = [];
  const visited = new Set();
  const recStack = new Set();
  const pathStack = [];
  
  const dfs = (nodeId, path) => {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);
    
    const node = graph.nodes.get(nodeId);
    if (!node) return;
    
    for (const edge of node.outgoing_edges) {
      const neighbor = edge.to;
      
      // Found a cycle
      if (recStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          const cycleLength = cycle.length;
          
          // Only keep cycles of length 3-5
          if (cycleLength >= 3 && cycleLength <= 5) {
            const canonical = getCanonicalCycle(cycle);
            if (!cycles.some(c => getCanonicalCycle(c) === canonical)) {
              cycles.push([...cycle]);
            }
          }
        }
      } else if (!visited.has(neighbor) && path.length < 5) {
        dfs(neighbor, [...path]);
      }
    }
    
    recStack.delete(nodeId);
  };
  
  // Try DFS from each node
  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, []);
    }
  }
  
  return cycles;
};

/**
 * Get canonical form of cycle for duplicate detection
 */
const getCanonicalCycle = (cycle) => {
  const sorted = [...cycle].sort();
  return sorted.join('-');
};

/**
 * Smurfing detection (Fan-in and Fan-out)
 * >=10 unique senders/receivers within 72-hour window
 */
const detectSmurfing = (graph, transactions) => {
  const smurfRings = [];
  const WINDOW_HOURS = 72;
  const THRESHOLD = 10;
  
  // Sort transactions by timestamp
  const sortedTxs = [...transactions].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  // Fan-in detection: Many senders -> One receiver
  const receiverMap = new Map();
  sortedTxs.forEach(tx => {
    if (!receiverMap.has(tx.receiver_id)) {
      receiverMap.set(tx.receiver_id, []);
    }
    receiverMap.get(tx.receiver_id).push(tx);
  });
  
  receiverMap.forEach((txs, receiverId) => {
    const senders = findSmurfPattern(txs, 'sender_id', WINDOW_HOURS, THRESHOLD);
    if (senders.length >= THRESHOLD) {
      smurfRings.push({
        type: 'fan_in_smurfing',
        aggregator: receiverId,
        participants: senders,
        members: [receiverId, ...senders],
        riskScore: 85
      });
    }
  });
  
  // Fan-out detection: One sender -> Many receivers
  const senderMap = new Map();
  sortedTxs.forEach(tx => {
    if (!senderMap.has(tx.sender_id)) {
      senderMap.set(tx.sender_id, []);
    }
    senderMap.get(tx.sender_id).push(tx);
  });
  
  senderMap.forEach((txs, senderId) => {
    const receivers = findSmurfPattern(txs, 'receiver_id', WINDOW_HOURS, THRESHOLD);
    if (receivers.length >= THRESHOLD) {
      smurfRings.push({
        type: 'fan_out_smurfing',
        aggregator: senderId,
        participants: receivers,
        members: [senderId, ...receivers],
        riskScore: 85
      });
    }
  });
  
  return smurfRings;
};

/**
 * Helper: Find accounts in sliding window
 */
const findSmurfPattern = (transactions, accountField, windowHours, threshold) => {
  const accounts = new Set();
  
  for (let i = 0; i < transactions.length; i++) {
    const windowAccounts = new Set();
    const startTime = new Date(transactions[i].timestamp);
    
    for (let j = i; j < transactions.length; j++) {
      const currentTime = new Date(transactions[j].timestamp);
      const hoursDiff = (currentTime - startTime) / (1000 * 60 * 60);
      
      if (hoursDiff > windowHours) break;
      
      windowAccounts.add(transactions[j][accountField]);
      
      if (windowAccounts.size >= threshold) {
        windowAccounts.forEach(acc => accounts.add(acc));
      }
    }
  }
  
  return Array.from(accounts);
};

/**
 * Shell Network Detection
 * Paths length >=3 with low-activity intermediates (<=3 transactions)
 */
const detectShellNetworks = (graph) => {
  const shellChains = [];
  const MAX_DEPTH = 4;
  const LOW_ACTIVITY_THRESHOLD = 3;
  
  // BFS from each node
  for (const startNode of graph.nodes.keys()) {
    const queue = [{ node: startNode, path: [startNode], depth: 0 }];
    const visited = new Set([startNode]);
    
    while (queue.length > 0) {
      const { node, path, depth } = queue.shift();
      
      if (depth >= MAX_DEPTH) continue;
      
      const currentNode = graph.nodes.get(node);
      if (!currentNode) continue;
      
      for (const edge of currentNode.outgoing_edges) {
        const neighbor = edge.to;
        
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const newPath = [...path, neighbor];
          
          // Check if path qualifies as shell network
          if (newPath.length >= 3) {
            const intermediates = newPath.slice(1, -1);
            const allLowActivity = intermediates.every(id => {
              const n = graph.nodes.get(id);
              return n && n.total_transactions <= LOW_ACTIVITY_THRESHOLD;
            });
            
            if (allLowActivity && intermediates.length > 0) {
              shellChains.push({
                members: newPath,
                intermediates: intermediates,
                riskScore: 75
              });
            }
          }
          
          queue.push({ node: neighbor, path: newPath, depth: depth + 1 });
        }
      }
    }
  }
  
  return shellChains;
};

/**
 * Calculate suspicion score using additive model
 */
const calculateSuspicionScore = (node, patterns, scores) => {
  let score = scores.reduce((sum, s) => sum + s, 0);
  
  // Additional scoring
  if (node.total_transactions > 20) {
    score += 15; // High velocity
  }
  
  // Check for large amounts
  const avgAmount = node.outgoing_edges.reduce((sum, e) => sum + e.amount, 0) / 
                    Math.max(node.outgoing_edges.length, 1);
  if (avgAmount > 5000) {
    score += 10;
  }
  
  // Clamp to 100
  return Math.min(Math.round(score), 100);
};

/**
 * False positive control
 * Don't flag accounts with >50 transactions and many partners
 */
const isLegitimateAccount = (node, hasCycle) => {
  if (node.total_transactions > 50 && !hasCycle) {
    const uniquePartners = new Set([
      ...node.incoming_edges.map(e => e.from),
      ...node.outgoing_edges.map(e => e.to)
    ]);
    return uniquePartners.size > 20;
  }
  return false;
};
