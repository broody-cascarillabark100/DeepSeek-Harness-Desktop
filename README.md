# DeepSeek Harness Desktop

English | [中文](README.zh-CN.md)

[![GitHub release](https://img.shields.io/github/v/release/Ch0uHuaZ1/DeepSeek-Harness-Desktop?style=for-the-badge&label=Download&color=4d6bfe)](https://github.com/Ch0uHuaZ1/DeepSeek-Harness-Desktop/releases/latest)
[![License](https://img.shields.io/github/license/Ch0uHuaZ1/DeepSeek-Harness-Desktop?style=for-the-badge&color=green)](LICENSE)

A one-click desktop application for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).
Double-click the icon and start using it — no need to open a terminal or cd into the git repository
every time.

> **Note:** This is a companion launcher for the DeepSeek Harness developer preview. DeepSeek Harness
> itself is iterating rapidly and **there will be compatibility-breaking changes**.

## ✨ Features

- **One-click launch** — Detects the Harness service (default `http://127.0.0.1:3080`). If it is not
  running, the app starts it in the background using the repository's
  `node --import tsx/esm apps/cli/src/bin.ts web` command, waits until it is ready, and opens the
  Web UI inside the app window.
- **Runs in the background** — Closing the window minimizes to the system tray and the Harness
  service keeps running. Choose **Exit (Stop Harness)** from the tray menu to stop the process
  started by this app.
- **Never hijacks an existing service** — If you already started Harness manually, the app reuses it
  and will not kill it on exit.
- **Single instance** — Launching the app again focuses the existing window instead of starting a
  second server.
- **F12** opens the developer tools inside the window.

## 🚀 Quick Start

### Option 1: Install the packaged application (recommended)

1. Download the installer from the **Releases** page: `DeepSeek Harness 桌面端 Setup 1.0.0.exe`
2. Run the installer. A **DeepSeek Harness** shortcut is added to your desktop and Start Menu.
3. Double-click the shortcut. That's it.

### Option 2: Run from source (for development)

```powershell
cd "D:\DeepSeek Harness 桌面端"
npm install --cache "D:\DeepSeek Harness 桌面端\.npm-cache"
npm start
```

### Build the installer yourself

```powershell
.\build.ps1    # one-click build (handles dependencies, Electron binary, and toolchain cache)
```

The `build.ps1` script automatically prefetches the winCodeSign / NSIS / nsis-resources toolchain
into `%LOCALAPPDATA%\electron-builder\Cache`, which avoids extraction failures caused by missing
symbolic-link privileges on some Windows accounts.

## ⚙️ Configuration

The app reads its settings from `%APPDATA%\dsh-desktop\settings.json`:

```json
{
  "repoPath": "C:\\Users\\tianj\\deepseek-harness",
  "port": 3080
}
```

Environment variables `DSH_DESKTOP_REPO` and `DSH_DESKTOP_PORT` override these values.
If startup fails, a dialog lets you pick another repository directory or retry.

## 📋 Requirements

- Windows 10/11
- [Node.js](https://nodejs.org) >= 22 installed
- The DeepSeek Harness repository, already set up with `pnpm install && pnpm run build`

## 🗂 Logs

Runtime logs are written to `%APPDATA%\dsh-desktop\logs\harness.log`.

## 📁 Repository Layout

```
.
├── main.js            # Electron main process (service detection / spawn / tray / single-instance)
├── preload.js         # Preload script (exposes read-only version info)
├── loading.html       # Loading screen while the service starts
├── icon-source.svg    # DeepSeek color logo (source)
├── icon.png / icon.ico# App icons (rendered from the SVG)
├── build.ps1          # One-click build script for the NSIS installer
├── package.json       # npm project + electron-builder configuration
└── README.md          # This file
```

## 📄 License

[MIT](LICENSE)

DeepSeek Harness and the DeepSeek logo belong to their respective owners.
