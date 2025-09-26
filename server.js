const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3001;

// 数据文件路径
const dataFilePath = path.join(__dirname, 'public', 'data', 'sports_data.json');
const backupFilePath = path.join(__dirname, 'public', 'data', 'sports_data_backup.json');

// 确保data目录存在
const dataDir = path.join(__dirname, 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataFile: dataFilePath
  });
});

// 获取数据接口
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: '数据文件不存在' });
    }
  } catch (error) {
    console.error('读取数据文件失败:', error);
    res.status(500).json({ error: '读取数据文件失败', details: error.message });
  }
});

// 静态文件服务 - 提供PDF文件下载
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// 更新数据接口
app.post('/api/data', (req, res) => {
  try {
    const newData = req.body;
    
    // 验证数据格式
    if (!newData || typeof newData !== 'object') {
      return res.status(400).json({ error: '无效的数据格式' });
    }

    // 创建备份
    if (fs.existsSync(dataFilePath)) {
      const currentData = fs.readFileSync(dataFilePath, 'utf8');
      fs.writeFileSync(backupFilePath, currentData, 'utf8');
    }

    // 写入新数据
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
    
    console.log('数据更新成功:', new Date().toISOString());
    res.json({ 
      success: true, 
      message: '数据更新成功',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('更新数据文件失败:', error);
    res.status(500).json({ error: '更新数据文件失败', details: error.message });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误', 
    details: err.message 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`数据文件路径: ${dataFilePath}`);
});