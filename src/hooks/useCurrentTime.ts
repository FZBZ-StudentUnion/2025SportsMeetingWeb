import { useState, useEffect } from 'react';
import { formatTime } from '../utils/helpers';
import { APP_CONFIG } from '../utils/constants';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState<string>(() => formatTime(new Date()));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, APP_CONFIG.REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return currentTime;
};