/**
 * 移动端网络状态检测和优化工具
 */

// 检测是否为移动设备
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'iphone', 'ipad', 'ipod', 'windows phone', 
    'blackberry', 'mobile', 'phone', 'tablet'
  ];
  
  const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // 添加调试信息
  console.log('设备检测:', {
    userAgent,
    isMobile,
    platform: navigator.platform,
    vendor: navigator.vendor
  });
  
  return isMobile;
};

// 获取网络连接信息
export const getNetworkInfo = () => {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return null;
  }
  
  const connection = (navigator as any).connection;
  return {
    effectiveType: connection.effectiveType, // 'slow-2g', '2g', '3g', '4g'
    downlink: connection.downlink, // 下载速度 (Mbps)
    rtt: connection.rtt, // 往返时延 (ms)
    saveData: connection.saveData, // 是否开启省流量模式
    type: connection.type // 网络类型
  };
};

// 检测网络质量
export const getNetworkQuality = (): 'poor' | 'good' | 'excellent' => {
  const networkInfo = getNetworkInfo();
  
  if (!networkInfo) return 'good'; // 无法检测时默认返回良好
  
  const { effectiveType, rtt } = networkInfo;
  
  // 基于网络类型判断
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'poor';
  }
  
  if (effectiveType === '3g') {
    return rtt > 500 ? 'poor' : 'good';
  }
  
  if (effectiveType === '4g') {
    return rtt > 200 ? 'good' : 'excellent';
  }
  
  return 'good';
};

// 获取移动端优化建议
export const getMobileOptimizationTips = (): string[] => {
  const tips: string[] = [];
  const isMobile = isMobileDevice();
  const networkQuality = getNetworkQuality();
  const networkInfo = getNetworkInfo();
  
  if (!isMobile) {
    return ['当前设备为桌面设备，网络状况良好'];
  }
  
  // 网络质量建议
  if (networkQuality === 'poor') {
    tips.push('网络信号较弱，建议切换到更稳定的网络环境');
    tips.push('避免在电梯、地下室等信号盲区使用');
  }
  
  if (networkQuality === 'good') {
    tips.push('网络状况良好，可正常使用');
  }
  
  if (networkQuality === 'excellent') {
    tips.push('网络状况优秀，体验最佳');
  }
  
  // 省流量模式建议
  if (networkInfo?.saveData) {
    tips.push('检测到省流量模式已开启，可能影响数据加载速度');
  }
  
  // 网络类型建议
  if (networkInfo?.effectiveType === 'slow-2g' || networkInfo?.effectiveType === '2g') {
    tips.push('当前为2G网络，数据加载可能较慢，请耐心等待');
  }
  
  if (networkInfo?.effectiveType === '3g') {
    tips.push('当前为3G网络，建议切换到WiFi或4G/5G以获得更好体验');
  }
  
  // 通用移动端建议
  tips.push('建议关闭不必要的后台应用以节省流量');
  tips.push('如遇加载失败，可尝试刷新页面或重新进入');
  
  return tips;
};

// 移动端错误处理
export const handleMobileError = (error: any): { message: string; tips: string[] } => {
  const networkQuality = getNetworkQuality();
  const isMobile = isMobileDevice();
  const tips = getMobileOptimizationTips();
  
  let message = '数据加载失败';
  
  if (!isMobile) {
    return { message, tips: ['请检查网络连接或稍后重试'] };
  }
  
  // 移动端特定错误处理
  if (error?.message?.includes('Network Error')) {
    message = '网络连接失败，请检查您的网络连接';
    if (networkQuality === 'poor') {
      message += '（网络信号较弱）';
    }
  } else if (error?.message?.includes('timeout')) {
    message = '请求超时，请检查网络状况或稍后重试';
    if (networkQuality === 'poor') {
      message += '（网络延迟较高）';
    }
  } else if (error?.message?.includes('无法连接到服务器')) {
    message = '服务器连接失败，请确认服务器是否正常运行';
  }
  
  return { message, tips };
};