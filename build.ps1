# ============================================================
# DeepSeek Harness 桌面端 - 一键打包脚本 (Windows)
#
# 用法：右键"使用 PowerShell 运行"，或：
#   powershell -ExecutionPolicy Bypass -File .\build.ps1
#
# 作用：
#   1. 检查/安装 npm 依赖（跳过 postinstall，规避沙箱限制）
#   2. 检查/安装 Electron 二进制（走国内镜像）
#   3. 检查/预置 electron-builder 工具链缓存（winCodeSign / NSIS）
#   4. 执行 electron-builder 打包，产出 NSIS 安装程序
# ============================================================

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
Set-Location $Root

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

# ------------------------------------------------------------
# 1. 依赖安装（npm 的 postinstall 在受限环境下会被拦，这里跳过，
#    Electron 二进制改由下面第 2 步单独安装）
# ------------------------------------------------------------
Write-Step "1/4 安装 npm 依赖 (electron / electron-builder)"
if (-not (Test-Path "$Root\node_modules\electron-builder\package.json")) {
  npm install --ignore-scripts --no-audit --no-fund --cache "$Root\.npm-cache"
} else {
  Write-Host "依赖已存在，跳过"
}

# ------------------------------------------------------------
# 2. Electron 二进制（postinstall 被跳过，需要手动补装）
# ------------------------------------------------------------
Write-Step "2/4 安装 Electron 二进制"
$electronDir = "$Root\node_modules\electron"
if (-not (Test-Path "$electronDir\dist\electron.exe")) {
  $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
  $env:electron_config_cache = "$Root\.electron-cache"
  Push-Location $electronDir
  node install.js
  Pop-Location
  Write-Host "Electron 二进制安装完成"
} else {
  Write-Host "Electron 二进制已存在，跳过"
}

# ------------------------------------------------------------
# 3. electron-builder 工具链缓存（winCodeSign / NSIS）
#    缓存路径：%LOCALAPPDATA%\electron-builder\Cache
#    预置后 app-builder 的 CheckCache 会直接命中，不再触发
#    有符号链接问题的解压流程。
# ------------------------------------------------------------
Write-Step "3/4 检查 electron-builder 工具链缓存"
$cacheRoot = Join-Path $env:LOCALAPPDATA "electron-builder\Cache"
$env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://registry.npmmirror.com/-/binary/electron-builder-binaries/"

function Ensure-CachedTool {
  param(
    [string]$Name,          # 缓存目录名（如 winCodeSign）
    [string]$FinalDir,      # 最终目录名（如 winCodeSign-2.6.0）
    [string]$VerifyFile,    # 校验文件相对路径
    [string]$VersionDir     # 镜像里的目录名
  )
  $final = Join-Path (Join-Path $cacheRoot $Name) $FinalDir
  $verify = Join-Path $final $VerifyFile
  if (Test-Path $verify) {
    Write-Host "$Name 缓存已就绪"
    return
  }
  Write-Host "准备 $Name ($FinalDir) ..."
  New-Item -ItemType Directory -Path (Split-Path $final) -Force | Out-Null
  $archive = "$final.7z"
  if (-not (Test-Path $archive)) {
    $url = "$env:ELECTRON_BUILDER_BINARIES_MIRROR$VersionDir/$FinalDir.7z"
    Write-Host "下载 $url"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
  }
  $sevenZip = "$Root\node_modules\7zip-bin\win\x64\7za.exe"
  New-Item -ItemType Directory -Path $final -Force | Out-Null
  # 7za 解压符号链接条目在无权限时返回非零，但 Windows 打包所需
  # 的 windows-10 / rcedit 等文件仍会完整解出，这里接受该结果，
  # 并在解压后移除 macOS 用的 darwin 目录。
  & $sevenZip x -bd -y -o"$final" $archive 2>$null | Out-Null
  Remove-Item (Join-Path $final "darwin") -Recurse -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path $verify)) {
    throw "$Name 解压后缺少 $VerifyFile"
  }
  Write-Host "$Name 就绪"
}

Ensure-CachedTool "winCodeSign" "winCodeSign-2.6.0" "windows-10\x64\signtool.exe" "winCodeSign-2.6.0"
Ensure-CachedTool "nsis" "nsis-3.0.4.1" "makensis.exe" "nsis-3.0.4.1"
Ensure-CachedTool "nsis-resources" "nsis-resources-3.4.1" "plugins\x64-unicode\INetC.dll" "nsis-resources-3.4.1"

# ------------------------------------------------------------
# 4. 打包
# ------------------------------------------------------------
Write-Step "4/4 执行 electron-builder 打包"
# npm 会在 stderr 打警告；ErrorActionPreference=Stop 会把这类
# NativeCommandError 当成终止错误，这里临时切回 Continue。
$oldEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
npx electron-builder --win nsis
$buildExit = $LASTEXITCODE
$ErrorActionPreference = $oldEap
if ($buildExit -ne 0) {
  throw "electron-builder 打包失败，退出码 $buildExit"
}
Write-Host "`n打包完成！安装程序位于：" -ForegroundColor Green
Get-ChildItem "$Root\release\*.exe" | ForEach-Object { Write-Host "  $($_.FullName)" -ForegroundColor Green }
