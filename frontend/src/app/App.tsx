import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { AnimatedBackground, GlassTabBar, ToastContainer } from '@/design-system';
import { useTelegram } from '@/hooks/useTelegram';
import { useRouter } from '@tanstack/react-router';

// We need a wrapper to consume router inside for TabBar
function MainLayout() {
  const router = useRouter();
  // Simple check for active tab based on current path
  const currentPath = router.state.location.pathname;
  
  const tabs = [
    { label: 'Home', path: '/', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    { label: 'Shopping', path: '/shopping', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg> },
    { label: 'Analytics', path: '/analytics', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
    { label: 'Profile', path: '/profile', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
  ];

  const activeIndex = tabs.findIndex(t => t.path === currentPath);

  return (
    <>
      <AnimatedBackground />
      <div className="flex-1 w-full pb-20">
        <RouterProvider router={router} />
      </div>
      {activeIndex !== -1 && (
        <GlassTabBar
          items={tabs}
          activeIndex={activeIndex}
          onTabClick={(_i, path) => router.navigate({ to: path })}
        />
      )}
      <ToastContainer />
    </>
  );
}

export function App() {
  useTelegram(); // Init
  return <RouterProvider router={router} />; // We'll actually render TabBar inside the root route in router.tsx to get context
}
