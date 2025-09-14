const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 数据目录
const DATA_DIR = path.join(__dirname, 'public', 'data');
const UNIFIED_DIR = path.join(DATA_DIR, 'unified');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// 确保目录存在
async function ensureDirectories() {
  const dirs = [UNIFIED_DIR, BACKUP_DIR];
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

// 工具函数
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return null;
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`写入文件失败: ${filePath}`, error);
    return false;
  }
}

// 初始化数据
async function initializeData() {
  await ensureDirectories();
  
  // 初始化统一数据文件
  const eventsFile = path.join(UNIFIED_DIR, 'events.json');
  const athletesFile = path.join(UNIFIED_DIR, 'athletes.json');
  const schedulesFile = path.join(UNIFIED_DIR, 'schedules.json');
  
  const defaultEvents = [
    {
      id: '10001',
      name: '高一男子组 100米 预赛',
      grade: '高一',
      gender: '男子',
      type: '径赛',
      category: '100米',
      participantsCount: 36,
      status: 'scheduled',
      schedule: {
        date: '2024-10-15',
        startTime: '09:30',
        endTime: '09:50',
        location: '田径场',
        round: '预赛',
        order: 1
      },
      athletes: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      }
    },
    {
      id: '10002',
      name: '高一女子组 100米 预赛',
      grade: '高一',
      gender: '女子',
      type: '径赛',
      category: '100米',
      participantsCount: 30,
      status: 'scheduled',
      schedule: {
        date: '2024-10-15',
        startTime: '09:52',
        endTime: '10:12',
        location: '田径场',
        round: '预赛',
        order: 2
      },
      athletes: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      }
    },
    {
      id: '20001',
      name: '高一男子组 跳高 预决赛',
      grade: '高一',
      gender: '男子',
      type: '田赛',
      category: '跳高',
      participantsCount: 20,
      status: 'scheduled',
      schedule: {
        date: '2024-10-15',
        startTime: '09:30',
        endTime: '11:00',
        location: '跳高场地',
        round: '预决赛',
        order: 1
      },
      athletes: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      }
    }
  ];
  
  const defaultAthletes = [
    {
      id: 'A001',
      name: '张三',
      studentId: '202401001',
      className: '高一(1)班',
      gender: '男',
      grade: '高一',
      contact: '13800138001',
      events: [
        {
          eventId: '10001',
          eventName: '高一男子组 100米 预赛',
          registrationTime: new Date().toISOString(),
          status: 'confirmed'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      }
    },
    {
      id: 'A002',
      name: '李四',
      studentId: '202401002',
      className: '高一(1)班',
      gender: '男',
      grade: '高一',
      contact: '13800138002',
      events: [
        {
          eventId: '10001',
          eventName: '高一男子组 100米 预赛',
          registrationTime: new Date().toISOString(),
          status: 'confirmed'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      }
    }
  ];
  
  const defaultSchedules = defaultEvents.map(event => ({
    id: `S${event.id}`,
    eventId: event.id,
    eventName: event.name,
    date: event.schedule.date,
    startTime: event.schedule.startTime,
    endTime: event.schedule.endTime,
    location: event.schedule.location,
    round: event.schedule.round,
    status: event.status,
    conflictCheck: {
      hasConflict: false
    }
  }));
  
  // 写入默认数据
  await writeJsonFile(eventsFile, defaultEvents);
  await writeJsonFile(athletesFile, defaultAthletes);
  await writeJsonFile(schedulesFile, defaultSchedules);
}

// 统一数据管理路由

// 获取完整系统数据
app.get('/api/unified/system', async (req, res) => {
  try {
    const events = await readJsonFile(path.join(UNIFIED_DIR, 'events.json')) || [];
    const athletes = await readJsonFile(path.join(UNIFIED_DIR, 'athletes.json')) || [];
    const schedules = await readJsonFile(path.join(UNIFIED_DIR, 'schedules.json')) || [];
    
    // 生成统计数据
    const statistics = {
      totalEvents: events.length,
      totalAthletes: athletes.length,
      totalScheduled: schedules.length,
      completedEvents: events.filter(e => e.status === 'completed').length,
      byGrade: events.reduce((acc, event) => {
        acc[event.grade] = (acc[event.grade] || 0) + 1;
        return acc;
      }, {}),
      byType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      byGender: events.reduce((acc, event) => {
        acc[event.gender] = (acc[event.gender] || 0) + 1;
        return acc;
      }, {}),
      byStatus: events.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {})
    };
    
    // 检查时间冲突
    const timeConflicts = [];
    const timeMap = new Map();
    
    schedules.forEach(schedule => {
      const key = `${schedule.date}-${schedule.startTime}-${schedule.location}`;
      if (timeMap.has(key)) {
        timeMap.get(key).push(schedule.eventName);
      } else {
        timeMap.set(key, [schedule.eventName]);
      }
    });
    
    timeMap.forEach((events, key) => {
      if (events.length > 1) {
        const [date, time, location] = key.split('-');
        timeConflicts.push({
          date,
          time,
          location,
          conflictingEvents: events
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        events,
        athletes,
        schedules,
        statistics,
        timeConflicts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 比赛项目管理

// 获取比赛项目列表
app.get('/api/unified/events', async (req, res) => {
  try {
    const events = await readJsonFile(path.join(UNIFIED_DIR, 'events.json')) || [];
    
    // 应用查询参数过滤
    const { grade, type, gender, status, category } = req.query;
    let filteredEvents = events;
    
    if (grade) filteredEvents = filteredEvents.filter(e => e.grade === grade);
    if (type) filteredEvents = filteredEvents.filter(e => e.type === type);
    if (gender) filteredEvents = filteredEvents.filter(e => e.gender === gender);
    if (status) filteredEvents = filteredEvents.filter(e => e.status === status);
    if (category) filteredEvents = filteredEvents.filter(e => e.category === category);
    
    res.json({ success: true, data: filteredEvents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个比赛项目
app.get('/api/unified/events/:id', async (req, res) => {
  try {
    const events = await readJsonFile(path.join(UNIFIED_DIR, 'events.json')) || [];
    const event = events.find(e => e.id === req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, error: '比赛项目不存在' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建比赛项目
app.post('/api/unified/events', async (req, res) => {
  try {
    const events = await readJsonFile(path.join(UNIFIED_DIR, 'events.json')) || [];
    const newEvent = {
      id: uuidv4(),
      ...req.body,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.headers['x-user-id'] || 'system'
      }
    };
    
    events.push(newEvent);
    await writeJsonFile(path.join(UNIFIED_DIR, 'events.json'), events);
    
    // 同时创建对应的时间安排
    const schedules = await readJsonFile(path.join(UNIFIED_DIR, 'schedules.json')) || [];
    const newSchedule = {
      id: `S${newEvent.id}`,
      eventId: newEvent.id,
      eventName: newEvent.name,
      date: newEvent.schedule.date,
      startTime: newEvent.schedule.startTime,
      endTime: newEvent.schedule.endTime,
      location: newEvent.schedule.location,
      round: newEvent.schedule.round,
      status: newEvent.status,
      conflictCheck: { hasConflict: false }
    };
    
    schedules.push(newSchedule);
    await writeJsonFile(path.join(UNIFIED_DIR, 'schedules.json'), schedules);
    
    res.json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新比赛项目
app.put('/api/unified/events/:id', async (req, res) => {
  try {
    const events = await readJsonFile(path.join(UNIFIED_DIR, 'events.json')) || [];
    const index = events.findIndex(e => e.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: '比赛项目不存在' });
    }
    
    events[index] = {
      ...events[index],
      ...req.body,
      metadata: {
        ...events[index].metadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    await writeJsonFile(path.join(UNIFIED_DIR, 'events.json'), events);
    
    // 更新对应的时间安排
    const schedules = await readJsonFile(path.join(UNIFIED_DIR, 'schedules.json')) || [];
    const scheduleIndex = schedules.findIndex(s => s.eventId === req.params.id);
    
    if (scheduleIndex !== -1) {
      schedules[scheduleIndex] = {
        ...schedules[scheduleIndex],
        eventName: events[index].name,
        date: events[index].schedule.date,
        startTime: events[index].schedule.startTime,
        endTime: events[index].schedule.endTime,
        location: events[index].schedule.location,
        round: events[index].schedule.round,
        status: events[index].status
      };
      await writeJsonFile(path.join(UNIFIED_DIR, 'schedules.json'), schedules);
    }
    
    res.json({ success: true, data: events[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除比赛项目
app.delete('/api/unified/events/:id', async (req, res) => {
  try {
    const events = await readJsonFile(path.join(UNIFIED_DIR, 'events.json')) || [];
    const filteredEvents = events.filter(e => e.id !== req.params.id);
    
    if (events.length === filteredEvents.length) {
      return res.status(404).json({ success: false, error: '比赛项目不存在' });
    }
    
    await writeJsonFile(path.join(UNIFIED_DIR, 'events.json'), filteredEvents);
    
    // 删除对应的时间安排
    const schedules = await readJsonFile(path.join(UNIFIED_DIR, 'schedules.json')) || [];
    const filteredSchedules = schedules.filter(s => s.eventId !== req.params.id);
    await writeJsonFile(path.join(UNIFIED_DIR, 'schedules.json'), filteredSchedules);
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 运动员管理

// 获取运动员列表
app.get('/api/unified/athletes', async (req, res) => {
  try {
    const athletes = await readJsonFile(path.join(UNIFIED_DIR, 'athletes.json')) || [];
    
    // 应用查询参数过滤
    const { grade, gender, className, name } = req.query;
    let filteredAthletes = athletes;
    
    if (grade) filteredAthletes = filteredAthletes.filter(a => a.grade === grade);
    if (gender) filteredAthletes = filteredAthletes.filter(a => a.gender === gender);
    if (className) filteredAthletes = filteredAthletes.filter(a => a.className === className);
    if (name) filteredAthletes = filteredAthletes.filter(a => 
      a.name.toLowerCase().includes(name.toLowerCase())
    );
    
    res.json({ success: true, data: filteredAthletes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个运动员
app.get('/api/unified/athletes/:id', async (req, res) => {
  try {
    const athletes = await readJsonFile(path.join(UNIFIED_DIR, 'athletes.json')) || [];
    const athlete = athletes.find(a => a.id === req.params.id);
    
    if (!athlete) {
      return res.status(404).json({ success: false, error: '运动员不存在' });
    }
    
    res.json({ success: true, data: athlete });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建运动员
app.post('/api/unified/athletes', async (req, res) => {
  try {
    const athletes = await readJsonFile(path.join(UNIFIED_DIR, 'athletes.json')) || [];
    const newAthlete = {
      id: uuidv4(),
      ...req.body,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.headers['x-user-id'] || 'system'
      }
    };
    
    athletes.push(newAthlete);
    await writeJsonFile(path.join(UNIFIED_DIR, 'athletes.json'), athletes);
    
    res.json({ success: true, data: newAthlete });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新运动员
app.put('/api/unified/athletes/:id', async (req, res) => {
  try {
    const athletes = await readJsonFile(path.join(UNIFIED_DIR, 'athletes.json')) || [];
    const index = athletes.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: '运动员不存在' });
    }
    
    athletes[index] = {
      ...athletes[index],
      ...req.body,
      metadata: {
        ...athletes[index].metadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    await writeJsonFile(path.join(UNIFIED_DIR, 'athletes.json'), athletes);
    res.json({ success: true, data: athletes[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除运动员
app.delete('/api/unified/athletes/:id', async (req, res) => {
  try {
    const athletes = await readJsonFile(path.join(UNIFIED_DIR, 'athletes.json')) || [];
    const filteredAthletes = athletes.filter(a => a.id !== req.params.id);
    
    if (athletes.length === filteredAthletes.length) {
      return res.status(404).json({ success: false, error: '运动员不存在' });
    }
    
    await writeJsonFile(path.join(UNIFIED_DIR, 'athletes.json'), filteredAthletes);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量操作
app.post('/api/unified/batch', async (req, res) => {
  try {
    const { operation, data, options = {} } = req.body;
    
    if (!operation || !data || !Array.isArray(data)) {
      return res.status(400).json({ success: false, error: '参数错误' });
    }
    
    let results = [];
    
    switch (operation) {
      case 'create':
        // 批量创建
        results = await Promise.all(data.map(item => {
          return unifiedService.createEvent(item);
        }));
        break;
      case 'update':
        // 批量更新
        results = await Promise.all(data.map(item => {
          return unifiedService.updateEvent(item.id, item);
        }));
        break;
      case 'delete':
        // 批量删除
        results = await Promise.all(data.map(id => {
          return unifiedService.deleteEvent(id);
        }));
        break;
      default:
        return res.status(400).json({ success: false, error: '不支持的操作类型' });
    }
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 数据导入
app.post('/api/unified/import', async (req, res) => {
  try {
    const { data, type } = req.body;
    
    if (!data || !Array.isArray(data) || !type) {
      return res.status(400).json({ success: false, error: '参数错误' });
    }
    
    let importedCount = 0;
    
    switch (type) {
      case 'events':
        for (const item of data) {
          await unifiedService.createEvent(item);
          importedCount++;
        }
        break;
      case 'athletes':
        for (const item of data) {
          await unifiedService.createAthlete(item);
          importedCount++;
        }
        break;
      case 'schedules':
        for (const item of data) {
          await unifiedService.createSchedule(item);
          importedCount++;
        }
        break;
      default:
        return res.status(400).json({ success: false, error: '不支持的导入类型' });
    }
    
    res.json({ success: true, data: { importedCount } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 数据备份
app.post('/api/unified/backup', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `unified-backup-${timestamp}.json`);
    
    const systemData = await unifiedService.getSystemData();
    await writeJsonFile(backupFile, systemData.data);
    
    res.json({ success: true, data: { backupId: `unified-backup-${timestamp}` } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 数据恢复
app.post('/api/unified/restore', async (req, res) => {
  try {
    const { backupId } = req.body;
    const backupFile = path.join(BACKUP_DIR, `${backupId}.json`);
    
    const backupData = await readJsonFile(backupFile);
    if (!backupData) {
      return res.status(404).json({ success: false, error: '备份文件不存在' });
    }
    
    await writeJsonFile(path.join(UNIFIED_DIR, 'events.json'), backupData.events || []);
    await writeJsonFile(path.join(UNIFIED_DIR, 'athletes.json'), backupData.athletes || []);
    await writeJsonFile(path.join(UNIFIED_DIR, 'schedules.json'), backupData.schedules || []);
    
    res.json({ success: true, message: '数据恢复成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 模拟统一服务（实际使用时需要实现）
const unifiedService = {
  createEvent: async (event) => ({ success: true, data: event }),
  updateEvent: async (id, event) => ({ success: true, data: event }),
  deleteEvent: async (id) => ({ success: true }),
  createAthlete: async (athlete) => ({ success: true, data: athlete }),
  updateAthlete: async (id, athlete) => ({ success: true, data: athlete }),
  deleteAthlete: async (id) => ({ success: true }),
  createSchedule: async (schedule) => ({ success: true, data: schedule }),
  updateSchedule: async (id, schedule) => ({ success: true, data: schedule }),
  deleteSchedule: async (id) => ({ success: true }),
  getSystemData: async () => ({
    success: true,
    data: {
      events: [],
      athletes: [],
      schedules: [],
      statistics: {},
      timeConflicts: []
    }
  })
};

// 启动服务器
app.listen(PORT, () => {
  console.log(`统一运动会管理系统运行在端口 ${PORT}`);
  initializeData().then(() => {
    console.log('统一数据初始化完成');
  });
});