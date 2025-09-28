# 🚀 运动会管理系统部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js 16+ 
- npm 或 yarn
- Web服务器（Nginx/Apache）
- 域名和SSL证书（生产环境推荐）

### 2. 配置文件检查
- [ ] `.env` - 前端环境变量
- [ ] `.env.server` - 后端环境变量
- [ ] `server.js` - 后端服务配置

## 🛠️ 部署步骤

### 步骤1: 配置环境变量

#### 前端配置 (.env)
```bash
# 生产环境
REACT_APP_API_BASE_URL=https://your-domain.com/api
REACT_APP_ENV=production
```

#### 后端配置 (.env.server)
```bash
# CORS配置 - 添加你的域名
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# 服务器配置
PORT=3001
NODE_ENV=production
API_BASE_URL=https://your-domain.com
```

### 步骤2: 构建前端
```bash
# 清理旧构建
rm -rf build

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 步骤3: 启动后端服务
```bash
# 设置环境变量
export $(cat .env.server | xargs)

# 启动后端服务
npm run server
```

### 步骤4: 配置Web服务器

#### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL证书
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # 前端静态文件
    location / {
        root /path/to/your/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # 静态数据文件
    location /data/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Apache配置示例
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    # 前端静态文件
    DocumentRoot /path/to/your/build
    <Directory /path/to/your/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # API代理
    ProxyPass /api/ http://localhost:3001/
    ProxyPassReverse /api/ http://localhost:3001/
    
    # 静态数据文件
    ProxyPass /data/ http://localhost:3001/data/
    ProxyPassReverse /data/ http://localhost:3001/data/
    
    # CORS headers
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"
</VirtualHost>
```

### 步骤5: 使用PM2管理后端进程
```bash
# 安装PM2
npm install -g pm2

# 创建PM2配置文件
ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'sports-meeting-backend',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# 启动应用
pm2 start ecosystem.config.js --env production

# 设置开机自启
pm2 startup
pm2 save
```

## 🔍 测试部署

### 1. 连接测试
访问测试页面：`https://your-domain.com/test-connection.html`

### 2. API测试
```bash
# 健康检查
curl https://your-domain.com/api/health

# 数据获取
curl https://your-domain.com/api/data
```

### 3. 功能测试
- [ ] 赛程显示正常
- [ ] 选手信息加载正常
- [ ] 文件下载功能正常
- [ ] 数据编辑功能正常（如果有权限）

## 🚨 常见问题解决

### CORS错误
**症状**: 浏览器控制台显示CORS相关错误
**解决**: 
1. 检查`.env.server`中的`CORS_ORIGINS`是否包含你的域名
2. 确保Nginx/Apache配置了正确的CORS头
3. 重启后端服务

### API连接失败
**症状**: 前端显示"网络连接错误"
**解决**:
1. 检查后端服务是否运行：`pm2 status`
2. 检查端口占用：`netstat -tlnp | grep 3001`
3. 检查防火墙设置
4. 查看后端日志：`pm2 logs sports-meeting-backend`

### 静态文件404
**症状**: CSS/JS文件加载失败
**解决**:
1. 检查Nginx/Apache的静态文件路径配置
2. 确保build文件夹存在且包含文件
3. 检查文件权限

### SSL证书问题
**症状**: 浏览器显示证书警告
**解决**:
1. 确保证书文件路径正确
2. 检查证书是否过期
3. 确保证书链完整

## 📊 监控和维护

### 日志监控
```bash
# 查看应用日志
pm2 logs sports-meeting-backend

# 查看系统日志
tail -f /var/log/nginx/error.log
```

### 性能监控
```bash
# 查看PM2监控
pm2 monit

# 查看系统资源
htop
```

### 自动重启
```bash
# 设置自动重启
pm2 startup systemd
pm2 save
```

## 🔄 更新部署

### 更新代码
```bash
# 拉取最新代码
git pull origin main

# 重新构建
npm install
npm run build

# 重启服务
pm2 restart sports-meeting-backend

# 重新加载Nginx
sudo nginx -s reload
```

## 📞 紧急联系

如果部署过程中遇到问题：

1. 检查日志文件
2. 使用测试页面诊断问题
3. 回滚到之前的版本（如果有备份）
4. 联系技术支持

---

**记住**：生产环境部署前，务必在测试环境充分验证！ 🎯