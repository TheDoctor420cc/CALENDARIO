-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rank TEXT NOT NULL CHECK (rank IN ('R2', 'R3', 'R4', 'R5')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  month_key TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(month_key, day)
);

-- Create vacation_days table
CREATE TABLE IF NOT EXISTS vacation_days (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, month_key, day)
);

-- Insert initial employees
INSERT INTO employees (id, name, rank) VALUES
  ('sofiar5', 'Sofía', 'R5'),
  ('pablor5', 'Pablo', 'R5'),
  ('marr4', 'Mar', 'R4'),
  ('blancar4', 'Blanca', 'R4'),
  ('irener3', 'Irene', 'R3'),
  ('pepelur3', 'Pepelu', 'R3'),
  ('hellenr2', 'Hellen', 'R2'),
  ('oscarr2', 'Oscar', 'R2')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_month_key ON schedules(month_key);
CREATE INDEX IF NOT EXISTS idx_schedules_employee_id ON schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_vacation_days_employee_id ON vacation_days(employee_id);
CREATE INDEX IF NOT EXISTS idx_vacation_days_month_key ON vacation_days(month_key);
