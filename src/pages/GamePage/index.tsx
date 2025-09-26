import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

const GamePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const name = searchParams.get('name');
  const grade = searchParams.get('grade');
  const time = searchParams.get('time');
  const { state, actions } = useAppContext();

  useEffect(() => {
    if (name && grade && time) {
      actions.loadPlayerListByName(name, grade, time);
    }
    setMounted(true);
  }, [name, grade, time, actions]);

  if (!name || !grade || !time) {
    return (
      <div className="game-page">
        <Header />
        <main className="main-content">
          <ErrorMessage message="无效的赛事参数" />
        </main>
        <Footer />
      </div>
    );
  }

  if (state.loading && !state.playerList) {
    return (
      <div className="game-page">
        <Header />
        <main className="main-content">
          <LoadingSpinner size="large" message="正在加载赛事详情..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="game-page">
        <Header />
        <main className="main-content">
          <ErrorMessage 
            message={state.error} 
            onRetry={() => actions.loadPlayerListByName(name!, grade!, time!)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!state.playerList) {
    return (
      <div className="game-page">
        <Header />
        <main className="main-content">
          <ErrorMessage message="未找到比赛信息" />
        </main>
        <Footer />
      </div>
    );
  }

  // 检查players数组是否存在且有效
  if (!state.playerList.players || !Array.isArray(state.playerList.players)) {
    return (
      <div className="game-page">
        <Header />
        <main className="main-content">
          <ErrorMessage message="未找到运动员数据" />
        </main>
        <Footer />
      </div>
    );
  }

  // 检查playerList的name属性是否存在
  if (!state.playerList.name) {
    return (
      <div className="game-page">
        <Header />
        <main className="main-content">
          <ErrorMessage message="比赛信息格式错误" />
        </main>
        <Footer />
      </div>
    );
  }

  const getGradeName = (name: string): string => {
    if (name.length >= 2) {
      return name.slice(0, 2) + '年段';
    }
    return name;
  };

  const getEventName = (name: string): string => {
    return name.slice(2) || name;
  };

  const isTrackEvent = (name: string): boolean => {
    // 根据项目名称判断是否为径赛项目
    return name.includes('100米') || name.includes('200米') || name.includes('400米') || 
           name.includes('800米') || name.includes('1500米') || name.includes('接力');
  };

  return (
    <div className="game-page">
      <Header />
      
      <main className="main-content">
        <div className="game-header animate-fadeInDown">
          <h1 className="game-title animate-fadeInLeft">
            <span className="grade-name">{getGradeName(state.playerList.name)}</span>
            <span className="event-name">{getEventName(state.playerList.name)}</span>
          </h1>
          <Link 
            to={location.state?.fromDay ? `/?day=${location.state.fromDay}` : '/'} 
            className="back-button-top animate-fadeInRight"
          >
            <span className="back-arrow">←</span>
            返回赛程列表
          </Link>
        </div>

        <div className={`game-content ${mounted ? 'animate-fadeInUp' : ''}`}>
          {state.playerList.players.map((group, groupIndex) => (
            <div key={groupIndex} className="player-group animate-fadeInUp" style={{animationDelay: `${groupIndex * 0.1}s`}}>
              <PlayerTable 
                players={group}
                classMapping={state.classMapping || {}}
                isTrackEvent={isTrackEvent(state.playerList!.name)}
              />
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

interface PlayerTableProps {
  players: Array<{
    road: string;
    name: string;
    data: string;
    class?: string;
  }>;
  classMapping: Record<string, string>;
  isTrackEvent: boolean;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ 
  players, 
  classMapping, 
  isTrackEvent 
}) => {
  // 检查players数组是否存在且有效
  if (!players || !Array.isArray(players)) {
    return (
      <div className="player-table-container animate-scaleIn">
        <div className="no-data-message">暂无运动员数据</div>
      </div>
    );
  }

  return (
    <div className="player-table-container animate-scaleIn">
      <table className="player-table">
        <thead className="animate-fadeIn">
          <tr>
            <th>{isTrackEvent ? '#' : '赛道'}</th>
            <th>{isTrackEvent ? '姓名' : '班级'}</th>
            <th>成绩</th>
            <th>班级</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index} className="animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
              <td>{player.road}</td>
              <td>{player.name === 'null' ? '-' : player.name}</td>
              <td>{player.data}</td>
              <td>{player.class || classMapping[player.name] || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GamePage;