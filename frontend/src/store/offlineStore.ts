import { get, set, del, keys } from 'idb-keyval';
import { ShoppingItem } from '../types';

export interface OfflineMutation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
}

export const offlineStore = {
  saveItems: async (items: ShoppingItem[]) => set('items', items),
  getItems: async (): Promise<ShoppingItem[]> => (await get('items')) || [],
  addMutation: async (mutation: OfflineMutation) => {
    const mutations = await offlineStore.getMutations();
    mutations.push(mutation);
    await set('mutations', mutations);
  },
  getMutations: async (): Promise<OfflineMutation[]> => (await get('mutations')) || [],
  removeMutation: async (id: string) => {
    const mutations = await offlineStore.getMutations();
    await set('mutations', mutations.filter(m => m.id !== id));
  },
  clearMutations: async () => del('mutations'),
};
