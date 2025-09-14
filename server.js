const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// 设置响应头编码
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 数据目录路径
const DATA_DIR = path.join(__dirname, 'public', 'data');
const GAMES_DIR = path.join(DATA_DIR, 'games');
const PLAYERS_DIR = path.join(DATA_DIR, 'players');

// 确保目录存在
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('创建目录失败:', error);
  }
}

// 读取JSON文件
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取文件失败:', filePath, error);
    return null;
  }
}

// 写入JSON文件
async function writeJsonFile(filePath, data) {
  try {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入文件失败:', filePath, error);
    return false;
  }
}

// API路由：获取比赛日程
app.get('/api/games/:day', async (req, res) => {
  const { day } = req.params;
  const fileName = day === '2' ? '20.json' : '10.json';
  const filePath = path.join(GAMES_DIR, fileName);
  
  try {
    const data = await readJsonFile(filePath);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: '读取文件失败' });
  }
});

// API路由：更新比赛日程
app.post('/api/games/:day', async (req, res) => {
  const { day } = req.params;
  const fileName = day === '2' ? '20.json' : '10.json';
  const filePath = path.join(GAMES_DIR, fileName);
  
  try {
    const success = await writeJsonFile(filePath, req.body);
    if (success) {
      res.json({ success: true, message: '数据保存成功' });
    } else {
      res.status(500).json({ error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ error: '保存失败' });
  }
});

// API路由：获取运动员列表
app.get('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  const filePath = path.join(PLAYERS_DIR, `${id}.json`);
  
  try {
    const data = await readJsonFile(filePath);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: '读取文件失败' });
  }
});

// API路由：更新运动员列表
app.post('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  const filePath = path.join(PLAYERS_DIR, `${id}.json`);
  
  try {
    const success = await writeJsonFile(filePath, req.body);
    if (success) {
      res.json({ success: true, message: '数据保存成功' });
    } else {
      res.status(500).json({ error: '保存失败' });
    }
  } catch (error) {
    res.status(500).json({ error: '保存失败' });
  }
});

// API路由：获取班级映射
app.get('/api/class-mapping', async (req, res) => {
  const filePath = path.join(DATA_DIR, 'h2c.json');
  
  try {
    const data = await readJsonFile(filePath);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: '读取文件失败' });
  }
});

// API路由：备份文件
app.post('/api/backup/:type', async (req, res) => {
  const { type } = req.params;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    if (type === 'games') {
      const source10 = path.join(GAMES_DIR, '10.json');
      const source20 = path.join(GAMES_DIR, '20.json');
      const backup10 = path.join(DATA_DIR, 'backups', `games-10-${timestamp}.json`);
      const backup20 = path.join(DATA_DIR, 'backups', `games-20-${timestamp}.json`);
      
      await ensureDir(path.join(DATA_DIR, 'backups'));
      
      const data10 = await readJsonFile(source10);
      const data20 = await readJsonFile(source20);
      
      if (data10) await writeJsonFile(backup10, data10);
      if (data20) await writeJsonFile(backup20, data20);
    }
    
    res.json({ success: true, message: '备份成功' });
  } catch (error) {
    res.status(500).json({ error: '备份失败' });
  }
});

// API路由：同步在线编辑器数据到主页面
app.post('/api/sync/editor-data', async (req, res) => {
  const { games, athletes } = req.body;
  
  try {
    // 初始化数据结构
    const day1TrackMorning = [];
    const day1TrackAfternoon = [];
    const day1FieldMorning = [];
    const day1FieldAfternoon = [];
    
    const day2TrackMorning = [];
    const day2TrackAfternoon = [];
    const day2FieldMorning = [];
    const day2FieldAfternoon = [];
    
    // 处理比赛项目数据
    const gameData = games && games.length > 0 ? games : [
      { name: '高一男子组 100M 预赛', grade: '高一', type: '径赛', id: '1001', participants: 20 },
      { name: '高一女子组 100M 预赛', grade: '高一', type: '径赛', id: '1002', participants: 20 },
      { name: '高二男子组 100M 预赛', grade: '高二', type: '径赛', id: '1003', participants: 20 },
      { name: '高二女子组 100M 预赛', grade: '高二', type: '径赛', id: '1004', participants: 20 },
      { name: '高三男子组 100M 预赛', grade: '高三', type: '径赛', id: '1005', participants: 20 },
      { name: '高三女子组 100M 预赛', grade: '高三', type: '径赛', id: '1006', participants: 20 }
    ];
    
    // 分配比赛项目到不同时间段
    gameData.forEach(game => {
      const item = {
        name: game.name,
        grade: game.grade,
        time: game.time || '上午',
        link: `/game/${game.id}`
      };
      
      // 简单分配逻辑
      if (game.name.includes('高一')) {
        if (game.type === '径赛') {
          day1TrackMorning.push(item);
        } else {
          day1FieldMorning.push(item);
        }
      } else if (game.name.includes('高二')) {
        if (game.type === '径赛') {
          day2TrackMorning.push(item);
        } else {
          day2FieldMorning.push(item);
        }
      } else {
        if (game.type === '径赛') {
          day2TrackAfternoon.push(item);
        } else {
          day2FieldAfternoon.push(item);
        }
      }
    });
    
    // 构建数据文件
    const day1Data = [day1TrackMorning, day1TrackAfternoon, day1FieldMorning, day1FieldAfternoon];
    const day2Data = [day2TrackMorning, day2TrackAfternoon, day2FieldMorning, day2FieldAfternoon];
    
    // 保存到文件
    await writeJsonFile(path.join(GAMES_DIR, '10.json'), day1Data);
    await writeJsonFile(path.join(GAMES_DIR, '20.json'), day2Data);
    
    // 创建运动员文件
    for (const game of gameData) {
      const gameId = game.id;
      const playersFile = path.join(PLAYERS_DIR, `${gameId}.json`);
      
      // 找到对应运动员
      let gameAthletes = athletes ? athletes.filter(athlete => 
        athlete.events && athlete.events.includes(game.name)
      ) : [];
      
      // 如果没有运动员，创建示例数据
      if (gameAthletes.length === 0) {
        gameAthletes = [
          { name: '示例运动员1', class: '高一(1)班', grade: '高一', studentId: '2024001' },
          { name: '示例运动员2', class: '高一(2)班', grade: '高一', studentId: '2024002' }
        ];
      }
      
      const players = gameAthletes.map(athlete => ({
        name: athlete.name,
        class: athlete.class || `${athlete.grade}(1)班`,
        road: '1',
        data: athlete.studentId || ''
      }));
      
      // 分组
      const groupedPlayers = [];
      for (let i = 0; i < players.length; i += 6) {
        groupedPlayers.push(players.slice(i, i + 6));
      }
      
      const playerData = {
        name: game.name,
        players: groupedPlayers.length > 0 ? groupedPlayers : [players.slice(0, 6)]
      };
      
      await writeJsonFile(playersFile, playerData);
    }
    
    res.json({ success: true, message: '数据同步成功' });
  } catch (error) {
    console.error('同步数据失败:', error);
    res.status(500).json({ error: '同步失败' });
  }
});

// 启动服务器
async function startServer() {
  await ensureDir(GAMES_DIR);
  await ensureDir(PLAYERS_DIR);
  
  app.listen(PORT, () => {
    console.log(`🚀 动态数据服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 数据目录: ${DATA_DIR}`);
  });
}

startServer().catch(console.error);