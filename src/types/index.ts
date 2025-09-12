// 基础类型定义
export interface GameItem {
  grade: string;
  name: string;
  time: string;
  link: string;
}

export interface Player {
  road: string;
  name: string;
  data: string;
}

export interface PlayerList {
  name: string;
  players: Player[][];
}

export interface ClassMapping {
  [key: string]: string;
}

export interface GameSchedule {
  track: {
    morning: GameItem[];
    afternoon: GameItem[];
  };
  field: {
    morning: GameItem[];
    afternoon: GameItem[];
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type DayType = '1' | '2';

export interface AppConfig {
  apiBaseUrl: string;
  assetsBaseUrl: string;
}