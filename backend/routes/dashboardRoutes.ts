import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getDashboardSummary);

export default router;
