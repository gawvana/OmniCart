import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-[#090a0d]">
      {/* Deep atmospheric radial gradient */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.06), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(22, 28, 38, 0.7), transparent 60%)',
        }}
      />

      {/* Subtle slow-drifting emerald highlight */}
      <div
        className="absolute -top-[15%] left-[20%] w-[60vw] h-[40vh] rounded-full blur-[120px] pointer-events-none opacity-40 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          animationDuration: '10s',
        }}
      />

      {/* Subtle dark graphite depth cushion at bottom */}
      <div
        className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[40vh] rounded-full blur-[100px] pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(30, 38, 52, 0.4) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
