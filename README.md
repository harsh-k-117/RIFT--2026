# �️ Fraud Netra: Financial Crime Detection Engine

### RIFT 2026 Hackathon | Graph Theory & Financial Forensics Track

[![Live Demo](https://img.shields.io/badge/demo-live_now-green?style=for-the-badge)](YOUR_LIVE_URL_HERE)
[![LinkedIn Demo](https://img.shields.io/badge/LinkedIn-Video_Demo-blue?style=for-the-badge)](YOUR_LINKEDIN_VIDEO_URL_HERE)

## 📌 Problem Overview

> Money muling is a serious financial crime. Criminals use many people (called “mules”) and multiple bank accounts to move illegal money from one place to another and hide its source. They send money through several accounts to make tracking difficult. Traditional database checks and normal queries often cannot detect these complex multi-step transaction networks.

**Fraud Netra** ("Netra" = Eye in Sanskrit) is a web-based investigation tool that converts simple transaction CSV files into a visual network graph. This helps detect hidden fraud patterns that are hard to see in normal tables. It can identify:

1. **Circular Routing:** When money moves through several accounts and comes back to the original account.
2. **Smurfing/Structuring:** When money is split into many small transfers or sent to many accounts to avoid detection.
3. **Layering Accounts:** Accounts that only receive and quickly send money, acting as middle accounts to hide the real source.

---

## 🛠 Tech Stack

- **Frontend:** React (Vite) – Modern component-based UI for fast and responsive dashboard
- **Styling:** Tailwind CSS – Utility-first styling for clean and responsive design
- **Graph Visualization:** react-force-graph-2d – D3-powered interactive transaction network graph
- **API Communication:** Axios – Connects frontend with backend APIs

- **Backend:** Node.js with Express.js – Handles REST APIs and processing logic
- **File Upload:** Multer – Handles CSV uploads from users
- **CSV Parsing:** PapaParse – Fast and efficient CSV parsing and validation

- **Architecture & Processing:** In-memory directed graph (Adjacency List) for fast analysis
- **Cycle Detection:** Depth-limited DFS to detect circular money movement
- **Smurf Detection:** Sliding window algorithm (72-hour transaction monitoring)
- **Database:** No database used, fully stateless processing

- **Deployment:** Vercel (Frontend), Render/Railway (Backend)

---

## 🏗 System Architecture

1. **Ingestion:** User uploads a standardized CSV (Transaction ID, Sender, Receiver, Amount, Timestamp).
2. **Transformation:** The Backend parses the CSV and constructs a **Directed Graph $G(V, E)$** where nodes $V$ are accounts and edges $E$ are transactions.
3. **Analysis Engine:** Executes concurrent algorithms to detect cycles, calculate centrality, and flag temporal velocity.
4. **Interactive Dashboard:** Returns a JSON payload to the React frontend, rendering an interactive network map with "Hot Node" highlighting.

---

## 🧠 Algorithm Approach & Complexity

Our engine utilizes a multi-layered approach to detect mule activities:

### 1. Simple Cycle Detection (The "Ring" Pattern)

- **Algorithm:** Johnson’s Algorithm (via `networkx.simple_cycles`).
- **Logic:** Detects $A \to B \to C \to A$ patterns. We limit searches to a depth of 5 hops to optimize performance.
- **Complexity:** $O((V+E)(C+1))$ where $C$ is the number of cycles found.

### 2. Degree Centrality (Smurfing & Fan-out)

- **Logic:** Calculates the `In-Degree` and `Out-Degree` of every node.
- **Threshold:** Nodes with $>10$ unique connections in a short window are flagged for "Smurfing."
- **Complexity:** $O(E)$ for a single pass through all transactions.

### 3. Temporal Flow Analysis

- **Logic:** Calculates the "dwell time" of funds. If money leaves an account within 24 hours of arrival, it receives a "High Velocity" penalty.

---

## ⚖️ Suspicion Score Methodology

Every account is assigned a **Mule Score (0-10)** based on a weighted heuristic:

$$Score = (W_{cyc} \cdot C) + (W_{vel} \cdot V) + (W_{smf} \cdot S)$$

| Weight ($W$) | Indicator               | Description                                       |
| :----------- | :---------------------- | :------------------------------------------------ |
| **5.0**      | **Cycle Participation** | Direct involvement in a circular money path.      |
| **3.0**      | **Temporal Velocity**   | Funds transferred out in < 24 hours of receipt.   |
| **2.0**      | **Smurfing Factor**     | High connectivity (>10) with low average amounts. |

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.9+
- Node.js 18+

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📖 Usage Instructions

-Upload: Drag and drop your transactions.csv into the dashboard upload zone. Ensure the file follows the required [transaction_id, sender_id, receiver_id, amount, timestamp] format.< br>

-Analyze: Click the "Run Detection" button to trigger the Graph Analysis Engine.<br>

-Inspect: Once rendered, click or hover over any Red Node to view specific account details, suspicion scores, and identified fraud patterns.<br>

-Export: Click the "Download JSON" button to get the final report for submission. The output is formatted for exact line-by-line test case matching.<br>

## ⚠️ Known Limitations

-Scale Constraints: The current interactive visualization is optimized for datasets up to 10,000 transactions; performance may decrease as edge density increases.<br>

-Entity Traps: While the algorithm filters for high-volume merchants, extremely complex legitimate payroll structures may occasionally require manual whitelisting to improve precision.<br>

-Temporal Window: Current smurfing detection is optimized for the mandatory 72-hour window; patterns outside this timeframe may receive lower suspicion weights.<br>

## 👥 Team Members

Team Name : Innov8ors<br><br>
Team Members : <br>
[ Harsh Kulkarni ] - Git/GitHub and Team Adviser<br>
[ Abhishek Kalimath ] - Technical Head and Web Development <br>
[ Yash Lawande ] - AI-Integration<br>
[ Sarthak Manke ] - LLM and Prompting skils<br>

...Developed for RIFT 2026 Hackathon
