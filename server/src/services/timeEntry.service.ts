import { supabase } from '../config/supabase.js';

export class TimeEntryService {
  static async createEntry(data: {
    project_id: string;
    professional_id: string;
    work_date: string;
    duration_hours: number;
    description: string;
  }) {
    const { project_id, professional_id, work_date, duration_hours, description } = data;

    const { data: rates, error: rateError } = await supabase
      .from('hourly_rates')
      .select('hourly_rate')
      .eq('professional_id', professional_id)
      .lte('effective_from', work_date)
      .or(`effective_until.is.null,effective_until.gte.${work_date}`)
      .order('effective_from', { ascending: false })
      .limit(1);

    if (rateError || !rates || rates.length === 0) {
      throw new Error('Nenhuma tarifa horária vigente encontrada para a data informada.');
    }

    const hourly_rate_applied = rates[0].hourly_rate;


    const { data: entry, error: insertError } = await supabase
      .from('time_entries')
      .insert({
        project_id,
        professional_id,
        work_date,
        duration_hours,
        hourly_rate_applied,
        description,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return entry;
  }

  static async getAll(professional_id?: string, is_admin?: boolean) {
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        projects ( name ),
        professionals ( name )
      `)
      .order('work_date', { ascending: false });

    if (!is_admin && professional_id) {
      query = query.eq('professional_id', professional_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

}