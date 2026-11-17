// 로그인 / 회원가입 페이지: 한 카드 안에서 화면 전환, 한글/영어 전환
(() => {
  const CFG = window.OPUSY_SUPABASE;
  // 자동 로그인: 켜면 브라우저를 닫아도 로그인이 유지되고(localStorage), 끄면 이 창을 닫을 때 로그아웃됨(sessionStorage)
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
      login: '로그인', signup: '회원가입', loading: '잠시만요…', autoLogin: '자동 로그인', goBack: '이전으로 돌아가기', toLogin: '로그인하러 가기',
      head: {
        login: ['다시 오신 걸 환영해요!', '정보를 입력해 주세요'],
        signup: ['회원가입', '계정을 만들고 시작해 보세요'],
        notice: ['인증 메일을 보냈어요', ''],
      },
      idOrEmail: '아이디 또는 이메일', password: '비밀번호', forgot: '아이디 또는 비밀번호 찾기', noAcc: '계정이 없으신가요?', haveAcc: '이미 계정이 있으신가요?',
      name: '이름', suId: '아이디', email: '이메일', suPw: '비밀번호', suPw2: '비밀번호 확인',
      agree: '이용약관과 개인정보 처리방침에 동의합니다.',
      show: '보기', hide: '가리기', back: '이전', next: '다음', idLang: '아이디는 영어로 설정해야 돼요',
      pwHint: '8자 이상, 대문자·숫자·특수문자를 각각 1개 이상 써 주세요', birth: '생년월일 (YYYY-MM-DD)', phone: '전화번호',
      devBtn: '장치 등록하고 가입하기',
      devNote: '지문·얼굴·비밀번호는 이 기기 밖으로 나가지 않아요. 서버에는 기기를 구분하는 고유번호만 남아요.',
      dev: {
        title: { pc: '이 컴퓨터를 등록해 주세요', mobile: '이 휴대폰을 등록해 주세요' },
        desc: {
          mac: 'Touch ID 또는 Mac 로그인 비밀번호로 등록해요.',
          windows: 'Windows Hello(지문·얼굴·PIN)로 등록해요.',
          ios: 'Face ID·Touch ID 또는 기기 암호로 등록해요.',
          android: '지문·얼굴 인식 또는 화면 잠금 PIN·패턴으로 등록해요.',
          other: '이 기기의 잠금 방식(지문·얼굴·PIN·비밀번호)으로 등록해요.',
        },
      },
      stepSub: ['사용할 아이디를 정해 주세요', '이메일을 입력해 주세요', '비밀번호를 만들어 주세요', '내 정보를 알려 주세요', '마지막으로 이 기기를 등록해요'],
      h: { id: '영문 소문자, 숫자, 밑줄(_) 4~20자', idOk: '사용할 수 있는 아이디예요.', idTaken: '이미 사용 중인 아이디예요.' },
      notice: '메일함에서 인증 링크를 눌러 가입을 마무리해 주세요. 메일이 안 보이면 스팸함도 확인해 보세요.',
      err: {
        required: '아이디와 비밀번호를 입력해 주세요.',
        login: '아이디(또는 이메일)나 비밀번호가 올바르지 않아요.',
        unconfirmed: '이메일 인증이 아직 끝나지 않았어요. 받은 편지함의 인증 메일을 확인해 주세요.',
        network: '연결에 문제가 있어요. 잠시 뒤 다시 시도해 주세요.',
        generic: '문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.',
        name: '이름을 입력해 주세요.',
        birth: '생년월일을 YYYY-MM-DD 형식으로 정확히 입력해 주세요.',
        phone: '전화번호를 정확히 입력해 주세요.',
        idEmpty: '아이디를 입력해 주세요.',
        devUnsupported: '이 브라우저에서는 장치 등록을 쓸 수 없어요. 최신 Chrome, Safari, Edge로 다시 시도해 주세요.',
        devCancel: '장치 등록이 취소됐어요. 버튼을 다시 눌러 등록해 주세요.',
        devFail: '장치를 등록하지 못했어요. 다시 시도해 주세요.',
        devExpired: '시간이 지나 등록이 만료됐어요. 버튼을 다시 눌러 주세요.',
        devNoLock: '이 기기에 잠금 방식이 없어요. 지문·얼굴·PIN·비밀번호를 먼저 설정해 주세요.',
        idLangErr: '영어가 아닌 글자({0})가 들어 있어요. 영어로 바꿔 주세요.',
        idChars: '쓸 수 없는 글자({0})가 들어 있어요. 영문 소문자, 숫자, 밑줄(_)만 쓸 수 있어요.',
        idShort: '지금 {0}자예요. 아이디는 4자 이상이어야 해요.',
        idLong: '지금 {0}자예요. 아이디는 20자까지 쓸 수 있어요.',
        pwShort: '지금 {0}자예요. 비밀번호는 8자 이상이어야 해요.',
        pwLong: '지금 {0}자예요. 비밀번호는 72자까지 쓸 수 있어요.',
        pwMissing: '{0}가 빠졌어요. 1개 이상 넣어 주세요.',
        parts: { upper: '대문자', digit: '숫자', special: '특수문자' },
        idFormat: '아이디는 영문 소문자, 숫자, 밑줄(_)로 4~20자여야 해요.',
        emailFmt: '이메일 형식이 올바르지 않아요.',
        pw: '비밀번호는 8자 이상이며 대문자, 숫자, 특수문자를 각각 1개 이상 포함해야 해요.',
        pwSimilar: '아이디와 비슷한 비밀번호는 쓸 수 없어요.',
        pwMatch: '비밀번호가 서로 달라요.',
        agree: '약관에 동의해 주세요.',
        idTaken: '이미 사용 중인 아이디예요.',
        emailTaken: '이미 가입된 이메일이에요. 로그인하거나 비밀번호를 찾아보세요.',
        rate: '요청이 너무 많아요. 잠시 뒤 다시 시도해 주세요.',
      },
    },
    en: {
      login: 'Log in', signup: 'Sign up', loading: 'Please wait…', autoLogin: 'Stay signed in', goBack: 'Go back', toLogin: 'Go to log in',
      head: {
        login: ['Welcome back!', 'Please enter your details'],
        signup: ['Sign up', 'Create an account to get started'],
        notice: ['Verification email sent', ''],
      },
      idOrEmail: 'ID or email', password: 'Password', forgot: 'Forgot ID or password?', noAcc: "Don't have an account?", haveAcc: 'Already have an account?',
      name: 'Name', suId: 'ID', email: 'Email', suPw: 'Password', suPw2: 'Confirm password',
      agree: 'I agree to the Terms and Privacy Policy.',
      show: 'Show', hide: 'Hide', back: 'Back', next: 'Next', idLang: 'Your ID must be in English letters',
      pwHint: '8+ characters with uppercase, number and symbol', birth: 'Date of birth (YYYY-MM-DD)', phone: 'Phone number',
      devBtn: 'Register device & sign up',
      devNote: 'Your fingerprint, face or password never leaves this device. The server keeps only an ID code for the device.',
      dev: {
        title: { pc: 'Register this computer', mobile: 'Register this phone' },
        desc: {
          mac: 'Use Touch ID or your Mac login password.',
          windows: 'Use Windows Hello (fingerprint, face or PIN).',
          ios: 'Use Face ID, Touch ID or your device passcode.',
          android: 'Use fingerprint, face unlock or your screen lock PIN or pattern.',
          other: "Use this device's lock (fingerprint, face, PIN or password).",
        },
      },
      stepSub: ['Choose your ID', 'Enter your email', 'Create a password', 'Tell us about you', 'Last, register this device'],
      h: { id: 'a-z, 0-9, underscore (_), 4-20 characters', idOk: 'This ID is available.', idTaken: 'This ID is already taken.' },
      notice: 'Click the verification link in your inbox to finish signing up. If you do not see it, check your spam folder.',
      err: {
        required: 'Please enter your ID and password.',
        login: 'Your ID (or email) or password is incorrect.',
        unconfirmed: 'Your email is not verified yet. Please check the verification email in your inbox.',
        network: 'Connection problem. Please try again in a moment.',
        generic: 'Something went wrong. Please try again in a moment.',
        name: 'Please enter your name.',
        birth: 'Enter a valid date of birth as YYYY-MM-DD.',
        phone: 'Enter a valid phone number.',
        idEmpty: 'Please enter an ID.',
        devUnsupported: 'Device registration is not available in this browser. Try the latest Chrome, Safari or Edge.',
        devCancel: 'Device registration was cancelled. Press the button to try again.',
        devFail: 'Could not register this device. Please try again.',
        devExpired: 'The registration timed out. Press the button again.',
        devNoLock: 'This device has no screen lock. Set up a fingerprint, face, PIN or password first.',
        idLangErr: 'Non-English characters found ({0}). Please use English.',
        idChars: 'Not allowed: {0}. Use a-z, 0-9 and _ only.',
        idShort: '{0} characters now. Your ID needs at least 4.',
        idLong: '{0} characters now. Your ID can be up to 20.',
        pwShort: '{0} characters now. Your password needs at least 8.',
        pwLong: '{0} characters now. Your password can be up to 72.',
        pwMissing: 'Missing: {0}. Add at least one.',
        parts: { upper: 'an uppercase letter', digit: 'a number', special: 'a special character' },
        idFormat: 'Use 4-20 characters: a-z, 0-9 and _ only.',
        emailFmt: 'The email format is not valid.',
        pw: 'Use 8+ characters with an uppercase letter, a number and a symbol.',
        pwSimilar: 'Your password is too similar to your ID.',
        pwMatch: 'The passwords do not match.',
        agree: 'Please agree to the terms.',
        idTaken: 'This ID is already taken.',
        emailTaken: 'This email is already registered. Try logging in or resetting your password.',
        rate: 'Too many requests. Please try again in a moment.',
      },
    },
  };

  const RE_ID = /^[a-z0-9_]{4,20}$/;
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const pwOk = (p) => p.length >= 8 && p.length <= 72 && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
  // 아이디와 비슷한지: 서로 포함하거나, 아이디의 상당 부분(60% 이상, 4자 이상)이 그대로 들어 있으면 비슷하다고 봄
  function similarToId(pw, id) {
    const a = pw.toLowerCase(), b = id.toLowerCase();
    if (!b) return false;
    if (a.includes(b) || b.includes(a) || a.includes([...b].reverse().join(''))) return true;
    let best = 0;
    let prev = new Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
      const cur = new Array(b.length + 1).fill(0);
      for (let j = 1; j <= b.length; j++) if (a[i - 1] === b[j - 1]) { cur[j] = prev[j - 1] + 1; if (cur[j] > best) best = cur[j]; }
      prev = cur;
    }
    return best >= 4 && best >= Math.ceil(b.length * 0.6);
  }

  let lang = 'ko';
  try { lang = localStorage.getItem('lang') === 'en' ? 'en' : 'ko'; } catch (e) {}
  let view = 'login';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const T = (k) => k.split('.').reduce((o, p) => (o ? o[p] : undefined), I18N[lang]);

  // 폼마다 에러 키를 기억해 두었다가 언어가 바뀌면 다시 번역
  const errOf = new WeakMap();
  const errArgs = new WeakMap();
  function errText(key, args) {
    let a = args || [];
    if (key === 'pwMissing') a = [a.map((c) => T('err.parts.' + c)).join(', ')];
    return T('err.' + key).replace(/\{(\d)\}/g, (_, i) => (a[i] === undefined ? '' : a[i]));
  }
  function setMsg(form, key, args) {
    const m = $('.msg', form);
    errOf.set(form, key);
    errArgs.set(form, args);
    m.classList.toggle('show', !!key);
    if (key) m.textContent = errText(key, args);
    else if (form.id === 'form-login' && m.textContent) {
      // 로그인 폼은 문구 자리가 부드럽게 접힌 뒤에 글자를 지움
      setTimeout(() => { if (!errOf.get(form)) m.textContent = ''; }, 450);
    } else m.textContent = '';
  }
  function fail(form, key, input, args) {
    setMsg(form, key, args);
    const m = $('.msg', form);                 // 글자가 떨리는 효과 (다시 눌러도 매번 재생)
    m.classList.remove('shake'); void m.offsetWidth; m.classList.add('shake');
    $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
    if (input) { input.setAttribute('aria-invalid', 'true'); if (input.focus) input.focus({ preventScroll: true }); }
  }
  function busy(form, on) {
    const b = $('.login-btn', form);
    b.disabled = on;
    b.textContent = on ? T('loading') : T(form.id === 'form-signup' ? (step === LAST ? 'devBtn' : 'next') : 'login');
  }

  // ===== 화면 문구 =====
  let idState = null;   // 'ok' | 'taken' | null
  function refreshIdHint() {
    const h = $('#su-id-hint');
    h.classList.remove('ok', 'bad');
    if (idState === 'ok') { h.textContent = T('h.idOk'); h.classList.add('ok'); }
    else if (idState === 'taken') { h.textContent = T('h.idTaken'); h.classList.add('bad'); }
    else h.textContent = T('h.id');
  }

  function apply() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => { el.textContent = T(el.dataset.i18n); });
    $$('[data-ph]').forEach((el) => { el.placeholder = T(el.dataset.ph); el.setAttribute('aria-label', T(el.dataset.ph)); });
    $$('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    $$('[data-eye]').forEach((b) => { b.textContent = T($('#' + b.dataset.eye).type === 'text' ? 'hide' : 'show'); });
    let [title, sub] = T('head.' + view);
    if (view === 'signup') sub = T('stepSub')[step - 1];
    $('#cardTitle').textContent = title;
    $('#cardSub').textContent = sub;
    $('#cardSub').hidden = !sub;
    $('#noticeBody').textContent = T('notice');
    $$('form').forEach((f) => { const k = errOf.get(f); if (k) $('.msg', f).textContent = errText(k, errArgs.get(f)); });
    refreshIdHint();
    $('#su-next').textContent = T(step === LAST ? 'devBtn' : 'next');
    $('#devTitle').textContent = T('dev.title.' + DEVICE.kind);
    $('#devDesc').textContent = T('dev.desc.' + DEVICE.platform);
  }

  // ===== 화면 전환 (부드러운 슬라이드 + 페이드) =====
  let step = 1;
  const LAST = 5;                         // 마지막 단계: 장치 등록
  // 지금 쓰는 기기: PC 인지 휴대폰인지에 따라 등록 안내가 달라짐
  const DEVICE = (() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const android = /Android/.test(ua);
    const platform = ios ? 'ios' : android ? 'android' : /Windows/.test(ua) ? 'windows' : /Macintosh|Mac OS X/.test(ua) ? 'mac' : 'other';
    return { kind: ios || android ? 'mobile' : 'pc', platform };
  })();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let swapping = false;

  // el 을 dir 방향으로 밀어내고, change() 로 내용을 바꾼 뒤, 반대편에서 들어오게 함
  async function swap(el, dir, change) {
    if (reduce || swapping) { change(); return; }
    swapping = true;
    const dx = 28 * dir;
    try {
      await el.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-dx}px)` }],
        { duration: 260, easing: 'ease-in', fill: 'forwards' }).finished;
      change();
      await el.animate([{ opacity: 0, transform: `translateX(${dx}px)` }, { opacity: 1, transform: 'translateX(0)' }],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }).finished;
    } finally {
      el.getAnimations().forEach((an) => an.cancel());
      swapping = false;
    }
  }

  function showView(name, opts) {
    view = name;
    $$('[data-view]').forEach((el) => { el.hidden = el.dataset.view !== name; });
    $$('[data-foot]').forEach((el) => { el.hidden = name === 'notice' || el.dataset.foot !== name; });
    $$('form').forEach((f) => { setMsg(f, null); $$('[aria-invalid]', f).forEach((i) => i.removeAttribute('aria-invalid')); });
    if (!opts.keepHash) history.replaceState(null, '', name === 'login' || name === 'notice' ? location.pathname : '#' + name);
    if (name === 'signup') { showStep(1, true); $('#su-id-lang').hidden = true; }
    apply();
    const first = $('[data-view="' + name + '"] input:not([type="checkbox"])');
    if (first && !opts.noFocus) first.focus({ preventScroll: true });
  }

  function setView(name, opts = {}) {
    if (opts.instant || name === view) return showView(name, opts);
    const dir = name === 'signup' ? 1 : -1;      // 로그인 → 회원가입은 왼쪽으로, 반대는 오른쪽으로
    return swap($('#pane'), dir, () => showView(name, opts));
  }

  // ===== 회원가입 단계 =====
  function showStep(n, quiet) {
    step = n;
    $$('.step').forEach((el) => { const off = Number(el.dataset.step) !== n; el.classList.toggle('is-off', off); el.inert = off; });
    $$('.progress i').forEach((el, i) => el.classList.toggle('on', i < n));
    $('#su-back').classList.toggle('is-off', n === 1);
    $('#su-back').tabIndex = n === 1 ? -1 : 0;
    $('#su-back').setAttribute('aria-hidden', n === 1 ? 'true' : 'false');
    if (!quiet) { setMsg($('#form-signup'), null); apply(); }
    const first = $('.step[data-step="' + n + '"] input');
    if (first && !quiet) first.focus({ preventScroll: true });
  }
  function goStep(n) {
    if (n === step) return;
    swap($('.steps'), n > step ? 1 : -1, () => showStep(n));
  }

  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-lang]');
    if (l) {
      lang = l.dataset.lang;
      try { localStorage.setItem('lang', lang); } catch (err) {}
      apply();
      return;
    }
    const eye = e.target.closest('[data-eye]');
    if (eye) {
      const pw = document.getElementById(eye.dataset.eye);
      pw.type = pw.type === 'password' ? 'text' : 'password';
      apply();
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      if (['login', 'signup'].includes(go.dataset.go)) setView(go.dataset.go);   // 비밀번호 찾기 화면은 아직 없음
    }
  });

  // ===== 로그인: 서버 함수가 아이디→이메일을 찾아 로그인시킴 =====
  $('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const id = f.identifier.value.trim();
    const pw = f.password.value;
    if (!id || !pw) return fail(f, 'required');
    setMsg(f, null);
    busy(f, true);
    try {
      const res = await fetch(`${CFG.url}/functions/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: CFG.key },
        body: JSON.stringify({ identifier: id, password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return fail(f, data.error === 'email_not_confirmed' ? 'unconfirmed' : 'login');
      try { localStorage.setItem(AUTO_KEY, $('#auto-login').checked ? '1' : '0'); } catch (err) {}   // 자동 로그인 선택 저장
      const { error } = await sb.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      if (error) return fail(f, 'generic');
      location.href = 'index.html';
    } catch (err) {
      fail(f, 'network');
    } finally {
      busy(f, false);
    }
  });

  // ===== 회원가입 =====
  const suId = $('#su-id');
  let idTimer = null;
  // 한글 등 영어가 아닌 글자를 치면 조건 아래에 빨간 안내를 띄움 (영어로 다시 치면 사라짐)
  const idLang = $('#su-id-lang');
  const NON_EN = /[^\x00-\x7F]/;
  suId.addEventListener('input', (e) => {
    const foreign = NON_EN.test(suId.value) || NON_EN.test(e.data || '');
    if (foreign) idLang.hidden = false;
    else if (e.data && /[A-Za-z0-9_]/.test(e.data)) idLang.hidden = true;
    if (e.isComposing) return;                 // 한글 조합 중에는 글자를 건드리지 않음 (조합이 끝나면 정리)
    suId.value = suId.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    suId.removeAttribute('aria-invalid');
    idState = null;
    refreshIdHint();
    clearTimeout(idTimer);
    if (RE_ID.test(suId.value)) idTimer = setTimeout(checkId, 450);
  });
  suId.addEventListener('compositionend', () => {
    idLang.hidden = false;
    suId.value = suId.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
  });
  async function checkId() {
    const value = suId.value;
    const { data, error } = await sb.rpc('username_available', { p_username: value });
    if (value !== suId.value || error) return;
    idState = data ? 'ok' : 'taken';
    refreshIdHint();
  }

  // 생년월일 / 전화번호 입력 형식 자동 맞춤
  $('#su-birth').addEventListener('input', (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 8);
    e.target.value = d.length > 6 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
  });
  $('#su-phone').addEventListener('input', (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 11);
    e.target.value = d.length > 7 ? `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}` : d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
  });
  const birthOk = (v) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const [y, m, d] = v.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d && y >= 1900 && dt <= new Date();
  };
  const phoneOk = (v) => /^01\d{8,9}$/.test(v.replace(/\D/g, ''));

  $('#su-back').addEventListener('click', () => goStep(step - 1));
  // 다시 입력하기 시작하면 빨간 밑줄 해제
  $$('form').forEach((fm) => fm.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid')));

  // 단계별 확인: 통과하면 true, 아니면 에러 표시하고 false
  async function checkStep(f) {
    const bad = (key, input, args) => { fail(f, key, input, args); return false; };
    const uniq = (s) => [...new Set(s)].slice(0, 5).map((c) => (c === ' ' ? '␣' : c)).join(' ');
    if (step === 1) {
      const u = f.username.value.trim().toLowerCase();
      if (!u) return bad('idEmpty', f.username);
      const foreign = u.match(/[^\x00-\x7F]/g);
      if (foreign) return bad('idLangErr', f.username, [uniq(foreign)]);
      const odd = u.match(/[^a-z0-9_]/g);
      if (odd) return bad('idChars', f.username, [uniq(odd)]);
      if (u.length < 4) return bad('idShort', f.username, [u.length]);
      if (u.length > 20) return bad('idLong', f.username, [u.length]);
      if (!RE_ID.test(u)) return bad('idFormat', f.username);
      const { data: free, error } = await sb.rpc('username_available', { p_username: u });
      if (error) return bad('network');
      if (!free) { idState = 'taken'; refreshIdHint(); return bad('idTaken', f.username); }
      idState = 'ok'; refreshIdHint();
    } else if (step === 2) {
      if (!RE_EMAIL.test(f.email.value.trim())) return bad('emailFmt', f.email);
    } else if (step === 3) {
      const pw = f.password.value;
      if (pw.length < 8) return bad('pwShort', f.password, [pw.length]);
      if (pw.length > 72) return bad('pwLong', f.password, [pw.length]);
      const miss = [];
      if (!/[A-Z]/.test(pw)) miss.push('upper');
      if (!/\d/.test(pw)) miss.push('digit');
      if (!/[^A-Za-z0-9]/.test(pw)) miss.push('special');
      if (miss.length) return bad('pwMissing', f.password, miss);
      if (!pwOk(pw)) return bad('pw', f.password);
      if (similarToId(f.password.value, f.username.value.trim())) return bad('pwSimilar', f.password);
      if (f.password.value !== f.password2.value) return bad('pwMatch', f.password2);
    } else if (step === 4) {
      if (!f.elements['name'].value.trim()) return bad('name', f.elements['name']);
      if (!birthOk(f.birth.value)) return bad('birth', f.birth);
      if (!phoneOk(f.phone.value)) return bad('phone', f.phone);
      if (!f.agree.checked) return bad('agree', f.agree);
    }
    return true;
  }

  $('#form-signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (swapping) return;
    setMsg(f, null);
    busy(f, true);
    try {
      if (!(await checkStep(f))) return;
      if (step < LAST) { goStep(step + 1); return; }

      // ----- 장치 등록: 기기의 지문·얼굴·PIN·비밀번호로 확인 (값은 기기 밖으로 나가지 않음) -----
      if (!window.PublicKeyCredential || !navigator.credentials || !window.isSecureContext) return fail(f, 'devUnsupported');
      const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (ch) => ch.charCodeAt(0));
      const api = (payload) => fetch(`${CFG.url}/functions/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: CFG.key },
        body: JSON.stringify(payload),
      });

      const username = f.username.value.trim().toLowerCase();
      const name = f.elements['name'].value.trim();
      const chRes = await api({ action: 'challenge' });
      if (!chRes.ok) return fail(f, 'network');
      const ch = await chRes.json();

      // 이 기기에 내장된 인증(지문·얼굴·PIN·비밀번호)이 있으면 그것으로, 없으면 브라우저가 제시하는 다른 수단(보안 키 등)으로
      let builtIn = false;
      try { builtIn = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch (err) {}
      let cred;
      try {
        cred = await navigator.credentials.create({
          publicKey: {
            challenge: unb64u(ch.challenge),
            rp: { name: 'OPUSY', id: location.hostname },
            user: { id: unb64u(ch.userHandle), name: username, displayName: name },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
            authenticatorSelection: { ...(builtIn ? { authenticatorAttachment: 'platform' } : {}), userVerification: 'required', residentKey: 'preferred' },
            attestation: 'none',
            timeout: 120000,
          },
        });
      } catch (err) {
        if (err && err.name === 'NotAllowedError') return fail(f, builtIn ? 'devCancel' : 'devNoLock');
        if (err && (err.name === 'NotSupportedError' || err.name === 'SecurityError')) return fail(f, 'devUnsupported');
        return fail(f, 'devFail');
      }
      const r = cred && cred.response;
      if (!r || !r.getPublicKey || !r.getAuthenticatorData || !r.getPublicKey()) return fail(f, 'devUnsupported');

      // ----- 가입: 서버가 입력값과 장치 등록 결과를 확인하고, 장치에 32자리 고유번호를 붙여 저장 -----
      const res = await api({
        action: 'register',
        username,
        email: f.email.value.trim(),
        password: f.password.value,
        name,
        birth_date: f.birth.value,
        phone: f.phone.value.replace(/\D/g, ''),
        device_kind: DEVICE.kind,
        platform: DEVICE.platform,
        token: ch.token,
        device: {
          id: cred.id,
          clientDataJSON: b64u(r.clientDataJSON),
          authenticatorData: b64u(r.getAuthenticatorData()),
          publicKey: b64u(r.getPublicKey()),
          alg: r.getPublicKeyAlgorithm(),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e2 = data.error;
        if (e2 === 'email_taken') { goStep(2); return fail(f, 'emailTaken', f.email); }
        if (e2 === 'email_format') { goStep(2); return fail(f, 'emailFmt', f.email); }
        if (e2 === 'id_taken' || e2 === 'id_format') { goStep(1); return fail(f, e2 === 'id_taken' ? 'idTaken' : 'idFormat', f.username); }
        if (e2 === 'password') { goStep(3); return fail(f, 'pw', f.password); }
        if (e2 === 'name' || e2 === 'birth' || e2 === 'phone') { goStep(4); return fail(f, e2); }
        if (e2 === 'rate') return fail(f, 'rate');
        if (e2 === 'device_expired') return fail(f, 'devExpired');
        if (e2 === 'device_unverified') return fail(f, 'devNoLock');
        if (e2 === 'device' || e2 === 'device_save') return fail(f, 'devFail');
        return fail(f, 'generic');
      }
      if (data.status === 'session') {            // 이메일 인증을 끈 경우 바로 로그인됨
        const { error: sErr } = await sb.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
        if (!sErr) { location.href = 'index.html'; return; }
      }
      f.reset();
      idState = null;
      setView('notice', { noFocus: true });
    } catch (err) {
      fail(f, 'network');
    } finally {
      busy(f, false);
    }
  });

  // ===== 카드 뒤에서 내다보는 캐릭터: 손과 눈이 커서를 따라감 =====
  (() => {
    const svg = $('.peek-svg');
    // 비밀번호 칸(과 그 보기/가리기 버튼)에 있을 때는 선글라스를 씀
    if (svg) {
      // 선글라스: 비밀번호 칸에 입력 중이거나, 지금 화면의 비밀번호가 '보기' 상태일 때 씀 ('가리기'로 돌리면 벗음)
      const PW = ['login-pw', 'su-pw', 'su-pw2'];
      const update = () => {
        const typing = !!document.activeElement && PW.includes(document.activeElement.id);
        const shown = PW.some((id) => { const el = document.getElementById(id); return el && el.type === 'text' && el.offsetParent !== null && !el.closest('[inert]'); });
        svg.classList.toggle('shades-on', typing || shown);
      };
      ['focusin', 'focusout', 'click'].forEach((ev) => document.addEventListener(ev, () => setTimeout(update, 0)));
    }
    if (!svg || !window.matchMedia('(pointer: fine)').matches) return;
    const D = svg.dataset;
    const sx = +D.sx, sy = +D.sy, aw = +D.aw, lw = +D.lw, nx = +D.nx, ny = +D.ny;
    const armOut = $('#armOut'), armIn = $('#armIn'), hand = $('#peekHand'), headG = $('#peekHead');
    const pupils = $$('.pupil');
    const REST = { phi: 42, len: 100, tx: 0, ty: 0, tilt: -6 };      // 가만히 있을 때: 아래쪽으로 편하게
    const cur = { ...REST }, goal = { ...REST };
    let raf = 0;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rad = Math.PI / 180;

    function draw() {
      const a = cur.phi * rad;                                     // 왼쪽(-x)을 0도, 아래쪽을 +로 잰 각도
      const hx = sx - Math.cos(a) * cur.len, hy = sy + Math.sin(a) * cur.len;
      const cx = (sx + hx) / 2, cy = (sy + hy) / 2 + 12;           // 팔꿈치가 살짝 처지게
      const d = `M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`;
      armOut.setAttribute('d', d); armOut.setAttribute('stroke-width', aw + 2 * lw);
      armIn.setAttribute('d', d);  armIn.setAttribute('stroke-width', aw);
      hand.setAttribute('transform', `translate(${hx} ${hy}) rotate(${(cur.phi - 90) * 0.5})`);
      headG.setAttribute('transform', `rotate(${cur.tilt} ${nx} ${ny})`);
      pupils.forEach((p) => p.setAttribute('transform', `translate(${cur.tx} ${cur.ty})`));
    }
    function loop() {
      let moving = false;
      for (const k of Object.keys(goal)) {
        const diff = goal[k] - cur[k];
        if (Math.abs(diff) > 0.05) { cur[k] += diff * 0.16; moving = true; } else cur[k] = goal[k];
      }
      draw();
      raf = moving ? requestAnimationFrame(loop) : 0;
    }
    const go = () => { if (!raf) raf = requestAnimationFrame(loop); };

    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = svg.getBoundingClientRect();
      const k = r.width / 420;                                    // 화면 px -> 그림 좌표
      const px = (e.clientX - r.left) / k, py = (e.clientY - r.top) / k;
      const dx = px - sx, dy = py - sy;
      goal.phi = clamp(Math.atan2(dy, -dx) / rad, -30, 48);       // 위로는 얼굴을 가리지 않는 높이까지만
      goal.len = clamp(Math.hypot(dx, dy) * 0.45, 80, 170);
      const hx = px - nx, hy = py - ny;
      const hd = Math.hypot(hx, hy) || 1;
      goal.tx = (hx / hd) * 5.5; goal.ty = (hy / hd) * 4.5;
      goal.tilt = -6 + clamp(hx / 260, -1, 1) * 6;
      go();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { Object.assign(goal, REST); go(); });
    draw();
  })();

  // 이전으로 돌아가기: 이 사이트에서 넘어왔으면 그 페이지로, 아니면 메인으로
  $('#goBack').addEventListener('click', (e) => {
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
    if (same && history.length > 1) { e.preventDefault(); history.back(); }
  });

  // 지난번에 고른 자동 로그인 설정을 스위치에 반영하고, 바꾸면 바로 기억
  $('#auto-login').checked = autoOn();
  $('#auto-login').addEventListener('change', (e) => { try { localStorage.setItem(AUTO_KEY, e.target.checked ? '1' : '0'); } catch (err) {} });

  // ===== 시작 =====
  // 인증 메일 링크로 들어오면 로그인 처리가 끝나는 대로 메인으로
  sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' && /access_token|type=signup/.test(location.hash)) location.href = 'index.html';
  });
  sb.auth.getSession().then(({ data }) => { if (data.session && !/access_token/.test(location.hash)) location.replace('index.html'); });

  setView(location.hash === '#signup' ? 'signup' : 'login', { keepHash: true, instant: true });
})();
