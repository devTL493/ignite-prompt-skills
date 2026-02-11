import React, { useEffect, useState } from 'react';

// Layer 1: The "Atmosphere" (Large, slow, blurry background clouds)
const ATMOSPHERE_COUNT = 5;
const ATMOSPHERE_COLORS = [
  'bg-red-600/10',
  'bg-orange-600/10', 
  'bg-indigo-900/20', // Darker depth
];

// Layer 2: The "Fireflies" (Tiny, sharp, fast moving sparks/lights)
const FIREFLY_COUNT = 50; // "Many many more"
const FIREFLY_COLORS = [
  'bg-orange-400', // Bright center
  'bg-amber-200',  // Light glow
  'bg-red-500',    // Ember
  'bg-white',      // Hot spark
];

interface ParticleData {
  id: number;
  top: string;
  left: string;
  width: string;
  height: string;
  color: string;
  animationName: string; // 'animate-blob' or 'animate-firefly'
  animationDelay: string;
  animationDuration: string;
  blur: string;
  opacity: string;
}

export const AppBackground = () => {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    const newParticles: ParticleData[] = [];

    // 1. Generate Atmosphere (Background)
    for (let i = 0; i < ATMOSPHERE_COUNT; i++) {
      newParticles.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${30 + Math.random() * 40}rem`, // Huge: 30-70rem
        height: `${30 + Math.random() * 40}rem`,
        color: ATMOSPHERE_COLORS[Math.floor(Math.random() * ATMOSPHERE_COLORS.length)],
        animationName: 'animate-blob',
        animationDelay: `-${Math.random() * 20}s`, // Start mid-cycle
        animationDuration: `${25 + Math.random() * 20}s`, // Slow: 25-45s
        blur: 'blur-[100px] md:blur-[150px]',
        opacity: 'opacity-100' // Base opacity controlled by color/animation
      });
    }

    // 2. Generate Fireflies (Foreground)
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      newParticles.push({
        id: i + ATMOSPHERE_COUNT, // Offset IDs
        top: `${Math.random() * 120}%`, // Can start slightly below screen
        left: `${Math.random() * 100}%`,
        width: `${0.2 + Math.random() * 0.4}rem`, // Tiny: 0.2-0.6rem
        height: `${0.2 + Math.random() * 0.4}rem`,
        color: FIREFLY_COLORS[Math.floor(Math.random() * FIREFLY_COLORS.length)],
        animationName: 'animate-firefly',
        animationDelay: `-${Math.random() * 10}s`,
        animationDuration: `${5 + Math.random() * 10}s`, // Faster: 5-15s
        blur: 'blur-[1px] md:blur-[2px]', // Sharp but slightly glowing
        opacity: 'opacity-80'
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-950">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full mix-blend-screen ${p.color} ${p.animationName} ${p.blur} ${p.opacity}`}
          style={{
            top: p.top,
            left: p.left,
            width: p.width,
            height: p.height,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
            transform: 'translate(-50%, -50%)', 
          }}
        />
      ))}
      
      {/* Texture Overlay remains for film-grain look */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"></div>
    </div>
  );
};
