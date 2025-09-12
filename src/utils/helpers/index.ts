// 时间格式化
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = date.getHours() < 12 ? 'AM' : 'PM';
  return `${hours}:${minutes}${period}`;
};

// 日期格式化
export const formatDateLabel = (day: string): string => {
  const dayMap: Record<string, string> = {
    '1': '10月17日',
    '2': '10月18日',
  };
  return dayMap[day] || '10月17日';
};

// 获取对应日期的文件名
export const getGameFileName = (day: string): string => {
  return day === '2' ? '20.json' : '10.json';
};

// 验证日期参数
export const validateDay = (day: string): '1' | '2' => {
  return day === '2' ? '2' : '1';
};

// 错误处理
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return '发生未知错误';
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};