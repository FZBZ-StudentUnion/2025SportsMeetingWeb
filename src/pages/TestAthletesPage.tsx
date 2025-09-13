import React, { useState, useEffect } from 'react';

interface Athlete {
  name: string;
  className: string;
  events: string[];
  gameLinks: string[];
}

const TestAthletesPage: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      const athleteFiles = [
        '10001.json', '10002.json', '10003.json', '10004.json', '10005.json', '10006.json',
        '10007.json', '10008.json', '10009.json', '10010.json', '10011.json', '10012.json',
        '20001.json', '20002.json', '20003.json', '20004.json', '20005.json', '20006.json',
        '20007.json', '20008.json', '20009.json', '20010.json', '20011.json', '20012.json',
        '20013.json', '20014.json', '20015.json', '20016.json', '20017.json', '20018.json',
        '20019.json', '20020.json', '20021.json'
      ];

      const allAthletes: Athlete[] = [];

      for (const fileName of athleteFiles) {
        try {
          const response = await fetch(`http://localhost:3001/api/players/${fileName.replace('.json', '')}`);
          if (response.ok) {
            const gameData = await response.json();
            
            gameData.players.forEach((group: any[], groupIndex: number) => {
              group.forEach((player: any) => {
                if (player.name && player.name.trim()) {
                  let className = player.class || '未知班级';
                  if (className === '') {
                    className = '高一(?)班';
                  }

                  allAthletes.push({
                    name: player.name,
                    className: className,
                    events: [gameData.name],
                    gameLinks: [`/games?id=${fileName.replace('.json', '')}`]
                  });
                }
              });
            });
          }
        } catch (err) {
          console.error(`加载运动员文件失败: ${fileName}`, err);
        }
      }

      setAthletes(allAthletes);
      setLoading(false);
    } catch (err) {
      setError('加载运动员数据失败: ' + err);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>运动员数据测试页面</h1>
      
      {loading && <div>正在加载运动员数据...</div>}
      {error && <div style={{ color: 'red' }}>错误: {error}</div>}
      
      {!loading && !error && (
        <div>
          <h2>共找到 {athletes.length} 名运动员</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {athletes.map((athlete, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{athlete.name}</h3>
                <p><strong>班级:</strong> {athlete.className}</p>
                <p><strong>项目:</strong> {athlete.events[0]}</p>
                <p><strong>链接:</strong> <a href={athlete.gameLinks[0]}>{athlete.gameLinks[0]}</a></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAthletesPage;