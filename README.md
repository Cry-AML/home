# 文卓谦实验室官方主页 (MCH Laboratory Academic Website)

> **中山大学中山医学院 · 文卓谦实验室**  
> **Laboratory of Cheuk-Him Man (MCH Laboratory), Zhongshan School of Medicine, Sun Yat-sen University**  
> 线上主页：[https://cry-aml.github.io/home/](https://cry-aml.github.io/home/)

本项目基于 **Hugo + Blowfish** 深度架构定制，专为文卓谦教授（Cheuk-Him Man / 文卓谦）课题组打造，提供**双生视觉皮肤体系（Academy 静奢期刊风 / Manuscript 极客手账风）**、**全天候智能节日与周末限定徽标调度引擎**、**三语原生国际化**以及**全流程自动化质量保障门禁**。

---

## 🌟 核心特性 (Key Features)

### 1. 双生视觉皮肤体系 (Dual-Skin Architecture)
无需切换 DOM 结构，通过 `html[data-theme]` 和 View Transitions API 实现 620ms 丝滑遮罩切肤体验：
- **🏛️ Academy（静奢学术期刊风 - 默认）**：
  - 中大翠绿（`#11362d`）+ 暖沙米（`#f3ece3`）+ 古铜棕（`#8c6246`）顶级学术期刊装帧；
  - 沉稳经典的 `Newsreader` 古典衬线标题排版、2px 古铜竖线卡片裹边、横幅贴顶与基准线严密对齐；
  - 漫反射绿瓦光影跟随（`canopy-light.js`）与滚动首屏交错编排（`journal-reveal.js`）。
- **📓 Manuscript（极客学术手账风）**：
  - 拟真纸张质感、手绘墨线印章、彩色荧光笔划线标记与便利贴卡片下落微动效；
  - 带有真实纸本墨迹微渗透与印泥朱砂印记。
- **🪄 全局悬浮魔法棒开关（`.ll-wand`）**：
  - 固定于页面右下角的 44px 极简纯圆悬浮按钮（FAB），一键在期刊与手账之间切换，并同步联动全站人像模式（真实照 $\leftrightarrow$ 二次元动漫插画照）。

### 2. 动态徽标与节日/周末限定系统 (Adaptive Logo & Festival Engine)
内置自动化调度器（`assets/js/festival.js`），支持工作日、周末与重大节日三级优先级智能装配：
- **平日工作日（Weekday Standard）**：
  - 英文页面（`/`、`/team/` 等）展示纯正英文印章徽标（`logo-en.webp`）；
  - 中文页面（`/zh-cn/`、`/zh-tw/`）展示经典篆刻中大医学院印章（`logo-zh.webp`）。
- **英文周末奇幻限定（Weekend Fantasy Edition）**：
  - 周六至周日，英文界面自动切换为暮光城堡徽标（`logo-fantasy.webp`），顶栏与手账自动融入梦幻暮光紫与星尘色调。
- **6 大核心节日限定版（节日前后各 1 天，共 3 天优先激活）**：
  - 精准支持公历节日（**万圣节** 10/30–11/01、**圣诞节** 12/24–12/26）与农历传统节日（**春节**、**元宵节**、**七夕节**、**中秋节** 2025–2030 天文日历折算）；
  - 节日期间，手账本顶部点缀 3.5px 专属限定色纸胶带（Tape Trim），期刊顶栏变换专属节日深色微渐变，Logo 呼吸环同步展现璀璨光晕；
  - **重叠仲裁**：当周末遇上节日时，自动以**节日限定为最高优先级**。
- **🎏 极简测试预览胶囊（Festival Preview Deck）**：
  - 位于页面左下角的 36px 纯圆旗帜图标按钮，支持一键实时预览任意节日或周末限定效果。

### 3. 三语原生国际化 (Trilingual Native i18n)
- **多语言架构**：默认英文（根路径 `/`），简体中文（`/zh-cn/`），繁体中文（`/zh-tw/`）。
- **零 CJK 泄漏安全门禁**：英文页面经 `tools/check-en-no-cjk.py` 自动化检测，严禁出现任何未经转译的中文字符。
- **平滑滚动保持（`lang-scroll.js`）**：语言切换时按百分比记忆视口深度，切换后平滑对齐当前阅读位置。

### 4. 团队与科研平台 (Team & Research Showcase)
- **满编 12 人团队卡片**：
  - 博士研究生 8 人 + 1 开放申请席位；
  - 硕士研究生 3 人 + 1 开放申请席位；
  - 全员标准 640×800 高保真（真实相片 / 二次元插画照）双层 Compositor 平滑切换，支持单人卡片单独翻转。
- **RFC 6068 邮件直连**：
  - 全站 PI 邮箱严格统一为 `wenzhq9@mail.sysu.edu.cn`；
  - 加入我们（Join Us）页面提供 4 岗位预填邮件模版，全面符合 RFC 6068 规范（换行 `%0D%0A`，空格 `%20`，杜绝 `+` 乱码）。

---

## 📂 项目结构 (Directory Structure)

```text
himm/
├── assets/
│   ├── css/
│   │   ├── custom.css             # 手账皮肤、基础排版、M3 变量与核心动效
│   │   └── themes/
│   │       ├── academy.css        # 静奢学术期刊皮肤覆盖层
│   │       └── festivals.css      # 6 大节日与周末奇幻限定色彩与装饰
│   └── js/
│       ├── festival.js            # 节日历法计算与周末自动装配调度引擎
│       ├── skin.js                # 首屏预载皮肤调度（防白屏闪烁）
│       ├── wand.js                # 右下角全局魔法棒控制器
│       ├── team.js                # 双模人像平滑切换驱动
│       └── lang-scroll.js         # 语言切换滚动深度平滑恢复
├── config/_default/               # Hugo 多语言与站点配置 (hugo.toml, languages.*.toml)
├── content/                       # 站点内容源 Markdown（按 en / zh-cn / zh-tw 分流）
├── data/
│   ├── lab.json                   # 核心数据源（PI 档案、团队成员清单、研究方向、代表作）
│   └── lab-zh-tw.json             # 繁体中文本地化数据
├── figs/                          # 原始高清图片与设计归档
│   ├── logos-new/                 # 2400x1792 原始设计原画
│   └── members/                   # 课题组成员原始肖像
├── layouts/                       # Hugo 自定义布局模版
│   ├── _default/                  # 核心页面 (team, research, publications, join, contact)
│   └── partials/                  # 结构化微组件 (wand, festival-deck, team-card, mailto)
├── static/
│   └── images/
│       ├── logos/                 # 标准化透明 WebP/PNG 圆形印章徽标
│       └── team/                  # 640x800 双模标准化人像
└── tools/                         # 自动化测试与质量保障工具链
    ├── check-en-no-cjk.py         # 门禁：确保英文全站零中文泄露
    ├── check-mailto.py            # 门禁：校验 RFC 6068 邮件协议合规性
    ├── check-themes.py            # 门禁：双生皮肤渲染连通性
    ├── check-team-census.py       # 门禁：团队席位与人数对账
    ├── check-portrait-scale.py    # 门禁：肖像比例与双层完整性
    └── gen-zh-tw.py               # 繁体数据自动同步生成器
```

---

## 🛠️ 本地开发与质量门禁 (Development & QA)

### 1. 运行本地开发服务器
```bash
# 构建静态资源并启动本地服务
hugo server -D
# 或使用轻量服务器预览编译后的产物
python3 /tmp/serve-home.py 8903
```
浏览器访问：`http://127.0.0.1:8903/home/`

### 2. 执行自动化全量门禁检查
在提交代码或发布前，运行全套自动化测试套件（当前包含 233 项严苛验收标准）：
```bash
python3 tools/check-css-dupes.py && \
python3 tools/check-themes.py && \
python3 tools/check-portrait-scale.py && \
python3 tools/check-team-census.py && \
python3 tools/check-en-no-cjk.py && \
python3 tools/check-mailto.py && \
bash docs/verify-hugo.sh
```

---

## 🚀 部署与发布 (CI/CD Deployment)

项目采用 **GitHub Actions** 自动化持续集成：
- **目标发布分支**：`hugo`
- 只要向 `hugo` 分支推送提交，GitHub Pages 自动化工作流将自动执行编译、资源最小化压缩（Minification）、指纹哈希（Fingerprinting），并在数十秒内更新上线至公网。
