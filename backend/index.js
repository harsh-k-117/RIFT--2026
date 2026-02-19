import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AegisGraph API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`�️ Fraud Netra Backend running on port ${PORT}`);
});
