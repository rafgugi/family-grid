import { useState, useEffect, useDeferredValue } from 'react';

export function useCache<Type>(
  key: string,
  initialValue: Type
): [Type, (value: Type) => void] {
  key = `family-grid:${key}`;
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });
  const deferredValue = useDeferredValue(value);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(deferredValue));
  }, [key, deferredValue]);

  return [value, setValue];
}
