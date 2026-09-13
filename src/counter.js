try {
  document.documentElement.classList.add('js');
  var th = localStorage.getItem('jz_theme');
  if (th) document.documentElement.dataset.theme = th;
  var lg = localStorage.getItem('jz_lang');
  if (lg) document.documentElement.dataset.lang = lg;
} catch (e) {}

setTimeout(function () {
  try {
    var p = document.getElementById('pre');
    if (p && !p.classList.contains('done')) p.classList.add('done');
    if (document.body) document.body.classList.add('ready');
    setTimeout(function () {
      if (p && p.parentNode) p.parentNode.removeChild(p);
    }, 600);
  } catch (e) {}
}, 5000);

'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const el = (t, c, h) => {
  const n = document.createElement(t);
  if (c) n.className = c;
  if (h != null) n.innerHTML = h;
  return n;
};

const esc = s => String(s).replace(/[&<>"']/g, m => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[m]));

const mulberry32 = a => function () {
  a |= 0;
  a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const hsh = s => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0;
  return h;
};

const rndSeed = () => 1 + ((Math.random() * 99999) | 0);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const safe = fn => { try { fn(); } catch (e) { console.error('[jz]', e); } };

let MEMMODE = false;

const LS = (() => {
  try {
    const k = '__jz_tst';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return localStorage;
  } catch (e) {
    MEMMODE = true;
    const m = {};
    return {
      getItem: k => (k in m ? m[k] : null),
      setItem: (k, v) => { m[k] = String(v); },
      removeItem: k => { delete m[k]; }
    };
  }
})();

const SS = {
  mem: null,
  get() {
    try { return sessionStorage.getItem('jz_adm') || this.mem; }
    catch (e) { return this.mem; }
  },
  set(v) {
    try { sessionStorage.setItem('jz_adm', v); } catch (e) {}
    this.mem = v;
  },
  del() {
    try { sessionStorage.removeItem('jz_adm'); } catch (e) {}
    this.mem = null;
  }
};

const I = {
  cube: '<path d="M12 2.7 20 7.3v9.4L12 21.3 4 16.7V7.3L12 2.7Z"/><path d="M12 12 20 7.3M12 12 4 7.3M12 12v9.3"/>',
  ur: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  right: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  out: '<path d="M9 4H5v16h4M15 8l4 4-4 4M9.5 12H19"/>',
  check: '<path d="M4.5 12.8l4.6 4.6L19.5 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>',
  edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M13.5 6.5l3 3"/>',
  upload: '<path d="M12 16V5M7.5 9 12 4.5 16.5 9"/><path d="M4 16.5V20h16v-3.5"/>',
  img: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M8.5 10.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z"/><path d="M5 18.5l4.5-4.5 3 3 3.5-3.5 3 3"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4.5h-4.5"/>'
};

const ic = (n, s = 18) =>
  `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;

function toast(msg, icn = 'check') {
  safe(() => {
    const tw = el('div', 'toast', ic(icn, 17) + '<span>' + msg + '</span>');
    $('#toasts').appendChild(tw);
    setTimeout(() => {
      tw.classList.add('out');
      setTimeout(() => tw.remove(), 350);
    }, 3400);
  });
}

let LANG = document.documentElement.dataset.lang
  || LS.getItem('jz_lang')
  || (((navigator.language || '').toLowerCase().indexOf('ru') === 0) ? 'ru' : 'en');

let THEME = document.documentElement.dataset.theme || 'dark';

const T = {
  en: {
    pre_sub: 'Jefoze — portfolio',
    pre_l1: '> renderer ............... <b>ok</b>',
    pre_l2: '> voxel.field ............ <b>36 nodes</b>',
    pre_l3: '> i18n ................... <b>en · ru</b>',
    pre_l4: '> portfolio .............. <b>github</b>',
    pre_l5: '> handshake .............. <b>ready</b>',

    nav_works: 'Works',
    nav_custom: 'Custom',
    nav_about: 'About',

    hero_eyebrow: 'Minecraft Technical Admin · Plugin Developer',
    hero_sub: 'Alexander, 16 — <b>Middle Minecraft Plugin Developer</b> & Tech Admin, based in Uzbekistan. Systems that hold under load, code your admins can read.',
    cta_works: 'View works',
    cta_custom: 'Get in touch',

    hf_avail: 'Available for work',
    hf_tz: 'Samarkand · UTC+5',
    hf_est: 'Est. 2023',
    hf_scroll: 'Scroll',

    mq: [
      'Plugin architecture',
      'Performance profiling',
      'Paper · Spigot · Folia',
      'Permission systems',
      'Velocity networks',
      'Forge & Fabric mods',
      'Server optimization',
      'Clean APIs & docs'
    ],

    about_eb_n: '01',
    about_eb: '— About',
    about_h: 'Systems-first developer.<br>Server-side to the core.',
    about_side: 'One person, accountable end to end — from the first line of scope to the last optimization pass.',
    about_p1: 'I’m Alexander — a <b>middle-level plugin developer and technical administrator</b> from Uzbekistan. For the past years I’ve been building and maintaining the systems Minecraft servers run on: permission architecture, optimization work, and plugins written for the way owners actually use them.',
    about_p2: 'Everything I ship comes with readable source, sane configuration and documentation your next admin won’t have to fight. <b>Middle-level by title — production-minded by habit.</b>',
    stat1: 'plugins shipped',
    stat2: 'servers administered',
    stat3: 'avg. first reply',
    fig_a: 'Fig. 01 — internal build',
    fig_b: 'generative · 960×720',
    gh_btn: 'GitHub',

    works_eb_n: '02',
    works_eb: '— Works',
    works_h: 'Selected works,<br>open on GitHub.',
    works_side: 'Everything is public: source, documentation and releases live on GitHub. Grab it, fork it, ship it.',

    custom_eb_n: '03',
    custom_eb: '— Custom work',
    custom_h: 'Have an idea that<br>doesn’t exist yet?',
    custom_p: 'Bespoke plugins and mods for servers that outgrew the market. From lightweight utilities to full gameplay systems — scoped, quoted and delivered by one person who answers for the result.',
    custom_btn: 'Get in touch',
    s1h: 'Describe',
    s1p: 'Send the idea, budget and deadline. No formal spec required — an honest paragraph is enough.',
    s2h: 'Scope',
    s2p: 'I reply with a fixed quote, a timeline and a technical plan — usually within a day.',
    s3h: 'Build',
    s3p: 'Development, testing on a mirror of your server, delivery with source and documentation.',

    f_sub: 'Minecraft technical administration & plugin development. Built in Samarkand, shipped worldwide.',
    f_site: 'Site',
    f_contacts: 'Contacts',
    f_meta: 'Meta',
    f_works: 'Works',
    f_custom_l: 'Custom work',
    f_about_l: 'About',
    f_admin: 'Admin panel',
    f_top: 'Back to top',
    f_copy: '© 2026 Jefoze — Uzbekistan',

    ad_console: 'admin',
    ad_back: 'Back to site',
    ad_out: 'Log out',
    ad_login_t: 'Admin console — enter the password to continue',
    ad_login_ph: 'Password',
    ad_login: 'Unlock',
    ad_wrong: 'Wrong password',
    ad_hint: 'The password is stored as a hash · session lasts until the tab closes',
    ad_ok: 'Console unlocked',

    tab_works: 'Works',
    tab_contacts: 'Contacts',
    tab_stats: 'Stats',
    tab_images: 'Images',
    tab_sec: 'Security',

    w_add: 'Add work',
    w_edit: 'Edit — {n}',
    w_new: 'New work',
    w_name: 'Name',
    w_cat: 'Category',
    w_gh: 'GitHub URL',
    w_gh_ph: 'https://github.com/you/project',
    w_short: 'Short description',
    w_img: 'Cover image',
    w_empty: 'No works yet — add the first one.',
    b_up: 'Upload',
    b_regen: 'Regenerate',
    b_cancel: 'Cancel',
    w_save: 'Save work',
    e_wname: 'Name is required',
    e_wgh: 'Enter a valid URL — https://…',
    t_w_added: 'Work added',
    t_w_updated: 'Work updated',
    t_w_removed: 'Work removed',
    arm: 'Sure?',

    c_add: 'Add contact',
    c_edit: 'Edit contact',
    c_new: 'New contact',
    c_label: 'Label',
    c_label_ph: 'Telegram',
    c_value: 'Value',
    c_value_ph: '@jefoze',
    c_url: 'Link — optional',
    c_url_ph: 'https://t.me/… or mailto:…',
    c_none: 'No contacts yet.',
    e_clabel: 'Label is required',
    e_cval: 'Value is required',
    e_curl: 'https:// or mailto: — or leave empty',
    t_c_added: 'Contact added',
    t_c_updated: 'Contact updated',
    t_c_removed: 'Contact removed',

    st_plugins: 'Plugins shipped',
    st_servers: 'Servers administered',
    st_reply: 'Avg. first reply',
    st_note: 'These three numbers are shown in the About section. The suffix is what follows the number — “+” or “h”.',
    st_suf: 'Suffix',
    st_save: 'Save stats',
    e_stnum: 'Enter valid numbers',
    t_stats: 'Stats updated',

    i_hero: 'Hero backdrop',
    i_hero_d: 'Optional full-bleed image under the animated cube field. Currently: {x}.',
    i_about: 'About visual',
    i_about_d: 'Shown beside the bio. Currently: {x}.',
    x_custom: 'custom image',
    x_gen: 'generative field only',
    x_genart: 'generated artwork',
    b_rm: 'Remove',
    t_img: 'Image updated',

    s_cur: 'Current password',
    s_new: 'New password',
    s_new2: 'Repeat new password',
    s_save: 'Change password',
    e_scur: 'Wrong current password',
    e_snew: 'At least 4 characters',
    e_smatch: 'Passwords don’t match',
    t_pass: 'Password updated',
    s_note: 'The password never leaves this browser and is stored only as a hash — you can change it here at any time. If you forget it, clear the site data to reset to the factory one.',

    t_memmode: 'Storage unavailable — data lives until the page reloads',
    th_light: 'Light theme',
    th_dark: 'Dark theme'
  },

  ru: {
    pre_sub: 'Jefoze — портфолио',
    pre_l1: '> рендерер ............... <b>ок</b>',
    pre_l2: '> voxel.field ............ <b>36 узлов</b>',
    pre_l3: '> i18n ................... <b>en · ru</b>',
    pre_l4: '> портфолио .............. <b>github</b>',
    pre_l5: '> рукопожатие ............ <b>готово</b>',

    nav_works: 'Работы',
    nav_custom: 'Кастом',
    nav_about: 'Обо мне',

    hero_eyebrow: 'Тех-админ Minecraft · Разработчик плагинов',
    hero_sub: 'Александр, 16 — <b>middle-разработчик плагинов Minecraft</b> и тех-админ из Узбекистана. Системы, которые держат нагрузку, и код, который читают ваши админы.',
    cta_works: 'Смотреть работы',
    cta_custom: 'Написать мне',

    hf_avail: 'Открыт к работе',
    hf_tz: 'Самарканд · UTC+5',
    hf_est: 'С 2023 года',
    hf_scroll: 'Листайте',

    mq: [
      'Архитектура плагинов',
      'Профилирование производительности',
      'Paper · Spigot · Folia',
      'Системы прав',
      'Сети на Velocity',
      'Моды Forge & Fabric',
      'Оптимизация серверов',
      'Чистые API и документация'
    ],

    about_eb_n: '01',
    about_eb: '— Обо мне',
    about_h: 'Разработчик от систем.<br>Серверная часть — в ядре.',
    about_side: 'Один человек отвечает за всё — от первой строки ТЗ до последней оптимизации.',
    about_p1: 'Я Александр — <b>middle-разработчик плагинов и технический администратор</b> из Узбекистана. Уже несколько лет строю и обслуживаю то, на чём работают серверы Minecraft: архитектуру прав, оптимизацию и плагины, написанные так, как ими реально пользуются владельцы.',
    about_p2: 'Всё, что я выпускаю, — читаемые исходники, вменяемая конфигурация и документация, с которой не придётся воевать. <b>Middle по званию — продакшн по привычке.</b>',
    stat1: 'плагинов выпущено',
    stat2: 'серверов под опекой',
    stat3: 'средний ответ',
    fig_a: 'Рис. 01 — внутренняя сборка',
    fig_b: 'генерация · 960×720',
    gh_btn: 'GitHub',

    works_eb_n: '02',
    works_eb: '— Работы',
    works_h: 'Избранные работы —<br>открыты на GitHub.',
    works_side: 'Всё публично: исходники, документация и релизы живут на GitHub. Забирайте, форкайте, запускайте.',

    custom_eb_n: '03',
    custom_eb: '— Кастом-работа',
    custom_h: 'Есть идея,<br>которой ещё нет?',
    custom_p: 'Кастомные плагины и моды для серверов, переросших рынок. От небольших утилит до целых игровых систем — со скоупом, сметой и одним человеком, который отвечает за результат.',
    custom_btn: 'Написать мне',
    s1h: 'Опишите',
    s1p: 'Пришлите идею, бюджет и дедлайн. Формального ТЗ не нужно — честного абзаца достаточно.',
    s2h: 'Смета',
    s2p: 'В ответ — фиксированная цена, сроки и технический план, обычно в течение дня.',
    s3h: 'Разработка',
    s3p: 'Разработка, тесты на зеркале вашего сервера, выдача с исходниками и документацией.',

    f_sub: 'Тех-администрирование Minecraft и разработка плагинов. Сделано в Самарканде, работает по всему миру.',
    f_site: 'Разделы',
    f_contacts: 'Контакты',
    f_meta: 'Прочее',
    f_works: 'Работы',
    f_custom_l: 'Кастом-работа',
    f_about_l: 'Обо мне',
    f_admin: 'Админ-панель',
    f_top: 'Наверх',
    f_copy: '© 2026 Jefoze — Узбекистан',

    ad_console: 'админ',
    ad_back: 'Вернуться на сайт',
    ad_out: 'Выйти',
    ad_login_t: 'Админ-панель — введите пароль, чтобы продолжить',
    ad_login_ph: 'Пароль',
    ad_login: 'Войти',
    ad_wrong: 'Неверный пароль',
    ad_hint: 'Пароль хранится в виде хеша · сессия живёт до закрытия вкладки',
    ad_ok: 'Панель разблокирована',

    tab_works: 'Работы',
    tab_contacts: 'Контакты',
    tab_stats: 'Статистика',
    tab_images: 'Изображения',
    tab_sec: 'Безопасность',

    w_add: 'Добавить работу',
    w_edit: 'Правка — {n}',
    w_new: 'Новая работа',
    w_name: 'Название',
    w_cat: 'Категория',
    w_gh: 'Ссылка на GitHub',
    w_gh_ph: 'https://github.com/you/project',
    w_short: 'Короткое описание',
    w_img: 'Обложка',
    w_empty: 'Работ пока нет — добавьте первую.',
    b_up: 'Загрузить',
    b_regen: 'Перегенерировать',
    b_cancel: 'Отмена',
    w_save: 'Сохранить работу',
    e_wname: 'Укажите название',
    e_wgh: 'Укажите корректный URL — https://…',
    t_w_added: 'Работа добавлена',
    t_w_updated: 'Работа обновлена',
    t_w_removed: 'Работа удалена',
    arm: 'Точно?',

    c_add: 'Добавить контакт',
    c_edit: 'Правка контакта',
    c_new: 'Новый контакт',
    c_label: 'Название',
    c_label_ph: 'Telegram',
    c_value: 'Значение',
    c_value_ph: '@jefoze',
    c_url: 'Ссылка — необязательно',
    c_url_ph: 'https://t.me/… или mailto:…',
    c_none: 'Контактов пока нет.',
    e_clabel: 'Укажите название',
    e_cval: 'Укажите значение',
    e_curl: 'https:// или mailto: — либо оставьте пустым',
    t_c_added: 'Контакт добавлен',
    t_c_updated: 'Контакт обновлён',
    t_c_removed: 'Контакт удалён',

    st_plugins: 'Плагинов выпущено',
    st_servers: 'Серверов под опекой',
    st_reply: 'Средний ответ',
    st_note: 'Эти три числа показываются в разделе «Обо мне». Суффикс — то, что идёт после числа, например «+» или «ч».',
    st_suf: 'Суффикс',
    st_save: 'Сохранить статистику',
    e_stnum: 'Укажите корректные числа',
    t_stats: 'Статистика обновлена',

    i_hero: 'Фон первого экрана',
    i_hero_d: 'Опциональное изображение под анимированным полем кубов. Сейчас: {x}.',
    i_about: 'Визуал раздела «Обо мне»',
    i_about_d: 'Показывается рядом с биографией. Сейчас: {x}.',
    x_custom: 'своё изображение',
    x_gen: 'только генеративный фон',
    x_genart: 'сгенерированный арт',
    b_rm: 'Убрать',
    t_img: 'Изображение обновлено',

    s_cur: 'Текущий пароль',
    s_new: 'Новый пароль',
    s_new2: 'Повторите новый пароль',
    s_save: 'Сменить пароль',
    e_scur: 'Неверный текущий пароль',
    e_snew: 'Минимум 4 символа',
    e_smatch: 'Пароли не совпадают',
    t_pass: 'Пароль обновлён',
    s_note: 'Пароль не покидает браузер и хранится только в виде хеша — сменить можно здесь в любой момент. Если забудете — очистите данные сайта, вернётся заводской пароль.',

    t_memmode: 'Хранилище недоступно — данные живут до перезагрузки',
    th_light: 'Светлая тема',
    th_dark: 'Тёмная тема'
  }
};

if (!T[LANG]) LANG = 'en';

if (THEME !== 'light' && THEME !== 'dark') {
  THEME = 'dark';
  document.documentElement.dataset.theme = 'dark';
}

const t = k => (T[LANG] && T[LANG][k]) || T.en[k] || k;

const tf = (k, v) => {
  let s = t(k);
  if (v) for (const key in v) s = s.split('{' + key + '}').join(v[key]);
  return s;
};

const loc = v => v == null ? '' : (typeof v === 'object' ? v[LANG] : (v || ''));

const setL = (o, val) => Object.assign({}, (typeof o === 'object' && o) || {}, { [LANG]: val });

let preDone = false;

function finishPre() {
  if (preDone) return;
  preDone = true;
  safe(() => {
    document.body.classList.add('ready');
    const pre = $('#pre');
    if (!pre) return;
    pre.classList.add('done');
    setTimeout(() => {
      pre.remove();
      runScramble();
    }, 600);
  });
}

function initPrePct() {
  safe(() => {
    const p = $('#prePct');
    if (!p) return;
    if (RM) { p.textContent = '100%'; return; }
    const t0 = performance.now();
    const dur = 1850;
    const step = n => {
      if (!document.getElementById('pre')) return;
      const k = Math.min(1, (n - t0) / dur);
      const e = 1 - Math.pow(1 - k, 2);
      p.textContent = String(Math.round(e * 100)).padStart(2, '0') + '%';
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

setTimeout(finishPre, 2100);
if (RM) setTimeout(finishPre, 350);
initPrePct();

const DB = {
  get(k, f) {
    try {
      const v = LS.getItem('jz_' + k);
      return v ? JSON.parse(v) : f;
    } catch (e) { return f; }
  },
  set(k, v) {
    try {
      LS.setItem('jz_' + k, JSON.stringify(v));
      return true;
    } catch (e) {
      toast(t('t_memmode'), 'img');
      return false;
    }
  }
};

const hash = s => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h);
};

const lsSet = (k, v) => { try { LS.setItem(k, v); } catch (e) {} };

function seed() {
  if (!DB.get('v4', null)) {
    ['products', 'deals', 'cart', 'chats', 'orders', 'users', 'session'].forEach(k => {
      try { LS.removeItem('jz_' + k); } catch (e) {}
    });
    DB.set('v4', 1);
  }

  if (!DB.get('works', null)) {
    DB.set('works', [
      {
        id: 'gribcam',
        name: 'GribCam',
        cat: 'Plugin',
        github: 'https://github.com/jefoze/GribCam',
        short: {
          en: 'Advanced cinematic camera system for trailers, replays and spectator feeds.',
          ru: 'Продвинутая система кинематографических камер для трейлеров, реплеев и наблюдения.'
        },
        img: { seed: 11 }
      },
      {
        id: 'gcosmetics',
        name: 'GCosmetics',
        cat: 'Plugin',
        github: 'https://github.com/jefoze/GCosmetics',
        short: {
          en: 'Visual cosmetics across head, back and hand slots — with a built-in GUI editor.',
          ru: 'Визуальная косметика для слотов голова, спина и руки — со встроенным GUI-редактором.'
        },
        img: { seed: 21 }
      },
      {
        id: 'jefguard',
        name: 'JefGuard',
        cat: 'Utility',
        github: 'https://github.com/jefoze/JefGuard',
        short: {
          en: 'Lightweight performance guard: hotspot profiling and safe exploit patching.',
          ru: 'Лёгкий страж производительности: профилирование точек нагрузки и безопасное закрытие эксплойтов.'
        },
        img: { seed: 31 }
      },
      {
        id: 'jefutils',
        name: 'JefUtils',
        cat: 'Utility',
        github: 'https://github.com/jefoze/JefUtils',
        short: {
          en: 'A bundle of small QoL commands and tools every admin actually uses.',
          ru: 'Набор небольших QoL-команд и инструментов, которыми реально пользуются админы.'
        },
        img: { seed: 41 }
      }
    ]);
  }

  if (!DB.get('contacts', null)) {
    DB.set('contacts', [
      { id: 'tg', label: 'Telegram', value: '@jefoze', url: 'https://t.me/jefoze' },
      { id: 'mail', label: 'Email', value: 'hello@jefoze.dev', url: 'mailto:hello@jefoze.dev' }
    ]);
  }

  if (!DB.get('adminpass', null)) DB.set('adminpass', '-1340685460');
}

const S = { works: [], contacts: [], site: {} };

function loadAll() {
  S.works = DB.get('works', []);
  S.contacts = DB.get('contacts', []);
  S.site = Object.assign(
    {
      aboutSeed: 71,
      heroSeed: 5,
      stats: [{ v: 20, suf: '+' }, { v: 12, suf: '' }, { v: 24, suf: 'h' }]
    },
    DB.get('site', {})
  );
}

function normStats(s) {
  const d = [{ v: 20, suf: '+' }, { v: 12, suf: '' }, { v: 24, suf: 'h' }];
  if (!Array.isArray(s) || s.length !== 3) return d;
  return s.map(x => ({
    v: Math.max(0, parseInt(x && x.v, 10) || 0),
    suf: String((x && x.suf) || '').slice(0, 3)
  }));
}

const artCache = {};
const isLight = () => document.documentElement.dataset.theme === 'light';

function art(entry) {
  if (!entry) return art({ seed: 99 });
  if (entry.src) return entry.src;
  const key = (isLight() ? 'L' : 'D') + ':' + entry.seed;
  if (!artCache[key]) artCache[key] = genArt(entry.seed, isLight());
  return artCache[key];
}

function isoCube(x, px, py, s, ang, fill, P) {
  const ux = [Math.cos(ang) * s, Math.sin(ang) * s * .55];
  const vx = [Math.cos(ang + 2.094) * s, Math.sin(ang + 2.094) * s * .55];
  const hgt = s * .82;
  const Pt = (a, b) => [px + a * ux[0] + b * vx[0], py + a * ux[1] + b * vx[1]];

  const O = Pt(0, 0);
  const A = Pt(1, 0);
  const B = Pt(0, 1);
  const Tq = Pt(1, 1);
  const Od = [O[0], O[1] + hgt];
  const Ad = [A[0], A[1] + hgt];
  const Bd = [B[0], B[1] + hgt];

  if (fill) {
    x.beginPath();
    x.moveTo(O[0], O[1]);
    x.lineTo(A[0], A[1]);
    x.lineTo(Tq[0], Tq[1]);
    x.lineTo(B[0], B[1]);
    x.closePath();
    x.fillStyle = P.fill;
    x.fill();
  }

  x.beginPath();
  x.moveTo(O[0], O[1]);
  x.lineTo(A[0], A[1]);
  x.lineTo(Tq[0], Tq[1]);
  x.lineTo(B[0], B[1]);
  x.closePath();
  x.moveTo(O[0], O[1]); x.lineTo(Od[0], Od[1]);
  x.moveTo(A[0], A[1]); x.lineTo(Ad[0], Ad[1]);
  x.moveTo(B[0], B[1]); x.lineTo(Bd[0], Bd[1]);
  x.moveTo(Od[0], Od[1]); x.lineTo(Ad[0], Ad[1]);
  x.moveTo(Od[0], Od[1]); x.lineTo(Bd[0], Bd[1]);
  x.stroke();

  return [Tq, A, B, Ad, Bd];
}

function genArt(sd, light) {
  const w = 960;
  const h = 720;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;

  const x = c.getContext('2d');
  const R = mulberry32(sd * 7919 + 11);

  const P = light ? {
    bg: '#eef1f4',
    grid: 'rgba(28,40,54,.055)',
    base: '38,50,64',
    acc: '10,127,174',
    glowS: 'rgba(255,255,255,.55)',
    fill: 'rgba(10,127,174,.045)',
    vign: 'rgba(28,38,50,.16)'
  } : {
    bg: '#0b0e11',
    grid: 'rgba(255,255,255,.035)',
    base: '205,215,228',
    acc: '150,225,255',
    glowS: 'rgba(150,220,255,.08)',
    fill: 'rgba(150,225,255,.05)',
    vign: 'rgba(0,0,0,.42)'
  };

  x.fillStyle = P.bg;
  x.fillRect(0, 0, w, h);

  let g = x.createRadialGradient(
    w * (.25 + R() * .5), h * (.2 + R() * .35), 0,
    w * .5, h * .5, w * .75
  );
  g.addColorStop(0, P.glowS);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);

  x.strokeStyle = P.grid;
  x.lineWidth = 1;
  x.beginPath();
  const st = 36;
  for (let gx = (R() * st) | 0; gx < w; gx += st) {
    if (R() < .85) { x.moveTo(gx, 0); x.lineTo(gx, h); }
  }
  for (let gy = (R() * st) | 0; gy < h; gy += st) {
    if (R() < .8) { x.moveTo(0, gy); x.lineTo(w, gy); }
  }
  x.stroke();

  const nodes = [];
  const N = 13 + ((R() * 5) | 0);
  for (let i = 0; i < N; i++) {
    const d = R();
    const s = 16 + d * d * 74;
    const px = s * 1.6 + R() * (w - s * 3.2);
    const py = s * 1.4 + R() * (h - s * 2.8);
    const ang = Math.PI / 6 + (R() - .5) * .5;
    const near = d > .62;

    x.strokeStyle = (near && R() < .5)
      ? `rgba(${P.acc},${(.10 + d * .28).toFixed(3)})`
      : `rgba(${P.base},${(.06 + d * .22).toFixed(3)})`;
    x.lineWidth = .7 + d * .9;
    if (R() < .22) x.setLineDash([4, 7]);

    const pts = isoCube(x, px, py, s, ang, near && R() < .35, P);
    x.setLineDash([]);

    if (near) nodes.push({ p: pts[(R() * pts.length) | 0], d });
  }

  x.lineWidth = .7;
  x.strokeStyle = `rgba(${P.acc},.14)`;
  for (let i = 0; i < 3 && nodes.length > 1; i++) {
    const a = nodes[(R() * nodes.length) | 0];
    const b = nodes[(R() * nodes.length) | 0];
    if (a === b) continue;
    x.beginPath();
    x.moveTo(a.p[0], a.p[1]);
    x.lineTo(b.p[0], b.p[1]);
    x.stroke();
  }

  for (const n of nodes) {
    const r = 1.6 + n.d * 1.6;
    const gg = x.createRadialGradient(n.p[0], n.p[1], 0, n.p[0], n.p[1], r * 4);
    gg.addColorStop(0, `rgba(${P.acc},.5)`);
    gg.addColorStop(1, `rgba(${P.acc},0)`);
    x.fillStyle = gg;
    x.beginPath();
    x.arc(n.p[0], n.p[1], r * 4, 0, 7);
    x.fill();

    x.fillStyle = light ? 'rgba(10,90,130,.9)' : 'rgba(205,240,255,.9)';
    x.beginPath();
    x.arc(n.p[0], n.p[1], r * .55, 0, 7);
    x.fill();
  }

  g = x.createRadialGradient(w / 2, h / 2, h * .35, w / 2, h / 2, h * .95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, P.vign);
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);

  return c.toDataURL('image/jpeg', .86);
}

const firstImg = w => w.img || { seed: hsh(w.id) % 99999 + 1 };

class Field {
  constructor(cv) {
    this.cv = cv;
    this.x = cv.getContext('2d');
    this.mx = 0;
    this.my = 0;
    this.tx = 0;
    this.ty = 0;
    this.last = 0;
    this.t = 0;

    this.resize = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.max(1, r.width * d);
      cv.height = Math.max(1, r.height * d);
      this.x.setTransform(d, 0, 0, d, 0, 0);
      this.w = r.width;
      this.h = r.height;
      if (RM) this.draw(0);
    };

    addEventListener('resize', this.resize);
    addEventListener('pointermove', e => {
      this.tx = (e.clientX / innerWidth - .5) * 2;
      this.ty = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

    this.resize();
    this.seedCubes();

    if (RM) this.draw(0);
    else requestAnimationFrame(ts => this.loop(ts));
  }

  seedCubes() {
    const R = mulberry32(20250101);
    const n = innerWidth < 700 ? 22 : 36;
    this.cubes = [];

    for (let i = 0; i < n; i++) {
      const d = .15 + R() * .85;
      this.cubes.push({
        x: R() * this.w,
        y: R() * this.h,
        d,
        s: 12 + Math.pow(d, 1.6) * 66,
        a0: Math.PI / 6 + (R() - .5) * .55,
        ph: R() * 6.28,
        sp: (R() < .5 ? -1 : 1) * (2 + R() * 6) * (.4 + d),
        acc: R() < .24,
        dash: R() < .14
      });
    }

    this.links = [];
    const near = this.cubes.filter(c => c.d > .55);
    for (let i = 0; i < Math.min(7, near.length - 1); i++) {
      const a = near[(R() * near.length) | 0];
      const b = near[(R() * near.length) | 0];
      if (a !== b) this.links.push([a, b]);
    }
  }

  loop(ts) {
    if (document.hidden) {
      this.last = ts;
      requestAnimationFrame(t => this.loop(t));
      return;
    }
    const dt = Math.min(50, ts - (this.last || ts));
    this.last = ts;
    this.t += dt;
    this.mx += (this.tx - this.mx) * .045;
    this.my += (this.ty - this.my) * .045;
    this.draw(dt);
    requestAnimationFrame(t => this.loop(t));
  }

  pos(c) {
    return [c.x + this.mx * c.d * 44, c.y + this.my * c.d * 26];
  }

  draw(dt) {
    const x = this.x;
    const light = isLight();
    const base = light ? '32,44,58' : '205,214,226';
    const acc = light ? '10,127,174' : '150,222,255';

    x.clearRect(0, 0, this.w, this.h);

    for (const c of this.cubes) {
      c.x += c.sp * dt * .001;
      if (c.x < -90) c.x = this.w + 90;
      if (c.x > this.w + 90) c.x = -90;
    }

    x.lineWidth = .7;
    x.strokeStyle = `rgba(${acc},.05)`;
    for (const [a, b] of this.links) {
      const p1 = this.pos(a);
      const p2 = this.pos(b);
      x.beginPath();
      x.moveTo(p1[0], p1[1]);
      x.lineTo(p2[0], p2[1]);
      x.stroke();
    }

    for (const c of this.cubes) {
      const p = this.pos(c);
      const wob = RM ? 0 : Math.sin(this.t * .0006 + c.ph) * (4 + c.d * 8);
      const al = .05 + c.d * .15;
      x.strokeStyle = c.acc
        ? `rgba(${acc},${(al + .05).toFixed(3)})`
        : `rgba(${base},${al.toFixed(3)})`;
      x.lineWidth = .6 + c.d * .75;
      if (c.dash) x.setLineDash([3, 7]);
      isoCube(x, p[0], p[1] + wob, c.s, c.a0 + Math.sin(this.t * .0002 + c.ph) * .06, false, { fill: 'transparent' });
    }

    x.setLineDash([]);
  }
}

const repoPath = u => {
  try {
    const m = String(u || '').match(/^https?:\/\/(?:www\.)?github\.com\/([^\s?#]+)/i);
    if (m) return m[1].replace(/\/+$/, '');
  } catch (e) {}
  return u || '';
};

const spansFor = (i, total) => {
  if (i === 0) return 'c7';
  if (i === 1) return 'c5';
  if (i === total - 1 && total > 2 && total % 2 === 1) return 'c12';
  return 'c6';
};

function renderWorks() {
  safe(() => {
    const g = $('#worksGrid');
    g.innerHTML = '';
    const list = S.works;
    list.forEach((w, i) => g.appendChild(workCard(w, i, list.length)));
    [...g.children].forEach((c, i) => c.style.transitionDelay = Math.min(i * 90, 480) + 'ms');
  });
}

function workCard(w, i, total) {
  const c = el('article', 'pcard ' + spansFor(i, total), `
    <div class="pcard-art">
      <img src="${art(firstImg(w))}" alt="${esc(w.name)}" loading="lazy">
      <div class="pcard-tags">${w.cat ? `<span class="tag">${esc(w.cat)}</span>` : ''}</div>
    </div>
    <div class="pcard-body">
      <h3>${esc(w.name)}</h3>
      <p>${esc(loc(w.short))}</p>
      <div class="pcard-foot">
        <span class="price">${esc(repoPath(w.github))}</span>
        <a class="btn btn-solid btn-sm" href="${esc(w.github || '#')}" target="_blank" rel="noopener">${t('gh_btn')} ${ic('ur', 14)}</a>
      </div>
    </div>`);

  c.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    if (w.github) window.open(w.github, '_blank', 'noopener');
  });

  return c;
}

function renderContacts() {
  safe(() => {
    const col = $('#contactCol');
    col.innerHTML = S.contacts.length
      ? S.contacts.map(c => {
        const lbl = esc(c.label) + (c.value ? ' — ' + esc(c.value) : '');
        if (c.url) return `<a href="${esc(c.url)}" target="_blank" rel="noopener">${lbl}</a>`;
        return `<span class="fc-static">${lbl}</span>`;
      }).join('')
      : `<span class="fc-static mono" style="font-size:11px">${t('c_none')}</span>`;

    const first = S.contacts.find(c => c.url);
    $$('[data-contact-link]').forEach(a => {
      if (first) {
        a.href = first.url;
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        a.removeAttribute('target');
        a.removeAttribute('rel');
        a.href = '#contacts';
      }
    });
  });
}

function renderStats() {
  safe(() => {
    const row = $('#statsRow');
    if (!row) return;
    const st = normStats(S.site.stats);
    row.innerHTML = st.map((s, i) =>
      `<div class="stat"><b data-count="${s.v}" data-suf="${esc(s.suf)}">0</b><span data-i="stat${i + 1}"></span></div>`
    ).join('');
    row.querySelectorAll('[data-i]').forEach(n => {
      const v = t(n.dataset.i);
      if (v != null) n.innerHTML = v;
    });
    if (row.classList.contains('in')) {
      row.querySelectorAll('[data-count]').forEach(countUp);
    }
  });
}

function applyAbout() {
  $('#aboutImg').src = S.site.aboutSrc || art({ seed: S.site.aboutSeed || 71 });
}

function applyHero() {
  const h = $('#heroImgLayer');
  if (S.site.heroSrc) {
    if (!h) {
      const im = el('img');
      im.id = 'heroImgLayer';
      im.className = 'hero-img';
      im.alt = '';
      $('#top').prepend(im);
    }
    h.src = S.site.heroSrc;
  } else if (h) {
    h.remove();
  }
}

let adTab = 'works';

function route() {
  const isAdmin = location.hash === '#admin';
  $('#sitePage').classList.toggle('hidden', isAdmin);
  $('#adminPage').classList.toggle('hidden', !isAdmin);

  if (isAdmin) {
    scrollTo(0, 0);
    (SS.get() === '1') ? renderAdminPanel() : renderAdminGate();
  } else {
    safe(() => dispatchEvent(new Event('resize')));
  }
}

addEventListener('hashchange', () => safe(route));

function renderAdminGate() {
  const r = $('#admRoot');
  r.innerHTML = `
    <div class="gatebox" id="gateBox">
      <div class="brandmark">${ic('cube', 20)}<span>Jefoze</span></div>
      <p class="gatemsg">${t('ad_login_t')}</p>
      <form id="gateForm" novalidate>
        <div class="fld" data-f="pass">
          <label>${t('ad_login_ph')}</label>
          <input type="password" name="pass" autocomplete="current-password" placeholder="••••••••">
          <div class="ferr"></div>
        </div>
        <button class="btn btn-solid wide" type="submit">${t('ad_login')}</button>
      </form>
      <p class="authfine">${t('ad_hint')}</p>
      <a class="gate-back" href="#top">← ${t('ad_back')}</a>
    </div>`;

  r.querySelector('#gateForm').onsubmit = e => {
    e.preventDefault();
    const v = e.target.elements['pass'].value;
    const fl = r.querySelector('[data-f=pass]');
    fl.classList.remove('err');

    if (hash(v) === DB.get('adminpass', '-1340685460')) {
      SS.set('1');
      toast(t('ad_ok'), 'check');
      renderAdminPanel();
    } else {
      fl.classList.add('err');
      fl.querySelector('.ferr').textContent = t('ad_wrong');
      const gb = r.querySelector('#gateBox');
      gb.classList.remove('err');
      void gb.offsetWidth;
      gb.classList.add('err');
    }
  };
}

function renderAdminPanel() {
  const r = $('#admRoot');
  const tabs = [
    ['works', 'tab_works'],
    ['contacts', 'tab_contacts'],
    ['stats', 'tab_stats'],
    ['images', 'tab_images'],
    ['sec', 'tab_sec']
  ];

  r.innerHTML = `
    <div class="admin">
      <div class="ad-top">
        <div class="brand">${ic('cube', 18)}<span>Jefoze</span><span class="adtag">${t('ad_console')}</span></div>
        <div class="ad-topr">
          <a class="btn btn-ghost btn-sm" href="#top">${ic('left', 13)} ${t('ad_back')}</a>
          <button class="btn btn-ghost btn-sm" id="adOut">${ic('out', 13)} ${t('ad_out')}</button>
        </div>
      </div>
      <div class="ad-tabs">
        ${tabs.map(x => `<button class="ad-tab ${adTab === x[0] ? 'on' : ''}" data-t="${x[0]}">${t(x[1])}</button>`).join('')}
      </div>
      <div class="ad-body"><div class="ad-grid" id="adBody"></div></div>
    </div>`;

  r.querySelectorAll('.ad-tab').forEach(b => b.onclick = () => { adTab = b.dataset.t; renderAdminPanel(); });
  r.querySelector('#adOut').onclick = () => { SS.del(); renderAdminGate(); };
  adminBody();
}

function adminBody() {
  if (adTab === 'works') admWorks();
  else if (adTab === 'contacts') admContacts();
  else if (adTab === 'stats') admStats();
  else if (adTab === 'images') admImages();
  else admSec();
}

let wfWork = null;

function admWorks() {
  const b = $('#adBody');
  b.innerHTML = `
    <div class="adhead">
      <span class="eyebrow">${t('tab_works')}</span>
      <button class="btn btn-solid btn-sm" id="addWork">${ic('plus', 14)} ${t('w_add')}</button>
    </div>
    <table class="atable">
      <thead><tr>
        <th></th><th>${t('w_name')}</th><th>${t('w_cat')}</th><th>${t('w_gh')}</th><th></th>
      </tr></thead>
      <tbody>
        ${S.works.map(w => `
          <tr>
            <td class="tthumb"><img src="${art(firstImg(w))}" alt=""></td>
            <td><b>${esc(w.name)}</b><span class="tsub">${esc(loc(w.short))}</span></td>
            <td><span class="tag">${esc(w.cat || '—')}</span></td>
            <td><a class="ghlink" href="${esc(w.github || '#')}" target="_blank" rel="noopener">${esc(repoPath(w.github))}</a></td>
            <td class="tacts">
              <button class="ib" data-edit="${w.id}" aria-label="Edit">${ic('edit', 15)}</button>
              <button class="ib" data-del="${w.id}" aria-label="Delete">${ic('trash', 15)}</button>
            </td>
          </tr>`).join('') || `<tr><td colspan="5" class="tsub" style="padding:22px 12px">${t('w_empty')}</td></tr>`}
      </tbody>
    </table>
    <div id="workForm"></div>`;

  b.querySelector('#addWork').onclick = () => renderWorkForm({
    id: 'w' + Date.now().toString(36),
    name: '',
    cat: '',
    github: '',
    short: { en: '', ru: '' },
    img: { seed: rndSeed() }
  });

  b.querySelectorAll('[data-edit]').forEach(x => x.onclick = () => {
    const w = S.works.find(v => v.id === x.dataset.edit);
    if (w) renderWorkForm(JSON.parse(JSON.stringify(w)));
  });

  b.querySelectorAll('[data-del]').forEach(btn => {
    let armed = false;
    btn.onclick = () => {
      if (!armed) {
        armed = true;
        btn.classList.add('danger');
        btn.textContent = t('arm');
        setTimeout(() => {
          armed = false;
          btn.classList.remove('danger');
          btn.innerHTML = ic('trash', 15);
        }, 2600);
        return;
      }
      S.works = S.works.filter(v => v.id !== btn.dataset.del);
      DB.set('works', S.works);
      renderWorks();
      admWorks();
      toast(t('t_w_removed'), 'trash');
    };
  });
}

function renderWorkForm(w) {
  wfWork = w;
  const b = $('#workForm');
  const isNew = !S.works.some(x => x.id === w.id);

  b.innerHTML = `
    <div class="pform">
      <div class="adhead"><span class="eyebrow">${isNew ? t('w_new') : tf('w_edit', { n: esc(w.name) })}</span></div>
      <div class="pf-grid">
        <div class="fld" data-f="wname">
          <label>${t('w_name')}</label>
          <input id="wfName" value="${esc(w.name)}">
          <div class="ferr"></div>
        </div>
        <div class="fld">
          <label>${t('w_cat')}</label>
          <input id="wfCat" list="catlist" value="${esc(w.cat || '')}" placeholder="Plugin">
          <datalist id="catlist">
            <option>Plugin</option>
            <option>Mod</option>
            <option>Utility</option>
            <option>Other</option>
          </datalist>
        </div>
      </div>
      <div class="fld" data-f="wgh">
        <label>${t('w_gh')}</label>
        <input id="wfGh" inputmode="url" value="${esc(w.github || '')}" placeholder="${t('w_gh_ph')}">
        <div class="ferr"></div>
      </div>
      <div class="fld">
        <label>${t('w_short')}</label>
        <textarea id="wfShort">${esc(loc(w.short))}</textarea>
      </div>
      <div class="fld">
        <label>${t('w_img')}</label>
        <div class="wf-img">
          <img src="${art(firstImg(w))}" alt="">
          <div class="cms-b">
            <button class="btn btn-ghost btn-sm" id="wfUp">${ic('upload', 13)} ${t('b_up')}</button>
            <button class="btn btn-ghost btn-sm" id="wfRe">${ic('refresh', 13)} ${t('b_regen')}</button>
          </div>
        </div>
      </div>
      <div class="pf-actions">
        <button class="btn btn-ghost btn-sm" id="wfCancel">${t('b_cancel')}</button>
        <button class="btn btn-solid btn-sm" id="wfSave">${t('w_save')}</button>
      </div>
    </div>`;

  b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  b.querySelector('#wfCancel').onclick = () => { b.innerHTML = ''; wfWork = null; };

  b.querySelector('#wfRe').onclick = () => {
    wfWork = Object.assign({}, wfWork, wfCollect());
    wfWork.img = { seed: rndSeed() };
    renderWorkForm(wfWork);
  };

  b.querySelector('#wfUp').onclick = () => {
    pickImage(src => {
      wfWork = Object.assign({}, wfWork, wfCollect());
      wfWork.img = { src };
      renderWorkForm(wfWork);
    });
  };

  b.querySelector('#wfSave').onclick = saveWork;
}

function wfCollect() {
  const f = $('#workForm');
  return {
    name: f.querySelector('#wfName').value.trim(),
    cat: f.querySelector('#wfCat').value.trim(),
    github: f.querySelector('#wfGh').value.trim(),
    short: f.querySelector('#wfShort').value.trim()
  };
}

function saveWork() {
  const f = $('#workForm');
  const d = wfCollect();

  const err = (k, m) => {
    const fl = f.querySelector(`[data-f="${k}"]`);
    fl.classList.add('err');
    fl.querySelector('.ferr').textContent = m;
  };

  f.querySelectorAll('.fld').forEach(x => x.classList.remove('err'));

  let ok = true;
  if (d.name.length < 2) { err('wname', t('e_wname')); ok = false; }
  if (!/^https?:\/\/.+/i.test(d.github)) { err('wgh', t('e_wgh')); ok = false; }
  if (!ok) return;

  wfWork = Object.assign({}, wfWork);
  wfWork.name = d.name;
  wfWork.cat = d.cat;
  wfWork.github = d.github;
  wfWork.short = setL(wfWork.short, d.short);

  const i = S.works.findIndex(x => x.id === wfWork.id);
  if (i >= 0) S.works[i] = wfWork;
  else S.works.push(wfWork);

  DB.set('works', S.works);
  renderWorks();
  admWorks();
  toast(i >= 0 ? t('t_w_updated') : t('t_w_added'));
}

let cfWork = null;

function admContacts() {
  const b = $('#adBody');
  b.innerHTML = `
    <div class="adhead">
      <span class="eyebrow">${t('tab_contacts')}</span>
      <button class="btn btn-solid btn-sm" id="addContact">${ic('plus', 14)} ${t('c_add')}</button>
    </div>
    <div class="threads">
      ${S.contacts.length ? S.contacts.map(c => `
        <div class="thread">
          <div class="t-main">
            <span class="ttype">${c.url ? esc(c.url) : '—'}</span>
            <span class="t-title">${esc(c.label)}</span>
            <span class="t-prev">${esc(c.value || '')}</span>
          </div>
          <button class="ib" data-edit="${c.id}" aria-label="Edit">${ic('edit', 15)}</button>
          <button class="ib" data-del="${c.id}" aria-label="Delete">${ic('trash', 15)}</button>
        </div>`).join('') : `<p class="tsub" style="padding:22px 16px">${t('c_none')}</p>`}
    </div>
    <div id="contactForm"></div>`;

  b.querySelector('#addContact').onclick = () => renderContactForm({
    id: 'c' + Date.now().toString(36),
    label: '',
    value: '',
    url: ''
  });

  b.querySelectorAll('[data-edit]').forEach(x => x.onclick = () => {
    const c = S.contacts.find(v => v.id === x.dataset.edit);
    if (c) renderContactForm(Object.assign({}, c));
  });

  b.querySelectorAll('[data-del]').forEach(btn => {
    let armed = false;
    btn.onclick = () => {
      if (!armed) {
        armed = true;
        btn.classList.add('danger');
        btn.textContent = t('arm');
        setTimeout(() => {
          armed = false;
          btn.classList.remove('danger');
          btn.innerHTML = ic('trash', 15);
        }, 2600);
        return;
      }
      S.contacts = S.contacts.filter(v => v.id !== btn.dataset.del);
      DB.set('contacts', S.contacts);
      renderContacts();
      admContacts();
      toast(t('t_c_removed'), 'trash');
    };
  });
}

function renderContactForm(c) {
  cfWork = c;
  const b = $('#contactForm');
  const isNew = !S.contacts.some(x => x.id === c.id);

  b.innerHTML = `
    <div class="pform">
      <div class="adhead"><span class="eyebrow">${isNew ? t('c_new') : t('c_edit')}</span></div>
      <div class="pf-grid">
        <div class="fld" data-f="clabel">
          <label>${t('c_label')}</label>
          <input id="cfLabel" value="${esc(c.label)}" placeholder="${t('c_label_ph')}">
          <div class="ferr"></div>
        </div>
        <div class="fld" data-f="cvalue">
          <label>${t('c_value')}</label>
          <input id="cfValue" value="${esc(c.value)}" placeholder="${t('c_value_ph')}">
          <div class="ferr"></div>
        </div>
      </div>
      <div class="fld" data-f="curl">
        <label>${t('c_url')}</label>
        <input id="cfUrl" inputmode="url" value="${esc(c.url || '')}" placeholder="${t('c_url_ph')}">
        <div class="ferr"></div>
      </div>
      <div class="pf-actions">
        <button class="btn btn-ghost btn-sm" id="cfCancel">${t('b_cancel')}</button>
        <button class="btn btn-solid btn-sm" id="cfSave">${t('c_add')}</button>
      </div>
    </div>`;

  b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  b.querySelector('#cfCancel').onclick = () => { b.innerHTML = ''; cfWork = null; };
  b.querySelector('#cfSave').onclick = saveContact;
}

function saveContact() {
  const f = $('#contactForm');
  const d = {
    label: f.querySelector('#cfLabel').value.trim(),
    value: f.querySelector('#cfValue').value.trim(),
    url: f.querySelector('#cfUrl').value.trim()
  };

  const err = (k, m) => {
    const fl = f.querySelector(`[data-f="${k}"]`);
    fl.classList.add('err');
    fl.querySelector('.ferr').textContent = m;
  };

  f.querySelectorAll('.fld').forEach(x => x.classList.remove('err'));

  let ok = true;
  if (d.label.length < 1) { err('clabel', t('e_clabel')); ok = false; }
  if (d.value.length < 1) { err('cvalue', t('e_cval')); ok = false; }
  if (d.url && !/^(https?:\/\/|mailto:).+/i.test(d.url)) { err('curl', t('e_curl')); ok = false; }
  if (!ok) return;

  cfWork = Object.assign({}, cfWork, d);
  const i = S.contacts.findIndex(x => x.id === cfWork.id);
  if (i >= 0) S.contacts[i] = cfWork;
  else S.contacts.push(cfWork);

  DB.set('contacts', S.contacts);
  renderContacts();
  admContacts();
  toast(i >= 0 ? t('t_c_updated') : t('t_c_added'));
}

function admStats() {
  const b = $('#adBody');
  const st = normStats(S.site.stats);
  const keys = ['st_plugins', 'st_servers', 'st_reply'];

  b.innerHTML = `
    <div class="adhead"><span class="eyebrow">${t('tab_stats')}</span></div>
    <p class="adnote">${t('st_note')}</p>
    <div class="pform">
      ${keys.map((k, i) => `
        <div class="fld" data-f="st${i}">
          <label>${t(k)}</label>
          <div class="st-row">
            <input id="stV${i}" inputmode="numeric" value="${st[i].v}" placeholder="0">
            <input id="stS${i}" value="${esc(st[i].suf)}" placeholder="${t('st_suf')}">
          </div>
          <div class="ferr"></div>
        </div>`).join('')}
      <div class="pf-actions">
        <button class="btn btn-solid btn-sm" id="stSave">${t('st_save')}</button>
      </div>
    </div>`;

  b.querySelector('#stSave').onclick = () => {
    b.querySelectorAll('.fld').forEach(x => x.classList.remove('err'));

    const err = (k, m) => {
      const fl = b.querySelector(`[data-f="${k}"]`);
      fl.classList.add('err');
      fl.querySelector('.ferr').textContent = m;
    };

    let ok = true;
    for (let i = 0; i < 3; i++) {
      if (b.querySelector('#stV' + i).value.trim() === '') {
        err('st' + i, t('e_stnum'));
        ok = false;
      }
    }
    if (!ok) return;

    S.site.stats = [0, 1, 2].map(i => ({
      v: Math.max(0, parseInt(b.querySelector('#stV' + i).value.replace(/[^\d]/g, '') || '0', 10)),
      suf: b.querySelector('#stS' + i).value.trim().slice(0, 3)
    }));

    DB.set('site', S.site);
    renderStats();
    toast(t('t_stats'), 'check');
  };
}

function admImages() {
  const b = $('#adBody');
  const s = S.site;

  const slot = (img, style, title, desc, btns) => `
    <div class="cmsslot">
      <img src="${img}" alt="" style="${style}">
      <div class="cms-main">
        <h5>${title}</h5>
        <p>${desc}</p>
      </div>
      <div class="cms-b">${btns}</div>
    </div>`;

  b.innerHTML = `
    <div class="adhead"><span class="eyebrow">${t('tab_images')}</span></div>
    <div class="cmsgrid">
      ${slot(
        s.heroSrc ? s.heroSrc : art({ seed: s.heroSeed || 5 }),
        s.heroSrc ? '' : 'opacity:.4',
        t('i_hero'),
        tf('i_hero_d', { x: s.heroSrc ? t('x_custom') : t('x_gen') }),
        `<button class="btn btn-ghost btn-sm" data-c="heroUp">${ic('upload', 13)} ${t('b_up')}</button>
         <button class="btn btn-ghost btn-sm" data-c="heroRm" ${s.heroSrc ? '' : 'disabled'}>${t('b_rm')}</button>`
      )}
      ${slot(
        s.aboutSrc ? s.aboutSrc : art({ seed: s.aboutSeed || 71 }),
        '',
        t('i_about'),
        tf('i_about_d', { x: s.aboutSrc ? t('x_custom') : t('x_genart') }),
        `<button class="btn btn-ghost btn-sm" data-c="aboutRe">${ic('refresh', 13)} ${t('b_regen')}</button>
         <button class="btn btn-ghost btn-sm" data-c="aboutUp">${ic('upload', 13)} ${t('b_up')}</button>
         <button class="btn btn-ghost btn-sm" data-c="aboutRm" ${s.aboutSrc ? '' : 'disabled'}>${t('b_rm')}</button>`
      )}
    </div>`;

  b.querySelectorAll('[data-c]').forEach(btn => btn.onclick = () => {
    const a = btn.dataset.c;
    if (a === 'heroUp') pickImage(src => { S.site.heroSrc = src; DB.set('site', S.site); applyHero(); admImages(); toast(t('t_img'), 'img'); });
    if (a === 'heroRm') { delete S.site.heroSrc; DB.set('site', S.site); applyHero(); admImages(); }
    if (a === 'aboutRe') { delete S.site.aboutSrc; S.site.aboutSeed = rndSeed(); DB.set('site', S.site); applyAbout(); admImages(); }
    if (a === 'aboutUp') pickImage(src => { S.site.aboutSrc = src; DB.set('site', S.site); applyAbout(); admImages(); toast(t('t_img'), 'img'); });
    if (a === 'aboutRm') { delete S.site.aboutSrc; DB.set('site', S.site); applyAbout(); admImages(); }
  });
}

function pickImage(cb) {
  const inp = el('input');
  inp.type = 'file';
  inp.accept = 'image/*';

  inp.onchange = () => {
    const f = inp.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1400;
        const sc = Math.min(1, max / img.width);
        const c = document.createElement('canvas');
        c.width = Math.max(1, (img.width * sc) | 0);
        c.height = Math.max(1, (img.height * sc) | 0);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', .82));
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  };

  inp.click();
}

function admSec() {
  const b = $('#adBody');

  b.innerHTML = `
    <div class="adhead"><span class="eyebrow">${t('tab_sec')}</span></div>
    <p class="adnote">${t('s_note')}</p>
    <div class="pform">
      <form id="passForm" novalidate>
        <div class="fld" data-f="cur">
          <label>${t('s_cur')}</label>
          <input type="password" id="spCur" autocomplete="current-password">
          <div class="ferr"></div>
        </div>
        <div class="fld" data-f="new">
          <label>${t('s_new')}</label>
          <input type="password" id="spNew" autocomplete="new-password">
          <div class="ferr"></div>
        </div>
        <div class="fld" data-f="new2">
          <label>${t('s_new2')}</label>
          <input type="password" id="spNew2" autocomplete="new-password">
          <div class="ferr"></div>
        </div>
        <button class="btn btn-solid wide" type="submit">${t('s_save')}</button>
      </form>
    </div>`;

  b.querySelector('#passForm').onsubmit = e => {
    e.preventDefault();
    const f = e.target;
    const cur = f.querySelector('#spCur').value;
    const nw = f.querySelector('#spNew').value;
    const nw2 = f.querySelector('#spNew2').value;

    const err = (k, m) => {
      const fl = f.querySelector(`[data-f="${k}"]`);
      fl.classList.add('err');
      fl.querySelector('.ferr').textContent = m;
    };

    f.querySelectorAll('.fld').forEach(x => x.classList.remove('err'));

    let ok = true;
    if (hash(cur) !== DB.get('adminpass', '-1340685460')) { err('cur', t('e_scur')); ok = false; }
    if (nw.length < 4) { err('new', t('e_snew')); ok = false; }
    if (nw !== nw2) { err('new2', t('e_smatch')); ok = false; }
    if (!ok) return;

    DB.set('adminpass', hash(nw));
    f.reset();
    toast(t('t_pass'), 'check');
  };
}

function applyI18n() {
  $$('[data-i]').forEach(n => {
    const v = t(n.dataset.i);
    if (v != null) n.innerHTML = v;
  });
}

function renderMarquee() {
  const tr = $('#mqTrack');
  tr.innerHTML = '';
  for (let g = 0; g < 2; g++) {
    const grp = el('div', 'mq-grp');
    T[LANG].mq.forEach(m => {
      grp.appendChild(el('span', 'mq-item', esc(m)));
      grp.appendChild(el('i'));
    });
    tr.appendChild(grp);
  }
}

function updateLangUI() {
  document.documentElement.dataset.lang = LANG;
  const sw = $('#lsw');
  sw.classList.toggle('on-ru', LANG === 'ru');
  sw.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.l === LANG));
}

function setLang(l, quiet) {
  LANG = l;
  lsSet('jz_lang', l);
  updateLangUI();
  applyI18n();
  renderMarquee();
  renderWorks();
  renderContacts();
  renderStats();

  if (location.hash === '#admin' && !$('#adminPage').classList.contains('hidden')) {
    if (SS.get() === '1') renderAdminPanel();
    else renderAdminGate();
  }

  runScramble();
  if (!quiet) toast(l === 'ru' ? 'Язык: русский' : 'Language: English', 'img');
}

function setTheme(th, quiet) {
  THEME = th;
  document.documentElement.dataset.theme = th;
  lsSet('jz_theme', th);
  renderWorks();
  applyAbout();

  if (location.hash === '#admin' && !$('#adminPage').classList.contains('hidden') && SS.get() === '1') {
    renderAdminPanel();
  }

  if (!quiet) toast(th === 'light' ? t('th_light') : t('th_dark'), 'refresh');
}

function runScramble() {
  safe(() => {
    const eb = $('#heroEb');
    if (!eb) return;
    const txt = t('hero_eyebrow');
    if (RM) { eb.textContent = txt; return; }

    const CH = '#/\\<>[]{}=+*—';
    const N = txt.length;
    const revealAt = [...txt].map((_, i) => Math.floor((i / N) * 14 + Math.random() * 10));
    let f = 0;

    clearInterval(eb._si);
    eb._si = setInterval(() => {
      f++;
      let out = '';
      for (let i = 0; i < N; i++) {
        const c = txt[i];
        if (c === ' ' || c === '·') { out += c; continue; }
        out += f >= revealAt[i] ? c : CH[(Math.random() * CH.length) | 0];
      }
      eb.textContent = out;
      if (f > 26) {
        clearInterval(eb._si);
        eb.textContent = txt;
      }
    }, 30);
  });
}

function countUp(elm) {
  const target = +elm.dataset.count;
  const suf = elm.dataset.suf || '';
  if (RM) { elm.textContent = target + suf; return; }

  const t0 = performance.now();
  const dur = 1200;
  const step = n => {
    const p = Math.min(1, (n - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    elm.textContent = Math.round(target * e) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('in');
    if (e.target.hasAttribute('data-countg')) {
      e.target.querySelectorAll('[data-count]').forEach(countUp);
    }
    io.unobserve(e.target);
  }
}), { threshold: .12 });

function observeReveals() {
  $$('[data-rev],[data-rev-group]').forEach(n => {
    if (n.dataset.obs) return;
    n.dataset.obs = '1';
    if (n.hasAttribute('data-rev-group')) {
      [...n.children].forEach((c, i) => c.style.transitionDelay = Math.min(i * 90, 480) + 'ms');
    }
    io.observe(n);
  });
}

function onScroll() {
  $('#nav').classList.toggle('scrolled', scrollY > 24);

  const max = document.documentElement.scrollHeight - innerHeight || 1;
  $('#prog').style.transform = 'scaleX(' + Math.min(1, scrollY / max) + ')';

  $$('[data-px]').forEach(n => {
    const r = n.getBoundingClientRect();
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    n.style.transform = `translateY(${(p * 36).toFixed(1)}px)`;
  });

  $$('[data-px2]').forEach(n => {
    const r = n.getBoundingClientRect();
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    n.style.transform = `translateY(${(p * 60).toFixed(1)}px)`;
  });
}

function initCursor() {
  if (!matchMedia('(pointer:fine)').matches || RM) return;
  document.documentElement.classList.add('fine');

  const d = el('div', 'cur-dot');
  const r = el('div', 'cur-ring');
  document.body.append(d, r);

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let rx = x;
  let ry = y;

  addEventListener('pointermove', e => {
    x = e.clientX;
    y = e.clientY;
    d.style.opacity = r.style.opacity = 1;
    d.style.transform = `translate(${x}px,${y}px)`;
    const hov = e.target.closest('a,button,input,textarea,select,.pcard,.lsw');
    r.classList.toggle('hov', !!hov);
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    d.style.opacity = r.style.opacity = 0;
  });

  addEventListener('pointerdown', () => r.classList.add('dn'));
  addEventListener('pointerup', () => r.classList.remove('dn'));

  (function loop() {
    rx += (x - rx) * .16;
    ry += (y - ry) * .16;
    r.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
}

function initMagnet() {
  if (RM) return;
  let cur = null;

  const reset = b => {
    if (!b) return;
    b.style.transition = '';
    b.style.transform = '';
  };

  document.addEventListener('pointermove', e => {
    if (!matchMedia('(pointer:fine)').matches) return;
    const b = e.target.closest('.btn-solid');
    if (cur && cur !== b) { reset(cur); cur = null; }
    if (b) {
      if (cur !== b) {
        cur = b;
        b.style.transition = 'transform .16s ease, background .3s, color .3s, border-color .3s';
      }
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.transform = `translate(${(dx * 7).toFixed(1)}px,${(dy * 5).toFixed(1)}px)`;
    }
  });

  document.addEventListener('pointerout', e => {
    const b = e.target.closest('.btn-solid');
    if (b && b === cur && !(e.relatedTarget && b.contains(e.relatedTarget))) {
      reset(b);
      cur = null;
    }
  });
}

function initTilt() {
  if (RM) return;
  let cur = null;

  const reset = c => {
    if (!c) return;
    c.classList.remove('tilting');
    c.style.transform = '';
  };

  document.addEventListener('pointermove', e => {
    if (!matchMedia('(pointer:fine)').matches) return;
    const c = e.target.closest('.pcard');
    if (cur && cur !== c) { reset(cur); cur = null; }
    if (c) {
      if (cur !== c) { cur = c; c.classList.add('tilting'); }
      const r = c.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      c.style.transform = `perspective(900px) rotateX(${(-dy * 3).toFixed(2)}deg) rotateY(${(dx * 4).toFixed(2)}deg) translateY(-5px)`;
    }
  }, { passive: true });

  document.addEventListener('pointerout', e => {
    const c = e.target.closest('.pcard');
    if (c && c === cur && !(e.relatedTarget && c.contains(e.relatedTarget))) {
      reset(c);
      cur = null;
    }
  });
}

function wireEvents() {
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('#burger').onclick = () => $('#mmenu').classList.toggle('on');
  $$('#mmenu a').forEach(a => a.onclick = () => $('#mmenu').classList.remove('on'));
  $('#themeBtn').onclick = () => setTheme(THEME === 'dark' ? 'light' : 'dark');

  $('#lsw').querySelectorAll('button').forEach(b => b.onclick = () => {
    if (b.dataset.l !== LANG) setLang(b.dataset.l);
  });
}

addEventListener('storage', e => {
  if (!e.key || e.key.indexOf('jz_') !== 0) return;
  safe(() => {
    loadAll();
    renderWorks();
    renderContacts();
    renderStats();
    applyAbout();
    applyHero();
    if (location.hash === '#admin' && !$('#adminPage').classList.contains('hidden') && SS.get() === '1') {
      renderAdminPanel();
    }
  });
});

function init() {
  safe(seed);
  safe(loadAll);

  safe(() => {
    $$('#wordmark span').forEach(s => {
      s.addEventListener('animationend', () => {
        s.style.animation = 'none';
        s.classList.add('wmin');
      }, { once: true });
    });
  });

  safe(updateLangUI);
  safe(renderMarquee);
  safe(applyI18n);
  safe(renderWorks);
  safe(renderContacts);
  safe(renderStats);
  safe(applyAbout);
  safe(applyHero);
  safe(observeReveals);
  safe(() => new Field($('#field')));
  safe(initCursor);
  safe(initMagnet);
  safe(initTilt);
  safe(wireEvents);
  safe(route);

  if (MEMMODE) setTimeout(() => toast(t('t_memmode'), 'img'), 2600);
}

try {
  init();
} catch (e) {
  console.error('[jz] init failed:', e);
}