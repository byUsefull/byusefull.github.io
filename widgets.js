/* =====================================================
   WIDGETS — схемы и демо, общие для главной и страниц игр.
   Каждая анимация объясняет механику игры и крутится только на экране.
   Site.widget(name, el) — вставить и запустить.
   ===================================================== */
(() => {
  const S = window.Site;
  const { $, $$, esc, q, out, reduce, whenVisible } = S;
  const T = (ru, en) => (S.lang === "en" ? en : ru);
  const W = {};

  /* Цикл шагов, который идёт только пока элемент на экране */
  function loop(el, steps, gap) {
    let i = 0, timer = null;
    const tick = () => {
      if (!el.isConnected) { timer = null; return; } /* блок перерисован — старый цикл гаснет */
      steps(i++); timer = setTimeout(tick, typeof gap === "function" ? gap(i) : gap);
    };
    whenVisible(el, () => { if (!timer) tick(); }, () => { clearTimeout(timer); timer = null; });
  }

  /* ---------- Growth: тело отрастает по частям в порядке из конфига ---------- */
  const PARTS = [
    ["Head", 84, 8, 52, 46, 12], ["UpperTorso", 72, 60, 76, 52, 5], ["LowerTorso", 76, 114, 68, 28, 5],
    ["RightUpperArm", 40, 60, 28, 36, 5], ["LeftUpperArm", 152, 60, 28, 36, 5],
    ["RightLowerArm", 40, 98, 28, 34, 5], ["LeftLowerArm", 152, 98, 28, 34, 5],
    ["RightHand", 42, 134, 24, 20, 5], ["LeftHand", 154, 134, 24, 20, 5],
    ["RightUpperLeg", 76, 146, 32, 56, 5], ["LeftUpperLeg", 112, 146, 32, 56, 5],
    ["RightLowerLeg", 78, 204, 28, 56, 5], ["LeftLowerLeg", 114, 204, 28, 56, 5]
  ];
  W.body = el => {
    el.innerHTML = `<figure class="body-fig">
      <svg viewBox="0 0 220 290" role="img" aria-label="${T("Порядок роста частей тела R15", "R15 body part growth order")}">
        ${PARTS.map(([n, x, y, w, h, r], i) => `<g class="bp${i === 0 ? " on" : ""}" data-i="${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/><text x="${x + w / 2}" y="${y + h / 2 + 5}">${i}</text></g>`).join("")}
        <g class="bp-off"><rect x="74" y="264" width="34" height="16" rx="4"/><rect x="112" y="264" width="34" height="16" rx="4"/></g>
      </svg>
      <figcaption><span class="body-now">${T("Растёт", "Growing")}: <b>Head</b></span><span class="body-bar"><i></i></span></figcaption>
    </figure>`;
    const parts = $$(".bp", el), now = $(".body-now b", el), bar = $(".body-bar i", el), fig = $(".body-fig", el);
    if (reduce) { parts.forEach(p => p.classList.add("on")); now.textContent = T("всё тело", "full body"); bar.style.width = "100%"; return; }
    let logged = false;
    loop(el, i => {
      const k = i % (PARTS.length + 3);
      if (k === 0) { parts.forEach((p, j) => p.classList.toggle("on", j === 0)); fig.classList.remove("full"); }
      if (k < PARTS.length) {
        parts[k].classList.add("on", "pop");
        setTimeout(() => parts[k].classList.remove("pop"), 400);
        now.textContent = PARTS[k][0];
        bar.style.width = ((k + 1) / PARTS.length * 100) + "%";
      } else if (k === PARTS.length) {
        fig.classList.add("full");
        now.textContent = T("цикл тела завершён, +Wins", "body cycle complete, +Wins");
        if (!logged) { logged = true; out("ECON", "GrowthService: body cycle complete, Wins awarded for every part"); }
      }
    }, 420);
  };

  /* ---------- Staff Farm: сундук открывает сервер (единственный интерактив) ---------- */
  W.chest = el => {
    el.innerHTML = `<div class="chest-demo">
      <div class="wire" aria-hidden="true"><span class="wire-end">Client</span><span class="wire-line"><span class="packet"></span></span><span class="wire-end">Server</span></div>
      <div class="chest-body">
        <div class="client">
          <div class="client-top"><span>${T("Баланс", "Balance")}</span><b class="num money">$300</b></div>
          <div class="slot" data-r="none" aria-live="polite"><span class="slot-name">${T("Сундук закрыт", "Chest is closed")}</span><span class="slot-sub"></span></div>
          <button type="button" class="btn-solid open-btn"><span>${T("Открыть сундук", "Open chest")}</span> <span class="price">$100</span></button>
          <button type="button" class="toggle luck" aria-pressed="false"><span class="knob"></span><span>${T("Зелье удачи ×2", "Luck potion ×2")}</span></button>
          <p class="client-hint">${T("Попробуйте нажимать очень часто или потратить все деньги.", "Try clicking very fast or spending all the money.")}</p>
          <button type="button" class="refill" hidden>${T("Вернуть $300", "Give back $300")}</button>
        </div>
        <pre class="code" data-script="ChestService" aria-label="${T("Пример кода на Luau: открытие сундука на сервере", "Luau example: opening a chest on the server")}"><code>-- ChestService (сервер)
Network.on("OpenChest", function(player, chestId)
	-- Не чаще раза в 0,5 с: защита от спама
	if not RateLimit.allow(player, "OpenChest", 0.5) then return end

	-- Клиенту не верим: такой сундук есть и он по карману
	local chest = Chests[chestId]
	if not chest then return end
	if not Wallet.spend(player, chest.price) then
		return Network.fire(player, "Notify", "NotEnoughMoney")
	end

	-- Редкость выпадает здесь, удача игрока сдвигает шансы
	local rarity = Roll.weighted(chest.drops, Luck.get(player))
	local staff = Inventory.add(player, chest.pool[rarity])

	-- Клиент получает только результат и сам играет анимацию
	Network.fire(player, "ChestOpened", staff.id, rarity)
end)</code></pre>
      </div>
    </div>
    <p class="caption">${T("Упрощённый пример принципа: названия модулей и шансы условные. Шансы: Common 60%, Rare 28%, Epic 10%, Godly 2%.", "A simplified example of the principle: module names and odds are illustrative. Odds: Common 60%, Rare 28%, Epic 10%, Godly 2%.")}</p>`;
    S.highlight(el);
    const lines = $$(".ln", el);
    lines.forEach(l => l.insertAdjacentHTML("beforeend", `<i class="iv"></i>`));
    const PRICE = 100, START = 300, DROPS = [["Common", 60], ["Rare", 28], ["Epic", 10], ["Godly", 2]];
    let money = START, luck = 1, lastAccepted = -1e9, timers = [], dropUntil = 0;
    const moneyEl = $(".money", el), slot = $(".slot", el), slotName = $(".slot-name", el), slotSub = $(".slot-sub", el), packet = $(".packet", el), refill = $(".refill", el);
    const fmt = n => "$" + n.toLocaleString("ru-RU").replace(/ /g, " ");
    const ln = n => lines[n - 1];
    const iv = (n, text, cls) => { const i = $(".iv", ln(n)); i.textContent = text; i.className = "iv " + (cls || ""); };
    const line = (n, cls) => ln(n).classList.add(cls || "run");
    const resetCode = () => { lines.forEach(l => l.classList.remove("run", "bad")); [4, 8, 9, 14, 18].forEach(n => iv(n, "")); };
    const shoot = kind => { packet.className = "packet"; void packet.offsetWidth; packet.className = "packet " + kind; };
    const show = (r, name, sub) => {
      slot.dataset.r = r; slotName.textContent = name; slotSub.textContent = sub || "";
      slot.classList.remove("reveal", "shake"); void slot.offsetWidth;
      slot.classList.add(r === "error" ? "shake" : "reveal");
    };
    const roll = () => {
      const w = DROPS.map(([n, p]) => [n, n === "Common" ? p : p * luck]);
      const total = w.reduce((s, [, p]) => s + p, 0);
      let x = Math.random() * total;
      for (const [n, p] of w) if ((x -= p) < 0) return [n, Math.round(p / total * 100)];
      return ["Common", 0];
    };
    const later = (ms, fn) => timers.push(setTimeout(fn, reduce ? 0 : ms));
    $(".open-btn", el).addEventListener("click", () => {
      const now = performance.now();
      out("NET", `Client → Server: OpenChest(${q("wooden")})`);
      if (now - lastAccepted < 500) {
        shoot("fail");
        lines.forEach(l => l.classList.remove("bad"));
        line(4, "bad"); iv(4, T("отброшен", "dropped"), "no"); dropUntil = now + 700;
        show("error", T("Запрос отброшен", "Request dropped"), T("чаще раза в 0,5 с нельзя", "max once per 0.5 s"));
        out("WARN", "ChestService:<b>4</b> RateLimit dropped OpenChest from client");
        return;
      }
      lastAccepted = now;
      timers.forEach(clearTimeout); timers = [];
      resetCode(); shoot("go");
      slot.dataset.r = "none"; slotName.textContent = "…"; slotSub.textContent = "";
      later(380, () => { if (performance.now() > dropUntil) { line(4); iv(4, "ok", "ok"); } });
      later(540, () => { line(8); iv(8, "ok", "ok"); });
      later(700, () => {
        if (money < PRICE) {
          line(9, "bad"); line(10, "bad"); iv(9, T("нет денег", "no money"), "no");
          shoot("back");
          show("error", T("Не хватает денег", "Not enough money"), T(`нужно ${fmt(PRICE)}`, `${fmt(PRICE)} needed`));
          refill.hidden = false;
          out("WARN", "Server → Client: Notify(<q>NotEnoughMoney</q>)");
          return;
        }
        money -= PRICE; moneyEl.textContent = fmt(money);
        line(9); iv(9, "−$100", "ok");
        later(160, () => {
          const [r, chance] = roll();
          line(14); line(15); iv(14, r, "gold");
          later(180, () => {
            line(18); iv(18, "→ client", "ok"); shoot("back");
            later(380, () => {
              show(r, r, T(`шанс ${chance}%${luck > 1 ? ", с зельем удачи" : ""}`, `chance ${chance}%${luck > 1 ? ", with luck potion" : ""}`));
              out("ECON", `ChestService: rolled <b>${r}</b> (${chance}%), balance ${fmt(money)}`);
              S.track("chest", r);
            });
          });
        });
      });
    });
    $(".luck", el).addEventListener("click", e => {
      const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
      e.currentTarget.setAttribute("aria-pressed", String(on));
      luck = on ? 2 : 1;
      out("ECON", `Luck multiplier = <b>×${luck}</b>`);
    });
    refill.addEventListener("click", () => {
      money = START; moneyEl.textContent = fmt(money); refill.hidden = true;
      show("none", T("Сундук закрыт", "Chest is closed"), "");
      out("ECON", `Balance restored to ${fmt(START)}`);
    });
  };

  /* ---------- Кинопоиск: результат мини-игры идёт через каркас в лобби ---------- */
  const PLACES = [["Этерна", "Eterna"], ["Майор Гром", "Major Grom"], ["Иные", "The Others"], ["Луана", "Luana"],
                  ["Кибердеревня", "Cyber Village"], ["Барсукот", "Barsukot"], ["Смешарики", "Smeshariki"], ["Король и Шут", "Korol i Shut", 1]];
  W.arch = el => {
    el.innerHTML = `<div class="arch" role="img" aria-label="${T("Схема: мини-игры сдают результат в общий каркас, каркас сохраняет данные и обновляет лидерборды лобби", "Diagram: mini-games report results to the shared framework, which saves data and updates the lobby leaderboards")}">
      <div class="arch-tier">
        <span class="arch-label">${T("8 мини-игр: отдельные плейсы, их делали пять программистов", "8 mini-games: separate places built by five programmers")}</span>
        <ul class="arch-places">${PLACES.map(([ru, en, mine], i) => `<li data-i="${i}"${mine ? ' class="mine"' : ""}>${T(ru, en)}${mine ? `<em>${T("моя", "mine")}</em>` : ""}</li>`).join("")}</ul>
      </div>
      <div class="arch-flow"><span class="arch-dot"></span><span>${T("результат ↓", "result ↓")}</span><span>${T("↑ телепорт", "↑ teleport")}</span></div>
      <div class="arch-tier mine">
        <span class="arch-label">${T("Общий каркас — моя часть", "Shared framework — my part")}</span>
        <ul class="arch-mods">
          <li data-m="Data"><b>Data</b><span>${T("один профиль на все плейсы", "one profile for all places")}</span></li>
          <li data-m="Leaderboard"><b>Leaderboard</b><span>${T("рейтинги мини-игр", "mini-game rankings")}</span></li>
          <li data-m="Teleport"><b>Teleport</b><span>${T("лобби ⇄ мини-игра", "lobby ⇄ mini-game")}</span></li>
          <li data-m="Avatar"><b>Avatar</b><span>${T("одежда героев", "character outfits")}</span></li>
        </ul>
      </div>
      <div class="arch-flow"><span>↓</span><span>↓</span></div>
      <div class="arch-tier arch-bottom">
        <div data-m="Lobby"><b>${T("Лобби", "Lobby")}</b><span>${T("таблицы всех мини-игр, магазин одежды за вайбики", "tables of every mini-game, an outfit shop for vibes")}</span></div>
        <div data-m="DataStore"><b>DataStore</b><span>${T("общие данные игрока", "shared player data")}</span></div>
      </div>
    </div>`;
    if (reduce) return;
    const places = $$(".arch-places li", el), mods = n => $(`[data-m="${n}"]`, el);
    const flash = (n, ms = 700) => { const m = typeof n === "string" ? mods(n) : n; m.classList.add("hot"); setTimeout(() => m.classList.remove("hot"), ms); };
    loop(el, i => {
      const p = places[(i * 3) % places.length];
      flash(p, 900);
      setTimeout(() => flash("Data"), 450);
      setTimeout(() => flash("Leaderboard"), 700);
      setTimeout(() => { flash("DataStore"); flash("Lobby", 900); }, 1050);
      setTimeout(() => flash("Teleport"), 1500);
    }, 2300);
  };

  /* ---------- Heat: 27 стадий нагрева, цвета из документа стадий ---------- */
  const HEAT = [[0,120,255],[111,182,255],[234,194,164],[255,180,122],[255,138,74],[255,106,46],[255,74,30],[255,44,16],[224,20,0],[255,116,102],[255,179,170],[255,255,255],[120,120,120],[170,80,60],[210,60,40],[255,40,40],[200,80,90],[140,40,60],[90,40,30],[107,60,44],[26,11,11],[47,22,51],[69,33,91],[90,44,131],[112,55,171],[133,66,213],[154,77,255]];
  const HEAT_FX = [[0, 3, "Frost", "иней на ступнях"], [4, 6, "Smoke", "дым на ступнях"], [6, 9, "Fire", "огонь на голове и торсе"], [9, 12, "Shine · Neon", "сияние, белый неон"],
                   [12, 18, "CrackedLava · Wings", "трескающаяся лава и крылья"], [18, 21, "DarkSmoke", "чёрный дым"], [21, 26, "Gunpowder", "порох на руках и торсе"], [26, 27, "—", "финальный цвет"]];
  const HEAT_EN = { "иней на ступнях": "frost on the feet", "дым на ступнях": "smoke on the feet", "огонь на голове и торсе": "fire on head and torso", "сияние, белый неон": "shine, white neon",
                    "трескающаяся лава и крылья": "cracked lava and wings", "чёрный дым": "dark smoke", "порох на руках и торсе": "gunpowder on arms and torso", "финальный цвет": "final color" };
  W.heat = el => {
    el.innerHTML = `<div class="heat">
      <div class="heat-now"><span class="heat-swatch"></span><div><b class="heat-stage">1</b><span class="heat-fx"></span></div></div>
      <ol class="heat-strip">${HEAT.map((c, i) => `<li style="--c:rgb(${c})" title="${i + 1}"></li>`).join("")}</ol>
      <div class="heat-scale"><span>1</span><span>12 · Neon</span><span>13 · Lava</span><span>27</span></div>
    </div>`;
    const cells = $$(".heat-strip li", el), sw = $(".heat-swatch", el), st = $(".heat-stage", el), fx = $(".heat-fx", el);
    const set = k => {
      cells.forEach((c, j) => c.classList.toggle("on", j <= k));
      sw.style.setProperty("--c", `rgb(${HEAT[k]})`);
      st.textContent = T(`Стадия ${k + 1}`, `Stage ${k + 1}`);
      const g = HEAT_FX.find(([a, b]) => k >= a && k < b) || HEAT_FX[0];
      fx.textContent = `${g[2]} · ${T(g[3], HEAT_EN[g[3]])}`;
    };
    if (reduce) { set(HEAT.length - 1); return; }
    loop(el, i => set(i % (HEAT.length + 4) >= HEAT.length ? HEAT.length - 1 : i % (HEAT.length + 4)), 380);
  };

  /* ---------- Island: от моста к пяти веткам, 98 кнопок ---------- */
  const BRANCHES = [["Camp Fire", "Костёр", 11], ["Treasure Hunt", "Поиск сокровищ", 12], ["Statue & WC", "Статуи", 24], ["Hut Build", "Хижина", 38], ["SOS Raft", "Плот SOS", 11]];
  W.tree = el => {
    el.innerHTML = `<div class="itree">
      <div class="itree-root"><span>WoodBridge</span><i>→</i><span>SandGround</span></div>
      <ul class="itree-ways">${BRANCHES.map(([en, ru, n], i) => `<li style="--n:${n}"><b>Way0${i + 1}</b><span>${T(ru, en)}</span><span class="itree-bar"><i></i></span><em class="num">${n}</em></li>`).join("")}</ul>
      <p class="itree-total">${T("Первый остров", "First island")}: <b class="num">98</b> ${T("кнопок, каждую создал и расставил скрипт", "buttons, each created and placed by a script")}</p>
      <div class="itree-next"><span>Island2</span>${T("обновление: второй остров, всего кнопок", "update: a second island, buttons in total")} <b class="num">400+</b></div>
    </div>`;
    const ways = $$(".itree-ways li", el);
    if (reduce) { ways.forEach(w => w.classList.add("on")); return; }
    loop(el, i => {
      const k = i % (ways.length + 3);
      if (k === 0) ways.forEach(w => w.classList.remove("on"));
      if (k < ways.length) ways[k].classList.add("on");
    }, 700);
  };

  /* ---------- Christmas: кривая цены и дохода кнопок (реальная таблица) ---------- */
  const PRICES = [[0,1],[30,4],[80,6],[150,10],[275,12],[500,16],[750,22],[1300,28],[2100,38],[2800,50],[4200,60],[6000,85],[10000,125],[18000,160],[25000,195],[33000,235],[42500,300],[62500,460],[85000,625],[125000,825],[180000,1100],[260000,1500],[375000,1850],[575000,2250],[775000,2650],[1000000,3100],[1700000,3800],[2500000,4600],[3300000,5800],[4250000,9500],[6000000,13000],[7650000,18000],[9500000,30000],[16000000,37000],[23000000,44000],[31000000,54000],[39000000,70000],[47000000,86000],[62500000,130000],[95000000,210000]];
  W.prices = el => {
    const w = 640, h = 260, pad = 34, n = PRICES.length;
    const y = v => h - pad - Math.log10(v + 1) / 8.2 * (h - pad * 2);
    const x = i => pad + i / (n - 1) * (w - pad * 2);
    const path = k => PRICES.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
    const grid = [1, 100, 10000, 1000000, 100000000].map(v => `<line x1="${pad}" x2="${w - pad}" y1="${y(v)}" y2="${y(v)}"/><text x="${pad - 6}" y="${y(v) + 4}">${v >= 1e6 ? v / 1e6 + "M" : v >= 1e3 ? v / 1e3 + "K" : v}</text>`).join("");
    el.innerHTML = `<figure class="prices">
      <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${T("График цены и дохода кнопок", "Button price and income chart")}">
        <g class="pr-grid">${grid}</g>
        <path class="pr-line pr-price" d="${path(0)}"/><path class="pr-line pr-inc" d="${path(1)}"/>
      </svg>
      <figcaption><span class="pr-key price">${T("цена кнопки", "button price")}</span><span class="pr-key inc">${T("доход кнопки", "button income")}</span><span class="pr-note">${T("по оси X — кнопки по порядку", "X axis: buttons in order")}</span></figcaption>
    </figure>`;
    const lines = $$(".pr-line", el);
    lines.forEach(l => { const L = l.getTotalLength(); l.style.strokeDasharray = L; l.style.strokeDashoffset = reduce ? 0 : L; });
    if (!reduce) whenVisible(el, () => lines.forEach((l, i) => setTimeout(() => l.classList.add("draw"), i * 300)), null, .3);
  };

  /* ---------- Sort: «сила» обложек из рекламного отчёта ---------- */
  const ADS = [["RAINBOW LAST ONE", "15 502", "3,24%", 1.14], ["IS THAT ME", "112 915", "1,90%", 1.09], ["16 HALLS TO FILL", "34 396", "2,66%", 1.09], ["THAT'S MY SPOT", "648 172", "3,42%", 1.08]];
  W.ads = el => {
    el.innerHTML = `<div class="ads-vis">
      <div class="ads-head"><span>${T("Обложка", "Thumbnail")}</span><span>${T("Показы", "Impressions")}</span><span>CTR</span><span>${T("Сила", "Strength")}</span></div>
      ${ADS.map(([n, imp, ctr, s]) => `<div class="ads-row" style="--s:${((s - 1) / .16 * 100).toFixed(0)}%"><span class="ads-name">${n}</span><span class="num">${imp}</span><span>${ctr}</span><span class="ads-s"><i></i><b class="num">${String(s).replace(".", ",")}</b></span></div>`).join("")}
      <div class="ads-base">1,00 = ${T("средняя картинка в тех же кампаниях", "an average image in the same campaigns")}</div>
    </div>`;
    if (!reduce) whenVisible(el, () => el.firstElementChild.classList.add("go"), null, .4); else el.firstElementChild.classList.add("go");
  };

  /* ---------- Leafbound: грабли забирают листья в веере перед игроком ---------- */
  W.rake = el => {
    const U = 30, R1 = 1 * U, R2 = 4 * U, HALF = 30, P = { x: 150, y: 170 }, GATHER = 1.2 * U;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const leaves = Array.from({ length: 46 }, () => {
      const a = rnd(0, Math.PI * 2), d = rnd(R1 * .8, R2 * 1.35);
      return { x: P.x + Math.cos(a) * d, y: P.y + Math.sin(a) * d * .75, r: rnd(0, 360) };
    });
    el.innerHTML = `<figure class="rake">
      <svg viewBox="0 0 300 250" role="img" aria-label="${T("Вид сверху: грабли собирают листья только в веере перед игроком", "Top view: the rake only collects leaves in the fan in front of the player")}">
        <path class="rk-fan" d=""/>
        <g class="rk-leaves">${leaves.map(l => `<ellipse rx="4.5" ry="2.4" cx="0" cy="0" style="transform:translate(${l.x}px,${l.y}px) rotate(${l.r}deg)"/>`).join("")}</g>
        <g class="rk-player"><circle r="10"/><path class="rk-look" d="M0 0 L16 0"/></g>
      </svg>
      <figcaption><span>${T("веер: 1–4 студа, ±30°", "fan: 1–4 studs, ±30°")}</span><span class="rk-count">${T("в куче", "in the pile")}: <b>0</b></span></figcaption>
    </figure>`;
    const fan = $(".rk-fan", el), pl = $(".rk-player", el), dots = $$(".rk-leaves ellipse", el), cnt = $(".rk-count b", el);
    const sector = deg => {
      const a0 = (deg - HALF) * Math.PI / 180, a1 = (deg + HALF) * Math.PI / 180;
      const pt = (r, a) => `${(P.x + Math.cos(a) * r).toFixed(1)},${(P.y + Math.sin(a) * r * .75).toFixed(1)}`;
      return `M${pt(R1, a0)} L${pt(R2, a0)} A${R2},${R2 * .75} 0 0 1 ${pt(R2, a1)} L${pt(R1, a1)} A${R1},${R1 * .75} 0 0 0 ${pt(R1, a0)} Z`;
    };
    let piled = 0;
    const aim = deg => {
      fan.setAttribute("d", sector(deg));
      pl.style.transform = `translate(${P.x}px,${P.y}px) rotate(${deg}deg)`;
      const gx = P.x + Math.cos(deg * Math.PI / 180) * GATHER, gy = P.y + Math.sin(deg * Math.PI / 180) * GATHER * .75;
      const look = [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)];
      leaves.forEach((l, i) => {
        if (l.piled) return;
        const dx = l.x - P.x, dy = (l.y - P.y) / .75, d = Math.hypot(dx, dy);
        const dot = (dx * look[0] + dy * look[1]) / (d || 1);
        if (d >= R1 && d <= R2 && dot >= Math.cos(HALF * Math.PI / 180)) {
          l.piled = true; piled++;
          l.x = gx + rnd(-7, 7); l.y = gy + rnd(-5, 5);
          dots[i].classList.add("taken");
          dots[i].style.transform = `translate(${l.x}px,${l.y}px) rotate(${l.r}deg)`;
        }
      });
      cnt.textContent = piled;
    };
    const reset = () => {
      piled = 0;
      leaves.forEach((l, i) => {
        const a = rnd(0, Math.PI * 2), d = rnd(R1 * .8, R2 * 1.35);
        Object.assign(l, { x: P.x + Math.cos(a) * d, y: P.y + Math.sin(a) * d * .75, piled: false });
        dots[i].classList.remove("taken");
        dots[i].style.transform = `translate(${l.x}px,${l.y}px) rotate(${l.r}deg)`;
      });
      cnt.textContent = 0;
    };
    const ANGLES = [-90, -60, -120, -30, -150];
    if (reduce) { aim(-90); return; }
    aim(-90);
    loop(el, i => { const k = i % (ANGLES.length + 1); if (k === ANGLES.length) reset(); else aim(ANGLES[k]); }, 1300);
  };

  /* ---------- «Король и Шут»: ноты едут в такт, игрок прыгает на нужную ---------- */
  W.rhythm = el => {
    const BEAT = 500, TRAVEL = 4; /* нота идёт 4 доли до линии прыжка */
    el.innerHTML = `<div class="rh">
      <div class="rh-top"><span class="rh-beat"></span><span>♪ 120 BPM</span><span class="rh-score">${T("4 игрока", "4 players")}</span></div>
      <div class="rh-field">${[0, 1, 2, 3].map(i => `<div class="rh-lane" data-l="${i}"></div>`).join("")}
        <div class="rh-line"></div><div class="rh-player"></div></div>
      <div class="rh-board">${[T("Вы", "You"), "P2", "P3", "P4"].map((n, i) => `<div data-p="${i}"><span>${n}</span><i><b></b></i></div>`).join("")}</div>
    </div>`;
    const lanes = $$(".rh-lane", el), player = $(".rh-player", el), beat = $(".rh-beat", el), bars = $$(".rh-board b", el);
    const score = [0, 0, 0, 0];
    if (reduce) { player.style.left = "37.5%"; return; }
    const queue = [];
    loop(el, i => {
      beat.classList.remove("on"); void beat.offsetWidth; beat.classList.add("on");
      /* новая нота на эту долю */
      const lane = Math.floor(Math.random() * 4);
      const n = document.createElement("span");
      n.className = "rh-note";
      n.style.animationDuration = TRAVEL * BEAT + "ms";
      lanes[lane].append(n);
      queue.push({ lane, at: i + TRAVEL, n });
      /* нота, которая дошла до линии: прыжок и попадание */
      /* ноты, которые «проехали», пока схема была вне экрана, убираем */
      for (let k = queue.length - 1; k >= 0; k--) if (queue[k].at < i) { queue[k].n.remove(); queue.splice(k, 1); }
      const hit = queue.find(q => q.at === i);
      if (hit) {
        queue.splice(queue.indexOf(hit), 1);
        player.style.left = `${hit.lane * 25 + 12.5}%`;
        player.classList.remove("jump"); void player.offsetWidth; player.classList.add("jump");
        lanes[hit.lane].classList.remove("hit"); void lanes[hit.lane].offsetWidth; lanes[hit.lane].classList.add("hit");
        hit.n.remove();
        score[0] += 1; for (let p = 1; p < 4; p++) score[p] += Math.random() < .8 ? 1 : 0;
        const max = Math.max(...score, 1);
        bars.forEach((b, p) => { b.style.width = (score[p] / max * 100) + "%"; });
        if (score[0] > 40) score.fill(0);
      }
    }, BEAT);
  };

  /* ---------- Главная: сохранения — игрок вышел посреди загрузки ---------- */
  W.session = el => {
    const steps = [
      ["join", T("Игрок зашёл", "Player joined"), "PlayerAdded"],
      ["load", T("Профиль грузится", "Profile loading"), "StartSessionAsync"],
      ["leave", T("Игрок вышел", "Player left"), "player.Parent ~= Players"],
      ["end", T("Сессия отпущена", "Session released"), "session:EndSession()"]
    ];
    el.innerHTML = `<ol class="tl">${steps.map(([k, t, c]) => `<li data-k="${k}"><b>${t}</b><code>${esc(c)}</code></li>`).join("")}</ol>
      <p class="tl-note">${T("Без этой проверки сессия осталась бы открытой, и при следующем входе профиль был бы занят.", "Without this check the session would stay open and the profile would be locked on the next join.")}</p>`;
    const li = $$(".tl li", el);
    if (reduce) { li.forEach(l => l.classList.add("on")); return; }
    loop(el, i => { const k = i % (li.length + 2); if (k === 0) li.forEach(l => l.classList.remove("on")); if (k < li.length) li[k].classList.add("on"); }, 900);
  };

  /* ---------- Главная: Logger — уровни и фильтр ---------- */
  W.logger = el => {
    const rows = [["Debug", "GrowthService", "Click #41, stage 3, updateVisuals = false"], ["Info", "DataService", "Profile loaded for Player_1 in 0.4 s"],
                  ["Warn", "ClickService", "Rate limit exceeded for Player_7"], ["Debug", "PetService", "Equip slot 2 → pet_0193"], ["Critical", "Network", "Validator 'OpenChest' failed: bad chestId"]];
    el.innerHTML = `<div class="lg">
      <div class="lg-tabs" role="group" aria-label="${T("Порог уровня", "Level threshold")}">${["Debug", "Info", "Warn"].map((l, i) => `<button type="button" aria-pressed="${i === 1}" data-lv="${i}">${l}+</button>`).join("")}<span>${T("порог в живой игре", "live threshold")}</span></div>
      <ol class="lg-lines">${rows.map(([lv, sc, m]) => `<li data-lv="${["Debug", "Info", "Warn", "Critical"].indexOf(lv)}"><span class="lg-lv lg-${lv}">${lv}</span><span class="lg-sc">[${sc}]</span><span>${esc(m)}</span></li>`).join("")}</ol>
      <button type="button" class="lg-open">${T("Открыть Output этого сайта", "Open this site’s Output")} <svg class="ic"><use href="#i-arrow"/></svg></button>
    </div>`;
    const apply = th => $$(".lg-lines li", el).forEach(l => l.classList.toggle("off", +l.dataset.lv < th));
    apply(1);
    $$(".lg-tabs button", el).forEach(b => b.addEventListener("click", () => {
      $$(".lg-tabs button", el).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      apply(+b.dataset.lv);
      out("INFO", `Logger: threshold = <b>${b.textContent}</b>, lower levels are not even formatted`);
    }));
    $(".lg-open", el).addEventListener("click", () => { S.openOutput(); out("OK", "Logger: you are looking at it"); });
  };

  /* ---------- Главная: багрепорт проходит путь от игрока до списка задач ---------- */
  W.bugflow = el => {
    const st = [[T("Игрок", "Player"), T("текст и категория", "text and category")], [T("Клиент", "Client"), T("последние ошибки, устройство", "recent errors, device")],
                [T("Сервер", "Server"), T("версия, сервер, время, позиция; лимит отправок", "version, server, time, position; send limit")],
                ["DataStore", T("запись пачками, при ошибке — обратно в очередь", "batched writes; back to the queue on failure")], ["Python", T("выгрузка через Open Cloud в список задач", "export via Open Cloud to the task list")]];
    el.innerHTML = `<ol class="flow">${st.map(([b, s]) => `<li><b>${b}</b><span>${s}</span></li>`).join("")}<span class="flow-dot" aria-hidden="true"></span></ol>`;
    const li = $$(".flow li", el), dot = $(".flow-dot", el);
    if (reduce) return;
    loop(el, i => {
      const k = i % (li.length + 1);
      li.forEach((l, j) => l.classList.toggle("on", j === k));
      if (k < li.length) dot.style.transform = `translateY(${li[k].offsetTop + 14}px)`;
    }, 900);
  };

  /* ---------- Главная: аналитика — события текут двумя путями ---------- */
  W.pipe = el => {
    el.innerHTML = `<div class="pipe">
      <div class="pipe-src">${T("События игры", "Game events")}</div>
      <div class="pipe-branches">
        <div><span>Roblox Analytics</span><i class="pipe-arrow"></i><span>Open Cloud Query</span></div>
        <div><span>${T("Журнал сессий в DataStore", "Session log in DataStore")}</span><i class="pipe-arrow"></i><span>Open Cloud DataStores</span></div>
      </div>
      <div class="pipe-end"><span>${T("Python-отчёты", "Python reports")}</span><i class="pipe-arrow"></i><span>${T("правка баланса и механик", "balance and mechanics changes")}</span></div>
    </div>`;
    if (!reduce) whenVisible(el, () => el.firstElementChild.classList.add("flowing"), () => el.firstElementChild.classList.remove("flowing"));
  };

  /* =====================================================
     ИНЖЕНЕРИЯ
     ===================================================== */
  /* ---------- Как рос мой код: ступени по масштабу ---------- */
  const STEPS = [
    { game: "growth", name: "1 Click = 1 Growth", lines: 53, scale: () => T("35 сервисов · ~53 тыс. строк", "35 services · ~53K lines"),
      what: () => T("Свой Network с лимитом кликов, Logger по уровням, строгая типизация, лидерборды на MemoryStore.", "My own Network with a click limit, a leveled Logger, strict typing, MemoryStore leaderboards."),
      pain: () => T("Сервисы находили друг друга прямым require: тронешь один — задеваешь соседей.", "Services found each other with direct requires: touch one and you hit its neighbors.") },
    { game: "staff", name: "My Magic Staff Farm", lines: 120, scale: () => T("больше 120 тыс. строк", "over 120K lines"),
      what: () => T("Реестр сервисов вместо прямых require, шина событий, жизненный цикл Init → Start → Destroy, загрузчик с отчётом, все числа — в конфигах.", "A service registry instead of direct requires, an event bus, an Init → Start → Destroy lifecycle, a loader with a report, every number in configs."),
      pain: () => T("На таком объёме тормозить начала сцена, а не код: игру пришлось разбирать по системам.", "At this size the scene, not the code, became the bottleneck: the game had to be broken down by systems.") },
    { game: "kinopoisk", name: () => T("Мир Кинопоиска", "Kinopoisk World"), lines: 0, scale: () => T("5 программистов · 9 плейсов", "5 programmers · 9 places"),
      what: () => T("Каркас, к которому чужие мини-игры подключаются по одному правилу: общие данные, рейтинги, телепорт, одежда.", "A framework other people’s mini-games plug into by one rule: shared data, rankings, teleport, outfits."),
      pain: () => T("Код должны понимать другие люди: архитектуру пришлось объяснять и держать.", "Other people have to understand the code: the architecture had to be explained and held together.") },
    { game: "gyp", name: "Grow Your Parts", lines: 116, scale: () => T("55 систем · ~116 тыс. строк", "55 systems · ~116K lines"),
      what: () => T("У каждой системы паспорт, карта кода собирается скриптом, тест-команды, линтер и тесты перед коммитом. У каждого состояния один владелец, награды и покупки доходят ровно один раз.", "Every system has a passport, the code map is generated, there are test commands, a linter and tests before each commit. Every piece of state has one owner; rewards and purchases arrive exactly once."),
      pain: () => T("На этом ядре я сделал Build a Bonfire за три дня: 38 систем, ~60 тыс. строк.", "On this core I built Build a Bonfire in three days: 38 systems, ~60K lines.") }
  ];
  W.evolve = el => {
    el.innerHTML = `<ol class="evo">${STEPS.map((s, i) => `<li data-i="${i}">
        <div class="evo-top">${s.game ? `<img src="${S.iconSrc(s.game)}" alt="" loading="lazy">` : `<span class="evo-kit"><svg class="ic"><use href="#i-server"/></svg></span>`}<b>${typeof s.name === "function" ? s.name() : s.name}</b></div>
        <span class="evo-bar" style="--w:${s.lines ? Math.round(s.lines / 120 * 100) : 8}%"><i></i></span>
        <span class="evo-scale">${s.scale()}</span>
        <p class="evo-what">${s.what()}</p>
        <p class="evo-pain">${s.pain()}</p>
      </li>`).join("")}</ol>
      <p class="caption">${T("Ступени по масштабу, а не точная хронология. Строки — из исходников и карт кода проектов.", "Steps by scale, not an exact timeline. Line counts are from the projects’ sources and code maps.")}</p>`;
    const li = $$(".evo li", el);
    if (reduce) { li.forEach(x => x.classList.add("on")); return; }
    whenVisible(el, () => li.forEach((x, i) => setTimeout(() => x.classList.add("on"), i * 260)), null, .25);
  };

  /* ---------- Запуск игры: отчёт загрузки, можно «сломать» модуль ---------- */
  W.boot = el => {
    el.innerHTML = `<div class="boot">
      <div class="boot-bar"><button type="button" class="btn-ghost boot-run" data-fail="0"><svg class="ic"><use href="#i-play"/></svg>${T("Запустить", "Boot")}</button>
        <button type="button" class="btn-ghost boot-run" data-fail="1"><svg class="ic"><use href="#i-play"/></svg>${T("Запустить со сломанным модулем", "Boot with a broken module")}</button></div>
      <ol class="boot-log" aria-live="polite"></ol>
    </div>
    <p class="caption">${T("Демонстрация по формату настоящего отчёта загрузки. В проекте 72 сервиса и 76 контроллеров, здесь показана часть.", "A demo in the format of the real boot report. The project has 72 services and 76 controllers; a part is shown here.")}</p>`;
    const logEl = $(".boot-log", el);
    let timers = [];
    const ORDER = ["DataService", "PlayerService", "CurrencyService", "StatService", "RewardService", "ReceiptService", "PassService", "ShopService", "BoostService", "DailyService", "PromoService", "LeaderboardService", "AnalyticsService"];
    function run(fail) {
      timers.forEach(clearTimeout); timers = []; logEl.innerHTML = "";
      const lines = [
        ["muted", "ServerMain", T("Network.start · каналы всех систем объявлены", "Network.start · every system’s channels declared")],
        ["muted", "Bootstrap", T("найдено 72 модуля …Service по суффиксу имени", "found 72 …Service modules by name suffix")],
        ["muted", "DependencyGraph", T("порядок по dependencies, циклов нет", "order by dependencies, no cycles")],
        ...ORDER.map(n => fail && n === "PromoService"
          ? ["bad", "Start", T(`${n} упал · ошибка в Start`, `${n} failed · error in Start`)]
          : ["ok", "Init → Start", n]),
        ["muted", "…", T("ещё 59 сервисов", "59 more services")],
        fail ? ["warn", T("отчёт", "report"), "──── 71 OK · 1 FAILED · 0 SKIPPED · 640 ms ────"] : ["ok", "Boot", "OK 72 · FAILED 0 · SKIPPED 0 · 612 ms"],
        ["ok", "ReplicatedStorage", "ServerReady = true"],
        ["muted", "ClientMain", T("ждёт ServerReady → сеть → 76 контроллеров", "waits for ServerReady → network → 76 controllers")],
        fail ? ["warn", T("итог", "result"), T("промокоды не работают, игра работает: остальные 71 сервис подняты", "promo codes are down, the game is up: the other 71 services started")] : ["ok", T("итог", "result"), T("игрок входит в готовую игру", "the player enters a ready game")]
      ];
      lines.forEach(([cls, k, m], i) => timers.push(setTimeout(() => {
        logEl.insertAdjacentHTML("beforeend", `<li class="${cls}"><span>${esc(k)}</span><span>${esc(m)}</span></li>`);
        logEl.scrollTop = logEl.scrollHeight;
      }, reduce ? 0 : i * 140)));
      out(fail ? "WARN" : "OK", fail ? "ModuleLoader: PromoService FAILED, other services started" : "ModuleLoader: OK 72 · FAILED 0 · SKIPPED 0");
    }
    $$(".boot-run", el).forEach(b => b.addEventListener("click", () => run(b.dataset.fail === "1")));
    let started = false;
    whenVisible(el, () => { if (!started) { started = true; run(false); } }, null, .3);
  };

  /* ---------- Путь покупки: запрос идёт через слои ---------- */
  const LANES = () => [T("Клиент", "Client"), T("Сеть", "Network"), T("Сервер", "Server"), T("Данные", "Data")];
  const FLOW = () => [
    [0, "ShopWindowController", T("Игрок жмёт «Купить». Клиент не меняет ни монеты, он только просит.", "The player presses Buy. The client changes no coins; it only asks."), `Network.fire("SHOP_BUY_REQUEST", { item = "potion.x2" })`],
    [1, "SHOP_BUY_REQUEST", T("Не чаще раза в 0,3 с, игрок готов, данные нужной формы. Иначе — RemoteRejected.", "No more than once per 0.3 s, the player is ready, the payload has the right shape. Otherwise — RemoteRejected."), `C→S · rate 0.3 · validate(payload)`],
    [2, "ShopService", T("Проверяет лимит и политику. Цену берёт из конфига, а не от клиента.", "Checks limits and policy. Takes the price from config, not from the client."), `local price = ShopConfig.items[item].price`],
    [2, "CurrencyService", T("Единственный владелец баланса списывает монеты.", "The only owner of balances takes the coins."), `Currency:Take(player, "coins", price, "shop")`],
    [2, "RewardService", T("Выдаёт товар: весь набор одной записью и ровно один раз.", "Grants the item: the whole set in one write, exactly once."), `Rewards:Grant(player, item.rewards, "shop")`],
    [3, "DataService", T("Меняет профиль в памяти сервера: ProfileStore держит его там всю сессию. В DataStore профиль уходит автосохранением и при выходе игрока, а не на каждую покупку. Исключение — покупки за Robux: их профиль сохраняет сразу (SaveAndWait), до ответа Roblox «выдано», чтобы оплаченное не пропало при падении сервера.",
                         "Changes the profile in server memory: ProfileStore keeps it there for the whole session. The profile reaches the DataStore through autosave and when the player leaves, not on every purchase. The exception is Robux purchases: they are saved right away (SaveAndWait), before telling Roblox “granted”, so paid items survive a server crash."),
     `Data:Update(player, fn) -- память сервера, клиенту DATA_CHANGED`],
    [2, "EventBus", T("Магазин объявляет на внутренней шине сервера: «товар куплен». Аналитика и другие системы подписаны на это сами, магазин их не вызывает и не знает о них. Новый квест «купи 3 зелья» — это новый подписчик, код магазина не трогаем.",
                      "The shop announces on the server’s internal bus: “item bought”. Analytics and other systems subscribe on their own; the shop doesn’t call them or know they exist. A new “buy 3 potions” quest is just a new subscriber; the shop’s code stays untouched."),
     `EventBus:emit(ShopEvents.ShopItemBought, data) -- кто слушает, магазину неважно`],
    [0, "DataController", T("Копия профиля на клиенте обновилась, счётчик монет плавно уменьшился, игрок видит результат.", "The client’s profile copy updates, the coin counter eases down, the player sees the result."), `SHOP_RESULT + DATA_CHANGED`]
  ];
  W.flow = el => {
    const steps = FLOW(), lanes = LANES();
    el.innerHTML = `<div class="fl">
      <div class="fl-lanes">${lanes.map(l => `<span>${l}</span>`).join("")}</div>
      <ol class="fl-steps">${steps.map(([lane, name], i) => `<li style="--lane:${lane}"><button type="button" data-i="${i}"><em>${i + 1}</em><small class="fl-ln">${lanes[lane]}</small>${esc(name)}</button></li>`).join("")}</ol>
      <div class="fl-detail" aria-live="polite"></div>
    </div>
    <p class="caption">${T("Имена каналов, сервисов и событий — из кода каркаса, вызовы сокращены.", "Channel, service and event names are from the framework code; calls are shortened.")}</p>`;
    const btns = $$(".fl-steps button", el), det = $(".fl-detail", el);
    let cur = 0, pinned = false, timer = null;
    const show = i => {
      cur = i;
      btns.forEach((b, j) => { b.classList.toggle("on", j === i); b.classList.toggle("done", j < i); });
      const [, name, text, code] = steps[i];
      det.innerHTML = `<b>${i + 1}. ${esc(name)}</b><p>${text}</p><code>${esc(code)}</code>`;
    };
    show(0);
    btns.forEach(b => b.addEventListener("click", () => { pinned = true; clearTimeout(timer); show(+b.dataset.i); out("INFO", `Trace step <b>${+b.dataset.i + 1}</b>: ${esc(steps[+b.dataset.i][1])}`); }));
    if (reduce) return;
    loop(el, () => { if (!pinned) show((cur + 1) % steps.length); }, 2200);
  };

  /* ---------- Пример архитектуры: живой плейс Grow Your Parts (Explorer + Properties) ---------- */
  const PL_ICON = {
    Workspace: "i-workspace", Folder: "i-folder", Model: "i-model", ModuleScript: "i-module",
    Script: "pi-script", LocalScript: "pi-local", ScreenGui: "pi-screen", Frame: "pi-frame", CanvasGroup: "pi-frame",
    ImageButton: "pi-button", TextButton: "pi-button", TextLabel: "pi-text", TextBox: "pi-text", ImageLabel: "pi-image",
    ScrollingFrame: "pi-scroll", BillboardGui: "pi-sign", SurfaceGui: "pi-sign", Part: "pi-part", Camera: "pi-camera",
    Terrain: "pi-terrain", Effect: "pi-fx", Hidden: "pi-hidden"
  };
  const PL_SERVICE = { ReplicatedFirst: "pi-first", ReplicatedStorage: "pi-storage", ServerScriptService: "i-server", ServerStorage: "pi-vault",
    StarterGui: "pi-screen", StarterPlayer: "i-player", StarterPlayerScripts: "pi-local", StarterCharacterScripts: "i-player", Lighting: "pi-light", MaterialService: "pi-material" };
  const PL_SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="pi-script" viewBox="0 0 16 16"><path d="M3 1.8h7l3 3v9.4H3z" fill="#3fae6a"/><path d="M5.2 8h5.6M5.2 10.4h3.6" stroke="#e3ffe9" stroke-width="1.2" stroke-linecap="round"/></symbol>
    <symbol id="pi-local" viewBox="0 0 16 16"><path d="M3 1.8h7l3 3v9.4H3z" fill="#4c8fe8"/><path d="M5.2 8h5.6M5.2 10.4h3.6" stroke="#e6f0ff" stroke-width="1.2" stroke-linecap="round"/></symbol>
    <symbol id="pi-screen" viewBox="0 0 16 16"><rect x="1.8" y="2.6" width="12.4" height="8.6" rx="1.4" fill="#5aa8ee"/><rect x="3.2" y="4" width="9.6" height="5.8" rx=".6" fill="#cfe6ff"/><path d="M6 13.6h4" stroke="#5aa8ee" stroke-width="1.6" stroke-linecap="round"/></symbol>
    <symbol id="pi-frame" viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="10" rx="1.2" fill="none" stroke="#9fb7d9" stroke-width="1.5"/></symbol>
    <symbol id="pi-button" viewBox="0 0 16 16"><rect x="1.8" y="4.5" width="12.4" height="7" rx="3.5" fill="#79c3ee"/><path d="M5.5 8h5" stroke="#10324a" stroke-width="1.4" stroke-linecap="round"/></symbol>
    <symbol id="pi-text" viewBox="0 0 16 16"><path d="M3.5 4h9M8 4v8.5" stroke="#cdd3dd" stroke-width="1.8" stroke-linecap="round"/></symbol>
    <symbol id="pi-image" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.4" fill="#4f7a5a"/><path d="M2.6 11.6l3.6-3.8 2.6 2.6 1.8-1.8 2.8 3" fill="#9fdb83"/><circle cx="10.8" cy="5.8" r="1.2" fill="#f5c451"/></symbol>
    <symbol id="pi-scroll" viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="1.2" fill="none" stroke="#9fb7d9" stroke-width="1.4"/><rect x="10.6" y="4.4" width="1.6" height="4" rx=".8" fill="#9fb7d9"/></symbol>
    <symbol id="pi-sign" viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="7.5" rx="1.2" fill="#f0a35e"/><path d="M8 10v4" stroke="#c07a3c" stroke-width="1.6"/></symbol>
    <symbol id="pi-part" viewBox="0 0 16 16"><path d="M8 2l5.6 3v6L8 14l-5.6-3V5z" fill="#6f8db3"/><path d="M8 2l5.6 3L8 8 2.4 5z" fill="#a9c0dd"/></symbol>
    <symbol id="pi-camera" viewBox="0 0 16 16"><rect x="1.8" y="5" width="9.5" height="7" rx="1.2" fill="#a0a3ab"/><path d="M11.3 7.4l3-1.6v5.4l-3-1.6z" fill="#a0a3ab"/></symbol>
    <symbol id="pi-terrain" viewBox="0 0 16 16"><path d="M1.5 12.5l4-6 3 4 2-2.5 4 4.5z" fill="#7fb36a"/></symbol>
    <symbol id="pi-fx" viewBox="0 0 16 16"><path d="M8 1.8l1.6 4.6 4.6 1.6-4.6 1.6L8 14.2l-1.6-4.6L1.8 8l4.6-1.6z" fill="#f5c451"/></symbol>
    <symbol id="pi-pause" viewBox="0 0 16 16"><rect x="4" y="3" width="2.8" height="10" rx=".8" fill="currentColor"/><rect x="9.2" y="3" width="2.8" height="10" rx=".8" fill="currentColor"/></symbol>
    <symbol id="pi-hidden" viewBox="0 0 16 16"><circle cx="4" cy="8" r="1.3" fill="#6c7079"/><circle cx="8" cy="8" r="1.3" fill="#6c7079"/><circle cx="12" cy="8" r="1.3" fill="#6c7079"/></symbol>
    <symbol id="pi-first" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2.4" fill="#e0565b"/><path d="M6 5l4.5 3L6 11z" fill="#fff"/></symbol>
    <symbol id="pi-storage" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="3.4" rx="1" fill="#d9a441"/><rect x="2.6" y="6.4" width="10.8" height="7" rx="1" fill="#f0c25e"/><path d="M6.5 9h3" stroke="#8a6420" stroke-width="1.4" stroke-linecap="round"/></symbol>
    <symbol id="pi-vault" viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.6" fill="#2f8a53"/><circle cx="8" cy="8" r="2.6" fill="none" stroke="#d8ffe4" stroke-width="1.3"/></symbol>
    <symbol id="pi-light" viewBox="0 0 16 16"><circle cx="8" cy="7" r="3.6" fill="#f5c451"/><rect x="6.4" y="11" width="3.2" height="2.6" rx=".6" fill="#a0a3ab"/></symbol>
    <symbol id="pi-material" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="1.6" fill="#8a94a6"/><circle cx="5.5" cy="5.5" r="1.4" fill="#c5ccd8"/><circle cx="10.5" cy="5.5" r="1.4" fill="#c5ccd8"/><circle cx="5.5" cy="10.5" r="1.4" fill="#c5ccd8"/><circle cx="10.5" cy="10.5" r="1.4" fill="#c5ccd8"/></symbol>
  </svg>`;
  /* Роль файла по правилу имён каркаса: пригодится для EN и для подсказки, если описания нет */
  const plRole = (n, sysTitle) => {
    const rules = [
      [/Service$/, "Server singleton of", "Серверный синглтон системы"], [/Controller$/, "Client singleton of", "Клиентский синглтон системы"],
      [/Config$/, "Numbers and texts of", "Числа и тексты системы"], [/Channels$/, "Network channels (rate limit + validator) of", "Сетевые каналы (лимит + валидатор) системы"],
      [/Events$/, "Event-bus events of", "События шины системы"], [/Types$/, "Type definitions of", "Типы системы"],
      [/Commands$/, "Admin test commands of", "Тест-команды админки для системы"], [/Window(View)?$/, "UI window of", "Окно системы"],
      [/Catalog$/, "Catalog data of", "Каталог системы"], [/(Math|Rules|Util|Utils|Queue|Layout)$/, "Pure logic of", "Чистая логика системы"],
      [/View$/, "Visual part of", "Визуал системы"]
    ];
    const r = rules.find(([re]) => re.test(n));
    return r ? [r[2], r[1]] : ["Модуль системы", "Module of"];
  };
  W.place = el => {
    const P = window.PLACE;
    if (!P) { el.textContent = "placetree.js not loaded"; return; }
    if (!document.getElementById("pi-script")) document.body.insertAdjacentHTML("beforeend", PL_SPRITE);
    /* Индексы: id → узел, родитель, глубина, путь */
    const nodes = [];
    const index = (n, parent, depth) => { n.id = nodes.length; n.parent = parent; n.depth = depth; nodes.push(n); (n.k || []).forEach(c => index(c, n, depth + 1)); };
    P.tree.forEach(n => index(n, null, 0));
    const fullName = n => { const a = []; for (let x = n; x; x = x.parent) a.unshift(x.n); return a.join("."); };
    const desc = n => { let c = 0; (n.k || []).forEach(k => c += 1 + desc(k)); return c + (n.x || 0); };
    const find = p => { let list = P.tree, cur = null; for (const part of p.split("/")) { cur = list.find(x => x.n === part); if (!cur) return null; list = cur.k || []; } return cur; };
    const open = new Set(nodes.filter(n => n.depth === 0 && ["ReplicatedStorage", "ServerStorage"].includes(n.n)).map(n => n.id));
    let sel = null, filter = "", touring = false, tourTimer = null, tourStep = 0;
    const st = P.stats;
    el.innerHTML = `<div class="pl">
      <div class="pl-bar"><span class="pl-live"><i></i>${T("живой плейс", "live place")}</span><b>${P.game}</b>
        <span class="pl-stats"><span class="num">${st.scripts}</span> ${T("скриптов", "scripts")} · <span class="num">${Math.round(st.lines / 1000)}</span> ${T("тыс. строк", "K lines")} · <span class="num">${Object.keys(P.systems).length}</span> ${T("систем", "systems")}</span>
        <button type="button" class="pl-tour"><svg class="ic"><use href="#i-play"/></svg><span>${T("Экскурсия", "Guided tour")}</span></button></div>
      <div class="pl-panes">
        <div class="pl-explorer">
          <div class="pl-pane-h">Explorer</div>
          <label class="pl-filter"><input type="search" placeholder="Filter workspace (Ctrl+Shift+X)" spellcheck="false" aria-label="${T("Фильтр дерева", "Filter tree")}"></label>
          <div class="pl-tree" role="tree" tabindex="0" aria-label="Explorer"></div>
        </div>
        <div class="pl-props">
          <div class="pl-pane-h">Properties <span class="pl-sel"></span></div>
          <div class="pl-tourcap" aria-live="polite"></div>
          <div class="pl-body" aria-live="polite"></div>
        </div>
      </div>
    </div>
    <p class="caption">${T("Дерево живого плейса на 20.11.2026: код и описание каждого файла — из Rojo-проекта и карты кода, карта, шаблоны и GUI — сняты из Studio. Исходники не показываю, только что делает каждый скрипт. Служебное убрано: бэкапы правок, приёмка от Codex, пустые слои. Модели яиц, петов и бойцов для удобства собраны в группы Eggs, Pets, Npcs.",
                          "The live place tree as of Nov 20, 2026: code and every file’s description come from the Rojo project and code map; the map, templates and GUI were read from Studio. No source is shown, only what each script does. Service clutter is removed: per-card backups, Codex deliveries, empty layers. Egg, pet and fighter models are grouped into Eggs, Pets and Npcs for convenience.")}</p>`;
    const tree = $(".pl-tree", el), body = $(".pl-body", el), selName = $(".pl-sel", el), cap = $(".pl-tourcap", el), input = $(".pl-filter input", el), tourBtn = $(".pl-tour", el);
    const icon = n => PL_SERVICE[n.c] || PL_ICON[n.c] || "pi-frame";
    const meta = n => /Script$/.test(n.c) && n.l ? `${n.l}` : n.k ? `${(n.k.length)}` : n.x ? `${n.x}` : "";
    /* Видимые строки: раскрытые ветки или совпадения фильтра с предками */
    function visible() {
      const rows = [];
      if (filter) {
        const q = filter.toLowerCase(), keep = new Set();
        let hits = 0;
        for (const n of nodes) if (n.n.toLowerCase().includes(q)) { hits++; for (let x = n; x; x = x.parent) keep.add(x.id); if (hits > 300) break; }
        const walk = list => list.forEach(n => { if (keep.has(n.id)) { rows.push(n); walk(n.k || []); } });
        walk(P.tree);
        return rows;
      }
      const walk = list => list.forEach(n => { rows.push(n); if (open.has(n.id)) walk(n.k || []); });
      walk(P.tree);
      return rows;
    }
    let shownIds = new Set();
    function render(fresh = []) {
      const rows = visible(), q = filter.toLowerCase(), keepTop = tree.scrollTop;
      tree.innerHTML = rows.map(n => {
        const has = !!(n.k && n.k.length);
        const name = esc(n.n), hl = q && n.n.toLowerCase().includes(q) ? name.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), m => `<mark>${m}</mark>`) : name;
        return `<div class="pl-row${sel === n ? " on" : ""}${fresh.includes(n.id) ? " in" : ""}${n.c === "Hidden" ? " hidden-row" : ""}${n.virtual ? " virtual" : ""}" role="treeitem" data-id="${n.id}" style="--d:${n.depth}${fresh.includes(n.id) ? `;--i:${fresh.indexOf(n.id)}` : ""}" aria-level="${n.depth + 1}" ${has ? `aria-expanded="${filter ? "true" : open.has(n.id)}"` : ""} aria-selected="${sel === n}">
          <span class="pl-caret${has ? "" : " none"}${has && (filter || open.has(n.id)) ? " open" : ""}"><svg class="ic"><use href="#i-caret"/></svg></span><svg class="ic"><use href="#${icon(n)}"/></svg><span class="pl-name">${hl}</span><em>${meta(n)}</em></div>`;
      }).join("") || `<p class="pl-empty">${T("Ничего не найдено", "Nothing found")}</p>`;
      shownIds = new Set(rows.map(n => n.id));
      tree.scrollTop = keepTop; /* innerHTML сбрасывает прокрутку — возвращаем */
    }
    function toggle(n) {
      if (!n.k || !n.k.length || filter) return;
      if (open.has(n.id)) { open.delete(n.id); render(); }
      else { open.add(n.id); render(reduce ? [] : n.k.slice(0, 24).map(c => c.id)); }
    }
    const chips = s => s ? s.split(/,\s*/).filter(Boolean).map(x => `<span>${esc(x)}</span>`).join("") : `<span class="none">${T("нет", "none")}</span>`;
    function props(n) {
      const sys = n.s && P.systems[n.s], en = S.lang === "en";
      const sysTitle = sys ? (en ? sys[1] : sys[0]) : "";
      let text = "";
      if (n.d) text = en ? n.d[1] : n.d[0];
      else if (n.r) text = en ? `${plRole(n.n)[1]} ${sysTitle}.` : n.r.charAt(0).toUpperCase() + n.r.slice(1);
      else if (/Script$/.test(n.c)) text = `${plRole(n.n)[en ? 1 : 0]} ${sysTitle}.`;
      const rows = [["Name", esc(n.n)], ["ClassName", n.c === "Hidden" ? "—" : n.c === "Effect" ? "PostEffect" : n.c], ["Parent", esc(n.parent ? fullName(n.parent) : "game")]];
      if (/Script$/.test(n.c) && n.l) rows.push([T("Строк", "Lines"), `<span class="num">${n.l}</span>`]);
      if (n.k) rows.push([T("Дочерних", "Children"), `<span class="num">${n.k.length}</span>`]);
      if (n.x) rows.push([T("Внутри", "Inside"), `<span class="num">${n.x.toLocaleString("ru-RU").replace(/ /g, " ")}</span> ${T("объектов", "objects")}`]);
      if (sys && !n.sys) rows.push([T("Система", "System"), esc(sysTitle)]);
      body.innerHTML = `<dl class="pl-grid">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
        ${text ? `<p class="pl-what"><span>${/Script$/.test(n.c) ? T("Что делает", "What it does") : T("Что это", "What it is")}</span>${esc(text)}</p>` : ""}
        ${n.p ? `<div class="pl-row2"><span>${T("Зависит от", "Depends on")}</span><div class="kx-chips">${chips(n.p)}</div></div>` : ""}
        ${n.sys && sys ? `<div class="pl-sys"><b>${esc(sysTitle)}</b><p>${esc(en ? sys[3] : sys[2])}</p>
          <dl class="kx-meta"><div><dt>${T("Файлов", "Files")}</dt><dd class="num">${sys[4]}</dd></div><div><dt>${T("Строк", "Lines")}</dt><dd class="num">${sys[5].toLocaleString("ru-RU").replace(/ /g, " ")}</dd></div></dl>
          <div class="pl-row2"><span>${T("Каналы", "Channels")}</span><div class="kx-chips">${chips(sys[6])}</div></div>
          <div class="pl-row2"><span>${T("События", "Events")}</span><div class="kx-chips ev">${chips(sys[7])}</div></div></div>` : ""}`;
      body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
      selName.textContent = `— ${n.n}`;
    }
    /* Прокрутка дерева к строке без прокрутки страницы */
    function reveal(n) {
      const row = tree.querySelector(`[data-id="${n.id}"]`);
      if (!row) return;
      const top = row.offsetTop, h = tree.clientHeight; /* .pl-tree — position: relative, offsetTop уже от него */
      if (top < tree.scrollTop + 8 || top > tree.scrollTop + h - 40) tree.scrollTo({ top: Math.max(0, top - h / 3), behavior: reduce ? "auto" : "smooth" });
    }
    function select(n, log = true, fresh = []) {
      sel = n;
      for (let x = n.parent; x; x = x.parent) open.add(x.id);
      if (filter && !shownIds.has(n.id)) { filter = ""; input.value = ""; }
      render(fresh); props(n); reveal(n);
      const row = tree.querySelector(`[data-id="${n.id}"]`);
      if (row && !reduce) { row.classList.remove("pl-flash"); void row.offsetWidth; row.classList.add("pl-flash"); }
      if (log) out("NAV", `Explorer → <b>${esc(fullName(n))}</b>`);
    }
    /* Экскурсия: как игра запускается и где что лежит */
    const TOUR = [
      ["ReplicatedFirst/LoadingBoot", T("Первым на клиенте запускается экран загрузки из ReplicatedFirst — до остальной игры.", "The loading screen in ReplicatedFirst runs first on the client, before the rest of the game.")],
      ["ServerScriptService/ServerMain", T("На сервере один скрипт: поднимает сеть и все сервисы по зависимостям.", "One script on the server: it brings up the network and every service by dependency.")],
      ["StarterPlayer/StarterPlayerScripts/ClientMain", T("На клиенте тоже один: ждёт сервер и поднимает контроллеры.", "One on the client too: it waits for the server and brings up the controllers.")],
      ["ReplicatedStorage/Shared/Network/Validate", T("Общий код: каждый сетевой канал объявлен с лимитом и проверкой данных.", "Shared code: every network channel is declared with a rate limit and a data check.")],
      ["ServerStorage/Server/Growth/GrowthService", T("Логика роста живёт на сервере — клиент только сообщает, сколько кликнул.", "Growth logic lives on the server; the client only reports how many clicks.")],
      ["ReplicatedStorage/Client/Growth/BodyController", T("Клиент рисует тело по числам с сервера.", "The client draws the body from the server’s numbers.")],
      ["StarterGui/MainGUI/Windows/BodyWindow", T("Окно — готовая разметка в StarterGui, код находит его по имени.", "The window is ready-made layout in StarterGui; code finds it by name.")],
      ["ReplicatedStorage/Assets/Models/Pets", T("Модели — шаблоны: код клонирует их, а не собирает с нуля.", "Models are templates: code clones them instead of building from scratch.")],
      ["Workspace/Zones/Zone2_Beach/Fights/Rooms/FightRoom4/NPC", T("На карте у всех зон одна раскладка. В каждой пять комнат боя: у всех 25 бойцов своя сцена, а цифры бойца — в NpcConfig.", "Every zone on the map shares one layout. Each has five fight rooms: all 25 fighters get their own scene, and their numbers live in NpcConfig.")],
      ["ServerStorage/Server/Data/Packages/ProfileStore", T("Сохранения — на ProfileStore: профиль в памяти сервера, в DataStore — автосейвом и при выходе.", "Saving runs on ProfileStore: the profile stays in server memory, going to DataStore on autosave and leave.")]
    ];
    function tourGo(i) {
      tourStep = i;
      const [p, text] = TOUR[i], n = find(p);
      if (!n) return;
      select(n, false);
      cap.innerHTML = `<span>${T("Экскурсия", "Tour")} ${i + 1}/${TOUR.length}</span>${esc(text)}`;
      cap.classList.add("on");
      out("INFO", `Tour ${i + 1}/${TOUR.length}: <b>${esc(fullName(n))}</b>`);
    }
    function tourStop() { touring = false; clearTimeout(tourTimer); tourBtn.classList.remove("on"); $("span", tourBtn).textContent = T("Экскурсия", "Guided tour"); $("use", tourBtn).setAttribute("href", "#i-play"); }
    function tourTick() {
      if (!touring || !el.isConnected) return;
      tourGo(tourStep);
      tourTimer = setTimeout(() => { if (tourStep + 1 >= TOUR.length) { tourStop(); S.badge?.("architect"); return; } tourStep++; tourTick(); }, reduce ? 4000 : 4200);
    }
    function tourStart(from = 0) { touring = true; tourStep = from; tourBtn.classList.add("on"); $("span", tourBtn).textContent = T("Пауза", "Pause"); $("use", tourBtn).setAttribute("href", "#pi-pause"); tourTick(); }
    tourBtn.addEventListener("click", () => { if (touring) tourStop(); else tourStart(tourStep >= TOUR.length - 1 ? 0 : tourStep); });
    tree.addEventListener("click", e => {
      const row = e.target.closest(".pl-row"); if (!row) return;
      const n = nodes[+row.dataset.id];
      if (touring) tourStop();
      cap.classList.remove("on");
      if (e.target.closest(".pl-caret")) { toggle(n); return; }
      if (sel === n) { toggle(n); return; }
      const opening = !!(n.k && n.k.length && !open.has(n.id) && !filter);
      if (opening) open.add(n.id);
      select(n, true, opening && !reduce ? n.k.slice(0, 24).map(c => c.id) : []);
    });
    tree.addEventListener("keydown", e => {
      const rows = visible(), i = sel ? rows.indexOf(sel) : -1;
      const go = d => { e.preventDefault(); const n = rows[Math.max(0, Math.min(rows.length - 1, i + d))]; if (n) select(n); };
      if (e.key === "ArrowDown") go(1);
      else if (e.key === "ArrowUp") go(-1);
      else if (e.key === "ArrowRight" && sel && sel.k && !open.has(sel.id)) { e.preventDefault(); toggle(sel); }
      else if (e.key === "ArrowLeft" && sel) { e.preventDefault(); if (open.has(sel.id)) toggle(sel); else if (sel.parent) select(sel.parent); }
    });
    let ft = null;
    input.addEventListener("input", () => {
      clearTimeout(ft);
      ft = setTimeout(() => { filter = input.value.trim(); if (touring) tourStop(); cap.classList.remove("on"); render(); if (filter) out("INPUT", `Explorer filter: ${q(filter)}`); }, 160);
    });
    el.addEventListener("keydown", e => { if (e.ctrlKey && e.shiftKey && (e.key === "X" || e.key === "x")) { e.preventDefault(); input.focus(); } });
    render();
    select(find("ReplicatedFirst/LoadingBoot") || nodes[0], false);
    cap.innerHTML = `<span>${T("Подсказка", "Tip")}</span>${T("Раскрывайте папки и открывайте любой объект — в Properties будет, что он делает. Или нажмите «Экскурсия».", "Expand folders and open any object: Properties shows what it does. Or press “Guided tour”.")}`;
    cap.classList.add("on");
    if (!reduce) whenVisible(el, () => { if (!touring && tourStep === 0 && !el.dataset.toured) { el.dataset.toured = "1"; tourStart(0); } }, null, .45);
  };

  /* =====================================================
     ИИ: переписка по реальной карточке и меняющийся результат
     ===================================================== */
  /* Карточка 001 «Прототип роста деталей» из Game Planner Grow Your Parts.
     Ход работы и итог — как в карточке; реплики пересказаны и сокращены. */
  const CHAT = () => [
    { who: "me", tag: "task", text: T("Новая карточка: выбор из 15 деталей, размер зависит от силы. Сначала растёт быстро, чтобы было заметно, потом медленнее. Пока только механика роста, без GUI, но на любых R15.",
                                      "New card: a choice of 15 parts, size depends on strength. Fast at first so it’s noticeable, then slower. Only the growth mechanic for now, no GUI, but on any R15."),
      card: { status: "idea", body: "base", note: T("карточка 001 создана", "card 001 created") } },
    { who: "ai", tag: "ask", text: T("Два вопроса до кода. Деталь растёт во все стороны или только в длину? И что делать с аксессуарами: шляпа на голове, рюкзак на торсе?",
                                     "Two questions before coding. Does a part grow in every direction or only in length? And what about accessories: a hat on the head, a backpack on the torso?"),
      card: { status: "idea", body: "base" } },
    { who: "me", tag: "decision", text: T("Во все стороны: если только в длину, руки становятся макаронинами. Аксессуар растёт вместе со своей деталью. Исходные размеры храни на самих деталях, чтобы сброс не зависел от сохранений.",
                                          "In every direction: length-only turns arms into noodles. An accessory grows with its part. Keep original sizes on the parts themselves so a reset doesn’t depend on saves."),
      card: { status: "todo", body: "base", decisions: [T("рост во все стороны, аксессуар — со своей деталью", "grow in every direction, accessory with its part"), T("исходные размеры — на деталях", "original sizes stored on the parts")] } },
    { who: "ai", tag: "ask", text: T("Проверю на блочном, Rthro и аниме-риге. 3D-одежда на больших размерах может ломаться: чинить сейчас?",
                                     "I’ll test on blocky, Rthro and anime rigs. 3D clothing may break at large sizes: fix it now?"),
      card: { status: "todo", body: "base" } },
    { who: "me", tag: "decision", text: T("Добавь ещё Headless и риги с 3D-одеждой, у игроков таких много. Если одежда сломается, просто запиши, решим отдельно. Телефон тоже потом.",
                                          "Also add Headless and rigs with 3D clothing, lots of players have them. If clothing breaks, just note it, we’ll solve it separately. Phones later too."),
      card: { status: "in-progress", body: "base", decisions: [T("3D-одежда и телефон — отдельно", "3D clothing and phones — separately")] } },
    { who: "ai", text: T("Прототип готов: модуль роста, команда /grow и 12 манекенов. Любая деталь растёт, суставы без щелей, аксессуары на месте.",
                         "Prototype done: a growth module, a /grow command and 12 mannequins. Any part grows, joints have no gaps, accessories stay put."),
      card: { status: "review", body: "grown", checks: [T("12 манекенов: блочный, Rthro, аниме, Headless…", "12 mannequins: blocky, Rthro, anime, Headless…"), T("8 типов аксессуаров на месте", "8 accessory types stay in place")] } },
    { who: "me", tag: "review", text: T("Зашёл в Play: одна нога уходит в другую. Раздвигай конечности от центра, чтобы не накладывались.",
                                        "Went into Play: one leg goes into the other. Spread the limbs from the center so they don’t overlap."),
      card: { status: "review", body: "grown", note: T("правка 1", "fix request 1") } },
    { who: "ai", text: T("Сделал: конечности растут наружу от тела.", "Done: limbs grow outward from the body."),
      card: { status: "review", body: "ladder" } },
    { who: "me", tag: "review", text: T("Стоп: лесенки, руки висят в воздухе. Наружу сдвигай только плечо и бедро, всё ниже — по центру сустава. И ограничь отвод руки, градусов 25.",
                                        "Stop: stairs, arms hanging in the air. Move only the shoulder and hip outward, everything below centered on the joint. And cap the arm tilt at about 25°."),
      card: { status: "in-progress", body: "ladder", note: T("правка 2", "fix request 2") } },
    { who: "ai", text: T("Понял, сдвиг стоял на каждом суставе. Переделал так, перепроверил на 12 манекенах и в Play.",
                         "Got it, the offset was applied at every joint. Reworked it that way, rechecked on 12 mannequins and in Play."),
      card: { status: "review", body: "fixed", checks: [T("лесенки убраны, руки не отрываются", "stairs removed, arms stay attached")] } },
    { who: "ai", text: T("Что не работает: 3D-одежда пропадает, когда деталь больше ×5; очень длинные руки уходят в пол.", "What doesn’t work: 3D clothing disappears when a part is over ×5; very long arms go into the floor."),
      card: { status: "review", body: "fixed", limits: true } },
    { who: "me", tag: "decision", text: T("Принимаю. Оба ограничения — в отдельные карточки, руки в полу первыми: их игрок заметит сразу.",
                                          "Accepted. Both limitations go to separate cards, arms in the floor first: a player notices that right away."),
      card: { status: "done", body: "fixed", note: T("карточка закрыта", "card closed") } }
  ];
  const TAGS = { task: ["задача", "task"], decision: ["решение", "decision"], review: ["проверил сам", "checked myself"], ask: ["вопрос", "question"] };
  /* Манекен спереди: как выглядело тело на каждом шаге карточки */
  const BODY = {
    base:   { legs: [[72, 96, 26, 70], [102, 96, 26, 70]], arms: [[46, 42, 20, 50], [134, 42, 20, 50]], bad: [] },
    grown:  { legs: [[72, 96, 26, 70], [90, 96, 46, 116]], arms: [[46, 42, 20, 50], [134, 42, 20, 50]], bad: [[90, 96, 8, 70]] },
    ladder: { legs: [[72, 96, 26, 70], [104, 96, 46, 44], [118, 140, 46, 44], [132, 184, 46, 28]], arms: [[38, 42, 20, 50], [144, 42, 20, 50]], bad: [[104, 140, 14, 44], [118, 184, 14, 28], [130, 50, 14, 10], [56, 50, 14, 10]] },
    fixed:  { legs: [[72, 96, 26, 70], [104, 96, 46, 116]], arms: [[46, 42, 20, 50], [134, 42, 20, 50]], bad: [] }
  };
  const BODY_NOTE = {
    base: () => T("исходное тело", "original body"),
    grown: () => T("правая нога ×1.8 входит в левую", "right leg ×1.8 goes into the left"),
    ladder: () => T("лесенки и руки в воздухе", "stairs and floating arms"),
    fixed: () => T("наружу только у бедра, ниже — по центру", "outward only at the hip, centered below")
  };
  const bodySvg = state => {
    const b = BODY[state], r = (a, cls) => a.map(([x, y, w, h]) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`).join("");
    return `<svg viewBox="0 0 200 220" role="img" aria-label="${BODY_NOTE[state]()}"><rect class="m-head" x="86" y="8" width="28" height="28" rx="7"/><rect class="m-torso" x="70" y="40" width="60" height="56" rx="5"/>${r(b.arms, "m-limb")}${r(b.legs, "m-limb")}${r(b.bad, "m-bad")}</svg>`;
  };
  W.aichat = el => {
    const msgs = CHAT(), N = msgs.length;
    el.innerHTML = `<div class="ac">
      <div class="ac-chat">
        <div class="ac-head"><span class="ac-dot"></span>${T("Кирилл и Claude", "Kirill and Claude")}
          <span class="ac-ctrl">
            <button type="button" class="ac-prev" aria-label="${T("Назад", "Back")}">‹</button>
            <button type="button" class="ac-play"></button>
            <button type="button" class="ac-next" aria-label="${T("Дальше", "Next")}">›</button>
            <span class="ac-count"></span>
          </span></div>
        <ol class="ac-msgs" aria-live="polite"></ol>
        <div class="ac-prog" role="group" aria-label="${T("Шаги переписки", "Chat steps")}">${msgs.map((m, k) => `<button type="button" data-k="${k + 1}" class="${m.who}${m.tag ? " " + m.tag : ""}" aria-label="${T("Шаг", "Step")} ${k + 1}"></button>`).join("")}</div>
      </div>
      <div class="ac-card">
        <div class="ac-card-head"><code>001</code><b>${T("Прототип роста деталей", "Part growth prototype")}</b><span class="ac-status"></span></div>
        <ul class="ac-stages">${["idea", "todo", "in-progress", "review", "done"].map(s => `<li data-s="${s}">${s}</li>`).join("")}</ul>
        <div class="ac-body"><div class="ac-fig"></div><span class="ac-fig-note"></span></div>
        <div class="ac-block ac-dec"><span>${T("Мои решения", "My decisions")}</span><ol></ol></div>
        <div class="ac-block ac-checks"><span>${T("Проверки", "Checks")}</span><ul></ul></div>
        <div class="ac-block ac-limits"><span>${T("Ограничения, записаны честно", "Limitations, recorded honestly")}</span><ul><li>${T("3D-одежда пропадает больше ×5", "3D clothing disappears above ×5")}</li><li>${T("длинные руки уходят в пол", "long arms go into the floor")}</li></ul></div>
        <p class="ac-note"></p>
      </div>
    </div>
    <p class="caption">${T("Карточка 001 из плана Grow Your Parts: ход работы, решения, проверки и ограничения — как в карточке, реплики пересказаны и сокращены. Манекен справа — схема того, что было на каждом шаге.",
                          "Card 001 from the Grow Your Parts plan: the course of work, decisions, checks and limitations are as in the card; replies are retold and shortened. The mannequin on the right is a diagram of each step.")}</p>`;
    const list = $(".ac-msgs", el), status = $(".ac-status", el), stages = $$(".ac-stages li", el), fig = $(".ac-fig", el), figNote = $(".ac-fig-note", el),
          dec = $(".ac-dec ol", el), checks = $(".ac-checks ul", el), limits = $(".ac-limits", el), note = $(".ac-note", el), cardEl = $(".ac-card", el),
          playBtn = $(".ac-play", el), count = $(".ac-count", el), segs = $$(".ac-prog button", el), prev = $(".ac-prev", el), next = $(".ac-next", el);
    let shown = 0, timer = null, playing = false, bodyNow = "";
    function setBody(state) {
      if (state === bodyNow) return;
      bodyNow = state;
      fig.innerHTML = bodySvg(state);
      fig.dataset.state = state;
      figNote.textContent = BODY_NOTE[state]();
      fig.classList.remove("swap"); void fig.offsetWidth; fig.classList.add("swap");
    }
    const addCheck = t => checks.insertAdjacentHTML("beforeend", `<li>${t}</li>`);
    function applyCard(c, instant) {
      status.textContent = c.status;
      stages.forEach(s => s.classList.toggle("on", s.dataset.s === c.status));
      cardEl.dataset.status = c.status;
      if (c.body) setBody(c.body);
      if (c.decisions) c.decisions.forEach(t => dec.insertAdjacentHTML("beforeend", `<li>${t}</li>`));
      if (c.checks) c.checks.forEach((t, k) => instant || reduce ? addCheck(t) : setTimeout(() => { if (el.isConnected && shown && msgs[shown - 1].card === c) addCheck(t); }, k * 300));
      if (c.limits) limits.classList.add("on");
      note.textContent = c.note || "";
    }
    function bubble(m, animate) {
      const li = document.createElement("li");
      li.className = `ac-msg ${m.who}${m.tag ? " " + m.tag : ""}${animate ? " in" : ""}`;
      li.innerHTML = `${m.tag ? `<em>${T(...TAGS[m.tag])}</em>` : ""}${m.text}`;
      list.append(li);
    }
    /* Показать первые n реплик: все, кроме последней, — сразу, последнюю — с анимацией */
    function render(n, animate) {
      list.innerHTML = ""; dec.innerHTML = ""; checks.innerHTML = ""; limits.classList.remove("on"); bodyNow = "";
      shown = n;
      applyCard({ status: "idea", body: "base" }, true);
      for (let k = 0; k < n; k++) { const last = animate && k === n - 1; bubble(msgs[k], last); applyCard(msgs[k].card, !last); }
      list.scrollTop = list.scrollHeight;
      count.textContent = `${n} / ${N}`;
      segs.forEach((b, k) => { b.classList.toggle("on", k < n); b.classList.toggle("cur", k === n - 1); });
      prev.disabled = n <= 1; next.disabled = n >= N;
    }
    /* Время на чтение зависит от длины реплики */
    const readTime = m => Math.min(7000, 2400 + m.text.length * 34);
    function setPlaying(v) {
      playing = v;
      playBtn.textContent = v ? "❚❚" : "▶";
      playBtn.setAttribute("aria-label", v ? T("Пауза", "Pause") : T("Смотреть дальше", "Play"));
      playBtn.classList.toggle("on", !v);
    }
    function tick() {
      clearTimeout(timer);
      if (!playing || !el.isConnected) return;
      if (shown >= N) { setPlaying(false); return; }
      const m = msgs[shown];
      if (m.who === "ai" && !reduce) {
        const t = document.createElement("li"); t.className = "ac-msg ai typing"; t.innerHTML = "<i></i><i></i><i></i>"; list.append(t); list.scrollTop = list.scrollHeight;
        timer = setTimeout(() => { t.remove(); if (!playing) return; render(shown + 1, true); timer = setTimeout(tick, readTime(m)); }, 900);
      } else { render(shown + 1, true); timer = setTimeout(tick, readTime(m)); }
    }
    const stop = () => { clearTimeout(timer); $(".ac-msg.typing", el)?.remove(); setPlaying(false); };
    const go = n => { stop(); render(Math.max(1, Math.min(N, n)), true); out("INPUT", `Chat → step ${shown}/${N}`); };
    prev.addEventListener("click", () => go(shown - 1));
    next.addEventListener("click", () => go(shown + 1));
    segs.forEach(b => b.addEventListener("click", () => go(+b.dataset.k)));
    playBtn.addEventListener("click", () => {
      if (playing) { stop(); out("INPUT", `Chat paused at ${shown}/${N}`); return; }
      if (shown >= N) render(0);
      setPlaying(true); tick();
    });
    el.addEventListener("keydown", e => { if (e.key === "ArrowLeft") go(shown - 1); if (e.key === "ArrowRight") go(shown + 1); });
    render(0); setPlaying(false);
    if (reduce) { render(N); return; }
    whenVisible(el, () => { if (!playing && shown === 0) { setPlaying(true); tick(); } }, null, .35);
  };

  /* =====================================================
     ВАША СЕССИЯ КАК ВОРОНКА (данные только в этом браузере)
     ===================================================== */
  W.visit = el => {
    const render = () => {
      const s = S.session(), mins = Math.max(0, Math.round((Date.now() - s.t0) / 1000));
      const fmt = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
      const steps = [
        [T("Открыли сайт", "Opened the site"), true, fmt(mins)],
        [T("Посмотрели проекты", "Looked at the projects"), s.sections.includes("Workspace.Games") || s.games.length > 0, ""],
        [T("Открыли страницу игры", "Opened a game page"), s.games.length > 0, s.games.length ? T(`игр: ${s.games.length}`, `games: ${s.games.length}`) : ""],
        [T("Попробовали демо сундука", "Tried the chest demo"), s.chest > 0, s.chest ? T(`открыто ${s.chest}, лучший: ${s.best}`, `opened ${s.chest}, best: ${s.best}`) : ""],
        [T("Заглянули в код или систему", "Looked into code or a system"), s.code > 0, s.code ? T(`действий: ${s.code}`, `actions: ${s.code}`) : ""],
        [T("Скопировали контакт или открыли Telegram", "Copied a contact or opened Telegram"), s.contact > 0, ""]
      ];
      const lastDone = steps.map(x => x[1]).lastIndexOf(true);
      el.innerHTML = `<div class="vf">
        <ol>${steps.map(([t, ok, d], k) => `<li class="${ok ? "ok" : ""}${k === lastDone + 1 ? " next" : ""}"><span class="vf-n">${ok ? "✓" : k + 1}</span><span class="vf-t">${t}</span><span class="vf-d">${d}</span></li>`).join("")}</ol>
        <p>${T("Так я смотрю на игроков: на каком шаге они остановились. Ваш путь посчитан только в этом браузере и никуда не отправляется.", "This is how I look at players: the step where they stopped. Your path is counted only in this browser and is sent nowhere.")}</p>
      </div>`;
    };
    render();
    let t = null;
    whenVisible(el, () => { render(); clearInterval(t); t = setInterval(() => { if (!el.isConnected) return clearInterval(t); render(); }, 2000); }, () => clearInterval(t));
  };

  /* ---------- Grow Your Parts: тогда и сейчас ---------- */
  W.compare = el => {
    const rows = [
      [T("Кто растит тело", "Who grows the body"), T("Сервер меняет размер каждой части и рассылает всем", "The server resizes every part and replicates it to everyone"), T("Сервер считает ступеньки и хитбокс, тела растит каждый клиент с бюджетом на кадр", "The server counts steps and the hitbox; each client grows bodies with a per-frame budget")],
      [T("Что растёт", "What grows"), T("Части по жёсткому порядку", "Parts in a fixed order"), T("Игрок выбирает 1 или несколько из 15, детали растут по очереди", "The player picks 1 or more of 15; parts grow in turn")],
      [T("Лимит кликов", "Click limit"), T("Не больше 12 в секунду", "No more than 12 per second"), T("«Ведро с жетонами»: рывок проходит, автокликер упирается", "A token bucket: a burst passes, an autoclicker hits the cap")],
      [T("Визуал клика", "Click visuals"), T("Тело перестраивается на каждом N-м клике", "The body rebuilds on every Nth click"), T("Вспышки кликов собираются в одну пачку раз в 0,2 с", "Click flashes are batched once every 0.2 s")],
      [T("Масштаб", "Scale"), T("35 сервисов, ~53 тыс. строк", "35 services, ~53K lines"), T("55 систем с паспортами, ~116 тыс. строк, тесты", "55 systems with passports, ~116K lines, tests")]
    ];
    el.innerHTML = `<div class="cmp">
      <div class="cmp-head"><span></span><span><img src="${S.iconSrc("growth")}" alt="">1 Click = 1 Growth</span><span><img src="${S.iconSrc("gyp")}" alt="">Grow Your Parts</span></div>
      ${rows.map(([k, a, b]) => `<div class="cmp-row"><span class="cmp-k">${k}</span><span class="cmp-a">${a}</span><span class="cmp-b">${b}</span></div>`).join("")}
    </div>`;
    const r = $$(".cmp-row", el);
    if (reduce) { r.forEach(x => x.classList.add("on")); return; }
    whenVisible(el, () => r.forEach((x, i) => setTimeout(() => x.classList.add("on"), i * 220)), null, .3);
  };

  /* ---------- Build a Bonfire: слой кучи и склейка коллизии ---------- */
  W.pile = el => {
    const C = 14, R = 7, CELL = 22;
    el.innerHTML = `<figure class="pile">
      <div class="pile-top"><span>${T("Слой", "Layer")} <b class="pile-layer">1</b> / 68</span><span>${T("брёвен в слое", "logs in layer")}: <b class="pile-logs">0</b></span><span>${T("коллайдеров", "colliders")}: <b class="pile-col">0</b></span></div>
      <svg viewBox="0 0 ${C * CELL} ${R * CELL}" role="img" aria-label="${T("Текущий слой кучи: занятые места склеиваются в прямоугольники коллизии", "The current pile layer: occupied places merge into collision rectangles")}">
        <g class="pile-grid">${Array.from({ length: C * R }, (_, k) => `<rect x="${(k % C) * CELL + 1}" y="${Math.floor(k / C) * CELL + 1}" width="${CELL - 2}" height="${CELL - 2}" rx="3"/>`).join("")}</g>
        <g class="pile-boxes"></g>
      </svg>
      <figcaption><span class="pile-key pk-log">${T("бревно", "log")}</span><span class="pile-key pk-box">${T("прямоугольник коллизии", "collision rectangle")}</span><span class="pile-done"></span></figcaption>
    </figure>`;
    const cells = $$(".pile-grid rect", el), boxes = $(".pile-boxes", el), logsEl = $(".pile-logs", el), colEl = $(".pile-col", el), layerEl = $(".pile-layer", el), done = $(".pile-done", el);
    let occ = new Array(C * R).fill(false), layer = 1;
    /* Тот же принцип, что в игре: непрерывные ряды в колонке → интервалы, одинаковые соседние колонки → один прямоугольник */
    function merge() {
      const cols = [];
      for (let c = 0; c < C; c++) {
        const runs = []; let start = -1;
        for (let r = 0; r <= R; r++) {
          const on = r < R && occ[r * C + c];
          if (on && start < 0) start = r;
          if (!on && start >= 0) { runs.push([start, r - 1]); start = -1; }
        }
        cols.push(runs);
      }
      const rects = [];
      const open = new Map();
      for (let c = 0; c <= C; c++) {
        const keys = new Set((cols[c] || []).map(([a, b]) => a + ":" + b));
        for (const [k, rc] of open) if (!keys.has(k)) { rects.push(rc); open.delete(k); }
        for (const [a, b] of cols[c] || []) { const k = a + ":" + b; if (open.has(k)) open.get(k).c2 = c; else open.set(k, { c1: c, c2: c, a, b }); }
      }
      return rects;
    }
    function draw() {
      cells.forEach((r, k) => r.classList.toggle("on", occ[k]));
      const rects = merge();
      boxes.innerHTML = rects.map(({ c1, c2, a, b }) => `<rect x="${c1 * CELL + 1}" y="${a * CELL + 1}" width="${(c2 - c1 + 1) * CELL - 2}" height="${(b - a + 1) * CELL - 2}" rx="4"/>`).join("");
      const n = occ.filter(Boolean).length;
      logsEl.textContent = n; colEl.textContent = rects.length;
    }
    function place() {
      const free = occ.map((v, k) => v ? -1 : k).filter(k => k >= 0);
      if (!free.length) {
        done.textContent = T(`слой ${layer} готов → одна плита`, `layer ${layer} done → one plate`);
        el.querySelector("svg").classList.add("plate");
        setTimeout(() => { if (!el.isConnected) return; occ.fill(false); layer = layer % 68 + 1; layerEl.textContent = layer; done.textContent = ""; el.querySelector("svg").classList.remove("plate"); draw(); }, 1400);
        return;
      }
      /* Игроки кладут брёвна рядом с уже лежащими: так куча и растёт на самом деле */
      const near = free.filter(k => occ[k - 1] || occ[k + 1] || occ[k - C] || occ[k + C]);
      const pool = near.length && Math.random() < .75 ? near : free;
      for (let t = 0; t < 3 && pool.length; t++) occ[pool.splice(Math.floor(Math.random() * pool.length), 1)[0]] = true;
      draw();
    }
    draw();
    if (reduce) { for (let k = 0; k < 60; k++) occ[k] = true; draw(); return; }
    loop(el, () => place(), 260);
  };

  /* ---------- Spell Brawl: кто что делал ---------- */
  W.duo = el => {
    const me = [T("Каркас игры", "Game framework"), T("Система героев: наведение и применение способностей", "Hero system: targeting and casting abilities"), T("Магазин и внутриигровые покупки", "Shop and in-game purchases"), T("Аналитика", "Analytics"), T("Сохранения на ProfileStore", "Saving with ProfileStore"), T("Часть героев", "Some of the heroes")];
    const partner = [T("Интерфейс и его код", "UI and its code"), T("Карта", "The map"), T("Часть эффектов", "Some of the effects"), T("Часть героев", "Some of the heroes"), T("Код NPC", "NPC code")];
    el.innerHTML = `<div class="duo">
      <div class="duo-col me"><b>${T("Я", "Me")}</b><ul>${me.map(t => `<li>${t}</li>`).join("")}</ul></div>
      <div class="duo-col partner"><b>${T("Напарник", "Partner")}</b><ul>${partner.map(t => `<li>${t}</li>`).join("")}</ul></div>
    </div>`;
    const li = $$(".duo li", el);
    if (reduce) { li.forEach(x => x.classList.add("on")); return; }
    whenVisible(el, () => li.forEach((x, i) => setTimeout(() => x.classList.add("on"), i * 120)), null, .3);
  };

  S.widget = (name, el) => { if (W[name]) W[name](el); };
})();
