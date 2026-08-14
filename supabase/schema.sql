-- =========================================================
-- 1. EXTENSÕES & ESTRUTURA BASE
-- =========================================================
create extension if not exists pgcrypto;

-- PROFESSIONALS
create table public.professionals (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'USER' check (role in ('ADMIN', 'USER')),
  created_at timestamptz not null default now()
);

-- HOURLY RATES (HISTÓRICO COM VIGÊNCIA)
create table public.hourly_rates (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  hourly_rate numeric(10,2) not null check (hourly_rate >= 0),
  effective_from date not null,
  effective_until date,
  created_at timestamptz not null default now(),
  constraint hourly_rates_valid_period check (effective_until is null or effective_until >= effective_from),
  constraint hourly_rates_unique_start unique (professional_id, effective_from)
);

-- PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  revenue numeric(12,2) not null default 0 check (revenue >= 0),
  indirect_cost numeric(12,2) not null default 0 check (indirect_cost >= 0),
  tax_rate numeric(5,2) not null default 8 check (tax_rate >= 0 and tax_rate <= 100),
  created_at timestamptz not null default now()
);

-- TIME ENTRIES (APONTAMENTOS)
create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  work_date date not null,
  duration_hours numeric(6,2) not null check (duration_hours > 0 and duration_hours <= 24),
  hourly_rate_applied numeric(10,2) not null check (hourly_rate_applied >= 0),
  description text not null check (char_length(trim(description)) > 0),
  created_at timestamptz not null default now()
);

-- ÍNDICES DE PERFORMANCE
create index idx_hourly_rates_prof_date on public.hourly_rates (professional_id, effective_from, effective_until);
create index idx_time_entries_prof on public.time_entries(professional_id);
create index idx_time_entries_proj on public.time_entries(project_id);
create index idx_time_entries_date on public.time_entries(work_date);

-- =========================================================
-- 2. TRIGGER ANTI-SOBREPOSIÇÃO DE TARIFAS (SINTAXE CORRIGIDA)
-- =========================================================
CREATE OR REPLACE FUNCTION public.check_hourly_rate_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.effective_until IS NOT NULL AND NEW.effective_until < NEW.effective_from THEN
    RAISE EXCEPTION 'A data final da vigência não pode ser menor que a inicial.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.hourly_rates
    WHERE professional_id = NEW.professional_id 
      AND id <> NEW.id
      AND daterange(effective_from, NEW.effective_until, '[]') && daterange(NEW.effective_from, effective_until, '[]')
  ) THEN
    RAISE EXCEPTION 'Conflito de vigência: Já existe tarifa para este período.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_hourly_rate_overlap
BEFORE INSERT OR UPDATE ON public.hourly_rates
FOR EACH ROW EXECUTE FUNCTION public.check_hourly_rate_overlap();

-- =========================================================
-- 3. HELPER FUNCTION (IS_ADMIN)
-- =========================================================
create schema if not exists private;
create or replace function private.is_admin() 
returns boolean 
language sql 
stable 
security definer 
set search_path = '' as $$
  select exists (
    select 1 from public.professionals 
    where id = (select auth.uid()) and role = 'ADMIN'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- =========================================================
-- 4. POLÍTICAS DE SEGURANÇA (RLS REFORÇADAS)
-- =========================================================
alter table public.professionals enable row level security;
alter table public.hourly_rates enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;

-- PROFESSIONALS
create policy "Read professionals" on public.professionals 
  for select to authenticated using ((select auth.uid()) = id or (select private.is_admin()));

-- HOURLY RATES (Apenas Admin pode ler ou alterar)
create policy "Admin hourly_rates" on public.hourly_rates 
  for all to authenticated using ((select private.is_admin()));

-- PROJECTS
create policy "Read projects" on public.projects 
  for select to authenticated using (true);

create policy "Admin mutate projects" on public.projects 
  for all to authenticated using ((select private.is_admin()));

-- TIME ENTRIES
create policy "Read time_entries" on public.time_entries 
  for select to authenticated using ((select auth.uid()) = professional_id or (select private.is_admin()));

create policy "Insert time_entries" on public.time_entries 
  for insert to authenticated with check ((select auth.uid()) = professional_id or (select private.is_admin()));

-- =========================================================
-- 5. SEEDS INICIAIS (PROJETOS DO DESAFIO)
-- =========================================================
insert into public.projects (name, revenue, indirect_cost, tax_rate) values
('Residencial Aurora', 120000.00, 5000.00, 8.00),
('Edifício Horizonte', 80000.00, 5000.00, 8.00);