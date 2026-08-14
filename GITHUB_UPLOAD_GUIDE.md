# 上传到 GitHub 流程 / How to Upload to GitHub

> 以下操作在 Windows PowerShell 中执行。所有命令都请在 `D:\DeepSeek Harness 桌面端` 目录下运行。
> The following steps run in Windows PowerShell, inside `D:\DeepSeek Harness 桌面端`.

---

## 0. 上传前的准备工作 / Before You Start

确认以下文件都在项目目录里（它们会被一并上传）：

| 文件 | 用途 |
| --- | --- |
| `README.md` | 英文主页（English homepage） |
| `README.zh-CN.md` | 中文主页（中文页面，与英文互相切换） |
| `main.js` / `preload.js` / `loading.html` | 应用源码（app source） |
| `icon-source.svg` / `icon.png` / `icon.ico` | 图标（icons） |
| `build.ps1` | 一键打包脚本（one-click build script） |
| `package.json` / `package-lock.json` | npm 项目配置（npm project config） |
| `.gitignore` | 忽略 node_modules / release 等（ignores build artifacts） |
| `LICENSE` | 许可证（MIT，可自行补上） |

> **不要上传**这些：`node_modules`、`release`、`.npm-cache`、`.electron-cache`、`.eb-cache-test`
> （已被 `.gitignore` 排除，无需手动处理）。
> **Do NOT upload:** `node_modules`, `release`, `.npm-cache`, `.electron-cache`, `.eb-cache-test`
> (already excluded by `.gitignore`).

---

## 1. 创建 GitHub 仓库 / Create the Repository

1. 打开 <https://github.com/new>
2. 仓库名（Repository name）建议：`dsh-desktop` 或 `deepseek-harness-desktop`
3. 可见性（Visibility）：Public（公开）或 Private（私有），按你的需要选择
4. **不要勾选** "Add a README file" / "Add .gitignore"（避免冲突，我们本地已有）
5. 点击 **Create repository**

---

## 2. 在本地初始化 Git / Initialize Git Locally

```powershell
cd "D:\DeepSeek Harness 桌面端"

# 1) 初始化仓库（一次即可）
git init

# 2) 把默认分支命名为 main（与 GitHub 一致）
git branch -M main

# 3) 添加所有文件（.gitignore 会自动排除大目录）
git add .

# 4) 查看将要上传的文件清单（确认没有 node_modules / release）
git status
```

> 如果 `git status` 里出现 `node_modules/` 或 `release/`，请检查 `.gitignore` 是否生效。

---

## 3. 首次提交 / First Commit

```powershell
git commit -m "Initial commit: DeepSeek Harness one-click desktop app"
```

> 如果提示需要配置用户名/邮箱，先执行：
> ```powershell
> git config --global user.name "Ch0uHuaZ1"
> git config --global user.email "tinajun.hua@qq.com"
> ```

---

## 4. 关联远程仓库并推送 / Link Remote and Push

把下面的 `YOUR_USERNAME` 和 `REPO_NAME` 换成你自己的：

```powershell
git remote add origin https://github.com/Ch0uHuaZ1/DeepSeek-Harness-Desktop.git
git push -u origin main
```

> 推送时如果弹出登录窗口，选择 **浏览器登录**（推荐）或输入 Personal Access Token。
> 若使用 Token：Settings → Developer settings → Personal access tokens → Tokens (classic)
> → Generate new token → 勾选 `repo` → 复制 token 作为密码粘贴。
>
> If you prefer SSH instead of HTTPS:
> ```powershell
> git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
> git push -u origin main
> ```

---

## 5. 以后更新代码 / Push Updates Later

```powershell
cd "D:\DeepSeek Harness 桌面端"
git add .
git commit -m "Update: describe what changed"
git push
```

---

## 6. 发布安装程序（可选但推荐）/ Release the Installer (optional)

GitHub 支持把安装程序作为 **Release 附件** 提供下载：

1. 打开仓库页面 → 右侧 **Releases** → **Create a new release**
2. Tag：`v1.0.0`；标题：`v1.0.0`
3. 把 `D:\DeepSeek Harness 桌面端\release\DeepSeek Harness 桌面端 Setup 1.0.0.exe`
   拖进 **Attach binaries**（也可同时附上 `.blockmap`）
4. 点击 **Publish release**

之后 README 里的下载链接可写成：
`https://github.com/YOUR_USERNAME/REPO_NAME/releases/latest`

---

## 7. README 语言切换说明 / Language Switching

仓库内有两个文件，顶部互相放链接即可切换（已写好，无需改动）：

- `README.md`（英文）第一行：`English | [中文](README.zh-CN.md)`
- `README.zh-CN.md`（中文）第一行：`[English](README.md) | 中文`

GitHub 会自动把 `README.md` 作为仓库主页展示，用户点击链接即可在两种语言间切换。

---

## 常见问题 / FAQ

**Q: 推送时提示 "remote contains work that you do not have locally"？**
A: 创建仓库时勾选了 README/.gitignore 导致。执行：
```powershell
git pull --rebase origin main
git push
```

**Q: 想把 `release` 里的安装程序也放进仓库？**
A: 不建议（exe 体积大、GitHub 限制单文件 100MB）。请走第 6 步的 Release 附件方式。

**Q: 忘记加 LICENSE？**
A: 在项目目录新建 `LICENSE` 文件，粘贴 MIT 许可证全文，然后重新 `git add . && git commit && git push`。
