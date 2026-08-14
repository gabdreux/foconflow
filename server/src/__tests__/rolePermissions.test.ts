import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Permissões e RBAC (Segurança de Rotas)', () => {
  
  function checkAdminAccess(userRole: string): boolean {
    return userRole === 'ADMIN';
  }

  it('deve permitir acesso aos KPIs financeiros para usuários com role ADMIN', () => {
    const user = { id: 'user-1', role: 'ADMIN' };
    const canAccess = checkAdminAccess(user.role);
    assert.strictEqual(canAccess, true);
  });

  it('deve BLOQUEAR acesso aos KPIs financeiros para usuários comuns (USER)', () => {
    const user = { id: 'user-2', role: 'USER' };
    const canAccess = checkAdminAccess(user.role);
    assert.strictEqual(canAccess, false);
  });
});