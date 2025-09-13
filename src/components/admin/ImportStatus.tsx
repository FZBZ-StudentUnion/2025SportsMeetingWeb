import React from 'react';
import { useExcelImport } from '../../contexts/ExcelImportContext';
import { importToSystem } from '../../services/importService';

export const ImportStatus: React.FC = () => {
  const { state, dispatch } = useExcelImport();
  const { gamesData, athletesData, scheduleData, loading, error, success } = state;

  const hasData = gamesData.length > 0 || athletesData.length > 0 || scheduleData.length > 0;

  const handleImport = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      let result;
      if (gamesData.length > 0) {
        result = await importToSystem(gamesData, 'games');
      } else if (athletesData.length > 0) {
        result = await importToSystem(athletesData, 'athletes');
      } else if (scheduleData.length > 0) {
        result = await importToSystem(scheduleData, 'schedule');
      }

      if (result?.success) {
        dispatch({ type: 'SET_SUCCESS', payload: `成功导入 ${result.count} 条数据` });
        // 清空数据
        setTimeout(() => {
          dispatch({ type: 'CLEAR_DATA' });
        }, 3000);
      } else {
        throw new Error(result?.error || '导入失败');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '导入失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  return (
    <div className="import-section">
      <h2>导入操作</h2>
      
      {error && (
        <div className="error-message">
          <strong>错误：</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <strong>成功：</strong> {success}
        </div>
      )}

      {hasData && (
        <div className="import-actions">
          <button 
            onClick={handleImport}
            disabled={loading}
            className="import-button"
          >
            {loading ? '导入中...' : '确认导入'}
          </button>
          
          <button 
            onClick={handleClear}
            disabled={loading}
            className="clear-button"
          >
            清空数据
          </button>
        </div>
      )}

      <div className="import-info">
        <h3>导入说明：</h3>
        <ul>
          <li>请确保Excel文件格式与模板一致</li>
          <li>导入前请仔细核对数据预览</li>
          <li>导入操作会覆盖现有同类型数据</li>
          <li>建议先备份现有数据再进行导入</li>
        </ul>
      </div>
    </div>
  );
};