/* 에스원 UI 코드 라이브러리 - scripts */

// ---- GETTING STARTED TABS ----
function gsTab(btn, panelId) {
  var wrap = btn.closest('.component-block') || btn.closest('.step-card') || btn.closest('.gs-tab-wrap');
  if (!wrap) return;
  wrap.querySelectorAll('.gs-tab').forEach(function(b) { b.classList.remove('active'); });
  wrap.querySelectorAll('.gs-tab-panel').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

// ---- CHANGELOG ----
function toggleChangelog() {
  const panel = document.getElementById('changelogPanel');
  if (panel) panel.classList.toggle('open');
}
// ---- FILTER CHIP ----
    function toggleFilterChip(id) {
      const dd = document.getElementById(id);
      document.querySelectorAll('.field-dropdown.show').forEach(d => { if (d !== dd) d.classList.remove('show'); });
      dd.classList.toggle('show');
    }
    function selectFilterChip(id, val, el) {
      const dd = document.getElementById(id);
      dd.querySelector('.selected-label').textContent = val;
      dd.querySelectorAll('.btn-dropdown-list').forEach(b => b.classList.remove('selected'));
      el.classList.add('selected');
      dd.classList.remove('show');
    }

    // ---- TIMEPICKER ----
    function toggleTimepicker(id) {
      const dp = document.getElementById(id);
      const allDps = document.querySelectorAll('.timepicker-dropdown');
      allDps.forEach(d => { if (d.id !== id) d.style.display = 'none'; });
      dp.style.display = dp.style.display === 'none' ? 'block' : 'none';
    }
    function pickTime(tpId, btn, type) {
      const dp = document.getElementById(tpId);
      dp.querySelectorAll('button[onclick*="' + type + '"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    // ---- RANGE TIMEPICKER ----
    function toggleRangePicker(id) {
      const dp = document.getElementById(id);
      dp.style.display = dp.style.display === 'none' ? 'block' : 'none';
    }
    function switchRtpTab(id, tab) {
      const startBtn = document.getElementById(id + '-tab-start');
      const endBtn = document.getElementById(id + '-tab-end');
      if (tab === 'start') {
        startBtn.style.borderBottom = '2px solid #1d6ceb'; startBtn.style.color = '#1d6ceb';
        endBtn.style.borderBottom = ''; endBtn.style.color = '';
      } else {
        endBtn.style.borderBottom = '2px solid #1d6ceb'; endBtn.style.color = '#1d6ceb';
        startBtn.style.borderBottom = ''; startBtn.style.color = '';
      }
    }
    function pickRtpTime(id, btn, type) {
      const dp = document.getElementById(id);
      dp.querySelectorAll('button[onclick*="' + type + '"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    // ---- ROUTE ACCORDION ----
    function toggleRoute(topEl) {
      const li = topEl.closest('.route-list');
      const box = li.closest('.route-list-box');
      const bottom = li.querySelector('.route-list-bottom');
      const isActive = li.classList.contains('active');
      // 같은 박스 내 항목만 닫기 (PC/Mobile 모두 동작)
      box.querySelectorAll('.route-list').forEach(item => {
        item.classList.remove('active');
        const b = item.querySelector('.route-list-bottom');
        if (b) b.style.display = 'none';
      });
      if (!isActive) {
        li.classList.add('active');
        if (bottom) bottom.style.display = '';
      }
    }

    // ---- MAP CONTROL ----
    function setMapView(btn) {
      const box = btn.closest('.view-btn-box');
      box.querySelectorAll('.tab-view').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    }


/* ============================================
   MOBILE SIDEBAR TOGGLE
   ============================================ */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

/* ============================================
   PLATFORM SWITCH  (PC ↔ Mobile)
   ============================================ */
let currentPlatform = 'pc';

function switchPlatform(platform) {
  if (currentPlatform === platform) return;
  currentPlatform = platform;

  // 1. 토글 버튼 active 상태
  document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.platform === platform);
  });

  // 2. 토큰 + 컴포넌트 CSS 교체 (lib-style.css는 항상 유지)
  const pcComp   = document.getElementById('pc-components');
  const mobVars  = document.getElementById('mobile-variables');
  const mobComp  = document.getElementById('mobile-components');
  if (platform === 'mobile') {
    pcComp.disabled  = true;
    mobVars.disabled = false;
    mobComp.disabled = false;
  } else {
    pcComp.disabled  = false;
    mobVars.disabled = true;
    mobComp.disabled = true;
  }

  // 3. 사이드바 nav 섹션 표시/숨김
  document.querySelectorAll('.sidebar-section.platform-pc').forEach(el => {
    el.style.display = platform === 'pc' ? '' : 'none';
  });
  document.querySelectorAll('.sidebar-section.platform-mobile').forEach(el => {
    el.style.display = platform === 'mobile' ? '' : 'none';
  });

  // 4. 개요 화면 컴포넌트 그리드 표시/숨김
  document.querySelectorAll('.overview-content.platform-pc').forEach(el => {
    el.style.display = platform === 'pc' ? '' : 'none';
  });
  document.querySelectorAll('.overview-content.platform-mobile').forEach(el => {
    el.style.display = platform === 'mobile' ? '' : 'none';
  });

  // 5. 플랫폼에 맞는 첫 페이지로 이동
  const targetPage = 'overview';
  navigate(targetPage);
}

  // ---- IFRAME WHEEL → PARENT SCROLL ----
  window.addEventListener('message', function(e) {
    if (!e.data) return;
    if (e.data.type === 'iframeWheel') {
      const activeSection = document.querySelector('.page-section.active');
      if (activeSection) activeSection.scrollBy(e.data.deltaX, e.data.deltaY);
    }
    if (e.data.type === 'iframeHeight' && e.data.height > 0) {
      document.querySelectorAll('.component-preview iframe').forEach(function(iframe) {
        if (iframe.contentWindow === e.source) {
          iframe.style.height = e.data.height + 'px';
        }
      });
    }
  });

  // ---- IFRAME AUTO RESIZE (fallback: same-origin direct access) ----
  function resizeIframe(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const h = Math.max(
        doc.body.scrollHeight,
        doc.body.offsetHeight,
        doc.documentElement.scrollHeight,
        doc.documentElement.offsetHeight
      );
      if (h > 0) iframe.style.height = h + 'px';
    } catch(e) {}
  }

  document.querySelectorAll('.component-preview iframe').forEach(function(iframe) {
    iframe.addEventListener('load', function() { resizeIframe(this); });
  });

  // ---- PAGE NAVIGATION ----
  function navigate(page) {
    // 모든 nav 링크 active 해제
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    // nav 링크 active
    document.querySelectorAll('[data-page="' + page + '"]').forEach(a => a.classList.add('active'));

    // 모든 page-section 숨기기 (display:none이 scroll context를 파괴 → 자동 scrollTop 리셋)
    document.querySelectorAll('.page-section').forEach(s => {
      s.style.display = 'none';
      s.classList.remove('active');
    });

    // 대상 섹션 표시 (새 scroll context → scrollTop은 항상 0)
    const section = document.getElementById('page-' + page);
    if (section) {
      section.style.display = '';
      section.classList.add('active');
      section.scrollTop = 0;
      // 이미 로드된 iframe 리사이즈
      section.querySelectorAll('.component-preview iframe').forEach(resizeIframe);
    }
  }

  window.navigate = navigate;

  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      navigate(this.dataset.page);
    });
  });

  // 초기 로드: 모든 섹션 숨기기
  document.querySelectorAll('.page-section').forEach(s => {
    s.style.display = 'none';
  });
  // mobile 사이드바 숨기기
  document.querySelectorAll('.sidebar-section.platform-mobile').forEach(el => {
    el.style.display = 'none';
  });
  // 초기 페이지 표시
  navigate('overview');

  // ---- SEARCH ----
  const pcPages = [
    {id:'overview',         label:'overview 개요'},
    {id:'getting-started',  label:'getting started 시작하기'},
    {id:'tokens',           label:'tokens 디자인 토큰 design token'},
    {id:'badge',            label:'badge'},
    {id:'button',           label:'button'},
    {id:'checkbox',         label:'checkbox'},
    {id:'chip',             label:'chip filter chip'},
    {id:'datepicker',       label:'datepicker date picker'},
    {id:'dropdown',         label:'dropdown'},
    {id:'input',            label:'input'},
    {id:'loading',          label:'loading'},
    {id:'modal',            label:'modal popup'},
    {id:'radio',            label:'radio'},
    {id:'rangetimepicker',  label:'rangetimepicker range time picker'},
    {id:'routeaccordion',   label:'routeaccordion route accordion'},
    {id:'switch',           label:'switch'},
    {id:'tab',              label:'tab'},
    {id:'timepicker',       label:'timepicker time picker'},
    {id:'weatherwidget',    label:'weatherwidget weather widget'},
    {id:'utility',          label:'utility'},
    {id:'guidelines',       label:'guidelines'},
  ];
  const mobilePages = [
    {id:'overview',             label:'overview 개요'},
    {id:'getting-started',      label:'getting started 시작하기'},
    {id:'tokens',               label:'tokens 디자인 토큰 design token'},
    {id:'m-badge',              label:'badge'},
    {id:'m-button',             label:'button'},
    {id:'m-checkbox',           label:'checkbox'},
    {id:'m-datepicker',         label:'datepicker date picker'},
    {id:'m-dropdown',           label:'dropdown'},
    {id:'m-dropdowntypelabel',  label:'dropdowntypelabel dropdown type label'},
    {id:'m-filterchip',         label:'filterchip filter chip'},
    {id:'m-input',              label:'input'},
    {id:'m-loading',            label:'loading'},
    {id:'m-mapicon',            label:'mapicon map icon'},
    {id:'m-modal',              label:'modal popup'},
    {id:'m-multidropdown',      label:'multidropdown multi dropdown'},
    {id:'m-radio',              label:'radio'},
    {id:'m-rangetimepicker',    label:'rangetimepicker range time picker'},
    {id:'m-routeaccordion',     label:'routeaccordion route accordion'},
    {id:'m-switch',             label:'switch'},
    {id:'m-tab',                label:'tab'},
    {id:'m-timepicker',         label:'timepicker time picker'},
    {id:'m-weatherwidget',      label:'weatherwidget weather widget'},
  ];
  document.getElementById('searchInput').addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    if (q.length < 2) return;
    const list = currentPlatform === 'mobile' ? mobilePages : pcPages;
    const match = list.find(p => p.id.includes(q) || p.label.includes(q));
    if (match) navigate(match.id);
  });

  // ---- COPY CODE ----
  function copyCode(btn) {
    const wrapper = btn.closest('.code-block-wrapper');
    const pre = wrapper.querySelector('.code-snippet.active pre') || wrapper.querySelector('.code-snippet pre');
    if (!pre) return;
    const text = pre.innerText;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  }

  // ---- TAB SWITCHING (code tabs) ----
  function switchTab(el, targetId) {
    const parent = el.closest('.code-block-wrapper');
    parent.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    parent.querySelectorAll('.code-snippet').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');
  }

  // ---- SWITCH DEMO ----
  document.querySelectorAll('.switch-input').forEach(input => {
    input.addEventListener('change', function() {});
  });

  // ---- TAB DEMO ----
  function setTab(btn) {
    const group = btn.closest('.btn-group');
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
  }

  // ---- DROPDOWN DEMO ----
  function toggleDropdown(id) {
    const dd = document.getElementById(id);
    const isOpen = dd.classList.contains('open');
    document.querySelectorAll('.demo-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) dd.classList.add('open');
  }
  function selectDropdown(id, value, el) {
    document.getElementById(id + '-text').textContent = value;
    const dd = document.getElementById(id);
    dd.querySelectorAll('.demo-dropdown-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    dd.classList.remove('open');
  }
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.demo-dropdown')) {
      document.querySelectorAll('.demo-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  // ---- MODAL DEMO ----
  function openModal(id) {
    document.getElementById(id).classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    document.body.style.overflow = '';
  }
  document.getElementById('demo-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal('demo-modal');
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal('demo-modal');
  });