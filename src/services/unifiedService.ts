import axios from 'axios';
import { 
  UnifiedEvent, 
  UnifiedAthlete, 
  UnifiedSchedule, 
  UnifiedSystemData, 
  UnifiedQueryParams, 
  UnifiedAPIResponse,
  BatchOperationRequest 
} from '../types/unifiedSystem';

class UnifiedService {
  private baseURL: string;
  private client: any;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 统一数据管理API

  // 获取完整系统数据
  async getSystemData(): Promise<UnifiedAPIResponse<UnifiedSystemData>> {
    try {
      const response = await this.client.get('/api/unified/system');
      return response.data;
    } catch (error) {
      console.error('Failed to get system data:', error);
      throw new Error('获取系统数据失败');
    }
  }

  // 获取比赛项目列表
  async getEvents(params?: UnifiedQueryParams): Promise<UnifiedAPIResponse<UnifiedEvent[]>> {
    try {
      const response = await this.client.get('/api/unified/events', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get events:', error);
      throw new Error('获取比赛项目失败');
    }
  }

  // 获取单个比赛项目详情
  async getEvent(id: string): Promise<UnifiedAPIResponse<UnifiedEvent>> {
    try {
      const response = await this.client.get(`/api/unified/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get event:', error);
      throw new Error('获取比赛项目详情失败');
    }
  }

  // 创建比赛项目
  async createEvent(event: Omit<UnifiedEvent, 'id' | 'metadata'>): Promise<UnifiedAPIResponse<UnifiedEvent>> {
    try {
      const response = await this.client.post('/api/unified/events', event);
      return response.data;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw new Error('创建比赛项目失败');
    }
  }

  // 更新比赛项目
  async updateEvent(id: string, event: Partial<UnifiedEvent>): Promise<UnifiedAPIResponse<UnifiedEvent>> {
    try {
      const response = await this.client.put(`/api/unified/events/${id}`, event);
      return response.data;
    } catch (error) {
      console.error('Failed to update event:', error);
      throw new Error('更新比赛项目失败');
    }
  }

  // 删除比赛项目
  async deleteEvent(id: string): Promise<UnifiedAPIResponse<void>> {
    try {
      const response = await this.client.delete(`/api/unified/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw new Error('删除比赛项目失败');
    }
  }

  // 运动员管理API

  // 获取运动员列表
  async getAthletes(params?: UnifiedQueryParams): Promise<UnifiedAPIResponse<UnifiedAthlete[]>> {
    try {
      const response = await this.client.get('/api/unified/athletes', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get athletes:', error);
      throw new Error('获取运动员列表失败');
    }
  }

  // 获取单个运动员详情
  async getAthlete(id: string): Promise<UnifiedAPIResponse<UnifiedAthlete>> {
    try {
      const response = await this.client.get(`/api/unified/athletes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get athlete:', error);
      throw new Error('获取运动员详情失败');
    }
  }

  // 创建运动员
  async createAthlete(athlete: Omit<UnifiedAthlete, 'id' | 'metadata'>): Promise<UnifiedAPIResponse<UnifiedAthlete>> {
    try {
      const response = await this.client.post('/api/unified/athletes', athlete);
      return response.data;
    } catch (error) {
      console.error('Failed to create athlete:', error);
      throw new Error('创建运动员失败');
    }
  }

  // 更新运动员
  async updateAthlete(id: string, athlete: Partial<UnifiedAthlete>): Promise<UnifiedAPIResponse<UnifiedAthlete>> {
    try {
      const response = await this.client.put(`/api/unified/athletes/${id}`, athlete);
      return response.data;
    } catch (error) {
      console.error('Failed to update athlete:', error);
      throw new Error('更新运动员失败');
    }
  }

  // 删除运动员
  async deleteAthlete(id: string): Promise<UnifiedAPIResponse<void>> {
    try {
      const response = await this.client.delete(`/api/unified/athletes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete athlete:', error);
      throw new Error('删除运动员失败');
    }
  }

  // 时间安排管理API

  // 获取时间安排列表
  async getSchedules(params?: UnifiedQueryParams): Promise<UnifiedAPIResponse<UnifiedSchedule[]>> {
    try {
      const response = await this.client.get('/api/unified/schedules', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get schedules:', error);
      throw new Error('获取时间安排失败');
    }
  }

  // 获取单个时间安排详情
  async getSchedule(id: string): Promise<UnifiedAPIResponse<UnifiedSchedule>> {
    try {
      const response = await this.client.get(`/api/unified/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get schedule:', error);
      throw new Error('获取时间安排详情失败');
    }
  }

  // 创建时间安排
  async createSchedule(schedule: Omit<UnifiedSchedule, 'id'>): Promise<UnifiedAPIResponse<UnifiedSchedule>> {
    try {
      const response = await this.client.post('/api/unified/schedules', schedule);
      return response.data;
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw new Error('创建时间安排失败');
    }
  }

  // 更新时间安排
  async updateSchedule(id: string, schedule: Partial<UnifiedSchedule>): Promise<UnifiedAPIResponse<UnifiedSchedule>> {
    try {
      const response = await this.client.put(`/api/unified/schedules/${id}`, schedule);
      return response.data;
    } catch (error) {
      console.error('Failed to update schedule:', error);
      throw new Error('更新时间安排失败');
    }
  }

  // 删除时间安排
  async deleteSchedule(id: string): Promise<UnifiedAPIResponse<void>> {
    try {
      const response = await this.client.delete(`/api/unified/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      throw new Error('删除时间安排失败');
    }
  }

  // 批量操作API

  // 批量操作
  async batchOperation(request: BatchOperationRequest): Promise<UnifiedAPIResponse<any>> {
    try {
      const response = await this.client.post('/api/unified/batch', request);
      return response.data;
    } catch (error) {
      console.error('Failed to batch operation:', error);
      throw new Error('批量操作失败');
    }
  }

  // 导入数据
  async importData(data: any[], type: 'events' | 'athletes' | 'schedules'): Promise<UnifiedAPIResponse<any>> {
    try {
      const response = await this.client.post('/api/unified/import', { data, type });
      return response.data;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('导入数据失败');
    }
  }

  // 导出数据
  async exportData(type: 'events' | 'athletes' | 'schedules' | 'all', format: 'json' | 'csv' | 'xlsx'): Promise<Blob> {
    try {
      const response = await this.client.get('/api/unified/export', {
        params: { type, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('导出数据失败');
    }
  }

  // 系统工具API

  // 检查时间冲突
  async checkTimeConflicts(): Promise<UnifiedAPIResponse<any>> {
    try {
      const response = await this.client.get('/api/unified/check-conflicts');
      return response.data;
    } catch (error) {
      console.error('Failed to check time conflicts:', error);
      throw new Error('检查时间冲突失败');
    }
  }

  // 获取系统统计
  async getStatistics(): Promise<UnifiedAPIResponse<any>> {
    try {
      const response = await this.client.get('/api/unified/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw new Error('获取系统统计失败');
    }
  }

  // 备份数据
  async backupData(): Promise<UnifiedAPIResponse<string>> {
    try {
      const response = await this.client.post('/api/unified/backup');
      return response.data;
    } catch (error) {
      console.error('Failed to backup data:', error);
      throw new Error('备份数据失败');
    }
  }

  // 恢复数据
  async restoreData(backupId: string): Promise<UnifiedAPIResponse<void>> {
    try {
      const response = await this.client.post('/api/unified/restore', { backupId });
      return response.data;
    } catch (error) {
      console.error('Failed to restore data:', error);
      throw new Error('恢复数据失败');
    }
  }
}

export const unifiedService = new UnifiedService();
export default unifiedService;