import { useState, useEffect } from 'react';

export function useCache<Type>(
  key: string,
  initialValue: Type
): [Type, (value: Type) => void] {
  key = `family-grid:${key}`;
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
