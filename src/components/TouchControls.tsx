import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { Direction } from '../types/game';

interface TouchControlsProps {
  disabled: boolean;
  onDirection: (dir: Direction) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  disabled,
  onDirection,
}) => {
  const buttonClass =
    'w-14 h-12 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-800 shadow-xs active:bg-emerald-50 active:border-emerald-500 active:text-emerald-700 disabled:opacity-45 disabled:pointer-events-none transition-colors touch-manipulation cursor-pointer';

  return (
    <div
      className="flex flex-col items-center gap-2 select-none lg:hidden"
      aria-label="Controles direcionais por toque"
    >
      <button
        type="button"
        disabled={disabled}
        onPointerDown={(e) => {
          e.preventDefault();
          onDirection('UP');
        }}
        aria-label="Mover para cima"
        className={buttonClass}
      >
        <ArrowUp className="w-5 h-5" aria-hidden="true" />
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault();
            onDirection('LEFT');
          }}
          aria-label="Mover para a esquerda"
          className={buttonClass}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault();
            onDirection('DOWN');
          }}
          aria-label="Mover para baixo"
          className={buttonClass}
        >
          <ArrowDown className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault();
            onDirection('RIGHT');
          }}
          aria-label="Mover para a direita"
          className={buttonClass}
        >
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
