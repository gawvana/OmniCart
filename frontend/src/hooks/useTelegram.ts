import { useEffect, useState, useCallback } from 'react';

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  const getWebApp = () => {
    if (typeof window !== 'undefined') {
      return (window as any).Telegram?.WebApp || null;
    }
    return null;
  };

  const webApp = getWebApp();
  const isTelegram = Boolean(webApp && (webApp.initData?.length > 0 || webApp.initDataUnsafe?.user));

  useEffect(() => {
    try {
      if (webApp) {
        webApp.ready();
        webApp.expand();
        if (webApp.colorScheme) {
          setColorScheme(webApp.colorScheme);
        }
        const onThemeChange = () => {
          if (webApp.colorScheme) {
            setColorScheme(webApp.colorScheme);
          }
        };
        webApp.onEvent?.('themeChanged', onThemeChange);
        return () => {
          webApp.offEvent?.('themeChanged', onThemeChange);
        };
      }
    } catch (e) {
      console.warn("Telegram WebApp initialization notice:", e);
    } finally {
      setIsReady(true);
    }
  }, [webApp]);

  const expand = useCallback(() => {
    try {
      webApp?.expand?.();
    } catch (e) {}
  }, [webApp]);

  const close = useCallback(() => {
    try {
      webApp?.close?.();
    } catch (e) {}
  }, [webApp]);

  const showBackButton = useCallback((onClick: () => void) => {
    try {
      if (webApp?.BackButton) {
        webApp.BackButton.show();
        webApp.BackButton.onClick(onClick);
      }
    } catch (e) {}
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    try {
      webApp?.BackButton?.hide?.();
    } catch (e) {}
  }, [webApp]);

  const showMainButton = useCallback((text: string, onClick: () => void, color?: string) => {
    try {
      if (webApp?.MainButton) {
        webApp.MainButton.setText(text);
        if (color) webApp.MainButton.setParams({ color });
        webApp.MainButton.show();
        webApp.MainButton.onClick(onClick);
      }
    } catch (e) {}
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    try {
      webApp?.MainButton?.hide?.();
    } catch (e) {}
  }, [webApp]);

  const hapticFeedback = {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      try {
        webApp?.HapticFeedback?.impactOccurred?.(style);
      } catch (e) {}
    },
    notificationOccurred: (type: 'error' | 'success' | 'warning') => {
      try {
        webApp?.HapticFeedback?.notificationOccurred?.(type);
      } catch (e) {}
    },
    selectionChanged: () => {
      try {
        webApp?.HapticFeedback?.selectionChanged?.();
      } catch (e) {}
    }
  };

  return {
    isReady,
    isTelegram,
    webApp,
    user: webApp?.initDataUnsafe?.user || null,
    colorScheme,
    initData: webApp?.initData || '',
    themeParams: webApp?.themeParams || {},
    expand,
    close,
    showBackButton,
    hideBackButton,
    showMainButton,
    hideMainButton,
    hapticFeedback
  };
}
