import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

const GamePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const id = searchParams.get('id');
  const { state, actions } = useAppContext();

  useEffect(() => {
    if (id) {
      actions.loadPlayerList(id);
    }
    setMounted(true);
  }, [id, actions]);

  if (!id) {
    return (
      <div className="game-page">
        <Header />
        <main className="main-content">
          <ErrorMessage message="无效的赛事ID" />
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
            onRetry={() => actions.loadPlayerList(id)}
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

  const getGradeName = (name: string): string => {
    if (name.length >= 2) {
      return name.slice(0, 2) + '年段';
    }
    return name;
  };

  const getEventName = (name: string): string => {
    return name.slice(2) || name;
  };

  const isTrackEvent = (id: string): boolean => {
    // 根据ID判断是否为径赛项目
    const idNum = parseInt(id);
    return idNum >= 20019 && idNum <= 21006;
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
          <Link to="/" className="back-button-top animate-fadeInRight">
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
                isTrackEvent={isTrackEvent(id)}
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