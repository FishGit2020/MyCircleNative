import { useState, useCallback } from 'react';
import {
  safeGetJSON,
  safeSetItem,
  StorageKeys,
} from '@mycircle/shared';
import type { BenchmarkRun, BenchmarkResult, BenchmarkEndpoint } from '@mycircle/shared';
import { useEndpoints } from './useEndpoints';

export function useBenchmark() {
  const { endpoints } = useEndpoints();
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(
    () => new Set(endpoints.map((e) => e.id)),
  );
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<BenchmarkRun[]>(() => {
    return safeGetJSON<BenchmarkRun[]>(StorageKeys.BENCHMARK_HISTORY_CACHE, []);
  });

  const toggleEndpoint = useCallback((id: string) => {
    setSelectedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const runBenchmark = useCallback(async (prompt: string) => {
    setRunning(true);
    setResults([]);
    const selected = endpoints.filter((e) => selectedEndpoints.has(e.id));
    const newResults: BenchmarkResult[] = [];

    for (const endpoint of selected) {
      // Simulate benchmark — in production this would call GraphQL
      const startTime = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 2000));
      const totalTime = Date.now() - startTime;
      const tokens = Math.floor(50 + Math.random() * 200);

      const result: BenchmarkResult = {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        model: endpoint.model,
        prompt,
        response: `[Simulated response from ${endpoint.name}]`,
        tokensUsed: tokens,
        timeToFirstToken: Math.floor(totalTime * 0.2),
        totalTime,
        tokensPerSecond: Math.round((tokens / totalTime) * 1000 * 10) / 10,
        success: Math.random() > 0.1,
        error: Math.random() > 0.9 ? 'Connection timeout' : undefined,
      };
      newResults.push(result);
      setResults([...newResults]);
    }

    setRunning(false);
    return newResults;
  }, [endpoints, selectedEndpoints]);

  const saveRun = useCallback((prompt: string, runResults: BenchmarkResult[]) => {
    const run: BenchmarkRun = {
      id: `run_${Date.now()}`,
      timestamp: Date.now(),
      prompt,
      results: runResults,
      totalEndpoints: runResults.length,
      completedEndpoints: runResults.filter((r) => r.success).length,
    };
    const updated = [run, ...history].slice(0, 50);
    setHistory(updated);
    safeSetItem(StorageKeys.BENCHMARK_HISTORY_CACHE, JSON.stringify(updated));
    return run;
  }, [history]);

  const deleteRun = useCallback((runId: string) => {
    const updated = history.filter((r) => r.id !== runId);
    setHistory(updated);
    safeSetItem(StorageKeys.BENCHMARK_HISTORY_CACHE, JSON.stringify(updated));
  }, [history]);

  return {
    endpoints,
    selectedEndpoints,
    toggleEndpoint,
    results,
    running,
    runBenchmark,
    history,
    saveRun,
    deleteRun,
  };
}
