# 前后端连接问题排查与解决方案

## 问题分析

在自定义域名和网站部署时，前后端服务连接失败的主要原因：

### 1. API URL 配置问题
- **当前问题**: `api.ts` 中的 baseURL 设置仅支持 localhost 环境
- **影响**: 部署到自定义域名后，前端无法正确连接到后端服务

### 2. CORS 配置限制
- **当前问题**: `server.js` 中的 CORS 仅允许特定的 localhost 端口
- **影响**: 自定义域名无法访问后端API

### 3. 代理配置限制
- **当前问题**: `setupProxy.js` 中的代理目标固定为 localhost:3001
- **影响**: 开发环境下无法连接到远程后端服务

## 解决方案

### 步骤1: 更新环境变量配置

修改 `.env` 文件，添加生产环境配置：

```bash
# 开发环境
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ENV=development

# 生产环境 (部署时取消注释并修改)
# REACT_APP_API_BASE_URL=https://your-domain.com/api
# REACT_APP_ENV=production
```

### 步骤2: 修改 API 服务配置

更新 `src/services/api.ts` 中的 baseURL 逻辑：

```typescript
constructor() {
  let baseURL = '';
  
  // 根据环境变量设置 baseURL
  if (process.env.REACT_APP_ENV === 'production') {
    baseURL = process.env.REACT_APP_API_BASE_URL || '';
  } else {
    // 开发环境 - 根据端口设置
    const port = window.location.port;
    if (port === '3000' || port === '3002' || port === '3003') {
      baseURL = 'http://localhost:3001';
    }
  }
  
  // 如果没有设置 baseURL，使用相对路径
  if (!baseURL) {
    baseURL = '';
  }
  
  this.client = axios.create({
    baseURL: baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
}
```

### 步骤3: 更新 CORS 配置

修改 `server.js` 中的 CORS 中间件：

```javascript
// 获取环境变量中的允许域名
const allowedOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'];

app.use(cors({
  origin: function (origin, callback) {
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
```

### 步骤4: 添加环境变量到后端

创建 `.env.server` 文件：

```bash
# CORS 允许的域名列表（用逗号分隔）
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://your-domain.com

# 服务器端口
PORT=3001

# Node 环境
NODE_ENV=production
```

### 步骤5: 更新代理配置（可选）

如果需要在开发环境连接到远程后端，修改 `setupProxy.js`：

```javascript
const targetUrl = process.env.REACT_APP_PROXY_TARGET || 'http://localhost:3001';

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      secure: false,
      onError: function(err, req, res) {
        console.error('代理请求错误:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
          error: '代理请求失败，请检查服务器是否正常运行',
          details: err.message,
          target: targetUrl
        }));
      },
    })
  );
};
```

## 部署检查清单

### 前端部署
- [ ] 设置正确的 `REACT_APP_API_BASE_URL` 环境变量
- [ ] 确保 `REACT_APP_ENV=production`
- [ ] 构建生产版本：`npm run build`

### 后端部署
- [ ] 设置正确的 `CORS_ORIGINS` 环境变量
- [ ] 确保后端服务在正确的端口运行
- [ ] 检查防火墙设置

### 域名和SSL
- [ ] 配置正确的域名解析
- [ ] 确保SSL证书有效（如果使用HTTPS）
- [ ] 检查Nginx/Apache反向代理配置

## 测试连接

### 健康检查
```bash
# 测试后端API
curl https://your-domain.com/api/health

# 测试前端到后端连接
# 在浏览器控制台执行：
fetch('/api/health').then(r => r.json()).then(console.log)
```

### 常见问题排查

1. **CORS错误**: 检查浏览器控制台是否有CORS相关错误
2. **404错误**: 确认API端点URL正确
3. **超时错误**: 检查网络连接和服务器响应时间
4. **证书错误**: 如果使用HTTPS，确保证书有效

## 监控和日志

### 前端监控
在 `src/services/api.ts` 中添加更详细的日志：

```typescript
// 响应拦截器增强
this.client.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);
```

### 后端监控
在 `server.js` 中添加请求日志：

```javascript
// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.headers.origin || 'no-origin'}`);
  next();
});
```