# 文卓谦实验室官方学术主页 (Wen Laboratory Academic Website)

> **中山大学中山医学院 · 白血病表观遗传与代谢免疫研究组**  
> **Laboratory of Leukemia Epigenetics and Metabolic Immunology, Zhongshan School of Medicine, Sun Yat-sen University**

本项目已按照 **[baoyu-design](https://github.com/JimLiu/baoyu-design)** 高保真可交互原型（Hi-Fi Interactive Prototype）标准完成重构与重新设计。结合国际标杆实验室（**Harvard/MGH Scadden Lab** 与 **HKU The Leung Lab**）的视觉与学术架构，打造兼具学术厚重感与前沿转化活力的顶尖学术主页。

---

## 🌟 核心特性 (Key Features)

1. **遵循 baoyu-design 设计规范**：
   - 建立了标准的工程资产索引（`designs/wen-lab/_d_meta.json`），设计成果已通过 `record-asset.mjs` 审查归档。
   - 引入学术级排版系统：正文 `Inter` + 标题宣言 `Newsreader` 典雅衬线 + 等宽代码 `JetBrains Mono`。
2. **四套学术主题调色板 (Multi-Theme Palettes)**：
   - 🏛️ **经典学术蓝 (Academic Navy - 默认)**：严谨克制，汲取哈佛与麻省总医院顶尖医学规范。
   - 🔴 **逸仙庄严红 (Yat-sen Crimson)**：传承中山大学红砖古朴学脉，彰显“逸仙学者”学术声誉。
   - 🌿 **生命科学绿 (Stem Cell Emerald)**：呼应造血干细胞、组织再生与生物医药生命力。
   - 🌌 **曜石显微暗黑 (Confocal Obsidian Dark)**：适配多色荧光共聚焦显微图像阅览与暗光护眼阅读。
3. **中英双语无缝切换 (Bilingual Support)**：
   - 支持全站一键切换 `中文 / English`，包括菜单、核心理念、科学方向、学术论文摘要及招聘要求，偏好自动保存至本地 `localStorage`。
4. **科研交互工具库**：
   - **核心技术平台切换器**：支持在【斑马鱼疾病模型】、【人源 PDX 骨髓微环境】和【单细胞多组学药敏平台】之间进行选项卡切换与深度参数查阅。
   - **科研图谱 Lightbox 弹窗**：展示 GFPhigh 白血病细胞单细胞转录组 UMAP 图谱（5 个给药组、25,252 个细胞，三类髓系状态），点击可查看超清大图与图谱注释。
   - **论文检索与筛选**：支持按代表作 (Landmark)、研究方向（表观免疫/代谢pH/靶向耐药）或关键词（如 `PLK4`, `FLT3`, `Blood`, `2026` 等）实时过滤，附带当前文献统计徽章。
   - **摘要弹窗 (Abstract Modal)**：点击即刻展开中英双语摘要详情。
   - **一键复制 BibTeX**：文献卡片内置剪贴板交互，附带柔和动画 Toast 提示。
   - **招聘快速邮件模板助手**：提供博后、博硕、科研助理的预填邮件主题与自荐信模板。

---

## 📂 项目结构 (Directory Structure)

```text
himm/
├── index.html                   # 生产级入口 (全量语义化 HTML5，内嵌 SEO / 学术 JSON-LD Schema)
├── assets/
│   ├── css/
│   │   └── styles.css           # 4 套主题设计令牌变量、微动效与卡片排版规范
│   ├── js/
│   │   ├── data.js              # 实验室数据中心 (PI履历、9篇代表作、3大研究方向、招聘岗位、新闻)
│   │   ├── i18n.js              # 中英双语完整字典与语言切换驱动
│   │   └── main.js              # 应用控制器 (主题/双语切换、论文过滤搜索、BibTeX复制、模态窗)
│   └── images/
│       └── research-figure-1.jpg# 实验室代表性科研成果图 (GFPhigh 单细胞转录组 UMAP 图谱)
├── designs/
│   └── wen-lab/                 # baoyu-design 标准设计资产目录
│       ├── _d_meta.json         # 设计资产元数据
│       ├── index.html           # 设计工作副本
│       └── assets/              # 本地自包含静态资源
├── tools/
│   └── make_research_figure.py  # 由 Wenyan_SC 单细胞坐标重绘 research-figure-1.jpg
├── package.json                 # 现代前端依赖与脚本配置
└── README.md                    # 项目部署与运维指南
```

---

## 🚀 本地预览与运行 (Local Preview)

### 方式 1：双击直接打开
直接在操作系统文件管理器中双击 `index.html`，即可在 Chrome / Safari / Edge 等现代浏览器中浏览完整功能。

### 方式 2：使用 Python 本地服务器 (推荐)
在当前目录下运行终端命令：
```bash
python3 -m http.server 8000
```
然后在浏览器中访问：`http://localhost:8000` 或 `http://localhost:8000/designs/wen-lab/`

### 方式 3：使用 Node.js / Vite
```bash
npm install
npm run dev
```
