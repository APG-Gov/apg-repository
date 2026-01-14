/*
  # Sistema de Agendamento de Aulas Teste

  1. Novas Tabelas
    - `units` - Unidades de ensino
      - `id` (text, primary key)
      - `name` (text)
      - `address` (text)
      - `duration` (integer, duração em minutos)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `time_slots` - Horários disponíveis
      - `id` (uuid, primary key)
      - `unit_id` (text, foreign key)
      - `date` (date)
      - `time` (time)
      - `available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `appointments` - Agendamentos
      - `id` (uuid, primary key)
      - `unit_id` (text, foreign key)
      - `time_slot_id` (uuid, foreign key)
      - `job_id` (text)
      - `application_id` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `cpf` (text)
      - `subject` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para leitura pública de units e time_slots
    - Políticas para criação e atualização de appointments
*/

-- Criar tabela de unidades
CREATE TABLE IF NOT EXISTS units (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  duration integer NOT NULL DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de horários
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id text NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(unit_id, date, time)
);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id text NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  time_slot_id uuid NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  application_id text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  cpf text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'rescheduled', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para units (leitura pública)
CREATE POLICY "Units são públicas para leitura"
  ON units
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Units podem ser atualizadas"
  ON units
  FOR ALL
  TO public
  USING (true);

-- Políticas para time_slots (leitura pública, atualização permitida)
CREATE POLICY "Time slots são públicos para leitura"
  ON time_slots
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Time slots podem ser gerenciados"
  ON time_slots
  FOR ALL
  TO public
  USING (true);

-- Políticas para appointments (leitura e criação permitidas)
CREATE POLICY "Appointments podem ser lidos"
  ON appointments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Appointments podem ser criados"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Appointments podem ser atualizados"
  ON appointments
  FOR UPDATE
  TO public
  USING (true);

-- Inserir as 19 unidades
INSERT INTO units (id, name, address, duration) VALUES
  ('ANITACANETCEEFMP', 'Anita Garibaldi - CEE FMP', 'Rua Anita Garibaldi, 123 - Centro', 60),
  ('CENTRONORTE', 'Centro Norte', 'Av. Norte, 456 - Centro Norte', 60),
  ('CENTROSUL', 'Centro Sul', 'Av. Sul, 789 - Centro Sul', 60),
  ('ZONAESTE', 'Zona Leste', 'Rua Leste, 321 - Zona Leste', 60),
  ('ZONAOESTE', 'Zona Oeste', 'Rua Oeste, 654 - Zona Oeste', 60),
  ('JARDIMEUROPEU', 'Jardim Europeu', 'Av. Europeu, 987 - Jardim Europeu', 60),
  ('VILAOLIMPIA', 'Vila Olímpia', 'Rua Olímpia, 147 - Vila Olímpia', 60),
  ('MORUMBI', 'Morumbi', 'Av. Morumbi, 258 - Morumbi', 60),
  ('SANTANA', 'Santana', 'Rua Santana, 369 - Santana', 60),
  ('TATUAPE', 'Tatuapé', 'Av. Tatuapé, 741 - Tatuapé', 60),
  ('LIBERDADE', 'Liberdade', 'Rua Liberdade, 852 - Liberdade', 60),
  ('BELAVISTA', 'Bela Vista', 'Av. Bela Vista, 963 - Bela Vista', 60),
  ('PERDIZES', 'Perdizes', 'Rua Perdizes, 159 - Perdizes', 60),
  ('PINHEIROS', 'Pinheiros', 'Av. Pinheiros, 753 - Pinheiros', 60),
  ('BROOKLIN', 'Brooklin', 'Rua Brooklin, 426 - Brooklin', 60),
  ('MOOCA', 'Mooca', 'Av. Mooca, 837 - Mooca', 60),
  ('PENHA', 'Penha', 'Rua Penha, 518 - Penha', 60),
  ('SACOMA', 'Sacomã', 'Av. Sacomã, 629 - Sacomã', 60),
  ('JABAQUARA', 'Jabaquara', 'Rua Jabaquara, 951 - Jabaquara', 60)
ON CONFLICT (id) DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_time_slots_unit_date ON time_slots(unit_id, date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(available);
CREATE INDEX IF NOT EXISTS idx_appointments_unit_id ON appointments(unit_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);