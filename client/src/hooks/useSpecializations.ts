import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Specialization {
  id: number;
  name: string;
  description?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useSpecializations = (activeOnly: boolean = true) => {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [fullSpecializations, setFullSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/specializations', {
          params: activeOnly ? { isActive: 'true' } : {}
        });
        
        if (response.data.success) {
          const specs = response.data.data as Specialization[];
          setFullSpecializations(specs);
          // Extract just the names for backward compatibility
          setSpecializations(specs.map(s => s.name));
        }
      } catch (err) {
        console.error('Error fetching specializations:', err);
        setError('Failed to load specializations');
        // Fallback to empty array
        setSpecializations([]);
        setFullSpecializations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecializations();
  }, [activeOnly]);

  return { specializations, fullSpecializations, isLoading, error };
};
