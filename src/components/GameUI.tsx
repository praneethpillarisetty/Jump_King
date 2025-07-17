import React from 'react';
import { GameState } from '../types';
import { RotateCcw, Gamepad2, Crown, Timer, TrendingUp } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  onRestart: () => void;
  isMobile: boolean;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, onRestart, isMobile }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHeight = (height: number) => {
    return `${Math.max(0, Math.floor(height / 10))}m`;
  };

  return (
    <div className="absolute top-4 left-4 right-4 pointer-events-none">
      {/* Game Stats */}
      <div className="flex justify-between items-start">
        {/* Left side stats */}
        <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white font-mono text-sm border border-slate-600">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-400" />
              <span>Height: {formatHeight(gameState.currentHeight)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-yellow-400" />
              <span>Best: {formatHeight(gameState.maxHeight)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer size={14} className="text-green-400" />
              <span>Time: {formatTime(gameState.gameTime)}</span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="pointer-events-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-150 border border-red-500 shadow-lg hover:shadow-red-500/25"
          >
            <RotateCcw size={16} />
            Restart
          </button>
        </div>
      </div>

      {/* Instructions */}
      {!gameState.gameStarted && (
        <div className="mt-8 bg-black/95 backdrop-blur-sm rounded-lg p-6 text-white text-center max-w-md mx-auto border border-slate-600 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 size={24} className="text-blue-400" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Rage Platformer
            </h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <p className="text-yellow-400 font-semibold text-base">⚡ Hold to charge, release to jump!</p>
            
            {isMobile ? (
              <div>
                <p className="text-blue-300 font-semibold">📱 Mobile Controls:</p>
                <div className="text-left space-y-1 mt-2">
                  <p>• Touch left/right arrows to move</p>
                  <p>• Hold JUMP button to charge</p>
                  <p>• Release to launch!</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-blue-300 font-semibold">⌨️ Desktop Controls:</p>
                <div className="text-left space-y-1 mt-2">
                  <p>• <kbd className="bg-slate-700 px-1 rounded">A</kbd>/<kbd className="bg-slate-700 px-1 rounded">D</kbd> or <kbd className="bg-slate-700 px-1 rounded">←</kbd>/<kbd className="bg-slate-700 px-1 rounded">→</kbd> to move</p>
                  <p>• Hold <kbd className="bg-slate-700 px-1 rounded">SPACE</kbd> to charge jump</p>
                  <p>• Release <kbd className="bg-slate-700 px-1 rounded">SPACE</kbd> to launch!</p>
                </div>
              </div>
            )}
            
            <div className="border-t border-slate-600 pt-3 mt-4">
              <p className="text-red-400 font-semibold text-base">⚠️ WARNING ⚠️</p>
              <div className="space-y-1 mt-2">
                <p>Poor jumps make you fall down platforms!</p>
                <p className="text-red-300">Fall far enough and lose massive progress!</p>
                <p className="text-orange-300">Master the charge timing!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fall indicator */}
      {gameState.player.isFalling && gameState.player.fallDistance > 200 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-red-900/90 backdrop-blur-sm border border-red-500 rounded-lg p-4 text-center text-white">
            <h2 className="text-xl font-bold text-red-400">📉 FALLING!</h2>
            <p className="text-lg">-{Math.floor(gameState.player.fallDistance / 50)} blocks</p>
          </div>
        </div>
      )}
    </div>
  );
};