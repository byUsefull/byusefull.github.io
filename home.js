/* =====================================================
   HOME — главная: мозаика и Properties, витрина проектов,
   остальные игры, модули, доска Game Planner.
   ===================================================== */
(() => {
  const S = window.Site;
  const { $, $$, esc, q, L, GAMES, byId, gameName, gameUrl, out, reduce, touch, whenVisible } = S;
  const T = (ru, en) => (S.lang === "en" ? en : ru);
  window.BOOT_LOG = [["INFO", `Workspace.Games loaded: <b>${GAMES.length}</b> games, <b>11 000 000+</b> visits`]];

  /* =====================================================
     МОЗАИКА И PROPERTIES
     ===================================================== */
  const BIG = ["growth", "staff"];
  const mosaic = $(".mosaic"), rows = $("#inspRows"), target = $("#inspTarget");
  const ORDER = ["staff", "growth", "gyp", "bonfire", "kinopoisk", "circle", "spell", "sort", "heat", "leaf", "island", "christmas", "cats", "beavers", "khl", "marmelad"];
  let selected = null;
  function renderMosaic() {
    mosaic.innerHTML = ORDER.map(id => {
      const g = byId[id], big = BIG.includes(id);
      return `<li class="${big ? "feat" : ""}"><button class="tile" type="button" data-game="${id}" aria-pressed="${selected === id}" aria-label="${esc(gameName(g))}">` +
        `<img src="${S.iconSrc(id)}" alt="" ${big ? "" : 'loading="lazy"'}>` +
        (big ? `<span class="tile-cap">${esc(gameName(g))}<span class="num">${esc(L(g.short))}</span></span>` : "") + `</button></li>`;
    }).join("") + `<li class="folder-li"><div class="folder-tile"><svg class="ic"><use href="#i-folder"/></svg><b>Games</b><span>${T(`${GAMES.length} игр`, `${GAMES.length} games`)}</span></div></li>`;
    mosaic.classList.toggle("has-sel", !!selected);
  }
  function renderInspect(list, label) {
    target.textContent = label;
    rows.innerHTML = list.map(r => `<dt>${esc(r.k)}</dt><dd${r.num ? ' class="num"' : ""}>${r.html || esc(r.v)}</dd>`).join("");
    rows.classList.remove("flash"); void rows.offsetWidth; rows.classList.add("flash");
  }
  const folderRows = () => [
    { k: "Children", v: String(GAMES.length), num: 1 },
    { k: T("Свои игры", "Own games"), v: T("12, от идеи до релиза", "12, from idea to release") },
    { k: "MAFF", v: T("3 брендовых проекта", "3 brand projects") },
    { k: T("Приглашён", "Invited"), v: "Don't Leave the Circle" },
    { k: T("Подсказка", "Hint"), v: T("Нажмите на игру, чтобы увидеть её свойства", "Click a game to see its properties") }
  ];
  function gameRows(g) {
    const r = [{ k: "Genre", v: L(g.genre) }, { k: "Visits", v: g.visits, num: 1 }, { k: "Role", v: L(g.role) }];
    if (g.team) r.push({ k: "Team", v: L(g.team) });
    if (g.note) r.push({ k: "Note", v: L(g.note) });
    r.push({ k: "Link", html: `<a href="${gameUrl(g.id)}">${T("Страница игры", "Game page")} →</a> · <a href="${g.url}" target="_blank" rel="noopener" data-net="Open ${esc(g.url.replace("https://www.", ""))}">Roblox</a>` });
    return r;
  }
  function selectGame(id) {
    selected = id === selected ? null : id;
    $$(".tile").forEach(t => t.setAttribute("aria-pressed", String(t.dataset.game === selected)));
    mosaic.classList.toggle("has-sel", !!selected);
    if (selected) {
      const g = byId[selected];
      renderInspect(gameRows(g), `Model “${g.obj}”`);
      S.setPath(`Workspace.Games.${g.obj}`);
      S.holdPath(1500);
      out("NAV", `Selected Workspace.Games.${esc(g.obj)}`, "games");
    } else {
      renderInspect(folderRows(), "Folder “Games”");
      S.setPath("Workspace.Games");
      out("NAV", "Selection cleared");
    }
  }
  mosaic.addEventListener("click", e => { const t = e.target.closest(".tile"); if (t) selectGame(t.dataset.game); });
  S.addDescriber(el => { const n = el.closest(".tile"); return n ? `ImageButton ${q(gameName(byId[n.dataset.game]))}` : null; });

  /* =====================================================
     ВИТРИНА: пять главных игр, листается сама, пока на экране
     ===================================================== */
  const FEAT = GAMES.filter(g => g.featured);
  const show = $("#show");
  let cur = 0, timer = null, showVisible = false, paused = false;
  const SHOW_MS = 7000;
  function renderShow() {
    show.innerHTML = `
      <div class="show-tabs" role="tablist" aria-label="${T("Главные игры", "Main games")}">
        ${FEAT.map((g, i) => `<button type="button" class="show-tab" role="tab" id="st-${g.id}" aria-selected="${i === cur}" aria-controls="show-stage" data-i="${i}">
          <img src="${S.iconSrc(g.id)}" alt="">
          <span class="st-text"><b>${esc(gameName(g))}</b><small>${L(g.genre)}</small></span>
          <em class="num">${esc(L(g.short))}</em><i class="st-prog"></i></button>`).join("")}
      </div>
      <div class="show-stage" id="show-stage" role="tabpanel"></div>`;
    renderStage(false);
  }
  function renderStage(animate = true) {
    const g = FEAT[cur], stage = $(".show-stage", show);
    stage.setAttribute("aria-labelledby", `st-${g.id}`);
    stage.innerHTML = `
      <a class="show-media" href="${gameUrl(g.id)}" aria-label="${esc(gameName(g))}">
        <img class="show-img${reduce ? "" : " kb"}" src="${S.thumbSrc(g.id)}" alt="" width="768" height="432">
        <span class="show-shade"></span>
        <span class="show-hook">${L(g.hook)}</span>
      </a>
      <div class="show-info">
        <div class="show-task"><span>${T("Главная задача", "The main problem")}</span><p>${L(g.task)}</p></div>
        <dl class="show-facts">
          <div><dt>Visits</dt><dd class="num" data-count="${g.visits}">${g.visits}</dd></div>
          <div><dt>${T("Роль", "Role")}</dt><dd>${L(g.role)}</dd></div>
        </dl>
        <div class="show-actions">
          <a class="btn-solid" href="${gameUrl(g.id)}"><span>${T("Вся история", "Full story")}</span><svg class="ic"><use href="#i-arrow"/></svg></a>
          <a class="btn-ghost" href="${g.url}" target="_blank" rel="noopener" data-net="Open ${esc(g.url.replace("https://www.", ""))}"><svg class="ic"><use href="#i-play"/></svg>Roblox</a>
        </div>
      </div>`;
    if (animate && !reduce) { stage.classList.remove("swap"); void stage.offsetWidth; stage.classList.add("swap"); }
    S.initCounters(stage);
    $$(".show-tab", show).forEach((t, i) => {
      t.setAttribute("aria-selected", String(i === cur));
      t.tabIndex = i === cur ? 0 : -1;
      const p = $(".st-prog", t); p.classList.remove("run"); void p.offsetWidth;
      if (i === cur && !reduce && showVisible && !paused) p.classList.add("run");
    });
  }
  function go(i, fromUser) {
    cur = (i + FEAT.length) % FEAT.length;
    renderStage();
    schedule();
    if (fromUser) out("NAV", `Showcase → Workspace.Games.${esc(FEAT[cur].obj)}`, "projects");
  }
  function schedule() {
    clearTimeout(timer);
    if (reduce || !showVisible || paused) return;
    timer = setTimeout(() => go(cur + 1), SHOW_MS);
  }
  show.addEventListener("click", e => { const t = e.target.closest(".show-tab"); if (t) go(+t.dataset.i, true); });
  show.addEventListener("keydown", e => {
    if (!e.target.closest(".show-tab")) return;
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (d) { e.preventDefault(); go(cur + d, true); $$(".show-tab", show)[cur].focus(); }
  });
  const setPaused = v => {
    paused = v; show.classList.toggle("paused", v);
    if (v) clearTimeout(timer); else { const p = $(`.show-tab[data-i="${cur}"] .st-prog`, show); p?.classList.remove("run"); void p?.offsetWidth; if (!reduce && showVisible) p?.classList.add("run"); schedule(); }
  };
  show.addEventListener("mouseenter", () => setPaused(true));
  show.addEventListener("mouseleave", () => setPaused(false));
  show.addEventListener("focusin", () => setPaused(true));
  show.addEventListener("focusout", e => { if (!show.contains(e.relatedTarget)) setPaused(false); });
  whenVisible(show, () => { showVisible = true; renderStage(false); schedule(); }, () => { showVisible = false; clearTimeout(timer); }, .35);
  S.addDescriber(el => { const n = el.closest(".show-tab"); return n ? `TabButton ${q($("b", n).textContent)}` : null; });

  /* =====================================================
     ОСТАЛЬНЫЕ 8 ИГР: строки, превью обложки идёт за курсором
     ===================================================== */
  const more = $("#more");
  function renderMore() {
    const rest = GAMES.filter(g => !g.featured);
    more.innerHTML = `<h3>${T(`Ещё ${rest.length} игр, у каждой своя страница`, `${rest.length} more games, each with its own page`)}</h3>
      <ul class="more-list">${rest.map(g => `<li><a href="${gameUrl(g.id)}" data-prev="${g.id}">
        <img class="more-icon" src="${S.iconSrc(g.id)}" alt="" loading="lazy">
        <span class="more-text"><b>${esc(gameName(g))}</b><small>${L(g.genre)}</small></span>
        <span class="more-meta"><em class="num">${esc(g.visits)}</em><small>${L(g.role)}</small></span>
        <svg class="ic more-arrow"><use href="#i-arrow"/></svg></a></li>`).join("")}</ul>
      <div class="more-peek" aria-hidden="true"><img alt=""></div>`;
  }
  if (!touch && !reduce) {
    let raf = 0, mx = 0, my = 0;
    more.addEventListener("pointermove", e => {
      const a = e.target.closest("[data-prev]"), peek = $(".more-peek", more);
      if (!a) { peek.classList.remove("on"); return; }
      const img = $("img", peek), src = S.thumbSrc(a.dataset.prev);
      if (!img.src.endsWith(src)) img.src = src;
      peek.classList.add("on");
      const r = more.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { peek.style.transform = `translate(${mx + 24}px, ${my - 70}px)`; });
    });
    more.addEventListener("pointerleave", () => $(".more-peek", more).classList.remove("on"));
  }

  /* =====================================================
     МОДУЛИ: как устроены мои игры
     ===================================================== */
  const MODS = [
    { id: "Boot", group: "core", sub: () => T("запуск игры", "game boot"), widget: "boot",
      h: () => T("Запуск: поломка одного модуля не роняет игру", "Boot: one broken module doesn’t take the game down"),
      t: () => T("Сервер находит все сервисы по имени, сортирует их по зависимостям и поднимает в два прохода: Init, потом Start. Если модуль упал, он помечается FAILED, зависящие от него — SKIPPED, а остальная игра работает. Новая система — это просто новый файл.",
                 "The server finds every service by name, sorts them by dependencies and brings them up in two passes: Init, then Start. If a module fails it’s marked FAILED, its dependents SKIPPED, and the rest of the game keeps working. A new system is just a new file.") },
    { id: "Trace", group: "core", sub: () => T("путь одной покупки", "one purchase, traced"), widget: "flow",
      h: () => T("Путь одной покупки через все слои", "One purchase traced through every layer"),
      t: () => T("Клиент только просит, сервер проверяет и решает, у каждого состояния один владелец, а остальные системы узнают о покупке из событий. Нажмите на любой шаг.",
                 "The client only asks, the server checks and decides, every piece of state has one owner, and other systems learn about the purchase from events. Click any step.") },
    { id: "GrowYourParts", group: "place", sub: () => T("живой плейс целиком", "the whole live place"), widget: "place",
      h: () => T("Пример архитектуры из игры Grow Your Parts", "Architecture example from Grow Your Parts"),
      t: () => T("Вся иерархия живого плейса, как в Explorer в Studio: Workspace с пятью зонами, ReplicatedFirst с экраном загрузки, код систем в ReplicatedStorage и ServerStorage, шаблоны моделей и интерфейса, готовые окна в StarterGui. Откройте любой объект — в Properties будет, что он делает.",
                 "The whole live place hierarchy, like Studio’s Explorer: Workspace with five zones, ReplicatedFirst with the loading screen, system code in ReplicatedStorage and ServerStorage, model and UI templates, ready windows in StarterGui. Open any object and Properties shows what it does.") },
    { id: "Network", group: "sys", sub: () => T("сеть и защита", "network and protection"), widget: "chest",
      h: () => T("Сеть: сервер не верит клиенту", "Network: the server doesn’t trust the client"),
      t: () => T("В Growth сервер принимал с клиента не больше 12 кликов в секунду. Теперь это общее правило: каждый канал объявляется с лимитом частоты и проверкой данных, а без проверки обработчик не зарегистрируется. Ниже — как это выглядит в Staff Farm: попробуйте открыть сундук.",
                 "In Growth the server accepted no more than 12 clicks per second from a client. Now it’s a general rule: every channel is declared with a rate limit and a payload check, and without a check the handler won’t register. Below is how it looks in Staff Farm: try opening a chest."),
      code: `-- Network: каждый запрос клиента проходит через guard
local function guard(player: Player, channel, payload, opts): boolean
	-- 1. Частота: минимальный интервал на игрока и канал
	if not throttle:allow(player.UserId, channel.name, channel.rate, os.clock()) then
		return reject(player, channel.name, "Throttled")
	end
	-- 2. Игрок загрузился и готов принимать события
	if not opts.beforeReady and not isReady(player) then
		return reject(player, channel.name, "NotReady")
	end
	-- 3. Форма и типы данных; сбой валидатора тоже отказ
	local ok, valid = pcall(opts.validate, payload, player)
	if not ok or not valid then
		return reject(player, channel.name, if ok then "BadRequest" else "ValidatorError")
	end
	return true
end` },
    { id: "DataSessions", group: "sys", sub: () => T("сохранения", "saving"), widget: "session",
      h: () => T("Сохранения: игрок вышел посреди загрузки", "Saving: the player left mid-load"),
      t: () => T("В ранних проектах игроки теряли прогресс, поэтому я перешёл на ProfileStore — это сторонняя библиотека, её автор loleris. Моя обёртка закрывает редкий случай: игрок уже вышел, а профиль ещё загружался.",
                 "In early projects players lost progress, so I moved to ProfileStore, a third-party library by loleris. My wrapper covers a rare case: the player has already left while the profile was still loading."),
      code: `-- DataSessions: открыть профиль игрока
function DataSessions.open(store, player: Player)
	local session = store:StartSessionAsync("Player_" .. player.UserId, {
		-- Пока профиль грузится, ProfileStore спрашивает: ещё ждать?
		Cancel = function()
			return player.Parent ~= Players
		end,
	})
	if not session then
		return nil
	end
	-- Игрок вышел ровно в момент загрузки: сразу отпускаем сессию
	if player.Parent ~= Players then
		session:EndSession()
		return nil
	end
	session:AddUserId(player.UserId) -- для запросов на удаление данных
	return session
end` },
    { id: "Logger", group: "sys", sub: () => T("логи по уровням", "leveled logs"), widget: "logger",
      h: () => T("Logger: Output этого сайта устроен так же", "Logger: this site’s Output works the same way"),
      t: () => T("У каждой системы своя область логов и уровни Debug, Info, Warn, Critical. В Studio видно всё, в живой игре — только важное, а уровень области можно поменять на лету. Строка форматируется только после проверки уровня, поэтому отключённый Debug почти ничего не стоит.",
                 "Each system has its own log scope and Debug, Info, Warn, Critical levels. Studio shows everything, the live game shows only what matters, and a scope’s level can change on the fly. A line is formatted only after the level check, so a disabled Debug costs almost nothing."),
      code: `-- Logger: одна строка лога
local function emit(self, level: number, message: string, ...)
	-- Сначала фильтр уровня, форматирование только для нужных строк
	if not self.permanent and level < levelFor(self.scope) then
		return
	end
	local ok, body = pcall(string.format, message, ...)
	if not ok then
		body = message .. "  <!format failed>"
	end
	local line = string.format("[%s][%s] %s", SIDE, self.scope, body)
	if level >= Level.Warn then warn(line) else print(line) end
end` },
    { id: "BugReports", group: "sys", sub: () => T("обратная связь", "player feedback"), widget: "bugflow",
      h: () => T("Багрепорты: игрок сам рассказывает, что сломалось", "Bug reports: players tell me what broke"),
      t: () => T("В описании Growth есть строка: «Нашли ошибку? Используйте меню сообщения об ошибке в игре». За ней — окно, где игрок пишет, что случилось, а остальное система собирает сама. Так я узнаю, на что жалуются игроки, даже если они не пишут в Discord.",
                 "Growth’s description says: “Found a bug? Use the bug report menu in the game.” Behind it is a window where the player writes what happened, and the system gathers the rest. That’s how I learn what players complain about, even if they never write on Discord.") },
    { id: "Analytics", group: "sys", sub: () => T("данные и решения", "data and decisions"), widget: "pipe",
      h: () => T("Аналитика: на каком шаге уходят игроки", "Analytics: the step where players leave"),
      t: () => T("События игры идут в Roblox Analytics и в мой журнал сессий. Python-скрипты забирают их через Open Cloud, и я смотрю, где игроки уходят, где не хватает валюты, сколько попыток уходит на бой. Рядом — метрики самого Roblox: retention D1/D7, playtime, QPTR. Последнее действие перед выходом — повод для гипотезы, а не доказанная причина.",
                 "Game events go into Roblox Analytics and my own session log. Python scripts pull them through Open Cloud, and I look at where players leave, where they run short of currency and how many tries a fight takes. Alongside — Roblox’s own metrics: retention D1/D7, playtime, QPTR. The last action before leaving is a reason for a hypothesis, not a proven cause.") }
  ];
  const mods = $("#mods");
  let modCur = 0, modView = "demo";
  function renderMods() {
    const tab = (m, i) => `<button type="button" role="tab" class="mod-tab${m.group === "place" ? " place" : ""}" id="mt-${m.id}" aria-selected="${i === modCur}" data-i="${i}"><svg class="ic"><use href="#${m.group === "core" ? "i-server" : m.group === "place" ? "i-workspace" : "i-module"}"/></svg><span><b>${m.group === "place" ? "Grow Your Parts" : m.id}</b><small>${m.sub()}</small></span>${m.group === "place" ? `<i class="mod-live">LIVE</i>` : ""}</button>`;
    mods.innerHTML = `<div class="mods-list" role="tablist" aria-label="${T("Модули", "Modules")}">
        <span class="mods-group">${T("Каркас", "Framework")}</span>
        ${MODS.map((m, i) => m.group === "core" ? tab(m, i) : "").join("")}
        <span class="mods-group">${T("Пример из игры", "From a real game")}</span>
        ${MODS.map((m, i) => m.group === "place" ? tab(m, i) : "").join("")}
        <span class="mods-group">${T("Системы", "Systems")}</span>
        ${MODS.map((m, i) => m.group === "sys" ? tab(m, i) : "").join("")}
      </div>
      <div class="mods-panel" role="tabpanel"></div>`;
    renderPanel(false);
  }
  function renderPanel(animate = true) {
    const m = MODS[modCur], panel = $(".mods-panel", mods);
    panel.setAttribute("aria-labelledby", `mt-${m.id}`);
    if (!m.code) modView = "demo";
    panel.innerHTML = `<div class="mp-head"><h3>${m.h()}</h3>
        ${m.code ? `<div class="mp-view" role="group"><button type="button" data-v="demo" aria-pressed="${modView === "demo"}">${m.widget === "chest" ? T("Демо", "Demo") : T("Схема", "Diagram")}</button><button type="button" data-v="code" aria-pressed="${modView === "code"}">${T("Код", "Code")}</button></div>` : ""}</div>
      <p class="mp-text">${m.t()}</p>
      <div class="mp-body">${modView === "code" ? `<pre class="code" data-script="${m.id}"><code>${esc(m.code)}</code></pre>` : `<div data-widget="${m.widget}"></div>`}</div>`;
    if (modView === "code") S.highlight(panel); else S.widget(m.widget, $("[data-widget]", panel));
    if (animate && !reduce) { panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap"); }
    $$(".mod-tab", mods).forEach((t, i) => { t.setAttribute("aria-selected", String(i === modCur)); t.tabIndex = i === modCur ? 0 : -1; });
  }
  mods.addEventListener("click", e => {
    const t = e.target.closest(".mod-tab");
    if (t) { modCur = +t.dataset.i; modView = "demo"; renderPanel(); out("NAV", `ServerScriptService.<b>${MODS[modCur].id}</b> opened`, "systems"); return; }
    const v = e.target.closest("[data-v]");
    if (v) { modView = v.dataset.v; renderPanel(false); out("INFO", `ScriptEditor: ${MODS[modCur].id} → ${modView}`); }
  });
  mods.addEventListener("keydown", e => {
    if (!e.target.closest(".mod-tab")) return;
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (d) { e.preventDefault(); modCur = (modCur + d + MODS.length) % MODS.length; modView = "demo"; renderPanel(); $$(".mod-tab", mods)[modCur].focus(); }
  });
  S.addDescriber(el => { const n = el.closest(".mod-tab"); return n ? `ModuleScript ${q($("b", n).textContent)}` : null; });

  /* =====================================================
     ИИ: карточка Game Planner проходит статусы
     ===================================================== */
  const planner = $("#planner");
  function renderAI() {
    planner.innerHTML = `<div class="planner-intro">
        <h3>${T("Одна фича от просьбы до приёмки", "One feature from request to acceptance")}</h3>
        <p>${T("Каждая фича — карточка в моём Game Planner: что я хочу, какие решения приняты, что проверено. Код синхронизирую со Studio через Rojo, с объектами и тестами работаю через MCP. ИИ пишет и проверяет, а я решаю, сам играю и не принимаю, пока не нравится. Ниже — первая карточка Grow Your Parts.",
               "Every feature is a card in my Game Planner: what I want, what’s decided, what’s been checked. I sync code with Studio through Rojo and work with objects and tests through MCP. AI writes and checks; I decide, play it myself and don’t accept until I like it. Below is the first card of Grow Your Parts.")}</p>
      </div>
      <div data-widget="aichat"></div>`;
    S.widget("aichat", $("[data-widget]", planner));
  }
  /* ---------- Запуск и смена языка ---------- */
  function renderAll() {
    renderMosaic();
    if (selected) renderInspect(gameRows(byId[selected]), `Model “${byId[selected].obj}”`); else renderInspect(folderRows(), "Folder “Games”");
    renderShow(); renderMore(); renderMods(); renderAI();
    $$("main > section [data-widget]").forEach(el => { if (!el.closest("#mods, #planner")) S.widget(el.dataset.widget, el); });
  }
  renderAll();
  S.initCounters();
  S.setPath("Workspace");
  S.onLang(() => { renderAll(); });
})();
