import { Router } from 'express';
import { TimeEntryController } from '../controllers/timeEntry.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', authenticateToken, TimeEntryController.create);
router.get('/', authenticateToken, TimeEntryController.list);

export default router;