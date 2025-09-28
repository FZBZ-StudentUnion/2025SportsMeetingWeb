import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../utils/constants';
import { GameSchedule, PlayerList, ClassMapping } from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    // 动态检测baseURL - 支持所有域名
    let baseURL = '';
    
    // 根据环境变量和当前环境设置baseURL
    if (process.env.REACT_APP_ENV === 'production' || process.env.NODE_ENV === 'production') {
      // 生产环境 - 如果设置了API基础URL则使用，否则使用相对路径
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      if (apiBaseUrl) {
        baseURL = apiBaseUrl;
      } else {
        // 使用相对路径，适配所有域名
        baseURL = '';
      }
    } else {
      // 开发环境 - 根据端口设置
      const port = window.location.port;
      if (port === '3456' || port === '3000' || port === '3002' || port === '3003') {
        baseURL = 'http://localhost:3457';
      }
    }
    
    // 如果没有设置 baseURL，使用相对路径
    if (!baseURL) {
      baseURL = '';
    }
    
    console.log('API Service initialized with baseURL:', baseURL || '(相对路径 - 适配所有域名)');
    
    this.client = axios.create({
      baseURL: baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Response Success:', response.config.url, response.status);
        return response;
      },
      (error) => {
        console.error('API Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          timestamp: new Date().toISOString()
        });
        
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
      const response = await this.client.get('/api/data');
      
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
      const response = await this.client.get('/api/data');
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
      const response = await this.client.get('/api/data');
      const players = response.data.players;
      
      // name参数已经是完整的格式，如"高一男子组-100米-预赛"
      // 直接在players对象中查找对应的键
      const playerList = players[name];
      
      if (playerList) {
        // 确保返回的数据结构符合PlayerList类型
        if (!playerList.name || !Array.isArray(playerList.players)) {
          console.error('Invalid player list structure:', playerList);
          throw new Error('选手列表数据格式错误');
        }
        return playerList;
      }
      
      // 如果未找到，尝试一些兼容性处理
      // 检查是否包含M后缀需要转换
      if (name.includes('100M')) {
        const convertedName = name.replace('100M', '100米');
        if (players[convertedName]) {
          return players[convertedName];
        }
      }
      if (name.includes('200M')) {
        const convertedName = name.replace('200M', '200米');
        if (players[convertedName]) {
          return players[convertedName];
        }
      }
      if (name.includes('400M')) {
        const convertedName = name.replace('400M', '400米');
        if (players[convertedName]) {
          return players[convertedName];
        }
      }
      
      // 如果仍然未找到，返回一个空的PlayerList结构
      console.warn('Player list not found for name:', name);
      return {
        name: name,
        players: []
      };
    } catch (error) {
      console.error('Failed to load player list by name:', error);
      throw new Error('加载选手列表失败');
    }
  }

  async getClassMapping(): Promise<ClassMapping> {
    try {
      const response = await this.client.get('/api/data');
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
      const response = await this.client.get('/api/data');
      return response.data;
    } catch (error) {
      console.error('Failed to get sports data:', error);
      throw new Error('获取体育数据失败');
    }
  }

  async saveSportsData(data: any): Promise<any> {
    try {
      const response = await this.client.post('/api/data', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save sports data:', error);
      throw new Error('保存体育数据失败');
    }
  }
}

export const apiService = new ApiService();

// 兼容旧版本的导出函数
export const getSportsData = () => apiService.getSportsData();
export const saveSportsData = (data: any) => apiService.saveSportsData(data);
