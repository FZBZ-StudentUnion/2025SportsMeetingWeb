import React, { useState, useEffect } from 'react';

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
    // 加载真实的运动员数据
    loadRealAthletes();
  }, []);

  const loadRealAthletes = () => {
    // 基于真实数据的运动员映射
    const realAthletes: Athlete[] = [
      { name: '李宥熹', className: '高一(1)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '丘天', className: '高一(1)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '林柏喆', className: '高一(1)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '毛盾', className: '高一(1)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '张哲豪', className: '高一(1)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '陈哲锐', className: '高一(1)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '林琢程', className: '高一(2)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '王墨迪', className: '高一(2)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '吴博晗', className: '高一(2)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '林焌豪', className: '高一(2)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '黄家兴', className: '高一(2)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '程志滔', className: '高一(2)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '陈睿哲', className: '高一(3)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '林俊炜', className: '高一(3)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '张艺哲', className: '高一(3)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '刘凯烨', className: '高一(3)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '孙永昊', className: '高一(3)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
      { name: '卢隽祺', className: '高一(3)', events: ['高一男子组 100米 预赛'], gameLinks: ['/games?id=10001'] },
    ];
    setAllAthletes(realAthletes);
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