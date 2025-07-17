import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { MobileControls } from './components/MobileControls';
import { useGameLogic } from './hooks/useGameLogic';
import { useControls } from './hooks/useControls';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  
  const { gameState, controls, updateControls, restart } = useGameLogic();

  useControls({ onControlsChange: updateControls, controls });

  // Detect mobile and set canvas size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      
      if (mobile) {
        const maxWidth = Math.min(window.innerWidth - 32, 600);
        const aspectRatio = 800 / 600;
        setCanvasSize({
          width: maxWidth,
          height: maxWidth * aspectRatio
        });
      } else {
        setCanvasSize({ width: 600, height: 800 });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative">
        <GameCanvas
          gameState={gameState}
          controls={controls}
          onPlayerUpdate={() => {}} // Not needed with current architecture
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
        />
        
        <GameUI
          gameState={gameState}
          onRestart={restart}
          isMobile={isMobile}
        />
      </div>

      {isMobile && (
        <MobileControls
          onControlsChange={updateControls}
          controls={controls}
        />
      )}

      {/* Background pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-blue-900/20 to-purple-900/20"></div>
      </div>
    </div>
  );
}

export default App;