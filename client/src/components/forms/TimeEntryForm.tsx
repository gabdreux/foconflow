import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Project {
  id: string;
  name: string;
}

export const TimeEntryForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  
  const getInitialDraft = () => {
    const draft = localStorage.getItem('focon_time_entry_draft');
    if (draft) {
      try {
        return JSON.parse(draft);
      } catch {
        return null;
      }
    }
    return null;
  };

  const draft = getInitialDraft();


  const [projectId, setProjectId] = useState(draft?.projectId || '');
  const [workDate, setWorkDate] = useState(draft?.workDate || new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState(draft?.durationHours || '');
  const [description, setDescription] = useState(draft?.description || '');
  const [isDraft, setIsDraft] = useState(!!draft);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    api.get('/projects')
      .then((response) => {
        // console.log('Projetos vindos do backend:', response);
        setProjects(Array.isArray(response) ? response : response.data || []);
      })
      .catch(console.error);
  }, []);


  const handleInputChange = (field: string, value: string) => {
    if (field === 'projectId') setProjectId(value);
    if (field === 'workDate') setWorkDate(value);
    if (field === 'durationHours') setDurationHours(value);
    if (field === 'description') setDescription(value);

    const draftData = {
      projectId: field === 'projectId' ? value : projectId,
      workDate: field === 'workDate' ? value : workDate,
      durationHours: field === 'durationHours' ? value : durationHours,
      description: field === 'description' ? value : description,
    };
    
    localStorage.setItem('focon_time_entry_draft', JSON.stringify(draftData));
    setIsDraft(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/time-entries', {
        project_id: projectId,
        work_date: workDate,
        duration_hours: Number(durationHours),
        description,
      });

      localStorage.removeItem('focon_time_entry_draft');
      setIsDraft(false);
      setDurationHours('');
      setDescription('');
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="time-entry-card" onSubmit={handleSubmit}>
      <div className="card-header">
        <h3>Apontar Horas Trabalhadas</h3>
        {isDraft && <span className="badge-draft">Rascunho salvo localmente</span>}
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="form-group">
        <label>Projeto</label>
        <select 
          value={projectId} 
          onChange={(e) => handleInputChange('projectId', e.target.value)}
          required
        >
          <option value="">Selecione um projeto...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Data</label>
          <input 
            type="date" 
            value={workDate} 
            onChange={(e) => handleInputChange('workDate', e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label>Duração (Horas)</label>
          <input 
            type="number" 
            step="0.5" 
            min="0.5" 
            max="24"
            placeholder="Ex: 8"
            value={durationHours} 
            onChange={(e) => handleInputChange('durationHours', e.target.value)}
            required 
          />
        </div>
      </div>

      <div className="form-group">
        <label>Descrição das Atividades</label>
        <textarea 
          rows={3}
          placeholder="Ex: Acompanhamento de concretagem e checagem de armadura..."
          value={description} 
          onChange={(e) => handleInputChange('description', e.target.value)}
          required 
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Registrando...' : 'Registrar Apontamento'}
      </button>
    </form>
  );
};