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
    ko: {
      pageTitle: '내 프로필 · OPUSY', goBack: '이전으로 돌아가기', profile: '내 프로필', settings: '설정', logout: '로그아웃',
      addPhoto: '사진 추가', changePhoto: '사진 바꾸기', removePhoto: '사진 지우기', photoLabel: '프로필 사진',
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
    showMsg(msgKey, msgInfo);
  }
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

  // ===== 프로필 사진 =====
  // 사진은 저장소(avatars)의 '내 아이디 폴더/시각.jpg' 에 올리고, 그 경로를 profiles.avatar_path 에 적어 둠
  const photoBtn = $('#pfPhoto');
  const photoImg = $('#pfPhotoImg');
  const fileInput = $('#pfFile');
  const removeBtn = $('#pfRemove');
  const bucket = () => sb.storage.from('avatars');
  let uid = null;
  let canEdit = false;
  let busy = false;
  let photoPath = null;
  const photoUrl = (path) => `${CFG.url}/storage/v1/object/public/avatars/${path}`;
  function setPhoto(path) {
    photoPath = path;
    if (path) photoImg.src = photoUrl(path);
    else photoImg.removeAttribute('src');
    photoImg.hidden = !path;
    $('#pfPhotoEmpty').hidden = !!path;
    photoBtn.classList.toggle('has-img', !!path);
    removeBtn.hidden = !path;
  }
  const setBusy = (on) => { busy = on; photoBtn.classList.toggle('is-busy', on); removeBtn.disabled = on; };
  const isImage = (file) => String(file.type).startsWith('image/');

  // 고른 사진을 가운데 기준 정사각형으로 잘라 640px JPEG 으로 줄임 (원본을 그대로 올리지 않음)
  async function toSquareJpeg(file) {
    let src;
    try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) {
      src = await new Promise((res, rej) => {
        const im = new Image();
        const url = URL.createObjectURL(file);
        im.onload = () => { URL.revokeObjectURL(url); res(im); };
        im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
        im.src = url;
      });
    }
    const w = src.width, h = src.height, side = Math.min(w, h), out = Math.min(640, side);
    const cv = document.createElement('canvas');
    cv.width = out; cv.height = out;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, out, out);          // 투명한 부분은 흰색으로
    ctx.drawImage(src, (w - side) / 2, (h - side) / 2, side, side, 0, 0, out, out);
    if (src.close) src.close();
    return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.86));
  }
  const savePath = async (path) => {
    const { data, error } = await sb.from('profiles').update({ avatar_path: path }).eq('id', uid).select('id');
    return !error && !!data && data.length === 1;
  };
  const dropFile = async (path) => { try { await bucket().remove([path]); } catch (e) {} };

  photoBtn.addEventListener('click', () => { if (canEdit && !busy) fileInput.click(); });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file || busy || !canEdit) return;
    if (!isImage(file)) return showMsg('notImage');
    if (file.size > 20 * 1024 * 1024) return showMsg('tooBig');
    setBusy(true); showMsg('uploading', true);
    const old = photoPath;
    const path = `${uid}/${Date.now()}.jpg`;
    let ok = false;
    try {
      const blob = await toSquareJpeg(file);
      const up = await bucket().upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (!up.error) {
        ok = await savePath(path);
        if (!ok) await dropFile(path);          // 경로를 못 적었으면 올린 파일을 치움
      }
    } catch (e) {}
    if (ok) {
      setPhoto(path); showMsg('');
      if (old) await dropFile(old);             // 이전 사진 파일 정리
    } else showMsg('fail');
    setBusy(false);
  });
  removeBtn.addEventListener('click', async () => {
    if (!photoPath || busy || !canEdit) return;
    setBusy(true); showMsg('');
    const old = photoPath;
    let ok = false;
    try { ok = await savePath(null); } catch (e) {}
    if (ok) { await dropFile(old); setPhoto(null); } else showMsg('fail');
    setBusy(false);
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

    // 저장된 프로필 사진 불러오기
    uid = u.id;
    let ok = false;
    try {
      const { data, error } = await sb.from('profiles').select('avatar_path').eq('id', uid).maybeSingle();
      if (!error && data) { ok = true; setPhoto(data.avatar_path || null); }
    } catch (e) {}
    if (!ok) showMsg('load');
    canEdit = ok;
    $('#pfPhotoBox').classList.remove('is-loading');
  })();
})();
