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
    stat_blood_count: "5+ 篇",
    stat_blood_label: "Blood 顶级学术论文",
    stat_impact_count: "10+ 篇",
    stat_impact_label: "第一/通讯作者高影响力发表",
    stat_lineage_count: "Top 2",
    stat_lineage_label: "哈佛 MGH & 港大顶尖学术传承",
    stat_mentorship_count: "100%",
    stat_mentorship_label: "全力支持学生发展与课题深造",

    // About PI
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
    fig_badge: "SINGLE-CELL ATLAS SHOWCASE",
    fig_title: "单细胞转录组图谱解析白血病细胞状态异质性",
    fig_desc: "依托高通量单细胞 RNA 测序（scRNA-seq），课题组系统绘制不同给药方案下 GFP 高表达（GFPhigh）白血病细胞的转录组图谱。UMAP 嵌入将 25,252 个细胞清晰划分为原始粒细胞、单核细胞与未成熟中性粒细胞三类主要状态，为解析药物应答与耐药克隆演化提供单细胞分辨率的视角。",
    fig_click_hint: "点击图片放大查看高分辨率单细胞 UMAP 图谱",

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
    stat_blood_count: "5+ Papers",
    stat_blood_label: "Featured in Blood Journal",
    stat_impact_count: "10+ Papers",
    stat_impact_label: "First/Senior Author High-Impact Publications",
    stat_lineage_count: "Top 2",
    stat_lineage_label: "Harvard MGH & HKU Academic Lineage",
    stat_mentorship_count: "100%",
    stat_mentorship_label: "Dedicated Mentorship & Career Development",

    // About PI
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
    fig_badge: "SINGLE-CELL ATLAS SHOWCASE",
    fig_title: "Single-Cell Transcriptomic Atlas of Leukemic Cell States",
    fig_desc: "Using high-throughput single-cell RNA sequencing (scRNA-seq), the laboratory maps the transcriptional landscape of GFPhigh leukemic cells across treatment arms. The UMAP embedding resolves 25,252 cells into three major states—myeloblasts, monocytes and immature neutrophils—offering single-cell resolution for dissecting drug response and the evolution of resistant clones.",
    fig_click_hint: "Click figure to enlarge the high-resolution single-cell UMAP",

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
