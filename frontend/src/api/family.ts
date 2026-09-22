import { apiClient } from './client';

export const familyApi = {
  get: () => apiClient<any>('/family/'),
  create: (data: { name: string }) => apiClient<any>('/family/', { method: 'POST', body: data }),
  createInvite: (familyId: string) => apiClient<any>(`/family/${familyId}/invites`, { method: 'POST' }),
  join: (token: string) => apiClient<any>('/family/join', { method: 'POST', body: { token } }),
  getMembers: (familyId: string) => apiClient<any>(`/family/${familyId}/members`),
  removeMember: (familyId: string, memberId: string) => apiClient<any>(`/family/${familyId}/members/${memberId}`, { method: 'DELETE' }),
  getActivity: (familyId: string) => apiClient<any>(`/family/${familyId}/activity`),
};
