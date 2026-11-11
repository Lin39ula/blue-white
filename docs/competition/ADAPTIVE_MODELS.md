# 自适应模型与 Cloudflare Pages 发布

2026-11-11。为满足 Cloudflare Pages 单文件 **25 MiB** 限制，公开网站保留两档离线生成的网页模型；DIY 程序化器物仍与主线模型隔离。

| 档位 | 文件 | 大小 | 三角面 | 最大贴图尺寸 |
| --- | --- | ---: | ---: | ---: |
| 标准 | `public/models/vase-standard.glb` | 5.245 MiB | 150,000 | 2048 |
| 省流 | `public/models/vase-lite.glb` | 1.528 MiB | 37,500 | 1024 |

原始高规格 GLB（75.326 MiB）不再位于部署仓库，必须在仓库外归档；它不会在公开站点被请求。网页版本由 glTF Transform 的网格简化、Meshopt 编码及 Sharp 贴图处理生成，并非 AI 重绘。

自动模式在省流标记、2G/3G 或较低网络速率信息下选择省流版，其余选择标准版。不支持 Network Information API 时先用标准版；标准下载超过 8 秒、平均速率低于 200 KiB/s 且剩余数据超过 512 KiB（或总大小未知）时会改用省流版。手动选择不会被自动降级，当前标签页会话会记住选择。

需要从内部归档重新生成网页模型时，执行：

```powershell
node scripts/optimize-model.mjs <原始GLB的绝对路径>
```

脚本仅输出两档 `public/models/vase-*.glb`。构建后的 `scripts/submission-audit.mjs` 会检查部署目录不含超过 25 MiB 的文件、两档模型齐全、六段网页视频齐全，并拒绝 Git LFS 指针文件。

此前关于「原件可由网页选择」和三档线上模型的记录仅适用于历史 GitHub Pages 验收，不适用于当前 Cloudflare 发布版本。
