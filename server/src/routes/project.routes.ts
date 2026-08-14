import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', authenticateToken, ProjectController.create);
router.get('/', authenticateToken, ProjectController.list);

export default router;