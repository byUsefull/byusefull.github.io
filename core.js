/* =====================================================
   CORE — общее для всех страниц: шапка-путь, Explorer, Output,
   язык, подсветка Luau, обложки, копирование. Отдаёт window.Site.
   ===================================================== */
(() => {
  const html = document.documentElement;
  html.classList.add("js");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(pointer: coarse)").matches;
  const GAMES = window.GAMES;
  const byId = Object.fromEntries(GAMES.map(g => [g.id, g]));
  /* Картинки игры: своя копия в assets/games или официальная ссылка Roblox (remote) */
  const iconSrc = id => byId[id]?.remote?.icon || `assets/games/${id}/icon.webp`;
  const thumbSrc = (id, n = 1) => byId[id]?.remote?.thumbs?.[n - 1] || `assets/games/${id}/thumbnail-${String(n).padStart(2, "0")}.webp`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clip = (s, n = 32) => { s = s.replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const isHome = document.body.dataset.page === "home";
  const HOME = isHome ? "" : "index.html";

  /* ---------- Язык: сохраняется между страницами ---------- */
  let lang = "ru";
  try { if (localStorage.getItem("lang") === "en") lang = "en"; } catch (e) {}
  html.lang = lang;
  /* L({ru,en}) → строка на текущем языке; обычная строка возвращается как есть */
  const L = v => (v && typeof v === "object" ? (v[lang] ?? v.ru) : v ?? "");
  const gameName = g => L(g.name);
  const gameUrl = id => `game.html?g=${id}`;

  const CHROME = {
    ru: { skip: "К содержанию", pdf: "Резюме PDF", tree: "Разделы сайта", top: "начало", sys: "как устроены игры", ai: "работа с ИИ",
          about: "обо мне", contact: "связаться", all: "Все", input: "Ввод", nav: "Навигация", net: "Сеть", econ: "Экономика",
          clear: "Очистить", outLabel: "Output — журнал действий на странице", filter: "Фильтр сообщений", links: "Связь" },
    en: { skip: "Skip to content", pdf: "Resume PDF", tree: "Site sections", top: "start", sys: "how my games work", ai: "working with AI",
          about: "about me", contact: "contact", all: "All", input: "Input", nav: "Navigation", net: "Network", econ: "Economy",
          clear: "Clear", outLabel: "Output — a log of everything on the page", filter: "Message filter", links: "Contact" }
  };
  const c = k => CHROME[lang][k];

  /* ---------- Шапка, Explorer и Output строятся здесь, одни на все страницы ---------- */
  const ICONS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-workspace" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="#3f8ee8"/><path d="M3.4 6.5c2 .8 3 .2 4-1 .9-1 2.2-1.4 3.6-.6M5 12.6c.4-1.6 1.6-2.2 3-2 1.7.2 2.6-.6 3-2" stroke="#7fd36a" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="8" cy="8" r="6.2" fill="none" stroke="#1d4f8f" stroke-width=".8"/></symbol>
  <symbol id="i-folder" viewBox="0 0 16 16"><path d="M1.5 4.2c0-.6.4-1 1-1h3.6l1.4 1.5h6c.6 0 1 .4 1 1v6.8c0 .6-.4 1-1 1h-11c-.6 0-1-.4-1-1z" fill="#d9a441"/><path d="M1.5 6.3h13v6.2c0 .6-.4 1-1 1h-11c-.6 0-1-.4-1-1z" fill="#f0c25e"/></symbol>
  <symbol id="i-model" viewBox="0 0 16 16"><path d="M8 1.8l5.6 3.1v6.2L8 14.2l-5.6-3.1V4.9z" fill="#8a94a6"/><path d="M8 1.8l5.6 3.1L8 8 2.4 4.9z" fill="#c5ccd8"/><path d="M8 8v6.2l5.6-3.1V4.9z" fill="#6b7486"/></symbol>
  <symbol id="i-server" viewBox="0 0 16 16"><rect x="2.5" y="2" width="11" height="5" rx="1.2" fill="#3fae6a"/><rect x="2.5" y="9" width="11" height="5" rx="1.2" fill="#2f8a53"/><circle cx="5" cy="4.5" r=".9" fill="#d8ffe4"/><circle cx="5" cy="11.5" r=".9" fill="#d8ffe4"/></symbol>
  <symbol id="i-chat" viewBox="0 0 16 16"><path d="M2 3.5c0-.8.6-1.4 1.4-1.4h9.2c.8 0 1.4.6 1.4 1.4v6.2c0 .8-.6 1.4-1.4 1.4H7.2L4 13.8v-2.7h-.6c-.8 0-1.4-.6-1.4-1.4z" fill="#e8e6e1"/><circle cx="5.5" cy="6.6" r=".9" fill="#2a2c31"/><circle cx="8" cy="6.6" r=".9" fill="#2a2c31"/><circle cx="10.5" cy="6.6" r=".9" fill="#2a2c31"/></symbol>
  <symbol id="i-player" viewBox="0 0 16 16"><rect x="5" y="1.8" width="6" height="5.2" rx="1.4" fill="#f5c451"/><rect x="4" y="7.6" width="8" height="6.6" rx="1.2" fill="#5aa8ee"/></symbol>
  <symbol id="i-module" viewBox="0 0 16 16"><path d="M3 1.8h7l3 3v9.4H3z" fill="#9b7bf0"/><path d="M10 1.8v3h3" fill="#c9b8ff"/><path d="M5.2 8h5.6M5.2 10.4h3.6" stroke="#efe9ff" stroke-width="1.2" stroke-linecap="round"/></symbol>
  <symbol id="i-remote" viewBox="0 0 16 16"><path d="M9.2 1.6L3.6 9h3.6l-1 5.4L12.4 7H8.6z" fill="#f5c451"/></symbol>
  <symbol id="i-caret" viewBox="0 0 16 16"><path d="M6 4.5L10 8l-4 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-down" viewBox="0 0 16 16"><path d="M4.5 6L8 10l3.5-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-tree" viewBox="0 0 16 16"><path d="M3 3h4M5 3v9.5h3M5 7.8h3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><rect x="9" y="6.3" width="4.5" height="3" rx=".8" fill="currentColor"/><rect x="9" y="11" width="4.5" height="3" rx=".8" fill="currentColor"/></symbol>
  <symbol id="i-pdf" viewBox="0 0 16 16"><path d="M3.5 1.8h6.5l2.5 2.5v9.9h-9z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 6.5v4.6m-2-1.8L8 11.3l2-2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-send" viewBox="0 0 16 16"><path d="M2 7.6l11.6-5-3.4 11-2.6-4.4z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M7.6 9.2l6-6.6" stroke="currentColor" stroke-width="1.3"/></symbol>
  <symbol id="i-play" viewBox="0 0 16 16"><path d="M4.5 2.8v10.4L13 8z" fill="currentColor"/></symbol>
  <symbol id="i-clear" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M4.2 11.8l7.6-7.6" stroke="currentColor" stroke-width="1.3"/></symbol>
  <symbol id="i-link" viewBox="0 0 16 16"><path d="M6.5 3.5H3.5v9h9v-3M9 2.5h4.5V7M13.2 2.8L7.5 8.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-copy" viewBox="0 0 16 16"><rect x="5" y="5" width="8.5" height="8.5" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3 10.5V3.8c0-.5.4-.8.8-.8h6.7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-back" viewBox="0 0 16 16"><path d="M13 8H3.5M7.5 4l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>`;

  /* Ссылка на раздел главной: на главной — прокрутка, на других страницах — переход */
  const secAttr = id => isHome ? `href="#${id}" data-go="${id}"` : `href="${HOME}#${id}"`;
  function chromeHTML() {
    const games = GAMES.map(g => `<li role="treeitem"><a class="row lvl2" data-game="${g.id}" href="${gameUrl(g.id)}"><img class="thumb" src="${iconSrc(g.id)}" alt="">${g.obj}</a></li>`).join("");
    return `${ICONS}
<a class="skip" href="#main">${c("skip")}</a>
<header class="topbar" data-obj="TopBar">
  <div class="path-wrap">
    <button type="button" class="path" id="pathBtn" aria-expanded="false" aria-controls="explorer" data-obj="Explorer">
      <svg class="ic"><use href="#i-tree"/></svg><span class="path-text" id="pathText"></span><svg class="ic chev"><use href="#i-down"/></svg>
    </button>
    <div class="explorer" id="explorer" hidden>
      <ul class="tree" role="tree" aria-label="${c("tree")}">
        <li role="treeitem" aria-expanded="true">
          <a class="row lvl0" ${secAttr("top")} data-sec="top"><svg class="caret"><use href="#i-caret"/></svg><svg class="ic"><use href="#i-workspace"/></svg>Workspace<em>${c("top")}</em></a>
          <ul role="group"><li role="treeitem" aria-expanded="true">
            <a class="row lvl1" ${secAttr("projects")} data-sec="projects"><svg class="caret"><use href="#i-caret"/></svg><svg class="ic"><use href="#i-folder"/></svg>Games<em>${GAMES.length}</em></a>
            <ul role="group">${games}</ul>
          </li></ul>
        </li>
        <li role="treeitem"><a class="row lvl0" ${secAttr("systems")} data-sec="systems"><span class="caret-gap"></span><svg class="ic"><use href="#i-server"/></svg>ServerScriptService<em>${c("sys")}</em></a></li>
        <li role="treeitem"><a class="row lvl0" ${secAttr("ai")} data-sec="ai"><span class="caret-gap"></span><svg class="ic"><use href="#i-chat"/></svg>TextChatService<em>${c("ai")}</em></a></li>
        <li role="treeitem"><a class="row lvl0" ${secAttr("about")} data-sec="about"><span class="caret-gap"></span><svg class="ic"><use href="#i-player"/></svg>Players.Kirill<em>${c("about")}</em></a></li>
        <li role="treeitem"><a class="row lvl0" ${secAttr("contact")} data-sec="contact"><span class="caret-gap"></span><svg class="ic"><use href="#i-remote"/></svg>Contact<em>${c("contact")}</em></a></li>
      </ul>
    </div>
  </div>
  <nav class="top-actions" aria-label="${c("links")}">
    <button type="button" class="lang" data-lang-toggle data-obj="LanguageToggle">${lang === "ru" ? "RU <span>/ EN</span>" : "EN <span>/ RU</span>"}</button>
    <a class="btn-ghost" href="assets/Kirill_Skorik_Roblox_Developer.pdf" download data-net="Download Kirill_Skorik_Roblox_Developer.pdf (88 KB)" data-obj="PdfButton"><svg class="ic"><use href="#i-pdf"/></svg><span>${c("pdf")}</span></a>
    <a class="btn-solid" href="https://t.me/stf_use" target="_blank" rel="noopener" data-net="Open t.me/stf_use" data-obj="TelegramButton"><svg class="ic"><use href="#i-send"/></svg>Telegram</a>
  </nav>
</header>`;
  }
  function outputHTML() {
    return `<section class="output collapsed" id="output" aria-label="${c("outLabel")}">
  <div class="out-bar">
    <button type="button" class="out-title" id="outToggle" aria-expanded="false" aria-controls="log"><svg class="ic chev"><use href="#i-down"/></svg>Output<span class="badge" id="badge" hidden>0</span></button>
    <span class="out-last" id="outLast" aria-hidden="true"></span>
  </div>
  <div class="out-tools">
    <div class="filters" role="group" aria-label="${c("filter")}">
      <button type="button" aria-pressed="true" data-filter="all">${c("all")}</button><button type="button" aria-pressed="false" data-filter="INPUT">${c("input")}</button><button type="button" aria-pressed="false" data-filter="NAV">${c("nav")}</button><button type="button" aria-pressed="false" data-filter="NET">${c("net")}</button><button type="button" aria-pressed="false" data-filter="ECON">${c("econ")}</button>
    </div>
    <button type="button" class="out-clear" id="outClear" aria-label="${c("clear")}" title="${c("clear")}"><svg class="ic"><use href="#i-clear"/></svg></button>
  </div>
  <ol class="log" id="log" aria-live="off"></ol>
  <form class="cmd" id="cmd" autocomplete="off"><span aria-hidden="true">&gt;</span><input id="cmdIn" spellcheck="false" placeholder="Command Bar — help()" aria-label="Command Bar"></form>
</section>`;
  }
  document.body.insertAdjacentHTML("afterbegin", chromeHTML());
  document.body.insertAdjacentHTML("beforeend", outputHTML());

  /* =====================================================
     OUTPUT — журнал всего, что происходит на странице
     ===================================================== */
  const output = $("#output"), log = $("#log"), outLast = $("#outLast"), badge = $("#badge");
  const t0 = performance.now();
  let unread = 0, filter = "all";
  const stamp = () => {
    const s = Math.floor((performance.now() - t0) / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };
  /* msg — уже экранированный HTML; to — id элемента, к которому ведёт строка */
  function out(level, msg, to) {
    const li = document.createElement("li");
    li.className = "new";
    li.dataset.lv = level;
    if (to) li.dataset.to = to;
    li.innerHTML = `<time>${stamp()}</time><span class="lv lv-${level}">${level}</span><span class="msg">${msg}</span>`;
    if (filter !== "all" && filter !== level) li.classList.add("hide");
    log.append(li);
    while (log.children.length > 200) log.firstChild.remove();
    log.scrollTop = log.scrollHeight;
    outLast.innerHTML = `<span class="lv lv-${level}">${level}</span>${msg}`;
    outLast.classList.remove("pulse"); void outLast.offsetWidth; outLast.classList.add("pulse");
    if (output.classList.contains("collapsed")) { unread++; badge.textContent = unread > 99 ? "99+" : unread; badge.hidden = false; }
  }
  const q = s => `<q>${esc(s)}</q>`;
  function setOutput(open) {
    output.classList.toggle("collapsed", !open);
    $("#outToggle").setAttribute("aria-expanded", String(open));
    if (open) { unread = 0; badge.hidden = true; log.scrollTop = log.scrollHeight; }
  }
  $("#outToggle").addEventListener("click", () => setOutput(output.classList.contains("collapsed")));
  outLast.addEventListener("click", () => setOutput(true));
  $("#outClear").addEventListener("click", () => { log.innerHTML = ""; out("INFO", "Output cleared"); });
  $$("[data-filter]").forEach(b => b.addEventListener("click", () => {
    filter = b.dataset.filter;
    $$("[data-filter]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    $$("li", log).forEach(li => li.classList.toggle("hide", filter !== "all" && li.dataset.lv !== filter));
    log.scrollTop = log.scrollHeight;
  }));
  log.addEventListener("click", e => {
    const li = e.target.closest("li[data-to]");
    if (li) goTo(li.dataset.to, true);
  });

  /* ---------- Как называть элементы: классы Roblox UI ---------- */
  const describers = [];
  function describe(el) {
    for (const fn of describers) { const r = fn(el); if (r) return r; }
    let n;
    if ((n = el.closest(".ln"))) return `ScriptEditor ${esc(n.closest(".code").dataset.script)}:<b>${n.dataset.l}</b>`;
    if ((n = el.closest(".row"))) return `Explorer › ${esc(clip(n.textContent.replace(n.querySelector("em")?.textContent || "", ""), 30))}`;
    if ((n = el.closest(".cover-thumbs button"))) return `ImageButton ${q(n.getAttribute("aria-label"))}`;
    if ((n = el.closest("button, a"))) return `TextButton ${q(clip(n.textContent || n.getAttribute("aria-label") || "", 30))}`;
    if ((n = el.closest("img"))) return `ImageLabel ${q(clip(n.alt || "image", 30))}`;
    if ((n = el.closest("h1, h2, h3, h4, p, dd, dt, li, figcaption"))) return `TextLabel ${q(clip(n.textContent, 30))}`;
    if ((n = el.closest("[data-obj]"))) return esc(n.dataset.obj);
    if ((n = el.closest("[data-path]"))) return `Frame ${q(n.dataset.path.split(".").pop())}`;
    return `Frame ${q("Background")}`;
  }

  /* ---------- Клики по всему экрану + защита от спама ---------- */
  const clicks = [];
  let mutedUntil = 0;
  function ping(x, y, warn) {
    if (reduce) return;
    const p = document.createElement("span");
    p.className = "ping" + (warn ? " warn" : "");
    p.style.left = x + "px"; p.style.top = y + "px";
    document.body.append(p);
    setTimeout(() => p.remove(), 550);
  }
  document.addEventListener("pointerdown", e => {
    if (e.target.closest("#output")) return;
    const now = performance.now();
    clicks.push(now);
    while (clicks.length && now - clicks[0] > 1200) clicks.shift();
    if (clicks.length >= 6 && now > mutedUntil) {
      mutedUntil = now + 2000;
      ping(e.clientX, e.clientY, true);
      out("WARN", `Network: <b>${clicks.length}</b> events in 1.2 s from client. Rate limit, extra events dropped for 2 s`);
      return;
    }
    if (now < mutedUntil) return;
    ping(e.clientX, e.clientY);
    out("INPUT", `${touch ? "Tap" : "Click"} (${Math.round(e.clientX)}, ${Math.round(e.clientY)}) → ${describe(e.target)}`);
  }, { passive: true });
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-net]");
    if (a) out("NET", esc(a.dataset.net));
  });

  /* ---------- Прокрутка, выделение, клавиши, фокус, размер ---------- */
  let lastY = scrollY, scrollTimer;
  addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const pct = max > 0 ? Math.round(scrollY / max * 100) : 0;
      if (Math.abs(scrollY - lastY) > 40) out("INPUT", `Scroll ${scrollY > lastY ? "↓" : "↑"} CanvasPosition.Y = <b>${Math.round(scrollY)}</b> (${pct}%)`);
      lastY = scrollY;
    }, 450);
  }, { passive: true });
  let selTimer, lastSel = "";
  document.addEventListener("selectionchange", () => {
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const sel = getSelection();
      const text = sel ? sel.toString().trim() : "";
      if (text.length < 3 || text === lastSel) return;
      if (sel.anchorNode && output.contains(sel.anchorNode)) return;
      lastSel = text;
      out("INPUT", `TextSelected ${q(clip(text, 40))} (${text.length} chars)`);
    }, 600);
  });
  document.addEventListener("copy", () => {
    const text = (getSelection()?.toString() || "").trim();
    out("OK", `Copied <b>${text.length}</b> chars to clipboard`);
  });
  const KEYS = { Tab: "Tab", Enter: "Return", Escape: "Escape", " ": "Space", ArrowUp: "Up", ArrowDown: "Down",
                 ArrowLeft: "Left", ArrowRight: "Right", PageDown: "PageDown", PageUp: "PageUp", Home: "Home", End: "End" };
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeExplorer();
    if (e.target.closest?.("input, textarea")) return; /* набор текста в полях не логируем */
    const k = KEYS[e.key];
    if (!k) return;
    const t = document.activeElement && document.activeElement !== document.body ? ` on ${describe(document.activeElement)}` : "";
    out("INPUT", `KeyCode.${k}${e.key === "Tab" ? t : ""}`);
  });
  let hiddenAt = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { hiddenAt = performance.now(); out("WARN", "Window lost focus. Server keeps running"); }
    else out("OK", `Welcome back after <b>${Math.round((performance.now() - hiddenAt) / 1000)}</b> s`);
  });
  let idleTimer, idleSince = 0;
  function activity() {
    if (idleSince) { out("OK", `Input resumed after <b>${Math.round((performance.now() - idleSince) / 1000)}</b> s idle`); idleSince = 0; }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { idleSince = performance.now() - 30000; out("INFO", "No input for 30 s. AFK check: still reading?"); }, 30000);
  }
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => addEventListener(ev, activity, { passive: true }));
  activity();
  let rsTimer;
  addEventListener("resize", () => {
    clearTimeout(rsTimer);
    rsTimer = setTimeout(() => out("INFO", `ViewportSize = <b>${innerWidth}×${innerHeight}</b>`), 500);
  });

  /* =====================================================
     ПУТЬ И EXPLORER
     ===================================================== */
  const ICON = { Workspace: "i-workspace", Games: "i-folder", ServerScriptService: "i-server", TextChatService: "i-chat",
                 Players: "i-folder", Kirill: "i-player", Contact: "i-remote" };
  const SECTION_ROW = { Workspace: "top", "Workspace.Games": "projects", ServerScriptService: "systems", TextChatService: "ai", "Players.Kirill": "about", Contact: "contact" };
  let pathNow = "";
  function setPath(path) {
    if (path === pathNow) return;
    track("section", path.split(".").slice(0, 2).join("."));
    const prev = pathNow.split(".");
    pathNow = path;
    $("#pathText").innerHTML = path.split(".").map((seg, i, all) => {
      const ic = ICON[seg] || "i-model";
      const isNew = prev[i] !== seg ? " seg-in" : "";
      const label = i === all.length - 1 ? `<b>${esc(seg)}</b>` : esc(seg);
      return `${i ? "<i>›</i>" : ""}<span class="seg${isNew}"><svg class="ic"><use href="#${ic}"/></svg>${label}</span>`;
    }).join("");
    $$(".row.is-sel").forEach(r => r.classList.remove("is-sel"));
    const g = GAMES.find(x => path.endsWith("." + x.obj));
    const row = g ? $(`.row[data-game="${g.id}"]`) : $(`.row[data-sec="${SECTION_ROW[path] || "top"}"]`);
    row?.classList.add("is-sel");
  }
  const pathBtn = $("#pathBtn"), explorer = $("#explorer");
  function closeExplorer() { explorer.hidden = true; pathBtn.setAttribute("aria-expanded", "false"); }
  pathBtn.addEventListener("click", () => {
    const open = explorer.hidden;
    explorer.hidden = !open;
    pathBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", e => { if (!e.target.closest(".path-wrap")) closeExplorer(); });

  function goTo(id, fromLog) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    closeExplorer();
    if (fromLog) out("NAV", `Jumped to ${esc(el.dataset.path || id)} from Output`);
  }
  document.addEventListener("click", e => {
    const go = e.target.closest("[data-go]");
    if (go) { e.preventDefault(); goTo(go.dataset.go); }
  });
  /* Переход на другую страницу тоже попадает в журнал */
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href^='game.html'], a[href^='index.html']");
    if (a) out("NAV", `TeleportService:Teleport → ${esc(a.getAttribute("href"))}`);
  });

  /* Раздел на экране → путь и запись в Output */
  let holdPath = 0;
  function applyVisible(el) {
    const r = el.getBoundingClientRect();
    if (r.bottom < innerHeight * .4 || r.top > innerHeight * .5) return;
    const p = el.dataset.path;
    if (p !== pathNow) { setPath(p); out("NAV", `Viewport → ${esc(p)}`, el.id || null); }
  }
  const pathIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    if (Date.now() < holdPath) { setTimeout(() => applyVisible(en.target), holdPath - Date.now() + 50); return; }
    applyVisible(en.target);
  }), { rootMargin: "-40% 0px -50% 0px" });
  const observePaths = (root = document) => $$("[data-path]", root).forEach(el => pathIO.observe(el));

  /* =====================================================
     ОБЩИЕ КОМПОНЕНТЫ
     ===================================================== */
  /* Видимость: анимации крутятся только на экране */
  function whenVisible(el, on, off, threshold = .2) {
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? on() : off && off()), { threshold });
    io.observe(el);
    return io;
  }

  /* Обложки листаются каждые 5 с; пауза при наведении. Миниатюры строятся из data-count */
  const COVER_MS = 5000;
  function initCovers(root = document) {
    $$(".cover[data-game]:not([data-init])", root).forEach(cover => {
      cover.dataset.init = "";
      const game = cover.dataset.game, count = +cover.dataset.covers || 1, img = $(".cover-main img", cover);
      if (count < 2) return;
      const name = gameName(byId[game]);
      const nums = Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, "0"));
      cover.insertAdjacentHTML("beforeend",
        `<div class="cover-thumbs" role="group" aria-label="${esc(name)}">` +
        nums.map((n, i) => `<button type="button" aria-pressed="${i === 0}" data-cover="${n}" aria-label="${lang === "en" ? "Cover" : "Обложка"} ${i + 1}"><img src="${thumbSrc(game, i + 1)}" alt="" loading="lazy"><span class="bar"></span></button>`).join("") +
        `</div>`);
      const btns = $$("[data-cover]", cover);
      let idx = 0, timer, left = COVER_MS, start = 0, visible = false;
      function show(i) {
        idx = (i + btns.length) % btns.length;
        btns.forEach((b, k) => {
          b.setAttribute("aria-pressed", String(k === idx));
          const bar = b.querySelector(".bar"); bar.classList.remove("run"); void bar.offsetWidth;
          if (k === idx && !reduce) bar.classList.add("run");
        });
        img.classList.add("fade");
        setTimeout(() => { img.src = thumbSrc(game, +btns[idx].dataset.cover); img.classList.remove("fade"); }, reduce ? 0 : 180);
        schedule(COVER_MS);
      }
      function schedule(ms) {
        clearTimeout(timer);
        if (reduce || !visible) return;
        left = ms; start = performance.now();
        timer = setTimeout(() => show(idx + 1), ms);
      }
      cover.addEventListener("mouseenter", () => { cover.classList.add("paused"); clearTimeout(timer); left -= performance.now() - start; });
      cover.addEventListener("mouseleave", () => { cover.classList.remove("paused"); schedule(Math.max(left, 300)); });
      btns.forEach((b, k) => b.addEventListener("click", () => show(k)));
      whenVisible(cover, () => { visible = true; show(idx); }, () => { visible = false; clearTimeout(timer); }, 0);
    });
  }

  /* Подсветка Luau: код лежит в HTML обычным текстом, разметка строк делается здесь */
  const KW = new Set("local function if then else elseif end return for in do not and or while repeat until nil true false break continue".split(" "));
  function hlLine(raw) {
    let res = "", rest = raw, comment = "";
    let ci = -1;
    for (let i = 0, qch = null; i < raw.length; i++) {
      const ch = raw[i];
      if (qch) { if (ch === qch) qch = null; }
      else if (ch === '"' || ch === "'") qch = ch;
      else if (ch === "-" && raw[i + 1] === "-") { ci = i; break; }
    }
    if (ci >= 0) { comment = raw.slice(ci); rest = raw.slice(0, ci); }
    const re = /("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\s*[({])|([A-Za-z_][A-Za-z0-9_]*)|([^"'A-Za-z0-9_]+)/g;
    let m;
    while ((m = re.exec(rest))) {
      if (m[1]) res += `<span class="st">${esc(m[1])}</span>`;
      else if (m[2]) res += `<span class="nb">${m[2]}</span>`;
      else if (m[3]) res += KW.has(m[3]) ? `<span class="kw">${m[3]}</span>` : `<span class="fn">${m[3]}</span>`;
      else if (m[4]) res += KW.has(m[4]) ? `<span class="kw">${m[4]}</span>` : m[4];
      else res += esc(m[5]);
    }
    if (comment) res += `<span class="cm">${esc(comment)}</span>`;
    return res || " ";
  }
  function highlight(root = document) {
    $$("pre.code:not([data-ready]) code", root).forEach(code => {
      const lines = code.textContent.replace(/^\n/, "").replace(/\n$/, "").split("\n");
      code.innerHTML = lines.map((l, i) => `<span class="ln" data-l="${i + 1}">${hlLine(l)}</span>`).join("");
      code.parentElement.dataset.ready = "";
    });
  }

  /* Счётчик: число «набегает», когда попадает на экран */
  function countUp(el) {
    const target = el.dataset.count;
    const num = parseInt(String(target).replace(/\D/g, ""), 10);
    if (!num || reduce) { el.textContent = target; return; }
    const suffix = /\+$/.test(target) ? "+" : "";
    const t0c = performance.now(), dur = 1100;
    const fmt = n => n.toLocaleString("ru-RU").replace(/ /g, " ");
    (function step(now) {
      const p = Math.min(1, (now - t0c) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(num * e)) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    })(t0c);
  }
  function initCounters(root = document) {
    $$("[data-count]:not([data-counted])", root).forEach(el => {
      el.dataset.counted = "";
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { countUp(el); io.disconnect(); } }, { threshold: .6 });
      io.observe(el);
    });
  }

  /* Копирование контактов */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const text = b.dataset.copy;
    const done = () => {
      b.classList.add("done");
      setTimeout(() => b.classList.remove("done"), 1400);
      out("OK", `Copied ${q(text)} to clipboard`, "contact");
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => out("WARN", "Clipboard is blocked by the browser"));
    else out("WARN", "Clipboard is not available");
  });

  /* =====================================================
     ЯЗЫК: статичные тексты через data-i18n, остальное перерисовывают страницы
     ===================================================== */
  const orig = new Map();
  function applyI18n(root = document) {
    $$("[data-i18n]", root).forEach(el => {
      if (!orig.has(el)) orig.set(el, el.innerHTML);
      const tr = window.I18N?.en?.[el.dataset.i18n];
      el.innerHTML = lang === "en" && tr ? tr : orig.get(el);
    });
  }
  const langHandlers = [];
  function setLang(next) {
    lang = next;
    html.lang = lang;
    if (typeof awardBadge === "function") setTimeout(() => awardBadge("polyglot"), 0);
    try { localStorage.setItem("lang", lang); } catch (e) {}
    $("[data-lang-toggle]").innerHTML = lang === "ru" ? "RU <span>/ EN</span>" : "EN <span>/ RU</span>";
    $(".top-actions .btn-ghost span").textContent = c("pdf");
    $$(".row[data-sec]").forEach(r => { const em = $("em", r); const k = { top: "top", systems: "sys", ai: "ai", about: "about", contact: "contact" }[r.dataset.sec]; if (em && k) em.textContent = c(k); });
    $$("[data-filter]").forEach(b => { b.textContent = c({ all: "all", INPUT: "input", NAV: "nav", NET: "net", ECON: "econ" }[b.dataset.filter]); });
    applyI18n();
    langHandlers.forEach(fn => fn(lang));
    glossify();
    out("INFO", `LocalizationService: locale = <b>${lang}</b>`);
  }
  $("[data-lang-toggle]").addEventListener("click", () => setLang(lang === "ru" ? "en" : "ru"));

  /* =====================================================
     СЕССИЯ ПОСЕТИТЕЛЯ — только в sessionStorage этого браузера, никуда не уходит
     ===================================================== */
  const SESS_KEY = "kv-session";
  const RANK = ["Common", "Rare", "Epic", "Godly"];
  function session() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem(SESS_KEY)); } catch (e) {}
    return s || { t0: Date.now(), sections: [], games: [], chest: 0, best: "", code: 0, contact: 0 };
  }
  function track(kind, v) {
    const s = session();
    if (kind === "section" && !s.sections.includes(v)) s.sections.push(v);
    if (kind === "game" && !s.games.includes(v)) s.games.push(v);
    if (kind === "chest") { s.chest++; if (RANK.indexOf(v) > RANK.indexOf(s.best)) s.best = v; }
    if (kind === "code") s.code++;
    if (kind === "contact") s.contact++;
    try { sessionStorage.setItem(SESS_KEY, JSON.stringify(s)); } catch (e) {}
    if (kind === "chest") awardBadge("lucky");
    if (kind === "game" && s.games.length >= 3) awardBadge("scout");
  }
  track("start");
  document.addEventListener("pointerdown", e => {
    if (e.target.closest(".ln, .kx-tree button, .fl-steps button, .mod-tab, .mp-view button, .boot-run")) track("code");
  }, { passive: true });
  document.addEventListener("click", e => {
    if (e.target.closest("[data-copy], a[href*='t.me'], a[href^='mailto']")) track("contact");
  });

  /* =====================================================
     ПОДСКАЗКИ К ТЕРМИНАМ: первое упоминание на странице получает пояснение
     ===================================================== */
  const TERMS = [
    ["Luau", "Язык программирования Roblox, наследник Lua с типами.", "Roblox’s programming language, a typed successor of Lua."],
    ["R15", "Стандартный аватар Roblox из 15 частей тела.", "The standard Roblox avatar made of 15 body parts."],
    ["Motor6D", "Сустав, который соединяет части тела персонажа и даёт им двигаться.", "A joint that connects a character’s body parts and lets them move."],
    ["ProfileStore", "Популярная сторонняя библиотека для надёжного сохранения данных игрока.", "A popular third-party library for reliably saving player data."],
    ["OrderedDataStore", "Хранилище Roblox, которое умеет отдавать записи по порядку: основа глобальных топов.", "A Roblox store that returns entries in order: the base of global tops."],
    ["MemoryStore", "Быстрая общая память для всех серверов игры: очереди, кэш, замки.", "Fast memory shared by all game servers: queues, caches, locks."],
    ["DataStore", "Постоянное хранилище Roblox для сохранений игроков.", "Roblox’s persistent storage for player saves."],
    ["MicroProfiler", "Профайлер Roblox: показывает, на что тратится каждый кадр.", "Roblox’s profiler: shows what each frame is spent on."],
    ["Rojo", "Инструмент, который синхронизирует код из файлов с Roblox Studio, чтобы работать в Git.", "A tool that syncs code from files into Roblox Studio so the project lives in Git."],
    ["MCP", "Протокол, через который ИИ управляет Roblox Studio: объекты, тесты, плейтест.", "A protocol that lets AI drive Roblox Studio: objects, tests, playtests."],
    ["Open Cloud", "Официальный API Roblox, чтобы работать с данными игры извне, например из Python.", "Roblox’s official API for working with game data from outside, e.g. from Python."],
    ["EventBus", "Шина событий: системы общаются через события и не знают друг о друге напрямую.", "An event bus: systems talk through events and don’t know each other directly."],
    ["retention", "Доля игроков, которые вернулись через день (D1) или неделю (D7).", "The share of players who come back after a day (D1) or a week (D7)."],
    ["QPTR", "Метрика Roblox: сколько из увидевших игру зашли в неё и задержались.", "A Roblox metric: how many people who saw the game joined and stayed."],
    ["CTR", "Доля кликов от показов рекламы или обложки.", "The share of clicks out of impressions of an ad or thumbnail."],
    ["UGC", "Предметы для аватара, которые делают создатели, а не сам Roblox.", "Avatar items made by creators rather than by Roblox itself."],
    ["Robux", "Валюта Roblox, на неё покупают пассы и товары в играх.", "Roblox currency used to buy passes and in-game items."],
    ["плейс", "Отдельное место внутри одной игры Roblox; между плейсами игрок переходит телепортом.", null],
    ["хотфикс", "Срочное исправление, которое выходит без большого обновления.", null],
    ["hotfix", null, "An urgent fix shipped outside a regular update."]
  ];
  let tip = null;
  function glossify(root = document.getElementById("main")) {
    if (!root) return;
    const seen = new Set();
    const skip = "pre, code, a, button, h1, h2, h3, h4, .term, svg, .stack, .brands, .lg, .boot, .fl, .kx, .ac, .output, .explorer, .pl, .ads-vis, .rh, .heat, .itree";
    for (const [term, ru, en] of TERMS) {
      const tipText = lang === "en" ? en : ru;
      if (!tipText || seen.has(term)) continue;
      const re = new RegExp(`(?<![\\p{L}\\d])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\d])`, "iu");
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.parentElement.closest(skip) || !re.test(n.nodeValue)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
      });
      const node = walker.nextNode();
      if (!node) continue;
      const m = node.nodeValue.match(re);
      const after = node.splitText(m.index);
      after.nodeValue = after.nodeValue.slice(m[0].length);
      const span = document.createElement("span");
      span.className = "term"; span.tabIndex = 0; span.dataset.tip = tipText; span.textContent = m[0];
      after.parentNode.insertBefore(span, after);
      seen.add(term);
    }
  }
  function showTip(t) {
    if (!tip) { tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "tooltip"); document.body.append(tip); }
    tip.textContent = t.dataset.tip;
    const r = t.getBoundingClientRect();
    tip.classList.add("on");
    const w = tip.offsetWidth;
    tip.style.left = Math.max(10, Math.min(innerWidth - w - 10, r.left + r.width / 2 - w / 2)) + "px";
    tip.style.top = (r.top - tip.offsetHeight - 8 < 60 ? r.bottom + 8 : r.top - tip.offsetHeight - 8) + "px";
  }
  const hideTip = () => tip && tip.classList.remove("on");
  document.addEventListener("mouseover", e => { const t = e.target.closest(".term"); if (t) showTip(t); });
  document.addEventListener("mouseout", e => { if (e.target.closest(".term")) hideTip(); });
  document.addEventListener("focusin", e => { const t = e.target.closest(".term"); if (t) showTip(t); });
  document.addEventListener("focusout", e => { if (e.target.closest(".term")) hideTip(); });
  addEventListener("scroll", hideTip, { passive: true });
  let tipLogged = new Set();
  document.addEventListener("mouseover", e => {
    const t = e.target.closest(".term");
    if (t && !tipLogged.has(t.textContent)) { tipLogged.add(t.textContent); out("INFO", `Glossary: ${q(t.textContent)}`); }
  });

  /* =====================================================
     Моушен-мелочи в духе Studio
     ===================================================== */
  /* 1. Полоса загрузки под шапкой = сколько страницы прочитано */
  const topbar = $(".topbar");
  if (topbar) {
    const bar = document.createElement("i"); bar.className = "scroll-bar"; bar.setAttribute("aria-hidden", "true"); topbar.append(bar);
    let raf = 0;
    const upd = () => { raf = 0; const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    addEventListener("resize", upd); upd();
  }
  /* 2. Заголовок при первом появлении выделяется рамкой, как объект в Studio */
  function selectBoxes(root = document) {
    if (reduce) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const h = e.target;
      h.insertAdjacentHTML("beforeend", `<span class="selbox" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`);
      h.classList.add("sel-on");
      setTimeout(() => { h.classList.remove("sel-on"); setTimeout(() => $(".selbox", h)?.remove(), 500); }, 1500);
    }), { threshold: 1, rootMargin: "0px 0px -15% 0px" });
    $$(".section-head h2, .gp .chapter > h2", root).filter(h => !h.classList.contains("selectable")).forEach(h => { h.classList.add("selectable"); io.observe(h); });
  }
  /* 3. Карточки игр слегка наклоняются за курсором, по ним скользит блик */
  const TILT = ".tile, .show-media, .nbr, .cover-main";
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let cur = null;
    const reset = el => { el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); el.classList.remove("tilting"); };
    document.addEventListener("pointermove", e => {
      const el = e.target.closest?.(TILT);
      if (cur && cur !== el) { reset(cur); cur = null; }
      if (!el) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const k = el.classList.contains("tile") ? 9 : 4;
      el.style.setProperty("--rx", `${((.5 - y) * k).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - .5) * k).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      el.classList.add("tilting"); cur = el;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { if (cur) reset(cur); cur = null; });
  }
  /* 4. Главные кнопки тянутся к курсору на пару пикселей */
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener("pointermove", e => {
      const b = e.target.closest?.(".btn-solid.big, .btn-ghost.big");
      $$(".magnet").forEach(m => { if (m !== b) { m.classList.remove("magnet"); m.style.transform = ""; } });
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.classList.add("magnet");
      b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 6}px, ${((e.clientY - r.top) / r.height - .5) * 6}px)`;
    }, { passive: true });
  }

  /* 5. Значки, как в Roblox: за то, что посетитель сделал на сайте. Хранятся только в сессии этого браузера */
  const BADGES = {
    scout: ["Разведчик", "Scout", "Открыли страницы трёх игр", "Opened three game pages"],
    lucky: ["Первый сундук", "First chest", "Открыли сундук в демо Staff Farm", "Opened a chest in the Staff Farm demo"],
    architect: ["Архитектор", "Architect", "Прошли экскурсию по плейсу Grow Your Parts", "Finished the Grow Your Parts place tour"],
    dev: ["Скриптер", "Scripter", "Запустили команду в Command Bar", "Ran a command in the Command Bar"],
    reader: ["До конца", "Completionist", "Дочитали главную до конца", "Read the home page to the end"],
    polyglot: ["Полиглот", "Polyglot", "Переключили язык сайта", "Switched the site language"]
  };
  let toastBox = null;
  function awardBadge(key) {
    const b = BADGES[key]; if (!b) return;
    const s = session(); s.badges = s.badges || [];
    if (s.badges.includes(key)) return;
    s.badges.push(key);
    try { sessionStorage.setItem(SESS_KEY, JSON.stringify(s)); } catch (e) {}
    const en = lang === "en", name = en ? b[1] : b[0], text = en ? b[3] : b[2];
    out("OK", `Badge awarded: ${q(name)} <span class="dim">(${s.badges.length}/${Object.keys(BADGES).length})</span>`);
    if (!toastBox) { toastBox = document.createElement("div"); toastBox.className = "toasts"; toastBox.setAttribute("aria-live", "polite"); document.body.append(toastBox); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="toast-ic" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 2l11 5v8c0 7-4.6 12.2-11 15C9.6 27.2 5 22 5 15V7z" fill="#f5c451"/><path d="M16 9l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#7a5410"/></svg></span>
      <span class="toast-t"><small>${en ? "Badge awarded" : "Получен значок"} · ${s.badges.length}/${Object.keys(BADGES).length}</small><b>${esc(name)}</b><span>${esc(text)}</span></span>`;
    toastBox.append(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 500); }, reduce ? 3500 : 4500);
  }
  /* Условия значков */
  addEventListener("scroll", () => {
    if (isHome && innerHeight + scrollY >= document.documentElement.scrollHeight - 40) awardBadge("reader");
  }, { passive: true });
  document.addEventListener("DOMContentLoaded", () => { if ((session().games || []).length >= 3) awardBadge("scout"); });

  /* 6. Переход на страницу игры — как телепорт в Roblox */
  const TP_KEY = "kv-tp";
  function teleport(href, label, icon) {
    if (reduce) { location.href = href; return; }
    const o = document.createElement("div");
    o.className = "tp";
    o.innerHTML = `<div class="tp-card">${icon ? `<img src="${icon}" alt="">` : ""}<small>${lang === "en" ? "Teleporting to" : "Телепорт в"}</small><b>${esc(label)}</b><i class="tp-bar"><i></i></i></div>`;
    document.body.append(o);
    requestAnimationFrame(() => o.classList.add("on"));
    try { sessionStorage.setItem(TP_KEY, JSON.stringify({ label, icon })); } catch (e) {}
    out("NET", `TeleportService:Teleport → ${q(label)}`);
    setTimeout(() => { location.href = href; }, 520);
  }
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]"); if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    const m = href.match(/^game\.html\?g=([\w-]+)/);
    if (m && byId[m[1]]) { e.preventDefault(); teleport(href, gameName(byId[m[1]]), iconSrc(m[1])); return; }
    if (/^index\.html(#.*)?$/.test(href) && !isHome) { e.preventDefault(); teleport(href, lang === "en" ? "Lobby" : "Лобби", null); }
  });
  /* Прибытие: карточка телепорта растворяется уже на новой странице */
  (() => {
    let tp = null;
    try { tp = JSON.parse(sessionStorage.getItem(TP_KEY)); sessionStorage.removeItem(TP_KEY); } catch (e) {}
    if (!tp || reduce) return;
    const o = document.createElement("div");
    o.className = "tp on arrive";
    o.innerHTML = `<div class="tp-card">${tp.icon ? `<img src="${tp.icon}" alt="">` : ""}<small>${lang === "en" ? "Arrived" : "Прибыли"}</small><b>${esc(tp.label)}</b></div>`;
    document.body.append(o);
    setTimeout(() => o.classList.remove("on"), 60);
    setTimeout(() => o.remove(), 700);
  })();

  /* 7. Command Bar под Output, как в Studio */
  const cmdForm = $("#cmd"), cmdIn = $("#cmdIn"), hist = [];
  let histI = 0;
  const say = (lv, msg) => out(lv, msg);
  const COMMANDS = {
    help: () => say("INFO", `help() · games() · open("bonfire") · stats() · badges() · contacts() · resume() · lang("en") · clear()`),
    games: () => GAMES.forEach(g => say("INFO", `<b>${esc(g.id)}</b> · ${esc(gameName(g))} · <span class="num">${esc(g.visits)}</span>`)),
    open: id => { const g = byId[String(id || "").toLowerCase()]; if (!g) return say("WARN", `open: no game ${q(String(id))}. Try games()`); teleport(gameUrl(g.id), gameName(g), iconSrc(g.id)); },
    stats: () => { const s = session(); say("INFO", `Session: <span class="num">${Math.round((Date.now() - s.t0) / 60000)}</span> min · sections <span class="num">${s.sections.length}</span> · games <span class="num">${s.games.length}</span> · chests <span class="num">${s.chest}</span>`); },
    badges: () => { const got = session().badges || []; Object.entries(BADGES).forEach(([k, b]) => say(got.includes(k) ? "OK" : "INFO", `${got.includes(k) ? "✓" : "·"} ${esc(lang === "en" ? b[1] : b[0])} — ${esc(lang === "en" ? b[3] : b[2])}`)); },
    contacts: () => { say("OK", `Telegram: <a href="https://t.me/stf_use" target="_blank" rel="noopener">@stf_use</a>`); say("OK", `Email: <a href="mailto:hellothanksforyou@gmail.com">hellothanksforyou@gmail.com</a>`); },
    resume: () => { say("NET", "Download Kirill_Skorik_Roblox_Developer.pdf"); const a = document.createElement("a"); a.href = "assets/Kirill_Skorik_Roblox_Developer.pdf"; a.download = ""; a.click(); },
    lang: v => { const n = String(v || "").toLowerCase(); if (n !== "ru" && n !== "en") return say("WARN", `lang: expected "ru" or "en"`); setLang(n); },
    clear: () => { log.innerHTML = ""; },
    print: (...a) => say("INFO", esc(a.map(String).join(" ")))
  };
  /* Разбор вида name(arg, "arg") — без eval */
  function runCmd(src) {
    const m = src.trim().match(/^([A-Za-z_]\w*)\s*(?:\((.*)\))?\s*;?$/);
    say("INPUT", `&gt; ${esc(src)}`);
    if (!m) return say("WARN", `Command Bar:1: syntax error near ${q(src.slice(0, 20))}`);
    const fn = COMMANDS[m[1]];
    if (!fn) return say("WARN", `Command Bar:1: attempt to call a nil value (global '${esc(m[1])}'). Try help()`);
    const args = (m[2] || "").split(",").map(x => x.trim()).filter(Boolean).map(x => x.replace(/^["'](.*)["']$/, "$1"));
    fn(...args);
    awardBadge("dev");
  }
  cmdForm.addEventListener("submit", e => { e.preventDefault(); const v = cmdIn.value; if (!v.trim()) return; hist.push(v); histI = hist.length; cmdIn.value = ""; runCmd(v); });
  cmdIn.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && hist.length) { e.preventDefault(); histI = Math.max(0, histI - 1); cmdIn.value = hist[histI]; }
    if (e.key === "ArrowDown" && hist.length) { e.preventDefault(); histI = Math.min(hist.length, histI + 1); cmdIn.value = hist[histI] || ""; }
  });

  window.Site = {
    badge: awardBadge, teleport,
    selectBoxes,
    session, track, glossify, iconSrc, thumbSrc,
    $, $$, esc, q, clip, L, reduce, touch, GAMES, byId, gameName, gameUrl, isHome,
    get lang() { return lang; },
    out, setPath, goTo, observePaths, whenVisible, initCovers, highlight, initCounters, applyI18n,
    onLang: fn => langHandlers.push(fn),
    addDescriber: fn => describers.unshift(fn),
    holdPath: ms => { holdPath = Date.now() + ms; },
    openOutput: () => setOutput(true)
  };

  /* Стартовые сообщения */
  document.addEventListener("DOMContentLoaded", () => {
    if (lang === "en") applyI18n();
    glossify();
    observePaths();
    selectBoxes();
    const boot = [
      ["INFO", lang === "en" ? "Everything you do on the page shows up here, like Output in Roblox Studio" : "Здесь видно всё, что вы делаете на странице, как в Output в Roblox Studio"],
      ["INFO", `Platform: <b>${touch ? "Touch" : "Desktop"}</b>, ViewportSize = <b>${innerWidth}×${innerHeight}</b>`],
      ...(window.BOOT_LOG || []),
      ["OK", "Ready. Fastest reply: t.me/stf_use"]
    ];
    boot.forEach(([lv, m], i) => setTimeout(() => out(lv, m), reduce ? 0 : 200 + i * 380));
    setTimeout(() => { unread = 0; badge.hidden = true; }, reduce ? 10 : 1900);
  });
})();
