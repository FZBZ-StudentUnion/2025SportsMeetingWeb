import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { OnlineEditorState, OnlineGameItem, OnlineAthlete, OnlineSchedule } from '../types/onlineEditor';
import { apiService } from '../services/api';

// Action类型定义
type OnlineEditorAction =
  | { type: 'SET_GAMES'; payload: OnlineGameItem[] }
  | { type: 'SET_ATHLETES'; payload: OnlineAthlete[] }
  | { type: 'SET_SCHEDULES'; payload: OnlineSchedule[] }
  | { type: 'SET_ACTIVE_TAB'; payload: 'games' | 'athletes' | 'schedules' }
  | { type: 'SET_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_EDITING_ITEM'; payload: any | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_GAME'; payload: OnlineGameItem }
  | { type: 'UPDATE_GAME'; payload: OnlineGameItem }
  | { type: 'DELETE_GAME'; payload: string }
  | { type: 'ADD_ATHLETE'; payload: OnlineAthlete }
  | { type: 'UPDATE_ATHLETE'; payload: OnlineAthlete }
  | { type: 'DELETE_ATHLETE'; payload: string }
  | { type: 'ADD_SCHEDULE'; payload: OnlineSchedule }
  | { type: 'UPDATE_SCHEDULE'; payload: OnlineSchedule }
  | { type: 'DELETE_SCHEDULE'; payload: string };

// 初始状态
const initialState: OnlineEditorState = {
  games: [],
  athletes: [],
  schedules: [],
  activeTab: 'games',
  isModalOpen: false,
  editingItem: null,
  loading: false,
  error: null,
  searchQuery: '',
  filterGrade: '',
  filterGender: ''
};

// Context
const OnlineEditorContext = createContext<{
  state: OnlineEditorState;
  dispatch: React.Dispatch<OnlineEditorAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Reducer
const onlineEditorReducer = (state: OnlineEditorState, action: OnlineEditorAction): OnlineEditorState => {
  switch (action.type) {
    case 'SET_GAMES':
      return { ...state, games: action.payload };
    case 'SET_ATHLETES':
      return { ...state, athletes: action.payload };
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_MODAL_OPEN':
      return { ...state, isModalOpen: action.payload };
    case 'SET_EDITING_ITEM':
      return { ...state, editingItem: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.payload] };
    case 'UPDATE_GAME':
      return { 
        ...state, 
        games: state.games.map(game => 
          game.id === action.payload.id ? action.payload : game
        ) 
      };
    case 'DELETE_GAME':
      return { 
        ...state, 
        games: state.games.filter(game => game.id !== action.payload)
      };
    case 'ADD_ATHLETE':
      return { ...state, athletes: [...state.athletes, action.payload] };
    case 'UPDATE_ATHLETE':
      return { 
        ...state, 
        athletes: state.athletes.map(athlete => 
          athlete.id === action.payload.id ? action.payload : athlete
        ) 
      };
    case 'DELETE_ATHLETE':
      return { 
        ...state, 
        athletes: state.athletes.filter(athlete => athlete.id !== action.payload)
      };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    case 'UPDATE_SCHEDULE':
      return { 
        ...state, 
        schedules: state.schedules.map(schedule => 
          schedule.id === action.payload.id ? action.payload : schedule
        ) 
      };
    case 'DELETE_SCHEDULE':
      return { 
        ...state, 
        schedules: state.schedules.filter(schedule => schedule.id !== action.payload)
      };
    default:
      return state;
  }
};

// Provider
export const OnlineEditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(onlineEditorReducer, initialState);

  // 从真实数据源加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // 检查本地存储中是否有数据
        const savedGames = localStorage.getItem('onlineEditor_games');
        const savedAthletes = localStorage.getItem('onlineEditor_athletes');
        const savedSchedules = localStorage.getItem('onlineEditor_schedules');
        
        if (savedGames && savedAthletes && savedSchedules) {
          // 使用本地存储的数据
          dispatch({ type: 'SET_GAMES', payload: JSON.parse(savedGames) });
          dispatch({ type: 'SET_ATHLETES', payload: JSON.parse(savedAthletes) });
          dispatch({ type: 'SET_SCHEDULES', payload: JSON.parse(savedSchedules) });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        // 从真实JSON文件加载数据
        const [day1Response, day2Response] = await Promise.all([
          fetch('/data/games/10.json'),
          fetch('/data/games/20.json')
        ]);
        
        const day1Data = await day1Response.json();
        const day2Data = await day2Response.json();
        
        // 转换真实数据为内部格式
        const games: OnlineGameItem[] = [];
        
        // 处理第一天数据
        day1Data[0].forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day1-track-morning-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '径赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        day1Data[1].forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day1-track-afternoon-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '径赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        day1Data[2].forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day1-field-morning-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '田赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        day1Data[3].forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day1-field-afternoon-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '田赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        // 处理第二天数据
        day2Data[0]?.forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day2-track-morning-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '径赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        day2Data[1]?.forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day2-track-afternoon-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '径赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        day2Data[2]?.forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day2-field-morning-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '田赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        day2Data[3]?.forEach((item: any) => games.push({
          id: item.link?.split('=')[1] || `day2-field-afternoon-${games.length}`,
          name: item.name,
          grade: item.grade,
          gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
          type: '田赛',
          participants: 20,
          status: 'active',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        // 生成对应的赛程数据
        const schedules: OnlineSchedule[] = games.map((game, index) => ({
          id: `schedule-${game.id}`,
          eventId: game.id,
          eventName: game.name,
          date: game.name.includes('10') || games.indexOf(game) < games.length / 2 ? '2024-10-10' : '2024-10-11',
          startTime: '09:00',
          endTime: '10:00',
          location: game.type === '径赛' ? '田径场跑道' : '田赛场地',
          round: game.name.includes('决赛') ? '决赛' : '预赛',
          status: 'scheduled',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        dispatch({ type: 'SET_GAMES', payload: games });
        dispatch({ type: 'SET_SCHEDULES', payload: schedules });
        
        // 从真实运动员数据加载
        const athleteFiles = [
          '10001', '10002', '10003', '10004', '10005', '10006',
          '10007', '10008', '10009', '10010', '10011', '10012',
          '10101', '10102', '10103', '10104', '10105',
          '11001', '11002', '11003', '11004', '11005', '11006',
          '11007', '11008', '11009', '11010', '11011', '11012',
          '11101', '11102', '11103', '11104', '11105', '11106',
          '11107', '11108',
          '20001', '20002', '20003', '20004', '20005', '20006',
          '20007', '20008', '20009', '20010', '20011', '20012',
          '20013', '20014', '20015', '20016', '20017', '20018',
          '20019', '20020', '20021',
          '20101', '20102', '20103', '20104', '20105', '20106',
          '20107', '20108',
          '21001', '21002', '21003', '21004', '21005', '21006',
          '21101', '21102', '21103'
        ];

        // 使用apiService加载所有运动员数据
        const athletePromises = athleteFiles.map(async (id) => {
          try {
            const gameData = await apiService.getPlayerList(id);
            return gameData.players.flatMap((group: any[], groupIndex: number) => 
              group.map((player: any) => {
                let grade: '高一' | '高二' | '高三' = '高一';
                if (gameData.name.includes('高一')) grade = '高一';
                else if (gameData.name.includes('高二')) grade = '高二';
                else if (gameData.name.includes('高三')) grade = '高三';

                let gender: '男' | '女' = '男';
                if (gameData.name.includes('女子')) gender = '女';

                return {
                  id: `${id}_${player.name}_${groupIndex}`,
                  name: player.name,
                  class: player.class || '未知班级',
                  grade,
                  gender,
                  events: [gameData.name],
                  studentId: player.studentId || '',
                  phone: '',
                  status: 'active' as const,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as OnlineAthlete;
              })
            );
          } catch (error) {
            console.error(`加载运动员文件失败: ${id}`, error);
            return [];
          }
        });

        const allAthletesArrays = await Promise.all(athletePromises);
        const allAthletes = allAthletesArrays.flat();
        
        dispatch({ type: 'SET_ATHLETES', payload: allAthletes });
        
      } catch (error) {
        console.error('加载真实数据失败:', error);
        dispatch({ type: 'SET_ERROR', payload: '加载数据失败，请检查网络连接' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // 监听数据更新事件并刷新数据
  useEffect(() => {
    const handleDataUpdate = () => {
      // 重新加载数据
      const loadData = async () => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          
          // 从真实JSON文件加载数据
          const [day1Response, day2Response] = await Promise.all([
            fetch('/data/games/10.json'),
            fetch('/data/games/20.json')
          ]);
          
          const day1Data = await day1Response.json();
          const day2Data = await day2Response.json();
          
          // 转换真实数据为内部格式
          const games: OnlineGameItem[] = [];
          
          // 处理第一天数据
          day1Data[0].forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day1-track-morning-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '径赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          day1Data[1].forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day1-track-afternoon-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '径赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          day1Data[2].forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day1-field-morning-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '田赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          day1Data[3].forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day1-field-afternoon-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '田赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          // 处理第二天数据
          day2Data[0]?.forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day2-track-morning-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '径赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          day2Data[1]?.forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day2-track-afternoon-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '径赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          day2Data[2]?.forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day2-field-morning-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '田赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          day2Data[3]?.forEach((item: any) => games.push({
            id: item.link?.split('=')[1] || `day2-field-afternoon-${games.length}`,
            name: item.name,
            grade: item.grade,
            gender: item.name.includes('男子') ? '男子' : item.name.includes('女子') ? '女子' : '混合',
            type: '田赛',
            participants: 20,
            status: 'active',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

          // 生成对应的赛程数据
          const schedules: OnlineSchedule[] = games.map((game, index) => ({
            id: `schedule-${game.id}`,
            eventId: game.id,
            eventName: game.name,
            date: game.name.includes('10') || games.indexOf(game) < games.length / 2 ? '2024-10-10' : '2024-10-11',
            startTime: '09:00',
            endTime: '10:00',
            location: game.type === '径赛' ? '田径场跑道' : '田赛场地',
            round: game.name.includes('决赛') ? '决赛' : '预赛',
            status: 'scheduled',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

          dispatch({ type: 'SET_GAMES', payload: games });
          dispatch({ type: 'SET_SCHEDULES', payload: schedules });
          
          // 从真实运动员数据加载
          const athleteFiles = [
            '10001', '10002', '10003', '10004', '10005', '10006',
            '10007', '10008', '10009', '10010', '10011', '10012',
            '10101', '10102', '10103', '10104', '10105',
            '11001', '11002', '11003', '11004', '11005', '11006',
            '11007', '11008', '11009', '11010', '11011', '11012',
            '11101', '11102', '11103', '11104', '11105', '11106',
            '11107', '11108',
            '20001', '20002', '20003', '20004', '20005', '20006',
            '20007', '20008', '20009', '20010', '20011', '20012',
            '20013', '20014', '20015', '20016', '20017', '20018',
            '20019', '20020', '20021',
            '20101', '20102', '20103', '20104', '20105', '20106',
            '20107', '20108',
            '21001', '21002', '21003', '21004', '21005', '21006',
            '21101', '21102', '21103'
          ];

          // 使用apiService加载所有运动员数据
          const athletePromises = athleteFiles.map(async (id) => {
            try {
              const gameData = await apiService.getPlayerList(id);
              return gameData.players.flatMap((group: any[], groupIndex: number) => 
                group.map((player: any) => {
                  let grade: '高一' | '高二' | '高三' = '高一';
                  if (gameData.name.includes('高一')) grade = '高一';
                  else if (gameData.name.includes('高二')) grade = '高二';
                  else if (gameData.name.includes('高三')) grade = '高三';

                  let gender: '男' | '女' = '男';
                  if (gameData.name.includes('女子')) gender = '女';

                  return {
                    id: `${id}_${player.name}_${groupIndex}`,
                    name: player.name,
                    class: player.class || '未知班级',
                    grade,
                    gender,
                    events: [gameData.name],
                    studentId: player.studentId || '',
                    phone: '',
                    status: 'active' as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  } as OnlineAthlete;
                })
              );
            } catch (error) {
              console.error(`加载运动员文件失败: ${id}`, error);
              return [];
            }
          });

          const allAthletesArrays = await Promise.all(athletePromises);
          const allAthletes = allAthletesArrays.flat();
          
          dispatch({ type: 'SET_ATHLETES', payload: allAthletes });
          
        } catch (error) {
          console.error('加载真实数据失败:', error);
          dispatch({ type: 'SET_ERROR', payload: '加载数据失败，请检查网络连接' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };

      loadData();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    if (state.games.length > 0) {
      localStorage.setItem('onlineEditor_games', JSON.stringify(state.games));
    }
  }, [state.games]);

  useEffect(() => {
    if (state.athletes.length > 0) {
      localStorage.setItem('onlineEditor_athletes', JSON.stringify(state.athletes));
    }
  }, [state.athletes]);

  useEffect(() => {
    if (state.schedules.length > 0) {
      localStorage.setItem('onlineEditor_schedules', JSON.stringify(state.schedules));
    }
  }, [state.schedules]);



  return (
    <OnlineEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </OnlineEditorContext.Provider>
  );
};

// Hook
export const useOnlineEditor = () => {
  const context = useContext(OnlineEditorContext);
  if (!context) {
    throw new Error('useOnlineEditor must be used within OnlineEditorProvider');
  }
  return context;
};