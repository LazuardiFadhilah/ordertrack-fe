'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useApiData(loader, deps = []) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    loaderRef.current()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (active) setState({ data: null, error, loading: false });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  return { ...state, reload };
}
