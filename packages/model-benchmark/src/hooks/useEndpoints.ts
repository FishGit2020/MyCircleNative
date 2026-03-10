import { useState, useCallback } from 'react';
import {
  safeGetJSON,
  safeSetItem,
  StorageKeys,
} from '@mycircle/shared';
import type { BenchmarkEndpoint } from '@mycircle/shared';

const DEFAULT_ENDPOINTS: BenchmarkEndpoint[] = [
  { id: 'openai-gpt4', name: 'GPT-4o', url: 'https://api.openai.com/v1', model: 'gpt-4o', provider: 'openai' },
  { id: 'anthropic-claude', name: 'Claude Sonnet', url: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-5-20250929', provider: 'anthropic' },
  { id: 'ollama-llama', name: 'Llama 3 (Local)', url: 'http://localhost:11434', model: 'llama3', provider: 'ollama' },
];

export function useEndpoints() {
  const [endpoints, setEndpoints] = useState<BenchmarkEndpoint[]>(() => {
    return safeGetJSON<BenchmarkEndpoint[]>(StorageKeys.BENCHMARK_ENDPOINTS, DEFAULT_ENDPOINTS);
  });

  const persist = useCallback((updated: BenchmarkEndpoint[]) => {
    setEndpoints(updated);
    safeSetItem(StorageKeys.BENCHMARK_ENDPOINTS, JSON.stringify(updated));
  }, []);

  const addEndpoint = useCallback((endpoint: Omit<BenchmarkEndpoint, 'id'>) => {
    const newEndpoint: BenchmarkEndpoint = {
      ...endpoint,
      id: `custom_${Date.now()}`,
    };
    persist([...endpoints, newEndpoint]);
    return newEndpoint;
  }, [endpoints, persist]);

  const updateEndpoint = useCallback((id: string, updates: Partial<Omit<BenchmarkEndpoint, 'id'>>) => {
    const updated = endpoints.map((ep) =>
      ep.id === id ? { ...ep, ...updates } : ep,
    );
    persist(updated);
  }, [endpoints, persist]);

  const deleteEndpoint = useCallback((id: string) => {
    const updated = endpoints.filter((ep) => ep.id !== id);
    persist(updated);
  }, [endpoints, persist]);

  return {
    endpoints,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
  };
}
