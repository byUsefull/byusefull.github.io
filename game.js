/* =====================================================
   GAME — страница одной игры: game.html?g=<id>
   Собирается из GAMES (data.js) и PAGES (content.js).
   ===================================================== */
(() => {
  const S = window.Site;
  const { $, $$, esc, L, GAMES, byId, gameName, gameUrl, out } = S;
  const T = (ru, en) => (S.lang === "en" ? en : ru);
  const params = new URLSearchParams(location.search);
  const id = byId[params.get("g")] ? params.get("g") : "growth";
  const g = byId[id], P = window.PAGES[id];
  const main = $("#main");
  window.BOOT_LOG = [["NAV", `TeleportService: arrived at Workspace.Games.<b>${esc(g.obj)}</b>`]];

  const props = () => P.props.map(([k, v, num]) =>
    `<div><dt>${L(k)}</dt><dd${num ? ` class="num" data-count="${esc(L(v))}"` : ""}>${L(v)}</dd></div>`).join("");
  const links = () => (P.links || []).map(l =>
    `<a class="${l.play ? "btn-solid" : "btn-ghost"}" href="${l.href}" target="_blank" rel="noopener" data-net="Open ${esc(l.href.replace("https://www.", ""))}"><svg class="ic"><use href="#${l.play ? "i-play" : "i-link"}"/></svg><span>${L(l.label)}</span></a>`).join("");

  function chapter(ch, i) {
    const vis = ch.visual ? `<div class="ch-visual" data-widget="${ch.visual}"></div>` : "";
    const code = ch.code ? `<pre class="code" data-script="${ch.code.script}"><code>${esc(ch.code.src)}</code></pre>` : "";
    const notes = ch.notes ? `<dl class="notes-dl">${ch.notes.map(([h, t]) => `<div><dt>${L(h)}</dt><dd>${L(t)}</dd></div>`).join("")}</dl>` : "";
    const list = ch.list ? `<ul class="changelog">${ch.list.map(([tag, t]) => `<li><span class="cl-tag">${tag}</span><span>${L(t)}</span></li>`).join("")}</ul>` : "";
    const blocks = ch.blocks ? `<div class="ch-blocks">${ch.blocks.map(b => b.log
      ? `<div class="incident"><ol class="inc-log">${b.log.map(([lv, m]) => `<li><span class="lv lv-${lv}">${lv}</span><span>${esc(m)}</span></li>`).join("")}</ol><p>${L(b.t)}</p></div>`
      : `<div class="note-block${b.accent ? " accent" : ""}"><h4>${L(b.h)}</h4><p>${L(b.t)}</p></div>`).join("")}</div>` : "";
    /* Раскладка: схема + код рядом, иначе на всю ширину */
    const pair = vis && code ? `<div class="ch-pair${ch.visual === "body" ? " narrow" : ""}">${vis}<div class="ch-code">${code}${notes}</div></div>`
      : `${vis}${code ? `<div class="ch-code">${code}${notes}</div>` : notes}`;
    const side = list && blocks ? `<div class="after-grid">${list}${blocks}</div>` : list + blocks;
    return `<section class="chapter" id="ch-${ch.id}" data-path="Workspace.Games.${g.obj}" aria-labelledby="h-${ch.id}">
      <h2 id="h-${ch.id}">${L(ch.h)}</h2>
      ${ch.text ? `<p class="chapter-text">${L(ch.text)}</p>` : ""}
      ${pair}${side}
      ${ch.caption ? `<p class="caption">${L(ch.caption)}</p>` : ""}
      ${ch.after ? `<p class="chapter-text">${L(ch.after)}</p>` : ""}
    </section>`;
  }

  function neighbors() {
    const i = GAMES.indexOf(g), prev = GAMES[(i - 1 + GAMES.length) % GAMES.length], next = GAMES[(i + 1) % GAMES.length];
    const card = (x, dir) => `<a class="nbr nbr-${dir}" href="${gameUrl(x.id)}">
      <img src="${S.thumbSrc(x.id)}" alt="" loading="lazy">
      <span class="nbr-text"><em>${dir === "prev" ? T("← Предыдущая", "← Previous") : T("Следующая →", "Next →")}</em><b>${esc(gameName(x))}</b><span>${L(x.genre)}</span></span></a>`;
    return `<nav class="gp-nav" aria-label="${T("Другие игры", "Other games")}">${card(prev, "prev")}${card(next, "next")}</nav>`;
  }

  function render() {
    document.title = `${gameName(g)} — ${T("Кирилл Скорик, Roblox-разработчик", "Kirill Skorik, Roblox developer")}`;
    main.innerHTML = `
    <div class="gp-crumbs"><a href="index.html#projects"><svg class="ic"><use href="#i-back"/></svg>${T("Все проекты", "All projects")}</a>
      <span>${GAMES.indexOf(g) + 1} / ${GAMES.length}</span></div>
    <article class="gp" data-path="Workspace.Games.${g.obj}">
      <header class="gp-hero" id="top" data-path="Workspace.Games.${g.obj}">
        <figure class="cover" data-game="${g.id}" data-covers="${g.covers}">
          <div class="cover-main"><img src="${S.thumbSrc(g.id)}" alt="${esc(gameName(g))}" width="768" height="432"></div>
        </figure>
        <div class="gp-head">
          <p class="gp-genre">${L(g.genre)}</p>
          <h1>${esc(gameName(g))}</h1>
          <p class="case-lede">${L(P.lede)}</p>
          <p class="case-role">${L(P.mine)}</p>
          <dl class="case-props">${props()}</dl>
          <div class="gp-links">${links()}</div>
          ${P.status ? `<p class="gp-status">${L(P.status)}</p>` : ""}
        </div>
      </header>
      ${P.notice ? `<aside class="gp-notice"><b>${T("Почему две ссылки", "Why two links")}</b><p>${L(P.notice)}</p></aside>` : ""}
      ${P.chapters.map(chapter).join("")}
      ${P.result ? `<p class="result">${L(P.result)}</p>` : ""}
      ${P.press ? `<section class="chapter press" id="press" data-path="Workspace.Games.${g.obj}" aria-labelledby="h-press">
        <h2 id="h-press">${T("О проекте писали", "Press coverage")}</h2>
        <ul class="press-list">${P.press.map(([src, href, title]) => `<li><a href="${href}" target="_blank" rel="noopener" data-net="Open ${esc(href.replace(/^https?:\/\/(www\.)?/, "").split("/")[0])}"><span class="press-src">${esc(src)}</span><span class="press-title">${L(title)}</span><svg class="ic"><use href="#i-link"/></svg></a></li>`).join("")}</ul>
      </section>` : ""}
    </article>
    ${neighbors()}
    <section class="gp-cta" data-path="Contact">
      <p>${T("Хотите обсудить проект или задать вопрос по этой игре?", "Want to discuss a project or ask about this game?")}</p>
      <a class="btn-solid big" href="https://t.me/stf_use" target="_blank" rel="noopener" data-net="Open t.me/stf_use"><svg class="ic"><use href="#i-send"/></svg>${T("Написать в Telegram", "Message on Telegram")}</a>
      <a class="btn-ghost big" href="index.html#contact"><svg class="ic"><use href="#i-arrow"/></svg>${T("Все контакты", "All contacts")}</a>
    </section>`;
    $$("[data-widget]", main).forEach(el => S.widget(el.dataset.widget, el));
    S.highlight(main);
    S.initCovers(main);
    S.initCounters(main);
    S.observePaths(main);
    S.selectBoxes?.(main);
  }

  S.addDescriber(el => {
    const n = el.closest(".nbr");
    return n ? `TeleportButton ${S.q($("b", n).textContent)}` : null;
  });
  render();
  S.track("game", id);
  S.setPath(`Workspace.Games.${g.obj}`);
  S.onLang(() => { const y = scrollY; render(); scrollTo(0, y); });
})();
