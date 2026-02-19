# RIFT 2026 HACKATHON

## MONEY MULING DETECTION ENGINE

### MASTER MVP IMPLEMENTATION PLAN

---

# 1. PROBLEM SUMMARY

The system must detect financial crime patterns where money is routed through multiple accounts to hide origin.
Traditional relational queries cannot detect these patterns, so the solution must:

* model transactions as a directed graph
* detect suspicious structural patterns
* visualize the network
* output structured machine-readable results

The system must be deployed as a **live web application with CSV upload**.

---

# 2. MANDATORY REQUIREMENTS CHECKLIST

## 2.1 Application Requirements

The web application MUST:

* Accept CSV upload on homepage
* Parse exact input schema
* Build directed graph of accounts
* Detect fraud rings using graph analysis
* Highlight suspicious nodes in visualization
* Show fraud ring summary table
* Provide JSON download button
* Match required JSON output format exactly
* Be publicly accessible without login

Failure in any of these leads to disqualification.

---

## 2.2 Submission Requirements

You must submit:

* Live deployed URL
* Public GitHub repository
* LinkedIn demo video (2–3 minutes)
* README with architecture + algorithm explanation

---

# 3. INPUT DATA SPECIFICATION

CSV must contain EXACT columns:

```
transaction_id   String
sender_id        String
receiver_id      String
amount           Float
timestamp        YYYY-MM-DD HH:MM:SS
```

The system must reject invalid schemas.

---

# 4. REQUIRED OUTPUTS

---

## 4.1 Interactive Graph Visualization

The graph must show:

* All accounts as nodes
* Directed edges for transactions
* Rings highlighted
* Suspicious nodes visually distinct
* Hover shows account details

---

## 4.2 JSON OUTPUT (STRICT FORMAT)

The system must generate EXACT structure:

```
{
  suspicious_accounts: [],
  fraud_rings: [],
  summary: {}
}
```

---

### suspicious_accounts must contain:

```
account_id (String)
suspicion_score (Float 0–100)
detected_patterns (Array<String>)
ring_id (String)
```

Must be sorted by suspicion_score descending.

---

### fraud_rings must contain:

```
ring_id
member_accounts[]
pattern_type
risk_score
```

---

### summary must contain:

```
total_accounts_analyzed
suspicious_accounts_flagged
fraud_rings_detected
processing_time_seconds
```

---

## 4.3 Fraud Ring Summary Table

UI table must display:

```
Ring ID
Pattern Type
Member Count
Risk Score
Member IDs (comma separated)
```

---

# 5. SYSTEM ARCHITECTURE

---

## 5.1 High-Level Flow

```
CSV Upload
→ Validation
→ Graph Construction
→ Pattern Detection Engine
→ Suspicion Scoring Engine
→ JSON Builder
→ Visualization + Table
```

---

## 5.2 Backend Responsibilities

* File upload handling
* CSV parsing
* Graph modeling
* Cycle detection
* Smurfing detection
* Shell chain detection
* Suspicion scoring
* JSON output generation

---

## 5.3 Frontend Responsibilities

* Upload interface
* Graph rendering
* Suspicious node highlighting
* Ring summary table
* JSON download button

---

# 6. GRAPH DATA MODEL

Use adjacency list structure:

```
Map<AccountID, {
    outgoing_edges[]
    incoming_edges[]
    total_transactions
    in_degree
    out_degree
}>
```

Edge object:

```
from
to
amount
timestamp
```

---

# 7. FRAUD DETECTION ENGINE

---

# 7.1 CYCLE DETECTION

## Definition

Money flows in loops:

```
A → B → C → A
```

## Requirements

* Detect cycles of length 3–5 only
* All members belong to same ring

## Algorithm

Depth-first search with path tracking.

Steps:

1. DFS from each node
2. If start node reappears → cycle
3. Keep only cycles length 3–5
4. Remove duplicates using canonical form

Output:

```
ring_id
pattern_type = cycle
members[]
```

---

# 7.2 SMURFING DETECTION

---

## Fan-in

Rule:

```
>= 10 unique senders
→ 1 receiver
within 72-hour window
```

Algorithm:

1. Group transactions by receiver
2. Sort by timestamp
3. Use sliding window
4. Count unique senders
5. Flag aggregator

Ring members:

```
aggregator + senders
```

---

## Fan-out

Rule:

```
1 sender → >=10 receivers
within 72 hours
```

Same logic reversed.

---

# 7.3 SHELL NETWORK DETECTION

## Definition

Money routed through low-activity intermediate accounts.

Rule:

A path length ≥3 where intermediate nodes have:

```
total_transactions <= 3
```

Algorithm:

1. BFS from each node up to depth 4
2. Track paths length ≥3
3. Check intermediate node activity
4. Flag suspicious chains

---

# 8. FALSE POSITIVE CONTROL (VERY IMPORTANT)

To avoid penalizing legitimate merchants:

### Do NOT flag accounts if:

```
transaction count > 50 AND
many unique partners AND
no cycles AND
no smurf windows
```

This prevents payroll/merchant traps.

---

# 9. SUSPICION SCORING MODEL

Use additive scoring.

```
Cycle member: +40
Smurf aggregator: +35
Smurf participant: +20
Shell intermediate: +30
High velocity transfers: +15
Large amounts: +10
```

Clamp score to 100.

Sort descending before JSON export.

---

# 10. BACKEND API DESIGN

---

## POST /upload

Uploads CSV, triggers analysis.

Returns:

```
analysis_id
total_accounts
total_transactions
```

---

## GET /analysis/:id

Returns:

```
graph data
rings
suspicious accounts
summary
```

---

## GET /download-json/:id

Returns JSON output file.

---

# 11. FRONTEND COMPONENTS

---

## Upload Component

* CSV drag/drop
* schema validation
* call backend

---

## Graph Visualization

Node color rules:

```
red = suspicious
orange = ring member
blue = normal
```

Hover shows:

```
account id
score
patterns
```

---

## Rings Table

Columns:

```
Ring ID
Pattern Type
Member Count
Risk Score
Members
```

---

## JSON Download Button

Calls backend endpoint.

---

# 12. PERFORMANCE STRATEGY

To meet 30-second requirement:

* adjacency list graph
* cycle depth limited to 5
* BFS depth limited
* sliding window for smurfing
* no database usage
* in-memory processing only

---

# 13. TESTING STRATEGY

Prepare datasets:

1. One cycle dataset
2. Smurfing dataset
3. Shell chain dataset
4. Mixed legitimate + fraud dataset

Verify:

* JSON exact format
* nodes correctly flagged
* no large merchant falsely flagged
* graph renders without lag

---

# 14. DEPLOYMENT PLAN

Frontend: static hosting
Backend: Node TypeScript server

Final architecture:

```
Frontend → Backend API → Processing Engine
```

Must remain live during judging.

---

# 15. README CONTENT CHECKLIST

Your README must include:

* project title
* live demo URL
* tech stack
* system architecture diagram
* algorithm explanation
* complexity analysis
* suspicion score methodology
* installation steps
* usage instructions
* known limitations
* team members

---

# 16. MVP DEVELOPMENT ORDER

---

## Phase 1 — Core System

CSV parser
Graph builder
Cycle detection
JSON output

---

## Phase 2 — Detection Expansion

Smurfing detection
Shell detection
Scoring engine

---

## Phase 3 — UI

Graph visualization
Ring table
Download button

---

## Phase 4 — Finalization

Deployment
README diagrams
Demo video preparation

---

# 17. FINAL MVP GOAL

At completion, the system will:

* model transactions as a graph
* detect money muling structures
* assign interpretable suspicion scores
* visualize suspicious networks
* export structured forensic data

This satisfies all hackathon evaluation requirements.

---

END OF MASTER PLAN
