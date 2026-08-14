import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Interfaces estritamente tipadas com base no seu Schema do Supabase
interface DBProfessional {
  id: string;
  name?: string;
  full_name?: string;
}

interface DBHourlyRate {
  id: string;
  professional_id?: string;
  user_id?: string;
  rate?: number;
  hourly_rate?: number;
}

interface DBTimeEntry {
  id: string;
  duration_hours?: number;
  hours?: number;
  project_id: string;
  professional_id?: string;
  user_id?: string;
}

interface DBProject {
  id: string;
  name: string;
  revenue?: number;
  indirect_cost?: number;
}

export interface ProfessionalDetail {
  id: string;
  name: string;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  projectId: string;
}

export interface ProjectKPI {
  id: string;
  name: string;
  revenue: number;
  hoursLogged: number;
  directCost: number;
  indirectCost: number;
  tax: number;
  professionals: ProfessionalDetail[];
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    
    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'Erro ao realizar requisição';
      try {
        const err = JSON.parse(text);
        errorMessage = err.error || err.message || errorMessage;
      } catch {
        errorMessage = `Erro ${response.status}: Rota '${endpoint}' não encontrada no servidor.`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  async post(endpoint: string, body: unknown) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'Erro ao realizar requisição';
      try {
        const err = JSON.parse(text);
        errorMessage = err.error || err.message || errorMessage;
      } catch {
        errorMessage = `Erro ${response.status}: Falha ao enviar para '${endpoint}'.`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },
};

/**
 * Busca dados das 4 tabelas reais: projects, time_entries, professionals e hourly_rates
 */
/**
 * Busca dados das 4 tabelas reais considerando o filtro de período opcional
 */
export const getAdminKPIs = async (
  startDate?: string,
  endDate?: string
): Promise<ProjectKPI[]> => {
  // 1. Monta a query de time_entries
  let entriesQuery = supabase.from('time_entries').select('*');

  // Filtra por data de início (se informada)
  if (startDate) {
    entriesQuery = entriesQuery.gte('work_date', startDate);
  }

  // Filtra por data de fim (se informada)
  if (endDate) {
    entriesQuery = entriesQuery.lte('work_date', endDate);
  }

  // 2. Busca em paralelo as 4 tabelas do seu schema
  const [projRes, entriesRes, profRes, ratesRes] = await Promise.all([
    supabase.from('projects').select('*'),
    entriesQuery,
    supabase.from('professionals').select('*'),
    supabase.from('hourly_rates').select('*'),
  ]);

  if (projRes.error) throw projRes.error;
  if (entriesRes.error) throw entriesRes.error;

  const typedProjects = (projRes.data || []) as DBProject[];
  const typedEntries = (entriesRes.data || []) as unknown as (DBTimeEntry & {
    work_date?: string;
    hourly_rate_applied?: number;
  })[];
  const typedProfessionals = (profRes.data || []) as DBProfessional[];
  const typedRates = (ratesRes.data || []) as DBHourlyRate[];

  // 3. Mapeia Custo-Hora por Profissional (fallback para cadastros atuais)
  const rateMap = new Map<string, number>();
  typedRates.forEach((r) => {
    const key = r.professional_id || r.user_id || r.id;
    const rateValue = Number(r.rate ?? r.hourly_rate ?? 0);
    if (key) rateMap.set(key, rateValue);
  });

  // 4. Mapeia os dados dos Profissionais
  const profMap = new Map<string, DBProfessional>();
  typedProfessionals.forEach((p) => profMap.set(p.id, p));

  // 5. Monta o DRE calculando valores reais filtrados por período
  return typedProjects.map((p) => {
    const projectEntries = typedEntries.filter((e) => e.project_id === p.id);

    // Soma de horas
    const hoursLogged = projectEntries.reduce(
      (acc, e) => acc + Number(e.duration_hours ?? e.hours ?? 0),
      0
    );

    const projectProfMap = new Map<string, ProfessionalDetail>();
    let directCost = 0;

    projectEntries.forEach((e) => {
      const profId = e.professional_id || e.user_id || 'unknown';
      const profObj = profMap.get(profId);

      const name = profObj?.name || profObj?.full_name || 'Profissional Sem Nome';
      
      // Prioriza a taxa histórica salva no lançamento (hourly_rate_applied), senão usa a taxa atual
      const rate = Number(e.hourly_rate_applied) || rateMap.get(profId) || 0;
      const hours = Number(e.duration_hours ?? e.hours ?? 0);

      const entryCost = hours * rate;
      directCost += entryCost;

      if (!projectProfMap.has(profId)) {
        projectProfMap.set(profId, {
          id: profId,
          name,
          hours: 0,
          hourlyRate: rate,
          totalCost: 0,
          projectId: p.id,
        });
      }

      const profItem = projectProfMap.get(profId)!;
      profItem.hours += hours;
      profItem.totalCost += entryCost;
    });

    const revenue = Number(p.revenue) || 0;
    const tax = revenue * 0.08; // Imposto de 8%
    const indirectCost = Number(p.indirect_cost) || 5000;

    return {
      id: p.id,
      name: p.name,
      revenue,
      hoursLogged,
      directCost,
      indirectCost,
      tax,
      professionals: Array.from(projectProfMap.values()),
    };
  });
};