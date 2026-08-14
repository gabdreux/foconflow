import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { TimeEntryService } from '../services/timeEntry.service.js';

export class TimeEntryController {

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { project_id, work_date, duration_hours, description } = req.body;
      const professional_id = req.user?.id;

      if (!project_id || !work_date || !duration_hours || !description) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!professional_id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const result = await TimeEntryService.createEntry({
        project_id,
        professional_id,
        work_date,
        duration_hours,
        description,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const professional_id = req.user?.id;
      const is_admin = req.user?.role === 'ADMIN';

      const entries = await TimeEntryService.getAll(professional_id, is_admin);
      return res.json(entries);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
  
}