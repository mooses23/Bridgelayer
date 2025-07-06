import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import tenantRoutes from './routes/tenant-enhanced.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'tenant-test' });
});

// Mount tenant routes
app.use('/api/tenant', tenantRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📍 Tenant routes: http://localhost:${PORT}/api/tenant/:firmCode`);
});
