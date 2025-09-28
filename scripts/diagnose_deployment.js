#!/usr/bin/env node

/**
 * 部署问题诊断脚本
 * 自动检测和修复常见的部署连接问题
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const https = require('https');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 日志函数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// 检查文件是否存在
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    success(`${description} 文件存在: ${filePath}`);
    return true;
  } else {
    error(`${description} 文件不存在: ${filePath}`);
    return false;
  }
}

// 检查JSON文件格式
function checkJsonFile(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    success(`${description} JSON格式正确`);
    return true;
  } catch (err) {
    error(`${description} JSON格式错误: ${err.message}`);
    return false;
  }
}

// 检查环境变量配置
function checkEnvFile(filePath, requiredVars) {
  if (!checkFileExists(filePath, '环境变量文件')) {
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const envVars = {};
  
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  let allGood = true;
  requiredVars.forEach(varName => {
    if (envVars[varName]) {
      success(`环境变量 ${varName} 已设置: ${envVars[varName]}`);
    } else {
      warning(`环境变量 ${varName} 未设置`);
      allGood = false;
    }
  });

  return allGood;
}

// 检查端口占用
function checkPort(port, description) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        warning(`${description} 端口 ${port} 已被占用`);
        resolve(false);
      } else {
        error(`${description} 端口检查错误: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      success(`${description} 端口 ${port} 可用`);
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// HTTP请求测试
function testHttpRequest(url, description) {
  return new Promise((resolve) => {
    info(`正在测试 ${description}: ${url}`);
    
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          success(`${description} 请求成功 (状态码: ${res.statusCode})`);
          
          // 检查响应内容
          try {
            const jsonData = JSON.parse(data);
            if (jsonData.status === 'ok') {
              success(`${description} 响应数据正确`);
            } else {
              warning(`${description} 响应数据格式异常`);
            }
          } catch (e) {
            warning(`${description} 响应不是有效的JSON`);
          }
          
          resolve(true);
        } else {
          error(`${description} 请求失败 (状态码: ${res.statusCode})`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      error(`${description} 请求错误: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      error(`${description} 请求超时`);
      resolve(false);
    });
  });
}

// 生成修复建议
function generateFixSuggestions(problems) {
  info('\n=== 🔧 修复建议 ===');
  
  if (problems.includes('env_frontend')) {
    log('\n📋 前端环境变量问题修复:');
    log('1. 检查 .env 文件是否存在');
    log('2. 确保 REACT_APP_API_BASE_URL 设置正确');
    log('3. 确保 REACT_APP_ENV 设置为 production');
    log('4. 重新构建项目: npm run build');
  }
  
  if (problems.includes('env_backend')) {
    log('\n📋 后端环境变量问题修复:');
    log('1. 检查 .env.server 文件是否存在');
    log('2. 确保 CORS_ORIGINS 包含你的域名');
    log('3. 确保 PORT 设置正确');
    log('4. 重启后端服务: npm run server');
  }
  
  if (problems.includes('data_file')) {
    log('\n📁 数据文件问题修复:');
    log('1. 检查 public/data/sports_data.json 是否存在');
    log('2. 验证JSON文件格式是否正确');
    log('3. 检查文件权限是否可读');
    log('4. 如有备份文件，尝试恢复备份');
  }
  
  if (problems.includes('port_occupied')) {
    log('\n🔌 端口占用问题修复:');
    log('1. 检查端口占用情况');
    log('2. 修改server.js中的端口配置');
    log('3. 或结束占用端口的进程');
  }
  
  if (problems.includes('api_connection')) {
    log('\n🌐 API连接问题修复:');
    log('1. 检查后端服务是否运行');
    log('2. 验证API URL是否正确');
    log('3. 检查防火墙设置');
    log('4. 检查代理配置（如使用Nginx/Apache）');
  }
  
  if (problems.includes('cors')) {
    log('\n🔒 CORS问题修复:');
    log('1. 检查 .env.server 中的 CORS_ORIGINS');
    log('2. 确保包含正确的域名和协议');
    log('3. 重启后端服务使配置生效');
  }
}

// 主诊断函数
async function runDiagnosis() {
  log('🏃‍♂️ 运动会管理系统 - 部署诊断工具', 'bright');
  log('================================================', 'bright');
  
  const problems = [];
  const baseDir = process.cwd();
  
  info('\n=== 📋 环境检查 ===');
  
  // 1. 检查前端环境变量
  const frontendEnvOk = checkEnvFile(
    path.join(baseDir, '.env'),
    ['REACT_APP_API_BASE_URL', 'REACT_APP_ENV']
  );
  if (!frontendEnvOk) problems.push('env_frontend');
  
  // 2. 检查后端环境变量
  const backendEnvOk = checkEnvFile(
    path.join(baseDir, '.env.server'),
    ['CORS_ORIGINS', 'PORT', 'NODE_ENV']
  );
  if (!backendEnvOk) problems.push('env_backend');
  
  info('\n=== 📁 文件检查 ===');
  
  // 3. 检查数据文件
  const dataFilePath = path.join(baseDir, 'public', 'data', 'sports_data.json');
  const dataFileExists = checkFileExists(dataFilePath, '主数据文件');
  if (dataFileExists) {
    const dataFileValid = checkJsonFile(dataFilePath, '主数据文件');
    if (!dataFileValid) problems.push('data_file');
  } else {
    problems.push('data_file');
  }
  
  // 4. 检查备份文件
  const backupFilePath = path.join(baseDir, 'public', 'data', 'sports_data_backup.json');
  checkFileExists(backupFilePath, '备份数据文件');
  
  // 5. 检查构建文件
  const buildDir = path.join(baseDir, 'build');
  if (checkFileExists(buildDir, '构建目录')) {
    const indexFile = path.join(buildDir, 'index.html');
    checkFileExists(indexFile, '构建首页文件');
  }
  
  info('\n=== 🔌 端口检查 ===');
  
  // 6. 检查端口
  const port3457Ok = await checkPort(3457, '后端服务');
  if (!port3457Ok) problems.push('port_occupied');
  
  const port3456Ok = await checkPort(3456, '前端开发服务');
  
  info('\n=== 🌐 API连接测试 ===');
  
  // 7. 测试API连接
  // 尝试不同的API端点
  const testUrls = [
    'http://localhost:3457/api/health',
    'http://localhost:3457/api/data',
    'http://127.0.0.1:3457/api/health'
  ];
  
  let apiConnectionOk = false;
  for (const url of testUrls) {
    const result = await testHttpRequest(url, '本地API');
    if (result) {
      apiConnectionOk = true;
      break;
    }
  }
  
  if (!apiConnectionOk) problems.push('api_connection');
  
  // 8. 检查CORS（如果API可用）
  if (apiConnectionOk) {
    info('\n=== 🔒 CORS检查 ===');
    // 这里可以添加更详细的CORS检查
    warning('请手动检查浏览器控制台是否有CORS相关错误');
  }
  
  // 生成修复建议
  if (problems.length > 0) {
    generateFixSuggestions(problems);
  } else {
    success('\n🎉 所有检查通过！系统配置看起来正常。');
  }
  
  info('\n=== 📞 下一步操作 ===');
  log('1. 根据上述建议修复问题');
  log('2. 重新运行诊断工具验证修复');
  log('3. 访问测试页面进行最终验证');
  log('4. 如仍有问题，请查看详细日志或寻求帮助');
  
  log('\n诊断完成！', 'bright');
}

// 错误处理
process.on('unhandledRejection', (err) => {
  error(`未处理的错误: ${err.message}`);
  process.exit(1);
});

// 运行诊断
if (require.main === module) {
  runDiagnosis().catch(err => {
    error(`诊断失败: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runDiagnosis };