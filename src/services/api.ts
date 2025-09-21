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
      const key = day === '2' ? '第二天' : '第一天';
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
      const players = response.data.players;
      
      // 如果id是数字格式（向后兼容），先查找对应的name
      if (/^\d+$/.test(id)) {
        // 查找对应的name
        for (const key in players) {
          if (players[key].name && players[key].name.includes(id.slice(-3))) {
            return players[key];
          }
        }
      }
      
      // 直接使用name作为key查找
      return players[id];
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
      
      // 直接使用fullName作为key查找（因为现在使用name作为键名）
      const playerList = players[fullName];
      if (playerList) {
        return playerList;
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

  async getSportsData(): Promise<any> {
    try {
      const response = await this.client.get('/data/sports_data.json');
      return response.data;
    } catch (error) {
      console.error('Failed to load sports data:', error);
      throw new Error('加载体育数据失败');
    }
  }

  async saveSportsData(data: any): Promise<void> {
    try {
      // 注意：由于浏览器安全限制，不能直接写入服务器文件
      // 这里提供一个下载JSON文件的功能作为替代方案
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sports_data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save sports data:', error);
      throw new Error('保存体育数据失败');
    }
  }
}

export const apiService = new ApiService();
export const getSportsData = () => apiService.getSportsData();
export const saveSportsData = (data: any) => apiService.saveSportsData(data);