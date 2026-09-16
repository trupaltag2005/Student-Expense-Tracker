import { Router } from 'express';
import { getReportsSummary } from '../controllers/reportsController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getReportsSummary);

export default router;
