import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// 数据类型定义
export interface GameData {
  id: string;
  name: string;
  grade: string;
  type: 'track' | 'field';
  participants: number;
}

export interface AthleteData {
  id: string;
  name: string;
  class: string;
  grade: string;
  events: string[];
}

export interface ScheduleData {
  eventId: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  round: string;
}

// 状态类型
interface ExcelImportState {
  gamesData: GameData[];
  athletesData: AthleteData[];
  scheduleData: ScheduleData[];
  loading: boolean;
  error: string | null;
  success: string | null;
  validationErrors: string[];
  currentFile: File | null;
  importStatus: 'idle' | 'loading' | 'success' | 'error';
  importErrors: string[];
}

// Action类型
type ExcelImportAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_GAMES_DATA'; payload: GameData[] }
  | { type: 'SET_ATHLETES_DATA'; payload: AthleteData[] }
  | { type: 'SET_SCHEDULE_DATA'; payload: ScheduleData[] }
  | { type: 'SET_VALIDATION_ERRORS'; payload: string[] }
  | { type: 'SET_CURRENT_FILE'; payload: File | null }
  | { type: 'SET_IMPORT_STATUS'; payload: 'idle' | 'loading' | 'success' | 'error' }
  | { type: 'SET_IMPORT_ERRORS'; payload: string[] }
  | { type: 'CLEAR_DATA' };

// 初始状态
const initialState: ExcelImportState = {
  gamesData: [],
  athletesData: [],
  scheduleData: [],
  loading: false,
  error: null,
  success: null,
  validationErrors: [],
  currentFile: null,
  importStatus: 'idle',
  importErrors: [],
};

// Reducer函数
function excelImportReducer(
  state: ExcelImportState,
  action: ExcelImportAction
): ExcelImportState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, loading: false };
    case 'SET_GAMES_DATA':
      return { ...state, gamesData: action.payload };
    case 'SET_ATHLETES_DATA':
      return { ...state, athletesData: action.payload };
    case 'SET_SCHEDULE_DATA':
      return { ...state, scheduleData: action.payload };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };
    case 'SET_IMPORT_STATUS':
      return { ...state, importStatus: action.payload };
    case 'SET_IMPORT_ERRORS':
      return { ...state, importErrors: action.payload };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}

// Context创建
const ExcelImportContext = createContext<{
  state: ExcelImportState;
  dispatch: React.Dispatch<ExcelImportAction>;
} | null>(null);

// Provider组件
interface ExcelImportProviderProps {
  children: ReactNode;
}

export const ExcelImportProvider: React.FC<ExcelImportProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(excelImportReducer, initialState);

  // 监听数据更新事件并重置导入状态
  useEffect(() => {
    const handleDataUpdate = () => {
      // 重置导入状态
      dispatch({ type: 'CLEAR_DATA' });
    };

    window.addEventListener('dataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  return (
    <ExcelImportContext.Provider value={{ state, dispatch }}>
      {children}
    </ExcelImportContext.Provider>
  );
};

// Hook
export const useExcelImport = () => {
  const context = useContext(ExcelImportContext);
  if (!context) {
    throw new Error('useExcelImport must be used within ExcelImportProvider');
  }
  return context;
};