// 내 프로필 페이지: 프로필 사진·계정 정보(왼쪽 위)와 등록된 기기(오른쪽 위). 로그인하지 않았으면 로그인 화면으로 보냄
(() => {
  const CFG = window.OPUSY_SUPABASE;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // 브라우저에 남아 있던 예전 화면(HTML)에 새 스크립트가 붙으면 필요한 칸이 없어 멈추게 됨.
  // 그럴 때는 화면을 한 번만 새로 받아 와서 다시 엶.
  const NEED = ['pfTop', 'pfPhoto', 'pfFile', 'pfCover', 'pfCoverFile', 'pfCoverImg', 'pfCoverEmpty', 'pfCoverRemove', 'pfTabs', 'pfSeg', 'pfDetailTitle', 'pfDetailBody', 'pfTipCover', 'pfTipPhoto', 'pfMsg', 'pfRemove', 'pfId', 'pfEmail', 'pfStatPosts', 'pfDev', 'pfDevList', 'pfDevCount', 'pfDevNote', 'pfDevPrev', 'pfDevAdd', 'pfDevNext', 'pfDevFoot', 'pfDevToast', 'pfInfo', 'pfExtra', 'pfXPosts', 'pfXHeat', 'pfEdit', 'pfEditForm', 'pfEditMsg', 'pfEditSave', 'pfEditCancel', 'pfEditTagCount', 'pfTools', 'pfToolsHint', 'pfGrid', 'pfPick', 'pfPickRemove', 'pfLayoutMsg'];
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
      tipLabel: '업로드 안내 보기',
      tabsLabel: '내 활동', loading: '불러오는 중…',
      dPostsT: '게시글 조회 지표', dFollowersT: '나를 팔로우한 사람', dFollowingT: '내가 팔로우한 사람', dLikesT: '좋아요 기록',
      segRecv: '받은 좋아요', segGave: '보낸 좋아요',
      mViews: '총 조회수', mWeek: (n) => `최근 ${n}일 조회수`, mAvg: '게시글당 평균',
      chartT: (n) => `최근 ${n}일 조회수`, listT: '게시글별 조회수',
      iName: '이름', iBirth: '생년월일', iPhone: '전화번호', iJoined: '가입일', devLastShort: (d) => `마지막 접속 ${d}`,
      viewsN: (n) => `조회 ${n}`, likesN: (n) => `좋아요 ${n}`,
      emptyPosts: '아직 올린 게시글이 없어요. 글을 올리면 조회수 지표가 여기에 쌓여요.',
      emptyFollowers: '아직 나를 팔로우한 사람이 없어요.', emptyFollowing: '아직 팔로우한 사람이 없어요.',
      emptyRecv: '아직 받은 좋아요가 없어요.', emptyGave: '아직 보낸 좋아요가 없어요.',
      since: (d) => `${d}부터`, followBack: '맞팔로우', unfollow: '팔로우 취소', followingTag: '팔로우 중', followsMeTag: '나를 팔로우',
      likeRecv: (u) => `${u} 님이 내 글을 좋아해요`, likeGave: (u) => `${u} 님의 글에 좋아요를 눌렀어요`,
      dFail: '목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.', actFail: '처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
      tipPhotoT: '프로필 사진', tipPhotoSize: '권장 크기: 640 × 640px (정사각형)',
      tipPhotoFit: '가운데를 기준으로 동그랗게 잘려서 보여요.',
      tipCoverT: '배경 사진', tipCoverSize: '권장 크기: 1600 × 230px (가로로 아주 긴 7 : 1)',
      tipCoverFit: '화면 크기에 따라 위아래가 조금 잘릴 수 있어서, 중요한 부분은 가운데에 두세요.',
      tipMax: '최대 20MB까지 올릴 수 있어요. 올리면 자동으로 줄여서 저장해요.',
      tipFormat: 'JPG, PNG, WEBP 같은 이미지 파일을 쓸 수 있어요.',
      devices: '등록된 기기', devCount: (n) => `${n}대`, devOn: (d) => `${d}에 등록`,
      devNone: '등록된 기기가 없어요.', devFail: '기기 목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.',
      devPrev: '이전 페이지', devAdd: '기기 추가', devNext: '다음 페이지', devPage: (a, b) => `${a} / ${b}`,
      devMore: '기기 설정', devEdit: '수정', devDel: '삭제', devLog: '접속기록', devSave: '저장', devCancel: '취소', devClose: '닫기',
      devNamePh: '기기 이름 (30자 이내)', devDelAsk: '이 기기를 삭제할까요?', devDelLast: '마지막 기기예요. 지우면 다음 로그인 때 메일 확인이 필요해요. 삭제할까요?',
      devLastAt: (d) => `마지막 접속 ${d}`, devNoLog: '아직 이 기기로 로그인한 기록이 없어요.', devPlace: (p) => `위치 ${p}`, devIp: (ip) => `IP ${ip}`, devNoPlace: '위치를 알 수 없어요',
      devSent: '가입한 이메일로 링크를 보냈어요. 추가할 기기에서 메일의 링크를 열어 등록해 주세요.', devSendFail: '메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
      devRate: '메일을 너무 자주 보냈어요. 잠시 후 다시 시도해 주세요.', devLimit: '기기는 10대까지 등록할 수 있어요. 쓰지 않는 기기를 먼저 삭제해 주세요.',
      devSaveFail: '저장하지 못했어요. 잠시 후 다시 시도해 주세요.', devDelFail: '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.',
      dateTime: (d) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      dragHint: '끌어다가 흰 상자에 놓아 배치해 주세요.',
      wProfile: '프로필', wActivity: '활동', toolsLabel: '기능 배치 (끌어다 흰 상자에 놓으세요. 키보드로는 Enter 로 자리를 고를 수 있어요)',
      pickT: (n) => `‘${n}’ 놓을 자리를 골라 주세요`, pickSub: '놓은 자리에 있던 기능은 메뉴바로 돌아가요.', pickRemove: '화면에서 빼기',
      pickWide: '가로', pickTall: '세로', pickFull: '전체', pickNow: (n) => `지금: ${n}`,
      slot: { tl: '왼쪽 위', tr: '오른쪽 위', bl: '왼쪽 아래', br: '오른쪽 아래', top: '위', bottom: '아래', left: '왼쪽', right: '오른쪽', full: '전체' },
      layoutFail: '배치를 저장하지 못했어요. 새로고침하면 이전 배치로 돌아가요.',
      xAbout: '소개', xField: '분야 · 경력', xAccount: '계정 정보', xRecent: '최근 게시글', xActivity: '활동 기록', xFollowers: '팔로워',
      xNoHeadline: '아직 한 줄 소개가 없어요.', xNoBio: '자기소개를 적으면 여기에 보여요.', xNoField: '분야와 경력을 아직 적지 않았어요.', xNoTags: '관심 태그가 없어요.',
      xCareer: (n) => `경력 ${n}년`, xDone: (n) => `프로필 완성도 ${n}%`, xNoPosts: '아직 올린 게시글이 없어요.', xNoFans: '아직 나를 팔로우한 사람이 없어요.',
      xFans: (n) => `${n}명이 팔로우하고 있어요`, xActSum: (n) => `최근 1년 ${n}회`, xActSumM: (m, n) => `최근 ${m}개월 ${n}회`, xActCell: (d, n) => `${d}: 활동 ${n}회`, xActLabel: (n) => `최근 1년 동안의 활동 기록, 모두 ${n}회`,
      xLoadFail: '불러오지 못했어요.', iEmail: '이메일',
      eEdit: '수정', eTitle: '프로필 수정', eHeadline: '한 줄 소개', eBio: '자기소개', eField: '분야', eCareer: '경력', eYears: '년', eTags: '관심 태그',
      eHeadlinePh: '예) 사람을 연결하는 프로덕트를 만드는 디자이너', eBioPh: '어떤 일을 해 왔고, 지금 무엇에 관심이 있는지 적어 보세요.', eFieldPh: '예) 프로덕트 디자인', eCareerPh: '0~60', eTagsPh: '쉼표로 나눠 적어요. 예) UX, 브랜딩, 멘토링 (최대 8개)',
      eCancel: '취소', eSave: '저장', eSaving: '저장하는 중…', eSaved: '프로필을 저장했어요.', eFail: '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      eTooLong: '글자 수가 너무 많아요. 오른쪽 위 숫자를 확인해 주세요.', eCareerBad: '경력은 0부터 60까지의 숫자로 적어 주세요.', eTagsMany: '관심 태그는 8개까지 적을 수 있어요.',
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
      tipLabel: 'Show upload tips',
      tabsLabel: 'My activity', loading: 'Loading…',
      dPostsT: 'Post view metrics', dFollowersT: 'People following me', dFollowingT: 'People I follow', dLikesT: 'Like history',
      segRecv: 'Received', segGave: 'Given',
      mViews: 'Total views', mWeek: (n) => `Views, last ${n} days`, mAvg: 'Average per post',
      chartT: (n) => `Views in the last ${n} days`, listT: 'Views by post',
      iName: 'Name', iBirth: 'Date of birth', iPhone: 'Phone', iJoined: 'Joined', devLastShort: (d) => `Last sign-in ${d}`,
      viewsN: (n) => `${n} views`, likesN: (n) => `${n} likes`,
      emptyPosts: 'No posts yet. View metrics will build up here once you post.',
      emptyFollowers: 'No one is following you yet.', emptyFollowing: 'You are not following anyone yet.',
      emptyRecv: 'No likes received yet.', emptyGave: 'No likes given yet.',
      since: (d) => `since ${d}`, followBack: 'Follow back', unfollow: 'Unfollow', followingTag: 'Following', followsMeTag: 'Follows you',
      likeRecv: (u) => `${u} liked your post`, likeGave: (u) => `You liked ${u}'s post`,
      dFail: 'Could not load this list. Please refresh in a moment.', actFail: 'Could not complete that. Please try again in a moment.',
      tipPhotoT: 'Profile photo', tipPhotoSize: 'Recommended size: 640 × 640px (square)',
      tipPhotoFit: 'It is cropped to a circle around the center.',
      tipCoverT: 'Cover photo', tipCoverSize: 'Recommended size: 1600 × 230px (a very wide 7 : 1)',
      tipCoverFit: 'The top and bottom may be trimmed depending on the screen, so keep the key part in the middle.',
      tipMax: 'Up to 20MB. It is resized automatically when saved.',
      tipFormat: 'Image files such as JPG, PNG and WEBP work.',
      devices: 'Registered devices', devCount: (n) => String(n), devOn: (d) => `Registered on ${d}`,
      devNone: 'No registered devices.', devFail: 'Could not load your devices. Please refresh in a moment.',
      devPrev: 'Previous', devAdd: 'Add device', devNext: 'Next', devPage: (a, b) => `${a} / ${b}`,
      devMore: 'Device settings', devEdit: 'Rename', devDel: 'Delete', devLog: 'Activity', devSave: 'Save', devCancel: 'Cancel', devClose: 'Close',
      devNamePh: 'Device name (up to 30)', devDelAsk: 'Delete this device?', devDelLast: 'This is your last device. You will need an email check at next login. Delete it?',
      devLastAt: (d) => `Last sign-in ${d}`, devNoLog: 'No sign-ins from this device yet.', devPlace: (p) => `Location ${p}`, devIp: (ip) => `IP ${ip}`, devNoPlace: 'Location unknown',
      devSent: 'We sent a link to your email. Open it on the device you want to add.', devSendFail: 'Could not send the email. Please try again in a moment.',
      devRate: 'Too many emails. Please try again in a moment.', devLimit: 'You can register up to 10 devices. Delete one you no longer use first.',
      devSaveFail: 'Could not save. Please try again in a moment.', devDelFail: 'Could not delete. Please try again in a moment.',
      dateTime: (d) => d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      dragHint: 'Drag it onto the white panel to place it.',
      wProfile: 'Profile', wActivity: 'Activity', toolsLabel: 'Arrange features (drag onto the panel; with a keyboard, press Enter to choose a place)',
      pickT: (n) => `Choose where to put “${n}”`, pickSub: 'Whatever was in that place goes back to the menu bar.', pickRemove: 'Remove from panel',
      pickWide: 'Wide', pickTall: 'Tall', pickFull: 'Full', pickNow: (n) => `Now: ${n}`,
      slot: { tl: 'Top left', tr: 'Top right', bl: 'Bottom left', br: 'Bottom right', top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right', full: 'Full' },
      layoutFail: 'Could not save the layout. Refreshing will restore the previous one.',
      xAbout: 'About', xField: 'Field · Experience', xAccount: 'Account', xRecent: 'Recent posts', xActivity: 'Activity', xFollowers: 'Followers',
      xNoHeadline: 'No headline yet.', xNoBio: 'Your introduction will appear here.', xNoField: 'No field or experience yet.', xNoTags: 'No interest tags yet.',
      xCareer: (n) => `${n} yrs experience`, xDone: (n) => `Profile ${n}% complete`, xNoPosts: 'No posts yet.', xNoFans: 'No followers yet.',
      xFans: (n) => `${n} followers`, xActSum: (n) => `${n} in the last year`, xActSumM: (m, n) => `${n} in the last ${m} months`, xActCell: (d, n) => `${d}: ${n} activities`, xActLabel: (n) => `Activity over the last year, ${n} in total`,
      xLoadFail: 'Could not load.', iEmail: 'Email',
      eEdit: 'Edit', eTitle: 'Edit profile', eHeadline: 'Headline', eBio: 'About me', eField: 'Field', eCareer: 'Experience', eYears: 'yrs', eTags: 'Interest tags',
      eHeadlinePh: 'e.g. Designer building products that connect people', eBioPh: 'What you have done and what interests you now.', eFieldPh: 'e.g. Product design', eCareerPh: '0–60', eTagsPh: 'Separate with commas, e.g. UX, Branding, Mentoring (up to 8)',
      eCancel: 'Cancel', eSave: 'Save', eSaving: 'Saving…', eSaved: 'Profile saved.', eFail: 'Could not save. Please try again in a moment.',
      eTooLong: 'Too many characters. Check the counters.', eCareerBad: 'Enter experience as a number from 0 to 60.', eTagsMany: 'You can add up to 8 interest tags.',
      devName: { mac: 'Mac', windows: 'Windows PC', ios: 'iPhone · iPad', android: 'Android device', pc: 'Computer', mobile: 'Phone' },
      date: (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
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
    $$('[data-i18n-ph]').forEach((el) => { const v = t[el.dataset.i18nPh]; if (typeof v === 'string') el.placeholder = v; });
    $$('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    $('#pfPhoto').setAttribute('aria-label', t.photoLabel);
    $('#pfCover').setAttribute('aria-label', t.coverLabel);
    $('#pfTipCover').setAttribute('aria-label', t.tipLabel);
    $('#pfTipPhoto').setAttribute('aria-label', t.tipLabel);
    $('#pfTools').setAttribute('aria-label', t.toolsLabel);
    if (pick) fillPick();
    showMsg(msgKey, msgInfo);
    showInfo();
    renderExtra();
    showDevices();
    $('#pfTabs').setAttribute('aria-label', t.tabsLabel);
    renderDetail();
  }
  // 등록된 기기 목록 (언어를 바꾸면 다시 그림). devices: null=아직 안 불러옴, false=실패, 배열=목록
  let devices = null;
  const ICON = {
    pc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>',
  };
  // 계정 정보(이름·생년월일·전화번호·가입일): 프로필 칸이 넓거나 길 때만 보임. 날짜는 언어에 맞춰 다시 표기
  let info = null;
  function showInfo() {
    const t = I18N[lang];
    const day = (v) => { const d = localDate(v); return d ? t.date(d) : ''; };
    const set = (id, v) => { $(id).textContent = v || '–'; $(id).title = v || ''; };
    set('#pfName', info && info.name);
    set('#pfBirth', info && day(info.birth));
    set('#pfPhone', info && info.phone);
    set('#pfJoined', info && day(info.joined));
  }

  // 한 쪽에 3대씩 보여 주고, 각 기기 오른쪽 끝의 ⋯ 버튼으로 수정·삭제·접속기록을 엶
  // 한 쪽에 보이는 기기 수는 칸 크기에 따라 늘어남: 한 칸 3대까지, 가로(두 줄로) 6대까지, 세로·전체는 들어가는 만큼
  const PER_BY = { q: 3, wide: 6, tall: 10, full: 20 };   // 가장 많을 때의 수. 실제로는 칸에 들어가는 만큼만
  const sizeOf = (w) => { const sec = $(`.pf-q[data-w="${w}"]`); return (sec && sec.dataset.size) || 'q'; };
  let devPage = 0;
  let devOpen = null;          // 설정이 열린 기기 { id, mode: 'menu' | 'edit' | 'del' | 'log' }
  let devBusy = false;
  let devNote = '';            // 버튼 자리에 잠깐 뜨는 안내 (I18N 키). devNoteBad=true 면 빨간 글씨
  let devNoteBad = false;
  let devNoteTimer = 0;
  let myEmail = '';
  const MORE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>';
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pill = (text, fn, cls) => { const b = el('button', 'pf-dev-pill' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', (e) => { e.stopPropagation(); fn(); }); return b; };
  // 안내가 생기면 버튼이 아래로 내려가 사라지고 그 자리에 글이 3초 동안 떠 있다가, 글이 사라진 뒤 버튼이 다시 올라옴
  const NOTE_MS = 3000;
  function setDevNote(key, bad) {
    if (!key) return;                                  // 빈 안내로는 떠 있는 글을 지우지 않음 (3초가 지나면 저절로 사라짐)
    devNote = key; devNoteBad = !!bad;
    const foot = $('#pfDevFoot');
    const toast = $('#pfDevToast');
    toast.textContent = I18N[lang][key];
    toast.classList.toggle('bad', devNoteBad);
    const back = document.activeElement && foot.contains(document.activeElement);
    if (back) { toast.setAttribute('tabindex', '-1'); toast.focus({ preventScroll: true }); }   // 사라지는 버튼에 머물던 키보드 위치를 글로 옮김
    foot.classList.add('is-note');
    clearTimeout(devNoteTimer);
    devNoteTimer = setTimeout(() => {
      foot.classList.remove('is-note');
      devNote = '';
      if (document.activeElement === toast) $('#pfDevAdd').focus({ preventScroll: true });
    }, NOTE_MS);
  }
  const devLabel = (d) => d.nickname || I18N[lang].devName[d.platform] || I18N[lang].devName[d.device_kind === 'mobile' ? 'mobile' : 'pc'];

  function showDevices(focusSel) {
    const t = I18N[lang];
    const list = $('#pfDevList');
    const note = $('#pfDevNote');
    list.textContent = '';
    const ok = Array.isArray(devices);
    $('#pfDevPrev').disabled = $('#pfDevNext').disabled = true;
    $('#pfDevAdd').disabled = !ok || devBusy;
    if (!ok) {
      $('#pfDevCount').textContent = '';
      note.classList.toggle('bad', devices === false);
      note.textContent = devices === false ? t.devFail : '';
      return;
    }
    const size = sizeOf('devices');
    // 한 쪽에 보이는 기기 수: 칸에 실제로 들어가는 줄 수를 재서 정함 (스크롤도, 아래 '이전으로 돌아가기'와 겹침도 없게)
    const cols = size === 'wide' || size === 'full' ? 2 : 1;
    let perCol = PER_BY[size] / cols;
    const devBox = $('#pfDev');
    if (devBox.clientHeight && !matchMedia('(max-width: 700px)').matches) {
      const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1;
      const itemH = Math.max(54, 78 * sc), gap = Math.max(6, 10 * sc);   // CSS 의 기기 상자 높이·간격과 같은 값
      const foot = $('#pfDevFoot');
      const avail = devBox.clientHeight - devBox.querySelector('.pf-q-title').offsetHeight - parseFloat(getComputedStyle(list).marginTop) - foot.offsetHeight - parseFloat(getComputedStyle(foot).marginTop) - parseFloat(getComputedStyle(devBox.querySelector('.pf-q-title')).marginTop) - 1;
      perCol = Math.max(1, Math.min(perCol, Math.floor((avail + gap) / (itemH + gap))));
    }
    const PER = perCol * cols;
    const pages = Math.max(1, Math.ceil(devices.length / PER));
    devPage = Math.min(devPage, pages - 1);
    $('#pfDevCount').textContent = t.devCount(devices.length) + (pages > 1 ? ` · ${t.devPage(devPage + 1, pages)}` : '');
    $('#pfDevPrev').disabled = devPage === 0;
    $('#pfDevNext').disabled = devPage >= pages - 1;
    note.classList.remove('bad');
    note.textContent = devices.length ? '' : t.devNone;
    if (devNote) $('#pfDevToast').textContent = t[devNote];     // 언어를 바꾸면 떠 있는 글도 바꿈

    devices.slice(devPage * PER, devPage * PER + PER).forEach((d) => {
      const kind = d.device_kind === 'mobile' ? 'mobile' : 'pc';
      const open = devOpen && devOpen.id === d.id ? devOpen.mode : '';
      const li = el('li', 'pf-dev-item' + (open ? ' is-open is-' + open : ''));
      li.dataset.id = d.id;
      li.style.setProperty('--i', list.children.length);
      li.insertAdjacentHTML('afterbegin', ICON[kind]);              // 고정된 아이콘 그림만 HTML 로 넣고, 글자는 textContent 로 넣음
      const box = el('div', 'pf-dev-text');
      if (open === 'edit') {
        const input = el('input', 'pf-dev-input');
        input.type = 'text'; input.maxLength = 30; input.value = d.nickname || devLabel(d);
        input.placeholder = t.devNamePh; input.setAttribute('aria-label', t.devNamePh);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); saveName(d, input.value); }
          if (e.key === 'Escape') { e.stopPropagation(); closeDev(); }
        });
        box.append(input);
      } else {
        const name = el('strong', '', devLabel(d)); name.title = devLabel(d);
        const dt = localDate(d.created_at);
        // 칸이 넓거나 길면 등록일 옆에 마지막 접속 시각도 함께 보여 줌
        const at = size !== 'q' && d.last_used_at ? new Date(d.last_used_at) : null;
        const sub = [dt ? t.devOn(t.date(dt)) : '', at && !isNaN(at) ? t.devLastShort(t.dateTime(at)) : ''].filter(Boolean).join(' · ');
        const subEl = el('span', '', sub); subEl.title = sub;
        box.append(name, subEl);
      }
      li.append(box);

      // ⋯ 를 누르면 왼쪽 빈 공간으로 펼쳐지는 설정 칸
      const acts = el('div', 'pf-dev-acts');
      if (open === 'menu') {
        acts.append(pill(t.devEdit, () => openDev(d.id, 'edit', '.pf-dev-input')), pill(t.devDel, () => openDev(d.id, 'del', '.pf-dev-pill.is-danger')), pill(t.devLog, () => openDev(d.id, 'log', '.pf-dev-pill')));
      } else if (open === 'edit') {
        acts.append(pill(t.devSave, () => saveName(d, $('.pf-dev-input').value), 'is-main'), pill(t.devCancel, closeDev));
      } else if (open === 'del') {
        acts.append(el('p', 'pf-dev-ask', devices.length === 1 ? t.devDelLast : t.devDelAsk), pill(t.devDel, () => removeDev(d), 'is-danger'), pill(t.devCancel, closeDev));
      } else if (open === 'log') {
        const info = el('div', 'pf-dev-log');
        const at = d.last_used_at ? new Date(d.last_used_at) : null;
        if (!at || isNaN(at)) info.append(el('p', '', t.devNoLog));
        else {
          const place = [d.last_city, d.last_region, d.last_country].filter((v, i, a) => v && a.indexOf(v) === i).join(', ');
          info.append(el('p', 'pf-dev-log-at', t.devLastAt(t.dateTime(at))), el('p', '', (place ? t.devPlace(place) : t.devNoPlace) + (d.last_ip ? ' · ' + t.devIp(d.last_ip) : '')));
        }
        acts.append(info, pill(t.devClose, closeDev));
      }
      li.append(acts);

      const more = el('button', 'pf-dev-more');
      more.type = 'button';
      more.innerHTML = MORE;
      more.setAttribute('aria-label', `${t.devMore}: ${devLabel(d)}`);
      more.setAttribute('aria-expanded', String(!!open));
      more.disabled = devBusy;
      more.addEventListener('click', (e) => { e.stopPropagation(); open ? closeDev(true) : openDev(d.id, 'menu', '.pf-dev-pill'); });
      li.append(more);
      list.append(li);
    });
    // 여러 쪽일 때는 목록 높이를 한 쪽 분량으로 고정: 마지막 쪽에 기기가 적어도 아래 버튼 위치가 바뀌지 않음
    list.style.minHeight = '';
    if (pages > 1 && list.firstElementChild) {
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      list.style.minHeight = `${perCol * list.firstElementChild.offsetHeight + (perCol - 1) * gap}px`;
    }
    if (focusSel) {
      const item = list.querySelector(`.pf-dev-item.is-open`);
      const target = item && item.querySelector(focusSel);
      if (target) { target.focus(); if (target.select) target.select(); }
    }
  }
  function openDev(id, mode, focusSel) { devOpen = { id, mode }; setDevNote(''); showDevices(focusSel); }
  function closeDev(focusMore) {
    const id = devOpen && devOpen.id;
    devOpen = null; showDevices();
    if (focusMore && id) { const b = $(`.pf-dev-item[data-id="${id}"] .pf-dev-more`); if (b) b.focus(); }
  }
  async function reloadDevices() {
    try {
      const { data, error } = await sb.rpc('my_devices');
      devices = !error && Array.isArray(data) ? data : false;
    } catch (e) { devices = false; }
  }
  async function saveName(d, value) {
    if (devBusy) return;
    const name = String(value || '').trim().slice(0, 30);
    devBusy = true;
    let ok = false;
    try { const { error } = await sb.rpc('rename_device', { p_id: d.id, p_name: name }); ok = !error; } catch (e) {}
    devBusy = false;
    if (ok) { d.nickname = name || null; devOpen = null; setDevNote(''); } else setDevNote('devSaveFail', true);
    showDevices();
  }
  async function removeDev(d) {
    if (devBusy) return;
    devBusy = true; showDevices();
    let ok = false;
    try { const { error } = await sb.rpc('delete_device', { p_id: d.id }); ok = !error; } catch (e) {}
    devBusy = false;
    if (ok) { devOpen = null; setDevNote(''); await reloadDevices(); } else setDevNote('devDelFail', true);
    showDevices();
  }
  $('#pfDevPrev').addEventListener('click', () => { devPage = Math.max(0, devPage - 1); devOpen = null; showDevices(); slide($('#pfDevList'), 'prev'); });
  $('#pfDevNext').addEventListener('click', () => { devPage += 1; devOpen = null; showDevices(); slide($('#pfDevList'), 'next'); });
  // 기기 추가: 가입한 이메일로 등록 링크를 보냄. 추가할 기기에서 링크를 열면 그 기기를 등록하는 화면이 열림
  $('#pfDevAdd').addEventListener('click', async () => {
    if (devBusy || !Array.isArray(devices)) return;
    if (devices.length >= 10) { setDevNote('devLimit', true); showDevices(); return; }
    if (!myEmail) { setDevNote('devSendFail', true); showDevices(); return; }
    devBusy = true; devOpen = null; showDevices();
    let key = 'devSent', bad = false;
    try {
      const { error } = await sb.auth.signInWithOtp({ email: myEmail, options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/login.html?add=1` } });
      if (error) { key = error.status === 429 ? 'devRate' : 'devSendFail'; bad = true; }
    } catch (e) { key = 'devSendFail'; bad = true; }
    devBusy = false;
    setDevNote(key, bad);
    showDevices();
  });
  // 설정 칸 바깥을 누르거나 Esc 를 누르면 닫힘
  document.addEventListener('click', (e) => { if (devOpen && !e.target.closest('.pf-dev-item.is-open')) closeDev(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && devOpen) closeDev(true); });
  // ===== 기능 배치: 메뉴바의 기능을 끌어다 흰 상자에 놓음 =====
  // 흰 상자는 네 칸(0 왼쪽 위, 1 오른쪽 위, 2 왼쪽 아래, 3 오른쪽 아래). 자리마다 차지하는 칸이 정해져 있음
  const SLOTS = { tl: [0], tr: [1], bl: [2], br: [3], top: [0, 1], bottom: [2, 3], left: [0, 2], right: [1, 3], full: [0, 1, 2, 3] };
  const WIDGETS = ['profile', 'devices', 'activity'];
  const DEFAULT_LAYOUT = { profile: 'tl', devices: 'tr', activity: 'bl' };
  let layout = { ...DEFAULT_LAYOUT };
  let pick = null;             // 모양 고르기가 열려 있을 때 { w: 기능, drag: 끌고 있는 중인지 }
  const wName = (w) => I18N[lang][{ profile: 'wProfile', devices: 'devices', activity: 'wActivity' }[w]];
  const overlap = (a, b) => SLOTS[a].some((c) => SLOTS[b].includes(c));
  // 저장돼 있던 값은 그대로 믿지 않고, 아는 기능·아는 자리·서로 겹치지 않는 것만 받아들임
  function cleanLayout(v) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return { ...DEFAULT_LAYOUT };
    const out = {};
    WIDGETS.forEach((w) => {
      const sl = v[w];
      if (typeof sl === 'string' && Object.prototype.hasOwnProperty.call(SLOTS, sl) && !Object.values(out).some((o) => overlap(o, sl))) out[w] = sl;
    });
    return out;
  }
  function applyLayout() {
    $$('.pf-q[data-w]').forEach((sec) => {
      const sl = layout[sec.dataset.w];
      if (sl) sec.dataset.slot = sl; else sec.removeAttribute('data-slot');
      sec.classList.toggle('has-back', !!sl && SLOTS[sl].includes(2));
      // 칸 크기: q(한 칸) · wide(가로 절반) · tall(세로 절반) · full(전체). 크기에 따라 보이는 정보가 늘어남
      const size = !sl ? '' : SLOTS[sl].length === 4 ? 'full' : SLOTS[sl].length === 1 ? 'q' : (sl === 'top' || sl === 'bottom') ? 'wide' : 'tall';
      if (size) sec.dataset.size = size; else sec.removeAttribute('data-size');
    });
    devOpen = null;
    showDevices();                                   // 한 쪽에 보이는 기기 수가 달라짐
    renderExtra();                                   // 프로필이 전체 화면이면 더 많은 정보를 그림
    if (detail.days !== daysFor() && detail.view === 'posts' && detail.started) loadDetail();   // 그래프 기간이 달라짐
    else if (detail.started) fitRows();              // 칸 크기가 달라졌으니 들어가는 줄 수를 다시 셈
    // 십자 선: 한 기능이 양쪽 칸을 함께 차지하면 그 사이 토막은 숨김
    const spans = (a, b) => Object.values(layout).some((sl) => SLOTS[sl].includes(a) && SLOTS[sl].includes(b));
    $('.pf-line-vt').hidden = spans(0, 1);
    $('.pf-line-vb').hidden = spans(2, 3);
    $('.pf-line-hl').hidden = spans(0, 2);
    $('.pf-line-hr').hidden = spans(1, 3);
    $$('.pf-tool').forEach((b) => b.classList.toggle('is-on', !!layout[b.dataset.w]));
  }
  let layoutMsgTimer = 0;
  async function saveLayout() {
    if (!uid) return;
    let ok = false;
    try { const { error } = await sb.from('profiles').update({ layout }).eq('id', uid); ok = !error; } catch (e) {}
    if (ok) return;
    const m = $('#pfLayoutMsg');
    m.textContent = I18N[lang].layoutFail;
    m.classList.add('show');
    clearTimeout(layoutMsgTimer);
    layoutMsgTimer = setTimeout(() => m.classList.toggle('show', false), 3000);
  }
  function place(w, sl) {
    if (layout[w] === sl) return;
    WIDGETS.forEach((o) => { if (o !== w && layout[o] && overlap(layout[o], sl)) delete layout[o]; });   // 그 자리에 있던 기능은 메뉴바로
    layout[w] = sl;
    applyLayout(); saveLayout();
  }
  function unplace(w) {
    if (!layout[w]) return;
    delete layout[w];
    applyLayout(); saveLayout();
  }
  // 모양 고르기 화면의 글자: 자리 이름과, 지금 그 자리에 있는 다른 기능
  function fillPick() {
    const t = I18N[lang];
    $('#pfPickTitle').textContent = t.pickT(wName(pick.w));
    $('#pfPickRemove').hidden = !layout[pick.w];
    $$('.pf-zone').forEach((z) => {
      const sl = z.dataset.slot;
      const there = WIDGETS.filter((o) => o !== pick.w && layout[o] && overlap(layout[o], sl)).map(wName);
      z.textContent = '';
      z.append(el('span', '', t.slot[sl]), el('small', '', there.length ? t.pickNow(there.join(' · ')) : ''));
      z.setAttribute('aria-label', t.slot[sl] + (there.length ? ` (${t.pickNow(there.join(', '))})` : ''));
      z.classList.toggle('is-mine', layout[pick.w] === sl);
      z.classList.toggle('is-over', false);
    });
    $('#pfPickRemove').classList.toggle('is-over', false);
  }
  let pickHide = 0;
  function openPick(w, drag) {
    pick = { w, drag };
    fillPick();
    const box = $('#pfPick');
    clearTimeout(pickHide);
    box.hidden = false;
    $('#pfGrid').inert = true;                       // 흐려진 뒤쪽 내용은 누르거나 키보드로 갈 수 없게
    $('.pf-panel').classList.add('is-picking');
    void box.offsetWidth;                            // 나타나는 움직임이 처음 상태에서 시작되게
    box.classList.add('open');
    if (!drag) { const z = $('.pf-zone.is-mine') || $('.pf-zone'); z.focus({ preventScroll: true }); }
  }
  function closePick(focusBack) {
    if (!pick) return;
    const w = pick.w;
    pick = null;
    const box = $('#pfPick');
    box.classList.toggle('open', false);
    $('#pfGrid').inert = false;
    $('.pf-panel').classList.toggle('is-picking', false);
    clearTimeout(pickHide);
    pickHide = setTimeout(() => { box.hidden = true; }, 320);
    if (focusBack) { const b = $(`.pf-tool[data-w="${w}"]`); if (b) b.focus({ preventScroll: true }); }
  }
  const choose = (target) => {                       // 놓거나 누른 곳이 자리면 배치, '빼기'면 화면에서 뺌
    if (!pick || !target) return false;
    const w = pick.w;
    if (target.id === 'pfPickRemove') { unplace(w); return true; }
    if (target.classList.contains('pf-zone')) { place(w, target.dataset.slot); return true; }
    return false;
  };
  $('#pfPick').addEventListener('click', (e) => {
    if (!pick || pick.drag) return;
    const target = e.target.closest('.pf-zone, .pf-pick-remove');
    if (target) { choose(target); closePick(true); }
    else if (!e.target.closest('.pf-pick-in')) closePick(true);          // 모양 바깥의 흐린 곳을 누르면 닫힘
  });
  document.addEventListener('keydown', (e) => {
    if (!pick || pick.drag) return;
    if (e.key === 'Escape') { closePick(true); return; }
    if (e.key === 'Tab') {                           // 키보드 초점이 모양 고르기 안에서만 돌게
      const items = [...$$('.pf-zone'), $('#pfPickRemove')].filter((b) => !b.hidden);
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  });
  let hintTimer = 0;
  function showDragHint() {
    const h = $('#pfToolsHint');
    h.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => h.classList.toggle('show', false), 3000);
  }
  // 끌기: 6px 넘게 움직이면 끌기 시작 → 모양이 나타나고, 원하는 모양 위에서 놓으면 그 자리에 펼쳐짐. 움직이지 않고 떼면(누르기) 안내만 뜸.
  // 마우스로 끌 수 없는 키보드 사용자는 Enter·Space 로 모양 고르기를 열 수 있음
  $$('.pf-tool').forEach((btn) => {
    let start = null, ghost = null, over = null;
    const hit = (x, y) => { const e = document.elementFromPoint(x, y); return e ? e.closest('.pf-zone, .pf-pick-remove') : null; };
    const setOver = (z) => { if (over === z) return; if (over) over.classList.toggle('is-over', false); over = z; if (over) over.classList.add('is-over'); };
    let end = () => {
      if (start && start.raf) cancelAnimationFrame(start.raf);
      if (ghost) ghost.parentNode.removeChild(ghost);
      ghost = null; start = null; setOver(null);
      btn.classList.toggle('is-drag', false);
      document.body.classList.toggle('pf-dragging', false);
    };
    // 끌기의 끝은 버튼이 아니라 창 전체에서 받음: 마우스를 어디서 떼든, 떼는 신호를 놓치든 끌기가 걸린 채 남지 않게 함
    const finish = (x, y, drop) => {
      if (!start) return;
      const dragged = start.drag;
      const target = dragged && drop ? hit(x, y) : null;
      end();
      if (dragged) { try { choose(target); } finally { closePick(); } }   // 배치 중 문제가 생겨도 모양 고르기는 반드시 닫힘
      else if (drop) showDragHint();                 // 끌지 않고 누르기만 하면: 끌어다 놓으라는 안내를 잠깐 보여 줌
    };
    const onMove = (e) => {
      if (!start || e.pointerId !== start.id) return;
      // 버튼을 뗐다는 신호를 놓친 경우(창 밖에서 뗌 등): 버튼이 눌려 있지 않으면 그 자리에서 놓은 것으로 처리
      if (e.pointerType === 'mouse' && e.buttons === 0) { finish(e.clientX, e.clientY, true); return; }
      if (!start.drag) {
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
        start.drag = true;
        ghost = el('div', 'pf-ghost', wName(btn.dataset.w));
        document.body.append(ghost);
        start.hw = ghost.offsetWidth / 2; start.hh = ghost.offsetHeight / 2;   // 크기는 한 번만 잼
        btn.classList.add('is-drag');
        document.body.classList.add('pf-dragging');
        $('#pfToolsHint').classList.toggle('show', false);
        openPick(btn.dataset.w, true);
      }
      // 마우스는 화면보다 훨씬 자주 움직이므로, 조각 옮기기와 자리 찾기는 화면 한 장에 한 번만 함 (버벅임 방지)
      start.x2 = e.clientX; start.y2 = e.clientY;
      if (start.raf) return;
      start.raf = requestAnimationFrame(() => {
        if (!start || !ghost) return;
        start.raf = 0;
        ghost.style.transform = `translate3d(${start.x2 - start.hw}px, ${start.y2 - start.hh}px, 0)`;
        setOver(hit(start.x2, start.y2));
      });
    };
    const onUp = (e) => { if (start && e.pointerId === start.id) finish(e.clientX, e.clientY, true); };
    const onCancel = () => finish(0, 0, false);
    const onKey = (e) => { if (e.key === 'Escape' && start && start.drag) { e.stopPropagation(); finish(0, 0, false); } };   // 끄는 중 Esc: 취소
    const listen = (on) => {
      const f = on ? 'addEventListener' : 'removeEventListener';
      window[f]('pointermove', onMove, true);
      window[f]('pointerup', onUp, true);
      window[f]('pointercancel', onCancel, true);
      window[f]('blur', onCancel);
      document[f]('keydown', onKey, true);
    };
    const end0 = end;
    end = () => { listen(false); end0(); };
    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (start) finish(0, 0, false);                // 앞선 끌기가 남아 있었다면 먼저 정리
      if (pick) closePick();
      start = { x: e.clientX, y: e.clientY, id: e.pointerId, drag: false };
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      listen(true);
    });
    btn.addEventListener('click', (e) => { if (e.detail === 0 && !pick) openPick(btn.dataset.w, false); });   // 키보드(Enter·Space)로 누른 경우
  });

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

  // ===== 안내 말풍선: 느낌표를 누르면 열고, 다시 누르거나 바깥을 누르거나 Esc 를 누르면 닫음 (한 번에 하나만) =====
  const tips = [['#pfTipCover', '#pfTipCoverBubble'], ['#pfTipPhoto', '#pfTipPhotoBubble']].map(([b, bub]) => ({ btn: $(b), bubble: $(bub) }));
  const closeTips = (except) => tips.forEach((t) => { if (t !== except) { t.bubble.hidden = true; t.btn.setAttribute('aria-expanded', 'false'); } });
  tips.forEach((t) => t.btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = t.bubble.hidden;
    closeTips(open ? t : null);
    t.bubble.hidden = !open;
    t.btn.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.pf-tip')) closeTips(null); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTips(null); });

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

  // ===== 활동 상세: 위의 게시글·팔로워·팔로우·좋아요 중 하나를 고르면 왼쪽 아래 칸에 그 내용이 나옴 =====
  // ===== 전체 화면 프로필: 한 칸일 때보다 정보가 더 많이 보임 =====
  let about = null;                                   // 소개·분야·경력·태그 (profiles 행에서)
  const extra = { loaded: false, loading: false, err: false, posts: [], days: [], fans: [] };
  const WEEKS = 53;                                   // 활동 기록: 최근 1년(53주)을 한 칸 = 하루로
  async function loadExtra() {
    if (extra.loading || extra.loaded) return;
    extra.loading = true;
    const today = new Date();
    const days = (WEEKS - 1) * 7 + today.getDay() + 1;   // 맨 오른쪽 줄이 이번 주(일~토)가 되게
    try {
      const [a, b, c] = await Promise.all([sb.rpc('my_post_stats'), sb.rpc('my_activity_days', { p_days: days }), sb.rpc('my_followers')]);
      if (a.error || b.error || c.error) throw new Error('load');
      extra.posts = a.data || []; extra.days = b.data || []; extra.fans = c.data || [];
      extra.loaded = true; extra.err = false;
    } catch (e) { extra.err = true; }
    extra.loading = false;
    renderExtra();
  }
  function renderExtra() {
    if (sizeOf('profile') !== 'full') return;
    const t = I18N[lang];
    const ab = about || {};
    const muted = (node, text, empty) => { node.textContent = text || empty; node.classList.toggle('is-empty', !text); };
    // ① 소개
    muted($('#pfXHeadline'), ab.headline, t.xNoHeadline);
    muted($('#pfXBio'), ab.bio, t.xNoBio);
    // ② 분야 · 경력 · 태그
    const fieldTxt = [ab.field, ab.career_years != null ? t.xCareer(ab.career_years) : ''].filter(Boolean).join(' · ');
    muted($('#pfXField'), fieldTxt, t.xNoField);
    const tags = $('#pfXTags'); tags.textContent = '';
    const list = Array.isArray(ab.tags) ? ab.tags.filter(Boolean) : [];
    if (list.length) list.forEach((g) => tags.append(el('span', 'pf-x-tag', '#' + g)));
    else tags.append(el('span', 'pf-x-tag is-empty', t.xNoTags));
    // ③ 계정 정보 + 완성도
    const dl = $('#pfXInfo'); dl.textContent = '';
    const day = (v) => { const d = localDate(v); return d ? t.date(d) : ''; };
    [[t.iName, info && info.name], [t.iBirth, info && day(info.birth)], [t.iPhone, info && info.phone], [t.iJoined, info && day(info.joined)]].forEach(([k, v]) => {
      const row = el('div'); row.append(el('dt', '', k), el('dd', '', v || '–')); row.lastChild.title = v || ''; dl.append(row);
    });
    const checks = [!$('#pfPhotoImg').hidden, !$('#pfCoverImg').hidden, !!(info && info.name), !!ab.headline, !!ab.bio, !!ab.field, ab.career_years != null, list.length > 0];
    const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    $('#pfXDoneTxt').textContent = t.xDone(pct);
    $('#pfXDoneBar').style.width = pct + '%';
    // ④ 최근 게시글 · ⑤ 활동 기록 · ⑥ 팔로워 (처음 전체 화면이 됐을 때 한 번만 불러옴)
    if (!extra.loaded) { if (!extra.loading) loadExtra(); }
    const posts = $('#pfXPosts'); posts.textContent = '';
    const heat = $('#pfXHeat'); heat.textContent = '';
    const fans = $('#pfXFans'); fans.textContent = '';
    if (!extra.loaded) {
      const msg = extra.err ? t.xLoadFail : t.loading;
      [posts, heat, fans].forEach((n) => n.append(el('p', 'pf-x-note', msg)));
      $('#pfXActSum').textContent = '';
      return;
    }
    if (!extra.posts.length) posts.append(el('p', 'pf-x-note', t.xNoPosts));
    extra.posts.slice(0, 8).forEach((p) => {
      const c = el('div', 'pf-x-post');
      const title = el('strong', '', p.excerpt || '–'); title.title = p.excerpt || '';
      c.append(title, el('span', '', `${shortDate(p.created_at)} · ${t.viewsN(fmtN(p.views))} · ${t.likesN(fmtN(p.likes))}`));
      posts.append(c);
    });
    const total = extra.days.reduce((n, d) => n + Number(d.n || 0), 0);
    const top = Math.max(1, ...extra.days.map((d) => Number(d.n || 0)));
    $('#pfXActSum').textContent = t.xActSum(fmtN(total));
    heat.setAttribute('aria-label', t.xActLabel(fmtN(total)));
    extra.days.forEach((d) => {
      const n = Number(d.n || 0);
      const lv = n === 0 ? 0 : Math.min(4, Math.ceil((n / top) * 4));
      const cell = el('i', 'lv' + lv);
      const dd = localDate(d.day);
      cell.title = t.xActCell(dd ? t.date(dd) : d.day, n);
      cell.dataset.n = n;
      heat.append(cell);
    });
    if (!extra.fans.length) fans.append(el('p', 'pf-x-note', t.xNoFans));
    else {
      const faces = el('div', 'pf-x-faces');
      extra.fans.slice(0, 24).forEach((f) => { const a = avatar(f.username, f.avatar_path); a.title = f.username; faces.append(a); });
      faces.append(el('span', 'pf-av pf-x-more', ''));   // '+N': 폭에 맞춰 fitFull 이 채움
      fans.append(faces, el('span', 'pf-x-fans-txt', t.xFans(fmtN(extra.fans.length))));
    }
    fitFull();
  }

  // 전체 화면 프로필을 칸 크기에 맞춤: 창 크기가 바뀔 때마다 다시 계산해서 스크롤 없이 빈틈없이 채움
  //  · 자기소개: 들어가는 줄 수만큼   · 최근 게시글: 들어가는 줄 수 × 2개 (최대 8개)
  //  · 활동 기록: 칸이 정사각형에 가깝게 되는 만큼의 주(13~53주)   · 팔로워 얼굴: 폭에 들어가는 만큼
  //  · 그래도 넘치면 덜 중요한 상자(팔로워 → 분야·태그)부터 숨김
  // ===== 프로필 수정: 소개(한 줄 소개·자기소개)와 분야·경력·관심 태그를 직접 고침 =====
  const LIMIT = { headline: 60, bio: 500, field: 30 };
  let editOpen = false, editBack = null, editBusy = false, savedMsgTimer = 0;
  const editForm = $('#pfEditForm');
  const fieldOf = (n) => editForm.elements[n];
  // 태그: 쉼표로 나눠서 앞의 # 은 떼고, 같은 것은 하나만, 20자까지, 8개까지
  const parseTags = (v) => {
    const out = [];
    String(v || '').split(/[,，]/).forEach((x) => {
      const g = x.trim().replace(/^#+/, '').trim().slice(0, 20);
      if (g && !out.some((o) => o.toLowerCase() === g.toLowerCase())) out.push(g);
    });
    return out;
  };
  function countChars() {
    $$('#pfEditForm .pf-e-count[data-for]').forEach((c) => {
      const n = String(fieldOf(c.dataset.for).value || '').length;
      c.textContent = `${n} / ${LIMIT[c.dataset.for]}`;
      c.classList.toggle('bad', n > LIMIT[c.dataset.for]);
    });
    const tags = parseTags(fieldOf('tags').value);
    const tc = $('#pfEditTagCount');
    tc.textContent = `${tags.length} / 8`;
    tc.classList.toggle('bad', tags.length > 8);
  }
  function setEditMsg(text, bad) { const m = $('#pfEditMsg'); m.textContent = text || ''; m.classList.toggle('bad', !!bad); }
  function openEdit(focusName, backBtn) {
    if (!canEdit) { showMsg('load'); return; }
    const ab = about || {};
    fieldOf('headline').value = ab.headline || '';
    fieldOf('bio').value = ab.bio || '';
    fieldOf('field').value = ab.field || '';
    fieldOf('career').value = ab.career_years != null ? String(ab.career_years) : '';
    fieldOf('tags').value = Array.isArray(ab.tags) ? ab.tags.join(', ') : '';
    setEditMsg('');
    countChars();
    editOpen = true; editBack = backBtn || null;
    const box = $('#pfEdit');
    box.hidden = false;
    $('#pfGrid').inert = true;
    $('.pf-panel').classList.add('is-editing');
    void box.offsetWidth;
    box.classList.add('open');
    const f = fieldOf(focusName) || fieldOf('headline');
    f.focus({ preventScroll: true });
    if (f.setSelectionRange && f.type !== 'number') f.setSelectionRange(f.value.length, f.value.length);
  }
  function closeEdit() {
    if (!editOpen) return;
    editOpen = false;
    const box = $('#pfEdit');
    box.classList.toggle('open', false);
    $('#pfGrid').inert = false;
    $('.pf-panel').classList.toggle('is-editing', false);
    setTimeout(() => { if (!editOpen) box.hidden = true; }, 320);
    if (editBack && editBack.isConnected) editBack.focus({ preventScroll: true });
  }
  editForm.addEventListener('input', () => { countChars(); setEditMsg(''); });
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (editBusy) return;
    const t = I18N[lang];
    const val = (n) => String(fieldOf(n).value || '').trim();
    const headline = val('headline'), bio = val('bio'), field = val('field');
    const careerRaw = val('career');
    const tags = parseTags(fieldOf('tags').value);
    // 저장 전 확인: 글자 수 · 경력 숫자 · 태그 수
    for (const n of ['headline', 'bio', 'field']) {
      if (val(n).length > LIMIT[n]) { setEditMsg(t.eTooLong, true); fieldOf(n).focus(); return; }
    }
    let career = null;
    if (careerRaw) {
      if (!/^\d{1,2}$/.test(careerRaw) || Number(careerRaw) > 60) { setEditMsg(t.eCareerBad, true); fieldOf('career').focus(); return; }
      career = Number(careerRaw);
    }
    if (tags.length > 8) { setEditMsg(t.eTagsMany, true); fieldOf('tags').focus(); return; }
    const row = { headline: headline || null, bio: bio || null, field: field || null, career_years: career, tags: tags.length ? tags : null };
    editBusy = true;
    $('#pfEditSave').disabled = true;
    setEditMsg(t.eSaving);
    let ok = false;
    try {
      const { data, error } = await sb.from('profiles').update(row).eq('id', uid).select('id');
      ok = !error && Array.isArray(data) && data.length > 0;
    } catch (err) {}
    editBusy = false;
    $('#pfEditSave').disabled = false;
    if (!ok) { setEditMsg(t.eFail, true); return; }
    about = { ...(about || {}), ...row };
    closeEdit();
    renderExtra();
    const m = $('#pfLayoutMsg');                         // 흰 상자 아래에 '저장했어요'를 잠깐 띄움
    m.textContent = t.eSaved;
    m.classList.add('show');
    clearTimeout(savedMsgTimer);
    savedMsgTimer = setTimeout(() => m.classList.toggle('show', false), 2500);
  });
  $('#pfEditCancel').addEventListener('click', closeEdit);
  $('#pfEdit').addEventListener('mousedown', (e) => { if (e.target === e.currentTarget) closeEdit(); });   // 바깥의 흐린 곳을 누르면 닫힘
  document.addEventListener('keydown', (e) => {
    if (!editOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); closeEdit(); return; }
    if (e.key === 'Tab') {                               // 키보드 초점이 수정 창 안에서만 돌게
      const items = [...editForm.querySelectorAll('input, textarea, button')].filter((x) => !x.disabled);
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  $$('.pf-x-edit').forEach((b) => b.addEventListener('click', () => openEdit(b.dataset.focus, b)));

  let fitRaf = 0;
  function fitFull() {
    if (sizeOf('profile') !== 'full' || !extra.loaded) return;
    const ex = $('#pfExtra');
    if (!ex.clientHeight) return;
    const t = I18N[lang];
    const [L, R] = $$('#pfExtra .pf-x-col');
    const num = (v) => parseFloat(v) || 0;
    const inner = (c) => c.clientHeight - num(getComputedStyle(c).paddingBottom);
    const gapOf = (c) => num(getComputedStyle(c).rowGap);
    const used = (c) => [...c.children].filter((x) => !x.hidden).reduce((n, x, i) => n + x.offsetHeight + (i ? gapOf(c) : 0), 0);
    const titleH = (box) => { const h = box.querySelector('.pf-x-t'); return h.offsetHeight + num(getComputedStyle(h).marginBottom); };
    $$('#pfExtra [data-drop]').forEach((x) => { x.hidden = false; });
    // 계정 정보: 한 칸 폭이 150px 이상 되면 네 칸을 한 줄로 (세로 공간을 소개 글에 더 줌)
    const infoEl = $('#pfXInfo');
    infoEl.classList.toggle('is-row', infoEl.clientWidth / 4 >= 150);

    // ----- 오른쪽 단: 최근 게시글 줄 수 → 남는 높이로 활동 기록 → 그래도 남으면 상자 사이를 고르게 벌림 -----
    const posts = $('#pfXPosts'), heat = $('#pfXHeat');
    const postsBox = $('#pfXRecent'), heatBox = $('#pfXActivity'), fansBox = $('#pfXFans').closest('.pf-x-box');
    const cards = [...posts.querySelectorAll('.pf-x-post')];
    posts.style.height = ''; posts.style.gridTemplateRows = ''; heat.style.height = '';
    cards.forEach((c) => { c.hidden = false; });
    const cells = [...heat.querySelectorAll('i')];
    cells.forEach((c) => { c.hidden = false; });
    const heatMin = num(getComputedStyle(heat).minHeight) || 54;
    const avail = inner(R) - gapOf(R) * 2 - fansBox.offsetHeight - titleH(postsBox) - titleH(heatBox);
    let postsH = posts.offsetHeight;
    if (cards.length) {
      const pg = num(getComputedStyle(posts).rowGap);
      const cardH = Math.max(...cards.slice(0, 2).map((c) => c.offsetHeight));
      const fitRows = Math.floor((avail - heatMin + pg) / (cardH + pg));
      const rows = Math.max(1, Math.min(4, Math.ceil(cards.length / 2), fitRows));
      cards.forEach((c, i) => { c.hidden = i >= rows * 2; });
      postsH = rows * cardH + (rows - 1) * pg;
      posts.style.gridTemplateRows = `repeat(${rows}, ${cardH}px)`;
      posts.style.height = `${postsH}px`;
    }
    if (cells.length) {
      const g = num(getComputedStyle(heat).columnGap) || 2;
      const W = heat.clientWidth;
      const room = Math.max(heatMin, avail - postsH);
      // 한 칸이 정사각형이 되도록: 높이로 정한 칸 크기만큼 폭에 들어가는 주 수(13~53주), 칸이 너무 커지면 높이를 줄임
      const byH = (room - g * 6) / 7;
      const weeks = Math.max(13, Math.min(WEEKS, Math.floor((W + g) / (byH + g))));
      const cell = (W - g * (weeks - 1)) / weeks;
      heat.style.height = `${Math.min(room, cell * 7 + g * 6)}px`;
      const hide = Math.max(0, cells.length - ((weeks - 1) * 7 + (cells.length % 7 || 7)));
      cells.forEach((c, i) => { c.hidden = i < hide; });
      heat.style.gridTemplateColumns = `repeat(${weeks}, minmax(0, 1fr))`;
      const shown = cells.slice(hide).reduce((n, c) => n + Number(c.dataset.n || 0), 0);
      $('#pfXActSum').textContent = weeks >= 52 ? t.xActSum(fmtN(shown)) : t.xActSumM(Math.round(weeks / 4.35), fmtN(shown));
    }
    // 팔로워 얼굴: 폭에 들어가는 만큼
    const faces = $('#pfXFans .pf-x-faces');
    if (faces) {
      const all = [...faces.querySelectorAll('.pf-av:not(.pf-x-more)')];
      const more = faces.querySelector('.pf-x-more');
      all.forEach((x) => { x.hidden = false; });
      const one = all[0] ? all[0].getBoundingClientRect().width * 0.8 : 30;
      const txt = $('#pfXFans .pf-x-fans-txt');
      const room = $('#pfXFans').clientWidth - (txt ? txt.offsetWidth + 24 : 0) - one * 1.5;
      const fit = Math.max(1, Math.min(all.length, Math.floor(room / one)));
      all.forEach((x, i) => { x.hidden = i >= fit; });
      const rest = extra.fans.length - fit;
      if (more) { more.hidden = rest <= 0; more.textContent = '+' + fmtN(rest); }
    }

    // ----- 왼쪽 단: 자기소개를 한 줄로 두고 잰 뒤, 남는 높이만큼 줄을 늘림 (글이 그보다 짧으면 글 길이까지만) -----
    const bio = $('#pfXBio');
    const lh = num(getComputedStyle(bio).lineHeight) || 20;
    bio.style.webkitLineClamp = 'unset'; bio.style.maxHeight = 'none';
    const textLines = Math.max(1, Math.round(bio.scrollHeight / lh));
    bio.style.webkitLineClamp = '1'; bio.style.maxHeight = `${lh}px`;
    const spare = inner(L) - used(L);
    const lines = Math.max(1, Math.min(textLines, 1 + Math.floor(spare / lh)));
    bio.style.webkitLineClamp = String(lines); bio.style.maxHeight = `${lines * lh}px`;

    // 그래도 넘치면 덜 중요한 상자(팔로워 → 분야·태그)부터 숨김
    ['1', '2'].forEach((lv) => {
      [L, R].forEach((col) => { if (used(col) > inner(col) + 1) col.querySelectorAll(`[data-drop="${lv}"]`).forEach((x) => { x.hidden = true; }); });
    });
  }
  if (window.ResizeObserver) new ResizeObserver(() => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitFull); }).observe($('#pfExtra'));

  const fmtN = (v) => new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ko-KR').format(Number(v) || 0);
  const shortDate = (iso) => { const d = localDate(iso); return d ? I18N[lang].date(d) : ''; };
  const HEART = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.8 4.5 6.4 4.5c2 0 3.6 1.1 5.6 3.2 2-2.1 3.6-3.2 5.6-3.2 3.6 0 5.5 3.7 4 7.2C19.5 16.4 12 21 12 21Z"/></svg>';
  // 조회수 그래프 기간도 칸 크기에 따라: 한 칸 7일, 가로·세로 14일, 전체 30일
  const DAYS_BY = { q: 7, wide: 14, tall: 14, full: 30 };
  const daysFor = () => DAYS_BY[sizeOf('activity')];
  const detail = { view: 'posts', dir: 'received', data: {}, err: false, actErr: false, seq: 0 };
  const tabBtns = $$('#pfTabs .pf-stat');
  const dBody = $('#pfDetailBody');
  const TITLE = { posts: 'dPostsT', followers: 'dFollowersT', following: 'dFollowingT', likes: 'dLikesT' };
  const TABID = { posts: 'tabPosts', followers: 'tabFollowers', following: 'tabFollowing', likes: 'tabLikes' };

  async function loadStats() {            // 서버 함수 my_stats 가 내 숫자를 세어서 돌려줌 (실패하면 그대로 둠)
    try {
      const { data, error } = await sb.rpc('my_stats');
      const r = !error && Array.isArray(data) ? data[0] : null;
      if (r) {
        $('#pfStatPosts').textContent = fmtN(r.posts);
        $('#pfStatFollowers').textContent = fmtN(r.followers);
        $('#pfStatFollowing').textContent = fmtN(r.following);
        $('#pfStatLikes').textContent = fmtN(r.likes);
      }
    } catch (e) {}
  }

  function avatar(name, path) {
    const a = el('span', 'pf-av');
    const initial = String(name || '?').slice(0, 1);
    if (path) {
      const im = new Image();
      im.alt = '';
      im.onerror = () => { a.textContent = initial; };
      im.src = publicUrl(path);
      a.append(im);
    } else a.textContent = initial;
    return a;
  }

  function renderPosts(d, t) {
    const posts = d.posts, series = d.series;
    const total = posts.reduce((n, p) => n + Number(p.views || 0), 0);
    const week = series.reduce((n, x) => n + Number(x.views || 0), 0);
    const avg = posts.length ? Math.round((total / posts.length) * 10) / 10 : 0;
    const m = el('div', 'pf-metrics');
    const nDays = series.length || daysFor();
    const left = el('div', 'pf-d-col'), right = el('div', 'pf-d-col');   // 칸이 넓으면 왼쪽(지표·그래프)과 오른쪽(게시글 목록)으로 나뉨
    dBody.classList.add('is-split');
    dBody.append(left, right);
    [[total, t.mViews], [week, t.mWeek(nDays)], [avg, t.mAvg]].forEach(([v, label]) => {
      const c = el('div', 'pf-metric');
      c.append(el('b', null, fmtN(v)), el('span', null, label));
      m.append(c);
    });
    left.append(m);

    left.append(el('p', 'pf-sub', t.chartT(nDays)));
    const max = Math.max(1, ...series.map((x) => Number(x.views || 0)));
    const chart = el('div', 'pf-chart');
    const step = Math.ceil(series.length / 8);                    // 날짜 글자는 겹치지 않게 며칠에 한 번만
    series.forEach((x, i) => {
      const col = el('div');
      col.title = `${x.day}: ${fmtN(x.views)}`;
      const bar = el('i', Number(x.views) ? '' : 'zero');
      bar.style.height = `${Math.max(3, Math.round((Number(x.views || 0) / max) * 100))}%`;
      const d0 = localDate(x.day);
      col.append(bar, el('small', null, d0 && (series.length - 1 - i) % step === 0 ? `${d0.getMonth() + 1}/${d0.getDate()}` : '\u00a0'));
      chart.append(col);
    });
    left.append(chart);

    right.append(el('p', 'pf-sub', t.listT));
    if (!posts.length) { right.append(el('p', 'pf-d-note', t.emptyPosts)); return; }
    const top = Math.max(1, ...posts.map((p) => Number(p.views || 0)));
    const ul = el('ul', 'pf-rows');
    posts.forEach((p) => {
      const li = el('li', 'pf-row');
      const main = el('div', 'pf-row-main');
      main.append(el('strong', null, p.excerpt || '–'), el('span', null, `${shortDate(p.created_at)} · ${t.likesN(fmtN(p.likes))}`));
      const views = el('div', 'pf-views');
      const bar = el('u'); const fill = el('i');
      fill.style.width = `${Math.round((Number(p.views || 0) / top) * 100)}%`;
      bar.append(fill);
      views.append(el('b', null, fmtN(p.views)), bar);
      li.append(main, views);
      ul.append(li);
    });
    right.append(ul);
  }

  function renderPeople(rows, t, kind) {
    if (!rows.length) { dBody.append(el('p', 'pf-d-note', kind === 'followers' ? t.emptyFollowers : t.emptyFollowing)); return; }
    const ul = el('ul', 'pf-rows');
    rows.forEach((r) => {
      const li = el('li', 'pf-row');
      const main = el('div', 'pf-row-main');
      main.append(el('strong', null, r.username), el('span', null, t.since(shortDate(r.followed_at))));
      const end = el('div', 'pf-row-end');
      if (kind === 'followers') {
        if (r.i_follow) end.append(el('span', 'pf-tag', t.followingTag));
        else { const b = el('button', 'pf-mini solid', t.followBack); b.type = 'button'; b.addEventListener('click', () => act('follow_user', r.username, b)); end.append(b); }
      } else {
        if (r.follows_me) end.append(el('span', 'pf-tag', t.followsMeTag));
        const b = el('button', 'pf-mini', t.unfollow); b.type = 'button'; b.addEventListener('click', () => act('unfollow_user', r.username, b));
        end.append(b);
      }
      li.append(avatar(r.username, r.avatar_path), main, end);
      ul.append(li);
    });
    dBody.append(ul);
  }

  function renderLikes(rows, t) {
    const list = rows.filter((r) => (detail.dir === 'received') === (r.direction === 'received'));
    if (!list.length) { dBody.append(el('p', 'pf-d-note', detail.dir === 'received' ? t.emptyRecv : t.emptyGave)); return; }
    const ul = el('ul', 'pf-rows');
    list.forEach((r) => {
      const li = el('li', 'pf-row');
      const icon = el('span', 'pf-heart' + (r.direction === 'received' ? '' : ' out'));
      icon.innerHTML = HEART;                                     // 고정된 하트 그림만 HTML 로 넣음
      const main = el('div', 'pf-row-main');
      main.append(el('strong', null, r.direction === 'received' ? t.likeRecv(r.username) : t.likeGave(r.username)), el('span', null, r.excerpt || '–'));
      li.append(icon, main, el('time', null, shortDate(r.created_at)));
      ul.append(li);
    });
    dBody.append(ul);
  }

  // 스크롤 없이 보여 주기: 목록은 칸에 들어가는 줄 수만큼만 보이고, 나머지는 아래의 ‹ 1 / 3 › 로 넘김.
  // 한 줄도 들어갈 자리가 없으면(작은 칸의 게시글 목록) 목록을 아예 숨김 → 더 큰 칸에 놓으면 보임
  let rowsPage = 0;
  // 쪽을 넘길 때: 새 줄들이 넘기는 방향에서 살짝 밀려 들어오며 차례로 나타남
  function slide(list, dir) {
    if (!list) return;
    list.classList.toggle('pf-slide-next', false);
    list.classList.toggle('pf-slide-prev', false);
    void list.offsetWidth;                           // 같은 방향으로 연달아 넘겨도 움직임이 다시 시작되게
    list.classList.add(dir === 'prev' ? 'pf-slide-prev' : 'pf-slide-next');
    clearTimeout(list.slideTimer);                   // 움직임이 끝나면 표시를 지움 (나중에 다시 그릴 때 또 움직이지 않게)
    list.slideTimer = setTimeout(() => { list.classList.toggle('pf-slide-next', false); list.classList.toggle('pf-slide-prev', false); }, 1000);
  }
  function fitRows() {
    const ul = dBody.querySelector('.pf-rows');
    const old = dBody.querySelector('.pf-pager');
    if (old) old.parentNode.removeChild(old);
    if (!ul) {
      // 목록 대신 '아직 없어요' 안내만 있을 때: 작은 칸에서 아래로 넘치면 안내와 그 제목을 숨김
      const note = dBody.querySelector('.pf-d-col .pf-d-note');
      if (note) {
        const head = note.previousElementSibling;
        note.hidden = false; if (head) head.hidden = false;
        if (dBody.clientHeight && note.getBoundingClientRect().bottom > dBody.getBoundingClientRect().bottom + 1) { note.hidden = true; if (head) head.hidden = true; }
      }
      return;
    }
    const rows = [...ul.children];
    const sub = ul.previousElementSibling && ul.previousElementSibling.classList.contains('pf-sub') ? ul.previousElementSibling : null;
    rows.forEach((r) => { r.hidden = false; });
    ul.hidden = false;
    ul.style.minHeight = '';
    if (sub) sub.hidden = false;
    if (!rows.length || !dBody.clientHeight) return;
    const cs = getComputedStyle(ul);
    const gap = parseFloat(cs.rowGap) || 0;
    const cols = cs.display === 'grid' ? cs.gridTemplateColumns.split(' ').filter(Boolean).length : 1;
    const rowH = rows[0].offsetHeight;
    const avail = dBody.clientHeight - (ul.getBoundingClientRect().top - dBody.getBoundingClientRect().top);
    const fit = (h) => Math.max(0, Math.floor((h + gap) / (rowH + gap))) * cols;
    let per = fit(avail);
    if (per >= rows.length) { rowsPage = 0; return; }
    // 다 들어가지 않으면 쪽 넘김 줄을 넣고, 그 높이를 뺀 만큼만 보여 줌
    const t = I18N[lang];
    const pager = el('div', 'pf-pager');
    const prev = el('button', 'pf-pager-btn', '‹'), next = el('button', 'pf-pager-btn', '›'), label = el('span');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', t.devPrev); next.setAttribute('aria-label', t.devNext);
    pager.append(prev, label, next);
    ul.after(pager);
    per = fit(avail - pager.offsetHeight - parseFloat(getComputedStyle(pager).marginTop || 0));
    if (per < 1) { ul.hidden = true; pager.hidden = true; if (sub) sub.hidden = true; return; }
    const pages = Math.ceil(rows.length / per);
    rowsPage = Math.min(Math.max(0, rowsPage), pages - 1);
    rows.forEach((r, i) => { r.hidden = i < rowsPage * per || i >= (rowsPage + 1) * per; r.style.setProperty('--i', i - rowsPage * per); });
    // 목록 높이를 한 쪽 분량으로 고정: 마지막 쪽에 줄이 적어도 ‹ 1 / 3 › 의 위치가 바뀌지 않음
    const perCol = per / cols;
    ul.style.minHeight = `${perCol * rowH + (perCol - 1) * gap}px`;
    label.textContent = t.devPage(rowsPage + 1, pages);
    prev.disabled = rowsPage === 0;
    next.disabled = rowsPage >= pages - 1;
    prev.addEventListener('click', () => { rowsPage -= 1; fitRows(); slide(dBody.querySelector('.pf-rows'), 'prev'); const b = dBody.querySelector('.pf-pager-btn:not(:disabled)'); if (b) b.focus(); });
    next.addEventListener('click', () => { rowsPage += 1; fitRows(); slide(dBody.querySelector('.pf-rows'), 'next'); const b = [...dBody.querySelectorAll('.pf-pager-btn:not(:disabled)')].pop(); if (b) b.focus(); });
  }
  let fitTimer = 0;
  addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(() => { fitRows(); if (!devOpen) showDevices(); }, 80); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitRows());

  function renderDetail() {
    drawDetail();
    fitRows();
  }
  function drawDetail() {
    const t = I18N[lang], v = detail.view;
    tabBtns.forEach((b) => { const on = b.dataset.view === v; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    $('#pfDetail').setAttribute('aria-labelledby', TABID[v]);
    $('#pfDetailTitle').textContent = t[TITLE[v]];
    $('#pfSeg').hidden = v !== 'likes';
    $$('#pfSeg .pf-seg-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.dir === detail.dir));
    dBody.textContent = '';
    dBody.classList.toggle('is-split', false);
    const d = detail.data[v];
    if (d === undefined) { dBody.append(el('p', detail.err ? 'pf-d-note bad' : 'pf-d-note', detail.err ? t.dFail : t.loading)); return; }
    if (detail.actErr) dBody.append(el('p', 'pf-d-note bad', t.actFail));
    if (v === 'posts') renderPosts(d, t);
    else if (v === 'likes') renderLikes(d, t);
    else renderPeople(d, t, v);
  }

  async function loadDetail() {
    const v = detail.view, my = ++detail.seq;
    const days = daysFor();
    detail.started = true;
    detail.err = false;
    renderDetail();
    let d;
    try {
      if (v === 'posts') {
        const [a, b] = await Promise.all([sb.rpc('my_post_stats'), sb.rpc('my_views_series', { p_days: days })]);
        if (a.error || b.error) throw new Error('load');
        d = { posts: a.data || [], series: b.data || [] };
      } else {
        const r = await sb.rpc({ followers: 'my_followers', following: 'my_following', likes: 'my_like_history' }[v]);
        if (r.error) throw new Error('load');
        d = r.data || [];
      }
    } catch (e) {
      if (my === detail.seq) { detail.err = detail.data[v] === undefined; renderDetail(); }
      return;
    }
    if (my !== detail.seq) return;           // 그 사이 다른 항목을 골랐으면 이 결과는 버림
    detail.data[v] = d;
    if (v === 'posts') detail.days = days;
    detail.actErr = false;
    renderDetail();
  }
  function selectView(v) { detail.view = v; rowsPage = 0; loadDetail(); }

  // 맞팔로우 / 팔로우 취소
  async function act(fn, username, btn) {
    btn.disabled = true;
    let ok = false;
    try { const { error } = await sb.rpc(fn, { p_username: username }); ok = !error; } catch (e) {}
    if (!ok) { detail.actErr = true; renderDetail(); return; }
    detail.actErr = false;
    await Promise.all([loadDetail(), loadStats()]);
  }

  tabBtns.forEach((b, i) => {
    b.addEventListener('click', () => selectView(b.dataset.view));
    b.addEventListener('keydown', (e) => {          // 좌우 방향키 · Home · End 로 항목 이동
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? tabBtns.length - 1 : k ? (i + k + tabBtns.length) % tabBtns.length : -1;
      if (to < 0) return;
      e.preventDefault();
      tabBtns[to].focus();
      selectView(tabBtns[to].dataset.view);
    });
  });
  $$('#pfSeg .pf-seg-btn').forEach((b) => b.addEventListener('click', () => { detail.dir = b.dataset.dir; rowsPage = 0; renderDetail(); }));

  // ===== 시작: 로그인 확인 =====
  applyLang();
  (async () => {
    let session = null;
    try { session = (await sb.auth.getSession()).data.session; } catch (e) {}
    if (!session) { location.replace('login.html'); return; }   // 로그인하지 않았으면 로그인 화면으로

    const u = session.user;
    myEmail = u.email || '';
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
      const { data, error } = await sb.from('profiles').select('username, avatar_path, cover_path, layout, name, birth_date, phone, created_at, headline, bio, field, career_years, tags').eq('id', uid).maybeSingle();
      if (!error && data) p = data;
    } catch (e) {}
    const text = (id, v) => { $(id).textContent = v || '–'; $(id).title = v || ''; };
    text('#pfId', (p && p.username) || shownId);
    text('#pfEmail', u.email);
    info = p ? { name: p.name, birth: p.birth_date, phone: p.phone, joined: p.created_at } : null;
    about = p ? { headline: p.headline, bio: p.bio, field: p.field, career_years: p.career_years, tags: p.tags } : null;
    showInfo();
    if (p) { photo.show(p.avatar_path || null); cover.show(p.cover_path || null); } else showMsg('load');
    canEdit = !!p;
    layout = cleanLayout(p && p.layout);          // 계정에 저장된 배치 (없으면 기본 배치)
    applyLayout();
    $('#pfGrid').classList.remove('is-wait');
    $('#pfTop').classList.remove('is-loading');

    // 게시글·팔로워·팔로우·좋아요 숫자와, 고른 항목(처음엔 게시글)의 자세한 내용
    await loadStats();
    selectView('posts');

    // 등록된 기기: 서버 함수 my_devices 가 내 기기의 종류·이름·등록일·마지막 접속만 돌려줌
    await reloadDevices();
    showDevices();
    $('#pfDev').classList.remove('is-loading');
  })();
})();
