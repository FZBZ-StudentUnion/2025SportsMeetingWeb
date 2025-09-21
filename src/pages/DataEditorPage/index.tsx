import React, { useState, useEffect } from 'react';
import { getSportsData, saveSportsData } from '../../services/api';
import './DataEditor.css';

interface GameEvent {
  grade: string;
  name: string;
  time: string;
}

interface SportsData {
  games: {
    classMapping: any;
    players: any;
    [key: string]: any;
  };
}

const DataEditorPage: React.FC = () => {
  const [sportsData, setSportsData] = useState<SportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeDay, setActiveDay] = useState('第一天');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSportsData();
      setSportsData(data);
      setMessage('数据加载成功');
    } catch (error) {
      console.error('加载数据失败:', error);
      setMessage('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sportsData) return;
    
    try {
      setSaving(true);
      await saveSportsData(sportsData);
      setMessage('数据保存成功！文件已下载');
    } catch (error) {
      console.error('保存数据失败:', error);
      setMessage('数据保存失败');
    } finally {
      setSaving(false);
    }
  };

  const addEvent = (day: string, sessionIndex: number) => {
    if (!sportsData) return;
    
    const newEvent: GameEvent = {
      grade: '高一',
      name: '新比赛项目',
      time: '09:00'
    };

    const newData = { ...sportsData };
    if (!newData.games[day]) {
      newData.games[day] = [[], [], [], []]; // 径赛上午, 径赛下午, 田赛上午, 田赛下午
    }
    newData.games[day][sessionIndex].push(newEvent);
    setSportsData(newData);
  };

  const updateEvent = (day: string, sessionIndex: number, eventIndex: number, field: keyof GameEvent, value: string) => {
    if (!sportsData) return;
    
    const newData = { ...sportsData };
    newData.games[day][sessionIndex][eventIndex][field] = value;
    setSportsData(newData);
  };

  const deleteEvent = (day: string, sessionIndex: number, eventIndex: number) => {
    if (!sportsData) return;
    
    const newData = { ...sportsData };
    newData.games[day][sessionIndex].splice(eventIndex, 1);
    setSportsData(newData);
  };

  const addDay = () => {
    if (!sportsData) return;
    
    const dayNames = ['第一天', '第二天', '第三天', '第四天', '第五天'];
    const existingDays = Object.keys(sportsData.games).filter(key => key !== 'classMapping' && key !== 'players');
    const nextDay = dayNames[existingDays.length] || `第${existingDays.length + 1}天`;
    
    const newData = { ...sportsData };
    newData.games[nextDay] = [[], [], [], []]; // 径赛上午, 径赛下午, 田赛上午, 田赛下午
    setSportsData(newData);
    setActiveDay(nextDay);
  };

  if (loading) {
    return (
      <div className="data-editor">
        <div className="editor-header">
          <h1>数据编辑器</h1>
        </div>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!sportsData) {
    return (
      <div className="data-editor">
        <div className="editor-header">
          <h1>数据编辑器</h1>
        </div>
        <div className="error">无法加载数据</div>
      </div>
    );
  }

  const dayNames = Object.keys(sportsData.games).filter(key => key !== 'classMapping' && key !== 'players');
  const currentDayData: GameEvent[][] = sportsData.games[activeDay] || [[], [], [], []];

  return (
    <div className="data-editor">
      <div className="editor-header">
        <h1>运动会数据编辑器</h1>
        <div className="header-actions">
          <button onClick={handleSave} disabled={saving} className="save-button">
            {saving ? '保存中...' : '保存数据'}
          </button>
          <button onClick={addDay} className="add-day-button">
            添加比赛日
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="day-selector">
        {dayNames.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`day-tab ${activeDay === day ? 'active' : ''}`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="schedule-container">
        <div className="session-section">
          <h3>径赛 - 上午</h3>
          <div className="event-list">
            {currentDayData[0].map((event, index) => (
              <div key={index} className="event-item">
                <input
                  type="text"
                  value={event.grade}
                  onChange={(e) => updateEvent(activeDay, 0, index, 'grade', e.target.value)}
                  placeholder="年级"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => updateEvent(activeDay, 0, index, 'name', e.target.value)}
                  placeholder="项目名称"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => updateEvent(activeDay, 0, index, 'time', e.target.value)}
                  placeholder="时间"
                  className="event-input"
                />
                <button
                  onClick={() => deleteEvent(activeDay, 0, index)}
                  className="delete-button"
                >
                  删除
                </button>
              </div>
            ))}
            <button onClick={() => addEvent(activeDay, 0)} className="add-button">
              + 添加项目
            </button>
          </div>
        </div>

        <div className="session-section">
          <h3>径赛 - 下午</h3>
          <div className="event-list">
            {currentDayData[1].map((event, index) => (
              <div key={index} className="event-item">
                <input
                  type="text"
                  value={event.grade}
                  onChange={(e) => updateEvent(activeDay, 1, index, 'grade', e.target.value)}
                  placeholder="年级"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => updateEvent(activeDay, 1, index, 'name', e.target.value)}
                  placeholder="项目名称"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => updateEvent(activeDay, 1, index, 'time', e.target.value)}
                  placeholder="时间"
                  className="event-input"
                />
                <button
                  onClick={() => deleteEvent(activeDay, 1, index)}
                  className="delete-button"
                >
                  删除
                </button>
              </div>
            ))}
            <button onClick={() => addEvent(activeDay, 1)} className="add-button">
              + 添加项目
            </button>
          </div>
        </div>

        <div className="session-section">
          <h3>田赛 - 上午</h3>
          <div className="event-list">
            {currentDayData[2].map((event, index) => (
              <div key={index} className="event-item">
                <input
                  type="text"
                  value={event.grade}
                  onChange={(e) => updateEvent(activeDay, 2, index, 'grade', e.target.value)}
                  placeholder="年级"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => updateEvent(activeDay, 2, index, 'name', e.target.value)}
                  placeholder="项目名称"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => updateEvent(activeDay, 2, index, 'time', e.target.value)}
                  placeholder="时间"
                  className="event-input"
                />
                <button
                  onClick={() => deleteEvent(activeDay, 2, index)}
                  className="delete-button"
                >
                  删除
                </button>
              </div>
            ))}
            <button onClick={() => addEvent(activeDay, 2)} className="add-button">
              + 添加项目
            </button>
          </div>
        </div>

        <div className="session-section">
          <h3>田赛 - 下午</h3>
          <div className="event-list">
            {currentDayData[3].map((event, index) => (
              <div key={index} className="event-item">
                <input
                  type="text"
                  value={event.grade}
                  onChange={(e) => updateEvent(activeDay, 3, index, 'grade', e.target.value)}
                  placeholder="年级"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.name}
                  onChange={(e) => updateEvent(activeDay, 3, index, 'name', e.target.value)}
                  placeholder="项目名称"
                  className="event-input"
                />
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => updateEvent(activeDay, 3, index, 'time', e.target.value)}
                  placeholder="时间"
                  className="event-input"
                />
                <button
                  onClick={() => deleteEvent(activeDay, 3, index)}
                  className="delete-button"
                >
                  删除
                </button>
              </div>
            ))}
            <button onClick={() => addEvent(activeDay, 3)} className="add-button">
              + 添加项目
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEditorPage;