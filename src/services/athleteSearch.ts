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
    // 模拟数据 - 实际应用中会动态加载
    const mockAthletes: Athlete[] = [
      { name: '李宥熹', class: '高一(1)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '丘天', class: '高一(1)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '林柏喆', class: '高一(1)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '毛盾', class: '高一(1)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '张哲豪', class: '高一(1)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '陈哲锐', class: '高一(1)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '林琢程', class: '高一(2)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '王墨迪', class: '高一(2)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '吴博晗', class: '高一(2)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
      { name: '林焌豪', class: '高一(2)', gameName: '高一男子组 100米 预赛', gameLink: '/game/10001' },
    ];
    return mockAthletes;
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