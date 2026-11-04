/**
 * Wen Laboratory (文卓谦实验室) - Award-Tier Interactive Experience Controller
 * Benchmarked against Awwwards / Webby / FWA winning standards
 */

// Global State
let currentLang = localStorage.getItem('wen_lab_lang') || 'zh';
let currentTheme = localStorage.getItem('wen_lab_theme') || 'navy';
let currentPubFilter = 'all';
let currentSearchQuery = '';
let activePlatformId = 'zebrafish';
let activePillarId = 'epigenetics';

// -----------------------------------------------------------------------------
// 1. Theme Controller & Dynamic Particle Palette
// -----------------------------------------------------------------------------
function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wen_lab_theme', theme);
  
  // Highlight active theme dropdown option
  document.querySelectorAll('.theme-option').forEach(el => {
    if (el.getAttribute('data-theme-name') === theme) {
      el.classList.add('font-bold', 'opacity-100');
    } else {
      el.classList.remove('font-bold', 'opacity-100');
    }
  });

  // Re-sync particle colors in canvas
  updateCanvasThemeColors();
}

// -----------------------------------------------------------------------------
// 2. Bilingual Localization Controller
// -----------------------------------------------------------------------------
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('wen_lab_lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  const dict = I18N_DICTIONARY[lang];

  // Update text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });

  // Update title
  if (dict.site_title) document.title = dict.site_title;

  // Update navbar indicator
  const langIndicator = document.getElementById('langIndicator');
  if (langIndicator) {
    langIndicator.textContent = lang === 'zh' ? 'EN / 中文' : '中文 / EN';
  }

  // Re-render localized dynamic components
  renderAcademicTimeline();
  renderResearchPillars();
  renderPlatforms();
  renderPublications();
  renderOpenPositions();
  renderNews();
  updateWorldClocks();
}

function toggleLanguage() {
  setLanguage(currentLang === 'zh' ? 'en' : 'zh');
}

// -----------------------------------------------------------------------------
// 3. Dynamic Academic Lineage World Clock (Guangzhou · Boston · Hong Kong)
// -----------------------------------------------------------------------------
function updateWorldClocks() {
  const clockContainer = document.getElementById('world-clocks-container');
  if (!clockContainer) return;

  const now = new Date();
  const formatTime = (timeZone) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);
  };

  const gzTime = formatTime('Asia/Shanghai');
  const bostonTime = formatTime('America/New_York');
  const hkTime = formatTime('Asia/Hong_Kong');

  const isZh = currentLang === 'zh';
  clockContainer.innerHTML = `
    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] font-mono tracking-tight" style="color: var(--text-muted);">
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border theme-surface" style="border-color: var(--border);">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-bold text-slate-800 dark:text-slate-200">${isZh ? '广州·中大北校园' : 'Guangzhou · SYSU'}:</span>
        <span class="font-bold text-sky-600 dark:text-sky-400">${gzTime}</span>
      </div>
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border theme-surface" style="border-color: var(--border);">
        <span class="w-1.5 h-1.5 rounded-full opacity-60" style="background-color: var(--primary);"></span>
        <span>${isZh ? '波士顿·哈佛/MGH' : 'Boston · Harvard MGH'}:</span>
        <span>${bostonTime}</span>
      </div>
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border theme-surface" style="border-color: var(--border);">
        <span class="w-1.5 h-1.5 rounded-full opacity-60" style="background-color: var(--primary);"></span>
        <span>${isZh ? '香港·港大医学院' : 'Hong Kong · HKU'}:</span>
        <span>${hkTime}</span>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// 4. Dynamic Rendering: Timeline, Pillars, Platforms, Publications
// -----------------------------------------------------------------------------

// Academic Pedigree Timeline
function renderAcademicTimeline() {
  const container = document.getElementById('pedigree-timeline-container');
  if (!container) return;

  const isZh = currentLang === 'zh';
  container.innerHTML = LAB_DATA.pi.pedigree.map((item, idx) => `
    <div class="pedigree-node relative pl-7 pb-7 border-l-2 theme-transition ${idx === LAB_DATA.pi.pedigree.length - 1 ? 'border-transparent pb-0' : ''}" 
         style="border-color: ${item.highlight ? 'var(--primary)' : 'var(--border)'};">
      <span class="pedigree-indicator absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center theme-transition"
            style="background-color: ${item.highlight ? 'var(--primary)' : 'var(--bg-surface)'}; border-color: var(--primary);">
        ${item.highlight ? '<span class="w-1.5 h-1.5 rounded-full bg-white"></span>' : ''}
      </span>
      <div class="text-xs font-mono font-bold tracking-wider mb-1" style="color: var(--primary);">
        ${isZh ? item.yearZh : item.year}
      </div>
      <div class="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">
        ${isZh ? item.roleZh : item.roleEn}
      </div>
      <div class="text-xs font-medium" style="color: var(--text-muted);">
        ${isZh ? item.instZh : item.instEn}
      </div>
    </div>
  `).join('');
}

// Research Pillars with Molecular Mechanism Circuit Cards
function setActivePillar(pillarId) {
  activePillarId = pillarId;
  renderResearchPillars();
}

function renderResearchPillars() {
  const container = document.getElementById('research-pillars-container');
  if (!container) return;

  const isZh = currentLang === 'zh';

  // Molecular circuit data for each pillar
  const circuits = {
    epigenetics: {
      stepsZh: ["TP53突变 / 恶性表型", "PLK4激酶异常高表达", "染色质封闭 / 组蛋白甲基化", "cGAS-STING天然免疫沉默", "研发PLK4抑制剂重启免疫清除"],
      stepsEn: ["TP53 Mutation & High Risk", "PLK4 Kinase Overexpression", "Histone Methylation Barrier", "cGAS-STING Innate Silence", "PLK4 Inhibitor Triggers Clearance"]
    },
    metabolism: {
      stepsZh: ["激酶激活突变 (FLT3/KIT)", "Tescalcin-NHE1轴激活", "质子高效外排 (Proton Export)", "胞内pH碱化 (pHi 7.4-7.6)", "碳代谢重编程驱动白血病扩增"],
      stepsEn: ["Kinase Oncogenes (FLT3/KIT)", "Tescalcin-NHE1 Axis", "Active Proton Extrusion", "Intracellular Alkalinization", "Carbon Metabolic Rewiring"]
    },
    resistance: {
      stepsZh: ["FLT3-ITD靶向抑制剂", "初始临床缓解", "继发性代偿与激酶突变", "单药耐药复发困境", "Quizartinib + Omacetaxine II期临床成功"],
      stepsEn: ["FLT3-ITD TKI Therapy", "Initial Remission", "Secondary Resistance Mutations", "Fatal Relapse Barrier", "Quizartinib + Omacetaxine Phase II Trial"]
    }
  };

  container.innerHTML = LAB_DATA.researchPillars.map(pillar => {
    const isSelected = pillar.id === activePillarId;
    const circuit = circuits[pillar.id];

    return `
      <div class="theme-card p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 cursor-pointer ${isSelected ? 'ring-2 ring-sky-500/40' : ''}"
           onclick="setActivePillar('${pillar.id}')">
        <div>
          <div class="flex items-center justify-between mb-6">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold theme-transition shadow-sm"
                 style="background-color: var(--accent-tint); color: var(--primary);">
              <i class="fa-solid ${pillar.icon}"></i>
            </div>
            <span class="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full theme-badge">
              ${isZh ? pillar.tagZh : pillar.tagEn}
            </span>
          </div>

          <div class="text-xs font-mono font-bold tracking-wider mb-1 opacity-60" style="color: var(--primary);">
            PILLAR ${pillar.number}
          </div>
          
          <h3 class="text-lg font-black mb-3 tracking-tight leading-snug text-slate-900 dark:text-slate-100">
            ${isZh ? pillar.titleZh : pillar.titleEn}
          </h3>

          <p class="text-xs leading-relaxed mb-6" style="color: var(--text-muted);">
            ${isZh ? pillar.descZh : pillar.descEn}
          </p>

          <!-- Interactive Molecular Flow Circuit -->
          <div class="p-3.5 rounded-2xl border mb-6 text-[11px] font-mono leading-relaxed" 
               style="background-color: var(--bg-subtle); border-color: var(--border);">
            <div class="font-bold text-[10px] uppercase tracking-wider mb-2 opacity-60" style="color: var(--primary);">
              <i class="fa-solid fa-network-wired mr-1"></i> ${isZh ? '分子调控通路逻辑' : 'Molecular Circuit Flow'}:
            </div>
            <div class="space-y-1.5">
              ${(isZh ? circuit.stepsZh : circuit.stepsEn).map((step, sIdx, arr) => `
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background-color: var(--primary);"></span>
                  <span class="${sIdx === arr.length - 1 ? 'font-bold' : ''}" style="color: ${sIdx === arr.length - 1 ? 'var(--primary)' : 'var(--text-secondary)'};">${step}</span>
                  ${sIdx < arr.length - 1 ? '<i class="fa-solid fa-angle-right text-[9px] opacity-40 ml-auto"></i>' : '⭐'}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="pt-4 border-t flex items-center justify-between text-xs font-mono" style="border-color: var(--border);">
          <span class="font-bold" style="color: var(--primary);">
            <i class="fa-solid fa-award mr-1"></i> ${pillar.highlightPaper}
          </span>
          <span class="text-[10px] text-slate-400 font-semibold">${isZh ? '点击查看' : 'Details'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Interactive Platforms Showcase
function setPlatformTab(platformId) {
  activePlatformId = platformId;
  renderPlatforms();
}

function renderPlatforms() {
  const container = document.getElementById('platforms-showcase-container');
  if (!container) return;

  const isZh = currentLang === 'zh';
  const platform = LAB_DATA.platforms.find(p => p.id === activePlatformId) || LAB_DATA.platforms[0];

  container.innerHTML = `
    <!-- Platform Navigation Tabs -->
    <div class="flex flex-wrap gap-3 mb-8">
      ${LAB_DATA.platforms.map(p => `
        <button onclick="setPlatformTab('${p.id}')" 
                class="platform-tab-btn ${p.id === activePlatformId ? 'active' : ''}">
          <i class="fa-solid ${p.icon}"></i>
          <span>${isZh ? p.nameZh.split('(')[0] : p.nameEn.split('&')[0]}</span>
        </button>
      `).join('')}
    </div>

    <!-- Active Platform Deep-Dive Card -->
    <div class="theme-card p-8 sm:p-10 rounded-3xl" style="background-color: var(--bg-surface-elevated);">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <span class="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full theme-badge">
            ${isZh ? platform.tagZh : platform.tagEn}
          </span>
          <h4 class="text-2xl font-black tracking-tight mt-2 text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <i class="fa-solid ${platform.icon}" style="color: var(--primary);"></i>
            ${isZh ? platform.nameZh : platform.nameEn}
          </h4>
        </div>
      </div>

      <p class="text-sm leading-relaxed mb-8 max-w-4xl" style="color: var(--text-secondary);">
        ${isZh ? platform.descZh : platform.descEn}
      </p>

      <div class="pt-6 border-t" style="border-color: var(--border);">
        <div class="text-xs font-bold uppercase tracking-wider mb-4 opacity-70">
          ${isZh ? '平台核心技术能力与研究支持：' : 'Key Platform Capabilities & Technical Infrastructure:'}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${(isZh ? platform.featuresZh : platform.featuresEn).map(f => `
            <div class="p-4 rounded-2xl border flex items-start gap-3 shadow-sm" style="border-color: var(--border); background-color: var(--bg-surface);">
              <i class="fa-solid fa-circle-check text-xs mt-1" style="color: var(--primary);"></i>
              <span class="text-xs leading-relaxed font-medium" style="color: var(--text-main);">${f}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Render Publications with Filtering, Search & Dynamic Counter Badge
function renderPublications() {
  const container = document.getElementById('publications-list-container');
  const counterEl = document.getElementById('pub-counter-badge');
  if (!container) return;

  const isZh = currentLang === 'zh';
  const query = currentSearchQuery.toLowerCase().trim();

  // Filter logic
  const filtered = LAB_DATA.publications.filter(pub => {
    if (currentPubFilter === 'landmark' && !pub.landmark) return false;
    if (currentPubFilter !== 'all' && currentPubFilter !== 'landmark' && pub.category !== currentPubFilter) return false;

    if (query) {
      const matchTitle = pub.title.toLowerCase().includes(query);
      const matchAuthors = pub.authors.toLowerCase().includes(query);
      const matchJournal = pub.journal.toLowerCase().includes(query);
      const matchYear = pub.year.toString().includes(query);
      const matchAbstract = (pub.abstractEn + pub.abstractZh).toLowerCase().includes(query);
      return matchTitle || matchAuthors || matchJournal || matchYear || matchAbstract;
    }
    return true;
  });

  // Update dynamic count badge
  if (counterEl) {
    const prefix = I18N_DICTIONARY[currentLang].pub_counter_prefix;
    const suffix = I18N_DICTIONARY[currentLang].pub_counter_suffix;
    counterEl.textContent = `${prefix} ${filtered.length} ${suffix}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 border border-dashed rounded-3xl" style="border-color: var(--border);">
        <i class="fa-solid fa-book-open text-3xl opacity-30 mb-3" style="color: var(--primary);"></i>
        <p class="text-xs text-slate-400">${isZh ? '没有找到符合条件的论文记录' : 'No publications found matching your filter.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pub => {
    // Highlight author names
    const highlightedAuthors = pub.authors
      .replace(/Man CH/g, `<strong class="text-slate-900 dark:text-slate-100 underline decoration-2 decoration-sky-500 font-bold">Man CH</strong>`)
      .replace(/Scadden DT/g, `<strong class="text-slate-900 dark:text-slate-100 font-semibold">Scadden DT</strong>`)
      .replace(/Leung AY/g, `<strong class="text-slate-900 dark:text-slate-100 font-semibold">Leung AY</strong>`);

    return `
      <div class="theme-card p-6 rounded-2xl relative transition-all duration-300" style="background-color: var(--bg-surface-elevated);">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full theme-badge font-mono tracking-wider">
              ${pub.journal}
            </span>
            <span class="text-xs font-mono font-bold text-slate-400">
              ${pub.year}
            </span>
            ${pub.landmark ? `
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <i class="fa-solid fa-star mr-1"></i> Landmark
              </span>
            ` : ''}
            <span class="text-[10px] font-medium px-2 py-0.5 rounded border" style="border-color: var(--border); color: var(--text-muted);">
              ${pub.impact}
            </span>
          </div>
          <div class="text-[11px] font-mono font-medium" style="color: var(--primary);">
            ${isZh ? pub.roleNoteZh : pub.roleNote}
          </div>
        </div>

        <h4 class="text-base font-bold leading-snug mb-2 text-slate-900 dark:text-slate-100">
          ${pub.title}
        </h4>

        <div class="text-xs leading-relaxed mb-3" style="color: var(--text-secondary);">
          ${highlightedAuthors}
        </div>

        <div class="text-xs font-mono text-slate-400 mb-4">
          ${pub.citation}
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center gap-3 pt-3 border-t text-xs font-medium" style="border-color: var(--border);">
          <a href="${pub.doiUrl}" target="_blank" rel="noopener noreferrer" 
             class="hover:underline flex items-center gap-1.5 font-bold" style="color: var(--primary);">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>${I18N_DICTIONARY[currentLang].pub_btn_doi}</span>
          </a>

          <button onclick="openAbstractModal('${pub.id}')" 
                  class="hover:underline flex items-center gap-1.5 font-semibold" style="color: var(--text-muted);">
            <i class="fa-solid fa-align-left"></i>
            <span>${I18N_DICTIONARY[currentLang].pub_btn_abstract}</span>
          </button>

          <button onclick="copyBibTeX('${pub.id}')" 
                  class="hover:underline flex items-center gap-1.5 ml-auto font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <i class="fa-solid fa-quote-right"></i>
            <span>${I18N_DICTIONARY[currentLang].pub_btn_bibtex}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Open Positions with Quick Drafter
function renderOpenPositions() {
  const container = document.getElementById('open-positions-container');
  if (!container) return;

  const isZh = currentLang === 'zh';
  container.innerHTML = LAB_DATA.openPositions.map(pos => `
    <div class="theme-card p-8 rounded-3xl flex flex-col justify-between">
      <div>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h4 class="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            ${isZh ? pos.titleZh : pos.titleEn}
          </h4>
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-full theme-badge">
            ${isZh ? pos.statusZh : pos.statusEn}
          </span>
        </div>

        <div class="p-4 rounded-2xl mb-6 text-xs font-medium" style="background-color: var(--bg-subtle); color: var(--text-secondary);">
          <i class="fa-solid fa-gift mr-1.5" style="color: var(--primary);"></i>
          ${isZh ? pos.salaryZh : pos.salaryEn}
        </div>

        <div class="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">
          ${isZh ? '岗位要求与发展支持：' : 'Candidate Qualifications & Support:'}
        </div>

        <ul class="space-y-2 text-xs leading-relaxed mb-6" style="color: var(--text-muted);">
          ${(isZh ? pos.reqsZh : pos.reqsEn).map(req => `
            <li class="flex items-start gap-2">
              <span class="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style="background-color: var(--primary);"></span>
              <span>${req}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="pt-4 border-t" style="border-color: var(--border);">
        <button onclick="openEmailDrafter('${pos.type}')" 
                class="w-full py-2.5 rounded-xl text-xs font-bold border theme-surface hover:border-slate-400 transition-all flex items-center justify-center gap-2"
                style="border-color: var(--border); color: var(--primary);">
          <i class="fa-solid fa-envelope-open-text"></i>
          <span>${isZh ? '一键生成自荐申请邮件' : 'Draft Application Email'}</span>
        </button>
      </div>
    </div>
  `).join('');
}

// Render News
function renderNews() {
  const container = document.getElementById('news-timeline-container');
  if (!container) return;

  const isZh = currentLang === 'zh';
  container.innerHTML = LAB_DATA.news.map((item, idx) => `
    <div class="relative pl-8 pb-8 border-l-2 theme-transition ${idx === LAB_DATA.news.length - 1 ? 'border-transparent pb-0' : ''}" 
         style="border-color: var(--border);">
      <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center theme-transition"
            style="background-color: var(--bg-surface); border-color: var(--primary);">
        <span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--primary);"></span>
      </span>
      <div class="text-xs font-mono font-bold mb-1" style="color: var(--primary);">
        ${item.date}
      </div>
      <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
        ${isZh ? item.titleZh : item.titleEn}
      </h4>
      <p class="text-xs leading-relaxed" style="color: var(--text-muted);">
        ${isZh ? item.descZh : item.descEn}
      </p>
    </div>
  `).join('');
}

// -----------------------------------------------------------------------------
// 5. Interactive Modals, Lightbox, Drafter, Toast
// -----------------------------------------------------------------------------

function openAbstractModal(pubId) {
  const pub = LAB_DATA.publications.find(p => p.id === pubId);
  if (!pub) return;

  const modal = document.getElementById('abstract-modal');
  const titleEl = document.getElementById('modal-pub-title');
  const citationEl = document.getElementById('modal-pub-citation');
  const bodyEl = document.getElementById('modal-pub-body');

  if (!modal) return;

  const isZh = currentLang === 'zh';
  titleEl.textContent = pub.title;
  citationEl.textContent = `${pub.journal} (${pub.year}) · ${pub.citation}`;
  bodyEl.innerHTML = `
    <div class="space-y-4 text-xs sm:text-sm leading-relaxed" style="color: var(--text-secondary);">
      <div>
        <span class="font-bold text-slate-900 dark:text-slate-100">${isZh ? '中文摘要：' : 'Chinese Abstract:'}</span>
        <p class="mt-1">${pub.abstractZh}</p>
      </div>
      <div class="pt-3 border-t" style="border-color: var(--border);">
        <span class="font-bold text-slate-900 dark:text-slate-100">${isZh ? '英文摘要：' : 'English Abstract:'}</span>
        <p class="mt-1">${pub.abstractEn}</p>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAbstractModal() {
  const modal = document.getElementById('abstract-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

// Scientific Figure Lightbox
function openFigureModal() {
  const modal = document.getElementById('figure-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeFigureModal() {
  const modal = document.getElementById('figure-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

// Direct Email Application Generator
function openEmailDrafter(roleType) {
  const isZh = currentLang === 'zh';
  const roles = {
    postdoc: isZh ? "博士后岗位申请" : "Postdoctoral Fellow Application",
    graduate: isZh ? "博士/硕士研究生招生咨询" : "Graduate Student Application",
    ra: isZh ? "科研助理岗位应聘" : "Research Assistant Application"
  };
  const roleName = roles[roleType] || (isZh ? "岗位应聘" : "Application");
  const subject = encodeURIComponent(`[Wen Lab ${isZh ? '应聘' : 'Application'}] - ${roleName} - [Your Name]`);
  const body = encodeURIComponent(
    isZh 
      ? `尊敬的文卓谦老师：\n\n您好！我从文卓谦实验室官方网站获悉课题组招募信息，对贵组在白血病表观遗传、代谢调控与免疫微环境领域的研究方向深感向往。特此呈上个人申请材料，有意应聘【${roleName}】。\n\n【个人简要概况】\n- 毕业院校及专业：\n- 目前学历 / 预计毕业时间：\n- 主要科研方向及代表成果：\n\n个人简历与代表作已以附件形式呈送，期待能有机会向您当面或线上汇报！\n\n祝好，\n[您的姓名]\n[联系电话]`
      : `Dear Dr. Man,\n\nI am writing to express my enthusiastic interest in joining the Wen Laboratory as a ${roleName}. Having learned about your cutting-edge work on leukemia epigenetics, proton partitioning, and metabolic rewiring, I believe my background aligns closely with your research mission.\n\nBrief Summary:\n- Institution & Major:\n- Current Degree & Expected Date:\n- Research Highlights / Publications:\n\nPlease find attached my CV and summary of research accomplishments.\n\nSincerely,\n[Your Name]\n[Contact Information]`
  );
  window.location.href = `mailto:manzhq@mail.sysu.edu.cn?subject=${subject}&body=${body}`;
}

// Copy BibTeX with toast
function copyBibTeX(pubId) {
  const pub = LAB_DATA.publications.find(p => p.id === pubId);
  if (!pub || !pub.bibtex) return;

  navigator.clipboard.writeText(pub.bibtex).then(() => {
    showToast(I18N_DICTIONARY[currentLang].toast_copied);
  }).catch(err => {
    console.error('Failed to copy BibTeX: ', err);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const msgEl = document.getElementById('toast-message');
  if (!toast) return;

  if (msgEl) msgEl.textContent = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 2500);
}

function setPublicationFilter(filter) {
  currentPubFilter = filter;
  document.querySelectorAll('.pub-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderPublications();
}

// -----------------------------------------------------------------------------
// 6. Ambient Living Canvas (Hematopoiesis & Proton Flux Simulator)
// -----------------------------------------------------------------------------
let canvas, ctx, particles = [], animationFrameId;
let mousePos = { x: -1000, y: -1000 };

function getThemePaletteColors() {
  switch (currentTheme) {
    case 'crimson':
      return ['#8b1e2b', '#dc2626', '#f87171', '#fbbf24'];
    case 'emerald':
      return ['#0a523d', '#059669', '#34d399', '#6ee7b7'];
    case 'dark':
      return ['#38bdf8', '#34d399', '#f43f5e', '#a855f7'];
    case 'navy':
    default:
      return ['#0f3a66', '#2563eb', '#38bdf8', '#93c5fd'];
  }
}

function updateCanvasThemeColors() {
  const colors = getThemePaletteColors();
  particles.forEach(p => {
    p.color = colors[Math.floor(Math.random() * colors.length)];
  });
}

function initAmbientCanvas() {
  canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });

  const particleCount = Math.min(Math.floor(window.innerWidth / 28), 55);
  const colors = getThemePaletteColors();

  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Mouse interactive deflection
      const dx = mousePos.x - p.x;
      const dy = mousePos.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        p.x -= (dx / dist) * 0.7;
        p.y -= (dy / dist) * 0.7;
      }

      // Draw particle dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Connect neighbor particles with organic biological filaments
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist2 < 95) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - dist2 / 95) * 0.18;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0;
    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

// -----------------------------------------------------------------------------
// 7. Scroll Progress Bar & Event Listeners
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Apply initial theme and language
  setTheme(currentTheme);
  setLanguage(currentLang);

  // Initialize canvas
  initAmbientCanvas();

  // Initialize world clocks and interval
  updateWorldClocks();
  setInterval(updateWorldClocks, 1000);

  // Scroll Progress Bar
  const progressBar = document.getElementById('scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0 && progressBar) {
      const progress = (window.scrollY / totalScroll) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });

  // Search input listener
  const searchInput = document.getElementById('pub-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderPublications();
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('hidden');
    });
  }

  // Close modals when clicking backdrop
  const modal = document.getElementById('abstract-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAbstractModal();
    });
  }

  const figModal = document.getElementById('figure-modal');
  if (figModal) {
    figModal.addEventListener('click', (e) => {
      if (e.target === figModal) closeFigureModal();
    });
  }
});
