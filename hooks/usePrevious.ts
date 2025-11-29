import { useEffect, useRef } from 'react';

/**
 * Hook customizado para rastrear o valor anterior de uma variável
 * @param value - O valor atual a ser rastreado
 * @returns O valor anterior da variável
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
