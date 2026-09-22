import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useTelegram } from '@/hooks/useTelegram';
import { profileApi } from '../api/profile';
import { ProfileCard } from '../features/profile/ProfileCard';
import { AppIcon, AppIconName } from '@/design-system/icons/AppIcon';
import { LiquidCard } from '@/design-system/components/GlassCard';

export interface ProfilePageProps {
  onNavigate?: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: tgUser } = useTelegram();
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
  }> = [
    { id: 'budget', label: 'Бюджет и лимиты', icon: 'wallet' },
    { id: 'analytics', label: 'Аналитика трат', icon: 'chart' },
    { id: 'family', label: 'Семья и доступ', icon: 'family' },
    { id: 'recurring', label: 'Умный повтор', icon: 'recurring' },
    { id: 'history', label: 'История покупок', icon: 'history' },
    { id: 'settings', label: 'Настройки', icon: 'settings' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="pt-2">
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t('profile', 'Профиль')}
        </h1>
      </header>

      {/* Profile Card */}
      {isLoading ? (
        <div className="h-44 bg-white/[0.04] rounded-2xl animate-pulse" />
      ) : (
        <ProfileCard
          name={
            tgUser?.first_name
              ? `${tgUser.first_name} ${tgUser.last_name || ''}`.trim()
              : (profileData?.user?.first_name
                  ? `${profileData.user.first_name} ${profileData.user.last_name || ''}`.trim()
                  : (tgUser?.username || profileData?.user?.username || 'Пользователь'))
          }
          username={tgUser?.username || profileData?.user?.username}
          telegramId={tgUser?.id || profileData?.user?.telegram_id || profileData?.user?.telegram_user_id}
          listsCount={profileData?.stats?.lists_count || 0}
          purchasesCount={profileData?.stats?.purchases_count || 0}
        />
      )}

      {/* Navigation Sections */}
      <div className="space-y-2 pt-1">
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Разделы
        </h2>
        <LiquidCard variant="subtle" padding="none" className="divide-y divide-white/[0.06] overflow-hidden">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (onNavigate) {
                  onNavigate(item.id);
                } else {
                  navigate({ to: `/${item.id}` as any });
                }
              }}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 flex items-center justify-center">
                  <AppIcon name={item.icon} size={16} />
                </div>
                <span className="font-medium text-xs text-white">
                  {item.label}
                </span>
              </div>
              <div className="text-slate-500">
                <AppIcon name="chevron-right" size={15} />
              </div>
            </div>
          ))}
        </LiquidCard>
      </div>
    </div>
  );
};
