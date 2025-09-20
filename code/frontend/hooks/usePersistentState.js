import { useEffect, useState } from 'react';

export default function usePersistentState(key, initialValue) {
  // Read once (and be safe if localStorage/JSON fails)
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch (e) {
      // localStorage may be unavailable (e.g., Safari private mode) or JSON may fail
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      // ignore write errors; keep UI functional without persistence
      void 0; // <-- non-empty statement to satisfy eslint(no-empty)
    }
  }, [key, state]);

  return [state, setState];
}
