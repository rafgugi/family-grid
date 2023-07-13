import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear(); // Clear local storage before each test
  });

  it('should return initialValue and update value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    // Initial state and value in local storage
    expect(result.current[0]).toBe('initialValue');
    expect(localStorage.getItem('family-grid:testKey')).toBe('"initialValue"');

    // Update value
    act(() => {
      result.current[1]('newValue');
    });

    // Updated state and value in local storage
    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('family-grid:testKey')).toBe('"newValue"');
  });
});
