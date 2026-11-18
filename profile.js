// 내 프로필 페이지: 지금은 틀(메뉴바 + 흰 상자)만 있음. 로그인하지 않았으면 로그인 화면으로 보냄
(() => {
  const CFG = window.OPUSY_SUPABASE;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // 로그인 정보 보관 위치는 로그인 페이지와 같음: 자동 로그인을 켰으면 localStorage, 껐으면 sessionStorage
  const AUTO_KEY = 'opusy.autoLogin';
  const autoOn = () => { try { return localStorage.getItem(AUTO_KEY) !== '0'; } catch (e) { return true; } };
  const sessionStore = {
    getItem: (k) => { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch (e) { return null; } },
    setItem: (k, v) => {
      try {
        if (autoOn()) { localStorage.setItem(k, v); sessionStorage.removeItem(k); }
        else { sessionStorage.setItem(k, v); localStorage.removeItem(k); }
      } catch (e) {}
    },
    removeItem: (k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {} },
  };
  const sb = window.supabase.createClient(CFG.url, CFG.key, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: CFG.storageKey, storage: sessionStore },
  });

  const I18N = {
    ko: { pageTitle: '내 프로필 · OPUSY', goBack: '이전으로 돌아가기', profile: '내 프로필', settings: '설정', logout: '로그아웃' },
    en: { pageTitle: 'My profile · OPUSY', goBack: 'Go back', profile: 'My profile', settings: 'Settings', logout: 'Logout' },
  };

  let lang = 'ko';
  try { lang = localStorage.getItem('lang') === 'en' ? 'en' : 'ko'; } catch (e) {}
  function applyLang() {
    const t = I18N[lang];
    document.documentElement.lang = lang;
    document.title = t.pageTitle;
    $$('[data-i18n]').forEach((el) => { const v = t[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
    $$('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  }
  $('#menubar .lang').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem('lang', lang); } catch (err) {}
    applyLang();
  });

  // ===== 메뉴바: 아이디와 목록 (메인 페이지와 같은 동작) =====
  const nameBtn = $('#userName');
  const menu = $('#userMenu');
  const userBox = $('#user');
  const isOpen = () => menu.classList.contains('open');
  const openMenu = (open) => { menu.classList.toggle('open', open); nameBtn.setAttribute('aria-expanded', String(open)); };
  nameBtn.addEventListener('click', (e) => { e.stopPropagation(); openMenu(!isOpen()); });
  document.addEventListener('click', (e) => { if (isOpen() && !userBox.contains(e.target)) openMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openMenu(false); });
  $('#menuProfile').addEventListener('click', () => openMenu(false));     // 이미 이 페이지
  $('#menuSettings').addEventListener('click', () => openMenu(false));    // 아직 연결된 화면이 없음
  const logout = async () => {
    try { await sb.auth.signOut({ scope: 'local' }); } catch (e) {}
    sessionStore.removeItem(CFG.storageKey);
    location.href = 'index.html';
  };
  $('#logout').addEventListener('click', logout);


  // 이전으로 돌아가기: 이 사이트에서 넘어왔으면 그 페이지로, 아니면 메인으로
  $('#goBack').addEventListener('click', (e) => {
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
    if (same && history.length > 1) { e.preventDefault(); history.back(); }
  });

  // ===== 시작: 로그인 확인 =====
  applyLang();
  (async () => {
    let session = null;
    try { session = (await sb.auth.getSession()).data.session; } catch (e) {}
    if (!session) { location.replace('login.html'); return; }   // 로그인하지 않았으면 로그인 화면으로

    const u = session.user;
    const meta = u.user_metadata || {};
    const shownId = String(meta.username || (u.email || '').split('@')[0] || '').trim();
    $('#menubar .login').hidden = true;
    userBox.hidden = false;
    nameBtn.textContent = shownId;
    nameBtn.title = shownId;
  })();
})();
