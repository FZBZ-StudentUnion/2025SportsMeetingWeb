/**
 * 网络连接诊断工具
 * 用于检测和诊断移动端网络连接问题
 */

interface NetworkDiagnostics {
  isOnline: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  timestamp: number;
  errors: string[];
}

// 基础网络检测
export const checkBasicNetwork = (): NetworkDiagnostics => {
  const diagnostics: NetworkDiagnostics = {
    isOnline: navigator.onLine,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    timestamp: Date.now(),
    errors: []
  };

  try {
    // 检测网络连接状态
    diagnostics.isOnline = navigator.onLine;
    
    if (!diagnostics.isOnline) {
      diagnostics.errors.push('设备当前处于离线状态');
    }

    // 检测网络连接信息
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      diagnostics.connectionType = connection.type || 'unknown';
      diagnostics.effectiveType = connection.effectiveType || 'unknown';
      diagnostics.downlink = connection.downlink || null;
      diagnostics.rtt = connection.rtt || null;
      
      if (connection.saveData) {
        diagnostics.errors.push('检测到省流量模式已开启，可能影响数据加载');
      }
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        diagnostics.errors.push('当前为2G网络，数据加载可能较慢');
      }
    } else {
      diagnostics.errors.push('无法获取网络连接信息，浏览器不支持 Network Information API');
    }

  } catch (error) {
    diagnostics.errors.push(`网络检测出错: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  return diagnostics;
};

// 测试与服务器的连接
export const testServerConnection = async (serverUrl: string = ''): Promise<{
  success: boolean;
  latency: number | null;
  error: string | null;
}> => {
  try {
    // 如果没有提供服务器URL，尝试从当前页面获取
    const baseUrl = serverUrl || `${window.location.protocol}//${window.location.host}`;
    const testUrl = `${baseUrl}/api/health`;
    
    const startTime = Date.now();
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      timeout: 5000 // 5秒超时
    });
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    if (response.ok) {
      return {
        success: true,
        latency,
        error: null
      };
    } else {
      return {
        success: false,
        latency,
        error: `服务器响应错误: ${response.status} ${response.statusText}`
      };
    }
    
  } catch (error) {
    return {
      success: false,
      latency: null,
      error: error instanceof Error ? error.message : '连接失败'
    };
  }
};

// 获取详细的网络诊断报告
export const getNetworkDiagnostics = async (): Promise<{
  basic: NetworkDiagnostics;
  serverTest: {
    success: boolean;
    latency: number | null;
    error: string | null;
  };
  recommendations: string[];
}> => {
  // 基础网络检测
  const basic = checkBasicNetwork();
  
  // 服务器连接测试
  const serverTest = await testServerConnection();
  
  // 生成建议
  const recommendations: string[] = [];
  
  if (!basic.isOnline) {
    recommendations.push('请检查设备的网络连接设置');
    recommendations.push('尝试开启飞行模式后重新连接');
  }
  
  if (basic.effectiveType === 'slow-2g' || basic.effectiveType === '2g') {
    recommendations.push('当前网络较慢，建议切换到WiFi或4G/5G网络');
  }
  
  if (basic.effectiveType === '3g') {
    recommendations.push('3G网络可能加载较慢，建议耐心等待或切换网络');
  }
  
  if (!serverTest.success) {
    if (serverTest.error?.includes('timeout')) {
      recommendations.push('连接超时，可能是网络延迟较高');
      recommendations.push('建议等待几秒后刷新页面重试');
    } else if (serverTest.error?.includes('NetworkError')) {
      recommendations.push('网络错误，请检查网络连接');
    } else {
      recommendations.push('服务器连接失败，请确认服务器是否正常运行');
    }
  }
  
  if (basic.connectionType === 'cellular' && !serverTest.success) {
    recommendations.push('当前使用移动数据，可能存在网络限制');
    recommendations.push('建议切换到WiFi网络试试');
  }
  
  // 通用建议
  recommendations.push('关闭不必要的后台应用以节省网络资源');
  recommendations.push('如问题持续存在，请联系技术支持');
  
  return {
    basic,
    serverTest,
    recommendations
  };
};

// 简化的移动端错误提示
export const getSimpleMobileError = (error: any): string => {
  if (typeof window === 'undefined') {
    return '数据加载失败';
  }
  
  // 基础网络检测
  const diagnostics = checkBasicNetwork();
  
  if (!diagnostics.isOnline) {
    return '设备当前无网络连接，请检查网络设置';
  }
  
  // 根据错误类型返回简化信息
  const errorMessage = error?.message || error || '';
  
  if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
    if (diagnostics.effectiveType === 'slow-2g' || diagnostics.effectiveType === '2g') {
      return '网络信号较弱，建议切换到更稳定的网络环境';
    }
    return '网络连接失败，请检查您的网络连接';
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
    if (diagnostics.rtt && diagnostics.rtt > 1000) {
      return '网络延迟较高，请耐心等待或稍后重试';
    }
    return '请求超时，请检查网络状况或稍后重试';
  }
  
  if (errorMessage.includes('无法连接到服务器') || errorMessage.includes('Connection refused')) {
    return '服务器连接失败，请确认服务器是否正常运行';
  }
  
  // 默认错误信息
  return '数据加载失败，请检查网络连接或稍后重试';
};