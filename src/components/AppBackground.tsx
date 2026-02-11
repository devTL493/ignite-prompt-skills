import React from 'react';

export const AppBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-950">
      {/* Primary Red Blob - Top Left */}
      <div 
        className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-red-600/20 rounded-full blur-[100px] animate-blob" 
      />
      
      {/* Secondary Orange Blob - Top Right (Delayed) */}
      <div 
        className="absolute top-40 right-0 w-[30rem] h-[30rem] bg-orange-600/10 rounded-full blur-[80px] animate-blob" 
        style={{ animationDelay: "2s", animationDuration: "12s" }} 
      />
      
      {/* Tertiary Purple/Blue Blob - Bottom Center (Delayed) */}
      <div 
        className="absolute -bottom-40 left-1/3 w-[45rem] h-[45rem] bg-indigo-600/10 rounded-full blur-[120px] animate-blob" 
        style={{ animationDelay: "5s", animationDuration: "15s" }} 
      />
      
      {/* Optional: Subtle grid overlay for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-20" />
    </div>
  );
};
