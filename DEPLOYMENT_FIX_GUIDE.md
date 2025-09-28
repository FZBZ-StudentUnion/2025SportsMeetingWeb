# 🚨 部署连接问题修复指南

## 问题症状
- 浏览器控制台显示网络错误或CORS错误
- 前端无法获取后端数据
- 页面加载但数据为空
- 测试页面显示连接失败

## 🔧 快速修复步骤

### 步骤1: 检查当前配置
首先运行测试页面检查当前状态：
```
访问: https://your-domain.com/test-connection.html
点击: "测试健康检查" 和 "测试数据获取"
记录错误信息
```

### 步骤2: 修复环境变量

#### 前端配置 (.env文件)
```bash
# 生产环境配置
REACT_APP_API_BASE_URL=https://your-domain.com/api
REACT_APP_ENV=production
```

#### 后端配置 (.env.server文件)
```bash
# CORS 允许的域名（修改为你的实际域名）
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# 服务器配置
PORT=3457
NODE_ENV=production
API_BASE_URL=https://your-domain.com
```

### 步骤3: 检查服务器端口
确保服务器使用正确的端口：
```bash
# 检查端口占用
netstat -ano | findstr :3457

# 如果端口被占用，修改server.js中的端口或杀死占用进程
```

### 步骤4: 验证数据文件
确保数据文件存在且格式正确：
```bash
# 检查数据文件
ls -la public/data/sports_data.json

# 验证JSON格式
cat public/data/sports_data.json | python -m json.tool
```

### 步骤5: 重新构建和部署
```bash
# 1. 清理旧构建
rm -rf build

# 2. 重新构建
npm run build

# 3. 重启后端服务
npm run server
```

## 🐛 常见问题及解决方案

### 1. CORS错误
**错误信息**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**解决方案**:
- 检查 `.env.server` 中的 `CORS_ORIGINS` 是否包含你的域名
- 确保域名拼写正确，包括协议(https://)
- 重启后端服务使配置生效

### 2. API连接失败
**错误信息**: `net::ERR_CONNECTION_REFUSED` 或 `Failed to fetch`

**解决方案**:
- 检查后端服务是否运行: `curl https://your-domain.com/api/health`
- 确认 `.env` 文件中的 `REACT_APP_API_BASE_URL` 设置正确
- 检查防火墙和端口设置

### 3. 404错误
**错误信息**: `GET https://your-domain.com/api/data 404 (Not Found)`

**解决方案**:
- 检查Nginx/Apache代理配置是否正确
- 确认API路径映射正确
- 检查后端路由是否正确加载

### 4. 数据为空
**错误信息**: 页面加载但显示"暂无数据"

**解决方案**:
- 检查 `public/data/sports_data.json` 文件是否存在
- 验证JSON文件格式是否正确
- 检查文件权限是否可读

## 🔧 高级调试

### 启用详细日志
修改 `server.js`，添加更多日志：
```javascript
// 在请求处理中添加详细日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Origin:', req.headers.origin);
  next();
});
```

### 浏览器调试
1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 刷新页面，查看API请求
4. 检查请求URL、状态码、响应内容

### 手动测试API
```bash
# 测试健康检查
curl -v https://your-domain.com/api/health

# 测试数据获取
curl -v https://your-domain.com/api/data

# 检查CORS响应头
curl -I -H "Origin: https://your-domain.com" https://your-domain.com/api/health
```

## 📋 部署检查清单

### 部署前检查
- [ ] 环境变量配置正确
- [ ] 数据文件存在且格式正确
- [ ] 构建过程无错误
- [ ] 服务器端口可用

### 部署后检查
- [ ] 访问测试页面: `/test-connection.html`
- [ ] 健康检查API: `/api/health`
- [ ] 数据API: `/api/data`
- [ ] 静态文件访问: `/data/sports_data.json`
- [ ] 浏览器控制台无错误

### 性能优化
- [ ] 启用Gzip压缩
- [ ] 配置缓存头
- [ ] 使用CDN加速静态资源
- [ ] 配置HTTPS重定向

## 🆘 紧急修复

如果问题严重，可以尝试以下紧急措施：

1. **回滚到之前版本**:
   ```bash
   # 如果有备份，恢复到之前的构建版本
   cp -r build.backup build
   ```

2. **启用开发模式**:
   ```bash
   # 临时切换到开发模式进行调试
   npm run dev
   ```

3. **查看详细日志**:
   ```bash
   # 查看Node.js应用日志
   tail -f logs/server.log
   
   # 查看Nginx/Apache错误日志
   tail -f /var/log/nginx/error.log
   ```

## 📞 寻求帮助

如果以上步骤无法解决问题，请提供以下信息：
1. 完整的错误日志（浏览器控制台和服务器）
2. 当前的配置文件（隐藏敏感信息）
3. 测试页面的结果截图
4. 服务器环境信息（操作系统、Node.js版本等）