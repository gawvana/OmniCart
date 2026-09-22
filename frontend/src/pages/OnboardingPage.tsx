import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { GlassCard, GlassButton, AppIcon } from '@/design-system';

interface Step {
  icon: 'sparkles' | 'family' | 'wallet' | 'cart';
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  badge: string;
}

const STEPS: Step[] = [
  {
    icon: 'sparkles',
    titleKey: 'onboarding.step1Title',
    defaultTitle: 'AI-Powered Lists',
    descKey: 'onboarding.step1Desc',
    defaultDesc: 'Dictate or paste any recipe or messy text. OmniCart AI instantly parses, categorizes, and estimates prices.',
    badge: 'Neural Assistant',
  },
  {
    icon: 'family',
    titleKey: 'onboarding.step2Title',
    defaultTitle: 'Family Real-Time Sync',
    descKey: 'onboarding.step2Desc',
    defaultDesc: 'Invite household members with instant invite links. Check off groceries together in real-time.',
    badge: 'Multi-User',
  },
  {
    icon: 'wallet',
    titleKey: 'onboarding.step3Title',
    defaultTitle: 'Budget & Smart Reorder',
    descKey: 'onboarding.step3Desc',
    defaultDesc: 'Set spending limits, get predictive reorder reminders, and stay on top of your shopping budget.',
    badge: 'Automated',
  },
];

export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('omnicart_onboarded', 'true');
      navigate({ to: '/' });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('omnicart_onboarded', 'true');
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
            <AppIcon name="cart" size={20} />
          </div>
          <span className="font-bold text-lg text-white">OmniCart AI</span>
        </div>
        {!isLast && (
          <button
            onClick={handleSkip}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-slate-300 hover:bg-white/15 transition-colors"
          >
            {t('common.skip', 'Skip')}
          </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="my-auto py-8">
        <GlassCard className="p-8 text-center flex flex-col items-center shadow-xl backdrop-blur-xl border-white/10">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-emerald-400/5 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-inner">
              <AppIcon name={step.icon} size={48} />
            </div>
            <span className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow">
              {step.badge}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            {t(step.titleKey, step.defaultTitle)}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
            {t(step.descKey, step.defaultDesc)}
          </p>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-8">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-emerald-400' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="pb-6 flex flex-col gap-3">
        <GlassButton variant="primary" size="lg" fullWidth onClick={handleNext}>
          {isLast ? t('onboarding.start', 'Get Started') : t('common.next', 'Continue')}
        </GlassButton>
      </div>
    </div>
  );
};
