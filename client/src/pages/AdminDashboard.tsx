import React, { useEffect, useState, useMemo } from 'react';
import { getAdminKPIs, type ProjectKPI, type ProfessionalDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectKPI[]>([]);
  //const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtros
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    let isMounted = true;

    const fetchKPIs = async () => {
      //setLoading(true);
      try {
        const data = await getAdminKPIs(startDate, endDate);
        if (isMounted) {
          setProjects(data);
          setError('');
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Erro ao carregar dados do DRE e KPIs.';
          setError(msg);
        }
      }
    };

    fetchKPIs();

    return () => {
      isMounted = false;
    };
  }, [user, startDate, endDate]);

  // Limpar Filtros de Período
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedProject('ALL');
  };

  // Filtro por Projeto
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (
        selectedProject !== 'ALL' &&
        p.id !== selectedProject &&
        p.name !== selectedProject
      ) {
        return false;
      }
      return true;
    });
  }, [projects, selectedProject]);

  // Lista Dinâmica de Profissionais extraída dos Projetos Filtrados
  const filteredProfessionals = useMemo(() => {
    const list: ProfessionalDetail[] = [];
    filteredProjects.forEach((p) => {
      if (p.professionals && Array.isArray(p.professionals)) {
        list.push(...p.professionals);
      }
    });

    // Consolidar profissionais repetidos em múltiplos projetos
    const consolidated = new Map<string, ProfessionalDetail>();
    list.forEach((prof) => {
      if (!consolidated.has(prof.name)) {
        consolidated.set(prof.name, { ...prof });
      } else {
        const existing = consolidated.get(prof.name)!;
        existing.hours += prof.hours;
        existing.totalCost += prof.totalCost;
      }
    });

    return Array.from(consolidated.values());
  }, [filteredProjects]);

  // Totais dos Cards
  const totalRevenue = useMemo(
    () => filteredProjects.reduce((acc, p) => acc + (p.revenue || 0), 0),
    [filteredProjects]
  );
  const totalLaborCost = useMemo(
    () => filteredProjects.reduce((acc, p) => acc + (p.directCost || 0), 0),
    [filteredProjects]
  );
  const totalIndirectCost = useMemo(
    () => filteredProjects.reduce((acc, p) => acc + (p.indirectCost || 0), 0),
    [filteredProjects]
  );
  const totalTax = useMemo(
    () =>
      filteredProjects.reduce(
        (acc, p) => acc + (p.tax || p.revenue * 0.08 || 0),
        0
      ),
    [filteredProjects]
  );

  const totalResult = useMemo(() => {
    return totalRevenue - totalLaborCost - totalTax - totalIndirectCost;
  }, [totalRevenue, totalLaborCost, totalTax, totalIndirectCost]);

  const avgMarginPercent = useMemo(() => {
    if (!totalRevenue) return '0.0';
    return ((totalResult / totalRevenue) * 100).toFixed(1);
  }, [totalResult, totalRevenue]);

  if (user?.role !== 'ADMIN') {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#18181b',
          borderRadius: '8px',
          border: '1px solid #ef4444',
        }}
      >
        <h2 style={{ color: '#ef4444', margin: '0 0 1rem 0' }}>
          🚫 Acesso Negado
        </h2>
        <p style={{ color: '#a1a1aa' }}>
          Você não tem permissão para visualizar o DRE e os relatórios de gestão.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            📊 Visão do Gestor - DRE
          </h2>
          <p style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0' }}>
            DRE e rentabilidade consolidada do Supabase
          </p>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#27272a',
            color: '#fff',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          🖨️ Exportar PDF
        </button>
      </div>

      {/* Painel de Filtros (Projeto e Intervalo de Datas) */}
      <div
        style={{
          background: '#18181b',
          padding: '1.2rem',
          borderRadius: '8px',
          border: '1px solid #27272a',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Filtro de Projeto */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              color: '#a1a1aa',
              marginBottom: '0.4rem',
            }}
          >
            Filtrar por Projeto
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#fff',
              borderRadius: '4px',
            }}
          >
            <option value="ALL">Todos os Projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Data Inicial */}
        <div style={{ flex: '1', minWidth: '160px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              color: '#a1a1aa',
              marginBottom: '0.4rem',
            }}
          >
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#fff',
              borderRadius: '4px',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Data Final */}
        <div style={{ flex: '1', minWidth: '160px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              color: '#a1a1aa',
              marginBottom: '0.4rem',
            }}
          >
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#fff',
              borderRadius: '4px',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Botão Limpar Filtros */}
        {(startDate || endDate || selectedProject !== 'ALL') && (
          <button
            onClick={handleClearFilters}
            style={{
              padding: '0.5rem 1rem',
              background: '#3f3f46',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            🧹 Limpar Filtros
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            color: '#ef4444',
            padding: '1rem',
            background: '#27272a',
            borderRadius: '6px',
          }}
        >
          {error}
        </div>
      )}

      {/* 4 CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            background: '#18181b',
            padding: '1.2rem',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
            Receita Total
          </span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              color: '#10b981',
              marginTop: '0.4rem',
            }}
          >
            R${' '}
            {totalRevenue.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        <div
          style={{
            background: '#18181b',
            padding: '1.2rem',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
            Custo Mão de Obra
          </span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              color: '#ef4444',
              marginTop: '0.4rem',
            }}
          >
            R${' '}
            {totalLaborCost.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        <div
          style={{
            background: '#18181b',
            padding: '1.2rem',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
            Resultado Líquido
          </span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              color: totalResult >= 0 ? '#3b82f6' : '#ef4444',
              marginTop: '0.4rem',
            }}
          >
            R${' '}
            {totalResult.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        <div
          style={{
            background: '#18181b',
            padding: '1.2rem',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
            Margem Média (%)
          </span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              color: '#f59e0b',
              marginTop: '0.4rem',
            }}
          >
            {avgMarginPercent}%
          </div>
        </div>
      </div>

      {/* TABELA DRE POR PROJETO */}
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>
          📌 Resultado por Projeto
        </h3>
        <div
          style={{
            background: '#18181b',
            borderRadius: '8px',
            border: '1px solid #27272a',
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              color: '#fff',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#27272a',
                  borderBottom: '1px solid #3f3f46',
                }}
              >
                <th style={{ padding: '0.8rem 1rem' }}>Projeto</th>
                <th style={{ padding: '0.8rem 1rem' }}>Receita</th>
                <th style={{ padding: '0.8rem 1rem' }}>Horas</th>
                <th style={{ padding: '0.8rem 1rem' }}>Custo M.O.</th>
                <th style={{ padding: '0.8rem 1rem' }}>Imposto (8%)</th>
                <th style={{ padding: '0.8rem 1rem' }}>Custo Indireto</th>
                <th style={{ padding: '0.8rem 1rem' }}>Resultado ($)</th>
                <th style={{ padding: '0.8rem 1rem' }}>Margem (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const tax = project.tax || project.revenue * 0.08;
                const result =
                  project.revenue -
                  project.directCost -
                  tax -
                  project.indirectCost;
                const marginPct =
                  project.revenue > 0 ? (result / project.revenue) * 100 : 0;

                return (
                  <tr
                    key={project.id}
                    style={{ borderBottom: '1px solid #27272a' }}
                  >
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold' }}>
                      {project.name}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      R${' '}
                      {(project.revenue || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      {project.hoursLogged || 0}h
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#ef4444' }}>
                      R${' '}
                      {(project.directCost || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#ef4444' }}>
                      R${' '}
                      {tax.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#ef4444' }}>
                      R${' '}
                      {(project.indirectCost || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      style={{
                        padding: '0.8rem 1rem',
                        color: result >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                      }}
                    >
                      R${' '}
                      {result.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      style={{
                        padding: '0.8rem 1rem',
                        color: marginPct >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                      }}
                    >
                      {marginPct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABELA POR PROFISSIONAL */}
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>
          👷 Detalhamento por Profissional (Dados Reais)
        </h3>
        <div
          style={{
            background: '#18181b',
            borderRadius: '8px',
            border: '1px solid #27272a',
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              color: '#fff',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#27272a',
                  borderBottom: '1px solid #3f3f46',
                }}
              >
                <th style={{ padding: '0.8rem 1rem' }}>Profissional</th>
                <th style={{ padding: '0.8rem 1rem' }}>Horas Registradas</th>
                <th style={{ padding: '0.8rem 1rem' }}>Custo-Hora Vigente</th>
                <th style={{ padding: '0.8rem 1rem' }}>Custo Total Calculado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessionals.length > 0 ? (
                filteredProfessionals.map((prof) => (
                  <tr key={prof.id} style={{ borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold' }}>
                      {prof.name}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>{prof.hours}h</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      R${' '}
                      {prof.hourlyRate.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                      /h
                    </td>
                    <td
                      style={{
                        padding: '0.8rem 1rem',
                        color: '#ef4444',
                        fontWeight: 'bold',
                      }}
                    >
                      R${' '}
                      {prof.totalCost.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#a1a1aa',
                    }}
                  >
                    Nenhum apontamento encontrado para o período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};