'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const { data, error, isPending, refetch } = useQuery({
    queryKey: ['location-search', submittedQuery],
    queryFn: ({ signal }) =>
      searchLocations({
        query: submittedQuery ?? '',
        signal,
      }),
    enabled: submittedQuery !== null,
    retry: false,
    staleTime: Infinity,
    placeholderData: previousData => previousData,
  });

  function updateQuery(value: string) {
    setQuery(value);
  }

  async function search() {
    const queryValue = query.trim();

    if (queryValue.length < 2) {
      return;
    }

    if (queryValue === submittedQuery) {
      await refetch();
      return;
    }

    setSubmittedQuery(queryValue);
  }

  function resetSearch() {
    setQuery('');
    setSubmittedQuery(null);
  }

  let state: LocationSearchState;

  if (submittedQuery === null) {
    state = { status: 'idle' };
  } else if (isPending) {
    state = { status: 'searching' };
  } else if (error) {
    state = { status: 'error', error };
  } else if (data.length === 0) {
    state = { status: 'empty' };
  } else {
    state = { status: 'results', results: data };
  }

  return {
    query,
    state,
    updateQuery,
    search,
    resetSearch,
  };
}
