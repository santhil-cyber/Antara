'use client';
import React from 'react';
import dynamic from 'next/dynamic';

import ICON from '../assets/liveicon.json';

const Player = dynamic(
  () => import('@lordicon/react').then((mod) => mod.Player),
  { ssr: false }
);

function LiveTitle() {
  const playerRef = React.useRef<any>(null);
  React.useEffect(() => {
    playerRef.current?.playFromBeginning();
  }, []);
  return (
    <div className="flex items-center gap-3">
      <h1 className="font-bold text-xl tracking-wide">Live Updates</h1>
      <div className="mt-2">
        <Player
          ref={playerRef}
          icon={ICON}
          onComplete={() => playerRef.current?.playFromBeginning()}
        />
      </div>
    </div>
  );
}

export default LiveTitle;
