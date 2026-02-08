# 一键启动所有服务脚本
# 使用方法：在PowerShell中运行 .\start-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   情感语音平台 - 服务启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查后端目录
if (-not (Test-Path "E:\week-hack\backend")) {
    Write-Host "错误: 找不到后端目录" -ForegroundColor Red
    exit 1
}

# 检查前端目录
if (-not (Test-Path "E:\week-hack\frontend")) {
    Write-Host "错误: 找不到前端目录" -ForegroundColor Red
    exit 1
}

# 启动后端服务
Write-Host "正在启动后端服务..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\week-hack\backend; Write-Host '后端服务启动中...' -ForegroundColor Yellow; npm run dev"

Start-Sleep -Seconds 3

# 启动前端服务
Write-Host "正在启动前端服务..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\week-hack\frontend; Write-Host '前端服务启动中...' -ForegroundColor Yellow; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   服务启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后端服务: http://localhost:8000" -ForegroundColor Cyan
Write-Host "前端服务: http://localhost:3000" -ForegroundColor Cyan
Write-Host "健康检查: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 服务已在新的PowerShell窗口中启动" -ForegroundColor Yellow
Write-Host "      关闭对应的窗口即可停止服务" -ForegroundColor Yellow
Write-Host ""


