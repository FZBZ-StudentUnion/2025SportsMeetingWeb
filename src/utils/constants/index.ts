// API配置
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || '',
  TIMEOUT: 10000,
} as const;

// 资源路径配置
export const RESOURCE_PATHS = {
  GAMES: '/data/games',
  PLAYERS: '/data/players',
  H2C: '/data/h2c.json',
  SCHEDULE: '/data/2024年福州八中第56届运动会秩序册.pdf',
} as const;

// 日期配置
export const DATE_CONFIG = {
  DAY_1: {
    date: '25',
    label: '9月25日',
    file: '10.json',
  },
  DAY_2: {
    date: '26',
    label: '9月26日',
    file: '20.json',
  },
} as const;

// 应用配置
export const APP_CONFIG = {
  TITLE: '福州八中第56届田径运动会',
  SUBTITLE: '赛事信息综合平台',
  COPYRIGHT: 'Copyright © 2025 by 福州八中学生会技术部 和 Zero_wyc',
  REFRESH_INTERVAL: 1000,
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请稍后重试',
  DATA_LOAD_ERROR: '数据加载失败，请刷新页面',
  FILE_NOT_FOUND: '文件不存在',
  INVALID_DAY: '无效的日期参数',
} as const;