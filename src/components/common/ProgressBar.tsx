import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'small' | 'medium' | 'large';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  message = '正在加载...',
  showPercentage = true,
  animated = true,
  color = 'blue',
  size = 'medium'
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  const containerSizeClasses = {
    small: 'w-32',
    medium: 'w-48',
    large: 'w-64'
  };

  // 确保进度值在0-100之间
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className={`${containerSizeClasses[size]} mb-3`}>
        <div className="w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`${colorClasses[color]} ${sizeClasses[size]} transition-all duration-300 ease-out ${
              animated ? 'animate-pulse' : ''
            }`}
            style={{ width: `${safeProgress}%` }}
            role="progressbar"
            aria-valuenow={safeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={message}
          />
        </div>
      </div>
      
      <div className="text-center">
        {showPercentage && (
          <div className="text-lg font-semibold text-gray-700 mb-1">
            {safeProgress}%
          </div>
        )}
        {message && (
          <p className="text-sm text-gray-600 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// 模拟进度的Hook
export const useSimulatedProgress = (duration: number = 3000, onComplete?: () => void) => {
  const [progress, setProgress] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);

  React.useEffect(() => {
    if (!isRunning) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 100);
      
      // 使用缓动函数让进度看起来更自然
      const easedProgress = easeOutCubic(rawProgress / 100) * 100;
      setProgress(easedProgress);

      if (rawProgress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, duration, onComplete]);

  const start = React.useCallback(() => {
    setProgress(0);
    setIsRunning(true);
  }, []);

  const stop = React.useCallback(() => {
    setIsRunning(false);
  }, []);

  return { progress, isRunning, start, stop };
};

// 缓动函数
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export default ProgressBar;