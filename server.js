const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3457;

// 进程优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 数据文件路径
const dataFilePath = path.join(__dirname, 'public', 'data', 'sports_data.json');
const backupFilePath = path.join(__dirname, 'public', 'data', 'sports_data_backup.json');

// 确保data目录存在
const dataDir = path.join(__dirname, 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// CORS 配置 - 强制使用通配符允许所有域名访问
const allowedOrigins = ['*'];

console.log('🌐 CORS配置: 允许所有域名访问 (通配符模式)');

// 中间件
app.use(cors({
  origin: function (origin, callback) {
    // 如果设置了通配符，允许所有来源
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // 允许没有origin的请求（如移动应用或Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS拒绝访问:', origin);
      callback(new Error('不允许的CORS源'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'no-origin'} - IP: ${req.ip}`);
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

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

// 启动前端开发服务器
function startFrontendServer() {
  console.log('正在启动前端开发服务器...');
  
  const frontendProcess = spawn('npm', ['run', 'frontend'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: { ...process.env, PORT: '3456' }
  });

  frontendProcess.on('error', (error) => {
    console.error('启动前端服务器失败:', error);
  });

  frontendProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`前端服务器进程退出，代码: ${code}`);
    }
  });

  return frontendProcess;
}

// 启动服务器
const server = app.listen(PORT, (error) => {
  if (error) {
    console.error(`服务器启动失败:`, error);
    if (error.code === 'EADDRINUSE') {
      console.error(`端口 ${PORT} 已被占用`);
    }
    process.exit(1);
  }
  
  console.log(`后端服务器运行在端口 ${PORT}`);
  console.log(`数据文件路径: ${dataFilePath}`);
  
  // 仅在开发模式下启动前端开发服务器
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      startFrontendServer();
    }, 1000); // 延迟1秒启动前端服务器，确保后端完全启动
  }
});