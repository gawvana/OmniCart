import { apiClient } from './client';
export const aiApi = {
  parseItems: (text: string) => apiClient<any>('/ai/parse', { method: 'POST', body: { text } }),
  createPlan: (data: { people: number; budget?: number; days?: number; preferences?: string }) => apiClient<any>('/ai/plan', { method: 'POST', body: data }),
  budgetSuggestions: (data: { items: any[]; budget: number; currency: string }) => apiClient<any>('/ai/budget-suggestions', { method: 'POST', body: data }),
  insights: (data: any) => apiClient<any>('/ai/insights', { method: 'POST', body: data }),
};
