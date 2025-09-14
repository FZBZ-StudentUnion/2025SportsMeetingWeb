// 统一运动会管理系统类型定义

export interface UnifiedEvent {
  id: string;
  name: string;
  grade: string;
  gender: '男子' | '女子' | '混合';
  type: '径赛' | '田赛';
  category: string;
  participantsCount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // 时间安排
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    round: '预赛' | '复赛' | '决赛' | '预决赛';
    order: number;
  };
  
  // 运动员信息
  athletes: UnifiedAthlete[];
  
  // 比赛结果
  results?: {
    winner?: string;
    records?: Record<string, string>;
    rankings?: Array<{
      rank: number;
      athleteId: string;
      athleteName: string;
      result: string;
      className: string;
    }>;
  };
  
  // 元数据
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    notes?: string;
  };
}

export interface UnifiedAthlete {
  id: string;
  name: string;
  studentId: string;
  className: string;
  gender: '男' | '女';
  grade: string;
  contact?: string;
  
  // 参赛信息
  events: Array<{
    eventId: string;
    eventName: string;
    registrationTime: string;
    status: 'registered' | 'confirmed' | 'withdrawn' | 'disqualified';
  }>;
  
  // 个人记录
  personalRecords?: {
    [eventName: string]: string;
  };
  
  // 元数据
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface UnifiedSchedule {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  round: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  conflictCheck: {
    hasConflict: boolean;
    conflicts?: Array<{
      eventId: string;
      eventName: string;
      reason: string;
    }>;
  };
}

export interface UnifiedSystemData {
  events: UnifiedEvent[];
  athletes: UnifiedAthlete[];
  schedules: UnifiedSchedule[];
  
  // 系统统计
  statistics: {
    totalEvents: number;
    totalAthletes: number;
    totalScheduled: number;
    completedEvents: number;
    
    // 按类别统计
    byGrade: Record<string, number>;
    byType: Record<string, number>;
    byGender: Record<string, number>;
    byStatus: Record<string, number>;
  };
  
  // 时间冲突检查
  timeConflicts: Array<{
    date: string;
    time: string;
    location: string;
    conflictingEvents: string[];
  }>;
}

// API 响应类型
export interface UnifiedAPIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 查询参数类型
export interface UnifiedQueryParams {
  grade?: string;
  type?: string;
  gender?: string;
  status?: string;
  date?: string;
  location?: string;
  athleteName?: string;
  eventName?: string;
}

// 批量操作类型
export interface BatchOperationRequest {
  operation: 'create' | 'update' | 'delete' | 'import';
  data: any[];
  options?: {
    skipDuplicates?: boolean;
    validateData?: boolean;
    dryRun?: boolean;
  };
}