import { offlineStore } from './offlineStore';

export const syncEngine = {
  processQueue: async () => {
    const mutations = await offlineStore.getMutations();
    for (const mutation of mutations) {
      try {
        // Mock API call
        await new Promise(res => setTimeout(res, 500));
        await offlineStore.removeMutation(mutation.id);
      } catch (err) {
        mutation.retries += 1;
        if (mutation.retries < 5) {
          const all = await offlineStore.getMutations();
          const idx = all.findIndex(m => m.id === mutation.id);
          if (idx !== -1) {
            all[idx] = mutation;
            await offlineStore.clearMutations();
            for(let m of all) await offlineStore.addMutation(m);
          }
        }
      }
    }
  }
};
