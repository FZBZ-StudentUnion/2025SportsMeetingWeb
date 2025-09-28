#!/usr/bin/env node

/**
 * 快速部署修复脚本
 * 自动修复常见的部署连接问题
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// 读取用户输入
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// 备份文件
function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    success(`已备份 ${filePath} 到 ${backupPath}`);
    return backupPath;
  }
  return null;
}

// 修复前端环境配置
async function fixFrontendEnv() {
  info('\n=== 修复前端环境配置 ===');
  
  const envPath = path.join(process.cwd(), '.env');
  
  // 备份当前配置
  backupFile(envPath);
  
  const domain = await askQuestion('请输入您的域名 (例如: https://sport.yourdomain.com): ');
  
  if (!domain) {
    error('域名不能为空');
    return false;
  }
  
  const envContent = `# 生产环境配置
REACT_APP_API_BASE_URL=${domain}/api
REACT_APP_ENV=production
`;
  
  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    success('前端环境配置已更新');
    return true;
  } catch (err) {
    error(`写入.env文件失败: ${err.message}`);
    return false;
  }
}

// 修复后端环境配置
async function fixBackendEnv() {
  info('\n=== 修复后端环境配置 ===');
  
  const envServerPath = path.join(process.cwd(), '.env.server');
  
  // 备份当前配置
  backupFile(envServerPath);
  
  const domain = await askQuestion('请输入您的域名 (例如: https://sport.yourdomain.com): ');
  
  if (!domain) {
    error('域名不能为空');
    return false;
  }
  
  const envServerContent = `# 服务器环境变量配置
# CORS 允许的域名列表（用逗号分隔）
CORS_ORIGINS=${domain}

# 服务器端口
PORT=3457

# Node 环境
NODE_ENV=production

# API基础URL（用于生成完整URL）
API_BASE_URL=${domain}
`;
  
  try {
    fs.writeFileSync(envServerPath, envServerContent, 'utf8');
    success('后端环境配置已更新');
    return true;
  } catch (err) {
    error(`写入.env.server文件失败: ${err.message}`);
    return false;
  }
}

// 重新构建项目
async function rebuildProject() {
  info('\n=== 重新构建项目 ===');
  
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    log('正在清理旧构建...');
    const cleanProcess = spawn('cmd', ['/c', 'rmdir', '/s', '/q', 'build'], { stdio: 'inherit' });
    
    cleanProcess.on('close', (code) => {
      log('开始构建生产版本...');
      const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
      
      buildProcess.on('close', (buildCode) => {
        if (buildCode === 0) {
          success('项目构建成功');
          resolve(true);
        } else {
          error(`项目构建失败，退出码: ${buildCode}`);
          resolve(false);
        }
      });
      
      buildProcess.on('error', (err) => {
        error(`构建过程错误: ${err.message}`);
        resolve(false);
      });
    });
  });
}

// 创建测试HTML文件
function createTestFile() {
  info('\n=== 创建测试文件 ===');
  
  const testHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>部署测试 - 运动会管理系统</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .loading { background-color: #d1ecf1; border-color: #bee5eb; }
        button { padding: 10px 15px; margin: 5px; cursor: pointer; }
        #results { margin-top: 20px; }
    </style>
</head>
<body>
    <h1>🏃‍♂️ 运动会管理系统 - 部署测试</h1>
    <p>当前域名: <span id="domain"></span></p>
    <p>当前时间: <span id="time"></span></p>
    
    <div>
        <button onclick="testAPI('/api/health')">测试健康检查</button>
        <button onclick="testAPI('/api/data')">测试数据获取</button>
        <button onclick="testAll()">运行所有测试</button>
    </div>
    
    <div id="results"></div>
    
    <script>
        document.getElementById('domain').textContent = window.location.origin;
        document.getElementById('time').textContent = new Date().toLocaleString();
        
        function addResult(title, content, type) {
            const results = document.getElementById('results');
            const div = document.createElement('div');
            div.className = 'test ' + type;
            div.innerHTML = '<h3>' + title + '</h3><pre>' + content + '</pre>';
            results.appendChild(div);
        }
        
        async function testAPI(endpoint) {
            const url = window.location.origin + endpoint;
            addResult('正在测试: ' + url, '请稍候...', 'loading');
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    addResult('✅ 成功: ' + endpoint, 
                        '状态码: ' + response.status + '\n' +
                        '响应: ' + JSON.stringify(data, null, 2), 'success');
                } else {
                    addResult('❌ 失败: ' + endpoint, 
                        '状态码: ' + response.status + '\n' +
                        '错误: ' + JSON.stringify(data, null, 2), 'error');
                }
            } catch (error) {
                addResult('❌ 错误: ' + endpoint, 
                    '错误类型: ' + error.name + '\n' +
                    '错误信息: ' + error.message, 'error');
            }
        }
        
        async function testAll() {
            document.getElementById('results').innerHTML = '';
            await testAPI('/api/health');
            await testAPI('/api/data');
        }
        
        // 页面加载时自动运行测试
        window.onload = function() {
            setTimeout(testAll, 1000);
        };
    </script>
</body>
</html>`;
  
  try {
    fs.writeFileSync('test_deploy.html', testHtml, 'utf8');
    success('测试文件已创建: test_deploy.html');
    return true;
  } catch (err) {
    error(`创建测试文件失败: ${err.message}`);
    return false;
  }
}

// 主函数
async function main() {
  log('🏃‍♂️ 运动会管理系统 - 快速部署修复工具', 'bright');
  log('================================================', 'bright');
  
  info('本工具将帮助您快速修复部署连接问题');
  info('请确保您已经准备好域名信息\n');
  
  const choice = await askQuestion('请选择修复类型 (1-前端, 2-后端, 3-全部, 4-仅创建测试文件): ');
  
  let success = false;
  
  switch (choice) {
    case '1':
      success = await fixFrontendEnv();
      break;
    case '2':
      success = await fixBackendEnv();
      break;
    case '3':
      const frontendOk = await fixFrontendEnv();
      const backendOk = await fixBackendEnv();
      
      if (frontendOk && backendOk) {
        const rebuild = await askQuestion('\n是否重新构建项目? (y/n): ');
        if (rebuild.toLowerCase() === 'y') {
          success = await rebuildProject();
        } else {
          success = true;
        }
      }
      break;
    case '4':
      success = createTestFile();
      break;
    default:
      error('无效选择');
      return;
  }
  
  if (success) {
    createTestFile();
    
    success('\n🎉 修复完成！');
    info('下一步操作:');
    info('1. 访问 test_deploy.html 进行测试');
    info('2. 检查浏览器控制台是否有错误');
    info('3. 如果仍有问题，请查看详细日志');
  } else {
    error('\n❌ 修复过程中出现错误');
    info('请查看错误信息并手动修复');
  }
  
  const wait = await askQuestion('\n按回车键退出...');
}

// 错误处理
process.on('unhandledRejection', (err) => {
  error(`未处理的错误: ${err.message}`);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main().catch(err => {
    error(`程序执行失败: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };