import React from 'react';
import { Controls } from '../types';

interface MobileControlsProps {
  onControlsChange: (controls: Partial<Controls>) => void;
  controls: Controls;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onControlsChange, controls }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-10">
      {/* Movement controls */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        <button
          className="pointer-events-auto w-16 h-16 bg-blue-600/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl active:bg-blue-700 select-none border-2 border-blue-400 shadow-lg active:scale-95 transition-all duration-150"
          onTouchStart={() => onControlsChange({ left: true })}
          onTouchEnd={() => onControlsChange({ left: false })}
          onMouseDown={() => onControlsChange({ left: true })}
          onMouseUp={() => onControlsChange({ left: false })}
          onMouseLeave={() => onControlsChange({ left: false })}
        >
          ←
        </button>
        
        <button
          className="pointer-events-auto w-16 h-16 bg-blue-600/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl active:bg-blue-700 select-none border-2 border-blue-400 shadow-lg active:scale-95 transition-all duration-150"
          onTouchStart={() => onControlsChange({ right: true })}
          onTouchEnd={() => onControlsChange({ right: false })}
          onMouseDown={() => onControlsChange({ right: true })}
          onMouseUp={() => onControlsChange({ right: false })}
          onMouseLeave={() => onControlsChange({ right: false })}
        >
          →
        </button>
      </div>

      {/* Jump control */}
      <div className="absolute bottom-4 right-4">
        <button
          className={`pointer-events-auto w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg select-none transition-colors ${
            controls.charging 
              ? 'bg-green-600/90 active:bg-green-700 border-green-400 shadow-green-500/25' 
              : 'bg-orange-600/90 active:bg-orange-700 border-orange-400 shadow-orange-500/25'
          }`}
          onTouchStart={() => onControlsChange({ charging: true, spacePressed: true })}
          onTouchEnd={() => onControlsChange({ charging: false, spacePressed: false, spaceJustReleased: true })}
          onMouseDown={() => onControlsChange({ charging: true, spacePressed: true })}
          onMouseUp={() => onControlsChange({ charging: false, spacePressed: false, spaceJustReleased: true })}
          onMouseLeave={() => onControlsChange({ charging: false, spacePressed: false, spaceJustReleased: true })}
        >
          {controls.charging ? 'HOLD' : 'JUMP'}
        </button>
      </div>
    </div>
  );
};