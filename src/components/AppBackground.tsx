import React, { useEffect, useState } from 'react';

// Configuration for randomness
const BLOB_COUNT = 8;
const COLORS = [
  'bg-red-600/10',
  'bg-orange-600/10', 
  'bg-indigo-600/10',
  'bg-rose-500/10',
  'bg-slate-700/10' // Neutral to add depth
];

interface BlobData {
  id: number;
  top: string;
  left: string;
  width: string;
  height: string;
  color: string;
  animationDelay: string;
  animationDuration: string;
}

export const AppBackground = () => {
  const [blobs, setBlobs] = useState<BlobData[]>([]);

  useEffect(() => {
    // Generate random blobs only on client-side mount
    const newBlobs = Array.from({ length: BLOB_COUNT }).map((_, i) => {
      // Randomize position (0-100%)
      const top = `${Math.floor(Math.random() * 100)}%`;
      const left = `${Math.floor(Math.random() * 100)}%`;
      
      // Randomize size (large organic shapes)
      const sizeBase = 20 + Math.random() * 30; // 20rem to 50rem
      const width = `${sizeBase}rem`;
      const height = `${sizeBase}rem`;
      
      // Randomize timing
      // Using prime numbers for duration helps prevent loops from syncing up
      const durationBase = 15 + Math.random() * 20; 
      const animationDuration = `${durationBase}s`;
      
      // Negative delay ensures they are already "mid-animation" when page loads
      const animationDelay = `-${Math.random() * 20}s`;

      return {
        id: i,
        top,
        left,
        width,
        height,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        animationDelay,
        animationDuration,
      };
    });
    setBlobs(newBlobs);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-950">
      {blobs.map((blob) => (
        <div
          key={blob.id}
          className={`absolute rounded-full blur-[80px] md:blur-[120px] animate-blob mix-blend-screen ${blob.color}`}
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.width,
            height: blob.height,
            animationDelay: blob.animationDelay,
            animationDuration: blob.animationDuration,
            // Center the blob on its coordinate
            transform: 'translate(-50%, -50%)', 
          }}
        />
      ))}
      
      {/* Subtle texture overlay to reduce banding artifacts */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"></div>
    </div>
  );
};
