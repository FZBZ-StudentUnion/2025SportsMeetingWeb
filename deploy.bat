@echo off
echo "=========================================="
echo "运动会管理系统部署脚本"
echo "=========================================="

:menu
echo.
echo 请选择部署环境：
echo 1. 开发环境 (Development)
echo 2. 生产环境 (Production)
echo 3. 退出
echo.
set /p choice="请输入选项 (1-3): "

if "%choice%"=="1" goto development
if "%choice%"=="2" goto production
if "%choice%"=="3" goto end
echo 无效选项，请重新选择
goto menu

:development
echo.
echo "切换到开发环境配置..."
copy /Y .env .env.production.backup 2>nul
echo REACT_APP_API_BASE_URL=http://localhost:3457 > .env
echo REACT_APP_ENV=development >> .env
echo.
echo "开发环境配置完成！"
echo "请运行: npm run dev"
echo "前端端口: 3456, 后端端口: 3457"
goto end

:production
echo.
echo "切换到生产环境配置..."
echo.
echo "请确保已配置以下环境变量："
echo "- REACT_APP_API_BASE_URL=https://your-domain.com"
echo "- REACT_APP_ENV=production"
echo.
echo "请编辑 .env 文件并设置正确的生产环境配置"
echo.
echo "生产环境配置检查清单："
echo "1. 已设置正确的API基础URL"
echo "2. 已配置CORS_ORIGINS环境变量"
echo "3. 已配置SSL证书"
echo "4. 已配置反向代理（如Nginx）"
echo.
set /p confirm="是否继续构建？ (y/N): "
if /i "%confirm%"=="y" goto build
if /i "%confirm%"=="Y" goto build
echo "取消生产环境部署"
goto end

:build
echo.
echo "开始构建生产版本..."
call npm run build
if %errorlevel% neq 0 (
    echo "构建失败！请检查错误信息"
    goto end
)
echo.
echo "构建完成！"
echo "请将 build 文件夹部署到您的Web服务器"
echo.
echo "部署后请检查："
echo "1. 访问 https://your-domain.com/api/health"
echo "2. 检查浏览器控制台是否有CORS错误"
echo "3. 测试API调用是否正常"
goto end

:end
echo.
echo "部署脚本结束"
pause