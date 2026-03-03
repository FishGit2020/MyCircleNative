import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CHECK_USCIS_STATUS,
  safeGetJSON,
  safeSetItem,
  StorageKeys,
  eventBus,
  AppEvents,
} from '@mycircle/shared';
import type { ImmigrationCase, FormType, CaseStatus } from '@mycircle/shared';

export function useImmigrationCases() {
  const [cases, setCases] = useState<ImmigrationCase[]>(() => {
    return safeGetJSON<ImmigrationCase[]>(StorageKeys.IMMIGRATION_CASES_CACHE) ?? [];
  });
  const [loading, setLoading] = useState(false);

  // Persist to storage whenever cases change
  useEffect(() => {
    safeSetItem(StorageKeys.IMMIGRATION_CASES_CACHE, JSON.stringify(cases));
  }, [cases]);

  // Listen for external changes
  useEffect(() => {
    return eventBus.subscribe(AppEvents.IMMIGRATION_CASES_CHANGED, () => {
      const fresh = safeGetJSON<ImmigrationCase[]>(StorageKeys.IMMIGRATION_CASES_CACHE) ?? [];
      setCases(fresh);
    });
  }, []);

  const addCase = useCallback((receiptNumber: string, formType: FormType, nickname: string) => {
    const newCase: ImmigrationCase = {
      id: `case_${Date.now()}`,
      receiptNumber: receiptNumber.toUpperCase().trim(),
      formType,
      nickname,
      status: 'Case Was Received',
      lastChecked: 0,
      lastUpdated: Date.now(),
      statusHistory: [],
      createdAt: Date.now(),
    };
    setCases((prev) => [...prev, newCase]);
    eventBus.publish(AppEvents.IMMIGRATION_CASES_CHANGED);
    return newCase;
  }, []);

  const removeCase = useCallback((caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    eventBus.publish(AppEvents.IMMIGRATION_CASES_CHANGED);
  }, []);

  const refreshCase = useCallback(async (caseId: string) => {
    setLoading(true);
    try {
      // In a real app, this would call the USCIS API via GraphQL
      // For now, update the lastChecked timestamp
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, lastChecked: Date.now() }
            : c,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { cases, loading, addCase, removeCase, refreshCase };
}
