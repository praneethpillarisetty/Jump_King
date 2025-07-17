import { useEffect, useCallback, useRef } from 'react';
import { Controls } from '../types';

interface UseControlsProps {
  onControlsChange: (controls: Partial<Controls>) => void;
  controls: Controls;
}

export function useControls({ onControlsChange, controls }: UseControlsProps) {
  const spaceKeyRef = useRef<boolean>(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        event.preventDefault();
        onControlsChange({ left: true });
        break;
      case 'ArrowRight':
      case 'KeyD':
        event.preventDefault();
        onControlsChange({ right: true });
        break;
      case 'Space':
        event.preventDefault();
        if (!spaceKeyRef.current) {
          spaceKeyRef.current = true;
          onControlsChange({ 
            spacePressed: true, 
            spaceJustReleased: false 
          });
        }
        break;
    }
  }, [onControlsChange]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        event.preventDefault();
        onControlsChange({ left: false });
        break;
      case 'ArrowRight':
      case 'KeyD':
        event.preventDefault();
        onControlsChange({ right: false });
        break;
      case 'Space':
        event.preventDefault();
        if (spaceKeyRef.current) {
          spaceKeyRef.current = false;
          onControlsChange({ 
            spacePressed: false, 
            spaceJustReleased: true 
          });
        }
        break;
    }
  }, [onControlsChange]);

  // Reset spaceJustReleased after one frame
  useEffect(() => {
    if (controls.spaceJustReleased) {
      const timeout = setTimeout(() => {
        onControlsChange({ spaceJustReleased: false });
      }, 16); // One frame at 60fps
      return () => clearTimeout(timeout);
    }
  }, [controls.spaceJustReleased, onControlsChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Prevent context menu on long press (mobile)
  useEffect(() => {
    const preventContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);
}