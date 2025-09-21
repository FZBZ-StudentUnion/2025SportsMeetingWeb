import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { SearchBar } from '../../components/common/SearchBar';
import { AthleteSearch } from '../../components/common/AthleteSearch';

import { useQueryParams } from '../../hooks/useQueryParams';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { validateDay } from '../../utils/helpers';
import { DATE_CONFIG } from '../../utils/constants';

const GameListPage: React.FC = () => {
  const { getParam } = useQueryParams();
  const { state, actions } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [athleteQuery, setAthleteQuery] = useState('');
  
  const day = useMemo(() => {
    const dayParam = getParam('day');
    return validateDay(dayParam || '1');
  }, [getParam]);

  useEffect(() => {
    setMounted(true);
    actions.setCurrentDay(day);
    actions.loadGameSchedule(day);
  }, [day, actions]);



  const selectDay = (selectedDay: string) => {
    if (selectedDay !== day) {
      window.location.href = `/?day=${selectedDay}`;
    }
  };

  const getDateLabel = (day: string) => {
    return day === '2' ? DATE_CONFIG.DAY_2.label : DATE_CONFIG.DAY_1.label;
  };

  const filteredGames = useMemo(() => {
    if (!state.gameSchedule) return null;
    
    if (!searchQuery) return state.gameSchedule;
    
    const query = searchQuery.toLowerCase();
    const newSchedule = {
      track: {
        morning: state.gameSchedule.track.morning.filter(game => 
          game.name.toLowerCase().includes(query) || 
          game.grade.toLowerCase().includes(query)
        ),
        afternoon: state.gameSchedule.track.afternoon.filter(game => 
          game.name.toLowerCase().includes(query) || 
          game.grade.toLowerCase().includes(query)
        )
      },
      field: {
        morning: state.gameSchedule.field.morning.filter(game => 
          game.name.toLowerCase().includes(query) || 
          game.grade.toLowerCase().includes(query)
        ),
        afternoon: state.gameSchedule.field.afternoon.filter(game => 
          game.name.toLowerCase().includes(query) || 
          game.grade.toLowerCase().includes(query)
        )
      }
    };
    return newSchedule;
  }, [state.gameSchedule, searchQuery]);

  if (state.loading && !state.gameSchedule) {
    return (
      <div className="game-list-page">
        <Header />
        <main className="main-content">
          <LoadingSpinner size="large" message="正在加载赛程信息..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="game-list-page">
        <Header />
        <main className="main-content">
          <ErrorMessage 
            message={state.error} 
            onRetry={() => actions.loadGameSchedule(day)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="game-list-page">
      <Header />
      
      <main className="main-content">

        <div className="date-section">
          <span className="date-display txta zi">
            {getDateLabel(day)} 比赛项目
          </span>
          <div className="day-selector">
            <button 
              onClick={() => selectDay('1')}
              className={`day-button ${day === '1' ? 'active' : ''}`}
              disabled={day === '1'}
            >
              <span className="day-label zi">第一天</span>
            </button>
            <button 
              onClick={() => selectDay('2')}
              className={`day-button ${day === '2' ? 'active' : ''}`}
              disabled={day === '2'}
            >
              <span className="day-label zi">第二天</span>
            </button>
            <Link 
              to="/editor"
              className="editor-button hover-lift"
            >
              <span className="day-label zi">赛程编辑</span>
            </Link>
            <Link 
              to="/players"
              className="editor-button hover-lift"
              style={{ background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)' }}
            >
              <span className="day-label zi">人员编辑</span>
            </Link>
          </div>
        </div>

        <div className="search-section">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="搜索赛程项目或年级..."
            className="animate-fadeInDown"
          />
          <AthleteSearch 
            className="animate-fadeInDown"
          />
        </div>

        {state.gameSchedule && filteredGames && (
          <>
            <section className="game-section">
              <h2 className="section-title">径赛</h2>
              <GameTable 
                title="上午" 
                games={filteredGames.track.morning} 
              />
              <GameTable 
                title="下午" 
                games={filteredGames.track.afternoon} 
              />
            </section>

            <section className="game-section">
              <h2 className="section-title">田赛</h2>
              <GameTable 
                title="上午" 
                games={filteredGames.field.morning} 
              />
              <GameTable 
                title="下午" 
                games={filteredGames.field.afternoon} 
              />
            </section>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

interface GameTableProps {
  title: string;
  games: Array<{
    grade: string;
    name: string;
    time: string;
    link: string;
  }>;
}

const GameTable: React.FC<GameTableProps> = ({ title, games }) => {
  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div className="game-table-container animate-fadeInUp">
      <h3 className="period-title">{title}</h3>
      <table className="game-table">
        <thead>
          <tr>
            <th>年级</th>
            <th>项目</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr 
              key={`${title}-${index}`} 
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <td>{game.grade}</td>
              <td>{game.name}</td>
              <td>{game.time}</td>
              <td>
                <Link 
                  to={`/games?name=${encodeURIComponent(game.name)}&grade=${encodeURIComponent(game.grade)}&time=${encodeURIComponent(game.time)}`}
                  className="game-link hover-lift"
                >
                  查看详情
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameListPage;