# FoconFlow — Controle de Produção e Rentabilidade por Projeto
> **Desafio Técnico — Desenvolvedor Full Stack (Fócon Engenharia)**

Solução desenvolvida para o módulo de **Controle de Produção e Rentabilidade por Projeto** do ecossistema **FoconFlow**. Permite a gestão financeira detalhada por administradores e o registro seguro de horas por profissionais.

---

## 🔑 Credenciais de Acesso (Demo)

Para testar as diferentes permissões da aplicação e regras de RLS no banco de dados:

- **Administrador (Acesso Financeiro Completo):**
  - **E-mail:** `admin@demo.com`
  - **Senha:** `12345FCN!`

- **Usuário Comum / Profissional (Apenas Apontamento de Horas):**
  - **E-mail:** `ana@demo.com` *(ou carla@demo.com)*
  - **Senha:** `12345FCN!`

---

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para instalar e executar a aplicação em até 4 comandos:

# 1. Clonar o repositório e entrar na pasta
git clone https://github.com/gabdreux/foconflow
cd foconflow

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente (copiar o .env.example)
cp .env.example .env

# 4. Iniciar a aplicação em ambiente de desenvolvimento
npm run dev

Para executar os testes automatizados:
npm run test

---

## 🛠️ Tech Stack & Arquitetura

- **Frontend:** React, TypeScript, Tailwind CSS, Lucide React (ícones)
- **Backend & Banco de Dados:** Supabase (PostgreSQL, Row Level Security - RLS, Auth)
- **Testes:** Vitest / React Testing Library
- **Relatórios:** CSS Print styles para geração de PDF/Impressão nativa

---

## 🗄️ Modelo de Dados (Supabase / PostgreSQL)

O modelo foi projetado com suporte a **histórico de custo-hora**, impedindo que alterações futuras afetem lançamentos passados.

1. **professionals**: Cadastro de profissionais e perfil de permissão (role: admin ou user).
2. **hourly_rates**: Histórico de custo-hora por profissional (professional_id, rate, valid_from, valid_until).
3. **projects**: Cadastro de projetos (id, name, client, contracted_revenue, status).
4. **time_entries**: Apontamentos de horas (id, project_id, professional_id, work_date, duration_hours, hourly_rate_applied, description, status).
   - *Nota:* O campo hourly_rate_applied congela o custo-hora do profissional no momento do apontamento para rastreabilidade e integridade histórica.

---

## 🔒 Segurança e Controles de Acesso (RLS - Row Level Security)

A segurança é garantida diretamente na camada do banco de dados (Supabase PostgreSQL), e não apenas ocultando componentes na interface:

- **Usuário Comum (user):**
  - Pode criar e visualizar **apenas** seus próprios apontamentos (time_entries onde professional_id = auth.uid()).
  - Não possui acesso de leitura às tabelas financeiras nem aos apontamentos de outros colaboradores.
- **Administrador (admin):**
  - Possui acesso irrestrito de leitura e consulta consolidada aos dados financeiros, DRE por projeto e apontamentos gerais.

---

## 📊 Regras de Negócio e Cálculos Financeiros

Os cálculos do Dashboard respeitam integralmente as diretrizes do desafio:

- **Imposto Fixo:** 8% sobre a receita contratada do projeto.
- **Custo Indireto Fixo:** R$ 5.000,00 por projeto.
- **Custo M.O. (Mão de Obra):** Soma de (Duração em Horas x Custo-Hora Aplicado).
- **Resultado Líquido do Projeto:** Receita - (Custo M.O. + Imposto (8%) + Custo Indireto (R$ 5.000)).
- **Margem (%):** (Resultado Líquido / Receita Total) x 100.

### Dados da Demonstração (Conferência):
- **Residencial Aurora (Receita: R$ 120.000):**
  - Ana (40h a R$ 120/h) + Bruno (30h a R$ 150/h) -> Custo M.O.: R$ 9.300,00 | Imposto: R$ 9.600,00 | Indireto: R$ 5.000,00 -> **Resultado: R$ 96.100,00 (80.1%)**
- **Edifício Horizonte (Receita: R$ 80.000):**
  - Ana (20h a R$ 120/h) + Carla (25h a R$ 100/h) -> Custo M.O.: R$ 4.900,00 | Imposto: R$ 6.400,00 | Indireto: R$ 5.000,00 -> **Resultado: R$ 63.700,00 (79.6%)**

---

## 💡 Decisões de Projeto & Limitações

1. **Persistência de Taxa Vigente:** Optou-se por gravar a hourly_rate_applied no ato do registro do apontamento, garantindo rastreabilidade histórica e imunidade a alterações de tabelas de preço futuras.
2. **Escopo de Projetos (Tempo de Teste):** Para viabilizar a entrega do fluxo ponta a ponta em 6 horas, o percentual de imposto (8%) e custo indireto (R$ 5.000) foram vinculados à DRE dos projetos base pré-configurados.

---

## 🔮 Retrospectiva & Evoluções Futuras

- **Observação sobre o prazo:** O tempo de 6 horas corridas foi bastante reduzido para o volume de requisitos do desafio. Por conta disso, priorizei garantir o funcionamento completo do fluxo ponta a ponta (persistência, filtros, regras de negócio e DRE), não havendo tempo hábil para refinamento de CSS/layout e criação de testes unitários/E2E automatizados no frontend (as validações de interface foram realizadas via testes manuais no navegador).
- **O que faria com mais tempo:** Implementaria a suíte de testes automatizados do frontend (Jest/RTL), o polimento do layout/UX, e um módulo CRUD completo de Projetos para customizar taxas de impostos e custos indiretos dinamicamente, além do fluxo de aprovação de horas por gestores.
- **Maior Risco Identificado:** Reajuste retroativo de apontamentos ou alteração de contratos sem o congelamento da DRE, o que poderia distorcer o histórico financeiro de períodos já encerrados.
- **Primeira Melhoria para Produção:** Implementação de uma rotina automatizada de fechamento mensal de horas (lock de edições e congelamento de DRE após determinada data do mês).

---

## 🤖 Declaração sobre o Uso de Inteligência Artificial

Em conformidade com a Seção 9 das instruções do desafio:

- **Utilização de IA:** Sim.
- **Ferramenta Utilizada:** Gemini / ChatGPT (LLM Assistant).
- **Atividades em que auxiliou:**
  1. Conferência e validação da consistência dos cálculos matemáticos de DRE e margem de lucro.
  2. Geração rápida de massa de dados SQL de exemplo (seeds) para preenchimento dos cenários de teste da Seção 5.
  3. Estruturação do template de documentação e revisão do README.md.