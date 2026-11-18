// 내 프로필 페이지: 로그인한 사용자의 정보를 보여 주고, 이름·생년월일·전화번호를 바꿀 수 있게 함
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
    ko: {
      pageTitle: '내 프로필 · OPUSY',
      username: '아이디', email: '이메일', name: '이름', birth: '생년월일', phone: '전화번호',
      title: '내 정보 수정', sub: '이름, 생년월일, 전화번호를 바꿀 수 있어요',
      edit: '내 정보 수정', editD: '이름 · 생년월일 · 전화번호', settingsD: '준비 중이에요', logoutD: '이 기기에서 로그아웃해요', toHome: '돌아가기',
      save: '저장하기', saving: '저장하는 중…', goBack: '이전으로 돌아가기',
      profile: '내 프로필', settings: '설정', logout: '로그아웃',
      joined: (d) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일에 가입했어요`,
      m: {
        saved: '저장했어요.',
        name: '이름을 1~30자로 입력해 주세요.',
        birth: '생년월일을 YYYY-MM-DD 형식으로 정확히 입력해 주세요.',
        phone: '전화번호를 정확히 입력해 주세요.',
        load: '내 정보를 불러오지 못했어요. 잠시 후 새로고침해 주세요.',
        fail: '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      },
    },
    en: {
      pageTitle: 'My profile · OPUSY',
      username: 'ID', email: 'Email', name: 'Name', birth: 'Date of birth', phone: 'Phone number',
      title: 'Edit my details', sub: 'Update your name, date of birth and phone number',
      edit: 'Edit my details', editD: 'Name · Date of birth · Phone', settingsD: 'Coming soon', logoutD: 'Sign out on this device', toHome: 'Back',
      save: 'Save', saving: 'Saving…', goBack: 'Go back',
      profile: 'My profile', settings: 'Settings', logout: 'Logout',
      joined: (d) => `Joined on ${d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      m: {
        saved: 'Saved.',
        name: 'Enter a name of 1 to 30 characters.',
        birth: 'Enter a valid date of birth as YYYY-MM-DD.',
        phone: 'Enter a valid phone number.',
        load: 'Could not load your details. Please refresh in a moment.',
        fail: 'Could not save. Please try again in a moment.',
      },
    },
  };

  let lang = 'ko';
  try { lang = localStorage.getItem('lang') === 'en' ? 'en' : 'ko'; } catch (e) {}
  let joinedAt = null;           // 가입일 (언어를 바꾸면 다시 표기)
  let msgKey = '';               // 지금 보이는 안내 문구 (언어를 바꾸면 다시 표기)
  let msgOk = false;

  const form = $('#form-profile');
  const side = $('#pfSide');
  const msgEl = $('#pfMsg');
  const saveBtn = $('#pfSave');
  const f = { name: $('#pf-name'), birth: $('#pf-birth'), phone: $('#pf-phone') };
  let saving = false;
  let loaded = null;             // 서버에 저장돼 있는 값 (바뀐 게 있는지 비교용)

  const showMsg = (key, ok) => {
    msgKey = key || ''; msgOk = !!ok;
    msgEl.textContent = msgKey ? I18N[lang].m[msgKey] : '';
    msgEl.classList.toggle('ok', msgOk);
  };
  function applyLang() {
    const t = I18N[lang];
    document.documentElement.lang = lang;
    document.title = t.pageTitle;
    $$('[data-i18n]').forEach((el) => { const v = t[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
    $$('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    if (saving) saveBtn.textContent = t.saving;
    $('#pfJoined').textContent = joinedAt ? t.joined(joinedAt) : '';
    showMsg(msgKey, msgOk);
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
  $('#menuProfile').addEventListener('click', () => { openMenu(false); showEdit(false); });     // 이미 이 페이지: 첫 화면으로
  $('#menuSettings').addEventListener('click', () => openMenu(false));    // 아직 연결된 화면이 없음
  const logout = async () => {
    try { await sb.auth.signOut({ scope: 'local' }); } catch (e) {}
    sessionStore.removeItem(CFG.storageKey);
    location.href = 'index.html';
  };
  $('#logout').addEventListener('click', logout);

  // ===== 화면 전환: 첫 화면(사진·메뉴) ↔ 내 정보 수정 =====
  const viewHome = $('#viewHome');
  const viewEdit = $('#viewEdit');
  const showEdit = (on) => {
    viewHome.hidden = on; viewEdit.hidden = !on;
    if (on) { const el = $('#pf-name'); if (!el.disabled) el.focus({ preventScroll: true }); }
  };
  $('#mEdit').addEventListener('click', () => showEdit(true));
  $('#toHome').addEventListener('click', () => showEdit(false));
  $('#mSettings').addEventListener('click', () => {});                    // 아직 연결된 화면이 없음
  $('#mLogout').addEventListener('click', logout);

  // 이전으로 돌아가기: 이 사이트에서 넘어왔으면 그 페이지로, 아니면 메인으로
  $('#goBack').addEventListener('click', (e) => {
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
    if (same && history.length > 1) { e.preventDefault(); history.back(); }
  });

  // ===== 입력 형식 =====
  const fmtBirth = (v) => {
    const d = String(v || '').replace(/\D/g, '').slice(0, 8);
    return d.length > 6 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
  };
  const fmtPhone = (v) => {
    const d = String(v || '').replace(/\D/g, '').slice(0, 11);
    return d.length > 7 ? `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}` : d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
  };
  const birthOk = (v) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const [y, m, d] = v.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d && y >= 1900 && dt <= new Date();
  };
  const phoneOk = (v) => /^01\d{8,9}$/.test(v.replace(/\D/g, ''));

  const current = () => ({ name: f.name.value.trim(), birth: f.birth.value, phone: f.phone.value.replace(/\D/g, '') });
  const changed = () => {
    if (!loaded) return false;
    const c = current();
    return c.name !== loaded.name || c.birth !== loaded.birth || c.phone !== loaded.phone;
  };
  const refreshBtn = () => { saveBtn.disabled = saving || !changed(); };

  f.birth.addEventListener('input', () => { f.birth.value = fmtBirth(f.birth.value); });
  f.phone.addEventListener('input', () => { f.phone.value = fmtPhone(f.phone.value); });
  Object.values(f).forEach((el) => el.addEventListener('input', () => {
    el.removeAttribute('aria-invalid');
    if (msgKey) showMsg('');
    refreshBtn();
  }));

  // ===== 저장 =====
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (saving || !changed()) return;
    const c = current();
    const bad = (key, el) => { el.setAttribute('aria-invalid', 'true'); el.focus(); showMsg(key); };
    if (c.name.length < 1 || c.name.length > 30) return bad('name', f.name);
    if (!birthOk(c.birth)) return bad('birth', f.birth);
    if (!phoneOk(c.phone)) return bad('phone', f.phone);

    saving = true; refreshBtn(); showMsg('');
    saveBtn.textContent = I18N[lang].saving;
    let ok = false;
    try {
      const { data: s } = await sb.auth.getSession();
      const uid = s && s.session && s.session.user.id;
      if (uid) {
        const { data, error } = await sb.from('profiles')
          .update({ name: c.name, birth_date: c.birth, phone: c.phone })
          .eq('id', uid).select('id');
        ok = !error && !!data && data.length === 1;
      }
    } catch (err) {}
    saving = false;
    saveBtn.textContent = I18N[lang].save;
    if (ok) { loaded = c; f.name.value = c.name; showMsg('saved', true); }
    else showMsg('fail');
    refreshBtn();
  });

  // ===== 시작: 로그인 확인 → 내 정보 불러오기 =====
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

    const fill = (id, joined) => {
      $('#pf-username').value = id;
      $('#pf-email').value = u.email || '';
      $('#pfId').textContent = id;
      $('#pfAvatar').textContent = id.slice(0, 1);
      joinedAt = joined ? new Date(joined) : null;
      $('#pfJoined').textContent = joinedAt ? I18N[lang].joined(joinedAt) : '';
      side.classList.remove('is-loading');
      form.classList.remove('is-loading');
    };

    let p = null;
    try {
      const { data, error } = await sb.from('profiles').select('username, name, birth_date, phone, created_at').eq('id', u.id).maybeSingle();
      if (!error) p = data;
    } catch (e) {}
    if (!p) {
      fill(shownId, u.created_at);
      Object.values(f).forEach((el) => { el.disabled = true; });
      showMsg('load');
      return;
    }
    fill(p.username || shownId, p.created_at);
    f.name.value = p.name || '';
    f.birth.value = p.birth_date || '';
    f.phone.value = fmtPhone(p.phone);
    loaded = current();
    refreshBtn();
  })();
})();
