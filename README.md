# BLUE & WHITE

五幕青花瓷数字展览与终章，含独立的六工序 DIY 工作台。

## 本地运行

```powershell
npm install
npm run dev -- --port 5175 --strictPort
```

访问 http://127.0.0.1:5175/ 。恢复任务时已确认既有服务在该地址返回 HTTP 200；无需重复启动。

```powershell
npm run build
npx vite preview --host 127.0.0.1 --port 5180
```

## 可重复浏览器验收

```powershell
npx playwright install chromium
node scripts/refinement-qa.mjs
node scripts/refinement-final.mjs
node scripts/refinement-resilience.mjs
node scripts/production-smoke.mjs
```

脚本使用 Chromium / 软件 WebGL，实际访问 127.0.0.1:5175。验收时请保持 Vite 运行，避免同时编辑源码触发热更新。终点验收等待场景实际达到终态，并记录浏览器帧中的相机、模型位置、比例、透明度和动画进度。

- `qa/refinement-round1`：第一轮 17 张完整画面。
- `qa/refinement-round2`：第二轮五幕、三种材料、八件藏品、六工序、桌面/移动交互与录像。
- `qa/refinement-final`：针对第二轮发现的问题完成修正后的转场连续截图、逐帧 JSON、移动端和录像。
- `qa/refinement-resilience`：主动阻断资源的故障反馈检查。
- `qa/production`：生产构建预览检查。

旧验收目录和脚本作为历史证据保留；旧 `acceptance.mjs` 包含已变化的 UI 选择器，请使用上述当前脚本。

## 素材与来源

原始 GLB 和藏品原图均保留。藏品透明底输出位于 `public/images/cutouts`，使用原图像素、人工轮廓约束与 GrabCut，不生成或重绘文物。可重复执行 `python scripts/cutouts.py`，需 Pillow、NumPy、opencv-python-headless。

三张材料图的作者、来源、许可和改动说明见 `docs/MATERIAL_CREDITS.json` 及 `public/credits.html`。高岭土图为 USGS 公共领域资料；矿石与施釉图采用 CC BY 4.0。施釉照片明确标注为法国 Taizé 工坊的一般工序，不宣称是景德镇现场或特定透明釉配方。项目既有藏品照片和视频的公开发布许可仍需由素材提供方确认；本轮处理不产生新的使用权。

网页视频为 H.264/AAC，保存在 `public/videos/web`。原始约 79 MB 的高面数 GLB 完整保留，软件渲染或低性能移动设备仍可能较慢。
