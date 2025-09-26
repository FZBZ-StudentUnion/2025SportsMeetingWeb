import React, { useState, useEffect } from 'react';
import { getSportsData, saveSportsData } from '../../services/api';
import { LoginForm } from '../../components/common';
import './PlayerEditor.css';

interface Player {
  road: string;
  name: string;
  data: string;
  class: string;
}

interface PlayerGroup {
  name: string;
  players: Player[][];
}

interface SportsData {
  games: { [key: string]: any[][] };
  players: { [key: string]: PlayerGroup };
}

const PlayerEditorPage: React.FC = () => {
  const [sportsData, setSportsData] = useState<SportsData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<{ groupKey: string; roadIndex: number; playerIndex: number } | null>(null);
  const [editForm, setEditForm] = useState({ road: '', name: '', data: '', class: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // 检查是否已经登录
    const authStatus = sessionStorage.getItem('playerEditorAuth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    // 验证用户名和密码
    if (username === 'fzbz' && password === 'fzbzstunion@883561') {
      setIsAuthenticated(true);
      setLoginError('');
      sessionStorage.setItem('playerEditorAuth', 'authenticated');
      loadData();
    } else {
      setLoginError('用户名或密码错误');
    }
  };

  const loadData = async () => {
    try {
      const data = await getSportsData();
      setSportsData(data);
      if (data.players && Object.keys(data.players).length > 0) {
        setSelectedGroup(Object.keys(data.players)[0]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    if (!sportsData) return;
    
    try {
      await saveSportsData(sportsData);
      alert('数据保存成功！');
    } catch (error) {
      console.error('保存数据失败:', error);
      alert('保存数据失败，请重试');
    }
  };

  const handleEditPlayer = (groupKey: string, roadIndex: number, playerIndex: number, player: Player) => {
    setEditingPlayer({ groupKey, roadIndex, playerIndex });
    setEditForm({
      road: player.road,
      name: player.name,
      data: player.data,
      class: player.class
    });
  };

  const handleSaveEdit = () => {
    if (!sportsData || !editingPlayer) return;

    const newData = { ...sportsData };
    const group = newData.players[editingPlayer.groupKey];
    if (group && group.players[editingPlayer.roadIndex]) {
      group.players[editingPlayer.roadIndex][editingPlayer.playerIndex] = {
        road: editForm.road,
        name: editForm.name,
        data: editForm.data,
        class: editForm.class
      };
      setSportsData(newData);
      setEditingPlayer(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setEditForm({ road: '', name: '', data: '', class: '' });
  };

  const addPlayer = (groupKey: string, roadIndex: number) => {
    if (!sportsData) return;

    const newData = { ...sportsData };
    const group = newData.players[groupKey];
    if (group) {
      if (!group.players[roadIndex]) {
        group.players[roadIndex] = [];
      }
      
      const newPlayer: Player = {
        road: String(group.players[roadIndex].length + 1),
        name: '新选手',
        data: '-',
        class: '班级'
      };
      
      group.players[roadIndex].push(newPlayer);
      setSportsData(newData);
    }
  };

  const removePlayer = (groupKey: string, roadIndex: number, playerIndex: number) => {
    if (!sportsData) return;

    const newData = { ...sportsData };
    const group = newData.players[groupKey];
    if (group && group.players[roadIndex]) {
      group.players[roadIndex].splice(playerIndex, 1);
      // 重新编号跑道
      group.players[roadIndex].forEach((player, index) => {
        player.road = String(index + 1);
      });
      setSportsData(newData);
    }
  };

  const addRoadGroup = (groupKey: string) => {
    if (!sportsData) return;

    const newData = { ...sportsData };
    const group = newData.players[groupKey];
    if (group) {
      group.players.push([]);
      setSportsData(newData);
    }
  };

  const removeRoadGroup = (groupKey: string, roadIndex: number) => {
    if (!sportsData) return;

    const newData = { ...sportsData };
    const group = newData.players[groupKey];
    if (group && group.players.length > 1) {
      group.players.splice(roadIndex, 1);
      setSportsData(newData);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('playerEditorAuth');
    setSportsData(null);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  if (loading) {
    return <div className="player-editor-loading">加载中...</div>;
  }

  if (!sportsData) {
    return <div className="player-editor-error">数据加载失败</div>;
  }

  const playerGroups = sportsData.players || {};
  const currentGroup = playerGroups[selectedGroup];

  return (
    <div className="player-editor-container">
      <div className="player-editor-header">
        <h1>项目人员编辑器</h1>
        <div className="header-actions">
          <button className="save-btn" onClick={saveData}>
            保存数据
          </button>
          <a href="/" className="back-btn">返回主页</a>
          <button className="logout-btn" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </div>

      <div className="player-editor-content">
        <div className="group-selector">
          <h3>选择项目组</h3>
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="group-select"
          >
            {Object.keys(playerGroups).map(groupKey => (
              <option key={groupKey} value={groupKey}>
                {playerGroups[groupKey].name}
              </option>
            ))}
          </select>
        </div>

        {currentGroup && (
          <div className="group-content">
            <div className="group-header">
              <h2>{currentGroup.name}</h2>
              <button 
                className="add-road-btn"
                onClick={() => addRoadGroup(selectedGroup)}
              >
                + 添加跑道组
              </button>
            </div>

            <div className="roads-container">
              {currentGroup.players.map((roadGroup, roadIndex) => (
                <div key={roadIndex} className="road-group">
                  <div className="road-header">
                    <h4>跑道组 {roadIndex + 1}</h4>
                    <div className="road-actions">
                      <button 
                        className="add-player-btn"
                        onClick={() => addPlayer(selectedGroup, roadIndex)}
                      >
                        + 添加选手
                      </button>
                      {currentGroup.players.length > 1 && (
                        <button 
                          className="remove-road-btn"
                          onClick={() => removeRoadGroup(selectedGroup, roadIndex)}
                        >
                          删除组
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="players-list">
                    {roadGroup.map((player, playerIndex) => (
                      <div key={playerIndex} className="player-card">
                        {editingPlayer && 
                         editingPlayer.groupKey === selectedGroup &&
                         editingPlayer.roadIndex === roadIndex &&
                         editingPlayer.playerIndex === playerIndex ? (
                          <div className="edit-form">
                            <div className="form-row">
                              <label>跑道:</label>
                              <input
                                type="text"
                                value={editForm.road}
                                onChange={(e) => setEditForm({...editForm, road: e.target.value})}
                                className="form-input"
                              />
                            </div>
                            <div className="form-row">
                              <label>姓名:</label>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="form-input"
                              />
                            </div>
                            <div className="form-row">
                              <label>成绩:</label>
                              <input
                                type="text"
                                value={editForm.data}
                                onChange={(e) => setEditForm({...editForm, data: e.target.value})}
                                className="form-input"
                              />
                            </div>
                            <div className="form-row">
                              <label>班级:</label>
                              <input
                                type="text"
                                value={editForm.class}
                                onChange={(e) => setEditForm({...editForm, class: e.target.value})}
                                className="form-input"
                              />
                            </div>
                            <div className="form-actions">
                              <button onClick={handleSaveEdit} className="save-edit-btn">保存</button>
                              <button onClick={handleCancelEdit} className="cancel-edit-btn">取消</button>
                            </div>
                          </div>
                        ) : (
                          <div className="player-info">
                            <div className="player-field">
                              <span className="field-label">跑道:</span>
                              <span className="field-value">{player.road}</span>
                            </div>
                            <div className="player-field">
                              <span className="field-label">姓名:</span>
                              <span className="field-value">{player.name}</span>
                            </div>
                            <div className="player-field">
                              <span className="field-label">成绩:</span>
                              <span className="field-value">{player.data}</span>
                            </div>
                            <div className="player-field">
                              <span className="field-label">班级:</span>
                              <span className="field-value">{player.class}</span>
                            </div>
                            <div className="player-actions">
                              <button 
                                onClick={() => handleEditPlayer(selectedGroup, roadIndex, playerIndex, player)}
                                className="edit-btn"
                              >
                                编辑
                              </button>
                              <button 
                                onClick={() => removePlayer(selectedGroup, roadIndex, playerIndex)}
                                className="remove-btn"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerEditorPage;