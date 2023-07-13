import { useState, useEffect } from 'react';

// storeValue is localStorage.setItem but async
const storeValue = async (key: string, value: any) => {
  await new Promise(resolve => setTimeout(resolve, 0));
  localStorage.setItem(key, JSON.stringify(value));
  console.log(`data stored in "${key}" successfully`);
};

export function useLocalStorage(
  key: string,
  initialValue: any
): [any, (value: any) => void] {
  key = `family-grid:${key}`;
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    storeValue(key, value);
  }, [key, value]);

  return [value, setValue];
}
