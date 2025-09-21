import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../utils/constants';
import { GameSchedule, PlayerList, ClassMapping } from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
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
  }

  async getGameSchedule(day: string): Promise<GameSchedule> {
    try {
      const key = day === '2' ? '20' : '10';
      const response = await this.client.get('/data/sports_data.json');
      
      // 转换数据结构
      const data = response.data.games[key];
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

  async getPlayerList(id: string): Promise<PlayerList> {
    try {
      const response = await this.client.get('/data/sports_data.json');
      return response.data.players[id];
    } catch (error) {
      console.error('Failed to load player list:', error);
      throw new Error('加载选手列表失败');
    }
  }

  async getPlayerListByName(name: string, grade: string, time: string): Promise<PlayerList> {
    try {
      const response = await this.client.get('/data/sports_data.json');
      const players = response.data.players;
      
      // 将赛程名称转换为选手列表名称格式
      // 例如："男子组-100M-预赛" -> "高一男子组-100米-预赛"
      const convertedName = name.replace('100M', '100米').replace('200M', '200米').replace('400M', '400米');
      const fullName = grade + convertedName;
      
      // 根据转换后的名称查找对应的选手列表
      for (const key in players) {
        const playerList = players[key];
        if (playerList.name === fullName) {
          return playerList;
        }
      }
      
      // 如果未找到，抛出错误
      throw new Error('未找到对应的选手列表');
    } catch (error) {
      console.error('Failed to load player list by name:', error);
      throw new Error('加载选手列表失败');
    }
  }

  async getClassMapping(): Promise<ClassMapping> {
    try {
      const response = await this.client.get('/data/sports_data.json');
      return response.data.games.classMapping;
    } catch (error) {
      console.error('Failed to load class mapping:', error);
      throw new Error('加载班级映射失败');
    }
  }

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