import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/routes/authRoutes.ts';
import transactionRoutes from './backend/routes/transactionRoutes.ts';
import budgetRoutes from './backend/routes/budgetRoutes.ts';
import dashboardRoutes from './backend/routes/dashboardRoutes.ts';
import reportsRoutes from './backend/routes/reportsRoutes.ts';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Core middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Expense Tracker API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/budget', budgetRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportsRoutes);

  // Global API error handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Expense Tracker] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
