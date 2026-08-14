import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service.js';

export class ProjectController {

  static async create(req: Request, res: Response) {
    try {
      const { name, revenue, indirect_cost, tax_rate } = req.body;
      if (!name || revenue === undefined) {
        return res.status(400).json({ error: 'Nome e Receita são obrigatórios.' });
      }

      const project = await ProjectService.create({ name, revenue, indirect_cost, tax_rate });
      return res.status(201).json(project);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const projects = await ProjectService.getAllWithKPIs();
      return res.json(projects);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

}