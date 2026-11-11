# BLUE & WHITE 一瓷五境

## 作品与选手信息

| 项目 | 信息 |
| --- | --- |
| 作品名称 | BLUE & WHITE 一瓷五境 |
| 参赛类别 | 网页作品 |
| 选手姓名 |  |
| 学院 / 班级 |  |
| 联系方式 |  |
| 队伍成员 |  |

## 作品简介

本作品是一件围绕青花瓷展开的交互式数字展览网页。页面以“遇见器物、材料解构、匠艺体验、经典巡礼、瓷脉新生”为主要内容，结合 3D 器物展示、材料说明、藏品图文、传承人物和六道工序 DIY 工坊，引导用户从器形、材料、工艺和当代传承几个角度认识青花瓷。

作品采用静态网页架构，所有展览数据和本地媒体资源随项目发布，不依赖后端服务、数据库或用户账号。网页支持桌面端和移动端布局，并提供键盘、鼠标拖动、触控和按钮操作。

在线预览：<https://lin39ula.github.io/blue-white/>

## 技术说明

本项目符合选手手册中关于 HTML、CSS、JavaScript 和前端框架的技术范围，使用的主要框架和库如下：

| 技术 | 用途 |
| --- | --- |
| React | 组织页面组件、章节状态和交互逻辑 |
| TypeScript | 为组件、交互状态和 Three.js 对象提供类型检查 |
| Vite | 开发服务器、模块构建和静态资源打包 |
| Three.js | 加载和渲染 GLB 三维模型、灯光、材质和相机 |
| React Three Fiber | 在 React 组件中管理 Three.js Canvas 和渲染循环 |
| Drei | 提供 GLB 加载、环境光、模型居中和边缘线等 Three.js 辅助组件 |
| Playwright | 仅用于本地浏览器验收脚本，不参与网页运行 |

项目没有使用后端框架、服务器端数据库、在线 CMS 或第三方登录服务。`public` 目录中的 JSON、图片、视频和 GLB 文件在构建时作为静态资源发布。

## 本地运行

需要 Node.js 18 或更高版本。

```powershell
npm install
npm run dev -- --host 0.0.0.0 --port 5175 --strictPort
```

开发服务器启动后访问：

```text
http://127.0.0.1:5175/
```

如果需要让同一局域网内的设备访问，请使用本机局域网 IPv4 地址替换 `127.0.0.1`，并允许 Windows 防火墙放行 5175 端口。`npm run dev` 生成的是开发地址，不是稳定的公网参赛链接。

## 构建与预览

```powershell
npm run build
npx vite preview --host 127.0.0.1 --port 5180
```

生产构建输出在 `dist` 目录。GitHub Pages 通过 `.github/workflows/deploy.yml` 自动构建并发布 `dist`；工作流启用了 Git LFS 下载，以确保 3D 模型和视频使用真实文件而不是 LFS 指针。

## 交互内容

- 首页 3D 青花瓷器物支持旋转和缩放。
- 材料解构章节展示瓷胎、钴料和透明釉的关系。
- 青花工坊包含练泥、成型、修坯、绘青花、施釉和烧制六个步骤。
- 经典巡礼包含八件器物的图片、器形、纹饰、胎釉、用途和流传信息。
- 瓷脉新生展示传承人物和创新实践，并提供图文切换。
- 工序视频在 `public/videos/web` 中提供网页播放版本。

## 验收命令

以下脚本用于本地浏览器验收，使用 Chromium 和软件 WebGL：

```powershell
npx playwright install chromium
node scripts/refinement-qa.mjs
node scripts/refinement-final.mjs
node scripts/refinement-resilience.mjs
node scripts/production-smoke.mjs
```

验收输出位于 `qa` 目录。生产构建必须先执行 `npm run build`，再运行生产预览检查。

## 素材、来源与版权说明

- 原始 GLB 模型位于 `模型.glb`，网页使用的副本位于 `public/模型.glb`。
- 藏品原图和透明底处理图位于 `public/images`；透明底图保留原图像素和人工轮廓约束，不生成或重绘文物。
- 网页视频位于 `public/videos` 和 `public/videos/web`。`public/videos/web` 是网页播放用的压缩版本。
- 材料图片的作者、来源、许可和改动说明见 `docs/MATERIAL_CREDITS.json` 与 `public/credits.html`。
- 藏品图片、视频和模型中由参赛者或素材提供方提供的内容，提交前须由参赛者确认拥有公开展示和比赛提交所需的授权。作品遵守“不使用未经授权或侵犯他人知识产权的素材”的要求。

大文件通过 Git LFS 管理。制作比赛压缩包时，请从本地完整工作目录打包，并确认 `.glb` 和 `.mp4` 是实际媒体文件，不是以 `version https://git-lfs.github.com/spec/v1` 开头的文本指针。

## 合规自查

| 手册要求 | 项目情况 | 结论 |
| --- | --- | --- |
| 使用 HTML、CSS、JavaScript 或 Vue / React 等框架 | React、TypeScript、Vite、Three.js | 符合 |
| 可使用预编译库，但需说明库的用途 | 本 README 已列出主要库及用途 | 符合 |
| 提交静态网页，不依赖后台框架或数据库 | 构建产物为 `dist`，无后端和数据库 | 符合 |
| README 说明选手信息、框架、用途和项目内容 | 选手信息栏已预留，待填写 | 基本符合 |
| 不使用未经授权或侵权素材 | 部分用户提供素材的公开展示授权需提交前确认 | 待确认 |
| 按要求提交完整作品压缩包 | 需将源码、README、`public`、`模型.glb` 和视频实际文件一起打包 | 提交前检查 |
