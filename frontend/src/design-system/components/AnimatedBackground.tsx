import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-3xl animate-float1 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-3xl animate-float2 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-3xl animate-float3 mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
};
