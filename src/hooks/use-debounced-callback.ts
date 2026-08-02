"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable callback that fires `delay` ms after the last invocation.
 * The pending timer is cleared on unmount so a late fire can't touch a gone tree.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(() => () => clearTimeout(timeout.current), []);

  return useCallback(
    (...args: Args) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay],
  );
}
