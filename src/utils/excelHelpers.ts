// 类型导入用于类型检查
import type { GameData, AthleteData, ScheduleData } from '../contexts/ExcelImportContext';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateExcelData = (data: any[], type: string): ValidationResult => {
  const errors: string[] = [];

  if (!Array.isArray(data) || data.length === 0) {
    return {
      isValid: false,
      errors: ['数据为空或格式不正确']
    };
  }

  switch (type) {
    case 'games':
      return validateGamesData(data);
    case 'athletes':
      return validateAthletesData(data);
    case 'schedule':
      return validateScheduleData(data);
    default:
      return {
        isValid: false,
        errors: ['未知的数据类型']
      };
  }
};

const validateGamesData = (data: any[]): ValidationResult => {
  const errors: string[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // Excel行号从2开始

    if (!row['项目名称'] || typeof row['项目名称'] !== 'string' || row['项目名称'].trim() === '') {
      errors.push(`第${rowNum}行：项目名称不能为空`);
    }

    if (!row['年级'] || typeof row['年级'] !== 'string' || row['年级'].trim() === '') {
      errors.push(`第${rowNum}行：年级不能为空`);
    }

    const validTypes = ['径赛', '田赛', 'track', 'field'];
    if (!row['类型(径赛/田赛)'] || !validTypes.includes(row['类型(径赛/田赛)'])) {
      errors.push(`第${rowNum}行：类型必须是"径赛"或"田赛"`);
    }

    const participants = parseInt(row['参赛人数']);
    if (isNaN(participants) || participants <= 0) {
      errors.push(`第${rowNum}行：参赛人数必须是正整数`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateAthletesData = (data: any[]): ValidationResult => {
  const errors: string[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;

    if (!row['姓名'] || typeof row['姓名'] !== 'string' || row['姓名'].trim() === '') {
      errors.push(`第${rowNum}行：姓名不能为空`);
    }

    if (!row['班级'] || typeof row['班级'] !== 'string' || row['班级'].trim() === '') {
      errors.push(`第${rowNum}行：班级不能为空`);
    }

    if (!row['年级'] || typeof row['年级'] !== 'string' || row['年级'].trim() === '') {
      errors.push(`第${rowNum}行：年级不能为空`);
    }

    if (row['参赛项目'] && typeof row['参赛项目'] === 'string') {
      const events = row['参赛项目'].split(',').map((e: string) => e.trim());
      if (events.some((e: string) => e === '')) {
        errors.push(`第${rowNum}行：参赛项目格式不正确，请用逗号分隔`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateScheduleData = (data: any[]): ValidationResult => {
  const errors: string[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;

    if (!row['项目ID'] || typeof row['项目ID'] !== 'string' || row['项目ID'].trim() === '') {
      errors.push(`第${rowNum}行：项目ID不能为空`);
    }

    if (!row['项目名称'] || typeof row['项目名称'] !== 'string' || row['项目名称'].trim() === '') {
      errors.push(`第${rowNum}行：项目名称不能为空`);
    }

    if (!row['日期'] || typeof row['日期'] !== 'string' || row['日期'].trim() === '') {
      errors.push(`第${rowNum}行：日期不能为空`);
    } else {
      // 验证日期格式
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(row['日期'])) {
        errors.push(`第${rowNum}行：日期格式应为YYYY-MM-DD`);
      }
    }

    if (!row['时间'] || typeof row['时间'] !== 'string' || row['时间'].trim() === '') {
      errors.push(`第${rowNum}行：时间不能为空`);
    }

    if (!row['地点'] || typeof row['地点'] !== 'string' || row['地点'].trim() === '') {
      errors.push(`第${rowNum}行：地点不能为空`);
    }

    if (!row['轮次'] || typeof row['轮次'] !== 'string' || row['轮次'].trim() === '') {
      errors.push(`第${rowNum}行：轮次不能为空`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateGameId = (name: string, grade: string): string => {
  const cleanName = name.replace(/[^\w]/g, '').toLowerCase();
  const cleanGrade = grade.replace(/[^\w]/g, '').toLowerCase();
  return `${cleanGrade}_${cleanName}`;
};

export const generateAthleteId = (name: string, className: string): string => {
  const cleanName = name.replace(/[^\w]/g, '').toLowerCase();
  const cleanClass = className.replace(/[^\w]/g, '').toLowerCase();
  return `${cleanClass}_${cleanName}`;
};

export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTimeForDisplay = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? '下午' : '上午';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${period}${displayHour}:${minutes}`;
};