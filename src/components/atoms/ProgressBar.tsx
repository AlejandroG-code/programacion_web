import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number; // 0 to 100+
  colorClass?: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  colorClass = 'bg-blue-600',
  height = 'md',
  className = '',
  showLabel = false,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          <span>Progreso</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden', heights[height])}>
        <div
          className={clsx('h-full transition-all duration-500 rounded-full', colorClass)}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
