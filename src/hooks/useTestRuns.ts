import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TestRun {
  id: string;
  test_case_id: string;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  test_case?: {
    name: string;
    tags: string[];
  };
}

export interface TestRunsStats {
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  averageDuration: number;
  successRate: number;
}

export function useTestRuns(dateRange?: { start: Date; end: Date }, tags?: string[]) {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [stats, setStats] = useState<TestRunsStats>({
    totalRuns: 0,
    passedRuns: 0,
    failedRuns: 0,
    averageDuration: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTestRuns = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('test_runs')
        .select(`
          *,
          test_case:test_cases(name, tags)
        `)
        .order('started_at', { ascending: false });

      // Apply date range filter
      if (dateRange) {
        query = query
          .gte('started_at', dateRange.start.toISOString())
          .lte('started_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data?.map(item => ({
        ...item,
        status: item.status as 'running' | 'passed' | 'failed' | 'skipped'
      })) || [];

      // Apply tag filter
      if (tags && tags.length > 0) {
        filteredData = filteredData.filter(run => 
          run.test_case?.tags?.some((tag: string) => tags.includes(tag))
        );
      }

      setTestRuns(filteredData);
      
      // Calculate stats
      const totalRuns = filteredData.length;
      const passedRuns = filteredData.filter(run => run.status === 'passed').length;
      const failedRuns = filteredData.filter(run => run.status === 'failed').length;
      const durations = filteredData
        .filter(run => run.duration && run.duration > 0)
        .map(run => run.duration!);
      const averageDuration = durations.length > 0 
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
        : 0;
      const successRate = totalRuns > 0 ? (passedRuns / totalRuns) * 100 : 0;

      setStats({
        totalRuns,
        passedRuns,
        failedRuns,
        averageDuration,
        successRate
      });

    } catch (error) {
      console.error('Error fetching test runs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch test runs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTestRunsByDate = () => {
    const runsByDate: Record<string, { passed: number; failed: number }> = {};
    
    testRuns.forEach(run => {
      const date = new Date(run.started_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!runsByDate[date]) {
        runsByDate[date] = { passed: 0, failed: 0 };
      }
      
      if (run.status === 'passed') {
        runsByDate[date].passed++;
      } else if (run.status === 'failed') {
        runsByDate[date].failed++;
      }
    });

    return Object.entries(runsByDate).map(([date, counts]) => ({
      date,
      ...counts
    }));
  };

  const getPerformanceData = () => {
    const performanceByTest: Record<string, {
      name: string;
      runs: number;
      totalDuration: number;
      avgDuration: number;
      passRate: number;
    }> = {};

    testRuns.forEach(run => {
      if (!run.test_case?.name) return;
      
      const testName = run.test_case.name;
      if (!performanceByTest[testName]) {
        performanceByTest[testName] = {
          name: testName,
          runs: 0,
          totalDuration: 0,
          avgDuration: 0,
          passRate: 0
        };
      }

      const testData = performanceByTest[testName];
      testData.runs++;
      
      if (run.duration) {
        testData.totalDuration += run.duration;
      }
    });

    // Calculate averages and pass rates
    Object.values(performanceByTest).forEach(testData => {
      testData.avgDuration = testData.totalDuration / testData.runs;
      
      const testRunsForCase = testRuns.filter(run => run.test_case?.name === testData.name);
      const passedRuns = testRunsForCase.filter(run => run.status === 'passed').length;
      testData.passRate = testRunsForCase.length > 0 ? (passedRuns / testRunsForCase.length) * 100 : 0;
    });

    return Object.values(performanceByTest);
  };

  useEffect(() => {
    fetchTestRuns();
  }, [dateRange, tags]);

  return {
    testRuns,
    stats,
    loading,
    fetchTestRuns,
    getTestRunsByDate,
    getPerformanceData
  };
}