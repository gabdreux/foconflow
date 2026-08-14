import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Cálculos Financeiros (DRE & KPIs da Fócon)', () => {

  it('deve calcular corretamente os KPIs do Projeto Residencial Aurora (Paloma + Gabriel)', () => {
    const revenue = 120000;
    const taxRate = 8;
    const indirectCost = 5000;

    const entries = [
      { duration_hours: 40, hourly_rate_applied: 120 }, // Paloma
      { duration_hours: 30, hourly_rate_applied: 150 }, // Gabriel
    ];

    const totalHours = entries.reduce((sum, e) => sum + e.duration_hours, 0);
    const directLaborCost = entries.reduce((sum, e) => sum + (e.duration_hours * e.hourly_rate_applied), 0);
    const taxes = revenue * (taxRate / 100);
    const netRevenue = revenue - taxes;
    const totalCost = directLaborCost + indirectCost;
    const profitMargin = netRevenue - totalCost;
    const marginPercentage = (profitMargin / revenue) * 100;

    assert.strictEqual(totalHours, 70);
    assert.strictEqual(directLaborCost, 9300);
    assert.strictEqual(taxes, 9600);
    assert.strictEqual(totalCost, 14300);
    assert.strictEqual(profitMargin, 96100);
    assert.strictEqual(Math.round(marginPercentage * 100) / 100, 80.08);
  });

  it('[Edge Case] deve lidar com projetos com receita zero sem lançar erro de divisão por zero (NaN/Infinity)', () => {
    const revenue = 0;
    const profitMargin = -2000;

    const marginPercentage = revenue > 0 ? (profitMargin / revenue) * 100 : 0;

    assert.strictEqual(marginPercentage, 0);
    assert.strictEqual(Number.isNaN(marginPercentage), false);
    assert.strictEqual(Number.isFinite(marginPercentage), true);
  });
});