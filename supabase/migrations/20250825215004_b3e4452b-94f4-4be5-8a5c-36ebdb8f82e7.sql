-- Create test_cases table
CREATE TABLE public.test_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('passing', 'failing', 'pending', 'running')),
  last_run TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in milliseconds
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_steps table
CREATE TABLE public.test_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_case_id UUID NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  action TEXT NOT NULL,
  selector TEXT,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_parameters table
CREATE TABLE public.test_parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_case_id UUID NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_runs table
CREATE TABLE public.test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_case_id UUID NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'passed', 'failed', 'skipped')),
  duration INTEGER, -- in milliseconds
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create configurations table
CREATE TABLE public.configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing public access for now - adjust based on auth requirements)
CREATE POLICY "test_cases_policy" ON public.test_cases FOR ALL USING (true);
CREATE POLICY "test_steps_policy" ON public.test_steps FOR ALL USING (true);
CREATE POLICY "test_parameters_policy" ON public.test_parameters FOR ALL USING (true);
CREATE POLICY "test_runs_policy" ON public.test_runs FOR ALL USING (true);
CREATE POLICY "configurations_policy" ON public.configurations FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_test_cases_updated_at
  BEFORE UPDATE ON public.test_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_steps_updated_at
  BEFORE UPDATE ON public.test_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_parameters_updated_at
  BEFORE UPDATE ON public.test_parameters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configurations_updated_at
  BEFORE UPDATE ON public.configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.test_cases (name, description, status, last_run, duration, tags) VALUES
('User Login Flow', 'Tests user authentication and login process', 'passing', now() - interval '2 hours', 45000, ARRAY['login', 'ui']),
('Payment Processing', 'Tests payment flow with various card types', 'failing', now() - interval '1 hour', 83000, ARRAY['payment', 'ordering']),
('Product Search', 'Tests search functionality and filters', 'pending', now() - interval '3 hours', 32000, ARRAY['ui', 'search']);

-- Insert sample test steps
INSERT INTO public.test_steps (test_case_id, step_order, action, selector, value, description) 
SELECT id, 1, 'navigate', '', 'https://example.com/login', 'Navigate to login page'
FROM public.test_cases WHERE name = 'User Login Flow';

INSERT INTO public.test_steps (test_case_id, step_order, action, selector, value, description) 
SELECT id, 2, 'fill', '[data-testid="username"]', 'testuser', 'Enter username'
FROM public.test_cases WHERE name = 'User Login Flow';

-- Insert sample test parameters
INSERT INTO public.test_parameters (test_case_id, key, value, description)
SELECT id, 'accountNumber', '12345', 'Test account number'
FROM public.test_cases WHERE name = 'User Login Flow';

INSERT INTO public.test_parameters (test_case_id, key, value, description)
SELECT id, 'environment', 'staging', 'Testing environment'
FROM public.test_cases WHERE name = 'User Login Flow';

-- Insert sample configurations
INSERT INTO public.configurations (key, value, description) VALUES
('playwright_config', '{"timeout": 30000, "retries": 2, "browser": "chromium", "headless": true}', 'Playwright test configuration'),
('database_config', '{"host": "localhost", "port": 5432, "database": "testdb"}', 'Database connection settings');