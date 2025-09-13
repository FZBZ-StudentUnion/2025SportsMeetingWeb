import React from 'react';
import { useExcelImport } from '../../contexts/ExcelImportContext';

interface DataPreviewProps {
  type: 'games' | 'athletes' | 'schedule';
}

export const DataPreview: React.FC<DataPreviewProps> = ({ type }) => {
  const { state } = useExcelImport();
  const { gamesData, athletesData, scheduleData, validationErrors } = state;

  const getCurrentData = () => {
    switch (type) {
      case 'games':
        return gamesData;
      case 'athletes':
        return athletesData;
      case 'schedule':
        return scheduleData;
      default:
        return [];
    }
  };

  const data = getCurrentData();

  if (state.loading) {
    return (
      <div className="preview-section">
        <h2>数据预览</h2>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="preview-section">
        <h2>数据预览</h2>
        <div className="error-message">{state.error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="preview-section">
        <h2>数据预览</h2>
        <div className="no-data">暂无数据，请上传Excel文件</div>
      </div>
    );
  }

  const renderTableHeaders = () => {
    switch (type) {
      case 'games':
        return (
          <tr>
            <th>项目名称</th>
            <th>年级</th>
            <th>类型</th>
            <th>参赛人数</th>
          </tr>
        );
      case 'athletes':
        return (
          <tr>
            <th>姓名</th>
            <th>班级</th>
            <th>年级</th>
            <th>参赛项目</th>
          </tr>
        );
      case 'schedule':
        return (
          <tr>
            <th>项目ID</th>
            <th>项目名称</th>
            <th>日期</th>
            <th>时间</th>
            <th>地点</th>
            <th>轮次</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return data.slice(0, 10).map((item: any, index) => {
      switch (type) {
        case 'games':
          return (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.grade}</td>
              <td>{item.type === 'track' ? '径赛' : '田赛'}</td>
              <td>{item.participants}</td>
            </tr>
          );
        case 'athletes':
          return (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.class}</td>
              <td>{item.grade}</td>
              <td>{item.events.join(', ')}</td>
            </tr>
          );
        case 'schedule':
          return (
            <tr key={item.eventId}>
              <td>{item.eventId}</td>
              <td>{item.eventName}</td>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>{item.location}</td>
              <td>{item.round}</td>
            </tr>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="preview-section">
      <h2>数据预览 {data.length > 10 && `(显示前10条，共${data.length}条)`}</h2>
      
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>验证错误：</h3>
          {validationErrors.map((error, index) => (
            <div key={index} className="validation-error">{error}</div>
          ))}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            {renderTableHeaders()}
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      </div>

      {data.length > 10 && (
        <div className="preview-note">
          <small>预览仅显示前10条数据，完整数据将在导入后生效</small>
        </div>
      )}
    </div>
  );
};