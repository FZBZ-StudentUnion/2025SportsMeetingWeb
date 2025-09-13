import React, { useState } from 'react';
import { useExcelImport } from '../../contexts/ExcelImportContext';
import { ExcelUploader } from './ExcelUploader';
import { DataPreview } from './DataPreview';
import { ImportStatus } from './ImportStatus';
import { validateExcelData } from '../../utils/excelHelpers';
import { importToSystem } from '../../services/importService';
import './UnifiedExcelImporter.css';

interface UnifiedExcelImporterProps {
  onImportComplete?: () => void;
}

export const UnifiedExcelImporter: React.FC<UnifiedExcelImporterProps> = ({ onImportComplete }) => {
  const [activeType, setActiveType] = useState<'games' | 'athletes' | 'schedule'>('games');
  const [showTemplateSection, setShowTemplateSection] = useState(false);
  
  const {
    state,
    dispatch
  } = useExcelImport();

  const excelData = activeType === 'games' ? state.gamesData :
                   activeType === 'athletes' ? state.athletesData :
                   state.scheduleData;
  const importStatus = state.importStatus;

  const setImportStatus = (status: 'idle' | 'loading' | 'success' | 'error') => {
    dispatch({ type: 'SET_IMPORT_STATUS', payload: status });
  };

  const setImportErrors = (errors: string[]) => {
    dispatch({ type: 'SET_IMPORT_ERRORS', payload: errors });
  };

  const resetImport = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  const handleTypeChange = (type: 'games' | 'athletes' | 'schedule') => {
    setActiveType(type);
    resetImport();
  };

  const handleImport = async () => {
    if (!excelData || excelData.length === 0) {
      setImportErrors(['请先上传数据文件']);
      return;
    }

    setImportStatus('loading');
    setImportErrors([]);

    try {
      const validation = validateExcelData(excelData, activeType);
      if (!validation.isValid) {
        setImportErrors(validation.errors);
        setImportStatus('error');
        return;
      }

      const result = await importToSystem(excelData as any, activeType);
      
      if (result.success) {
        setImportStatus('success');
        if (onImportComplete) {
          onImportComplete();
        }
        
        // 3秒后重置状态
        setTimeout(() => {
          resetImport();
        }, 3000);
      } else {
        setImportErrors([result.error || '导入失败，请重试']);
        setImportStatus('error');
      }
    } catch (error) {
      setImportErrors([error instanceof Error ? error.message : '导入过程发生错误']);
      setImportStatus('error');
    }
  };

  const getTemplateInfo = () => {
    switch (activeType) {
      case 'games':
        return {
          title: '比赛项目数据模板',
          description: '包含项目名称、类型、组别、人数限制等信息',
          templateFile: 'games_template.xlsx'
        };
      case 'athletes':
        return {
          title: '运动员信息模板',
          description: '包含姓名、班级、性别、参赛项目等信息',
          templateFile: 'athletes_template.xlsx'
        };
      case 'schedule':
        return {
          title: '比赛时间安排模板',
          description: '包含项目、时间、场地、轮次等信息',
          templateFile: 'schedule_template.xlsx'
        };
    }
  };

  const templateInfo = getTemplateInfo();

  return (
    <div className="unified-importer">
      <div className="importer-header">
        <h2>运动会数据统一导入系统</h2>
        <p>支持比赛项目、运动员信息、比赛时间安排的批量导入</p>
      </div>

      <div className="type-selector">
        <div className="type-cards">
          <div 
            className={`type-card ${activeType === 'games' ? 'active' : ''}`}
            onClick={() => handleTypeChange('games')}
          >
            <div className="type-icon">🏆</div>
            <h3>比赛项目</h3>
            <p>导入田径、球类等比赛项目信息</p>
          </div>
          
          <div 
            className={`type-card ${activeType === 'athletes' ? 'active' : ''}`}
            onClick={() => handleTypeChange('athletes')}
          >
            <div className="type-icon">👥</div>
            <h3>运动员信息</h3>
            <p>导入参赛运动员的详细信息</p>
          </div>
          
          <div 
            className={`type-card ${activeType === 'schedule' ? 'active' : ''}`}
            onClick={() => handleTypeChange('schedule')}
          >
            <div className="type-icon">📅</div>
            <h3>比赛时间安排</h3>
            <p>导入各项比赛的时间安排</p>
          </div>
        </div>
      </div>

      <div className="import-workflow">
        <div className="workflow-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>下载模板</h4>
            <p>获取标准格式的Excel模板</p>
            <button 
              className="template-btn"
              onClick={() => setShowTemplateSection(!showTemplateSection)}
            >
              {showTemplateSection ? '隐藏模板' : '显示模板'}
            </button>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h4>填写数据</h4>
            <p>按照模板要求填写数据</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h4>上传文件</h4>
            <p>上传填写好的Excel文件</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h4>确认导入</h4>
            <p>预览并确认导入数据</p>
          </div>
        </div>
      </div>

      {showTemplateSection && (
        <div className="template-section">
          <h3>{templateInfo.title}</h3>
          <p>{templateInfo.description}</p>
          <div className="template-actions">
            <button 
              className="download-template-btn"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `/templates/${templateInfo.templateFile}`;
                link.download = templateInfo.templateFile;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              📥 下载{templateInfo.title}
            </button>
            <button 
              className="download-example-btn"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `/templates/示例数据-${activeType === 'games' ? '比赛项目' : activeType === 'athletes' ? '运动员' : '时间安排'}.xlsx`;
                link.download = `示例数据.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              📋 下载示例数据
            </button>
          </div>
        </div>
      )}

      <div className="upload-section">
        <ExcelUploader type={activeType} />
      </div>

      {excelData && excelData.length > 0 && (
        <div className="preview-section">
          <h3>数据预览</h3>
          <DataPreview type={activeType} />
          
          <div className="import-actions">
            <button 
              className="import-btn"
              onClick={handleImport}
              disabled={importStatus === 'loading' || !excelData || excelData.length === 0}
            >
              {importStatus === 'loading' ? '导入中...' : '确认导入'}
            </button>
            <button 
              className="reset-btn"
              onClick={resetImport}
              disabled={importStatus === 'loading'}
            >
              重新导入
            </button>
          </div>
        </div>
      )}

      <ImportStatus />
    </div>
  );
};