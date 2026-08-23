'use client';

import { useEffect, useRef, useState } from 'react';
import { searchLocations } from '../api/searchLocations';
import type { LocationSearchResult } from '../types';

export type LocationSearchState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'results'; results: LocationSearchResult[] }
  | { status: 'empty' }
  | { status: 'error'; error: Error };

export function useLocationSearch() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<LocationSearchState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  function updateQuery(value: string) {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setQuery(value);
    setState({ status: 'idle' });
  }

  async function search() {
    const queryValue = query.trim();

    if (queryValue.length < 2) {
      return;
    }

    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'searching' });

    try {
      const results = await searchLocations({
        query: queryValue,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setState(results.length > 0 ? { status: 'results', results } : { status: 'empty' });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error('Failed to search for locations'),
        });
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }

  function resetSearch() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setQuery('');
    setState({ status: 'idle' });
  }

  useEffect(() => () => controllerRef.current?.abort(), []);

  return {
    query,
    state,
    updateQuery,
    search,
    resetSearch,
  };
}
