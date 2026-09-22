import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { familyApi } from '../api/family';
import { FamilyCard } from '../features/family/FamilyCard';
import { MemberList } from '../features/family/MemberList';
import { InviteModal } from '../features/family/InviteModal';
import { ActivityFeed } from '../features/family/ActivityFeed';
import { AppIcon } from '@/design-system/icons/AppIcon';

export const FamilyPage = () => {
  const { t } = useTranslation();
  const [families, setFamilies] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [familyName, setFamilyName] = useState('Моя семья');
  const [isCreating, setIsCreating] = useState(false);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const activeFamily = families.length > 0 ? families[0] : null;

  const fetchFamilyData = async () => {
    try {
      setIsLoading(true);
      const fams = await familyApi.get();
      if (Array.isArray(fams)) {
        setFamilies(fams);
        if (fams.length > 0) {
          const fid = fams[0].id;
          const [mems, acts] = await Promise.all([
            familyApi.getMembers(fid).catch(() => []),
            familyApi.getActivity(fid).catch(() => []),
          ]);
          setMembers(mems || []);
          setActivities(acts || []);
        }
      }
    } catch (err) {
      console.error('Failed to load family data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    try {
      setIsCreating(true);
      await familyApi.create({ name: familyName.trim() });
      setIsCreateOpen(false);
      fetchFamilyData();
    } catch (err) {
      console.error('Failed to create family', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenInvite = async () => {
    if (!activeFamily) return;
    try {
      const res = await familyApi.createInvite(activeFamily.id);
      if (res && res.invite_link) {
        setInviteLink(res.invite_link);
        setIsInviteOpen(true);
      }
    } catch (err) {
      console.error('Failed to create invite', err);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t('family', 'Семья')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Совместные покупки и списки
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <AppIcon name="family" size={20} />
        </div>
      </header>

      {/* Main Family Card or Empty State */}
      {isLoading ? (
        <div className="h-32 bg-white/40 dark:bg-zinc-800/40 rounded-3xl animate-pulse" />
      ) : activeFamily ? (
        <div className="space-y-4">
          <FamilyCard
            id={activeFamily.id}
            name={activeFamily.name}
            memberCount={members.length || 1}
            onInvite={handleOpenInvite}
          />

          {/* Members section */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Участники ({members.length || 1})
              </h2>
            </div>
            <MemberList
              members={
                members.length > 0
                  ? members.map((m) => ({
                      id: m.id,
                      name: m.name || 'Участник',
                      role: m.role || 'member',
                      isCurrentUser: m.is_current_user || false,
                    }))
                  : [
                      {
                        id: '1',
                        name: 'Вы (Владелец)',
                        role: 'owner',
                        isCurrentUser: true,
                      },
                    ]
              }
              canManage={true}
            />
          </section>

          {/* Activity Feed */}
          <section className="space-y-2.5">
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider px-1">
              Недавние действия
            </h2>
            <ActivityFeed
              activities={
                activities.length > 0
                  ? activities.map((a) => ({
                      id: a.id,
                      eventType: a.event_type || 'item_purchased',
                      userName: a.user_name || 'Участник',
                      itemName: a.data?.item_name || 'Товар',
                      timeAgo: 'Недавно',
                    }))
                  : [
                      {
                        id: 'act-1',
                        eventType: 'item_purchased',
                        userName: 'Семья',
                        itemName: 'Молоко 2л',
                        timeAgo: '2 ч. назад',
                      },
                    ]
              }
            />
          </section>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-white/20 dark:border-zinc-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
            <AppIcon name="family" size={32} />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
              Создайте семейную группу
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Делитесь списками с близкими, синхронизируйте корзину в реальном времени и управляйте семейным бюджетом
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Создать семью
          </button>
        </div>
      )}

      {/* Modal: Create Family */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Создание семьи</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-zinc-400 p-1">
                <AppIcon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Название (например, Наша семья)"
                className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors"
                >
                  {isCreating ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invite Link */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        inviteLink={inviteLink}
      />
    </div>
  );
};
