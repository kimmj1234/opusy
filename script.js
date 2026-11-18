(() => {
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;
  const MOVE_MS = 1400;                 // style.css 의 --move-duration 과 맞출 것
  const COOLDOWN_MS = MOVE_MS + 100;

  const track = document.getElementById('pages');
  const pages = [...document.querySelectorAll('.page')];
  const menubar = document.getElementById('menubar');
  let current = 0;
  let locked = false;

  // ===== 화면 크기 / 테마 =====
  // 1920x1080 캔버스를 현재 화면에 맞게 비율 유지 스케일
  function fit() {
    const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
    const root = document.documentElement.style;
    root.setProperty('--scale', s);
    root.setProperty('--stage-h', window.innerHeight / s);   // 16:9 보다 세로로 긴 화면이면 1080 보다 커짐
  }

  // 현재 영역의 data-theme 에 맞춰 메뉴바 색 전환 (light 영역 → 어두운 글자, dark 영역 → 흰 글자)
  function applyTheme() {
    menubar.dataset.theme = pages[current].dataset.theme || 'light';
  }

  // ===== 영역 이동 =====
  function goTo(index) {
    if (index < 0 || index >= pages.length || index === current) return;
    current = index;
    locked = true;
    applyTheme();
    pages.forEach((p, i) => {
      if (i === current) setTimeout(() => { if (current === i) p.classList.add('is-active'); }, 700);
      else setTimeout(() => {
        if (current === i) return;
        // 화면 밖으로 완전히 나간 뒤, 애니메이션 없이 즉시 초기 상태로 되돌림 (다시 들어올 때 보이는 되감기 방지)
        p.classList.add('no-anim');
        p.classList.remove('is-active');
        void p.offsetWidth;
        p.classList.remove('no-anim');
      }, MOVE_MS);
    });
    track.style.transform = `translateY(${-current * 100}%)`;
    setTimeout(() => (locked = false), COOLDOWN_MS);
  }

  // 마우스 휠 / 트랙패드
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (locked || Math.abs(e.deltaY) < 8) return;
    goTo(current + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  // 키보드
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); if (!locked) goTo(current + 1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); if (!locked) goTo(current - 1); }
    if (e.key === 'Home' && !locked) goTo(0);
    if (e.key === 'End' && !locked) goTo(pages.length - 1);
  });

  // 터치
  let touchY = null;
  window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (touchY === null || locked) return;
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) goTo(current + (dy > 0 ? 1 : -1));
    touchY = null;
  }, { passive: true });

  // 로고 클릭 → 홈(영역 1)으로 이동
  document.querySelector('#menubar .logo').addEventListener('click', (e) => {
    e.preventDefault();
    if (!locked) goTo(0);
  });

  // 아래로 스크롤 안내 클릭 → 다음 영역
  document.getElementById('scrollHint').addEventListener('click', () => { if (!locked) goTo(current + 1); });

  // ===== 영역 1 슬라이드 카드: 자동 재생 (영역 1 이 보일 때만), 막대 클릭으로 이동 =====
  (() => {
    const slider = document.getElementById('slider');
    const slides = slider.querySelector('.slides');
    const btns = [...slider.querySelectorAll('.pager button')];
    const INTERVAL = 4500;
    let idx = 0;
    let timer = null;

    function show(i) {
      idx = (i + btns.length) % btns.length;
      slides.style.transform = `translateX(${-idx * 100}%)`;
      btns.forEach((b, n) => b.classList.toggle('active', n === idx));
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => {
        if (pages[0].classList.contains('is-active')) show(idx + 1);
      }, INTERVAL);
    }
    btns.forEach((b, n) => b.addEventListener('click', () => { show(n); restart(); }));
    show(0);
    restart();
  })();

  // ===== 로그인 상태: 로그인되어 있으면 login 대신 로그아웃 버튼을 보여줌 =====
  (() => {
    const cfg = window.OPUSY_SUPABASE;
    const loginLink = document.querySelector('#menubar .login');
    const logoutBtn = document.getElementById('logout');
    const userBox = document.getElementById('user');
    const nameBtn = document.getElementById('userName');
    const menu = document.getElementById('userMenu');
    if (!cfg || !loginLink || !logoutBtn || !userBox || !nameBtn || !menu) return;
    const read = () => {
      try {
        // 자동 로그인을 켰으면 localStorage 에, 껐으면 sessionStorage(창을 닫으면 사라짐)에 들어 있음
        const s = JSON.parse(localStorage.getItem(cfg.storageKey) || sessionStorage.getItem(cfg.storageKey) || 'null');
        return s && s.access_token ? s : null;
      } catch (e) { return null; }
    };
    // 보여 줄 이름: 아이디 → 없으면 이메일 앞부분 (실명은 메뉴바에 드러내지 않음)
    const nameOf = (s) => {
      const u = (s && s.user) || {};
      const m = u.user_metadata || {};
      return String(m.username || (u.email || '').split('@')[0] || '').trim();
    };
    const isOpen = () => menu.classList.contains('open');
    const openMenu = (open) => { menu.classList.toggle('open', open); nameBtn.setAttribute('aria-expanded', String(open)); };
    const render = () => {
      const s = read();
      loginLink.hidden = !!s;
      userBox.hidden = !s;
      const name = nameOf(s);
      nameBtn.textContent = name;       // 너무 길면 CSS 가 상자 폭에 맞춰 ... 으로 줄임
      nameBtn.title = name;             // 줄어든 이름은 마우스를 올리면 전체가 보임
      openMenu(false);
    };
    nameBtn.addEventListener('click', (e) => { e.stopPropagation(); openMenu(!isOpen()); });
    document.addEventListener('click', (e) => { if (isOpen() && !userBox.contains(e.target)) openMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openMenu(false); });
    // 내 프로필: 프로필 화면으로 이동. 설정: 아직 연결된 화면이 없어서 누르면 목록만 닫힘
    const profileBtn = document.getElementById('menuProfile');
    if (profileBtn) profileBtn.addEventListener('click', () => { location.href = 'profile.html'; });
    const settingsBtn = document.getElementById('menuSettings');
    if (settingsBtn) settingsBtn.addEventListener('click', () => openMenu(false));
    logoutBtn.addEventListener('click', async () => {
      const s = read();
      try {
        // scope=local: 이 브라우저의 로그인만 끝냄 (빼면 다른 기기·브라우저의 로그인까지 전부 끊김)
        if (s) await fetch(`${cfg.url}/auth/v1/logout?scope=local`, { method: 'POST', headers: { apikey: cfg.key, Authorization: `Bearer ${s.access_token}` } });
      } catch (e) {}
      try { localStorage.removeItem(cfg.storageKey); sessionStorage.removeItem(cfg.storageKey); } catch (e) {}
      render();
    });
    render();
  })();

  // ===== 언어 전환 (KR / ENG) =====
  const I18N = {
    ko: {
      hero: [['함께하는'], ['새로운', '공간'], ['OPUSY']],
      heroLabel: '함께하는 새로운 공간 OPUSY',
      label: 'FOR EVERYONE',
      s1t: '일하다',   s1d: '나의 분야에서 깊이 있게',
      s2t: '배우다',   s2d: '새로운 것을 함께 익히며',
      s3t: '연결되다', s3d: '사람과 사람이 이어지는',
      profile: '내 프로필', settings: '설정', logout: '로그아웃',
      a2: '무엇을 시작해볼까요?',
      c2a: '일하고, 배우고, 연결되는 콘텐츠를 한곳에서 만나보세요.',
      c2b: '지금 필요한 공간으로 바로 이동할 수 있어요.',
      n1: '기획하기', n2: '플래너', n3: '프로젝트', n4: '멘토/멘티', n5: '공유소', n6: '커뮤니티',
      scroll: '아래로 스크롤',
      desc: '자신의 분야에서 깊이를 쌓아온 전문가를 위해 만들었습니다. 일하고, 배우고, 연결되는 모든 순간이 한 공간에서 이어집니다. 전문가만을 위한 곳은 아닙니다. 새로 시작하는 사람도, 배우고 싶은 사람도 누구나 함께할 수 있습니다.',
    },
    en: {
      hero: [['Together,'], ['a', 'new', 'space'], ['OPUSY']],
      heroLabel: 'Together, a new space OPUSY',
      label: 'FOR EVERYONE',
      s1t: 'Work',    s1d: 'Go deep in your own field',
      s2t: 'Learn',   s2d: 'Pick up something new, together',
      s3t: 'Connect', s3d: 'People linking with people',
      profile: 'My profile', settings: 'Settings', logout: 'Logout',
      a2: 'What will you start?',
      c2a: 'Find everything you need to work, learn and connect,',
      c2b: 'and jump straight into the space that fits you.',
      n1: 'Planning', n2: 'Planner', n3: 'Projects', n4: 'Mentoring', n5: 'Share space', n6: 'Community',
      scroll: 'Scroll down',
      desc: 'Built for people who have gone deep in their field. Working, learning and connecting all happen in one space. And it is not only for experts: beginners, curious minds and anyone ready to start are welcome.',
    },
  };

  const heroEl = document.getElementById('hero');
  const a2TitleEl = document.getElementById('a2title');
  const langBtns = [...document.querySelectorAll('#menubar .lang button')];

  // 단어마다 마스크(.w > .wi)를 씌운 HTML. 시작 번호(start)부터 --i 를 매겨 등장 순서를 만든다.
  const wordSpan = (word, i) => `<span class="w"><span class="wi" style="--i:${i}">${word}</span></span>`;

  function setLang(lang, replay) {
    const t = I18N[lang];
    if (!t) return;

    // 영역 1 메인 문구
    let n = 0;
    heroEl.setAttribute('aria-label', t.heroLabel);
    heroEl.innerHTML = t.hero
      .map((words) => '<span class="line">' + words.map((w) => wordSpan(w, n++)).join(' ') + '</span>')
      .join('');
    // 오른쪽 문구/카드/설명은 메인 문구가 끝난 뒤 이어서 올라오도록
    ['.side-label .rise-in', '.side-card > .rise-in', '.side-desc .rise-in'].forEach((sel, k) => {
      document.querySelector(sel).style.setProperty('--i', n + k);
    });

    // 영역 2 큰 제목 + 내용 두 줄
    const words2 = t.a2.split(' ');
    a2TitleEl.setAttribute('aria-label', t.a2);
    a2TitleEl.innerHTML = words2.map(wordSpan).join(' ');
    document.querySelectorAll('.a2-desc .rise-in').forEach((el, k) => el.style.setProperty('--i', words2.length + k));

    // 나머지 문구
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    document.documentElement.lang = lang;
    langBtns.forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    try { localStorage.setItem('lang', lang); } catch (e) {}

    if (replay) {   // 왼쪽 메인 문구만 올라오는 효과 다시 재생
      heroEl.classList.add('pre');
      void heroEl.offsetWidth;
      heroEl.classList.remove('pre');
    }
  }

  // 현재 보이는 영역의 문구 블록 전환: tilt 3D 로 기울어지며 사라졌다가, 내용이 바뀐 뒤 반대쪽에서 기울어지며 나타남
  //  - 영역 1: 오른쪽 카드+문구 (세로 중앙 정렬용 translateY(-50%) 포함)
  //  - 영역 2: 상단 가운데 제목+내용, 아래 카드 묶음
  const sideEl = document.querySelector('.hero-side');
  const headEl = document.querySelector('.a2-head');
  const cardsEl = document.querySelector('.a2-cards');
  const TILT_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
  const tilt = (el, ry, rx) =>
    `${el === sideEl ? 'translateY(-50%) ' : ''}perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  let switching = false;

  async function switchLang(lang) {
    if (switching) return;
    switching = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = current === 1 ? [headEl, cardsEl] : current === 0 ? [sideEl] : [];
    if (reduce || !targets.length) { setLang(lang, true); switching = false; return; }

    const play = (frames, duration, extra = {}) =>
      targets.map((el) => el.animate(frames(el), { duration, easing: TILT_EASE, ...extra }));

    const outs = play((el) => [{ transform: tilt(el, 0, 0), opacity: 1 }, { transform: tilt(el, -70, 12), opacity: 0 }], 550, { fill: 'forwards' });
    await Promise.all(outs.map((a) => a.finished));
    setLang(lang, true);                       // 내용 교체 (이 순간 블록은 투명)
    const ins = play((el) => [{ transform: tilt(el, 70, -12), opacity: 0 }, { transform: tilt(el, 0, 0), opacity: 1 }], 750);
    outs.forEach((a) => a.cancel());
    await Promise.all(ins.map((a) => a.finished));
    switching = false;
  }

  langBtns.forEach((b) => b.addEventListener('click', () => {
    if (!b.classList.contains('active')) switchLang(b.dataset.lang);
  }));

  // ===== 시작 =====
  let saved = 'ko';
  try { saved = localStorage.getItem('lang') || 'ko'; } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'ko', false);

  window.addEventListener('resize', fit);
  fit();
  applyTheme();
  setTimeout(() => pages[current].classList.add('is-active'), 300);   // 첫 진입 애니메이션
})();
