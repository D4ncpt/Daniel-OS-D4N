# D4NOS

D4NOS 是 Daniel 的个人工作台 PWA。它包含 Dashboard、Tasks、CFA Study Path、Career Tracker、Notes、Daily Wisdom、Daniel 妙妙工具台、Summary 和 localStorage 持久化，可以安装到手机主屏幕并在缓存完成后离线打开。

## 本地运行

无需安装依赖。在项目目录运行：

```bash
python3 -m http.server 4173
```

访问 `http://localhost:4173`。请使用本地服务器，不要直接双击 `index.html`。

## Build

项目的 build 仅复制静态生产文件，不编译或改写业务代码：

```bash
npm run build
```

输出目录为 `dist/`。预览生产输出：

```bash
npm run preview
```

然后访问 `http://localhost:4173`。

## 部署到 GitHub Pages

网站使用独立的 `gh-pages` 分支发布，`main` 保存源码，`gh-pages` 保存 `dist/` 静态网站。

1. 在 GitHub 新建一个空仓库，例如 `D4NOS`。
2. 将本地项目推送到仓库的 `main` 分支。
3. 运行 `npm run build` 生成 `dist/`。
4. 将 `dist/` 内容推送到 `gh-pages` 分支。
5. 在仓库 **Settings → Pages** 中选择 **Deploy from a branch**，分支选 `gh-pages`、目录选 `/ (root)`。

仓库为 `D4NOS` 时，默认网址通常是：

```text
https://你的GitHub用户名.github.io/D4NOS/
```

manifest、图标、Service Worker 和离线缓存均使用仓库相对路径，因此可以在 GitHub Pages 的项目子路径中运行。

## 部署到 Vercel

仓库已包含 `vercel.json`，Vercel 会执行 `npm run build` 并部署 `dist/`。

1. 将项目推送到 GitHub。
2. 在 Vercel 中选择 **Add New → Project** 并导入仓库。
3. 保持 Build Command 与 Output Directory 使用仓库配置。
4. 点击 Deploy。

也可以在项目目录使用 Vercel CLI：

```bash
npx vercel
```

正式环境必须使用 HTTPS，Vercel 默认会提供 HTTPS。

## 安装到 iPhone 主屏幕

1. 使用 iPhone Safari 打开 GitHub Pages 的 HTTPS 地址，例如 `https://你的用户名.github.io/D4NOS/`。
2. 点击 Safari 底部的分享按钮。
3. 选择“添加到主屏幕”。
4. 确认名称后点击“添加”。

从主屏幕打开后，D4NOS 会使用独立窗口、竖屏方向和 iPhone 安全区布局运行。Safari 不支持网页直接触发系统安装框，因此网站只会显示一次轻量提示并引导使用分享菜单。

## 在 Android 安装

使用 Chrome 打开 HTTPS 地址。出现安装提示时点击 **Install**，也可以从浏览器菜单选择“安装应用”或“添加到主屏幕”。

## 测试 PWA

在桌面 Chrome 中：

1. 打开 `http://localhost:4173`。
2. 打开 DevTools → Application。
3. 在 Manifest 中确认名称、图标、主题色和 standalone 状态。
4. 在 Service Workers 中确认 `service-worker.js` 为 activated and running。
5. 在线打开一次网站，让核心资源进入缓存。
6. 在 Network 面板选择 Offline，然后刷新页面。
7. 首页和已缓存的模块应继续打开，localStorage 数据应保持不变。

局域网地址如 `http://192.168.x.x:4173` 可以用于普通手机预览，但通常不属于 Service Worker 所需的安全上下文。手机端完整 PWA 测试请使用 Vercel HTTPS 地址。

## 智能速记

顶部“智能添加”会在本地识别任务、职业投递、备忘录和总结。职业投递使用以下格式时拆分最准确：

```text
投递：公司｜岗位｜地点｜状态
```

例如：`投递：Apple｜Product Intern｜上海｜已投递`。识别过程完全在浏览器内完成。

## CFA 学习路径

CFA 页面按照以下顺序组织学习内容：Quantitative Methods、Economics、Financial Statement Analysis、Corporate Finance / Issuers、Equity Investments、Fixed Income、Derivatives、Alternative Investments、Portfolio Management、Ethical and Professional Standards。完成当前阶段的全部主题后，下一阶段会自动解锁；勾选状态保存在当前设备的 localStorage 中。

## 每日卡片公式

每日卡片采用《梅花易数》卷一的“物数占例”：

```text
上卦 = 输入数字 ÷ 8 的余数
下卦 =（输入数字 + 当前时辰序数）÷ 8 的余数
动爻 =（输入数字 + 当前时辰序数）÷ 6 的余数
```

余数为 0 时，八卦按 8、动爻按 6 处理。计算和 64 卦资料均在本地完成。

起卦后，详细页面会结合本卦、上下卦、动爻、变卦和体用关系，提供决策、事业、经商与出行四类精简注释。

Daniel 妙妙工具台与每日一卦相互独立。它支持寻找失物、进退二选一、事业学业、关系沟通、出行安排、财务交易和通用问事，并将每次问题与详细回答保存在 `danielCenter.divinations`。

## 项目结构

```text
index.html          应用壳、PWA meta 和导航
styles.css          设计系统、组件和响应式样式
manifest.json       PWA 名称、显示模式、主题与图标
service-worker.js   离线缓存和旧缓存清理
icons/              PWA 与 iOS 主屏幕图标
src/app.js          页面渲染、交互和 Service Worker 注册
src/store.js        现有 localStorage 数据接口
src/cfa-data.js     CFA 阶段、主题顺序与稳定主题 ID
src/daniel-toolkit.js Daniel 妙妙工具台的场景与详细回答模板
src/hexagrams.js    64 卦名称与行动解释
src/meihua.js       梅花易数起卦公式与变卦计算
scripts/build.mjs   静态生产构建脚本
vercel.json         Vercel 构建与 Service Worker 缓存头
```

## 数据说明

现有 `danielCenter.tasks`、`applications`、`notes`、`summaries` 和 `dailyCards` 键保持不变；`danielCenter.cfaProgress` 保存 CFA 进度，`danielCenter.divinations` 保存 Daniel 妙妙工具台的问事记录。PWA 缓存只保存静态文件，不会读取、覆盖或删除 localStorage 内容。不同设备之间暂时不会自动同步数据。
