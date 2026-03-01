import { useState, useEffect } from 'react';
import axios from 'axios';
import type { DialysisSession } from '../types/dialysis';

interface FetchState {
  data: DialysisSession[];
  loading: boolean;
  error: string | null;
}

export const useFetchSchedule = (unitId: string) => {
  const [state, setState] = useState<FetchState>({
    data: [],
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/${unitId}`);
      setState({
        data: response.data.data, // Accessing the array from the backend response
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState({
        data: [],
        loading: false,
        error: err.response?.data?.message || "Failed to fetch schedule. Check your connection.",
      });
    }
  };

  useEffect(() => {
    if (unitId) fetchData();
  }, [unitId]);

  return { ...state, refetch: fetchData };
};