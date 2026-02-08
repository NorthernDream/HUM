# 停止所有服务脚本
# 使用方法：在PowerShell中运行 .\stop-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   停止所有服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 查找Node.js进程
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}

if ($nodeProcesses.Count -eq 0) {
    Write-Host "没有找到运行中的Node.js进程" -ForegroundColor Yellow
    exit 0
}

Write-Host "找到 $($nodeProcesses.Count) 个Node.js进程" -ForegroundColor Yellow
Write-Host ""

# 显示进程信息
foreach ($proc in $nodeProcesses) {
    Write-Host "进程ID: $($proc.Id) | 名称: $($proc.ProcessName) | 内存: $([math]::Round($proc.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
}

Write-Host ""
$confirm = Read-Host "是否停止所有Node.js进程? (Y/N)"

if ($confirm -eq "Y" -or $confirm -eq "y") {
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Host "已停止进程: $($proc.Id)" -ForegroundColor Green
        } catch {
            Write-Host "无法停止进程: $($proc.Id) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host "所有服务已停止" -ForegroundColor Green
} else {
    Write-Host "操作已取消" -ForegroundColor Yellow
}


