# DeepSeek Harness 桌面端

[English](README.md) | 中文

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的一键桌面应用。
双击图标即可使用，无需每次打开终端、手动 `cd` 进 git 仓库敲命令。

> **注意：** 这是 DeepSeek Harness 开发者预览版的配套启动器。DeepSeek Harness 本身迭代很快，
> **未来将出现破坏兼容性的变更。**

## ✨ 功能特性

- **一键启动** — 自动检测 Harness 服务（默认 `http://127.0.0.1:3080`）。未运行时，应用会在后台
  用仓库的 `node --import tsx/esm apps/cli/src/bin.ts web` 命令拉起服务，等待就绪后直接在
  应用窗口内打开 Web UI。
- **后台驻留** — 关闭窗口最小化到系统托盘，Harness 服务继续运行；托盘菜单
  「退出（停止 Harness）」才会停止由本应用拉起的进程。
- **不抢已有服务** — 如果你已经手动启动了 Harness，应用会直接复用，退出时不会误杀它。
- **单实例** — 重复启动会聚焦已有窗口，不会起第二个服务。
- 窗口内按 `F12` 可打开开发者工具。

## 🚀 快速开始

### 方式一：安装打包好的应用（推荐）

1. 从 **Releases** 页面下载安装程序：`DeepSeek Harness 桌面端 Setup 1.0.0.exe`
2. 运行安装程序，桌面和开始菜单会出现 **DeepSeek Harness** 快捷方式。
3. 双击快捷方式即可使用。

### 方式二：从源码运行（开发调试）

```powershell
cd "D:\DeepSeek Harness 桌面端"
npm install --cache "D:\DeepSeek Harness 桌面端\.npm-cache"
npm start
```

### 自行打包安装程序

```powershell
.\build.ps1    # 一键打包（自动处理依赖、Electron 二进制、工具链缓存）
```

`build.ps1` 会自动把 electron-builder 所需的 winCodeSign / NSIS / nsis-resources 工具链预置到
`%LOCALAPPDATA%\electron-builder\Cache`，避免在无符号链接权限的 Windows 账号下打包时下载解压失败。

## ⚙️ 配置

应用读取 `%APPDATA%\dsh-desktop\settings.json` 中的设置：

```json
{
  "repoPath": "C:\\Users\\tianj\\deepseek-harness",
  "port": 3080
}
```

环境变量 `DSH_DESKTOP_REPO`、`DSH_DESKTOP_PORT` 可覆盖上述配置。
启动失败时会弹出对话框，可选择重新选择仓库目录或重试。

## 📋 环境要求

- Windows 10 / 11
- 已安装 [Node.js](https://nodejs.org)（>= 22）
- DeepSeek Harness 仓库已完成 `pnpm install && pnpm run build`

## 🗂 日志

运行日志写入 `%APPDATA%\dsh-desktop\logs\harness.log`。

## 📁 仓库结构

```
.
├── main.js            # Electron 主进程（服务探测 / 拉起 / 托盘 / 单实例）
├── preload.js         # 预加载脚本（暴露只读版本信息）
├── loading.html       # 服务启动时的加载动画页面
├── icon-source.svg    # DeepSeek 彩色 Logo（源文件）
├── icon.png / icon.ico# 应用图标（由 SVG 渲染生成）
├── build.ps1          # 一键打包脚本（生成 NSIS 安装程序）
├── package.json       # npm 项目 + electron-builder 配置
└── README.md          # 本文件
```

## 📄 许可证

[MIT](LICENSE)

DeepSeek Harness 与 DeepSeek 图标归其各自所有者所有。
