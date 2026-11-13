/**
 * Wen Laboratory — Festival and Holiday Theme Dispatcher
 * Automatically detects festive windows (+/- 1 day of holiday, total 3 days)
 * Supports solar & accurate lunar festivals for 2025-2030.
 * Allows interactive preview override.
 */
(function () {
  'use strict';

  // Master festival schedule with solar & verified lunar dates (YYYY-MM-DD format for each festival peak)
  const FESTIVALS = {
    spring: {
      id: 'spring',
      logo: 'logo-spring',
      // Lunar Jan 1 (Peak date; active window is peak - 1 day to peak + 1 day)
      dates: {
        2025: '2025-01-29',
        2026: '2026-02-17',
        2027: '2027-02-06',
        2028: '2028-01-26',
        2029: '2029-02-13',
        2030: '2030-02-03'
      }
    },
    lantern: {
      id: 'lantern',
      logo: 'logo-lantern',
      // Lunar Jan 15
      dates: {
        2025: '2025-02-12',
        2026: '2026-03-03',
        2027: '2027-02-20',
        2028: '2028-02-09',
        2029: '2029-02-27',
        2030: '2030-02-17'
      }
    },
    qixi: {
      id: 'qixi',
      logo: 'logo-qixi',
      // Lunar Jul 7
      dates: {
        2025: '2025-08-29',
        2026: '2026-08-19',
        2027: '2027-08-08',
        2028: '2028-08-26',
        2029: '2029-08-16',
        2030: '2030-08-05'
      }
    },
    midautumn: {
      id: 'midautumn',
      logo: 'logo-midautumn',
      // Lunar Aug 15
      dates: {
        2025: '2025-10-06',
        2026: '2026-09-25',
        2027: '2027-09-15',
        2028: '2028-10-03',
        2029: '2029-09-22',
        2030: '2030-09-12'
      }
    },
    halloween: {
      id: 'halloween',
      logo: 'logo-halloween',
      // Solar Oct 31 (Active Oct 30 - Nov 1)
      solarMonth: 10,
      solarDay: 31
    },
    christmas: {
      id: 'christmas',
      logo: 'logo-christmas',
      // Solar Dec 25 (Active Dec 24 - Dec 26)
      solarMonth: 12,
      solarDay: 25
    }
  };

  /**
   * Check if a given Date falls within peakDate +/- 1 day (3-day window)
   */
  function isWithin3Days(current, peak) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((current - peak) / oneDay);
    return Math.abs(diffDays) <= 1;
  }

  /**
   * Detect currently active festival based on system date
   */
  function detectActiveFestival(nowDate) {
    const now = nowDate || new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1; // 1-12
    const curDate = now.getDate();
    const curTime = new Date(curYear, now.getMonth(), curDate).getTime();

    for (const key of Object.keys(FESTIVALS)) {
      const f = FESTIVALS[key];
      let peakTime = null;

      if (f.dates && f.dates[curYear]) {
        const parts = f.dates[curYear].split('-').map(Number);
        peakTime = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
      } else if (f.solarMonth && f.solarDay) {
        peakTime = new Date(curYear, f.solarMonth - 1, f.solarDay).getTime();
      }

      if (peakTime && isWithin3Days(curTime, peakTime)) {
        return f;
      }
    }
    return null;
  }

  const STORAGE_KEY = 'mch_festival_override';

  function getActiveFestival() {
    const override = localStorage.getItem(STORAGE_KEY);
    if (override === 'none') return null;
    if (override && FESTIVALS[override]) return FESTIVALS[override];
    return detectActiveFestival();
  }

  /**
   * Update page logos and html attributes
   */
  function applyFestival(festival) {
    const htmlEl = document.documentElement;
    const isEn = htmlEl.getAttribute('lang') === 'en';

    if (festival) {
      htmlEl.setAttribute('data-festival', festival.id);
    } else {
      htmlEl.removeAttribute('data-festival');
    }

    // Resolve Logo paths
    let logoSlug = isEn ? 'logo-en' : 'logo-zh';
    if (festival) {
      logoSlug = festival.logo;
    }

    // Update Header Brand Logo
    const headerMark = document.querySelector('.ll-brand__mark');
    if (headerMark) {
      const currentSrc = headerMark.getAttribute('src') || '';
      const basePrefix = currentSrc.includes('/home/') ? '/home/' : '/';
      const newSrc = `${basePrefix}images/logos/${logoSlug}.webp`;
      if (headerMark.getAttribute('src') !== newSrc) {
        headerMark.setAttribute('src', newSrc);
      }
    }

    // Update Footer Brand Logo
    const footerMark = document.querySelector('.ll-footer-mark');
    if (footerMark) {
      const currentSrc = footerMark.getAttribute('src') || '';
      const basePrefix = currentSrc.includes('/home/') ? '/home/' : '/';
      const newSrc = `${basePrefix}images/logos/${logoSlug}.webp`;
      if (footerMark.getAttribute('src') !== newSrc) {
        footerMark.setAttribute('src', newSrc);
      }
    }

    // Update Festival Deck active state if present
    const deckBtns = document.querySelectorAll('.ll-fest-btn');
    deckBtns.forEach(btn => {
      const fid = btn.getAttribute('data-fest');
      const isAct = (!festival && fid === 'none') || (festival && festival.id === fid);
      btn.classList.toggle('is-active', isAct);
    });

    // Notify listeners
    document.dispatchEvent(new CustomEvent('festivalchange', { detail: { festival } }));
  }

  // Public API
  window.__mchFestival = {
    festivals: FESTIVALS,
    detect: detectActiveFestival,
    get: getActiveFestival,
    setOverride: function (id) {
      if (id === 'auto') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, id);
      }
      applyFestival(getActiveFestival());
    },
    refresh: function () {
      applyFestival(getActiveFestival());
    }
  };

  // Immediate execution on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyFestival(getActiveFestival()));
  } else {
    applyFestival(getActiveFestival());
  }

})();
