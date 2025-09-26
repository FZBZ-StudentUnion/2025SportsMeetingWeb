import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

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
  const { state } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // 从全局状态获取运动员数据
    if (state.gameSchedule) {
      const athletesMap = new Map();
      
      // 获取所有比赛项目
      const allGames = [
        ...state.gameSchedule.track.morning,
        ...state.gameSchedule.track.afternoon,
        ...state.gameSchedule.field.morning,
        ...state.gameSchedule.field.afternoon
      ];
      
      // 遍历所有比赛项目，从playerList中获取对应的运动员数据
      allGames.forEach(game => {
        // 构造比赛名称key，用于在playerList中查找
        const gameKey = game.name;
        
        if (state.playerList && (state.playerList as any)[gameKey] && (state.playerList as any)[gameKey].players) {
          const playerData = (state.playerList as any)[gameKey];
          
          // 遍历所有分组
          playerData.players.forEach((playerGroup: any[]) => {
            playerGroup.forEach(player => {
              if (player.name) {
                const key = `${player.name}-${player.class}`;
                if (!athletesMap.has(key)) {
                  athletesMap.set(key, {
                    name: player.name,
                    className: player.class,
                    events: [],
                    gameLinks: []
                  });
                }
                const athlete = athletesMap.get(key);
                athlete.events.push(game.name);
                athlete.gameLinks.push(`/games?name=${encodeURIComponent(game.name)}&grade=${encodeURIComponent(game.grade)}&time=${encodeURIComponent(game.time)}`);
              }
            });
          });
        }
      });

      const athletes = Array.from(athletesMap.values());
      setAllAthletes(athletes);
    }
  }, [state.gameSchedule, state.playerList]);

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
      navigate(athlete.gameLinks[gameIndex]);
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