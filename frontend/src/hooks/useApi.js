/**
 * hooks/useApi.js
 * Generic data-fetching hook that manages loading / error / data state.
 * Usage:
 *   const { data, loading, error, refetch } = useApi(
 *     () => api.getMyEvents(token),
 *     [token]   // dependencies that trigger a refetch
 *   );
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Use a ref to hold the latest fetchFn without re-triggering the effect
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}
