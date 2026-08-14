/**
 * DeepSeek Harness 桌面端 - 主进程
 *
 * 职责：
 *  1. 检查 Harness Web 服务（默认 http://127.0.0.1:3080）是否已在运行；
 *     未运行时，自动在后台用 `node --import tsx/esm apps/cli/src/bin.ts web`
 *     启动它（工作目录为仓库根目录）。
 *  2. 等待服务就绪后，在 Electron 窗口中加载 Web UI。
 *  3. 关闭窗口时最小化到系统托盘，服务继续在后台运行；
 *     托盘菜单「退出」才会停止本次由本应用拉起的 Harness 进程。
 */

const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron')
const { spawn } = require('node:child_process')
const { existsSync, mkdirSync, appendFileSync, writeFileSync } = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const net = require('node:net')

// 兜底错误日志：任何未捕获异常都落到工作目录，便于排查启动失败
process.on('uncaughtException', (err) => {
  try {
    appendFileSync(path.join(__dirname, 'crash.log'), `[${new Date().toISOString()}] ${err.stack || err}\n`, 'utf8')
  } catch { /* ignore */ }
  console.error(err)
})
process.on('unhandledRejection', (reason) => {
  try {
    appendFileSync(path.join(__dirname, 'crash.log'), `[${new Date().toISOString()}] unhandledRejection: ${reason}\n`, 'utf8')
  } catch { /* ignore */ }
  console.error(reason)
})

// ---------------------------------------------------------------------------
// 配置
// ---------------------------------------------------------------------------

const DEFAULT_REPO = 'C:\\Users\\tianj\\deepseek-harness'
const DEFAULT_PORT = 3080

const HARNESS_URL = () => `http://127.0.0.1:${config.port}`
const IS_WINDOWS = process.platform === 'win32'

/** 从用户数据目录读取/合并 settings.json */
function loadSettings() {
  const file = path.join(app.getPath('userData'), 'settings.json')
  let settings = {}
  try {
    settings = JSON.parse(require('node:fs').readFileSync(file, 'utf8'))
  } catch { /* 首次运行没有设置文件 */ }
  return {
    repoPath: settings.repoPath || process.env.DSH_DESKTOP_REPO || DEFAULT_REPO,
    port: Number(settings.port || process.env.DSH_DESKTOP_PORT || DEFAULT_PORT),
  }
}

/** 把设置写回用户数据目录 */
function saveSettings(next) {
  const file = path.join(app.getPath('userData'), 'settings.json')
  try { writeFileSync(file, JSON.stringify(next, null, 2), 'utf8') } catch (e) { /* ignore */ }
}

const config = loadSettings()

// ---------------------------------------------------------------------------
// 日志
// ---------------------------------------------------------------------------

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`
  console.log(line)
  try {
    const dir = path.join(app.getPath('userData'), 'logs')
    mkdirSync(dir, { recursive: true })
    appendFileSync(path.join(dir, 'harness.log'), line + '\n', 'utf8')
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Harness 进程管理
// ---------------------------------------------------------------------------

let harnessProcess = null   // 本应用拉起的子进程
let weStartedIt = false     // 服务是否由本应用启动（决定退出时是否终止）

/** 判断服务是否已经就绪（HTTP 可达） */
function probeReady(timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.get(HARNESS_URL(), { timeout: timeoutMs }, (res) => {
      res.resume()
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
  })
}

/** 等待服务就绪，最多 waitMs 毫秒 */
async function waitForReady(waitMs = 120000, intervalMs = 600) {
  const deadline = Date.now() + waitMs
  while (Date.now() < deadline) {
    if (await probeReady()) return true
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return false
}

/**
 * 定位系统 Node.js 可执行文件。
 * 打包后不能使用 Electron 自带的 Node（exe 不接收 node CLI 参数），
 * 必须找到独立的 node.exe：优先环境变量 DSH_DESKTOP_NODE，
 * 其次 PATH 中的 node，最后常见安装目录。
 */
function findNodeBinary() {
  const candidates = []
  if (process.env.DSH_DESKTOP_NODE) candidates.push(process.env.DSH_DESKTOP_NODE)
  candidates.push('node')
  candidates.push('C:\\Program Files\\nodejs\\node.exe')
  candidates.push('C:\\Program Files (x86)\\nodejs\\node.exe')
  candidates.push('D:\\Program Files\\nodejs\\node.exe')
  for (const cand of candidates) {
    try {
      const { execFileSync } = require('node:child_process')
      const out = execFileSync(cand, ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
      if (/^v\d+\.\d+\.\d+$/.test(out)) {
        // PATH 里的 "node" 解析成绝对路径
        if (cand === 'node') {
          const resolved = execFileSync('node', ['-e', 'console.log(process.execPath)']).toString().trim()
          if (resolved) return resolved
        }
        return cand
      }
    } catch { /* 尝试下一个 */ }
  }
  return null
}

/** 启动 Harness：node --import tsx/esm apps/cli/src/bin.ts web */
function startHarness() {
  if (!existsSync(config.repoPath)) {
    log(`仓库路径不存在: ${config.repoPath}`)
    return null
  }
  const nodeBin = findNodeBinary()
  if (!nodeBin) {
    log('未找到系统 Node.js，无法启动 Harness')
    return null
  }
  const args = ['--import', 'tsx/esm', 'apps/cli/src/bin.ts', 'web']
  log(`启动 Harness: ${nodeBin} ${args.join(' ')}  (cwd=${config.repoPath})`)
  const child = spawn(nodeBin, args, {
    cwd: config.repoPath,
    windowsHide: true,          // 不弹出控制台窗口
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  })
  child.stdout.on('data', (d) => log(`[harness] ${d.toString().trimEnd()}`))
  child.stderr.on('data', (d) => log(`[harness:err] ${d.toString().trimEnd()}`))
  child.on('exit', (code, signal) => {
    log(`Harness 进程退出 code=${code} signal=${signal}`)
    harnessProcess = null
  })
  return child
}

/** 终止由本应用拉起的 Harness 进程（含子进程树） */
function stopHarness() {
  if (!harnessProcess || harnessProcess.exitCode !== null) {
    harnessProcess = null
    return
  }
  log('停止 Harness 进程')
  if (IS_WINDOWS) {
    try { spawn('taskkill', ['/pid', String(harnessProcess.pid), '/T', '/F'], { windowsHide: true }) } catch { /* ignore */ }
  } else {
    try { harnessProcess.kill('SIGTERM') } catch { /* ignore */ }
  }
  harnessProcess = null
}

// ---------------------------------------------------------------------------
// 窗口与托盘
// ---------------------------------------------------------------------------

let mainWindow = null
let tray = null
let loadingWindow = null

function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 420,
    height: 220,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  })
  loadingWindow.loadFile(path.join(__dirname, 'loading.html'))
  loadingWindow.once('ready-to-show', () => loadingWindow.show())
  loadingWindow.on('closed', () => { loadingWindow = null })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // 外部链接用系统浏览器打开，避免在应用内导航离开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
      return { action: 'allow' }
    }
    require('electron').shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://127.0.0.1') && !url.startsWith('http://localhost')) {
      event.preventDefault()
      require('electron').shell.openExternal(url)
    }
  })

  // F12 打开开发者工具，便于排查问题
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      mainWindow.webContents.toggleDevTools()
    }
  })

  // 关闭窗口 → 隐藏到托盘（服务继续运行）
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.once('ready-to-show', () => { log('主窗口 ready-to-show'); mainWindow.show() })
  mainWindow.webContents.on('did-finish-load', () => log('页面加载完成'))
  mainWindow.webContents.on('did-fail-load', (e, code, desc) => log(`页面加载失败 code=${code} desc=${desc}`))
  mainWindow.on('closed', () => { mainWindow = null })

  mainWindow.loadURL(HARNESS_URL())
  return mainWindow
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png')
  let image
  try {
    image = nativeImage.createFromPath(iconPath)
    if (process.platform === 'win32') image = image.resize({ width: 16, height: 16 })
  } catch { image = nativeImage.createEmpty() }
  tray = new Tray(image)
  tray.setToolTip('DeepSeek Harness 桌面端')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '打开主界面', click: showMainWindow },
    { type: 'separator' },
    {
      label: '退出（停止 Harness）',
      click: () => { isQuitting = true; app.quit() },
    },
  ]))
  tray.on('click', showMainWindow)
}

function showMainWindow() {
  if (!mainWindow) {
    mainWindow = createMainWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

let isQuitting = false
app.on('before-quit', () => { isQuitting = true })

// 单实例：重复启动时聚焦已有窗口
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', showMainWindow)

  app.whenReady().then(async () => {
    log(`DeepSeek Harness 桌面端启动  port=${config.port}  repo=${config.repoPath}`)

    // 1) 服务已在运行 → 直接打开界面
    let ready = await probeReady(2000)
    log(`probeReady => ${ready}`)
    if (!ready) {
      // 2) 否则后台启动 Harness
      harnessProcess = startHarness()
      if (harnessProcess) {
        weStartedIt = true
        createLoadingWindow()
        ready = await waitForReady()
        if (loadingWindow) { loadingWindow.close(); loadingWindow = null }
      }
    }

    if (!ready) {
      log('服务启动失败或超时')
      const { dialog } = require('electron')
      const choice = await dialog.showMessageBox({
        type: 'error',
        title: '启动失败',
        message: '无法启动 DeepSeek Harness 服务',
        detail: `仓库路径: ${config.repoPath}\n端口: ${config.port}\n\n点击「设置」修改仓库路径或端口，点击「重试」再次尝试。`,
        buttons: ['设置', '重试', '退出'],
        defaultId: 1,
      })
      if (choice.response === 0) openSettingsDialog()
      else if (choice.response === 1) { stopHarness(); app.relaunch(); app.exit(0) }
      else app.quit()
      return
    }

    createMainWindow()
    createTray()
  })

  app.on('window-all-closed', (event) => {
    // 窗口关闭后继续驻留托盘，不退出
  })

  app.on('activate', showMainWindow)

  app.on('quit', () => {
    // 只在服务由本应用拉起时终止它；用户自己启动的服务不碰
    if (weStartedIt) stopHarness()
  })
}

// ---------------------------------------------------------------------------
// 设置对话框（简单起见：直接调用资源管理器定位仓库，或提示手动编辑 settings.json）
// ---------------------------------------------------------------------------

function openSettingsDialog() {
  const { dialog } = require('electron')
  const chosen = dialog.showOpenDialogSync({
    title: '选择 DeepSeek Harness 仓库目录',
    properties: ['openDirectory'],
    defaultPath: config.repoPath,
  })
  if (chosen && chosen[0]) {
    config.repoPath = chosen[0]
    saveSettings(config)
    log(`仓库路径已更新为: ${config.repoPath}`)
    app.relaunch()
    app.exit(0)
  }
}
