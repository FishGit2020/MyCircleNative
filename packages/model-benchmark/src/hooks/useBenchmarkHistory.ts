import { useState, useCallback } from 'react';
import {
  safeGetJSON,
  safeSetItem,
  StorageKeys,
} from '@mycircle/shared';
import type { BenchmarkRun, BenchmarkResult } from '@mycircle/shared';

const MAX_HISTORY = 50;

export function useBenchmarkHistory() {
  const [history, setHistory] = useState<BenchmarkRun[]>(() => {
    return safeGetJSON<BenchmarkRun[]>(StorageKeys.BENCHMARK_HISTORY_CACHE, []);
  });

  const persist = useCallback((updated: BenchmarkRun[]) => {
    setHistory(updated);
    safeSetItem(StorageKeys.BENCHMARK_HISTORY_CACHE, JSON.stringify(updated));
  }, []);

  const saveRun = useCallback((prompt: string, results: BenchmarkResult[]) => {
    const run: BenchmarkRun = {
      id: `run_${Date.now()}`,
      timestamp: Date.now(),
      prompt,
      results,
      totalEndpoints: results.length,
      completedEndpoints: results.filter((r) => r.success).length,
    };
    const updated = [run, ...history].slice(0, MAX_HISTORY);
    persist(updated);
    return run;
  }, [history, persist]);

  const deleteRun = useCallback((runId: string) => {
    const updated = history.filter((r) => r.id !== runId);
    persist(updated);
  }, [history, persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    history,
    saveRun,
    deleteRun,
    clearAll,
  };
}
