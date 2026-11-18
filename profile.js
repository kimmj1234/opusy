// 내 프로필 페이지: 프로필 사진·계정 정보(왼쪽 위)와 등록된 기기(오른쪽 위). 로그인하지 않았으면 로그인 화면으로 보냄
(() => {
  const CFG = window.OPUSY_SUPABASE;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // 브라우저에 남아 있던 예전 화면(HTML)에 새 스크립트가 붙으면 필요한 칸이 없어 멈추게 됨.
  // 그럴 때는 화면을 한 번만 새로 받아 와서 다시 엶.
  const NEED = ['pfTop', 'pfPhoto', 'pfFile', 'pfCover', 'pfCoverFile', 'pfCoverImg', 'pfCoverEmpty', 'pfCoverRemove', 'pfMsg', 'pfRemove', 'pfId', 'pfEmail', 'pfStatPosts', 'pfDev', 'pfDevList', 'pfDevCount', 'pfDevNote'];
  const REFETCH = 'opusy.profile.refetch';
  if (NEED.some((id) => !document.getElementById(id))) {
    let tried = false;
    try { tried = sessionStorage.getItem(REFETCH) === '1'; sessionStorage.setItem(REFETCH, '1'); } catch (e) { tried = true; }
    if (!tried) fetch(location.pathname, { cache: 'reload' }).then(() => location.reload(), () => {});
    return;
  }
  try { sessionStorage.removeItem(REFETCH); } catch (e) {}

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
      pageTitle: '내 프로필 · OPUSY', goBack: '이전으로 돌아가기', profile: '내 프로필', settings: '설정', logout: '로그아웃',
      addPhoto: '사진 추가', changePhoto: '사진 바꾸기', removePhoto: '사진 지우기', photoLabel: '프로필 사진',
      addCover: '배경 사진 추가', changeCover: '배경 사진 바꾸기', removeCover: '배경 지우기', coverLabel: '배경 사진',
      posts: '게시글', followers: '팔로워', following: '팔로우', likes: '좋아요',
      devices: '등록된 기기', devCount: (n) => `${n}대`, devOn: (d) => `${d}에 등록`,
      devNone: '등록된 기기가 없어요.', devFail: '기기 목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.',
      devName: { mac: 'Mac', windows: 'Windows PC', ios: 'iPhone · iPad', android: 'Android 기기', pc: '컴퓨터', mobile: '휴대폰' },
      date: (d) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`,
      m: {
        uploading: '사진을 올리는 중이에요…',
        notImage: '이미지 파일만 올릴 수 있어요.',
        tooBig: '파일이 너무 커요. 20MB 이하의 사진을 골라 주세요.',
        fail: '사진을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        load: '프로필을 불러오지 못했어요. 잠시 후 새로고침해 주세요.',
      },
    },
    en: {
      pageTitle: 'My profile · OPUSY', goBack: 'Go back', profile: 'My profile', settings: 'Settings', logout: 'Logout',
      addPhoto: 'Add photo', changePhoto: 'Change photo', removePhoto: 'Remove photo', photoLabel: 'Profile photo',
      addCover: 'Add cover photo', changeCover: 'Change cover photo', removeCover: 'Remove cover', coverLabel: 'Cover photo',
      posts: 'Posts', followers: 'Followers', following: 'Following', likes: 'Likes',
      devices: 'Registered devices', devCount: (n) => String(n), devOn: (d) => `Registered on ${d}`,
      devNone: 'No registered devices.', devFail: 'Could not load your devices. Please refresh in a moment.',
      devName: { mac: 'Mac', windows: 'Windows PC', ios: 'iPhone · iPad', android: 'Android device', pc: 'Computer', mobile: 'Phone' },
      date: (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      m: {
        uploading: 'Uploading your photo…',
        notImage: 'Only image files can be uploaded.',
        tooBig: 'That file is too large. Choose a photo under 20MB.',
        fail: 'Could not save the photo. Please try again in a moment.',
        load: 'Could not load your profile. Please refresh in a moment.',
      },
    },
  };

  let lang = 'ko';
  try { lang = localStorage.getItem('lang') === 'en' ? 'en' : 'ko'; } catch (e) {}
  function applyLang() {
    const t = I18N[lang];
    document.documentElement.lang = lang;
    document.title = t.pageTitle;
    $$('[data-i18n]').forEach((el) => { const v = t[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
    $$('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    $('#pfPhoto').setAttribute('aria-label', t.photoLabel);
    $('#pfCover').setAttribute('aria-label', t.coverLabel);
    showMsg(msgKey, msgInfo);
    showDevices();
  }
  // 등록된 기기 목록 (언어를 바꾸면 다시 그림). devices: null=아직 안 불러옴, false=실패, 배열=목록
  let devices = null;
  const ICON = {
    pc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>',
  };
  function showDevices() {
    const t = I18N[lang];
    const list = $('#pfDevList');
    const note = $('#pfDevNote');
    list.textContent = '';
    note.classList.toggle('bad', devices === false);
    if (devices === null) { $('#pfDevCount').textContent = ''; note.textContent = ''; return; }
    if (devices === false) { $('#pfDevCount').textContent = ''; note.textContent = t.devFail; return; }
    $('#pfDevCount').textContent = t.devCount(devices.length);
    note.textContent = devices.length ? '' : t.devNone;
    devices.forEach((d) => {
      const kind = d.device_kind === 'mobile' ? 'mobile' : 'pc';
      const li = document.createElement('li');
      li.className = 'pf-dev-item';
      li.innerHTML = ICON[kind];                                   // 고정된 아이콘 그림만 HTML 로 넣고, 글자는 아래에서 textContent 로 넣음
      const box = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = t.devName[d.platform] || t.devName[kind];
      const when = document.createElement('span');
      const dt = localDate(d.created_at);
      when.textContent = dt ? t.devOn(t.date(dt)) : '';
      box.append(name, when);
      li.append(box);
      list.append(li);
    });
  }
  const localDate = (v) => {            // 'YYYY-MM-DD' 는 시간대 때문에 하루 밀리지 않게 직접 나눠서 만듦
    if (!v) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
    const d = m && String(v).length === 10 ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
    return isNaN(d) ? null : d;
  };
  // 사진 아래 안내 문구 (언어를 바꾸면 다시 표기). info=true 면 오류가 아닌 진행 안내
  let msgKey = '';
  let msgInfo = false;
  function showMsg(key, info) {
    msgKey = key || ''; msgInfo = !!info;
    const el = $('#pfMsg');
    el.textContent = msgKey ? I18N[lang].m[msgKey] : '';
    el.style.color = msgInfo ? '#55565f' : '';
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

  // ===== 프로필 사진과 배경 사진 =====
  // 사진은 저장소(avatars)의 '내 아이디 폴더' 에 올리고, 그 경로를 profiles 표의 avatar_path(프로필) / cover_path(배경)에 적어 둠
  const bucket = () => sb.storage.from('avatars');
  let uid = null;
  let canEdit = false;
  let busy = false;
  const isImage = (file) => String(file.type).startsWith('image/');
  const publicUrl = (path) => `${CFG.url}/storage/v1/object/public/avatars/${path}`;
  const dropFile = async (path) => { try { await bucket().remove([path]); } catch (e) {} };

  async function decode(file) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) {
      return new Promise((res, rej) => {
        const im = new Image();
        const url = URL.createObjectURL(file);
        im.onload = () => { URL.revokeObjectURL(url); res(im); };
        im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
        im.src = url;
      });
    }
  }
  const toJpeg = (cv, q) => new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', q));
  // 프로필 사진: 가운데 기준 정사각형으로 잘라 640px 로 줄임 (원본을 그대로 올리지 않음)
  async function squareJpeg(file) {
    const src = await decode(file);
    const w = src.width, h = src.height, side = Math.min(w, h), out = Math.min(640, side);
    const cv = document.createElement('canvas');
    cv.width = out; cv.height = out;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, out, out);          // 투명한 부분은 흰색으로
    ctx.drawImage(src, (w - side) / 2, (h - side) / 2, side, side, 0, 0, out, out);
    if (src.close) src.close();
    return toJpeg(cv, 0.86);
  }
  // 배경 사진: 자르지 않고 긴 쪽이 1600px 이하가 되게 줄임. 저장소 제한(1MB)을 넘으면 화질을 조금씩 낮춤
  async function wideJpeg(file) {
    const src = await decode(file);
    const k = Math.min(1, 1600 / Math.max(src.width, src.height));
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(src.width * k)); cv.height = Math.max(1, Math.round(src.height * k));
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(src, 0, 0, cv.width, cv.height);
    if (src.close) src.close();
    let blob = null;
    for (const q of [0.86, 0.72, 0.58, 0.45]) { blob = await toJpeg(cv, q); if (blob.size <= 900 * 1024) break; }
    return blob;
  }

  // 사진 한 종류(프로필 / 배경)를 다루는 묶음: 보여 주기, 올리기, 바꾸기, 지우기
  function photoKind(o) {
    const k = { path: null };
    const btn = $(o.btn), img = $(o.img), empty = $(o.empty), file = $(o.file), rm = $(o.remove);
    k.btn = btn; k.rm = rm;
    k.show = (path) => {
      k.path = path;
      if (path) img.src = publicUrl(path); else img.removeAttribute('src');
      img.hidden = !path;
      empty.hidden = !!path;
      btn.classList.toggle('has-img', !!path);
      rm.hidden = !path;
    };
    const save = async (path) => {
      const { data, error } = await sb.from('profiles').update({ [o.column]: path }).eq('id', uid).select('id');
      return !error && !!data && data.length === 1;
    };
    btn.addEventListener('click', () => {
      if (busy) return;
      if (!canEdit) return showMsg('load');       // 내 정보를 못 불러온 상태: 조용히 무시하지 않고 이유를 알림
      try { if (file.showPicker) file.showPicker(); else file.click(); } catch (e) { file.click(); }
    });
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      file.value = '';
      if (!f || busy || !canEdit) return;
      if (!isImage(f)) return showMsg('notImage');
      if (f.size > 20 * 1024 * 1024) return showMsg('tooBig');
      setBusy(true, btn); showMsg('uploading', true);
      const old = k.path;
      const path = `${uid}/${o.prefix}${Date.now()}.jpg`;
      let ok = false;
      try {
        const blob = await o.encode(f);
        const up = await bucket().upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (!up.error) {
          ok = await save(path);
          if (!ok) await dropFile(path);          // 경로를 못 적었으면 올린 파일을 치움
        }
      } catch (e) {}
      if (ok) {
        k.show(path); showMsg('');
        if (old) await dropFile(old);             // 이전 사진 파일 정리
      } else showMsg('fail');
      setBusy(false, btn);
    });
    rm.addEventListener('click', async () => {
      if (!k.path || busy || !canEdit) return;
      setBusy(true, btn); showMsg('');
      const old = k.path;
      let ok = false;
      try { ok = await save(null); } catch (e) {}
      if (ok) { await dropFile(old); k.show(null); } else showMsg('fail');
      setBusy(false, btn);
    });
    return k;
  }
  const photo = photoKind({ btn: '#pfPhoto', img: '#pfPhotoImg', empty: '#pfPhotoEmpty', file: '#pfFile', remove: '#pfRemove', column: 'avatar_path', prefix: '', encode: squareJpeg });
  const cover = photoKind({ btn: '#pfCover', img: '#pfCoverImg', empty: '#pfCoverEmpty', file: '#pfCoverFile', remove: '#pfCoverRemove', column: 'cover_path', prefix: 'c', encode: wideJpeg });
  function setBusy(on, btn) {
    busy = on;
    btn.classList.toggle('is-busy', on);
    photo.rm.disabled = on; cover.rm.disabled = on;
  }

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

    // 저장된 프로필 사진·배경 사진과 계정 정보 불러오기
    uid = u.id;
    let p = null;
    try {
      const { data, error } = await sb.from('profiles').select('username, avatar_path, cover_path').eq('id', uid).maybeSingle();
      if (!error && data) p = data;
    } catch (e) {}
    const text = (id, v) => { $(id).textContent = v || '–'; $(id).title = v || ''; };
    text('#pfId', (p && p.username) || shownId);
    text('#pfEmail', u.email);
    if (p) { photo.show(p.avatar_path || null); cover.show(p.cover_path || null); } else showMsg('load');
    canEdit = !!p;
    $('#pfTop').classList.remove('is-loading');

    // 등록된 기기: 서버 함수 my_devices 가 내 기기의 종류·운영체제·등록일만 돌려줌
    try {
      const { data, error } = await sb.rpc('my_devices');
      devices = !error && Array.isArray(data) ? data : false;
    } catch (e) { devices = false; }
    showDevices();
    $('#pfDev').classList.remove('is-loading');
  })();
})();
