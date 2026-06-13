import { useState, useCallback } from 'react';

export default function useRefactor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refactorCode = useCallback(async (code, language, maxLoops) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, max_loops: maxLoops }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit refactoring request.');
      }

      const data = await response.json();
      return data.session_id;
    } catch (err) {
      console.error('Refactor request error:', err);
      setError(err.message || 'Network error.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    refactorCode,
    loading,
    error
  };
}
