import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { familyApi } from '../api/family';
import { FamilyCard } from '../features/family/FamilyCard';
import { MemberList } from '../features/family/MemberList';
import { InviteModal } from '../features/family/InviteModal';
import { ActivityFeed } from '../features/family/ActivityFeed';
import { AppIcon } from '@/design-system/icons/AppIcon';
import { LiquidModal } from '@/design-system/components/GlassModal';
import { GlassInput } from '@/design-system/components/GlassInput';
import { PrimaryButton, SecondaryButton } from '@/design-system/components/GlassButton';
import { GlassSkeleton } from '@/design-system/components/GlassSkeleton';

export const FamilyPage: React.FC = () => {
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
    <div className="p-4 space-y-5 max-w-md mx-auto min-h-screen pb-28">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('family', 'Семья')}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Совместный список и участники
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
          <AppIcon name="family" size={16} />
        </div>
      </header>

      {/* Main Family Card or Empty State */}
      {isLoading ? (
        <GlassSkeleton variant="card" height={100} />
      ) : activeFamily ? (
        <FamilyCard
          id={activeFamily.id}
          name={activeFamily.name}
          memberCount={members.length || 1}
          onInvite={handleOpenInvite}
        />
      ) : (
        <div className="p-6 rounded-3xl liquid-glass-subtle border border-white/[0.06] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <AppIcon name="family" size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Семья ещё не создана</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Создайте семейную группу, чтобы синхронизировать списки покупок с близкими
            </p>
          </div>
          <PrimaryButton size="sm" onClick={() => setIsCreateOpen(true)}>
            Создать семью
          </PrimaryButton>
        </div>
      )}

      {/* Members Section */}
      {activeFamily && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Участники ({members.length})
            </h2>
            <button
              type="button"
              onClick={handleOpenInvite}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
            >
              + Пригласить
            </button>
          </div>
          <MemberList
            members={
              members.length > 0
                ? members.map((m: any) => ({
                    id: m.id || m.user_id,
                    name: m.first_name || m.name || 'Участник',
                    role: m.role || 'member',
                    isCurrentUser: m.is_current,
                  }))
                : [
                    {
                      id: '1',
                      name: 'Вы',
                      role: 'owner',
                      isCurrentUser: true,
                    },
                  ]
            }
          />
        </section>
      )}

      {/* Activity Feed Section */}
      {activeFamily && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-0.5">
            Лента активности
          </h2>
          <ActivityFeed
            activities={
              activities.length > 0
                ? activities.map((a: any) => ({
                    id: a.id,
                    eventType: a.action || 'item_added',
                    userName: a.details?.user_name || 'Участник',
                    itemName: a.details?.item_name || '',
                    timeAgo: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'недавно',
                  }))
                : [
                    {
                      id: 'default-act',
                      eventType: 'member_joined',
                      userName: 'Вы',
                      timeAgo: 'Только что',
                    },
                  ]
            }
          />
        </section>
      )}

      {/* Modal: Create Family */}
      <LiquidModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Создать семейную группу"
        size="sm"
      >
        <form onSubmit={handleCreateFamily} className="space-y-4">
          <GlassInput
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Название (например, Семья Ивановых)"
            autoFocus
          />
          <div className="flex gap-2">
            <SecondaryButton fullWidth onClick={() => setIsCreateOpen(false)}>
              Отмена
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isCreating || !familyName.trim()}
              loading={isCreating}
              fullWidth
            >
              Создать
            </PrimaryButton>
          </div>
        </form>
      </LiquidModal>

      {/* Modal: Invite */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        inviteLink={inviteLink}
      />
    </div>
  );
};
