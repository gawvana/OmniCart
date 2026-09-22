import { create } from 'zustand';

interface AppState {
  isOnline: boolean;
  isOnboarded: boolean;
  setOnline: (status: boolean) => void;
  setOnboarded: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  isOnboarded: localStorage.getItem('onboarded') === 'true',
  setOnline: (status) => set({ isOnline: status }),
  setOnboarded: (status) => {
    localStorage.setItem('onboarded', status ? 'true' : 'false');
    set({ isOnboarded: status });
  }
}));

window.addEventListener('online', () => useAppStore.getState().setOnline(true));
window.addEventListener('offline', () => useAppStore.getState().setOnline(false));
