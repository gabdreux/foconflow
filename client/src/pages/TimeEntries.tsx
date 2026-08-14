import React, { useEffect, useState, useCallback } from 'react';
import { TimeEntryForm } from '../components/forms/TimeEntryForm';
import { api } from '../services/api';

interface TimeEntry {
  id: string;
  work_date: string;
  duration_hours: number;
  description: string;
  hourly_rate_applied: number;
  projects: { name: string };
}

export const TimeEntries: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca inicial dos dados ao carregar a página
  useEffect(() => {
    let isSubscribed = true;

    api.get('/time-entries')
      .then((data) => {
        if (isSubscribed) setEntries(data);
      })
      .catch((err) => {
        console.error('Erro ao carregar lançamentos:', err);
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Callback acionado pelo formulário ao salvar um novo lançamento
  const handleSuccess = useCallback(async () => {
    try {
      const data = await api.get('/time-entries');
      setEntries(data);
    } catch (err) {
      console.error('Erro ao atualizar lançamentos:', err);
    }
  }, []);

  return (
    <div className="page-container">
      <h2>Apontamento de Horas</h2>

      <div className="grid-2-cols">
        <TimeEntryForm onSuccess={handleSuccess} />

        <div className="entries-list-card">
          <h3>Meus Apontamentos Recentes</h3>
          {loading ? (
            <p>Carregando registros...</p>
          ) : entries.length === 0 ? (
            <p className="empty-state">Nenhum apontamento registrado ainda.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Projeto</th>
                  <th>Horas</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.work_date).toLocaleDateString('pt-BR')}</td>
                    <td><strong>{entry.projects?.name}</strong></td>
                    <td>{entry.duration_hours}h</td>
                    <td>{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};