import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameSchedule, PlayerList, ClassMapping } from '../types';
import { apiService } from '../services/api';

// 状态类型
interface AppState {
  gameSchedule: GameSchedule | null;
  playerList: PlayerList | null;
  classMapping: ClassMapping | null;
  loading: boolean;
  error: string | null;
  currentDay: '1' | '2';
}

// Action类型
interface LoadGameScheduleAction {
  type: 'LOAD_GAME_SCHEDULE';
  payload: GameSchedule;
}

interface LoadPlayerListAction {
  type: 'LOAD_PLAYER_LIST';
  payload: PlayerList;
}

interface LoadClassMappingAction {
  type: 'LOAD_CLASS_MAPPING';
  payload: ClassMapping;
}

interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}

interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string | null;
}

interface SetCurrentDayAction {
  type: 'SET_CURRENT_DAY';
  payload: '1' | '2';
}

type AppAction = 
  | LoadGameScheduleAction
  | LoadPlayerListAction
  | LoadClassMappingAction
  | SetLoadingAction
  | SetErrorAction
  | SetCurrentDayAction;

// 初始状态
const initialState: AppState = {
  gameSchedule: null,
  playerList: null,
  classMapping: null,
  loading: false,
  error: null,
  currentDay: '1',
};

// Reducer函数
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_GAME_SCHEDULE':
      return { ...state, gameSchedule: action.payload };
    case 'LOAD_PLAYER_LIST':
      return { ...state, playerList: action.payload };
    case 'LOAD_CLASS_MAPPING':
      return { ...state, classMapping: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_DAY':
      return { ...state, currentDay: action.payload };
    default:
      return state;
  }
};

// Context创建
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loadGameSchedule: (day: string) => Promise<void>;
    loadPlayerList: (id: string) => Promise<void>;
    loadClassMapping: () => Promise<void>;
    setCurrentDay: (day: '1' | '2') => void;
    clearError: () => void;
  };
} | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = React.useMemo(() => ({
    loadGameSchedule: async (day: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        const schedule = await apiService.getGameSchedule(day);
        dispatch({ type: 'LOAD_GAME_SCHEDULE', payload: schedule });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '加载失败' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadPlayerList: async (id: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        const [playerList, classMapping] = await Promise.all([
          apiService.getPlayerList(id),
          apiService.getClassMapping(),
        ]);
        dispatch({ type: 'LOAD_PLAYER_LIST', payload: playerList });
        dispatch({ type: 'LOAD_CLASS_MAPPING', payload: classMapping });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '加载失败' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadClassMapping: async () => {
      try {
        const mapping = await apiService.getClassMapping();
        dispatch({ type: 'LOAD_CLASS_MAPPING', payload: mapping });
      } catch (error) {
        console.error('Failed to load class mapping:', error);
      }
    },

    setCurrentDay: (day: '1' | '2') => {
      dispatch({ type: 'SET_CURRENT_DAY', payload: day });
    },

    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },
  }), []);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};