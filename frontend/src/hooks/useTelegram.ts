import { useEffect, useState } from 'react';

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    try {
      // initWebApp()
      // If we are in Telegram env, we would initialize here. 
      // Using try catch to fallback for web
      setIsReady(true);
    } catch (e) {
      console.warn("Telegram WebApp not available", e);
      setIsReady(true);
    }
  }, []);

  const expand = () => {
    try {
      if ((window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.expand();
      }
    } catch(e) {}
  };

  const hapticFeedback = {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      try {
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
      } catch(e) {}
    },
    notificationOccurred: (type: 'error' | 'success' | 'warning') => {
      try {
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
      } catch(e) {}
    },
    selectionChanged: () => {
      try {
        (window as any).Telegram?.WebApp?.HapticFeedback?.selectionChanged();
      } catch(e) {}
    }
  };

  const webApp = (window as any).Telegram?.WebApp || null;

  return {
    isReady,
    webApp,
    user: webApp?.initDataUnsafe?.user || null,
    colorScheme: webApp?.colorScheme || 'light',
    initData: webApp?.initData || '',
    themeParams: webApp?.themeParams || {},
    expand,
    hapticFeedback
  };
}
