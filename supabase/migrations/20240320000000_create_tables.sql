-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  dose TEXT NOT NULL,
  time TIME NOT NULL,
  frequency TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Medications policies
CREATE POLICY "Users can view their own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON appointments FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert seed data for medications
INSERT INTO medications (user_id, name, type, dose, time, frequency, notes, status)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Amoxicillin', 'tablet', '500mg', '08:00:00', 'daily', 'Take with food', 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Ibuprofen', 'tablet', '400mg', '12:00:00', 'as_needed', 'Take for pain relief', 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Insulin', 'injection', '10 units', '09:00:00', 'daily', 'Store in refrigerator', 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Ventolin', 'inhaler', '2 puffs', '06:00:00', 'as_needed', 'Use before exercise', 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Vitamin D', 'capsule', '1000 IU', '08:00:00', 'daily', 'Take with breakfast', 'active');

-- Insert seed data for appointments
INSERT INTO appointments (user_id, doctor_name, type, purpose, date, time, notes, status)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Dr. Sarah Johnson', 'general checkup', 'Annual health checkup', CURRENT_DATE + INTERVAL '7 days', '10:00:00', 'Bring previous medical records', 'scheduled'),
  ('00000000-0000-0000-0000-000000000000', 'Dr. Michael Chen', 'follow-up', 'Diabetes management review', CURRENT_DATE + INTERVAL '14 days', '14:30:00', 'Bring blood sugar readings', 'scheduled'),
  ('00000000-0000-0000-0000-000000000000', 'Dr. Emily Brown', 'specialist consultation', 'Cardiology consultation', CURRENT_DATE + INTERVAL '30 days', '11:00:00', 'Bring ECG results', 'scheduled'),
  ('00000000-0000-0000-0000-000000000000', 'Dr. James Wilson', 'vaccination', 'Annual flu shot', CURRENT_DATE + INTERVAL '3 days', '15:00:00', 'No special preparation needed', 'scheduled'),
  ('00000000-0000-0000-0000-000000000000', 'Dr. Lisa Anderson', 'laboratory test', 'Blood work and analysis', CURRENT_DATE + INTERVAL '5 days', '09:00:00', 'Fasting required for 12 hours', 'scheduled'); 