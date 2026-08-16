(() => {
  "use strict";

  const STORAGE_KEY = "rehab-check-app-v2";
  const MAX_MENU_ITEMS = 200;
  const MAX_RECORDS = 5000;

  const INITIAL_MENU_TEXT = {
    everyday: {
      morning: {
        title: "毎日 朝体操",
        items: [
          "ラジオ体操",
          "眼球トレーニング",
          "巻き肩用壁押し 左右10回",
          "ローラーで背筋伸ばし",
          "バランスボール 横伸ばし",
          "ハイハイで外側を意識する",
          "腰に手当て肩甲骨体操",
          "ローラーで肩周り筋肉を動かす",
          "腕立て胸広げ",
          "チューブで胸広げ",
          "ふくらはぎ意識ジャンプ"
        ]
      },
      night: {
        title: "毎日 夜の柔軟体操",
        items: ["夜の柔軟体操（ストレッチ）"]
      }
    },
    mwf: {
      morning: {
        title: "月・水・金 10時00分",
        items: [
          "眼球トレーニング",
          "嗅覚、舌、嚥下トレ",
          "椅子に座って横倒し",
          "尿道締め、膀胱マッサージ",
          "水泳で泳ぐ",
          "腕立て",
          "腹筋サイクル擦り",
          "シャキア顔上げ",
          "仰向ケツ上げ",
          "背筋万歳",
          "片手10kg外腹斜筋肉",
          "椅子に座って左右ストレッチ",
          "ツイストレッグレイズ",
          "サイドレッグリフト",
          "フォームローラーで背筋伸ばし"
        ]
      },
      afternoon: {
        title: "月・水・金 14時30分",
        items: [
          "スクワット動画",
          "プランク1分",
          "クラムシェル90度・45度",
          "横向き腰上側近トレ",
          "横になり片足上げ中臀筋",
          "腰でボールはさみ",
          "ゴムチューブ膝広",
          "バランスボール 横振り"
        ]
      }
    },
    tt: {
      morning: {
        title: "火・木 10時00分",
        items: [
          "眼球トレーニング",
          "嗅覚、舌、嚥下トレ",
          "椅子に座って横倒し",
          "尿道締め、膀胱マッサージ",
          "水泳で泳ぐ",
          "アブローラー脇腹",
          "チューブ肩甲骨",
          "手足ゴムチューブひねり",
          "片手10kg外腹斜筋肉",
          "椅子に座って左右ストレッチ",
          "ツイストレッグレイズ",
          "サイドレッグリフト",
          "フォームローラーで背筋伸ばし"
        ]
      },
      afternoon: {
        title: "火・木 14時30分",
        items: [
          "準備運動（ジャンプ・屈進）",
          "バービージャンプ 2ラウンド",
          "中腰膝擦りサイドステップ",
          "ゴムチューブ片足サイドアップ",
          "ハムストリング",
          "プランク1分"
        ]
      }
    }
  };

  const SECTION_SCHEMA = {
    everyday: ["morning", "night"],
    mwf: ["morning", "afternoon"],
    tt: ["morning", "afternoon"]
  };

  const SECTION_APPEARANCE = {
    "everyday-morning": { tone: "orange", icon: "☀" },
    "mwf-morning": { tone: "blue", icon: "✦" },
    "mwf-afternoon": { tone: "purple", icon: "◆" },
    "tt-morning": { tone: "blue", icon: "✦" },
    "tt-afternoon": { tone: "purple", icon: "◆" },
    "everyday-night": { tone: "night", icon: "☾" }
  };

  const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

  const elements = {
    streakBadge: document.querySelector("#streak-badge"),
    previousDay: document.querySelector("#previous-day"),
    nextDay: document.querySelector("#next-day"),
    datePrimary: document.querySelector("#date-primary"),
    dateSecondary: document.querySelector("#date-secondary"),
    datePicker: document.querySelector("#date-picker"),
    calendarButton: document.querySelector(".calendar-button"),
    todayButton: document.querySelector("#today-button"),
    tomorrowButton: document.querySelector("#tomorrow-button"),
    futureNote: document.querySelector("#future-note"),
    progressCard: document.querySelector("#progress-card"),
    progressEyebrow: document.querySelector("#progress-eyebrow"),
    dailyMessage: document.querySelector("#daily-message"),
    dailySubmessage: document.querySelector("#daily-submessage"),
    progressRing: document.querySelector("#progress-ring"),
    progressPercent: document.querySelector("#progress-percent"),
    progressCount: document.querySelector("#progress-count"),
    editToggle: document.querySelector("#edit-toggle"),
    editNote: document.querySelector("#edit-note"),
    menuSections: document.querySelector("#menu-sections"),
    weeklyMessage: document.querySelector("#weekly-message"),
    summaryStreak: document.querySelector("#summary-streak"),
    summaryAverage: document.querySelector("#summary-average"),
    weeklyChart: document.querySelector("#weekly-chart"),
    exportButton: document.querySelector("#export-button"),
    importButton: document.querySelector("#import-button"),
    importFile: document.querySelector("#import-file"),
    installButton: document.querySelector("#install-button"),
    toast: document.querySelector("#toast")
  };

  let selectedDate = todayString();
  let isEditing = false;
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let state = loadState();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function createInitialMenu() {
    const menu = clone(INITIAL_MENU_TEXT);
    Object.entries(SECTION_SCHEMA).forEach(([groupId, timeIds]) => {
      timeIds.forEach((timeId) => {
        menu[groupId][timeId].items = menu[groupId][timeId].items.map((text, index) => ({
          id: `${groupId}-${timeId}-${String(index + 1).padStart(2, "0")}`,
          text,
          url: ""
        }));
      });
    });
    return menu;
  }

  function createInitialState() {
    return { version: 3, menu: createInitialMenu(), records: {} };
  }

  function normalizeText(value, fallback, maxLength) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : fallback;
  }

  function normalizeYouTubeUrl(rawValue) {
    const raw = typeof rawValue === "string" ? rawValue.trim() : "";
    if (!raw) return { valid: true, url: "" };

    try {
      const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const parsed = new URL(withProtocol);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
      const allowed =
        hostname === "youtu.be" ||
        hostname === "youtube.com" ||
        hostname.endsWith(".youtube.com") ||
        hostname === "youtube-nocookie.com" ||
        hostname.endsWith(".youtube-nocookie.com");
      if (!allowed || !["http:", "https:"].includes(parsed.protocol)) return { valid: false, url: "" };
      parsed.protocol = "https:";
      return { valid: true, url: parsed.toString() };
    } catch (_error) {
      return { valid: false, url: "" };
    }
  }

  function normalizeMenu(input) {
    const defaults = createInitialMenu();
    const result = createInitialMenu();

    Object.entries(SECTION_SCHEMA).forEach(([groupId, timeIds]) => {
      timeIds.forEach((timeId) => {
        const source = input?.[groupId]?.[timeId];
        const fallback = defaults[groupId][timeId];
        result[groupId][timeId].title = normalizeText(source?.title, fallback.title, 80);
        if (!Array.isArray(source?.items)) return;

        const usedIds = new Set();
        const items = [];
        source.items.slice(0, MAX_MENU_ITEMS).forEach((item, index) => {
          const rawText = typeof item === "string" ? item : item?.text;
          const text = normalizeText(rawText, "", 120);
          if (!text) return;

          let id = normalizeText(
            typeof item === "object" ? item?.id : "",
            `${groupId}-${timeId}-import-${index}`,
            100
          ).replace(/[^a-zA-Z0-9_-]/g, "-");
          if (!id || usedIds.has(id)) id = createId();
          usedIds.add(id);

          const urlResult = normalizeYouTubeUrl(typeof item === "object" ? item?.url : "");
          items.push({ id, text, url: urlResult.valid ? urlResult.url : "" });
        });
        result[groupId][timeId].items = items;
      });
    });

    return result;
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : min;
  }

  function sanitizeRecords(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return {};
    const records = {};
    Object.entries(input)
      .slice(0, MAX_RECORDS)
      .forEach(([date, record]) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !record || typeof record !== "object") return;
        const checkedItems = {};
        if (record.checkedItems && typeof record.checkedItems === "object") {
          Object.entries(record.checkedItems)
            .slice(0, 1000)
            .forEach(([key, value]) => {
              if (typeof key === "string" && key.length <= 220 && value === true) checkedItems[key] = true;
            });
        }
        records[date] = {
          checkedItems,
          total: clampNumber(record.total, 0, 1000),
          completed: clampNumber(record.completed, 0, 1000),
          rate: clampNumber(record.rate, 0, 100),
          timestamp: typeof record.timestamp === "string" ? record.timestamp.slice(0, 40) : ""
        };
      });
    return records;
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return createInitialState();
      const parsed = JSON.parse(saved);
      return {
        version: 3,
        menu: normalizeMenu(parsed.menu),
        records: sanitizeRecords(parsed.records)
      };
    } catch (error) {
      console.warn("保存データを読み込めませんでした。", error);
      return createInitialState();
    }
  }

  function saveState(message = "") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (message) showToast(message);
      return true;
    } catch (error) {
      console.error("保存に失敗しました。", error);
      showToast("保存できませんでした。ブラウザの空き容量を確認してください。", 5000);
      return false;
    }
  }

  function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function todayString() {
    return formatDate(new Date());
  }

  function addDays(dateString, amount) {
    const date = parseLocalDate(dateString);
    date.setDate(date.getDate() + amount);
    return formatDate(date);
  }

  function isFutureDate(dateString) {
    return dateString > todayString();
  }

  function getSections(dateString) {
    const day = parseLocalDate(dateString).getDay();
    const weekdayGroup = [1, 3, 5].includes(day) ? "mwf" : [2, 4].includes(day) ? "tt" : null;
    const sectionRefs = [
      { groupId: "everyday", timeId: "morning" },
      ...(weekdayGroup
        ? [
            { groupId: weekdayGroup, timeId: "morning" },
            { groupId: weekdayGroup, timeId: "afternoon" }
          ]
        : []),
      { groupId: "everyday", timeId: "night" }
    ];

    return sectionRefs.map(({ groupId, timeId }) => {
      const id = `${groupId}-${timeId}`;
      return {
        id,
        groupId,
        timeId,
        ...SECTION_APPEARANCE[id],
        ...state.menu[groupId][timeId]
      };
    });
  }

  function getProgress(dateString) {
    const sections = getSections(dateString);
    const checked = state.records[dateString]?.checkedItems || {};
    let total = 0;
    let completed = 0;
    sections.forEach((section) => {
      section.items.forEach((item) => {
        total += 1;
        if (checked[`${section.id}:${item.id}`]) completed += 1;
      });
    });
    return {
      total,
      completed,
      rate: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  }

  function updateRecord(dateString) {
    const checkedItems = state.records[dateString]?.checkedItems || {};
    state.records[dateString] = {
      checkedItems,
      ...getProgress(dateString),
      timestamp: new Date().toISOString()
    };
  }

  function getStreak() {
    let streak = 0;
    let date = todayString();
    if (!(state.records[date]?.rate > 0)) date = addDays(date, -1);

    for (let index = 0; index < MAX_RECORDS; index += 1) {
      if (!(state.records[date]?.rate > 0)) break;
      streak += 1;
      date = addDays(date, -1);
    }
    return streak;
  }

  function getMessage(rate, future) {
    if (future) {
      return {
        title: "未来の自分に、やさしい準備を。",
        sub: "予定を確認して、必要ならメニューや動画を整えておきましょう。"
      };
    }
    if (rate === 100) {
      return { title: "今日も最高の積み重ね！", sub: "すべて完了しました。ゆっくり休んで、頑張った自分をほめましょう。" };
    }
    if (rate >= 80) return { title: "ゴールはもう目の前。", sub: "あと少しです。無理のない範囲で進めましょう。" };
    if (rate >= 50) return { title: "いい流れができています。", sub: "半分を超えました。小さな積み重ねが力になります。" };
    if (rate > 0) return { title: "一歩を踏み出せました。", sub: "始められたことが大きな前進です。自分のペースで続けましょう。" };
    return { title: "できるところから、ひとつずつ。", sub: "全部できなくても大丈夫。今日の体調に合わせて始めましょう。" };
  }

  function renderDate() {
    const date = parseLocalDate(selectedDate);
    const today = todayString();
    const tomorrow = addDays(today, 1);
    let relationship = "選択した日";
    if (selectedDate === today) relationship = "今日";
    else if (selectedDate === tomorrow) relationship = "明日";
    else if (selectedDate < today) relationship = "過去の記録";
    else relationship = "これからの予定";

    elements.datePrimary.textContent = `${date.getMonth() + 1}月${date.getDate()}日（${DAY_NAMES[date.getDay()]}）`;
    elements.dateSecondary.textContent = `${date.getFullYear()}年・${relationship}`;
    elements.datePicker.value = selectedDate;
    elements.todayButton.classList.toggle("is-active", selectedDate === today);
    elements.tomorrowButton.classList.toggle("is-active", selectedDate === tomorrow);
    elements.futureNote.hidden = !isFutureDate(selectedDate);
  }

  function renderHeader() {
    renderDate();
    const streak = getStreak();
    elements.streakBadge.hidden = streak === 0;
    elements.streakBadge.textContent = `🔥 ${streak}日連続`;
  }

  function renderProgress() {
    const progress = getProgress(selectedDate);
    const future = isFutureDate(selectedDate);
    const message = getMessage(progress.rate, future);
    elements.progressEyebrow.textContent = future ? "予定の準備" : "選択日の達成度";
    elements.dailyMessage.textContent = message.title;
    elements.dailySubmessage.textContent = message.sub;
    elements.progressPercent.textContent = `${progress.rate}%`;
    elements.progressCount.textContent = `${progress.completed} / ${progress.total}`;
    elements.progressRing.style.setProperty("--progress", `${progress.rate * 3.6}deg`);
    elements.progressRing.setAttribute("aria-valuenow", String(progress.rate));
    elements.progressRing.setAttribute("aria-label", `達成率 ${progress.rate}パーセント`);
    elements.progressCard.classList.toggle("is-complete", progress.rate === 100);
  }

  function createNormalItem(section, item, checked) {
    const row = document.createElement("li");
    row.className = `menu-item${checked ? " is-checked" : ""}`;

    const content = document.createElement("div");
    content.className = "normal-item";

    const label = document.createElement("label");
    label.className = `check-label${isFutureDate(selectedDate) ? " is-disabled" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check-input";
    checkbox.checked = checked;
    checkbox.disabled = isFutureDate(selectedDate);
    checkbox.dataset.action = "toggle";
    checkbox.dataset.sectionId = section.id;
    checkbox.dataset.itemId = item.id;
    checkbox.setAttribute("aria-label", `${item.text}を完了にする`);

    const box = document.createElement("span");
    box.className = "check-box";
    box.setAttribute("aria-hidden", "true");
    box.textContent = "✓";

    const text = document.createElement("span");
    text.className = "item-text";
    text.textContent = item.text;
    label.append(checkbox, box, text);
    content.append(label);

    if (item.url) {
      const link = document.createElement("a");
      link.className = "video-link";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `${item.text}のYouTube動画を見る`);
      link.innerHTML = '<span aria-hidden="true">▶</span><span>動画を見る</span>';
      content.append(link);
    }

    row.append(content);
    return row;
  }

  function createEditItem(section, item) {
    const row = document.createElement("li");
    row.className = "menu-item";

    const form = document.createElement("form");
    form.className = "edit-item-form";
    form.dataset.action = "update";
    form.dataset.groupId = section.groupId;
    form.dataset.timeId = section.timeId;
    form.dataset.itemId = item.id;

    const fields = document.createElement("div");
    fields.className = "edit-fields";
    fields.append(
      createLabeledInput("メニュー名", "itemText", "text", item.text, "例：ラジオ体操", "text-input"),
      createLabeledInput("YouTube共有URL（任意）", "youtubeUrl", "url", item.url, "https://youtu.be/…", "url-input", true)
    );

    const actions = document.createElement("div");
    actions.className = "edit-item-actions";
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "save-item-button";
    saveButton.textContent = "保存";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-item-button";
    deleteButton.textContent = "外す";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.groupId = section.groupId;
    deleteButton.dataset.timeId = section.timeId;
    deleteButton.dataset.itemId = item.id;
    deleteButton.setAttribute("aria-label", `${item.text}をメニューから外す`);
    actions.append(saveButton, deleteButton);

    form.append(fields, actions);
    row.append(form);
    return row;
  }

  function createLabeledInput(labelText, name, type, value, placeholder, className, youtube = false) {
    const label = document.createElement("label");
    label.className = "field-label";
    const labelSpan = document.createElement("span");
    labelSpan.textContent = labelText;
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.value = value || "";
    input.placeholder = placeholder;
    input.maxLength = youtube ? 500 : 120;
    input.className = className;
    if (youtube) {
      const wrap = document.createElement("span");
      wrap.className = "url-field-wrap";
      wrap.append(input);
      label.append(labelSpan, wrap);
    } else {
      label.append(labelSpan, input);
    }
    return label;
  }

  function createAddForm(section) {
    const form = document.createElement("form");
    form.className = "add-item-form";
    form.dataset.action = "add";
    form.dataset.groupId = section.groupId;
    form.dataset.timeId = section.timeId;

    const title = document.createElement("p");
    title.className = "add-form-title";
    title.textContent = "＋ 新しいメニューを追加";

    const fields = document.createElement("div");
    fields.className = "add-fields";
    fields.append(
      createLabeledInput("メニュー名", "itemText", "text", "", "例：ストレッチ10分", "text-input"),
      createLabeledInput("YouTube共有URL（任意）", "youtubeUrl", "url", "", "共有URLを貼り付け", "url-input", true)
    );
    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.className = "add-button";
    addButton.textContent = "追加する";
    fields.append(addButton);

    form.append(title, fields);
    return form;
  }

  function renderMenus() {
    const sections = getSections(selectedDate);
    const checkedItems = state.records[selectedDate]?.checkedItems || {};
    const fragment = document.createDocumentFragment();

    sections.forEach((section) => {
      const card = document.createElement("section");
      card.className = `menu-card ${section.tone}`;

      const header = document.createElement("div");
      header.className = "menu-header";
      const icon = document.createElement("span");
      icon.className = "menu-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = section.icon;
      const title = document.createElement("h2");
      title.textContent = section.title;
      header.append(icon, title);

      const list = document.createElement("ul");
      list.className = "menu-list";
      if (section.items.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty-message";
        empty.textContent = "メニューはまだありません。編集モードから追加できます。";
        list.append(empty);
      } else {
        section.items.forEach((item) => {
          const checked = Boolean(checkedItems[`${section.id}:${item.id}`]);
          list.append(isEditing ? createEditItem(section, item) : createNormalItem(section, item, checked));
        });
      }

      card.append(header, list);
      if (isEditing) card.append(createAddForm(section));
      fragment.append(card);
    });

    elements.menuSections.replaceChildren(fragment);
  }

  function renderStats() {
    const streak = getStreak();
    const chartData = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const dateString = addDays(todayString(), -offset);
      const date = parseLocalDate(dateString);
      chartData.push({
        label: `${date.getMonth() + 1}/${date.getDate()}（${DAY_NAMES[date.getDay()]}）`,
        rate: state.records[dateString]?.rate || 0
      });
    }
    const average = Math.round(chartData.reduce((sum, item) => sum + item.rate, 0) / 7);
    elements.summaryStreak.textContent = `${streak}日`;
    elements.summaryAverage.textContent = `${average}%`;
    elements.weeklyMessage.textContent =
      average >= 80
        ? "素晴らしいペースです。頑張った体を休ませる時間も大切にしましょう。"
        : average > 0
          ? "小さな積み重ねが、しっかり記録になっています。自分のペースで続けましょう。"
          : "最初のひとつをチェックすると、ここに頑張りの記録が育っていきます。";
    elements.weeklyChart.setAttribute(
      "aria-label",
      chartData.map((item) => `${item.label} ${item.rate}パーセント`).join("、")
    );

    const fragment = document.createDocumentFragment();
    chartData.forEach((item) => {
      const column = document.createElement("div");
      column.className = "chart-column";
      const area = document.createElement("div");
      area.className = "bar-area";
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${Math.max(1, item.rate)}%`;
      const value = document.createElement("span");
      value.className = "bar-value";
      value.textContent = `${item.rate}%`;
      const label = document.createElement("span");
      label.className = "chart-label";
      label.textContent = item.label;
      bar.append(value);
      area.append(bar);
      column.append(area, label);
      fragment.append(column);
    });
    elements.weeklyChart.replaceChildren(fragment);
  }

  function renderEditState() {
    elements.editNote.hidden = !isEditing;
    elements.editToggle.classList.toggle("is-active", isEditing);
    elements.editToggle.textContent = isEditing ? "✓ 編集を終える" : "✎ メニューを編集";
  }

  function renderAll() {
    renderHeader();
    renderProgress();
    renderEditState();
    renderMenus();
    renderStats();
  }

  function selectDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return;
    selectedDate = dateString;
    isEditing = false;
    renderAll();
  }

  function navigateDate(amount) {
    selectDate(addDays(selectedDate, amount));
  }

  function toggleItem(sectionId, itemId) {
    if (isFutureDate(selectedDate)) {
      showToast("未来の日付はチェックできません。当日になってから記録できます。");
      return;
    }
    const key = `${sectionId}:${itemId}`;
    const currentRecord = state.records[selectedDate] || { checkedItems: {} };
    const checkedItems = { ...currentRecord.checkedItems };
    if (checkedItems[key]) delete checkedItems[key];
    else checkedItems[key] = true;
    state.records[selectedDate] = { ...currentRecord, checkedItems };
    updateRecord(selectedDate);
    saveState();
    renderAll();
  }

  function getSection(groupId, timeId) {
    return state.menu[groupId]?.[timeId] || null;
  }

  function readMenuForm(form) {
    const formData = new FormData(form);
    const text = normalizeText(formData.get("itemText"), "", 120);
    const urlResult = normalizeYouTubeUrl(formData.get("youtubeUrl"));
    if (!text) {
      showToast("メニュー名を入力してください。");
      form.elements.itemText?.focus();
      return null;
    }
    if (!urlResult.valid) {
      showToast("YouTubeの共有URLを貼り付けてください。", 4500);
      form.elements.youtubeUrl?.focus();
      return null;
    }
    return { text, url: urlResult.url };
  }

  function addMenuItem(form) {
    const section = getSection(form.dataset.groupId, form.dataset.timeId);
    if (!section) return;
    if (section.items.length >= MAX_MENU_ITEMS) {
      showToast("1つの時間帯に追加できるのは200件までです。");
      return;
    }
    const values = readMenuForm(form);
    if (!values) return;
    section.items.push({ id: createId(), ...values });
    saveState("新しいメニューを追加しました。");
    renderAll();
  }

  function updateMenuItem(form) {
    const section = getSection(form.dataset.groupId, form.dataset.timeId);
    const item = section?.items.find((candidate) => candidate.id === form.dataset.itemId);
    if (!item) return;
    const values = readMenuForm(form);
    if (!values) return;
    item.text = values.text;
    item.url = values.url;
    saveState("メニューを保存しました。");
    renderAll();
  }

  function deleteMenuItem(button) {
    const section = getSection(button.dataset.groupId, button.dataset.timeId);
    const item = section?.items.find((candidate) => candidate.id === button.dataset.itemId);
    if (!item) return;
    if (!window.confirm(`「${item.text}」をメニューから外しますか？`)) return;
    section.items = section.items.filter((candidate) => candidate.id !== item.id);
    saveState("メニューから外しました。");
    renderAll();
  }

  function selectTab(tabName) {
    document.querySelectorAll(".tab").forEach((tab) => {
      const active = tab.dataset.tab === tabName;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.hidden = panel.id !== `panel-${tabName}`;
    });
    if (tabName === "stats") renderStats();
  }

  function exportBackup() {
    const backup = {
      app: "Reha Flow",
      schemaVersion: 3,
      exportedAt: new Date().toISOString(),
      data: state
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rehab-check-backup-${todayString()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("バックアップを書き出しました。");
  }

  async function importBackup(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("ファイルが大きすぎます。5MB以下のバックアップを選んでください。", 5000);
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      const imported = parsed?.data || parsed;
      if (!imported?.menu || !imported?.records) throw new Error("形式が異なります");
      const nextState = {
        version: 3,
        menu: normalizeMenu(imported.menu),
        records: sanitizeRecords(imported.records)
      };
      if (!window.confirm("現在の記録とメニューを、選んだバックアップの内容に置き換えますか？")) return;
      state = nextState;
      selectedDate = todayString();
      isEditing = false;
      saveState("バックアップを読み込みました。");
      renderAll();
    } catch (error) {
      console.warn("バックアップを読み込めませんでした。", error);
      showToast("このファイルは読み込めません。アプリから書き出したJSONを選んでください。", 5000);
    } finally {
      elements.importFile.value = "";
    }
  }

  function showToast(message, duration = 2800) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, duration);
  }

  elements.previousDay.addEventListener("click", () => navigateDate(-1));
  elements.nextDay.addEventListener("click", () => navigateDate(1));
  elements.todayButton.addEventListener("click", () => selectDate(todayString()));
  elements.tomorrowButton.addEventListener("click", () => selectDate(addDays(todayString(), 1)));
  elements.datePicker.addEventListener("change", () => selectDate(elements.datePicker.value));
  elements.calendarButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (typeof elements.datePicker.showPicker === "function") elements.datePicker.showPicker();
    else elements.datePicker.click();
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.tab));
  });

  elements.editToggle.addEventListener("click", () => {
    isEditing = !isEditing;
    renderEditState();
    renderMenus();
  });

  elements.menuSections.addEventListener("change", (event) => {
    const checkbox = event.target.closest('[data-action="toggle"]');
    if (checkbox) toggleItem(checkbox.dataset.sectionId, checkbox.dataset.itemId);
  });

  elements.menuSections.addEventListener("click", (event) => {
    const deleteButton = event.target.closest('button[data-action="delete"]');
    if (deleteButton) deleteMenuItem(deleteButton);
  });

  elements.menuSections.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-action]");
    if (!form) return;
    event.preventDefault();
    if (form.dataset.action === "add") addMenuItem(form);
    if (form.dataset.action === "update") updateMenuItem(form);
  });

  elements.exportButton.addEventListener("click", exportBackup);
  elements.importButton.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", () => importBackup(elements.importFile.files?.[0]));

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    elements.installButton.hidden = true;
    showToast("ホーム画面に追加しました。");
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker_v2.js").catch((error) => {
        console.warn("オフライン機能を開始できませんでした。", error);
      });
    });
  }

  renderAll();
})();
