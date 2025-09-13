import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../utils/constants';
import { GameSchedule, PlayerList, ClassMapping } from '../types';

class ApiService {
  private client: AxiosInstance;
  private backendClient: AxiosInstance;

  constructor() {
    // 前端静态资源客户端
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 后端API客户端
    this.backendClient = axios.create({
      baseURL: 'http://localhost:3001',
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    this.backendClient.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Network Error:', error.message);
        } else {
          console.error('Error:', error.message);
        }
        return Promise.reject(error);
      }
    );

    this.backendClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('Backend API Error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Backend Network Error:', error.message);
        } else {
          console.error('Backend Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // 读取比赛日程（使用后端API）
  async getGameSchedule(day: string): Promise<GameSchedule> {
    try {
      const response = await this.backendClient.get(`/api/games/${day}`);
      
      // 转换数据结构
      const data = response.data;
      return {
        track: {
          morning: data[0] || [],
          afternoon: data[1] || [],
        },
        field: {
          morning: data[2] || [],
          afternoon: data[3] || [],
        },
      };
    } catch (error) {
      console.error('Failed to load game schedule:', error);
      throw new Error('加载赛程失败');
    }
  }

  // 更新比赛日程（使用后端API）
  async updateGameSchedule(day: string, data: any): Promise<boolean> {
    try {
      const response = await this.backendClient.post(`/api/games/${day}`, data);
      return response.data.success;
    } catch (error) {
      console.error('Failed to update game schedule:', error);
      throw new Error('更新赛程失败');
    }
  }

  // 读取运动员列表
  async getPlayerList(id: string): Promise<PlayerList> {
    try {
      const response = await this.backendClient.get(`/api/players/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to load player list:', error);
      throw new Error('加载选手列表失败');
    }
  }

  // 更新运动员列表
  async updatePlayerList(id: string, data: any): Promise<boolean> {
    try {
      const response = await this.backendClient.post(`/api/players/${id}`, data);
      return response.data.success;
    } catch (error) {
      console.error('Failed to update player list:', error);
      throw new Error('更新选手列表失败');
    }
  }

  // 获取班级映射
  async getClassMapping(): Promise<ClassMapping> {
    try {
      const response = await this.backendClient.get('/api/class-mapping');
      return response.data;
    } catch (error) {
      console.error('Failed to load class mapping:', error);
      throw new Error('加载班级映射失败');
    }
  }

  // 备份数据
  async backupData(type: string): Promise<boolean> {
    try {
      const response = await this.backendClient.post(`/api/backup/${type}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to backup data:', error);
      throw new Error('备份失败');
    }
  }

  // 下载文件（保持原有功能）
  async downloadFile(url: string): Promise<Blob> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw new Error('文件下载失败');
    }
  }
}

export const apiService = new ApiService();