import api, { uploadImage } from './api';

export const predictionService = {
  uploadImage,
  saveMeal: async (meal) => ({ success: true, meal }),
  fetchHistory: async () => ({ data: [] }),
  fetchAnalytics: async () => ({ data: {} }),
  fetchDashboardSummary: async () => ({ data: {} }),
  api,
};
