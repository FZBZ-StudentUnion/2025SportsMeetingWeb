// 在线编辑系统的数据类型定义

export interface OnlineGameItem {
  id: string;
  name: string;
  grade: '高一' | '高二' | '高三' | '混合';
  gender: '男子' | '女子' | '混合';
  type: '径赛' | '田赛';
  participants: number;
  maxParticipants?: number;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface OnlineAthlete {
  id: string;
  name: string;
  class: string;
  grade: '高一' | '高二' | '高三';
  gender: '男' | '女';
  studentId: string;
  phone?: string;
  events: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface OnlineSchedule {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  round: '预赛' | '决赛' | '预决赛';
  groups?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnlineEditorState {
  games: OnlineGameItem[];
  athletes: OnlineAthlete[];
  schedules: OnlineSchedule[];
  loading: boolean;
  error: string | null;
  activeTab: 'games' | 'athletes' | 'schedules';
  editingItem: any | null;
  isModalOpen: boolean;
  searchQuery: string;
  filterGrade: string;
  filterGender: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SaveResult {
  success: boolean;
  errors?: ValidationError[];
  message?: string;
}