import React, { useState, useEffect } from 'react';
import { getNetworkInfo, checkBasicNetwork, getNetworkQuality } from '../../utils/networkDiagnostics';

interface NetworkStatusIndicatorProps {
  showDetails?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ 
  showDetails = false 
}) => {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkQuality, setNetworkQuality] = useState<string>('');

  useEffect(() => {
    // 初始检测
    updateNetworkStatus();

    // 监听在线状态变化
    const handleOnline = () => {
      setIsOnline(true);
      updateNetworkStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 定期更新网络状态
    const interval = setInterval(updateNetworkStatus, 30000); // 30秒更新一次

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const updateNetworkStatus = () => {
    const diagnostics = checkBasicNetwork();
    const info = getNetworkInfo();
    const quality = getNetworkQuality();
    
    setIsOnline(diagnostics.isOnline);
    setNetworkInfo(info);
    setNetworkQuality(quality);
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (networkQuality === 'excellent') return 'bg-green-500';
    if (networkQuality === 'good') return 'bg-yellow-500';
    if (networkQuality === 'poor') return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (!isOnline) return '离线';
    if (networkQuality === 'excellent') return '网络优秀';
    if (networkQuality === 'good') return '网络良好';
    if (networkQuality === 'poor') return '网络较差';
    return '网络未知';
  };

  if (!showDetails) {
    return (
      <div className="network-status-indicator">
        <div className={`status-dot ${getStatusColor()}`}></div>
        <span className="status-text">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className="network-status-detailed">
      <div className="status-header">
        <div className={`status-dot ${getStatusColor()}`}></div>
        <span className="status-text">{getStatusText()}</span>
      </div>
      
      {networkInfo && (
        <div className="network-details">
          <div className="detail-item">
            <span className="label">网络类型:</span>
            <span className="value">{networkInfo.effectiveType || '未知'}</span>
          </div>
          {networkInfo.downlink && (
            <div className="detail-item">
              <span className="label">下载速度:</span>
              <span className="value">{networkInfo.downlink} Mbps</span>
            </div>
          )}
          {networkInfo.rtt && (
            <div className="detail-item">
              <span className="label">延迟:</span>
              <span className="value">{networkInfo.rtt} ms</span>
            </div>
          )}
          {networkInfo.saveData && (
            <div className="detail-item warning">
              <span className="label">⚠️ 省流量模式:</span>
              <span className="value">已开启</span>
            </div>
          )}
        </div>
      )}
      
      {!isOnline && (
        <div className="offline-warning">
          <p>设备当前无网络连接，请检查网络设置</p>
        </div>
      )}
    </div>
  );
};