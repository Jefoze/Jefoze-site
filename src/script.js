(function(){
  'use strict';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- element refs ---------- */
  var d=document.getElementById('soc'),
      closeBtn=document.getElementById('soc-close'),
      navEl=document.getElementById('nav'),
      burger=document.getElementById('burger'),
      themeBtn=document.getElementById('theme-btn'),
      langBtn=document.getElementById('lang-btn'),
      tw=document.getElementById('tw'),
      cu=document.querySelector('.cubes'),
      bar=document.querySelector('.pg'),
      hd=document.querySelector('header'),
      titleEl=document.querySelector('title'),
      metaDesc=document.querySelector('meta[name="description"]'),
      metaTheme=document.querySelector('meta[name="theme-color"]'),
      ogT=document.querySelector('meta[property="og:title"]'),
      ogD=document.querySelector('meta[property="og:description"]');

  /* ---------- i18n ---------- */
  var I18N={
    ru:{
      title:'Jefoze — разработчик плагинов для Minecraft',
      desc:'Александр (Jefoze) — разработчик плагинов для Minecraft, уровень Middle. Проекты: GribCam, GCosmetics, JefTrade, JefCoins.',
      'nav.label':'Разделы','nav.about':'Обо мне','nav.projects':'Проекты','nav.prices':'Цены','nav.contacts':'Контакты',
      'theme.toDark':'Включить тёмную тему','theme.toLight':'Включить светлую тему',
      'lang.toEn':'Switch to English','lang.toRu':'Переключить на русский',
      'menu.label':'Меню',
      'hero.lead':'Александр, 16 лет. Пишу и настраиваю <b>плагины для Minecraft</b>. Уровень — Middle.',
      'hero.doing':'Сейчас делаю:','hero.btn':'Я в соцсетях',
      'hero.chip1':'Узбекистан','hero.chip2':'12–16 часов в неделю','hero.chip3':'Paper 1.21.6+',
      'hero.cubes':'Стопка кубов — по одному на каждый плагин',
      'ticker.end':'Minecraft-плагины',
      'about.h2':'Пишу плагины, которые работают на сервере без сюрпризов',
      'about.p1':'Меня зовут Александр, мне 16 лет, я живу в Узбекистане. Специализируюсь на разработке и конфигурации плагинов для Minecraft-серверов. Мой уровень — Middle: беру задачи от простой настройки до готовой игровой системы.',
      'about.p2':'Работаю один и отвечаю за результат целиком: от обсуждения задачи до финальной проверки. Могу уделять заказам 12–16 часов в неделю.',
      'about.plugins':'плагина','about.s1':'уровень разработчика','about.s2':'в портфолио','about.s3':'свободно в неделю',
      'projects.h2':'Мои проекты','projects.sub':'Четыре плагина, написанные для Minecraft-серверов.',
      'proj.gcam':'Плагин для работы с камерами в игре с помощью компьютера.',
      'proj.gcos':'Косметические предметы для игроков: их можно надеть на голову, спину и руку.',
      'proj.trade':'Безопасный обмен между игроками через удобное меню. Поддерживает предметы, валюту и опыт, защищает от дюпов и скама.',
      'proj.coins':'Современный плагин экономики для Paper 1.21.6+. Помогает удобно управлять валютой на сервере.',
      'tag.cameras':'Камеры','tag.closed':'Закрытый код','tag.cosmetics':'Косметика','tag.currency':'Валюта','tag.economy':'Экономика','tag.open':'Открытый код',
      'projects.note':'<b>Почему GribCam и GCosmetics закрыты.</b> Эти плагины сделаны на заказ, и заказчик попросил сохранить исходный код конфиденциальным. Код JefTrade и JefCoins открыт — его можно посмотреть на <a href="https://github.com/Jefoze" target="_blank" rel="noopener">GitHub</a>.',
      'prices.h2':'Услуги и цены','prices.sub':'Итоговая цена зависит от задачи и сложности плагина. Называю её до начала работы.',
      'price.setup':'Установка и настройка','price.setup1':'Установлю плагин и полностью настрою его под ваш сервер.','price.setup2':'Цена зависит от объёма настройки.',
      'price.dev':'Разработка плагина','price.dev1':'Напишу плагин под вашу идею — от небольшой утилиты до сложной системы.','price.dev2':'Цена зависит от сложности плагина.',
      'price.badge':'Популярно',
      'steps.1b':'Опишите задачу','steps.1s':'Что должен делать плагин, на какой версии сервера и в какие сроки.',
      'steps.2b':'Согласуем цену','steps.2s':'Я оцениваю сложность и называю стоимость до начала работы.',
      'steps.3b':'Получите результат','steps.3s':'Разрабатываю, проверяю и передаю готовый плагин.',
      'contacts.h2':'Есть идея для плагина?','contacts.sub':'Напишите, что нужно сделать или настроить, — я оценю задачу и отвечу с ценой. Все контакты — по кнопке.',
      'footer.copy':'© 2026 Jefoze — Узбекистан','footer.top':'Наверх',
      'dlg.title':'Я в соцсетях','dlg.close':'Закрыть','dlg.site':'Сайт',
      typeWords:['плагины для Paper','GUI-меню для игроков','экономику сервера','защиту от дюпов и скама','камеры для игры']
    },
    en:{
      title:'Jefoze — Minecraft plugin developer',
      desc:'Alexander (Jefoze) — Minecraft plugin developer, Middle level. Projects: GribCam, GCosmetics, JefTrade, JefCoins.',
      'nav.label':'Sections','nav.about':'About','nav.projects':'Projects','nav.prices':'Pricing','nav.contacts':'Contacts',
      'theme.toDark':'Switch to dark theme','theme.toLight':'Switch to light theme',
      'lang.toEn':'Switch to English','lang.toRu':'Переключить на русский',
      'menu.label':'Menu',
      'hero.lead':'Alexander, 16 years old. I write and configure <b>Minecraft plugins</b>. Level — Middle.',
      'hero.doing':'Currently working on:','hero.btn':'My socials',
      'hero.chip1':'Uzbekistan','hero.chip2':'12–16 hours a week','hero.chip3':'Paper 1.21.6+',
      'hero.cubes':'A stack of cubes — one per plugin',
      'ticker.end':'Minecraft plugins',
      'about.h2':'I write plugins that run on your server without surprises',
      'about.p1':"My name is Alexander, I'm 16 and I live in Uzbekistan. I specialize in developing and configuring plugins for Minecraft servers. My level is Middle: I take on tasks from simple setup to a complete game system.",
      'about.p2':'I work alone and own the result from start to finish: from discussing the task to final testing. I can spend 12–16 hours a week on orders.',
      'about.plugins':'plugins','about.s1':'developer level','about.s2':'in portfolio','about.s3':'free per week',
      'projects.h2':'My projects','projects.sub':'Four plugins built for Minecraft servers.',
      'proj.gcam':'A plugin for working with in-game cameras from your computer.',
      'proj.gcos':'Cosmetic items for players: wear them on the head, back or hand.',
      'proj.trade':'Safe player-to-player trading through a convenient menu. Supports items, currency and XP, protects against dupes and scams.',
      'proj.coins':'A modern economy plugin for Paper 1.21.6+. Makes server currency easy to manage.',
      'tag.cameras':'Cameras','tag.closed':'Closed source','tag.cosmetics':'Cosmetics','tag.currency':'Currency','tag.economy':'Economy','tag.open':'Open source',
      'projects.note':'<b>Why GribCam and GCosmetics are closed.</b> These plugins were commissioned, and the client asked to keep the source code private. The code of JefTrade and JefCoins is open — you can browse it on <a href="https://github.com/Jefoze" target="_blank" rel="noopener">GitHub</a>.',
      'prices.h2':'Services & pricing','prices.sub':"The final price depends on the task and the plugin's complexity. I quote it before any work starts.",
      'price.setup':'Setup & configuration','price.setup1':"I'll install a plugin and fully configure it for your server.",'price.setup2':'Price depends on the amount of configuration.',
      'price.dev':'Plugin development','price.dev1':"I'll write a plugin for your idea — from a small utility to a complex system.",'price.dev2':"Price depends on the plugin's complexity.",
      'price.badge':'Popular',
      'steps.1b':'Describe the task','steps.1s':'What the plugin should do, for which server version and by what deadline.',
      'steps.2b':'We agree on the price','steps.2s':'I assess the complexity and quote a price before any work begins.',
      'steps.3b':'You get the result','steps.3s':'I develop, test and hand over the finished plugin.',
      'contacts.h2':'Got an idea for a plugin?','contacts.sub':"Tell me what needs to be built or configured — I'll assess the task and reply with a price. All contacts are behind the button.",
      'footer.copy':'© 2026 Jefoze — Uzbekistan','footer.top':'Back to top',
      'dlg.title':'My socials','dlg.close':'Close','dlg.site':'Website',
      typeWords:['Paper plugins','player GUI menus','server economy','protection from dupes and scams','in-game cameras']
    }
  };
  var cur={lang:document.documentElement.lang==='en'?'en':'ru'};
  function t(k){return (I18N[cur.lang]&&I18N[cur.lang][k])||I18N.ru[k]||k}

  function syncUI(){
    var isDark=document.documentElement.getAttribute('data-theme')==='dark';
    themeBtn.innerHTML='<span aria-hidden="true">'+(isDark?'☀':'☾')+'</span>';
    themeBtn.setAttribute('aria-label',t(isDark?'theme.toLight':'theme.toDark'));
    langBtn.textContent=cur.lang==='ru'?'EN':'RU';
    langBtn.setAttribute('aria-label',t(cur.lang==='ru'?'lang.toEn':'lang.toRu'));
  }

  function applyLang(){
    document.documentElement.lang=cur.lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.dataset.i18n)});
    document.querySelectorAll('[data-i18n-html]').forEach(function(el){el.innerHTML=t(el.dataset.i18nHtml)});
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el){el.setAttribute('aria-label',t(el.dataset.i18nAria))});
    titleEl.textContent=t('title');
    metaDesc.setAttribute('content',t('desc'));
    ogT.setAttribute('content',t('title'));
    ogD.setAttribute('content',t('desc'));
    if(cu)cu.setAttribute('aria-label',t('hero.cubes'));
    syncUI();
    typeStart();
    try{localStorage.setItem('jz-lang',cur.lang)}catch(e){}
  }

  function applyTheme(th){
    document.documentElement.setAttribute('data-theme',th);
    metaTheme.setAttribute('content',th==='dark'?'#141b17':'#f6f3ec');
    try{localStorage.setItem('jz-theme',th)}catch(e){}
    syncUI();
  }

  var langBusy=false;
  langBtn.addEventListener('click',function(){
    if(langBusy)return;
    if(reduce){cur.lang=cur.lang==='ru'?'en':'ru';applyLang();return}
    langBusy=true;
    document.body.classList.add('lang-out');
    setTimeout(function(){
      cur.lang=cur.lang==='ru'?'en':'ru';
      applyLang();
      document.body.classList.remove('lang-out');
      langBtn.classList.remove('pop');void langBtn.offsetWidth;langBtn.classList.add('pop');
      langBusy=false;
    },220);
  });
  themeBtn.addEventListener('click',function(){applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')});

  /* ---------- dialog ---------- */
  document.querySelectorAll('.js-soc').forEach(function(b){b.addEventListener('click',function(){if(d.showModal){d.showModal()}else{d.setAttribute('open','')}})});
  closeBtn.addEventListener('click',function(){d.close()});
  d.addEventListener('click',function(e){if(e.target===d){d.close()}});

  /* ---------- mobile menu ---------- */
  function setMenu(open){navEl.classList.toggle('open',open);burger.setAttribute('aria-expanded',open?'true':'false')}
  burger.addEventListener('click',function(){setMenu(!navEl.classList.contains('open'))});
  navEl.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
  document.addEventListener('click',function(e){if(navEl.classList.contains('open')&&!e.target.closest('header'))setMenu(false)});
  addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
  addEventListener('resize',function(){if(innerWidth>820)setMenu(false)});

  /* ---------- scroll reveals + counters ---------- */
  var els=[];
  document.querySelectorAll('[data-rv]').forEach(function(e){e.classList.add('rv');if(e.dataset.rv)e.classList.add(e.dataset.rv);els.push(e)});
  document.querySelectorAll('[data-rvc]').forEach(function(g){[].forEach.call(g.children,function(c,i){c.classList.add('rv',g.dataset.rvc);c.style.setProperty('--d',(i*.1)+'s');els.push(c)})});
  function count(el){el.querySelectorAll('[data-n]').forEach(function(s){var n=+s.dataset.n,t0=null;function f(x){if(!t0)t0=x;var p=Math.min((x-t0)/1100,1);s.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}s.textContent=0;requestAnimationFrame(f)})}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');count(en.target);io.unobserve(en.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){io.observe(e)});
  }else{els.forEach(function(e){e.classList.add('in')})}

  /* ---------- progress bar + header state ---------- */
  var tk=false;
  function sc(){var m=document.documentElement.scrollHeight-innerHeight;var p=m>0?Math.min(scrollY/m,1):0;bar.style.setProperty('--p',p);hd.classList.toggle('scrolled',scrollY>20);tk=false}
  addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(sc)}},{passive:true});sc();

  /* ---------- cube parallax + magnetic buttons ---------- */
  addEventListener('pointermove',function(e){
    if(e.pointerType!=='touch'&&cu){cu.style.setProperty('--px',(-(e.clientX/innerWidth-.5)*24)+'px');cu.style.setProperty('--py',(-(e.clientY/innerHeight-.5)*16)+'px')}
  },{passive:true});

  document.querySelectorAll('.btn').forEach(function(b){
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();var x=(e.clientX-r.left-r.width/2)/r.width;var y=(e.clientY-r.top-r.height/2)/r.height;b.style.setProperty('--mx',(x*5).toFixed(1)+'px');b.style.setProperty('--my',(y*4).toFixed(1)+'px')});
    b.addEventListener('pointerleave',function(){b.style.setProperty('--mx','0px');b.style.setProperty('--my','0px')});
  });

  /* ---------- typing effect ---------- */
  var wi=0,ci=0,del=false,tt=null;
  function ty(){var w=I18N[cur.lang].typeWords[wi],delay=del?26:58;ci+=del?-1:1;tw.textContent=w.slice(0,ci);
    if(!del&&ci===w.length){del=true;delay=1500}else if(del&&ci===0){del=false;wi=(wi+1)%I18N[cur.lang].typeWords.length;delay=350}
    tt=setTimeout(ty,delay)}
  function typeStart(){if(reduce){tw.textContent=I18N[cur.lang].typeWords[0];return}clearTimeout(tt);wi=0;ci=0;del=false;tw.textContent='';tt=setTimeout(ty,350)}

  /* ---------- init ---------- */
  applyLang();
  applyTheme(document.documentElement.getAttribute('data-theme')||'light');
  if(!reduce){setTimeout(typeStart,700)}else{typeStart()}
})();
