import { useCallback, useEffect, useState } from 'react';
import type { WebsiteData } from '../types';
import { fetchWebsiteContent, resetWebsiteCache } from '../api/agency';

export function useWebsite(): {
  data: WebsiteData | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
} {
  const [data, setData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWebsiteContent();
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(() => {
    resetWebsiteCache();
    void load();
  }, [load]);

  return { data, loading, error, reload };
}
