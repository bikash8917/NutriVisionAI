import { createContext, useContext, useMemo, useState } from 'react';

const PredictionContext = createContext(null);

export function PredictionProvider({ children }) {
  const [state, setState] = useState({
    image: null,
    preview: '',
    loading: false,
    prediction: null,
    quantity: 100,
    nutrition: {},
    error: '',
  });

  const value = useMemo(
    () => ({
      state,
      setState,
    }),
    [state],
  );

  return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>;
}

export function usePredictionContext() {
  const context = useContext(PredictionContext);
  if (!context) throw new Error('usePredictionContext must be used within PredictionProvider');
  return context;
}
