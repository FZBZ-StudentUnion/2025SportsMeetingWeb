const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

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