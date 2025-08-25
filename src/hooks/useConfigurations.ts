import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Configuration {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useConfigurations() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .order('key');

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfiguration = (key: string) => {
    return configurations.find(config => config.key === key);
  };

  const updateConfiguration = async (key: string, value: any, description?: string) => {
    try {
      const { error } = await supabase
        .from('configurations')
        .upsert({
          key,
          value,
          description
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration updated successfully"
      });

      await fetchConfigurations();
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    loading,
    fetchConfigurations,
    getConfiguration,
    updateConfiguration
  };
}