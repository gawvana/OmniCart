import React from 'react';
import { createRootRoute, createRoute, createRouter, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { AnimatedBackground, GlassTabBar, ToastContainer } from '@/design-system';

const RootComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { label: 'Home', path: '/', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    { label: 'Shopping', path: '/shopping', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg> },
    { label: 'Lists', path: '/lists', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
    { label: 'Profile', path: '/profile', icon: <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
  ];

  const activeIndex = tabs.findIndex(t => t.path === currentPath);
  const showTabs = ['/', '/shopping', '/lists', '/profile', '/analytics'].includes(currentPath);

  return (
    <>
      <AnimatedBackground />
      <div className={`flex-1 w-full ${showTabs ? 'pb-20' : ''}`}>
        <Outlet />
      </div>
      {showTabs && (
        <GlassTabBar
          items={tabs}
          activeIndex={activeIndex !== -1 ? activeIndex : 0}
          onTabClick={(_i, path) => navigate({ to: path })}
        />
      )}
      <ToastContainer />
    </>
  );
};

const rootRoute = createRootRoute({
  component: RootComponent
});

// Lazy loaded routes
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: React.lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage }))) });
const shoppingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/shopping', component: React.lazy(() => import('@/pages/ShoppingPage').then(m => ({ default: m.ShoppingPage }))) });
const listsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/lists', component: React.lazy(() => import('@/pages/ListsPage').then(m => ({ default: m.ListsPage }))) });
const analyticsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/analytics', component: React.lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage }))) });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: React.lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage }))) });
const historyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/history', component: React.lazy(() => import('@/pages/HistoryPage').then(m => ({ default: m.HistoryPage }))) });
const familyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/family', component: React.lazy(() => import('@/pages/FamilyPage').then(m => ({ default: m.FamilyPage }))) });
const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/settings', component: React.lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage }))) });
const searchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/search', component: React.lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage }))) });
const onboardingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/onboarding', component: React.lazy(() => import('@/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage }))) });
const budgetRoute = createRoute({ getParentRoute: () => rootRoute, path: '/budget', component: React.lazy(() => import('@/pages/BudgetPage').then(m => ({ default: m.BudgetPage }))) });
const recurringRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recurring', component: React.lazy(() => import('@/pages/RecurringPage').then(m => ({ default: m.RecurringPage }))) });

const routeTree = rootRoute.addChildren([
  indexRoute, shoppingRoute, listsRoute, analyticsRoute, profileRoute,
  historyRoute, familyRoute, settingsRoute, searchRoute, onboardingRoute,
  budgetRoute, recurringRoute
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
