import { Router } from 'express';
import {
  getBudget,
  setBudget,
  updateBudget,
  getBudgetHistory,
} from '../controllers/budgetController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getBudget);
router.post('/', setBudget);
router.put('/:id', updateBudget);
router.get('/history', getBudgetHistory);

export default router;
