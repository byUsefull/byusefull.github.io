/* Страницы игр: game.html?g=<id>.
   Каждая история: что видит игрок → где сложно → что я сделал → чем закончилось.
   Факты — из исходников игр, публичных страниц Roblox и слов Кирилла (см. CLAUDE.md).
   Тексты { ru, en }; visual — схема из game.js; code — пример на Luau. */
window.PAGES = {

  /* ========================= 1 Click = 1 Growth ========================= */
  growth: {
    lede: { ru: "Персонаж появляется почти без тела, с&nbsp;одной головой. Клики дают силу, а&nbsp;сила по&nbsp;очереди отращивает торс, руки и&nbsp;ноги, пока тело не&nbsp;станет огромным.",
            en: "Your character spawns with almost no body, just a head. Clicks give strength, and strength grows the torso, arms and legs one by one until the body is huge." },
    mine: { ru: "Игру я&nbsp;сделал один: идея, код, интерфейсы, экономика, монетизация и&nbsp;обновления.",
            en: "I built the game alone: idea, code, UI, economy, monetization and updates." },
    props: [
      ["Visits", "5 400 000+", 1],
      [{ ru: "Избранное", en: "Favorites" }, "540 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Автор, соло-проект", en: "Author, solo project" }],
      [{ ru: "Срок", en: "Timeline" }, { ru: "Написал игру за&nbsp;10&nbsp;дней", en: "Wrote the game in 10&nbsp;days" }]
    ],
    links: [{ href: "https://www.roblox.com/games/81210336803875/1-Click-1-Growth", label: { ru: "Страница в Roblox", en: "Roblox page" } }],
    status: { ru: "Страница открывается, но&nbsp;поиграть сейчас нельзя.", en: "The page opens, but the game can’t be played right now." },
    chapters: [
      { id: "body", h: { ru: "Тело растёт по&nbsp;частям и&nbsp;не&nbsp;разваливается", en: "The body grows part by part and doesn’t fall apart" },
        text: { ru: "Каждая часть R15 растёт отдельно и&nbsp;в&nbsp;своём порядке, а&nbsp;вместе с&nbsp;ней должны сдвинуться суставы, шляпы и&nbsp;хитбокс&nbsp;— иначе рука отходит от&nbsp;плеча. Каждый новый размер сервер рассылает всем игрокам, поэтому сила копится на&nbsp;каждом клике, а&nbsp;тело перестраивается реже.",
                en: "Every R15 part grows on its own and in its own order, and the joints, hats and hitbox have to move with it, otherwise an arm drifts away from the shoulder. Every new size is replicated to all players, so strength is counted on every click while the body is rebuilt less often." },
        visual: "body",
        code: { script: "GrowthService", src: `-- GrowthService (сервер), упрощено
-- Часть выросла: двигаем точки крепления суставов вместе с ней,
-- иначе рука отойдёт от плеча или уйдёт внутрь торса
local function scaleJoints(joints, scale: number)
	for motor, saved in joints do -- исходные C0/C1 сохранены при спавне
		local cf = if saved.isPart0 then saved.C0 else saved.C1
		local moved = CFrame.new(cf.Position * scale) * cf.Rotation
		if saved.isPart0 then motor.C0 = moved else motor.C1 = moved end
	end
end

-- Сила копится на каждом клике, а тело перестраивается на каждом N-м:
-- новый размер сервер рассылает всем игрокам на сервере
local function onClick(player: Player, data)
	data.strength += data.strengthPerClick
	clicks[player] += 1
	if clicks[player] % VisualEvery[data.stage] == 0 then
		Growth.rebuild(player, data) -- части, суставы, аксессуары
	end
end` },
        notes: [
          [{ ru: "Суставы", en: "Joints" }, { ru: "Точки крепления Motor6D сдвигаются пропорционально росту части, поворот остаётся прежним.", en: "Motor6D attachment points move in proportion to the part’s growth; rotation stays the same." }],
          [{ ru: "Аксессуары", en: "Accessories" }, { ru: "Шляпы и&nbsp;волосы растут вместе с&nbsp;частью, к&nbsp;которой прикреплены. Слоёную одежду код не&nbsp;трогает.", en: "Hats and hair grow with the part they’re attached to. Layered clothing is left alone." }],
          [{ ru: "Сеть", en: "Network" }, { ru: "На&nbsp;первых стадиях тело перестраивается на&nbsp;каждом клике, дальше&nbsp;— на&nbsp;каждом 2-м, 3-м и&nbsp;так до&nbsp;15-го. С&nbsp;клиента сервер принимает не&nbsp;больше 12&nbsp;кликов в&nbsp;секунду.", en: "In the first stages the body is rebuilt on every click, later on every 2nd, 3rd and up to every 15th. The server accepts no more than 12 clicks per second from a client." }]
        ],
        caption: { ru: "Код сокращён до&nbsp;принципа из&nbsp;GrowthService игры, имена упрощены. Порядок частей&nbsp;— из&nbsp;конфига игры, ступни в&nbsp;балансе не&nbsp;участвуют.", en: "The code is cut down to the principle from the game’s GrowthService; names are simplified. Part order is from the game config; feet are not part of the balance." } },
      { id: "after", h: { ru: "После релиза: обновления и&nbsp;один срочный фикс", en: "After release: updates and one urgent fix" },
        text: { ru: "Игра жила обновлениями, а&nbsp;к&nbsp;праздникам выходили ивенты с&nbsp;тематическими зонами. После каждого крупного обновления я&nbsp;сам играю в&nbsp;новую версию и&nbsp;собираю отзывы игроков.",
                en: "The game lived on updates, and holidays brought events with themed zones. After every big update I play the new version myself and collect player feedback." },
        list: [
          ["zones", { ru: "Новые зоны с&nbsp;множителями силы", en: "New zones with strength multipliers" }],
          ["pets", { ru: "Питомцы и&nbsp;яйца", en: "Pets and eggs" }],
          ["pvp", { ru: "PvP-зона", en: "PvP zone" }],
          ["event", { ru: "Весенний пасхальный ивент: кролик, тематическая зона и&nbsp;лимитированные яйца", en: "Spring Easter event: a bunny, a themed zone and limited eggs" }],
          ["event", { ru: "Зимний новогодний ивент: тематическая зона и&nbsp;лимитированные яйца", en: "Winter New Year event: a themed zone and limited eggs" }]
        ],
        blocks: [
          { h: { ru: "Лидерборды на&nbsp;все серверы", en: "Leaderboards across all servers" },
            t: { ru: "Один сервер берёт замок в&nbsp;MemoryStore и&nbsp;раз в&nbsp;15&nbsp;минут переносит топ-100 из&nbsp;OrderedDataStore в&nbsp;MemoryStore. Остальные серверы читают готовый топ и&nbsp;не&nbsp;нагружают хранилище.",
                 en: "One server takes a lock in MemoryStore and every 15 minutes copies the top 100 from OrderedDataStore into MemoryStore. Other servers read the ready top and don’t hit the data store." } },
          { log: [["WARN", "Potion boosts never expire after update"], ["OK", "Hotfix published, servers restarted"]],
            t: { ru: "Однажды после обновления бусты зелий перестали заканчиваться. Я&nbsp;сразу выпустил хотфикс и&nbsp;перезапустил серверы.",
                 en: "Once, after an update, potion boosts stopped expiring. I shipped a hotfix right away and restarted the servers." } }
        ] }
    ],
    result: { ru: "Итог: 5,4&nbsp;миллиона посещений и&nbsp;540&nbsp;тысяч добавлений в&nbsp;избранное. Ту&nbsp;же идею я&nbsp;развил в&nbsp;<a href=\"game.html?g=heat\">1&nbsp;Click = 1&nbsp;Heat</a>, где тело раскаляется, а&nbsp;потом сделал игру заново&nbsp;— <a href=\"game.html?g=gyp\">Grow Your Parts</a>.",
              en: "Result: 5.4 million visits and 540 thousand favorites. I took the same idea further in <a href=\"game.html?g=heat\">1&nbsp;Click = 1&nbsp;Heat</a>, where the body heats up, and later rebuilt the game from scratch as <a href=\"game.html?g=gyp\">Grow Your Parts</a>." }
  },

  /* ========================= My Magic Staff Farm ========================= */
  staff: {
    lede: { ru: "Игрок открывает сундуки, получает посохи разной редкости и&nbsp;ставит их на&nbsp;базу. Посохи производят ящики, ящики едут по&nbsp;конвейеру, игрок продаёт их и&nbsp;покупает сундуки дороже. А&nbsp;боевым посохом можно сразиться на&nbsp;PvP-арене.",
            en: "The player opens chests, gets staffs of different rarity and places them on the base. Staffs produce crates, crates ride a conveyor, the player sells them and buys pricier chests. A battle staff takes you to the PvP arena." },
    mine: { ru: "Модели и&nbsp;эффекты делал 3D-моделлер. Идея, архитектура, код, экономика, интерфейсы и&nbsp;обновления&nbsp;— мои.",
            en: "A 3D modeler made the models and effects. The idea, architecture, code, economy, UI and updates are mine." },
    props: [
      ["Visits", "3 100 000", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Автор и&nbsp;программист", en: "Author and programmer" }],
      [{ ru: "Итог", en: "Result" }, { ru: "Инвестор купил 30% проекта", en: "An investor bought 30% of the project" }],
      [{ ru: "Код", en: "Code" }, { ru: "около 120 тысяч строк Luau", en: "about 120 thousand lines of Luau" }]
    ],
    links: [
      { href: "https://www.roblox.com/games/93260338408984/My-Magic-Staff-Farm", label: { ru: "Играть в&nbsp;новую версию", en: "Play the new version" }, play: true },
      { href: "https://www.roblox.com/games/110210587510503/My-Magic-Staff-Farm", label: { ru: "Первая версия: 3,1&nbsp;млн посещений", en: "First version: 3.1M visits" } }
    ],
    notice: { ru: "Первая версия вышла в&nbsp;группе, которую Roblox заблокировал за&nbsp;продажу Robux в&nbsp;обход правил платформы. Мы перевыпустили игру в&nbsp;новой группе: 3,1&nbsp;миллиона посещений набрала первая версия, а&nbsp;играть сейчас можно в&nbsp;новой.",
              en: "The first version was released in a group that Roblox banned for selling Robux outside the platform rules. We re-released the game in a new group: the first version got 3.1 million visits, and the new one is where you can play now." },
    chapters: [
      { id: "chest", h: { ru: "Сундук открывает сервер, а&nbsp;не&nbsp;игрок", en: "The server opens the chest, not the player" },
        text: { ru: "Если&nbsp;бы редкость выпадала на&nbsp;устройстве игрока, читер мог&nbsp;бы её&nbsp;подменить. Поэтому клиент только просит открыть сундук, а&nbsp;проверки и&nbsp;бросок делает сервер. Попробуйте сами: нажмите очень часто или потратьте все деньги.",
                en: "If rarity were rolled on the player’s device, a cheater could fake it. So the client only asks to open a chest, and the server does the checks and the roll. Try it: click very fast or spend all the money." },
        visual: "chest" },
      { id: "after", h: { ru: "После релиза: обновления, турниры и&nbsp;боссы", en: "After release: updates, tournaments and bosses" },
        text: { ru: "Регулярно выходили новые сундуки и&nbsp;посохи, реже&nbsp;— крупные обновления с&nbsp;новыми механиками: мутации, PvP, PvE, погодные ивенты, трейды и&nbsp;мини-игры. В&nbsp;Discord мы проводили PvP-турниры между игроками за&nbsp;админские предметы.",
                en: "New chests and staffs came out regularly; bigger updates brought new mechanics: mutations, PvP, PvE, weather events, trading and mini-games. On Discord we ran PvP tournaments between players for admin items." },
        blocks: [
          { accent: 1, h: { ru: "Последнее обновление: боссы", en: "The latest update: bosses" },
            t: { ru: "В&nbsp;игре появилось полноценное PvE. Раз в&nbsp;час выходит босс, из&nbsp;него выпадает уникальный сундук, а&nbsp;за&nbsp;обычных врагов дают кэш и&nbsp;гемы. Сундук с&nbsp;босса открывается так&nbsp;же, как в&nbsp;демо выше: бросок делает сервер.",
                 en: "The game got full PvE. Once an hour a boss spawns and drops a unique chest, while regular enemies give cash and gems. The boss chest opens just like in the demo above: the server does the roll." } },
          { h: { ru: "Что тормозило на&nbsp;самом деле", en: "What was actually slow" },
            t: { ru: "Когда кода стало около 120&nbsp;тысяч строк, я&nbsp;снял профиль в&nbsp;MicroProfiler. Скрипты занимали около 3&nbsp;мс на&nbsp;кадр, а&nbsp;основную нагрузку давала сцена: тени, частицы и&nbsp;перерисовка интерфейса. По&nbsp;профилю я&nbsp;разбил игру на&nbsp;21&nbsp;систему и&nbsp;оптимизировал её, начиная с&nbsp;того, что управляет сценой. Например, частицам нужна дальность отрисовки, а&nbsp;боевые эффекты стоит рассылать только игрокам у&nbsp;арены, а&nbsp;не&nbsp;всему серверу.",
                 en: "When the code grew to about 120 thousand lines, I took a MicroProfiler capture. Scripts took about 3 ms per frame; the real load was the scene: shadows, particles and UI redraws. Based on the profile I split the game into 21 systems and optimized it, starting with what drives the scene. For example, particles need a draw distance, and combat effects should go only to players near the arena, not to the whole server." } }
        ] }
    ],
    result: { ru: "Итог: 3,1&nbsp;миллиона посещений, 30% проекта купил инвестор.", en: "Result: 3.1 million visits, an investor bought 30% of the project." }
  },

  /* ========================= Мир Кинопоиска ========================= */
  kinopoisk: {
    lede: { ru: "Большой кинотеатр-лобби и&nbsp;восемь мини-игр по&nbsp;фильмам и&nbsp;сериалам: дуэли на&nbsp;шпагах из&nbsp;«Этерны», полицейский департамент «Майора Грома», гонки на&nbsp;буханках из&nbsp;«Кибердеревни», рок-бар «Короля и&nbsp;Шута». За&nbsp;игры дают «вайбики», на&nbsp;них покупается одежда героев.",
            en: "A big movie-theater lobby and eight mini-games based on films and series: rapier duels from “Eterna”, Major Grom’s police department, van races from “Cyber Village”, the “Korol i Shut” rock bar. Games pay out “vibes”, which buy the characters’ outfits." },
    mine: { ru: "Я&nbsp;был ведущим программистом в&nbsp;студии MAFF: сделал лобби и&nbsp;общий каркас, к&nbsp;которому подключали свои мини-игры ещё четыре программиста. Сам сделал мини-игру «Король и&nbsp;Шут».",
            en: "I was the lead programmer at the MAFF studio: I built the lobby and the shared framework that four more programmers plugged their mini-games into. I made the “Korol i Shut” mini-game myself." },
    props: [
      ["Visits", "354 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Ведущий программист, MAFF", en: "Lead programmer, MAFF" }],
      [{ ru: "Год", en: "Year" }, "2025"],
      [{ ru: "Плейсы", en: "Places" }, { ru: "лобби и&nbsp;8&nbsp;мини-игр", en: "lobby and 8 mini-games" }],
      [{ ru: "Разработка", en: "Development" }, { ru: "около полугода", en: "about six months" }]
    ],
    links: [
      { href: "https://www.roblox.com/games/131987391427170/unnamed", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true },
      { href: "https://maff.media/kinopoisk-in-roblox/", label: { ru: "Кейс MAFF", en: "MAFF case study" } }
    ],
    press: [
      ["Кинопоиск", "https://www.kinopoisk.ru/media/article/4011285/", { ru: "«Мир Кинопоиска» в&nbsp;Roblox: можно встретиться с&nbsp;актёрами «Этерны» и&nbsp;поймать Чумного Доктора", en: "“Kinopoisk World” in Roblox: meet the cast of “Eterna” and catch the Plague Doctor" }],
      ["RG.ru", "https://rg.ru/2025/06/03/kinopoisk-zapustil-igrovoe-fandom-prostranstvo-v-roblox.html", { ru: "Кинопоиск запустил игровое фандом-пространство в&nbsp;Roblox", en: "Kinopoisk launched a gaming fandom space in Roblox" }],
      ["Trashbox", "https://trashbox.ru/link/2025-06-03-mini-igry-kinopoisk-v-roblox", { ru: "Мини-игры Кинопоиска в&nbsp;Roblox", en: "Kinopoisk mini-games in Roblox" }],
      ["Gamer.ru", "https://www.gamer.ru/ru/p/kinopoisk-zapuskaet-igrovoe-fandom-prostranstvo-v-roblox-X01FgPZumQCtD", { ru: "Кинопоиск запускает игровое фандом-пространство в&nbsp;Roblox", en: "Kinopoisk launches a gaming fandom space in Roblox" }],
      ["КиноТВ", "https://kinotv.ru/read/news/geroi-eterny-i-nekiy-sekretnyy-gost-popolnyat-mir-kinopoiska-v-roblox/", { ru: "Герои «Этерны» и&nbsp;секретный гость пополнят «Мир Кинопоиска» в&nbsp;Roblox", en: "“Eterna” heroes and a secret guest join “Kinopoisk World” in Roblox" }],
      ["Licensing Russia", "https://licensingrussia.ru/article/15293-kinopoisk-otkryl-v-roblox-svoe-prostranstvo-s-mini-igrami-po-maioru-gromu-inym-i-eterne/", { ru: "Кинопоиск открыл в&nbsp;Roblox пространство с&nbsp;мини-играми по&nbsp;«Майору Грому», «Иным» и&nbsp;«Этерне»", en: "Kinopoisk opened a Roblox space with mini-games based on “Major Grom”, “The Others” and “Eterna”" }]
    ],
    chapters: [
      { id: "kit", h: { ru: "Пять программистов, один мир", en: "Five programmers, one world" },
        text: { ru: "Каждая мини-игра&nbsp;— отдельный плейс, игрок попадает туда телепортом из&nbsp;лобби. Чтобы валюта, одежда, прогресс и&nbsp;лидерборды были общими, я&nbsp;сделал каркас: мини-игра сообщает только результат, а&nbsp;сохранение, рейтинг и&nbsp;возврат в&nbsp;лобби берёт на&nbsp;себя он.",
                en: "Each mini-game is a separate place, and players teleport there from the lobby. To keep currency, outfits, progress and leaderboards shared, I built a framework: a mini-game only reports the result, and saving, ranking and returning to the lobby are handled by the framework." },
        visual: "arch",
        code: { script: "KishGame", src: `-- Внутри мини-игры: всё, что ей нужно знать о каркасе
local Kit = require(ReplicatedStorage.Kit)

local function onSongFinished(player: Player, score: number)
	-- Валюта и прогресс: один профиль на все плейсы
	Kit.Data.update(player, function(profile)
		profile.vibes += Rewards.forScore(score)
	end)

	-- Рейтинг этой мини-игры, его же показывает лобби
	Kit.Leaderboard.submit(player, "KiSh", score)

	-- Сохранить до телепорта, иначе прогресс пропадёт
	Kit.Teleport.toLobby(player, { saveFirst = true })
end` },
        caption: { ru: "Упрощённый пример: так мини-игра сдаёт результат через каркас. Названия модулей условные.", en: "A simplified example: this is how a mini-game reports its result through the framework. Module names are illustrative." },
        after: { ru: "До&nbsp;начала работы я&nbsp;объяснял команде архитектуру, потом помогал подключать мини-игры к&nbsp;каркасу и&nbsp;разбирал ошибки интеграции.",
                 en: "Before work started I walked the team through the architecture, then helped connect mini-games to the framework and debugged integration errors." } },
      { id: "kish", h: { ru: "Моя мини-игра: «Король и&nbsp;Шут»", en: "My mini-game: “Korol i Shut”" },
        text: { ru: "Ритм-игра, как на&nbsp;телефоне: ноты едут на&nbsp;игрока в&nbsp;такт музыке группы, и&nbsp;нужно успеть запрыгнуть на&nbsp;нужную. Играют вчетвером, друг против друга. Главная сложность техническая: ноты должны приходить точно в&nbsp;бит у&nbsp;всех четырёх игроков, иначе игра превращается в&nbsp;угадайку.",
                en: "A rhythm game like on a phone: notes ride toward the player in time with the band’s music, and you have to jump onto the right one in time. Four players compete against each other. The main difficulty is technical: notes have to land exactly on the beat for all four players, otherwise the game turns into guesswork." },
        visual: "rhythm",
        after: { ru: "Два плейса: лобби в&nbsp;стиле рок-бара и&nbsp;сама игра. К&nbsp;каркасу она подключена так&nbsp;же, как мини-игры остальной команды: результат уходит в&nbsp;общий рейтинг, награда&nbsp;— в&nbsp;«вайбики».",
                 en: "Two places: a rock-bar lobby and the game itself. It plugs into the framework the same way as the rest of the team’s mini-games: the result goes to the shared ranking and the reward goes into “vibes”." },
        caption: { ru: "Схема механики, а&nbsp;не&nbsp;кадр из&nbsp;игры.", en: "A diagram of the mechanic, not a game screenshot." } },
      { id: "life", h: { ru: "Жизнь проекта", en: "The project’s life" },
        text: { ru: "После релиза вышли два крупных обновления и&nbsp;ивент. Вокруг игры MAFF проводила активности, и&nbsp;часть из&nbsp;них шла через лидерборды мини-игр.",
                en: "After release there were two big updates and an event. MAFF ran activities around the game, and some of them ran on the mini-game leaderboards." },
        list: [
          ["top-5", { ru: "Еженедельная раздача Robux пятёрке лучших в&nbsp;любой из&nbsp;мини-игр", en: "Weekly Robux giveaways to the top five in any mini-game" }],
          ["ugc", { ru: "Лимитированные UGC за&nbsp;задания", en: "Limited UGC items for quests" }],
          ["safe", { ru: "Никакого доната: безопасное место для детей", en: "No paid items at all: a safe place for kids" }],
          ["q&a", { ru: "Встреча с&nbsp;актёрами сериала «Этерна»", en: "A Q&A with the cast of “Eterna”" }]
        ] }
    ],
    result: { ru: "Итог: больше 350&nbsp;тысяч посещений, студия MAFF опубликовала кейс проекта. Другие мои проекты в&nbsp;MAFF: <a href=\"game.html?g=khl\">Звёзды хоккея</a> и&nbsp;<a href=\"game.html?g=marmelad\">Завод Мармеладыча</a>.",
              en: "Result: over 350 thousand visits, and MAFF published a case study. My other MAFF projects: <a href=\"game.html?g=khl\">Hockey Stars</a> and <a href=\"game.html?g=marmelad\">Marmeladych Factory</a>." }
  },

  /* ========================= Don't Leave the Circle ========================= */
  circle: {
    lede: { ru: "До&nbsp;50&nbsp;игроков стоят в&nbsp;красном круге и&nbsp;выживают день за&nbsp;днём: следят за&nbsp;едой, водой, сном и&nbsp;душем, а&nbsp;каждый день проходят мини-игру&nbsp;— паркур, зомби, лазеры. Побеждает последний, кто остался в&nbsp;круге.",
            en: "Up to 50 players stand in a red circle and survive day after day: they manage food, water, sleep and showers, and each day brings a mini-game — parkour, zombies, lasers. The last one left in the circle wins." },
    mine: { ru: "Это чужая большая игра студии Lightmood Studios. Меня пригласили программистом.", en: "This is someone else’s big game by Lightmood Studios. I was invited as a programmer." },
    props: [
      ["Visits", "58 400 000+", 1],
      [{ ru: "Чьи посещения", en: "Whose visits" }, { ru: "у&nbsp;игры целиком", en: "the whole game’s" }],
      [{ ru: "Роль", en: "Role" }, { ru: "Приглашённый программист", en: "Invited programmer" }],
      [{ ru: "Формат", en: "Format" }, { ru: "до&nbsp;50&nbsp;игроков", en: "up to 50 players" }]
    ],
    links: [{ href: "https://www.roblox.com/games/135279186223423/Dont-leave-the-circle", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "join", h: { ru: "Встроиться в&nbsp;игру, которую уже играют миллионы", en: "Fitting into a game millions already play" },
        text: { ru: "В&nbsp;своей игре я&nbsp;решаю, как всё устроено. Здесь архитектура уже была, а&nbsp;игра работала под живой нагрузкой. Сначала я&nbsp;разбирался, как устроен проект, и&nbsp;только потом встраивал новое так, чтобы не&nbsp;сломать то, что уже работает.",
                en: "In my own game I decide how everything works. Here the architecture already existed and the game was running under live load. First I figured out how the project works, and only then fitted new things in without breaking what already worked." },
        notes: [
          [{ ru: "Мини-игры", en: "Mini-games" }, { ru: "Сделал много ежедневных испытаний, которые встраиваются в&nbsp;цикл дня и&nbsp;ночи.", en: "Built many of the daily challenges that slot into the day-night loop." }],
          [{ ru: "Предметы", en: "Items" }, { ru: "Сделал систему предметов и&nbsp;другие игровые системы.", en: "Built the item system and other game systems." }],
          [{ ru: "Интеграция", en: "Integration" }, { ru: "Новое подключал к&nbsp;существующим компонентам проекта, а&nbsp;не&nbsp;строил рядом своё.", en: "Plugged new work into the project’s existing components instead of building my own next to them." }]
        ] }
    ],
    result: { ru: "Итог: игра набрала больше 58&nbsp;миллионов посещений. Это аудитория всего проекта, а&nbsp;не&nbsp;только моих частей.", en: "Result: the game has over 58 million visits. That’s the audience of the whole project, not just my parts." }
  },

  /* ========================= Sort the Museum ========================= */
  sort: {
    lede: { ru: "Все картины в&nbsp;музее упали со&nbsp;стен. До&nbsp;четырёх друзей разбирают завалы, несут каждую картину в&nbsp;зал её&nbsp;художника и&nbsp;вешают на&nbsp;стену. 56&nbsp;художников, больше 2600&nbsp;картин, 8&nbsp;классов, джетпак и&nbsp;чёрная дыра, которая сама тянет картины к&nbsp;стенам.",
            en: "Every painting in the museum has fallen off the walls. Up to four friends dig through the piles, carry each painting to its artist’s hall and hang it up. 56 artists, over 2,600 paintings, 8 classes, a jetpack and a black hole that pulls paintings to the walls." },
    mine: { ru: "Моя новая игра, вышла в&nbsp;октябре 2026. В&nbsp;ней лучшие наработки из&nbsp;прошлых проектов, и&nbsp;я&nbsp;продолжаю её&nbsp;развивать.", en: "My new game, released in October 2026. It carries the best of my previous projects, and I keep developing it." },
    props: [
      ["Visits", "41 800+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Автор", en: "Author" }],
      [{ ru: "Вышла", en: "Released" }, { ru: "октябрь 2026", en: "October 2026" }],
      [{ ru: "Формат", en: "Format" }, { ru: "кооп на&nbsp;1–4&nbsp;игроков", en: "co-op for 1–4 players" }]
    ],
    links: [{ href: "https://www.roblox.com/games/75656324986319/Sort-the-Museum", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "idea", h: { ru: "Игра не&nbsp;про уборку, а&nbsp;про маршрут", en: "It’s not about tidying, it’s about the route" },
        text: { ru: "Сортировка тут только повод. На&nbsp;деле это игра про маршрут, движение и&nbsp;разгон: за&nbsp;каждую картину дают монеты, их&nbsp;сразу тратят на&nbsp;ускорения, которые сгорают в&nbsp;конце забега. Неистраченные монеты превращаются в&nbsp;кэш для постоянных покупок, и&nbsp;это главное решение игрока: вложиться в&nbsp;разгон или унести в&nbsp;банк.",
                en: "Sorting is just the excuse. It’s really a game about route, movement and speeding up: each painting pays coins that are spent right away on boosts that burn out at the end of the run. Unspent coins turn into cash for permanent purchases, and that is the player’s key decision: invest in speed or bank it." },
        notes: [
          [{ ru: "Провала нет", en: "No fail state" }, { ru: "Единственный результат забега&nbsp;— время.", en: "The only result of a run is time." }],
          [{ ru: "Магазин", en: "Shop" }, { ru: "Все покупки&nbsp;— про перемещение: джетпак, ботинки, платформы. Поэтому движение должно ощущаться отлично.", en: "Every purchase is about movement: jetpack, boots, platforms. So movement has to feel great." }]
        ] },
      { id: "ads", h: { ru: "Обложки для рекламы выбираю по&nbsp;данным", en: "I choose ad thumbnails with data" },
        text: { ru: "С&nbsp;11 по&nbsp;21&nbsp;октября&nbsp;— 7&nbsp;кампаний, 78&nbsp;разных картинок, 984&nbsp;374&nbsp;показа и&nbsp;30&nbsp;550&nbsp;кликов. Мой Python-скрипт сравнивает картинку со&nbsp;средней в&nbsp;той&nbsp;же кампании и&nbsp;не&nbsp;даёт картинке с&nbsp;парой сотен показов стать лидером случайно.",
                en: "From October 11 to 21: 7 campaigns, 78 different images, 984,374 impressions and 30,550 clicks. My Python script compares each image with the average in the same campaign and keeps an image with a couple hundred impressions from winning by chance." },
        visual: "ads",
        caption: { ru: "«Сила»&nbsp;— во&nbsp;сколько раз картинка кликабельнее средней в&nbsp;тех&nbsp;же кампаниях. У&nbsp;IS THAT ME CTR ниже, но&nbsp;она шла в&nbsp;кампаниях, где кликали меньше, и&nbsp;там стабильно обгоняла соседей.",
                   en: "“Strength” is how many times more clickable an image is than the average in the same campaigns. IS THAT ME has a lower CTR, but it ran in campaigns where people clicked less and consistently beat its neighbors there." } }
    ],
    result: { ru: "Игра вышла в&nbsp;октябре и&nbsp;за&nbsp;первые недели набрала больше 41&nbsp;тысячи посещений. Развиваю дальше.", en: "The game came out in October and got over 41 thousand visits in its first weeks. I keep developing it." }
  },

  /* ========================= Grow Your Parts ========================= */
  gyp: {
    lede: { ru: "Игрок сам выбирает, какие части тела растут: одну или сразу несколько из&nbsp;15. Набирает силу, дерётся с&nbsp;NPC за&nbsp;победы, открывает яйца с&nbsp;питомцами и&nbsp;новые острова.",
            en: "The player chooses which body parts grow: one or several of 15. They build strength, fight NPCs for wins, hatch eggs with pets and unlock new islands." },
    mine: { ru: "Новая версия моей <a href=\"game.html?g=growth\">1&nbsp;Click = 1&nbsp;Growth</a>, переделанная во&nbsp;всём: код, дизайн, механики. Всё сделал сам.", en: "A new version of my <a href=\"game.html?g=growth\">1&nbsp;Click = 1&nbsp;Growth</a>, reworked in everything: code, design, mechanics. I did it all myself." },
    props: [
      ["Visits", "29 300+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Автор, соло-проект", en: "Author, solo project" }],
      [{ ru: "Каркас", en: "Framework" }, { ru: "55&nbsp;систем, ~116&nbsp;тыс. строк", en: "55 systems, ~116K lines" }],
      [{ ru: "Вышла", en: "Released" }, { ru: "ноябрь 2026", en: "November 2026" }]
    ],
    links: [{ href: "https://www.roblox.com/games/107905084876273/Grow-Your-Parts", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "again", h: { ru: "Growth, сделанный заново", en: "Growth, built again" },
        text: { ru: "Идея та&nbsp;же, но&nbsp;каждое решение я&nbsp;пересмотрел. Главное: в&nbsp;Growth размер частей менял сервер и&nbsp;рассылал всем, а&nbsp;здесь сервер считает только числа и&nbsp;хитбокс, а&nbsp;тела каждый клиент растит у&nbsp;себя. Телефон в&nbsp;приоритете&nbsp;— на&nbsp;нём, по&nbsp;моей оценке, около 70% игроков, поэтому нагрузку от&nbsp;растущих аватаров держу в&nbsp;голове с&nbsp;первого дня.",
                en: "Same idea, but I revisited every decision. The main one: in Growth the server resized parts and replicated them to everyone; here the server only counts numbers and the hitbox, and each client grows the bodies locally. Phones come first — by my estimate about 70% of players — so the load of growing avatars is planned from day one." },
        visual: "compare",
        code: { script: "ClickBucket", src: `-- ClickBucket: лимит кликов «ведро с жетонами»
-- Рывок человека проходит, автокликер упирается
-- в rate. Проверяется lune-тестом
function ClickBucket.take(b, want, rate, burst, now)
	local capacity = rate * burst
	local elapsed = math.max(0, now - b.at)
	b.tokens = math.min(capacity, b.tokens + elapsed * rate)
	b.at = now
	local taken = math.min(want, math.floor(b.tokens))
	b.tokens -= taken
	return taken -- сколько кликов засчитано
end` },
        caption: { ru: "Код&nbsp;— из&nbsp;игры, слегка сокращён. Справа&nbsp;— почти дословно.", en: "The code is from the game, slightly shortened." } },
      { id: "game", h: { ru: "Что в&nbsp;игре", en: "What’s in the game" },
        text: { ru: "Рост&nbsp;— только начало цикла: сила превращается в&nbsp;победы над NPC, победы&nbsp;— в&nbsp;яйца и&nbsp;питомцев, питомцы ускоряют рост. Первый прототип роста я&nbsp;проверял на&nbsp;12&nbsp;разных манекенах, эту историю можно посмотреть в&nbsp;блоке <a href=\"index.html#ai\">про работу с&nbsp;ИИ</a>.",
                en: "Growth is only the start of the loop: strength turns into wins over NPCs, wins into eggs and pets, and pets speed up growth. I tested the first growth prototype on 12 different mannequins; that story is in the <a href=\"index.html#ai\">working with AI</a> block." },
        list: [
          ["growth", { ru: "Рост любой из&nbsp;15 деталей R15, по&nbsp;очереди: одна деталь до&nbsp;шага, потом следующая", en: "Any of 15 R15 parts grows in turn: one part to its step, then the next" }],
          ["fight", { ru: "Бои с&nbsp;NPC за&nbsp;победы, у&nbsp;каждого своя сила и&nbsp;награда", en: "Fights with NPCs for wins, each with its own strength and reward" }],
          ["pets", { ru: "Яйца, питомцы, слияние в&nbsp;золотых и&nbsp;радужных, индекс коллекции", en: "Eggs, pets, merging into gold and rainbow, a collection index" }],
          ["zones", { ru: "Острова с&nbsp;множителями и&nbsp;PvP-участками", en: "Islands with multipliers and PvP areas" }],
          ["data", { ru: "Аналитика онбординга по&nbsp;66 шагам: где уходит новичок в&nbsp;первые минуты", en: "Onboarding analytics over 66 steps: where newcomers leave in the first minutes" }]
        ] }
    ],
    result: { ru: "Игра вышла в&nbsp;ноябре 2026 и&nbsp;за&nbsp;первые недели набрала больше 29&nbsp;тысяч посещений. На&nbsp;её&nbsp;каркасе я&nbsp;сделал <a href=\"game.html?g=bonfire\">Build a&nbsp;Bonfire</a> за&nbsp;три дня.",
              en: "The game came out in November 2026 and got over 29 thousand visits in its first weeks. On its framework I built <a href=\"game.html?g=bonfire\">Build a Bonfire</a> in three days." }
  },

  /* ========================= Build a Bonfire ========================= */
  bonfire: {
    lede: { ru: "У&nbsp;всего сервера одна цель: вместе построить огромный костёр. Игроки носят брёвна, укладывают их в&nbsp;общую кучу, а&nbsp;между ходками качают силу, скорость и&nbsp;другие параметры, чтобы носить больше и&nbsp;бегать быстрее.",
            en: "The whole server has one goal: build a huge bonfire together. Players carry logs, stack them on a shared pile, and between trips train strength, speed and other stats to carry more and run faster." },
    mine: { ru: "Моя игра от&nbsp;и&nbsp;до: за&nbsp;три дня с&nbsp;нуля сделал код, интерфейсы, модели, карту, обложки и&nbsp;монетизацию.", en: "My game end to end: in three days from scratch I made the code, UI, models, map, thumbnails and monetization." },
    props: [
      ["Visits", "19 400+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Автор, соло-проект", en: "Author, solo project" }],
      [{ ru: "Срок", en: "Timeline" }, { ru: "3&nbsp;дня с&nbsp;нуля", en: "3 days from scratch" }],
      [{ ru: "Сервер", en: "Server" }, { ru: "до&nbsp;60&nbsp;игроков", en: "up to 60 players" }]
    ],
    links: [{ href: "https://www.roblox.com/games/119301185261693/Build-a-Bonfire", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "pile", h: { ru: "Один костёр на&nbsp;109&nbsp;тысяч брёвен", en: "One bonfire of 109 thousand logs" },
        text: { ru: "В&nbsp;куче 109&nbsp;480 мест и&nbsp;68 слоёв. Если&nbsp;бы каждое бревно было физической деталью, сервер бы&nbsp;лёг. Поэтому у&nbsp;сервера есть коллизия только текущего слоя, где соседние занятые места склеиваются в&nbsp;прямоугольники, а&nbsp;каждый готовый слой&nbsp;— одна плита. Красивые брёвна каждый клиент собирает у&nbsp;себя.",
                en: "The pile has 109,480 places and 68 layers. If every log were a physical part, the server would die. So the server keeps collision only for the current layer, where neighboring occupied places merge into rectangles, and each finished layer is a single plate. The nice-looking logs are assembled by each client locally." },
        visual: "pile",
        code: { script: "PileService", src: `-- PileService (сервер), упрощено
function PileService:TryPlace(player, limit, radius, pay)
	-- Позиция — с сервера, а не от клиента
	local pos = self:_characterPosition(player)
	if not pos then return 0, "NoCharacter" end

	-- Свободные места текущего слоя в радиусе
	local ids = self._state:plan(pos, radius, limit)
	if #ids == 0 then return 0, "NoSpace" end

	-- Оплата атомарно: списали брёвна, дали монеты.
	-- Не прошла — места остаются свободными
	if not pay(#ids) then return 0, "PayFailed" end
	self._state:commit(ids) -- сверка раунда и ревизии
	self:_queueDelta(ids) -- изменения тика — одной пачкой
	return #ids
end` },
        notes: [
          [{ ru: "Сеть", en: "Network" }, { ru: "Занятые места слоя уходят битовой маской: 578 байт на нижний слой. Изменения одного тика склеиваются в&nbsp;один пакет.", en: "A layer’s occupied places go out as a bitmask: 578 bytes for the bottom layer. Changes within one tick are merged into one packet." }],
          [{ ru: "Клиент", en: "Client" }, { ru: "Копия кучи только для чтения. Пропустил пакет&nbsp;— сам просит свежий снимок.", en: "A read-only copy of the pile. Missed a packet — it asks for a fresh snapshot." }],
          [{ ru: "Визуал", en: "Visuals" }, { ru: "Полностью занятый участок заменяется готовой моделью, работа ограничена бюджетом: 96 операций за&nbsp;2&nbsp;мс.", en: "A fully occupied tile is swapped for a ready model; work is capped by a budget of 96 operations per 2 ms." }]
        ],
        caption: { ru: "Код упрощён до&nbsp;принципа PileService, числа&nbsp;— из&nbsp;паспорта системы.", en: "The code is cut down to PileService’s principle; numbers are from the system’s passport." } },
      { id: "days", h: { ru: "Три дня на&nbsp;готовом каркасе", en: "Three days on a ready framework" },
        text: { ru: "Уложиться в&nbsp;три дня получилось потому, что ядро я&nbsp;взял из&nbsp;<a href=\"game.html?g=gyp\">Grow Your Parts</a>: данные, покупки, награды, сеть и&nbsp;аналитика уже работали. Всё время ушло на&nbsp;саму игру: кучу, тренировки, задания, интерфейс и&nbsp;контент.",
                en: "Fitting into three days was possible because I took the core from <a href=\"game.html?g=gyp\">Grow Your Parts</a>: data, purchases, rewards, network and analytics already worked. All the time went into the game itself: the pile, training, quests, UI and content." },
        list: [
          ["fire", { ru: "Готовый костёр горит 180&nbsp;секунд, а&nbsp;тепло даёт ×5 к&nbsp;приросту", en: "A finished bonfire burns for 180 seconds, and its warmth gives ×5 growth" }],
          ["train", { ru: "Тренировки силы и&nbsp;скорости, четыре улучшения за&nbsp;монеты", en: "Strength and speed training, four upgrades for coins" }],
          ["quests", { ru: "Обучение из&nbsp;семи шагов, три линии заданий, ежедневные награды", en: "A seven-step tutorial, three quest lines, daily rewards" }],
          ["boards", { ru: "Четыре глобальные доски: брёвна, костры, время в&nbsp;игре, поддержка", en: "Four global boards: logs, bonfires, playtime, supporters" }],
          ["shop", { ru: "34 геймпасса и&nbsp;8 товаров за&nbsp;Robux", en: "34 game passes and 8 Robux products" }]
        ] }
    ],
    result: { ru: "Игра вышла в&nbsp;ноябре 2026 и&nbsp;за&nbsp;первые недели набрала больше 19&nbsp;тысяч посещений.", en: "The game came out in November 2026 and got over 19 thousand visits in its first weeks." }
  },

  /* ========================= Spell Brawl ========================= */
  spell: {
    lede: { ru: "PvP-арена магов, каждый сам за&nbsp;себя. Убиваешь врагов, получаешь валюту, покупаешь новых героев и&nbsp;прокачиваешь их&nbsp;способности. Огонь, вода, молния и&nbsp;ветер&nbsp;— у&nbsp;каждого героя своя стихия и&nbsp;свой стиль боя.",
            en: "A PvP arena of mages, every player for themselves. You kill enemies, earn currency, buy new heroes and upgrade their abilities. Fire, water, lightning and wind: each hero has an element and a fighting style." },
    mine: { ru: "Делали вдвоём с&nbsp;напарником, примерно пополам: от&nbsp;кода до&nbsp;эффектов.", en: "Made by two of us with a partner, roughly half and half: from code to effects." },
    props: [
      ["Visits", "2 300+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Пополам с&nbsp;напарником", en: "Half-and-half with a partner" }],
      [{ ru: "Герои", en: "Heroes" }, "7"],
      [{ ru: "Вышла", en: "Released" }, { ru: "ноябрь 2026", en: "November 2026" }]
    ],
    links: [{ href: "https://www.roblox.com/games/138471299760005/Spell-Brawl-Battleground", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "duo", h: { ru: "Кто что делал", en: "Who did what" },
        text: { ru: "Работали в&nbsp;одном плейсе по&nbsp;очереди, а&nbsp;игру делили по&nbsp;системам: у&nbsp;каждой свой хозяин, поэтому вдвоём не&nbsp;мешали друг другу.",
                en: "We worked in one place in turns and split the game by systems: each has its own owner, so two of us didn’t get in each other’s way." },
        visual: "duo" },
      { id: "port", h: { ru: "Новая архитектура без смены поведения", en: "A new architecture without changing behavior" },
        text: { ru: "Всю игру я&nbsp;перенёс на&nbsp;чистую архитектуру своего каркаса так, чтобы для игрока ничего не&nbsp;поменялось: поведение и&nbsp;визуал&nbsp;— один в&nbsp;один. Переносили по&nbsp;этапам и&nbsp;проверяли, сравнивая Play-режим старой и&nbsp;новой версии.",
                en: "I moved the whole game onto the clean architecture of my framework so that nothing changed for the player: behavior and visuals one to one. We moved it in stages and checked by comparing Play mode of the old and new versions." },
        list: [
          ["1", { ru: "Ядро, данные, персонаж и&nbsp;движение, интерфейс, выбор героя", en: "Core, data, character and movement, UI, hero selection" }],
          ["2", { ru: "Бой: урон, хитбоксы, здоровье, смерть и&nbsp;возрождение, лента убийств, NPC", en: "Combat: damage, hitboxes, health, death and respawn, kill feed, NPCs" }],
          ["3", { ru: "Все герои: RAIGOR, Pyro, Nereus, Aerion, MORVEN, TERON, SELIS", en: "All heroes: RAIGOR, Pyro, Nereus, Aerion, MORVEN, TERON, SELIS" }],
          ["4", { ru: "Боты, обучение, матчи и&nbsp;задания, серии убийств, гемы за&nbsp;убийства, режим зрителя", en: "Bots, tutorial, matches and quests, kill streaks, gems for kills, spectator mode" }]
        ] },
      { id: "ads", h: { ru: "Какая реклама приводит игроков, которые остаются", en: "Which ads bring players who stay" },
        text: { ru: "Для игры я&nbsp;собрал свой кабинет аналитики игроков: данные приходят через Open Cloud, у&nbsp;каждого игрока своя карточка пути. Игроков из&nbsp;каждой рекламной волны отделяю по&nbsp;времени первого входа и&nbsp;сравниваю, сколько они играют и&nbsp;возвращаются&nbsp;ли.",
                en: "For the game I built my own player analytics workspace: data comes through Open Cloud, and each player has a journey card. I separate the players from each ad wave by first-join time and compare how long they play and whether they come back." } }
    ],
    result: { ru: "Игра вышла в&nbsp;ноябре 2026 и&nbsp;только набирает аудиторию.", en: "The game came out in November 2026 and is just building its audience." }
  },

  /* ========================= 1 Click = 1 Heat ========================= */
  heat: {
    lede: { ru: "Каждый клик нагревает персонажа. Тело проходит десятки стадий: иней на&nbsp;ступнях, дым, огонь, белый неон, трескающаяся лава с&nbsp;крыльями, чёрный дым и&nbsp;порох.",
            en: "Every click heats the character up. The body goes through dozens of stages: frost on the feet, smoke, fire, white neon, cracked lava with wings, black smoke and gunpowder." },
    mine: { ru: "Моя игра на&nbsp;идее <a href=\"game.html?g=growth\">1&nbsp;Click = 1&nbsp;Growth</a>: вместо роста&nbsp;— нагрев.", en: "My game built on the idea of <a href=\"game.html?g=growth\">1&nbsp;Click = 1&nbsp;Growth</a>: heat instead of growth." },
    props: [
      ["Visits", "1 700 000+", 1],
      [{ ru: "Избранное", en: "Favorites" }, "109 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Автор", en: "Author" }],
      [{ ru: "Стадий нагрева", en: "Heat stages" }, "27"]
    ],
    links: [{ href: "https://www.roblox.com/games/116587301241698/1-Click-1-Heat", label: { ru: "Страница в Roblox", en: "Roblox page" } }],
    status: { ru: "Страница открывается, но&nbsp;поиграть сейчас нельзя.", en: "The page opens, but the game can’t be played right now." },
    chapters: [
      { id: "stages", h: { ru: "27 стадий от&nbsp;инея до&nbsp;пороха", en: "27 stages from frost to gunpowder" },
        text: { ru: "Каждая стадия задаёт цвет тела, материал и&nbsp;эффекты на&nbsp;конкретных частях: иней на&nbsp;ступнях, огонь на&nbsp;голове и&nbsp;торсе, крылья, порох на&nbsp;руках. Эффекты не&nbsp;включаются резко, а&nbsp;перетекают из&nbsp;стадии в&nbsp;стадию: дым нарастает, огонь гаснет, крылья раскрываются и&nbsp;складываются.",
                en: "Each stage sets the body color, material and effects on specific parts: frost on the feet, fire on the head and torso, wings, gunpowder on the arms. Effects don’t switch on abruptly but flow from stage to stage: smoke builds up, fire dies down, wings open and fold." },
        visual: "heat",
        caption: { ru: "Цвета стадий&nbsp;— из&nbsp;документа стадий игры.", en: "Stage colors are taken from the game’s stage document." } },
      { id: "economy", h: { ru: "Экономика и&nbsp;обновление 1.3", en: "Economy and update 1.3" },
        text: { ru: "Каждое перерождение умножает нагрев в&nbsp;1,5&nbsp;раза и&nbsp;ускоряет автоклик на&nbsp;10%, а&nbsp;стоит около 60% цены зоны, которую открывает. В&nbsp;обновлении 1.3 добавил случайные события каждые 10&nbsp;минут, событие «Адская жара» с&nbsp;двойным нагревом, перерождения с&nbsp;51-го по&nbsp;60-е и&nbsp;исправления производительности.",
                en: "Each rebirth multiplies heat by 1.5 and speeds up the autoclicker by 10%, and costs about 60% of the price of the zone it unlocks. Update 1.3 added random events every 10 minutes, a “Hell Heat” event with double heat, rebirths 51 to 60 and performance fixes." } }
    ],
    result: { ru: "Итог: 1,7&nbsp;миллиона посещений и&nbsp;109&nbsp;тысяч добавлений в&nbsp;избранное.", en: "Result: 1.7 million visits and 109 thousand favorites." }
  },

  /* ========================= Leafbound ========================= */
  leaf: {
    lede: { ru: "Игрок сгребает листья вокруг огромного особняка, продаёт их, улучшает сумку и&nbsp;снаряжение, открывает ботов и&nbsp;дронов, которые работают за&nbsp;него, и&nbsp;новые зоны поместья. А&nbsp;под домом что-то спрятано.",
            en: "The player rakes leaves around a huge mansion, sells them, upgrades the bag and gear, unlocks bots and drones that work for them, and new zones of the estate. And something is hidden under the house." },
    mine: { ru: "Совместный проект: напарник делал модели и&nbsp;звуки, всё остальное&nbsp;— код, интерфейсы, монетизацию, аналитику и&nbsp;обложки&nbsp;— делал&nbsp;я.", en: "A joint project: my partner made the models and sounds, and I did everything else — code, UI, monetization, analytics and thumbnails." },
    props: [
      ["Visits", "226 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Всё, кроме моделей и&nbsp;звуков", en: "Everything but models and sounds" }],
      [{ ru: "Итог", en: "Result" }, { ru: "Продана доля 90%", en: "A 90% stake sold" }],
      [{ ru: "Формат", en: "Format" }, { ru: "лобби и&nbsp;забег, кооп", en: "lobby and run, co-op" }]
    ],
    links: [{ href: "https://www.roblox.com/games/121105568287866/Leafbound", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "leaves", h: { ru: "Тысячи листьев без физики", en: "Thousands of leaves without physics" },
        text: { ru: "Каждый лист&nbsp;— настоящий меш, но&nbsp;физику я&nbsp;отключил: незакреплённые кучи дрожат, расползаются, будят физический движок, а&nbsp;право владения сетью отдало&nbsp;бы листья читерам. Поэтому листья закреплены и&nbsp;двигаются кодом, а&nbsp;правда о&nbsp;них лежит в&nbsp;серверной таблице. Грабли забирают листья в&nbsp;веере перед игроком, а&nbsp;не&nbsp;в&nbsp;круге вокруг него.",
                en: "Every leaf is a real mesh, but I turned physics off: unanchored piles jitter, spread out, wake the physics solver, and network ownership would hand the leaves to cheaters. So leaves are anchored and moved by code, and the truth about them lives in a server table. The rake takes leaves in a fan in front of the player, not in a circle around them." },
        visual: "rake",
        code: { script: "RakeService", src: `-- Гребок (сервер), упрощено: лист в веере перед игроком?
local function inFan(root: CFrame, leafPos: Vector3): boolean
	local offset = leafPos - root.Position
	if math.abs(offset.Y) > Rake.HeightTolerance then
		return false -- лист выше или ниже, чем достают грабли
	end
	local flat = Vector3.new(offset.X, 0, offset.Z)
	local dist = flat.Magnitude
	if dist < Rake.MinDistance or dist > Rake.MaxDistance then
		return false -- короткий взмах: от 1 до 4 студов
	end
	-- Не шире 30° от взгляда игрока в каждую сторону
	local look = (root.LookVector * Vector3.new(1, 0, 1)).Unit
	return look:Dot(flat.Unit) >= Rake.CosHalfAngle -- cos(30°)
end` },
        notes: [
          [{ ru: "Сервер решает", en: "Server decides" }, { ru: "Клиент присылает только точку прицела, какие листья сгреблись, считает сервер.", en: "The client sends only the aim point; the server works out which leaves were raked." }],
          [{ ru: "Кучи", en: "Piles" }, { ru: "Объектов-куч нет: куча складывается сама из того, куда легли листья, а гребок счёсывает верхний слой.", en: "There are no pile objects: a pile forms from where the leaves land, and a stroke scrapes off the top layer." }],
          [{ ru: "Старт", en: "Startup" }, { ru: "Листья появляются пачками по 500 за кадр, иначе сервер замирал на секунды.", en: "Leaves spawn in batches of 500 per frame; otherwise the server froze for seconds." }]
        ],
        caption: { ru: "Код упрощён, числа&nbsp;— из&nbsp;баланса игры.", en: "The code is simplified; the numbers are from the game’s balance." } },
      { id: "funnels", h: { ru: "Аналитика в&nbsp;рамках лимитов Roblox", en: "Analytics within Roblox’s limits" },
        text: { ru: "Roblox даёт игре только 10&nbsp;воронок в&nbsp;сутки, а&nbsp;лишние молча отбрасывает. Я&nbsp;занял девять и&nbsp;оставил один слот свободным под&nbsp;A/B-тесты и&nbsp;новые фичи. Игрок начинает в&nbsp;лобби, а&nbsp;продолжает в&nbsp;забеге, поэтому сессия воронки переезжает между плейсами вместе с&nbsp;телепортом.",
                en: "Roblox gives a game only 10 funnels a day and silently drops the rest. I used nine and kept one slot free for A/B tests and new features. A player starts in the lobby and continues in the run, so the funnel session travels between places with the teleport." },
        list: [
          ["teleport", { ru: "Идентификатор сессии воронки едет из&nbsp;лобби в&nbsp;забег в&nbsp;данных телепорта", en: "The funnel session id rides from lobby to run in the teleport data" }],
          ["client", { ru: "Шаги с&nbsp;клиента принимаются только по&nbsp;белому списку и&nbsp;с&nbsp;ограничением частоты", en: "Client steps are accepted only from a whitelist and with a rate limit" }],
          ["admins", { ru: "Админы целиком исключены из&nbsp;аналитики", en: "Admins are fully excluded from analytics" }],
          ["studio", { ru: "Roblox принимает аналитику только с&nbsp;сервера опубликованной игры, поэтому в&nbsp;Studio события идут зеркалом в&nbsp;Output, а&nbsp;команда /funnel показывает, что ушло", en: "Roblox accepts analytics only from a published game’s server, so in Studio events are mirrored to Output and a /funnel command shows what was sent" }]
        ] },
      { id: "market", h: { ru: "Покупки, которые не&nbsp;теряются", en: "Purchases that don’t get lost" },
        text: { ru: "Если игрок заплатил, а&nbsp;выдать покупку нельзя (он&nbsp;уехал, упёрся в&nbsp;лимит), чек не&nbsp;пропадает: он ложится в&nbsp;профиль кредитом и&nbsp;выдаётся при следующем нажатии бесплатно. Один и&nbsp;тот&nbsp;же чек не&nbsp;выдаётся дважды, цены показываются региональные, а&nbsp;покупки можно проверить командами без реальной оплаты.",
                en: "If a player paid but the purchase can’t be delivered (they left, hit a cap), the receipt isn’t lost: it goes into the profile as a credit and is delivered free on the next press. The same receipt is never granted twice, prices are shown regionally, and purchases can be tested with commands without real payment." } }
    ],
    result: { ru: "Итог: больше 226&nbsp;тысяч посещений и&nbsp;проданная инвестору доля 90% в&nbsp;период роста игры.", en: "Result: over 226 thousand visits and a 90% stake sold to an investor while the game was growing." }
  },

  /* ========================= Island Tycoon ========================= */
  island: {
    lede: { ru: "Игрок получает участок на&nbsp;острове, ставит дропперы, которые приносят деньги, и&nbsp;покупает кнопки, которые шаг за&nbsp;шагом достраивают остров. Дальше&nbsp;— особняки, лодки и&nbsp;джетски.",
            en: "The player gets a plot on an island, places droppers that make money and buys buttons that build out the island step by step. Then come mansions, boats and jet skis." },
    mine: { ru: "Карту строил партнёр. Код, экономика, прогрессия и&nbsp;интерфейсы&nbsp;— мои.", en: "A partner built the map. The code, economy, progression and UI are mine." },
    props: [
      ["Visits", "374 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Всё, кроме карты", en: "Everything but the map" }],
      [{ ru: "Кнопок", en: "Buttons" }, "400+"]
    ],
    links: [{ href: "https://www.roblox.com/games/130072092537258/Island-Tycoon", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "tree", h: { ru: "Два острова из&nbsp;сотен кнопок", en: "Two islands built from hundreds of buttons" },
        text: { ru: "Остров достраивается кнопками: от&nbsp;моста и&nbsp;песка к&nbsp;пяти веткам&nbsp;— костёр, поиск сокровищ, статуи, хижина и&nbsp;плот SOS. Чтобы не&nbsp;расставлять кнопки руками, я&nbsp;написал скрипты для Studio: они создают кнопку для каждого объекта карты, ставят её&nbsp;в&nbsp;центр объекта и&nbsp;проверяют, что ничего не&nbsp;пропущено. На&nbsp;первом острове 98&nbsp;кнопок, в&nbsp;обновлении появился второй остров, и&nbsp;всего их&nbsp;стало больше 400.",
                en: "The island is built out with buttons: from a bridge and sand to five branches — campfire, treasure hunt, statues, hut and an SOS raft. To avoid placing buttons by hand, I wrote Studio scripts that create a button for every map object, center it on the object and check nothing is missing. The first island has 98 buttons; an update added a second island, bringing the total to over 400." },
        visual: "tree" },
      { id: "rebirth", h: { ru: "Перерождения и&nbsp;лидерборды", en: "Rebirths and leaderboards" },
        text: { ru: "Когда все кнопки за&nbsp;игровые деньги куплены, игрок может переродиться: остров сбрасывается, а&nbsp;доход навсегда растёт на&nbsp;20% за&nbsp;каждое перерождение. Глобальные лидерборды работают на&nbsp;той&nbsp;же связке OrderedDataStore и&nbsp;MemoryStore, что и&nbsp;в&nbsp;<a href=\"game.html?g=growth\">Growth</a>: систему я&nbsp;перенёс из&nbsp;игры в&nbsp;игру.",
                en: "Once every cash button is bought, the player can rebirth: the island resets and income grows by 20% for good with each rebirth. Global leaderboards run on the same OrderedDataStore and MemoryStore setup as in <a href=\"game.html?g=growth\">Growth</a>: I carried the system over from game to game." } }
    ],
    result: { ru: "Итог: больше 374&nbsp;тысяч посещений.", en: "Result: over 374 thousand visits." }
  },

  /* ========================= Christmas House Tycoon ========================= */
  christmas: {
    lede: { ru: "Игрок получает участок и&nbsp;шаг за&nbsp;шагом строит новогодний особняк: покупает и&nbsp;улучшает кнопки, собирает доход и&nbsp;достраивает весь дом.",
            en: "The player gets a plot and builds a New Year mansion step by step: buys and upgrades buttons, collects income and finishes the whole house." },
    mine: { ru: "Карту строил другой участник. Код, экономика и&nbsp;прогрессия&nbsp;— мои.", en: "Another member built the map. The code, economy and progression are mine." },
    props: [
      ["Visits", "345 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Всё, кроме карты", en: "Everything but the map" }],
      [{ ru: "Кнопок", en: "Buttons" }, { ru: "больше 300", en: "over 300" }]
    ],
    links: [{ href: "https://www.roblox.com/games/79333937110882/Christmas-House-Tycoon", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "prices", h: { ru: "Цена и&nbsp;доход каждой кнопки", en: "Price and income of every button" },
        text: { ru: "Баланс тайкуна&nbsp;— это кривая: каждая следующая кнопка дороже, но&nbsp;и&nbsp;приносит больше. Все цены и&nbsp;доходы я&nbsp;свёл в&nbsp;одну таблицу больше чем на&nbsp;300&nbsp;кнопок, от&nbsp;бесплатной первой до&nbsp;сотен миллионов, и&nbsp;применял её&nbsp;к&nbsp;игре скриптом. В&nbsp;обновлении 1.1 снизил цены, добавил награды и&nbsp;исправил ошибки.",
                en: "A tycoon’s balance is a curve: each next button costs more but also earns more. I put all prices and incomes for over 300 buttons, from a free first one to hundreds of millions, into one table and applied it to the game with a script. Update 1.1 lowered prices, added rewards and fixed bugs." },
        visual: "prices",
        caption: { ru: "Реальные значения из&nbsp;таблицы цен игры, логарифмическая шкала.", en: "Real values from the game’s price table, log scale." } }
    ],
    result: { ru: "Итог: больше 345&nbsp;тысяч посещений.", en: "Result: over 345 thousand visits." }
  },

  /* ========================= Cats Tycoon ========================= */
  cats: {
    lede: { ru: "Игрок покупает котов, отправляет их работать и&nbsp;продаёт то, что они сделали. На&nbsp;выручку&nbsp;— новые коты и&nbsp;развитие базы.",
            en: "The player buys cats, sends them to work and sells what they made. The earnings buy new cats and grow the base." },
    mine: { ru: "Всю игру я&nbsp;сделал один: код, модели и&nbsp;сборку карты.", en: "I made the whole game alone: code, models and map building." },
    props: [
      ["Visits", "215 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Соло, включая модели", en: "Solo, models included" }]
    ],
    links: [{ href: "https://www.roblox.com/games/103663531256292/Cats-Tycoon", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "loop", h: { ru: "Вся игра в&nbsp;одних руках", en: "The whole game in one pair of hands" },
        text: { ru: "Тайкун с&nbsp;производством: коты работают, предметы продаются, база растёт. Эту игру я&nbsp;сделал полностью сам, включая модели и&nbsp;окружение.",
                en: "A production tycoon: cats work, items sell, the base grows. I made this game entirely on my own, models and environment included." },
        list: [
          ["buy", { ru: "Купить котов", en: "Buy cats" }],
          ["work", { ru: "Отправить их работать", en: "Send them to work" }],
          ["sell", { ru: "Продать сделанное и&nbsp;вложиться в&nbsp;новых", en: "Sell what they made and invest in new ones" }]
        ] }
    ],
    result: { ru: "Итог: больше 215&nbsp;тысяч посещений.", en: "Result: over 215 thousand visits." }
  },

  /* ========================= Beavers Tycoon ========================= */
  beavers: {
    lede: { ru: "Игрок собирает палки, продаёт их за&nbsp;монеты и&nbsp;заводит бобров с&nbsp;разными навыками. Улучшенные бобры приносят редкие ветки. В&nbsp;обновлении вместо яиц появились сундуки с&nbsp;инструментами.",
            en: "The player collects sticks, sells them for coins and adopts beavers with different skills. Upgraded beavers bring rare branches. An update replaced eggs with chests of tools." },
    mine: { ru: "Мой первый релиз&nbsp;— 10&nbsp;февраля 2025 года. Код и&nbsp;проект&nbsp;— мои, модели сделал знакомый.", en: "My first release, February 10, 2025. The code and project are mine; a friend made the models." },
    props: [
      ["Visits", "153 000+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Автор и&nbsp;программист", en: "Author and programmer" }],
      [{ ru: "Релиз", en: "Release" }, { ru: "10 февраля 2025", en: "February 10, 2025" }]
    ],
    links: [{ href: "https://www.roblox.com/games/86161830077086/Beavers-Tycoon", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "first", h: { ru: "Первый путь до&nbsp;релиза", en: "The first road to release" },
        text: { ru: "Здесь я&nbsp;впервые прошёл весь путь от&nbsp;идеи до&nbsp;опубликованной игры: игровой цикл тайкуна, экономика, прогрессия и&nbsp;сохранение базы. Всё, что выше на&nbsp;этом сайте, началось отсюда.",
                en: "This is where I first went the whole way from idea to a published game: the tycoon loop, economy, progression and base saving. Everything else on this site started here." } }
    ],
    result: { ru: "Итог: больше 153&nbsp;тысяч посещений у&nbsp;первой игры.", en: "Result: over 153 thousand visits for a first game." }
  },

  /* ========================= Звёзды хоккея (КХЛ) ========================= */
  khl: {
    lede: { ru: "Официальная игра КХЛ. Игрок собирает талисманов реальных хоккейных клубов, скрещивает их, копит ресурсы, защищает базу и&nbsp;забирает талисманов у&nbsp;других. В&nbsp;обновлении появились арены КХЛ, и&nbsp;можно найти арену своего города.",
            en: "The official KHL game. The player collects mascots of real hockey clubs, breeds them, stacks resources, defends the base and takes mascots from others. An update added KHL arenas, so you can find your city’s arena." },
    mine: { ru: "Игру делала студия MAFF для КХЛ. Весь код игры написал я.", en: "MAFF made the game for the KHL. I wrote all of the game’s code." },
    props: [
      ["Visits", "14 400+", 1],
      [{ ru: "Роль", en: "Role" }, { ru: "Весь код игры", en: "All of the game code" }],
      [{ ru: "Студия", en: "Studio" }, "MAFF"]
    ],
    links: [
      { href: "https://www.roblox.com/games/134015125792051/unnamed", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true },
      { href: "https://maff.media/case-khl-brainrot/", label: { ru: "Кейс MAFF", en: "MAFF case study" } }
    ],
    chapters: [
      { id: "why", h: { ru: "Зачем КХЛ такая игра", en: "Why the KHL wanted this game" },
        text: { ru: "Дети на&nbsp;Roblox не&nbsp;заходят в&nbsp;сложные хоккейные симуляторы, зато играют в&nbsp;простые трендовые жанры. Поэтому игру сделали в&nbsp;жанре «укради брейнрота»: вместо существ&nbsp;— талисманы и&nbsp;персонажи клубов КХЛ, а&nbsp;продвижение только через рекомендации Roblox, без внешней рекламы.",
                en: "Kids on Roblox don’t play complex hockey simulators, but they do play simple trending genres. So the game was built in the “steal a brainrot” genre: instead of creatures, there are KHL club mascots and characters, and promotion comes only through Roblox recommendations, with no external ads." } },
      { id: "coach", h: { ru: "Режим тренера", en: "Coach mode" },
        text: { ru: "Режим для совместной игры родителя и&nbsp;ребёнка: ребёнок приглашает родителя, и&nbsp;тот подключается тренером без сложного обучения. Тренер приходит на&nbsp;базу игрока и&nbsp;помогает: собирает коллекционные карточки, усиливает и&nbsp;защищает базу, а&nbsp;предметами тренера удалённо закрывает её, даёт ускорение и&nbsp;щиты.",
                en: "A mode for a parent and child to play together: the child invites a parent, who joins as a coach with no complex onboarding. The coach goes to the player’s base and helps: collects trading cards, strengthens and protects the base, and uses coach items to lock it remotely, give speed boosts and shields." },
        list: [
          ["collect", { ru: "Талисманы клубов КХЛ, от&nbsp;смешных до&nbsp;настоящих", en: "KHL club mascots, from silly ones to the real thing" }],
          ["breed", { ru: "Скрещивание талисманов", en: "Mascot breeding" }],
          ["steal", { ru: "Можно забрать талисмана с&nbsp;чужой базы", en: "You can take a mascot from someone’s base" }],
          ["arenas", { ru: "Коллекция арен КХЛ", en: "A collection of KHL arenas" }]
        ] }
    ],
    result: { ru: "Другие мои проекты в&nbsp;MAFF: <a href=\"game.html?g=kinopoisk\">Мир Кинопоиска</a> и&nbsp;<a href=\"game.html?g=marmelad\">Завод Мармеладыча</a>.", en: "My other MAFF projects: <a href=\"game.html?g=kinopoisk\">Kinopoisk World</a> and <a href=\"game.html?g=marmelad\">Marmeladych Factory</a>." }
  },

  /* ========================= Завод Мармеладыча ========================= */
  marmelad: {
    lede: { ru: "Брендовый плейс по&nbsp;мотивам канала Мармеладыча: территория завода, персонажи районов, мармеладная кунсткамера. Игрок проходит задания и&nbsp;получает питомцев-мармеладок и&nbsp;UGC.",
            en: "A brand place based on the Marmeladych channel: the factory grounds, neighborhood characters, a marmalade cabinet of curiosities. Players complete quests and get marmalade pets and UGC." },
    mine: { ru: "Меня позвали в&nbsp;MAFF отдельно, чтобы найти и&nbsp;исправить ошибки в&nbsp;мини-играх, которые писали другие программисты.", en: "MAFF brought me in separately to find and fix bugs in mini-games written by other programmers." },
    props: [
      ["Visits", "141 000+", 1],
      [{ ru: "Чьи посещения", en: "Whose visits" }, { ru: "у&nbsp;игры целиком", en: "the whole game’s" }],
      [{ ru: "Роль", en: "Role" }, { ru: "Исправление ошибок", en: "Bug fixing" }]
    ],
    links: [{ href: "https://www.roblox.com/games/131107891135160/unnamed", label: { ru: "Открыть в&nbsp;Roblox", en: "Open in Roblox" }, play: true }],
    chapters: [
      { id: "fix", h: { ru: "Чужой код и&nbsp;точечные исправления", en: "Someone else’s code and precise fixes" },
        text: { ru: "Задача была не&nbsp;писать новое, а&nbsp;разобраться в&nbsp;чужих мини-играх: воспроизвести ошибку, найти причину и&nbsp;исправить её&nbsp;так, чтобы не&nbsp;сломать остальное. Работал в&nbsp;командном процессе студии: со&nbsp;встречами и&nbsp;обсуждением задач.",
                en: "The job wasn’t to write new code but to dig into other people’s mini-games: reproduce a bug, find the cause and fix it without breaking anything else. I worked in the studio’s team process, with meetings and task discussions." } }
    ],
    result: { ru: "Другие мои проекты в&nbsp;MAFF: <a href=\"game.html?g=kinopoisk\">Мир Кинопоиска</a> и&nbsp;<a href=\"game.html?g=khl\">Звёзды хоккея</a>.", en: "My other MAFF projects: <a href=\"game.html?g=kinopoisk\">Kinopoisk World</a> and <a href=\"game.html?g=khl\">Hockey Stars</a>." }
  }
};
