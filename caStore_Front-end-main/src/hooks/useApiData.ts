'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiDataOptions<T> {
  fetcher: () => Promise<T | null>;
  mockData: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  refreshInterval?: number; // Opcional: para auto-refresh
}

interface UseApiDataResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  isUsingMock: boolean;
  refresh: () => void;
  isEmpty: boolean;
}

export function useApiData<T>({
  fetcher,
  mockData,
  enabled = true,
  onSuccess,
  onError,
  refreshInterval
}: UseApiDataOptions<T>): UseApiDataResult<T> {
  const [data, setData] = useState<T>(mockData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Evitar bucles infinitos si las funciones no están memoizadas
  const loadData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      
      if (result === null) {
        setData(mockData);
        setIsUsingMock(true);
        onSuccess?.(mockData);
      } else {
        setData(result);
        setIsUsingMock(false);
        onSuccess?.(result);
      }
    } catch (err: unknown) {
      setData(mockData);
      setIsUsingMock(true);
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, mockData]); // Quitamos fetcher, onSuccess y onError del array

  useEffect(() => {
    loadData();

    if (refreshInterval && enabled) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadData, refreshInterval, enabled]);

  // Verificar si los datos están vacíos (asumiendo que T puede ser array o objeto con arrays)
  const checkIsEmpty = (d: any): boolean => {
    if (!d) return true;
    if (Array.isArray(d)) return d.length === 0;
    if (typeof d === 'object') {
      // Si es un objeto, revisamos si sus propiedades son colecciones vacías
      return Object.values(d).every(val => checkIsEmpty(val));
    }
    return false;
  };

  return {
    data,
    isLoading,
    error,
    isUsingMock,
    refresh: loadData,
    isEmpty: checkIsEmpty(data) && !isLoading
  };
}
