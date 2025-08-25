import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TestCase {
  id: string;
  name: string;
  description?: string;
  status: 'passing' | 'failing' | 'pending' | 'running';
  last_run?: string;
  duration?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TestStep {
  id: string;
  test_case_id: string;
  step_order: number;
  action: string;
  selector?: string;
  value?: string;
  description?: string;
}

export interface TestParameter {
  id: string;
  test_case_id: string;
  key: string;
  value: string;
  description?: string;
}

export function useTestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        last_run: item.last_run ? new Date(item.last_run).toLocaleString() : undefined,
        tags: item.tags || [],
        status: item.status as 'passing' | 'failing' | 'pending' | 'running'
      })) || [];

      setTestCases(formattedData);
    } catch (error) {
      console.error('Error fetching test cases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch test cases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestCase = async (testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('test_cases')
        .insert(testCase)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test case created successfully"
      });

      await fetchTestCases();
      return data;
    } catch (error) {
      console.error('Error creating test case:', error);
      toast({
        title: "Error",
        description: "Failed to create test case",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTestCase = async (id: string, updates: Partial<TestCase>) => {
    try {
      const { error } = await supabase
        .from('test_cases')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test case updated successfully"
      });

      await fetchTestCases();
    } catch (error) {
      console.error('Error updating test case:', error);
      toast({
        title: "Error",
        description: "Failed to update test case",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTestCase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('test_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test case deleted successfully"
      });

      await fetchTestCases();
    } catch (error) {
      console.error('Error deleting test case:', error);
      toast({
        title: "Error",
        description: "Failed to delete test case",
        variant: "destructive"
      });
      throw error;
    }
  };

  const runTest = async (id: string) => {
    try {
      // Start test run
      await supabase
        .from('test_runs')
        .insert({
          test_case_id: id,
          status: 'running',
          started_at: new Date().toISOString()
        });

      // Update test case status
      await updateTestCase(id, { status: 'running' });

      toast({
        title: "Test Started",
        description: "Test execution has begun"
      });

      // Simulate test execution (replace with actual Playwright execution)
      setTimeout(async () => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        const duration = Math.floor(Math.random() * 120000) + 15000; // 15s to 2min

        await supabase
          .from('test_runs')
          .update({
            status: success ? 'passed' : 'failed',
            duration,
            completed_at: new Date().toISOString(),
            error_message: success ? null : 'Sample error message for failed test'
          })
          .eq('test_case_id', id)
          .order('started_at', { ascending: false })
          .limit(1);

        await updateTestCase(id, { 
          status: success ? 'passing' : 'failing',
          duration,
          last_run: new Date().toISOString()
        });

        toast({
          title: success ? "Test Passed" : "Test Failed",
          description: success ? "Test completed successfully" : "Test failed with errors",
          variant: success ? "default" : "destructive"
        });

      }, 3000);

    } catch (error) {
      console.error('Error running test:', error);
      toast({
        title: "Error",
        description: "Failed to run test",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  return {
    testCases,
    loading,
    fetchTestCases,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    runTest
  };
}

export function useTestSteps(testCaseId: string) {
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSteps = async () => {
    if (!testCaseId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('test_steps')
        .select('*')
        .eq('test_case_id', testCaseId)
        .order('step_order');

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error fetching test steps:', error);
      toast({
        title: "Error",
        description: "Failed to fetch test steps",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSteps = async (newSteps: Omit<TestStep, 'id'>[]) => {
    try {
      // Delete existing steps
      await supabase
        .from('test_steps')
        .delete()
        .eq('test_case_id', testCaseId);

      // Insert new steps
      if (newSteps.length > 0) {
        const { error } = await supabase
          .from('test_steps')
          .insert(newSteps);

        if (error) throw error;
      }

      await fetchSteps();
    } catch (error) {
      console.error('Error saving test steps:', error);
      toast({
        title: "Error",
        description: "Failed to save test steps",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSteps();
  }, [testCaseId]);

  return {
    steps,
    loading,
    fetchSteps,
    saveSteps
  };
}

export function useTestParameters(testCaseId: string) {
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchParameters = async () => {
    if (!testCaseId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('test_parameters')
        .select('*')
        .eq('test_case_id', testCaseId);

      if (error) throw error;
      setParameters(data || []);
    } catch (error) {
      console.error('Error fetching test parameters:', error);
      toast({
        title: "Error",
        description: "Failed to fetch test parameters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveParameters = async (newParameters: Omit<TestParameter, 'id'>[]) => {
    try {
      // Delete existing parameters
      await supabase
        .from('test_parameters')
        .delete()
        .eq('test_case_id', testCaseId);

      // Insert new parameters
      if (newParameters.length > 0) {
        const { error } = await supabase
          .from('test_parameters')
          .insert(newParameters);

        if (error) throw error;
      }

      await fetchParameters();
    } catch (error) {
      console.error('Error saving test parameters:', error);
      toast({
        title: "Error",
        description: "Failed to save test parameters",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchParameters();
  }, [testCaseId]);

  return {
    parameters,
    loading,
    fetchParameters,
    saveParameters
  };
}