import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { useExcelImport } from '../../contexts/ExcelImportContext';
import { validateExcelData } from '../../utils/excelHelpers';

interface ExcelUploaderProps {
  type: 'games' | 'athletes' | 'schedule';
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ type }) => {
  const { dispatch } = useExcelImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTemplateHeaders = () => {
    switch (type) {
      case 'games':
        return ['项目名称', '年级', '类型(径赛/田赛)', '参赛人数'];
      case 'athletes':
        return ['姓名', '班级', '年级', '参赛项目'];
      case 'schedule':
        return ['项目ID', '项目名称', '日期', '时间', '地点', '轮次'];
      default:
        return [];
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });
    dispatch({ type: 'SET_CURRENT_FILE', payload: file });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        throw new Error('Excel文件为空');
      }

      const headers = jsonData[0] as string[];
      const expectedHeaders = getTemplateHeaders();
      
      // 验证表头
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`缺少必要的列: ${missingHeaders.join(', ')}`);
      }

      const rows = jsonData.slice(1) as any[][];
      const parsedData = rows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      }).filter(row => Object.values(row).some(value => value !== null && value !== undefined && value !== ''));

      // 验证数据
      const { isValid, errors } = validateExcelData(parsedData, type);
      if (!isValid) {
        dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
        return;
      }

      // 根据类型设置数据
      switch (type) {
        case 'games':
          const gamesData = parsedData.map((row, index) => ({
            id: `game_${Date.now()}_${index}`,
            name: row['项目名称'],
            grade: row['年级'],
            type: row['类型(径赛/田赛)'] === '田赛' ? 'field' as const : 'track' as const,
            participants: parseInt(row['参赛人数']) || 0,
          }));
          dispatch({ type: 'SET_GAMES_DATA', payload: gamesData });
          break;

        case 'athletes':
          const athletesData = parsedData.map((row, index) => ({
            id: `athlete_${Date.now()}_${index}`,
            name: row['姓名'],
            class: row['班级'],
            grade: row['年级'],
            events: row['参赛项目'] ? row['参赛项目'].split(',').map((e: string) => e.trim()) : [],
          }));
          dispatch({ type: 'SET_ATHLETES_DATA', payload: athletesData });
          break;

        case 'schedule':
          const scheduleData = parsedData.map((row, index) => ({
            eventId: row['项目ID'],
            eventName: row['项目名称'],
            date: row['日期'],
            time: row['时间'],
            location: row['地点'],
            round: row['轮次'],
          }));
          dispatch({ type: 'SET_SCHEDULE_DATA', payload: scheduleData });
          break;
      }

      dispatch({ type: 'SET_SUCCESS', payload: `成功解析 ${parsedData.length} 条数据` });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '解析Excel文件失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const downloadTemplate = () => {
    const headers = getTemplateHeaders();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '模板');
    
    const filename = `${type}_template.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="upload-section">
      <h2>上传Excel文件</h2>
      <div className="template-actions">
        <button onClick={downloadTemplate} className="template-button">
          下载模板
        </button>
      </div>
      
      <div className="file-input-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
        />
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <p>点击或拖拽上传Excel文件</p>
          <small>支持 .xlsx 和 .xls 格式</small>
        </div>
      </div>
    </div>
  );
};