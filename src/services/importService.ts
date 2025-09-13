import { GameData, AthleteData, ScheduleData } from '../contexts/ExcelImportContext';

export interface ImportResult {
  success: boolean;
  count?: number;
  error?: string;
}

export const importToSystem = async (
  data: any[],
  type: 'games' | 'athletes' | 'schedule'
): Promise<ImportResult> => {
  try {
    switch (type) {
      case 'games':
        return await importGames(data as GameData[]);
      case 'athletes':
        return await importAthletes(data as AthleteData[]);
      case 'schedule':
        return await importSchedule(data as ScheduleData[]);
      default:
        return { success: false, count: 0, error: '未知的数据类型' };
    }
  } catch (error) {
    console.error('导入失败:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : '导入失败'
    };
  }
};

const importGames = async (games: GameData[]): Promise<ImportResult> => {
  try {
    // 将游戏数据转换为系统需要的格式
    const gameSchedule = {
      track: {
        morning: [] as any[],
        afternoon: [] as any[]
      },
      field: {
        morning: [] as any[],
        afternoon: [] as any[]
      }
    };

    // 按类型分组
    games.forEach(game => {
      const gameData = {
        id: game.id,
        name: game.name,
        grade: game.grade,
        participants: game.participants,
        status: 'pending',
        results: []
      };

      if (game.type === 'track') {
        // 默认添加到上午，实际应根据时间安排
        gameSchedule.track.morning.push(gameData);
      } else {
        gameSchedule.field.morning.push(gameData);
      }
    });

    // 保存到本地存储
    localStorage.setItem('gameSchedule', JSON.stringify(gameSchedule));
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, count: games.length };
  } catch (error) {
    return { success: false, count: 0, error: '导入比赛项目失败' };
  }
};

const importAthletes = async (athletes: AthleteData[]): Promise<ImportResult> => {
  try {
    // 将运动员数据转换为系统需要的格式
    const athletesMap = new Map();
    
    athletes.forEach(athlete => {
      const athleteId = `${athlete.class}_${athlete.name}`;
      athletesMap.set(athleteId, {
        id: athleteId,
        name: athlete.name,
        class: athlete.class,
        grade: athlete.grade,
        events: athlete.events,
        results: {}
      });
    });

    // 保存到本地存储
    localStorage.setItem('athletesData', JSON.stringify(Array.from(athletesMap.entries())));
    
    // 生成对应的JSON文件
    const groupedByClass = athletes.reduce((acc, athlete) => {
      if (!acc[athlete.class]) {
        acc[athlete.class] = [];
      }
      acc[athlete.class].push({
        name: athlete.name,
        events: athlete.events,
        results: {}
      });
      return acc;
    }, {} as Record<string, any[]>);

    // 为每个班级创建JSON文件
    Object.entries(groupedByClass).forEach(([className, classAthletes]) => {
      const classData = {
        class: className,
        athletes: classAthletes
      };
      
      // 模拟保存到文件系统
      console.log(`保存班级 ${className} 的数据:`, classData);
    });

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, count: athletes.length };
  } catch (error) {
    return { success: false, count: 0, error: '导入运动员数据失败' };
  }
};

const importSchedule = async (schedule: ScheduleData[]): Promise<ImportResult> => {
  try {
    // 将时间安排数据转换为系统需要的格式
    const scheduleMap = new Map();
    
    schedule.forEach(item => {
      const dateKey = item.date;
      if (!scheduleMap.has(dateKey)) {
        scheduleMap.set(dateKey, []);
      }
      
      scheduleMap.get(dateKey).push({
        eventId: item.eventId,
        eventName: item.eventName,
        time: item.time,
        location: item.location,
        round: item.round,
        status: 'scheduled'
      });
    });

    // 保存到本地存储
    localStorage.setItem('scheduleData', JSON.stringify(Array.from(scheduleMap.entries())));
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, count: schedule.length };
  } catch (error) {
    return { success: false, count: 0, error: '导入时间安排失败' };
  }
};

// 导出数据到JSON文件
export const exportDataToJson = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 获取当前数据
export const getCurrentData = (type: string): any[] => {
  const key = type === 'games' ? 'gameSchedule' : type === 'athletes' ? 'athletesData' : 'scheduleData';
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};