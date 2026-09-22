import React from 'react';
import { createRootRoute, createRoute, createRouter, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { AnimatedBackground, GlassTabBar, ToastContainer, AppIcon, GlassCard, GlassButton } from '@/design-system';
import { useTelegram } from '@/hooks/useTelegram';

const RootComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isTelegram } = useTelegram();
  const [bypassGate, setBypassGate] = React.useState(false);

  const tabs = [
    { label: 'Home', path: '/', icon: <AppIcon name="home" size={20} /> },
    { label: 'Lists', path: '/lists', icon: <AppIcon name="lists" size={20} /> },
    { label: 'Shopping', path: '/shopping', icon: <AppIcon name="shopping" size={20} /> },
    { label: 'Analytics', path: '/analytics', icon: <AppIcon name="analytics" size={20} /> },
    { label: 'Profile', path: '/profile', icon: <AppIcon name="profile" size={20} /> },
  ];

  const activeIndex = tabs.findIndex(t => t.path === currentPath || (t.path === '/shopping' && currentPath.startsWith('/shopping')));
  const showTabs = ['/', '/shopping', '/lists', '/profile', '/analytics'].includes(currentPath) || currentPath.startsWith('/shopping/');

  // Route guard: Prompt user to open via Telegram if accessed directly in normal browser
  if (!isTelegram && !bypassGate && !import.meta.env.DEV) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-white">
        <AnimatedBackground />
        <GlassCard className="max-w-md w-full p-6 text-center z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl mb-2">
            🛒
          </div>
          <h1 className="text-2xl font-bold tracking-tight">OmniCart AI 2.0</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            OmniCart is optimized as a Telegram Mini App with cloud sync, voice parsing, and family shopping features.
          </p>
          <a
            href="https://t.me/OmniCartV2_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <GlassButton variant="primary" className="w-full py-3">
              Open in Telegram
            </GlassButton>
          </a>
          <button
            onClick={() => setBypassGate(true)}
            className="text-xs text-slate-500 hover:text-slate-300 underline mt-2"
          >
            Continue in Web Preview
          </button>
        </GlassCard>
      </div>
    );
  }

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
