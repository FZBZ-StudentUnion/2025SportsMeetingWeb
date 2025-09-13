import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Athlete {
  name: string;
  className: string;
  events: string[];
  gameLinks: string[];
}

interface AthleteSearchProps {
  onSearch?: (query: string) => void;
  athletes?: Athlete[];
  className?: string;
}

export const AthleteSearch: React.FC<AthleteSearchProps> = ({
  onSearch,
  athletes = [],
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);

  useEffect(() => {
    // 从真实API加载运动员数据
    loadRealAthletes();
  }, []);

  const loadRealAthletes = async () => {
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

      // 使用apiService加载数据
      for (const id of athleteFiles) {
        try {
          const gameData = await apiService.getPlayerList(id);
          
          // 从游戏数据中提取运动员信息
          gameData.players.forEach((group: any[], groupIndex: number) => {
            group.forEach((player: any) => {
              if (player.name && player.name.trim()) {
                // 从项目名称提取年级和性别信息
                const gameName = gameData.name;
                let className = player.class || '未知班级';
                
                if (className === '' && player.name) {
                  // 如果没有班级信息，使用项目信息推测
                  if (gameName.includes('高一')) className = '高一(?)班';
                  else if (gameName.includes('高二')) className = '高二(?)班';
                  else if (gameName.includes('高三')) className = '高三(?)班';
                  else className = '未知班级';
                }

                allAthletes.push({
                  name: player.name,
                  className: className,
                  events: [gameData.name],
                  gameLinks: [`/games?id=${id}`]
                });
              }
            });
          });
        } catch (error) {
          console.error(`加载运动员文件失败: ${id}`, error);
        }
      }

      setAllAthletes(allAthletes);
    } catch (error) {
      console.error('加载运动员数据失败:', error);
      // 如果加载失败，使用空数组
      setAllAthletes([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
    setShowResults(value.length > 0);
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    onSearch?.('');
  };

  const handleAthleteClick = (athlete: Athlete, gameIndex: number = 0) => {
    // 跳转到对应的项目页面
    if (athlete.gameLinks[gameIndex]) {
      window.location.href = athlete.gameLinks[gameIndex];
    }
  };

  const athletesToSearch = athletes.length > 0 ? athletes : allAthletes;
  
  const filteredAthletes = athletesToSearch.filter(athlete =>
    athlete.name.toLowerCase().includes(query.toLowerCase()) ||
    athlete.className.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={`athlete-search ${className}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="搜索运动员姓名或班级..."
          className="search-input"
        />
        {query && (
          <button className="search-clear" onClick={handleClear}>
            ×
          </button>
        )}
      </div>
      
      {showResults && query && (
        <div className="search-results">
          {filteredAthletes.length > 0 ? (
            <ul className="athlete-list">
              {filteredAthletes.map((athlete, index) => (
                <li 
                  key={index} 
                  className="athlete-item animate-fadeIn"
                  onClick={() => handleAthleteClick(athlete)}
                >
                  <div className="athlete-info">
                    <span className="athlete-name">{athlete.name}</span>
                    <span className="athlete-class">{athlete.className}</span>
                  </div>
                  <div className="game-info">
                    <span className="game-name">{athlete.events[0]}</span>
                    <span className="go-to-game">→</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">未找到相关运动员</div>
          )}
        </div>
      )}
    </div>
  );
};