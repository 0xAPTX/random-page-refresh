# 随机刷新

一个用于 Chrome 和 Edge 的扩展，可以自动刷新你选中的网页。首次开启会先等待 **10–20 分钟**。每次刷新后再独立随机抽取下一轮间隔，精确到秒，两个端点都可能抽到。

## 安装教程

1. 在本仓库首页点击 **Code → Download ZIP**，解压下载的文件。在解压目录中找到 `manifest.json`。[GitHub 下载说明](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives#downloading-source-code-archives-from-the-repository-view)
2. 在 Chrome 地址栏输入 `chrome://extensions/`，或在 Edge 地址栏输入 `edge://extensions/`。
3. 打开 **开发者模式**，点击 **加载已解压的扩展程序**，选择直接包含 `manifest.json` 的文件夹。[Chrome 安装说明](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) · [Edge 安装说明](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading)
4. 在浏览器工具栏打开 **扩展程序**菜单，找到 **随机刷新**。也可以将它固定到工具栏，方便查看和停止。

## 操作手册

| 操作 | 步骤与结果 |
| --- | --- |
| 开启自动刷新 | 打开目标网页，点击 **随机刷新 → 开启随机刷新**。看到倒计时就表示已开启。 |
| 查看倒计时 | 回到已开启的标签页，再点一次扩展图标。倒计时显示距离下一次刷新的时间。 |
| 后台运行 | 关闭弹窗或切换到其他标签页即可。只要浏览器保持运行，原标签页仍会计时。 |
| 刷新多个网页 | 在每个目标标签页分别开启。各标签页独立抽取间隔，可以分别停止。 |
| 停止自动刷新 | 回到目标标签页，点击 **随机刷新 → 停止刷新**。关闭标签页也会停止计时。 |
| 对新地址开启 | 网页地址发生变化时，原计时结束。在新地址打开扩展，重新点击 **开启随机刷新**。 |
| 重启后继续使用 | 重启浏览器后，打开目标网页并重新开启。 |

## 常见问题

**加载时提示找不到 `manifest.json`。** 检查 ZIP 是否已解压，再选择解压结果中直接包含 `manifest.json` 的文件夹。

**按钮不可用，提示「请在普通网页中使用」。** 切换到一个已加载完成的 `http://` 或 `https://` 网页，再打开扩展。浏览器设置页、新标签页和本地文件不在支持范围内。

**倒计时到零后还没刷新。** 电脑休眠或浏览器延后定时任务时，实际刷新也会推迟。唤醒电脑后，浏览器会处理到期的任务。[Chrome 定时任务说明](https://developer.chrome.com/docs/extensions/reference/api/alarms#concepts_and_usage)

**刷新后倒计时消失。** 检查网页是否在刷新时跳转到其他地址，例如登录页。扩展会停止原地址的计时。

## 更新与卸载

- **更新扩展**。从 GitHub 下载新版，将解压后的文件覆盖到原扩展文件夹。在浏览器扩展管理页找到 **随机刷新**，点击 **重新加载**，然后在目标网页重新开启。
- **卸载扩展**。打开浏览器扩展管理页，在 **随机刷新** 卡片上点击 **移除**。
