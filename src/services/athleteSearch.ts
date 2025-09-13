import { apiService } from './api';

interface Athlete {
  name: string;
  class: string;
  gameName: string;
  gameLink: string;
  group?: string;
}

interface PlayerData {
  name: string;
  class: string;
  road?: string;
  data?: string;
}

interface GameData {
  name: string;
  players: PlayerData[][];
}

class AthleteSearchService {
  private athletes: Athlete[] = [];
  private isLoaded = false;

  async loadAthletes(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // 模拟加载所有运动员数据
      // 在实际应用中，这里会从API或文件系统加载
      this.athletes = await this.loadMockAthletes();
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load athletes:', error);
    }
  }

  private async loadMockAthletes(): Promise<Athlete[]> {
    try {
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

      const allAthletes: Athlete[] = [];

      for (const id of athleteFiles) {
        try {
          const gameData = await apiService.getPlayerList(id);
          
          // 从游戏数据中提取运动员信息
          gameData.players.forEach((group: any[], groupIndex: number) => {
            group.forEach((player: any) => {
              if (player.name && player.name.trim()) {
                // 从项目名称提取年级和性别信息
                const gameName = gameData.name;
                let grade = '未知';
                let gender = '未知';
                
                if (gameName.includes('高一')) grade = '高一';
                else if (gameName.includes('高二')) grade = '高二';
                else if (gameName.includes('高三')) grade = '高三';
                
                if (gameName.includes('男子')) gender = '男';
                else if (gameName.includes('女子')) gender = '女';
                
                // 从班级信息提取班级号
                let className = player.class || '未知班级';
                if (className === '' && player.name) {
                  // 如果没有班级信息，根据姓名和项目推测
                  className = `${grade}(?)班`;
                }

                allAthletes.push({
                  name: player.name,
                  class: className,
                  gameName: gameData.name,
                  gameLink: `/game/${id}`,
                  group: (groupIndex + 1).toString()
                });
              }
            });
          });
        } catch (error) {
          console.error(`加载运动员文件失败: ${id}`, error);
        }
      }

      return allAthletes;
    } catch (error) {
      console.error('加载运动员数据失败:', error);
      // 如果加载失败，返回空数组而不是硬编码数据
      return [];
    }
  }

  searchAthletes(query: string): Athlete[] {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return this.athletes.filter(athlete => 
      athlete.name.toLowerCase().includes(searchTerm) ||
      athlete.class.toLowerCase().includes(searchTerm)
    );
  }

  getAthleteByName(name: string): Athlete | null {
    return this.athletes.find(athlete => athlete.name === name) || null;
  }
}

export const athleteSearchService = new AthleteSearchService();