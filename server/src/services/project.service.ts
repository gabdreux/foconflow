import { supabase } from '../config/supabase.js';

export class ProjectService {

  static async create(data: { name: string; revenue: number; indirect_cost?: number; tax_rate?: number }) {
    const { data: project, error } = await supabase
      .from('projects')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  static async getAllWithKPIs() {
    const { data: projects, error: projError } = await supabase.from('projects').select('*');
    if (projError) throw projError;

    const { data: entries, error: entriesError } = await supabase.from('time_entries').select('*');
    if (entriesError) throw entriesError;

    return projects.map((proj) => {
      const projEntries = entries.filter((e) => e.project_id === proj.id);

      const totalHours = projEntries.reduce((sum, e) => sum + Number(e.duration_hours), 0);
      const directLaborCost = projEntries.reduce(
        (sum, e) => sum + Number(e.duration_hours) * Number(e.hourly_rate_applied),
        0
      );

      const revenue = Number(proj.revenue);
      const indirectCost = Number(proj.indirect_cost);
      const taxRate = Number(proj.tax_rate) / 100;

      const taxes = revenue * taxRate;
      const netRevenue = revenue - taxes;
      const totalCost = directLaborCost + indirectCost;
      const profitMargin = netRevenue - totalCost;
      const marginPercentage = revenue > 0 ? (profitMargin / revenue) * 100 : 0;

      return {
        ...proj,
        totalHours,
        directLaborCost,
        taxes,
        netRevenue,
        totalCost,
        profitMargin,
        marginPercentage,
      };
    });
  }
  
}