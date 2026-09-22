import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { profileApi } from '../api/profile';
import { ProfileCard } from '../features/profile/ProfileCard';
import { AppIcon, AppIconName } from '@/design-system/icons/AppIcon';

export interface ProfilePageProps {
  onNavigate?: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const res = await profileApi.get();
        if (res) {
          setProfileData(res);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const menuItems: Array<{
    id: string;
    label: string;
    icon: AppIconName;
    color: string;
  }> = [
    { id: 'budget', label: 'Бюджет и лимиты', icon: 'wallet', color: 'text-blue-600 bg-blue-500/10' },
    { id: 'analytics', label: 'Аналитика трат', icon: 'chart', color: 'text-indigo-600 bg-indigo-500/10' },
    { id: 'family', label: 'Семья и доступ', icon: 'family', color: 'text-purple-600 bg-purple-500/10' },
    { id: 'recurring', label: 'Умный повтор', icon: 'repeat', color: 'text-emerald-600 bg-emerald-500/10' },
    { id: 'history', label: 'История покупок', icon: 'clock', color: 'text-amber-600 bg-amber-500/10' },
    { id: 'settings', label: 'Настройки', icon: 'gear', color: 'text-zinc-600 bg-zinc-500/10' },
  ];

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t('profile', 'Профиль')}
        </h1>
      </header>

      {/* Profile Card */}
      {isLoading ? (
        <div className="h-44 bg-white/40 dark:bg-zinc-800/40 rounded-3xl animate-pulse" />
      ) : (
        <ProfileCard
          name={
            profileData?.user?.first_name
              ? `${profileData.user.first_name} ${profileData.user.last_name || ''}`.trim()
              : 'Пользователь OmniCart'
          }
          username={profileData?.user?.username}
          telegramId={profileData?.user?.telegram_id}
          listsCount={profileData?.stats?.lists_count || 0}
          purchasesCount={profileData?.stats?.purchases_count || 0}
        />
      )}

      {/* Navigation Sections */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          Разделы
        </h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-1 shadow-sm">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 rounded-2xl transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}>
                  <AppIcon name={item.icon} size={16} />
                </div>
                <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                  {item.label}
                </span>
              </div>
              <div className="text-zinc-400">
                <AppIcon name="chevron-right" size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
