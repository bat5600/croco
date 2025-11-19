<script>
  window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "be627m89",
    custom_launcher_selector: '.button_intercom',
    user_id: "{{user.id}}", // IMPORTANT : remplacez « user.id » par la variable que vous utilisez pour capturer l’identifiant de l’utilisateur
    name: "{{user.name}}", // IMPORTANT : remplacez « user.name » par la variable que vous utilisez pour capturer le nom de l’utilisateur
    email: "{{user.email}}", // IMPORTANT : remplacez « user.email » par la variable que vous utilisez pour capturer l’adresse e-mail de l’utilisateur
    phone: "{{user.phone}}",
    created_at: "{{user.data.date_added.seconds}}", // IMPORTANT : remplacez « user.createdAt » par la variable que vous utilisez pour capturer la date d’inscription de l’utilisateur
  };
</script>

<!-- Import Featurebase SDK -->
<script>
  !(function (e, t) {
    const a = "featurebase-sdk";
    function n() {
      if (!t.getElementById(a)) {
        var e = t.createElement("script");
        (e.id = a),
        (e.src = "https://do.featurebase.app/js/sdk.js"),
        t.getElementsByTagName("script")[0].parentNode.insertBefore(
          e,
          t.getElementsByTagName("script")[0]
        );
      }
    }
    "function" != typeof e.Featurebase &&
      (e.Featurebase = function () {
        (e.Featurebase.q = e.Featurebase.q || []).push(arguments);
      }),
    "complete" === t.readyState || "interactive" === t.readyState
      ? n()
      : t.addEventListener("DOMContentLoaded", n);
  })(window, document);
</script>

<!-- Identify user in Featurebase -->
<script>
  Featurebase(
    "identify",
    {
      // Each 'identify' call should include an "organization"
      // property, which is your Featurebase board's name before the
      // ".featurebase.app".
      organization: "crococlick",
      // Required fields. Replace with your customers data.
      email: "{{user.email}}",
      name: "{{user.name}}",
      userId: "{{user.id}}",
      phone: "{{user.phone}}",
      // Both email and userId should be provided when possible
      // At minimum, either email or userId must be present

  
     

      // locale: "en", // optional, provide expected language for user
      locale: "fr",
    },
    (err) => {
      // Callback function. Called when identify completed.
      if (err) {
        // console.error(err);
      } else {
        // console.log("Data sent successfully!");
      }
    }
  );
</script>

<script>
(function () {
  const ORG_SLUG = 'crococlick';
  const APP_ID   = '69102e66c7b42c0ae48fbfaa';

  const CHANGELOG_BTN_ID = 'croco-fb-changelog-btn';
  const CHAT_BTN_ID      = 'croco-chat-toggle';
  const BADGE_ID         = 'fb-update-badge-top';
  const STYLE_ID         = 'croco-featurebase-style';

  // Launcher (bulle) visible par défaut
  let launcherVisible = true;
  let messengerBooted = false; // NEW


  // --- Styles globaux (boutons + badge) ---
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .croco-btn{
        width:36px;height:36px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:16px;line-height:1;
        margin-left:8px;cursor:pointer;border:0;outline:0;
        box-shadow:0 2px 6px rgba(0,0,0,.15);
        transition:transform .08s ease, box-shadow .2s ease, opacity .15s ease;
        position:relative;
      }
      .croco-btn:hover{
        transform:translateY(-1px);
        opacity:.95;
        box-shadow:0 0 12px rgba(34,197,94,.35);
      }
      .croco-btn svg{ width:18px;height:18px; fill:currentColor; }
      #${BADGE_ID}{
        position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;
        padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;
        font-size:11px;line-height:18px;text-align:center;display:none;
      }
      #croco-chat-toggle {
    margin-right: 16px; /* ajuste la valeur selon ton besoin */
        }
      #${BADGE_ID}._show{ display:inline-block; }
    `;
    document.head.appendChild(style);
  }

  // --- Boot Messenger (doc officielle) ---
  function bootMessenger() {
    try {
      if (messengerBooted || !launcherVisible) return;  // NEW: ne reboot pas si masqué

      Featurebase("boot", {
        appId: APP_ID,
        email: "{{user.email}}",
        userId: "{{user.id}}",
        createdAt: "{{user.data.date_added.seconds}}",
        theme: "light",
        language: "fr"
      });

      messengerBooted = true; // NEW: on note que c’est booté
    } catch(e) {
      console.warn('Featurebase boot error:', e);
    }
  }

  // --- Init Changelog (config complète) ---
  function initChangelog() {
    try {
      Featurebase("init_changelog_widget", {
        organization: ORG_SLUG,
        dropdown: { enabled: true, placement: "right" },
        popup:    { enabled: true, usersName: "{{user.name}}", autoOpenForNewUpdates: true },
        theme: "light",
        locale: "fr"
      }, (error, data) => {
        if (error) return;
        if (data?.action === 'unreadChangelogsCountChanged') {
          const badge = document.getElementById(BADGE_ID);
          if (!badge) return;
          const n = Number(data.unreadCount || 0);
          badge.textContent = n > 0 ? (n > 99 ? '99+' : String(n)) : '';
          badge.classList.toggle('_show', n > 0);
        }
      });
    } catch(e) {
      console.warn('Featurebase changelog init error:', e);
    }
  }

  // --- Bouton ⚡ : Changelog dropdown ---
  function addChangelogButton(controls){
    if (document.getElementById(CHANGELOG_BTN_ID)) return;
    const btn = document.createElement('button');
    btn.id = CHANGELOG_BTN_ID;
    btn.className = 'croco-btn';
    btn.style.background = '#22c55e'; // vert clair
    btn.setAttribute('data-featurebase-changelog', '');
    btn.title = 'Nouveautés';
    btn.innerHTML = `
      <span id="${BADGE_ID}"></span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
      </svg>
    `;
    controls.appendChild(btn);
  }

  // --- Bouton 🎧 : toggle **launcher** (shutdown / boot) ---
  function addChatButton(controls){
    if (document.getElementById(CHAT_BTN_ID)) return;
    const btn = document.createElement('button');
    btn.id = CHAT_BTN_ID;
    btn.className = 'croco-btn';
    btn.style.background = '#b45309'; // orange foncé
    btn.title = 'Masquer le launcher';
    btn.innerHTML = `
      <!-- Icône casque support -->
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 1C6.48 1 2 5.48 2 11v8c0 1.1.9 2 2 2h4v-6H5v-4c0-3.86 3.14-7 7-7s7 3.14 7 7v4h-3v6h4c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10zm-1 18h2v2h-2z"/>
      </svg>
    `;

    btn.onclick = () => {
      if (launcherVisible) {
        // → On MASQUE le launcher
        try { Featurebase('shutdown'); } catch(e) {}
        launcherVisible  = false;
        messengerBooted  = false;          // NEW: autorise un reboot propre plus tard
        btn.title        = 'Afficher le launcher';
        btn.style.background = '#9ca3af';  // gris
      } else {
        // → On AFFICHE le launcher
        launcherVisible = true;
        bootMessenger();   // reboot
        initChangelog();   // pour le badge changelog
        btn.title        = 'Masquer le launcher';
        btn.style.background = '#b45309'; // orange
      }
    };

    controls.appendChild(btn);
  }

  // --- Point d’insertion (header) ---
  function getControls() {
    return document.querySelector('header.hl_header .hl_header--controls') ||
           document.querySelector('.hl_header--controls');
  }

  // --- Montage global ---
  function mount(){
    injectStyles();
    const controls = getControls();
    if (!controls) return;

    // On ajoute les boutons même si Featurebase n'est pas encore prêt
    addChangelogButton(controls);
    addChatButton(controls);

    if (typeof window.Featurebase !== 'function') return;

    // Si le launcher est MASQUÉ, on ne reboot pas Featurebase
    if (!launcherVisible) return;

    // Sinon, comportement normal
    bootMessenger();
    initChangelog();
  }

  // Initial
  mount();

  // Persistance SPA
  const mo = new MutationObserver(() => mount());
  mo.observe(document.body, { childList: true, subtree: true });
  ['pushState','replaceState'].forEach(fn=>{
    const orig = history[fn];
    history[fn] = function(){
      const r = orig.apply(this, arguments);
      setTimeout(mount, 0);
      return r;
    };
  });
  window.addEventListener('load', mount);
})();
</script>


<script>
  // Nous avons pré-rempli l’ID de votre application dans l’URL du widget : 'https://widget.intercom.io/widget/be627m89'
  (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/be627m89';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
</script>

<script src="https://global.localizecdn.com/localize.js"></script>
<script>!function(a){if(!a.Localize){a.Localize={};for(var e=["translate","untranslate","phrase","initialize","translatePage","setLanguage","getLanguage","getSourceLanguage","detectLanguage","getAvailableLanguages","untranslatePage","bootstrap","prefetch","on","off","hideWidget","showWidget"],t=0;t<e.length;t++)a.Localize[e[t]]=function(){}}}(window);</script>

<script>
  Localize.initialize({
    key: 'd4s5PHXt6AYW1',
    rememberLanguage: true,
  });
</script>

<script>
var faviconURL = 'https://storage.googleapis.com/msgsndr/0XeqHZvwfH59pwE9Y5ZY/media/652299259996f385301e1f33.png'

var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
link.type = 'image/x-icon';
link.rel = 'shortcut icon';
link.href = faviconURL
document.getElementsByTagName('head')[0].appendChild(link);
</script>


<script id="profitwell-js" data-pw-auth="4ae6190f8f5ef7d4183dd1edd49e7f65">
        (function(i,s,o,g,r,a,m){i[o]=i[o]||function(){(i[o].q=i[o].q||[]).push(arguments)};
        a=s.createElement(g);m=s.getElementsByTagName(g)[0];a.async=1;a.src=r+'?auth='+
        s.getElementById(o+'-js').getAttribute('data-pw-auth');m.parentNode.insertBefore(a,m);
        })(window,document,'profitwell','script','https://public.profitwell.com/js/profitwell.js');

     profitwell('start', { 'user_email': '{{user.email}}' });
</script>

<!-- Amplitude -->
<script src="https://cdn.amplitude.com/script/ad1137f2178733c908603358ed257639.js"></script>
<script>
  window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
  window.amplitude.init('ad1137f2178733c908603358ed257639', "{{user.id}}", {
    autocapture: true,
    fetchRemoteConfig: true
  });

  // Propriétés de profil (facultatif)
  const id = new window.amplitude.Identify();
  id.set('name',  "{{user.name}}");
  id.set('email', "{{user.email}}");
  id.set('phone', "{{user.phone}}");
  id.setOnce('created_at', new Date(Number("{{user.data.date_added.seconds}}")*1000).toISOString());
  window.amplitude.identify(id);
</script>

<script src="https://cdn.amplitude.com/script/ad1137f2178733c908603358ed257639.engagement.js"></script>
<script>amplitude.add(window.engagement.plugin())</script>

<!-- Interface Croco Licorne -->
<script>
(function () {
  let enabled = false;
  let style, overlay, sparkleMove, flyerTimer;
  const ID = "croco-licorne-overlay";

  const css = `
  /* Thème allégé + Comic Sans partout */
  body.croco-licorne {
    --cl-accent: #ff4dd2;
    --cl-rainbow: linear-gradient(90deg,#ff4dd2,#ffa94d,#ffff4d,#4dff88,#4dd2ff,#b84dff,#ff4dd2);
    background: linear-gradient(135deg, #ffe3ff 0%, #d9b4ff 25%, #b8ffe3 50%, #fff88a 75%, #ffb08a 100%);
    background-size: 200% 200%;
    animation: bgShift 16s linear infinite;
    color: #141414;
  }
  @keyframes bgShift { 
    0% { background-position: 0% 0%; } 
    100% { background-position: 100% 100%; } 
  }

  /* Police globale sans ombre */
  body.croco-licorne,
  body.croco-licorne * {
    font-family: 'Comic Sans MS', cursive !important;
    transition: all .25s ease;
    text-shadow: none !important;
  }

  /* Ombre subtile UNIQUEMENT sur titres et boutons */
  body.croco-licorne h1,
  body.croco-licorne h2,
  body.croco-licorne h3,
  body.croco-licorne h4,
  body.croco-licorne h5,
  body.croco-licorne h6,
  body.croco-licorne button,
  body.croco-licorne .btn,
  body.croco-licorne [role="button"] {
    text-shadow: 1px 1px rgba(255,0,255,.45);
  }

  /* Images normales (on enlève le hue-rotate qui rendait tout illisible) */
  body.croco-licorne img { filter: none; }

  /* Topbar arc-en-ciel lisible */
  body.croco-licorne .cc-toolbar,
  body.croco-licorne header,
  body.croco-licorne .topbar,
  body.croco-licorne [class*="header"] {
    background-image: var(--cl-rainbow);
    background-size: 300% 100%;
    animation: cl-rainbow-shift 10s linear infinite;
    color: #141414 !important;
  }
  @keyframes cl-rainbow-shift { to { background-position: 300% 0; } }

  /* Panels/cards avec bordures rainbow discrètes */
  body.croco-licorne .card,
  body.croco-licorne .panel,
  body.croco-licorne [class*="card"],
  body.croco-licorne [class*="panel"] {
    border: 2px solid transparent !important;
    background-clip: padding-box, border-box;
    background-image: linear-gradient(#ffffffee,#ffffffee), var(--cl-rainbow);
    background-origin: border-box;
    box-shadow: 0 6px 16px rgba(255,77,210,.12);
  }

  /* Boutons wobble au hover (léger) */
  body.croco-licorne button,
  body.croco-licorne .btn,
  body.croco-licorne [role="button"] {
    transform-origin: center;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  body.croco-licorne button:hover,
  body.croco-licorne .btn:hover,
  body.croco-licorne [role="button"]:hover {
    transform: rotate(-1.2deg) scale(1.02);
    box-shadow: 0 6px 18px rgba(255,77,210,.18);
  }

  /* Overlay pour effets */
  #${ID} {
    position: fixed; inset: 0; pointer-events: none; z-index: 999999;
    overflow: hidden;
  }

  /* Licorne/croco volant */
  .cl-unicorn {
    position: absolute; top: 20%; left: -200px; font-size: 64px;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,.2));
    animation: cl-fly 8s linear forwards;
  }
  @keyframes cl-fly { 
    0% { transform: translateX(0) rotate(0deg); } 
    100% { transform: translateX(calc(100vw + 400px)) rotate(3deg); } 
  }

  /* Étincelles curseur */
  .cl-sparkle {
    position: absolute; width: 10px; height: 10px; border-radius: 50%;
    background: radial-gradient(circle, #fff, var(--cl-accent));
    opacity: .9; transform: translate(-50%, -50%);
    animation: cl-spark 600ms ease-out forwards;
  }
  @keyframes cl-spark {
    0%   { opacity: .9; transform: translate(-50%,-50%) scale(1); }
    100% { opacity: 0;   transform: translate(-50%,-120%) scale(0.2); }
  }

  /* Pluie d’emojis */
  .cl-emoji {
    position: absolute; top: -40px; font-size: 28px;
    animation: cl-fall 2.5s linear forwards;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,.18));
  }
  @keyframes cl-fall { to { transform: translateY(120vh) rotate(360deg); opacity: .9; } }

  /* Badge WTF bas-gauche */
  .cl-badge {
    position: fixed; right: 10px; top: 10px;
    background: #111; color:#fff; font: 12px/1.2 system-ui, sans-serif;
    padding: 6px 10px; border-radius: 999px; opacity: .9;
    pointer-events: auto; cursor: pointer; z-index: 1000000;
  }
  body.croco-licorne .cl-badge{ display:block; }
  :not(.croco-licorne) .cl-badge{ display:none; }

  /* Marquee emojis (n'obstrue pas les clics) */
  .cl-marquee {
    position: fixed; bottom: 0; left: 0; width: 100%;
    white-space: nowrap;
    background: linear-gradient(90deg, #ffffffaa, #ffffffdd);
    font-size: 2rem;
    padding: 4px 0;
    animation: cl-marquee-move 22s linear infinite;
    z-index: 1000001;
    pointer-events: none; /* important: ne bloque pas l'UI */
  }
  @keyframes cl-marquee-move { 
    0% { transform: translateX(0); } 
    100% { transform: translateX(-50%); } 
  }
  `;

  function injectCSS() {
    if (style) return;
    style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }
  function ensureOverlay() {
    overlay = document.getElementById(ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = ID;
      document.body.appendChild(overlay);
    }
  }

  function flyUnicorn() {
    if (!enabled) return;
    ensureOverlay();
    const u = document.createElement("div");
    u.className = "cl-unicorn";
    u.textContent = Math.random() > 0.5 ? "🦄" : "🐊";
    u.style.top = Math.floor(10 + Math.random()*70) + "vh";
    overlay.appendChild(u);
    setTimeout(() => u.remove(), 8500);
  }

  function emojiBurst() {
    if (!enabled) return;
    ensureOverlay();
    const emojis = ["🦄","🐊","✨","🌈","💎","🔥"];
    for (let i=0;i<36;i++){
      const e = document.createElement("div");
      e.className = "cl-emoji";
      e.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      e.style.left = Math.floor(Math.random()*100) + "vw";
      e.style.animationDelay = (Math.random()*0.8)+"s";
      overlay.appendChild(e);
      setTimeout(()=> e.remove(), 3000);
    }
  }

  function startSparkles() {
    stopSparkles();
    sparkleMove = (ev)=>{
      if (!enabled) return;
      ensureOverlay();
      const s = document.createElement("div");
      s.className = "cl-sparkle";
      s.style.left = ev.clientX + "px";
      s.style.top  = ev.clientY + "px";
      overlay.appendChild(s);
      setTimeout(()=> s.remove(), 700);
    };
    window.addEventListener("mousemove", sparkleMove);
  }
  function stopSparkles() {
    if (sparkleMove) window.removeEventListener("mousemove", sparkleMove);
    sparkleMove = null;
  }

  function addBadge() {
    let badge = document.querySelector(".cl-badge");
    if (!badge){
      badge = document.createElement("div");
      badge.className = "cl-badge";
      badge.textContent = "WTF: click = 🌈";
      badge.addEventListener("click", emojiBurst);
      document.body.appendChild(badge);
    }
  }

  function addMarquee() {
    let marquee = document.querySelector(".cl-marquee");
    if (!marquee){
      marquee = document.createElement("div");
      marquee.className = "cl-marquee";
      marquee.textContent = "🦄 🐊 ".repeat(30);
      document.body.appendChild(marquee);
    }
  }
  function removeMarquee() {
    const m = document.querySelector(".cl-marquee");
    if (m) m.remove();
  }

  function enable() {
    injectCSS();
    document.body.classList.add("croco-licorne");
    enabled = true;
    ensureOverlay();
    startSparkles();
    addBadge();
    addMarquee();
    flyUnicorn();
    flyerTimer = setInterval(flyUnicorn, 8000);
  }
  function disable() {
    document.body.classList.remove("croco-licorne");
    enabled = false;
    stopSparkles();
    clearInterval(flyerTimer);
    removeMarquee();
    const o = document.getElementById(ID);
    if (o) o.innerHTML = "";
  }

  window.addEventListener("keydown", (e)=>{
    const key = e.key?.toLowerCase?.() || "";
    if (e.altKey && key === "u") { e.preventDefault(); enabled ? disable() : enable(); }
    if (e.altKey && e.shiftKey && key === "u") { e.preventDefault(); if (enabled) emojiBurst(); }
  });
})();
</script>

<!-- Interface Croco Matrix -->
<script>
(function () {
  let enabled = false;
  let style, canvas, ctx, animId;
  const ID = "matrix-rain-canvas";

  // ——— CSS Matrix
  const css = `
  body.matrix-mode {
    --m-green: #00ff7f; /* neon vert menthe */
    background: #000 !important;
    color: var(--m-green) !important;
  }
  /* Tout en vert + glow léger, police mono */
  body.matrix-mode, body.matrix-mode * {
    color: var(--m-green) !important;
    caret-color: var(--m-green) !important;
    text-shadow: 0 0 6px rgba(0,255,127,.6);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    border-color: rgba(0,255,127,.5) !important;
  }
  /* Liens & boutons visibles */
  body.matrix-mode a { text-decoration-color: rgba(0,255,127,.6) !important; }
  body.matrix-mode button, 
  body.matrix-mode .btn, 
  body.matrix-mode [role="button"] {
    background: rgba(0,255,127,.08) !important;
    box-shadow: 0 0 12px rgba(0,255,127,.25) !important;
  }
  /* Inputs */
  body.matrix-mode input, 
  body.matrix-mode textarea, 
  body.matrix-mode select {
    background: rgba(0,0,0,.6) !important;
  }
  /* Images en discret */
  body.matrix-mode img { filter: grayscale(1) brightness(.8) contrast(1.1) hue-rotate(90deg); }
  /* Scrollbar (webkit) */
  body.matrix-mode ::-webkit-scrollbar { width: 10px; height: 10px; }
  body.matrix-mode ::-webkit-scrollbar-thumb { background: rgba(0,255,127,.4); border-radius: 8px; }
  body.matrix-mode ::-webkit-scrollbar-track { background: rgba(255,255,255,.05); }

  /* Canvas digital rain overlay */
  #${ID} {
    position: fixed; inset: 0; pointer-events: none; z-index: 999998;
    opacity: .9;
  }
  `;

  function injectCSS() {
    if (style) return;
    style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ——— Digital rain
  let columns, drops, fontSize;

  function setupCanvas() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = ID;
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fontSize = 16; // px
    columns = Math.ceil(window.innerWidth / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -50));
    ctx.font = `${fontSize}px monospace`;
  }

  const chars = "ｱｲｳｴｵｶｷｸｹｺﾅﾆﾇﾈﾉﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛ01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-/<=>?@[]{}";

  function step() {
    if (!enabled) return;
    // voile noir semi-transparent pour trainées
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff7f";
    for (let i = 0; i < columns; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      // réinitialise aléatoirement pour les colonnes arrivées en bas
      if (y > window.innerHeight && Math.random() > 0.975) {
        drops[i] = 0 - Math.floor(Math.random() * 30);
      }
      drops[i]++;
    }
    animId = requestAnimationFrame(step);
  }

  function startRain() {
    setupCanvas();
    cancelAnimationFrame(animId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animId = requestAnimationFrame(step);
  }

  function stopRain() {
    cancelAnimationFrame(animId);
    animId = null;
    if (canvas) {
      canvas.remove();
      canvas = null;
      ctx = null;
      window.removeEventListener("resize", resizeCanvas);
    }
  }

  // ——— Toggle
  function enable() {
    injectCSS();
    // Éteint le mode licorne si actif pour éviter le mashup visuel
    document.body.classList.remove("croco-licorne");
    // supprime éventuels overlays licorne
    const unicornOverlay = document.getElementById("croco-licorne-overlay");
    if (unicornOverlay) unicornOverlay.innerHTML = "";

    document.body.classList.add("matrix-mode");
    enabled = true;
    startRain();
  }

  function disable() {
    document.body.classList.remove("matrix-mode");
    enabled = false;
    stopRain();
  }

  // ——— Hotkeys
  window.addEventListener("keydown", (e) => {
    const key = e.key?.toLowerCase?.() || "";
    if (e.altKey && key === "m") {
      e.preventDefault();
      enabled ? disable() : enable();
    }
    // Optionnel : Alt+Shift+M pour pause/reprise de la pluie
    if (e.altKey && e.shiftKey && key === "m" && enabled) {
      e.preventDefault();
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      else { animId = requestAnimationFrame(step); }
    }
  });
})();

</script>

<!-- Barre de sépartion Custom Menus -->

<script>
(() => {
  const addDivider = () => {
    const el = document.querySelector('#sb_reporting');
    if (!el) return;
    if (el.nextElementSibling && el.nextElementSibling.dataset?.crocDivider === '1') return;

    const bar = document.createElement('div');
    bar.dataset.crocDivider = '1';
    bar.style.height = '1px';
    bar.style.background = 'rgba(0,0,0,.12)';
    bar.style.margin = '16px 0';
    bar.style.marginLeft = '16px';
    bar.style.marginRight = '16px';
    el.parentElement.insertBefore(bar, el.nextElementSibling);
  };

  // 1) Polling court pour le premier rendu
  const t = setInterval(() => {
    addDivider();
    if (document.querySelector('#sb_reporting') &&
        document.querySelector('#sb_reporting + [data-croc-divider="1"]')) {
      clearInterval(t);
    }
  }, 250);

  // 2) Observer les changements (navigations SPA, re-render)
  new MutationObserver(addDivider).observe(document.body, { childList: true, subtree: true });

  // 3) Au cas où : relancer au DOMContentLoaded
  document.addEventListener('DOMContentLoaded', addDivider);
})();
</script>


<!-- Change l'article d'aide du module formation pour délivrer un certificat lors de la complétion d'une lecon -->
<script>
(function () {
  const oldLink = "https://help.gohighlevel.com/support/solutions/articles/155000005110";
  const newLink = "https://help.crococlick.com/fr/help/articles/7202957-comment-envoyer-automatiquement-un-certificat-apres-la-reussite-dun-quiz";

  function patchButton() {
    const buttons = document.querySelectorAll(`button[onclick*="${oldLink}"]`);

    buttons.forEach((btn) => {
      // Pour éviter de le modifier 1000 fois
      if (btn.dataset.crocoPatched === "1") return;

      btn.removeAttribute("onclick");

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.open(newLink, "_blank");
      });

      btn.dataset.crocoPatched = "1";
      console.log("✔️ Bouton support patché vers CrocoClick");
    });
  }

  // 1) On tente tout de suite au cas où le bouton est déjà là
  patchButton();

  // 2) On observe tout changement dans la page (widget chargé en AJAX)
  const observer = new MutationObserver(patchButton);
  observer.observe(document.body, { childList: true, subtree: true });

  // 3) Optionnel : ceinture + bretelles, on check périodiquement
  setInterval(patchButton, 2000);
})();

  </script>

<!-- Change les articles leadconnector -->

  <script>
(function () {
  // 1) Table de correspondance GHL → Croco
  const CROCO_HELP_MAP = {
    "155000005357": "https://help.crococlick.com/fr/help/articles/5480701-comprendre-longlet-domaines-dans-crococlick",
    "155000005273": "https://help.crococlick.com/fr/help/articles/10075044-installer-et-connecter-un-domaine-ou-sous-domaine-web-sur",
    // Ajoute ici : "ID_GHL": "URL_CROCO",
  };

  // Optionnel : page vers laquelle envoyer si on n’a pas de mapping
  const FALLBACK_CROCO = "https://help.crococlick.com/fr/help";

  function patchHelpLinks(root) {
    const anchors = (root || document).querySelectorAll('a[href*="help.leadconnectorhq.com"]');

    anchors.forEach((a) => {
      if (a.dataset.crocoPatched === "1") return;
      const href = a.href;
      if (!href) return;

      // On extrait l'ID d'article dans l'URL GHL
      const match = href.match(/solutions\/articles\/(\d+)/);
      if (!match) return;

      const articleId = match[1];
      const mapped = CROCO_HELP_MAP[articleId];

      // Si on a un équivalent Croco, on remplace
      if (mapped) {
        a.href = mapped;
      } 
      // Sinon, soit on laisse GHL, soit on force vers une page générique Croco
      else if (FALLBACK_CROCO) {
        // a.href = FALLBACK_CROCO; // décommente si tu veux forcer vers Croco par défaut
      }

      a.target = "_blank"; // optionnel
      a.dataset.crocoPatched = "1";

      console.log("✔️ Patch lien help:", articleId, "→", a.href);
    });
  }

  // 1) Premier passage sur la page
  patchHelpLinks();

  // 2) Surveiller tous les ajouts (SPA, popovers, tooltips, etc.)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        patchHelpLinks(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
  </script>

<!-- Changement de la phrase "dans" par "opt-in" dans analytics site web -->
<script>
(function () {
  // Exécuter seulement si on est sur une page analytics
  if (!window.location.href.includes('/analytics')) return;

  function replaceDansByOptin() {
    document.querySelectorAll('.hl-text-md-normal').forEach(el => {
      if (el.textContent.trim() === 'dans') {
        el.textContent = 'Opt-in';
      }
    });
  }

  // 1. Premier passage
  replaceDansByOptin();

  // 2. Surveiller les changements (SPA / React)
  const observer = new MutationObserver(replaceDansByOptin);
  observer.observe(document.body, { childList: true, subtree: true });
})();
</script>
