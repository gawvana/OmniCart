import React from 'react';
import { createRootRoute, createRoute, createRouter, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { AnimatedBackground, GlassTabBar, ToastContainer, AppIcon } from '@/design-system';

const RootComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { label: 'Home', path: '/', icon: <AppIcon name="home" size={20} /> },
    { label: 'Lists', path: '/lists', icon: <AppIcon name="lists" size={20} /> },
    { label: 'Shopping', path: '/shopping', icon: <AppIcon name="shopping" size={20} /> },
    { label: 'Analytics', path: '/analytics', icon: <AppIcon name="analytics" size={20} /> },
    { label: 'Profile', path: '/profile', icon: <AppIcon name="profile" size={20} /> },
  ];

  const activeIndex = tabs.findIndex(t => t.path === currentPath || (t.path === '/shopping' && currentPath.startsWith('/shopping')));
  const showTabs = ['/', '/shopping', '/lists', '/profile', '/analytics'].includes(currentPath) || currentPath.startsWith('/shopping/');

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
const shoppingListRoute = createRoute({ getParentRoute: () => rootRoute, path: '/shopping/$listId', component: React.lazy(() => import('@/pages/ShoppingPage').then(m => ({ default: m.ShoppingPage }))) });
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
  indexRoute, shoppingRoute, shoppingListRoute, listsRoute, analyticsRoute, profileRoute,
  historyRoute, familyRoute, settingsRoute, searchRoute, onboardingRoute,
  budgetRoute, recurringRoute
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
