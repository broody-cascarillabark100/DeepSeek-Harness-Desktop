/**
 * preload.js - 通过 contextBridge 暴露少量只读信息给渲染进程。
 * 目前 Harness Web UI 由服务器端渲染，无需注入额外 API，
 * 这里仅提供版本与平台信息，方便排查问题。
 */
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('dshDesktop', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
})
