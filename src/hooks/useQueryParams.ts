import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export const useQueryParams = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const getParam = (key: string): string | null => {
    return searchParams.get(key);
  };

  const setParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  const removeParam = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  };

  return {
    getParam,
    setParam,
    removeParam,
    query,
    searchParams,
  };
};