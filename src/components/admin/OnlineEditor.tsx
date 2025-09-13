import React, { useState } from 'react';
import { useOnlineEditor } from '../../contexts/OnlineEditorContext';
import './OnlineEditor.css';

const OnlineEditor: React.FC = () => {
  const { state, dispatch } = useOnlineEditor();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterGender, setFilterGender] = useState('all');

  // 标签页配置
  const tabs = [
    { key: 'games', label: '比赛项目', icon: '🏆' },
    { key: 'athletes', label: '运动员', icon: '👥' },
    { key: 'schedules', label: '时间安排', icon: '📅' },
  ];

  const handleTabChange = (tab: 'games' | 'athletes' | 'schedules') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const handleAddNew = () => {
    dispatch({ type: 'SET_EDITING_ITEM', payload: null });
    dispatch({ type: 'SET_MODAL_OPEN', payload: true });
  };

  const handleEdit = (item: any) => {
    dispatch({ type: 'SET_EDITING_ITEM', payload: item });
    dispatch({ type: 'SET_MODAL_OPEN', payload: true });
  };

  const handleDelete = (id: string, type: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      switch (type) {
        case 'games':
          dispatch({ type: 'DELETE_GAME', payload: id });
          break;
        case 'athletes':
          dispatch({ type: 'DELETE_ATHLETE', payload: id });
          break;
        case 'schedules':
          dispatch({ type: 'DELETE_SCHEDULE', payload: id });
          break;
      }
    }
  };

  // 过滤数据
  const getFilteredData = () => {
    let data: any[] = [];
    
    switch (state.activeTab) {
      case 'games':
        data = state.games;
        break;
      case 'athletes':
        data = state.athletes;
        break;
      case 'schedules':
        data = state.schedules;
        break;
    }

    // 搜索过滤
    if (searchTerm) {
      data = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        
        switch (state.activeTab) {
          case 'games':
            return item.name.toLowerCase().includes(searchLower) ||
                   item.grade.toLowerCase().includes(searchLower) ||
                   item.gender.toLowerCase().includes(searchLower);
          case 'athletes':
            return item.name.toLowerCase().includes(searchLower) ||
                   item.class.toLowerCase().includes(searchLower) ||
                   item.grade.toLowerCase().includes(searchLower) ||
                   item.gender.toLowerCase().includes(searchLower) ||
                   item.events.some((event: string) => event.toLowerCase().includes(searchLower));
          case 'schedules':
            return item.eventName.toLowerCase().includes(searchLower) ||
                   item.location.toLowerCase().includes(searchLower) ||
                   item.round.toLowerCase().includes(searchLower);
          default:
            return true;
        }
      });
    }

    // 年级过滤
    if (filterGrade !== 'all') {
      data = data.filter(item => item.grade === filterGrade);
    }

    // 性别过滤
    if (filterGender !== 'all') {
      data = data.filter(item => {
        if (state.activeTab === 'athletes') {
          return item.gender === filterGender;
        }
        if (state.activeTab === 'games') {
          return item.gender === filterGender;
        }
        if (state.activeTab === 'schedules') {
          // 日程表不区分性别，不过滤
          return true;
        }
        return false;
      });
    }

    return data;
  };

  const filteredData = getFilteredData();

  return (
    <div className="online-editor">
      <div className="editor-header">
        <h2>🏃‍♂️ 运动会在线管理系统</h2>
        <p>实时编辑和管理运动会数据，无需Excel导入</p>
      </div>

      {/* 标签页导航 */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-button ${state.activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key as any)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 操作栏 */}
      <div className="action-bar">
        <div className="search-section">
          <input
            type="text"
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有年级</option>
            <option value="高一">高一</option>
            <option value="高二">高二</option>
            <option value="高三">高三</option>
            <option value="混合">混合</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有性别</option>
            <option value="男子">男子</option>
            <option value="女子">女子</option>
            <option value="混合">混合</option>
          </select>
        </div>

        <button className="add-button" onClick={handleAddNew}>
          ➕ 添加新{state.activeTab === 'games' ? '项目' : 
                    state.activeTab === 'athletes' ? '运动员' : '时间安排'}
        </button>
        <button 
          className="clear-button" 
          onClick={() => {
            if (window.confirm('确定要清除所有本地数据吗？此操作不可恢复！')) {
              localStorage.removeItem('onlineEditor_games');
              localStorage.removeItem('onlineEditor_athletes');
              localStorage.removeItem('onlineEditor_schedules');
              window.location.reload();
            }
          }}
          style={{ marginLeft: '10px', background: '#dc3545' }}
        >
          🗑️ 清除所有数据
        </button>
      </div>

      {/* 数据统计 */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number">{state.games.length}</div>
          <div className="stat-label">比赛项目</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{state.athletes.length}</div>
          <div className="stat-label">运动员</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{state.schedules.length}</div>
          <div className="stat-label">时间安排</div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="data-table-container">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>暂无数据，点击"添加新"开始创建</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {state.activeTab === 'games' && (
                  <>
                    <th>项目名称</th>
                    <th>年级</th>
                    <th>性别</th>
                    <th>类型</th>
                    <th>参赛人数</th>
                    <th>状态</th>
                  </>
                )}
                {state.activeTab === 'athletes' && (
                  <>
                    <th>姓名</th>
                    <th>班级</th>
                    <th>年级</th>
                    <th>性别</th>
                    <th>参赛项目</th>
                    <th>联系电话</th>
                  </>
                )}
                {state.activeTab === 'schedules' && (
                  <>
                    <th>项目名称</th>
                    <th>日期</th>
                    <th>时间</th>
                    <th>地点</th>
                    <th>轮次</th>
                    <th>状态</th>
                  </>
                )}
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  {state.activeTab === 'games' && (
                    <>
                      <td>{item.name}</td>
                      <td>{item.grade}</td>
                      <td>{item.gender}</td>
                      <td>
                        <span className={`type-badge ${item.type === '径赛' ? 'track' : 'field'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td>{item.participants}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </td>
                    </>
                  )}
                  {state.activeTab === 'athletes' && (
                    <>
                      <td>{item.name}</td>
                      <td>{item.class}</td>
                      <td>{item.grade}</td>
                      <td>{item.gender}</td>
                      <td>{item.events.join(', ')}</td>
                      <td>{item.phone || '-'}</td>
                    </>
                  )}
                  {state.activeTab === 'schedules' && (
                    <>
                      <td>{item.eventName}</td>
                      <td>{item.date}</td>
                      <td>{item.startTime} - {item.endTime}</td>
                      <td>{item.location}</td>
                      <td>{item.round}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'scheduled' ? '已安排' : 
                           item.status === 'in_progress' ? '进行中' : 
                           item.status === 'completed' ? '已完成' : '已取消'}
                        </span>
                      </td>
                    </>
                  )}
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                    >
                      ✏️ 编辑
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(item.id, state.activeTab)}
                    >
                      🗑️ 删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OnlineEditor;