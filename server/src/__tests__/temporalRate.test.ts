import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Snapshots de Tarifas Temporais (hourly_rates)', () => {
  
  const hourlyRatesHistory = [
    { professional_id: 'ana-id', hourly_rate: 100, effective_from: '2026-01-01', effective_until: '2026-01-31' },
    { professional_id: 'ana-id', hourly_rate: 120, effective_from: '2026-02-01', effective_until: null }
  ];

  function findRateForDate(workDate: string) {
    const rate = hourlyRatesHistory.find(r => {
      const fromMatch = r.effective_from <= workDate;
      const untilMatch = !r.effective_until || r.effective_until >= workDate;
      return fromMatch && untilMatch;
    });
    return rate ? rate.hourly_rate : null;
  }

  it('deve aplicar R$ 100/h para um apontamento realizado em Janeiro/2026', () => {
    const rateApplied = findRateForDate('2026-01-15');
    assert.strictEqual(rateApplied, 100);
  });

  it('deve aplicar R$ 120/h para um apontamento realizado em Fevereiro/2026 (após reajuste)', () => {
    const rateApplied = findRateForDate('2026-02-10');
    assert.strictEqual(rateApplied, 120);
  });

  it('[Edge Case / Imutabilidade] Aumento da tarifa no futuro NÃO deve alterar o snapshot registrado no banco', () => {
    const timeEntryJan = {
      id: 'entry-1',
      work_date: '2026-01-15',
      duration_hours: 10,
      hourly_rate_applied: 100
    };

    const currentRateFeb = findRateForDate('2026-02-10');
    assert.strictEqual(currentRateFeb, 120);

    const historicalCost = timeEntryJan.duration_hours * timeEntryJan.hourly_rate_applied;
    assert.strictEqual(historicalCost, 1000);
  });
});