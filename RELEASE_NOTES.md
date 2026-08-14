# DeepSeek Harness Desktop v1.0.0

A one-click desktop application for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).
Double-click the icon and start using it — no terminal, no `cd` into the git repository every time.

---

## ✨ Highlights

- **One-click launch** — Detects the Harness service (default `http://127.0.0.1:3080`). If it is not running, the app starts it in the background, waits until it is ready, and opens the Web UI inside the app window.
- **Runs in the background** — Closing the window minimizes to the system tray and the service keeps running. Choose **Exit (Stop Harness)** from the tray menu to stop the process started by this app.
- **Never hijacks an existing service** — If you already started Harness manually, the app reuses it and will not kill it on exit.
- **Single instance** — Launching the app again focuses the existing window instead of starting a second server.
- **HD icon** — Uses the official DeepSeek color logo, rendered from 16 to 256 px across all Windows UI sizes.

## 🚀 Install

1. Download and run `DeepSeek Harness 桌面端 Setup 1.0.0.exe`
2. After installation, a **DeepSeek Harness** shortcut is added to your desktop and Start Menu
3. Double-click the shortcut and you're done

**Requirements**:
- Windows 10 / 11
- [Node.js](https://nodejs.org) ≥ 22
- A DeepSeek Harness repository already set up with `pnpm install && pnpm run build`
  (default path `C:\Users\tianj\deepseek-harness`, configurable)

## ⚙️ Configuration

Settings file: `%APPDATA%\dsh-desktop\settings.json`

```json
{
  "repoPath": "C:\\Users\\tianj\\deepseek-harness",
  "port": 3080
}
```

Environment variables `DSH_DESKTOP_REPO` and `DSH_DESKTOP_PORT` override these values.

## 📋 Known Issues

- First launch waits for the service to become ready (about 10–30 s), showing a loading screen
- If port 3080 is occupied by another program, change the port in settings

## 🔧 Build from Source

```powershell
.\build.ps1    # one-click build (handles dependencies, Electron binary, and toolchain cache)
```

## 🗂 Logs

Runtime logs: `%APPDATA%\dsh-desktop\logs\harness.log`

## 🙏 Credits

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — open-source agent harness framework
- [Electron](https://www.electronjs.org/) — desktop application framework
- [electron-builder](https://www.electron.build/) — build tooling

**Docs**: [README](https://github.com/Ch0uHuaZ1/DeepSeek-Harness-Desktop) | [中文](https://github.com/Ch0uHuaZ1/DeepSeek-Harness-Desktop/blob/main/README.zh-CN.md)

---

# DeepSeek Harness 桌面端 v1.0.0

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的一键桌面应用。
双击图标即可使用，无需打开终端、手动 `cd` 进 git 仓库敲命令。

---

## ✨ 功能亮点

- **一键启动**：双击图标，自动检测 Harness 服务（默认 `http://127.0.0.1:3080`）；未运行时自动在后台拉起，就绪后直接在应用窗口内打开 Web UI。
- **后台驻留**：关闭窗口最小化到系统托盘，服务继续运行；托盘菜单「退出（停止 Harness）」才停止由本应用拉起的进程。
- **不抢已有服务**：已手动启动的 Harness 会被直接复用，退出时不会误杀。
- **单实例**：重复启动会聚焦已有窗口，不会起第二个服务。
- **高清图标**：采用 DeepSeek 彩色 Logo，适配 Windows 16–256 各分辨率场景。

## 🚀 安装

1. 下载并运行 `DeepSeek Harness 桌面端 Setup 1.0.0.exe`
2. 安装完成后，桌面与开始菜单会出现 **DeepSeek Harness** 快捷方式
3. 双击快捷方式即可使用

**环境要求**：
- Windows 10 / 11
- [Node.js](https://nodejs.org) ≥ 22
- DeepSeek Harness 仓库已完成 `pnpm install && pnpm run build`
  （默认路径 `C:\Users\tianj\deepseek-harness`，可在设置中修改）

## ⚙️ 配置

设置文件：`%APPDATA%\dsh-desktop\settings.json`

```json
{
  "repoPath": "C:\\Users\\tianj\\deepseek-harness",
  "port": 3080
}
```

环境变量 `DSH_DESKTOP_REPO`、`DSH_DESKTOP_PORT` 可覆盖以上配置。

## 📋 已知问题

- 首次启动需等待服务就绪（约 10–30 秒），期间显示加载动画
- 若 3080 端口被其他程序占用，请在设置中更换端口

## 🔧 自行构建

```powershell
.\build.ps1    # 一键打包（自动处理依赖、Electron 二进制、工具链缓存）
```

## 🗂 日志

运行日志：`%APPDATA%\dsh-desktop\logs\harness.log`

## 🙏 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — 开源 Agent Harness 框架
- [Electron](https://www.electronjs.org/) — 桌面应用框架
- [electron-builder](https://www.electron.build/) — 打包工具

**完整文档**：[README](https://github.com/Ch0uHuaZ1/DeepSeek-Harness-Desktop) | [English](https://github.com/Ch0uHuaZ1/DeepSeek-Harness-Desktop/blob/main/README.md)
