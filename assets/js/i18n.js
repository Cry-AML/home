/**
 * Wen Laboratory (文卓谦实验室) - Bilingual Dictionary & Localization Controller
 * Enhanced with interactive labels and scientific platform descriptors
 */

const I18N_DICTIONARY = {
  zh: {
    site_title: "文卓谦实验室 | Wen Laboratory - 中山大学中山医学院",
    brand_name: "文卓谦实验室",
    brand_sub: "中山大学中山医学院 · 白血病表观遗传与代谢免疫研究组",
    
    // Navigation
    nav_home: "首页",
    nav_about: "导师与传承",
    nav_research: "研究方向与平台",
    nav_publications: "代表论著",
    nav_team: "团队成员",
    nav_news: "新闻动态",
    nav_join: "招贤纳士",
    nav_contact: "联系我们",
    
    // Theme controls
    theme_label: "主题风格",
    theme_navy: "🏛️ 经典学术蓝 (Default)",
    theme_crimson: "🔴 逸仙庄严红 (Yat-sen)",
    theme_emerald: "🌿 生命科学绿 (Emerald)",
    theme_dark: "🌌 曜石显微暗黑 (Dark)",
    
    // Hero
    hero_badge_scholar: "中山大学“逸仙学者计划”新锐学者",
    hero_badge_pedigree: "港大博士 · 哈佛医学院/MGH 博士后",
    hero_title_1: "解析白血病恶性演变与复发本质",
    hero_title_2: "开拓表观遗传、代谢稳态与肿瘤免疫转化新前沿",
    hero_lead: "文卓谦实验室依托中山大学中山医学院，聚焦急性髓系白血病（AML）发生与复发的深层分子机理，深入探索表观修饰重构、质子转运/细胞内pH与代谢重编程的交互调控，致力于从基础分子机制跨越至临床挽救性联合疗法。",
    btn_explore: "探索科研方向",
    btn_join_hero: "加入我们 (招收博后/博硕/助理)",
    
    // Stats
    stat_blood_count: "5",
    stat_blood_label: "Blood 论文",
    stat_impact_count: "9",
    stat_impact_label: "代表性论著",
    stat_lineage_count: "1",
    stat_lineage_label: "Phase II 临床试验",
    stat_mentorship_count: "2",
    stat_mentorship_label: "顶尖学术机构（哈佛 MGH · 港大）",

    // About PI
    pi_title: "副教授 · 博士生导师 · 逸仙学者",
    about_tag: "PRINCIPAL INVESTIGATOR",
    about_title: "学术带头人简介与学术历程",
    about_intro_p1: "文卓谦博士，中山大学中山医学院副教授、博士生导师，中山大学引进人才，“逸仙学者计划”新锐学者。",
    about_intro_p2: "2013年博士毕业于香港大学医学院，导师为梁如鸿教授；2015-2019在哈佛大学医学院/麻省总医院（MGH）再生医学中心开展博士后研究工作，合作导师为国际干细胞领域著名学者 David T. Scadden 教授；2019-2024于香港大学就任研究助理教授；2024年全职加盟中山医学院组建独立课题组。",
    about_intro_p3: "主要研究急性髓系白血病（Acute Myeloid Leukemia, AML）发生与复发的分子调控机制（包括表观遗传、代谢与免疫微环境的相互作用）并研发对应的靶向治疗方案。相关研究成果以第一作者或通讯作者发表在 Blood、Leukemia、Nature Communications、Haematologica 等国际顶尖学术期刊。",
    about_timeline_title: "学术承继轨迹 (Academic Pedigree)",
    btn_view_sysu_profile: "访问中山大学教师个人主页",

    // Research
    research_tag: "RESEARCH & PLATFORMS",
    research_title: "三大科学支柱与前沿技术平台",
    research_lead: "我们秉持“立足根本生物学规律，服务临床重大紧迫需求”的理念，构建从分子机制解析、前临床疾病模型到临床试验验证的全链条科研闭环。",
    platform_section_title: "核心转化技术平台 (Translational Platforms)",
    platform_tab_prompt: "切换下方平台卡片，查看疾病模型技术参数与科研支撑能力：",

    // Publications
    pub_tag: "PUBLICATIONS & SCIENCE",
    pub_title: "学术论文与重大科学突破",
    pub_lead: "我们注重基础科学原创性与临床转化突破。以下展示文卓谦博士及团队的核心代表作，支持按研究方向与年份进行实时筛选。",
    pub_filter_all: "全部论文 (All)",
    pub_filter_landmark: "⭐ 代表性突破 (Landmark)",
    pub_filter_epigenetics: "表观与免疫",
    pub_filter_metabolism: "代谢与pH",
    pub_filter_resistance: "耐药与联合",
    pub_search_placeholder: "搜索论文标题、关键词、作者或年份...",
    pub_btn_doi: "DOI 访问原文",
    pub_btn_abstract: "阅读摘要",
    pub_btn_bibtex: "复制 BibTeX",
    pub_counter_prefix: "当前展示",
    pub_counter_suffix: "篇文献（总共 9 篇）",

    // Figure Showcase
    fig_badge: "LAB EXPERIMENTAL SHOWCASE",
    fig_title: "单细胞多组学与高通量生物信息学分析",
    fig_desc: "课题组常态化开展人类白血病细胞系（如 THP-1）与原代临床白血病样本的高通量 RNA-seq、ChIP-seq 及代谢流检测，精准解析抗原呈递分子（HLA 基因家族）在表观调控下的转录激活以及 DNA 损伤修复通路的富集演进规律。",
    fig_click_hint: "点击图片放大查看高分辨率科研图谱与生物学注释",
    fig_modal_title: "Panel A: THP-1 白血病细胞抗原呈递基因表达差异 / Panel B: DNA 修复通路 GSEA 富集分析",
    fig_panel_a: "<strong>A. 热图分析 (Heatmap of Antigen Presentation):</strong> 在 THP-1 白血病敲降模型（THP-1_KD vs THP-1_SCR）中，HLA 复合体相关基因（包括 CD1D, HLA-C, HLA-DMA, HLA-B, HLA-H, HLA-A, HLA-DQB1, HLA-DRB1, HLA-E, HLA-DQA1 等）发生显著上调，提示靶向表观修饰能够重启免疫监控。",
    fig_panel_b: "<strong>B. GSEA / KEGG 通路富集分析 (Pathway Enrichment):</strong> 细胞错配修复（Mismatch repair, NES=2.23）、碱基切除修复（Base excision repair, NES=2.20）、核苷酸切除修复（Nucleotide excision repair, NES=2.02）以及双链断裂同源重组修复通路均呈现极显著富集，阐明了白血病细胞面对基因毒性与免疫激活时的适应性应激机制。",
    fig_thumb_alt: "白血病HLA表观调控与DNA修复通路分析科研图谱",
    fig_btn_view: "查看高清图谱与实验注释",

    // Open Positions
    join_tag: "JOIN OUR LAB",
    join_title: "招贤纳士与研究生招收",
    join_lead: "文卓谦实验室正处于快速发展阶段，科研经费充足，实验平台先进，与哈佛大学、香港大学及各大临床医院保持深度紧密合作。诚邀怀揣学术梦想的青年才俊加盟！",
    join_contact_banner_title: "应聘与咨询方式",
    join_contact_banner_desc: "有意者请将个人详细简历（包括学习与科研经历、已发表文章清单等）发送至文卓谦老师电子邮箱，邮件主题请注明：【应聘岗位/研究生报考】+ 姓名 + 专业。",
    btn_send_email: "立即发送应聘邮件 (Email PI)",
    btn_app_helper: "快捷邮件模板助手",

    // News
    news_tag: "LATEST UPDATES",
    news_title: "实验室新闻与科研动态",

    // Contact
    contact_tag: "CONTACT US",
    contact_title: "联系方式与地理位置",
    contact_address_label: "实验室与办公室地址：",
    contact_address_val: "中国广东省广州市越秀区中山二路74号 中山大学广州校区北校园 科技楼（病理生理学教研室）",
    contact_email_label: "电子邮箱 (E-mail)：",
    map_building_title: "中山大学中山医学院 · 科技楼",
    btn_open_map: "在地图中查看 (Open in Map)",
    contact_postal_code: "邮编：510080",
    contact_adjacent: "毗邻中山大学附属第一医院",
    contact_postal_label: "邮政编码：",
    contact_metro_label: "公共交通指引：",
    contact_metro_val: "广州地铁 1号线 烈士陵园站（D出口步行约5分钟）；地铁 6号线 东山口站（A出口步行约10分钟）。",

    // Footer
    footer_text: "中山大学中山医学院 文卓谦实验室 · 版权所有 © 2026. 保留所有权利。",
    footer_quick_links: "友情链接：",
    footer_link_sysu: "中山大学",
    footer_link_zssom: "中山医学院",
    footer_link_scadden: "Harvard Scadden Lab",
    footer_link_leung: "HKU The Leung Lab",

    // Modals & Toast
    modal_abstract_title: "论文摘要 (Abstract)",
    modal_close: "关闭",
    modal_fig_title: "科研图谱详解 (Research Figure View)",
    toast_copied: "✅ BibTeX 引用已成功复制到剪贴板！"
  },

  en: {
    site_title: "Wen Laboratory | Zhongshan School of Medicine, SYSU",
    brand_name: "Wen Laboratory",
    brand_sub: "Sun Yat-sen University · Leukemia Epigenetics & Metabolic Immunology",
    
    // Navigation
    nav_home: "Home",
    nav_about: "About PI",
    nav_research: "Research & Platforms",
    nav_publications: "Publications",
    nav_team: "Team",
    nav_news: "News",
    nav_join: "Join Us",
    nav_contact: "Contact",
    
    // Theme controls
    theme_label: "Themes",
    theme_navy: "🏛️ Academic Navy (Default)",
    theme_crimson: "🔴 Yat-sen Crimson (Heritage)",
    theme_emerald: "🌿 Stem Cell Emerald (Life)",
    theme_dark: "🌌 Confocal Obsidian (Dark)",
    
    // Hero
    hero_badge_scholar: "SYSU Yat-sen Scholar (Rising Star)",
    hero_badge_pedigree: "HKU Ph.D. · Harvard MGH Postdoctoral Alum",
    hero_title_1: "Deciphering Leukemogenesis & Relapse",
    hero_title_2: "Pioneering Epigenetic, Metabolic & Immune Interventions",
    hero_lead: "Located at Sun Yat-sen University School of Medicine, the Wen Laboratory investigates the fundamental molecular biology governing Acute Myeloid Leukemia (AML) pathogenesis and therapy resistance. We dissect the crosstalk between chromatin remodeling, proton export/pHi homeostasis, and tumor microenvironment to translate mechanistic discoveries into curative combination therapies.",
    btn_explore: "Explore Research Pillars",
    btn_join_hero: "Join Our Team (Open Positions)",
    
    // Stats
    stat_blood_count: "5",
    stat_blood_label: "Blood Papers",
    stat_impact_count: "9",
    stat_impact_label: "Selected Publications",
    stat_lineage_count: "1",
    stat_lineage_label: "Phase II Clinical Trial",
    stat_mentorship_count: "2",
    stat_mentorship_label: "Top Institutions (Harvard MGH · HKU)",

    // About PI
    pi_title: "Associate Professor · Ph.D. Supervisor · Yat-sen Scholar",
    about_tag: "PRINCIPAL INVESTIGATOR",
    about_title: "Biography & Academic Pedigree",
    about_intro_p1: "Dr. Chi-Hin Man is an Associate Professor and Ph.D. Supervisor at Sun Yat-sen University School of Medicine, supported by the prestigious SYSU 'Yat-sen Scholar' Program (Rising Star).",
    about_intro_p2: "Dr. Man obtained his Ph.D. in Haematology from The University of Hong Kong in 2013 under the supervision of Prof. Anskar Y.H. Leung. He subsequently completed his postdoctoral fellowship (2015–2019) at the Center for Regenerative Medicine, Massachusetts General Hospital / Harvard Medical School, mentored by world-renowned stem cell biologist Prof. David T. Scadden. From 2019 to 2024, he served as Research Assistant Professor at HKU Department of Medicine before establishing his independent laboratory at SYSU in 2024.",
    about_intro_p3: "His research program centers on the epigenetic, metabolic, and immunological mechanisms driving AML development and recurrence, with a dedicated mission to design breakthrough targeted therapeutics. He has authored high-impact papers as first or corresponding author in Blood, Leukemia, Nature Communications, and Haematologica.",
    about_timeline_title: "Academic Pedigree & Milestones",
    btn_view_sysu_profile: "View SYSU Faculty Profile",

    // Research
    research_tag: "RESEARCH & PLATFORMS",
    research_title: "Scientific Pillars & Cutting-Edge Platforms",
    research_lead: "Bridging fundamental stem cell biology with urgent clinical dilemmas, our laboratory builds a cohesive research continuum encompassing molecular discovery, preclinical models, and clinical trial translation.",
    platform_section_title: "Translational Platforms & Model Systems",
    platform_tab_prompt: "Toggle through the research platforms below to view experimental specifications and capabilities:",

    // Publications
    pub_tag: "PUBLICATIONS & SCIENCE",
    pub_title: "Featured Papers & Scientific Discoveries",
    pub_lead: "We prioritize scientific rigor and translational clinical impact. Browse our featured works below, filterable by thematic focus and publication year.",
    pub_filter_all: "All Papers",
    pub_filter_landmark: "⭐ Landmark Discoveries",
    pub_filter_epigenetics: "Epigenetics & Immunity",
    pub_filter_metabolism: "Metabolism & pHi",
    pub_filter_resistance: "Resistance & Trials",
    pub_search_placeholder: "Search title, keywords, authors or year...",
    pub_btn_doi: "DOI Article Link",
    pub_btn_abstract: "Read Abstract",
    pub_btn_bibtex: "Copy BibTeX",
    pub_counter_prefix: "Showing",
    pub_counter_suffix: "publications (9 total)",

    // Figure Showcase
    fig_badge: "LAB EXPERIMENTAL SHOWCASE",
    fig_title: "Single-Cell Multi-Omics & High-Throughput Bioinformatics",
    fig_desc: "The laboratory routinely conducts high-throughput RNA-seq, ChIP-seq, and metabolic flux tracing on human leukemia lines (e.g., THP-1) and primary AML patient samples, dissecting HLA gene activation and DNA damage repair pathways under epigenetic perturbation.",
    fig_click_hint: "Click figure to enlarge high-resolution diagram with scientific annotations",
    fig_modal_title: "Panel A: Differential HLA Expression in THP-1 / Panel B: GSEA DNA Repair Pathway Enrichment",
    fig_panel_a: "<strong>A. Heatmap Analysis:</strong> In the THP-1 leukemia knockdown model (THP-1_KD vs THP-1_SCR), HLA complex genes (including CD1D, HLA-C, HLA-DMA, HLA-B, HLA-H, HLA-A, HLA-DQB1, HLA-DRB1, HLA-E, HLA-DQA1) are markedly upregulated, indicating targeted epigenetic remodeling reactivates immune surveillance.",
    fig_panel_b: "<strong>B. GSEA / KEGG Pathway Enrichment:</strong> Mismatch repair (NES=2.23), base excision repair (NES=2.20), nucleotide excision repair (NES=2.02), and double-strand break homologous recombination repair pathways exhibit significant enrichment, delineating the adaptive stress response of leukemic cells upon genotoxic and immune activation.",
    fig_thumb_alt: "Leukemia HLA Epigenetics and DNA Repair Pathway Analysis",
    fig_btn_view: "View High-Resolution Figure & Annotations",

    // Open Positions
    join_tag: "JOIN OUR LAB",
    join_title: "Career Opportunities & Graduate Admissions",
    join_lead: "The Wen Lab is experiencing energetic growth with ample grant funding, state-of-the-art facilities, and collaborative ties with Harvard, HKU, and leading academic medical centers. We warmly welcome passionate postdoctoral scholars, graduate students, and technicians to join us!",
    join_contact_banner_title: "How to Apply",
    join_contact_banner_desc: "Interested applicants please send a comprehensive CV (including academic background, research experience, and publication record) to Dr. Man. Please indicate [Position / Student Application] + Your Name + Major in the email subject.",
    btn_send_email: "Email Application to PI",
    btn_app_helper: "Quick Email Drafter",

    // News
    news_tag: "LATEST UPDATES",
    news_title: "Lab News & Milestones",

    // Contact
    contact_tag: "CONTACT US",
    contact_title: "Location & Contact Information",
    contact_address_label: "Laboratory & Office Address:",
    contact_address_val: "Science & Technology Building, Department of Pathophysiology, Zhongshan School of Medicine, Sun Yat-sen University (North Campus), 74 Zhongshan 2nd Road, Yuexiu District, Guangzhou 510080, China",
    contact_email_label: "E-mail:",
    map_building_title: "Science & Technology Building, Zhongshan School of Medicine, SYSU",
    btn_open_map: "Open in Map",
    contact_postal_code: "Postal Code: 510080",
    contact_adjacent: "Adjacent to The First Affiliated Hospital, SYSU",
    contact_postal_label: "Postal Code:",
    contact_metro_label: "Public Transportation:",
    contact_metro_val: "Guangzhou Metro Line 1 Martyrs' Park Station (Exit D, 5 min walk); Metro Line 6 Dongshankou Station (Exit A, 10 min walk).",

    // Footer
    footer_text: "Wen Laboratory · Zhongshan School of Medicine, Sun Yat-sen University. All Rights Reserved © 2026.",
    footer_quick_links: "Affiliations & Links:",
    footer_link_sysu: "Sun Yat-sen University",
    footer_link_zssom: "Zhongshan School of Medicine",
    footer_link_scadden: "Harvard Scadden Lab",
    footer_link_leung: "HKU The Leung Lab",

    // Modals & Toast
    modal_abstract_title: "Publication Abstract",
    modal_close: "Close",
    modal_fig_title: "Research Figure & Analysis",
    toast_copied: "✅ BibTeX citation copied to clipboard!"
  }
};
