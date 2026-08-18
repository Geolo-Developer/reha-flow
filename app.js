(() => {
  "use strict";

  const STORAGE_KEY = "rehab-check-app-v2";
  const SCHEMA_VERSION = 4;
  const MAX_SECTIONS = 100;
  const MAX_MENU_ITEMS = 200;
  const MAX_RECORDS = 5000;
  const SECTION_TONES = ["orange", "blue", "purple", "green", "night"];
  const WEEKDAY_CHOICES = [
    { value: 1, label: "月" },
    { value: 2, label: "火" },
    { value: 3, label: "水" },
    { value: 4, label: "木" },
    { value: 5, label: "金" },
    { value: 6, label: "土" },
    { value: 0, label: "日" }
  ];

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

  const LEGACY_SECTION_DEFINITIONS = [
    { id: "everyday-morning", groupId: "everyday", timeId: "morning", schedule: { type: "daily" }, tone: "orange", icon: "☀" },
    { id: "mwf-morning", groupId: "mwf", timeId: "morning", schedule: { type: "weekly", days: [1, 3, 5] }, tone: "blue", icon: "✦" },
    { id: "mwf-afternoon", groupId: "mwf", timeId: "afternoon", schedule: { type: "weekly", days: [1, 3, 5] }, tone: "purple", icon: "◆" },
    { id: "tt-morning", groupId: "tt", timeId: "morning", schedule: { type: "weekly", days: [2, 4] }, tone: "blue", icon: "✦" },
    { id: "tt-afternoon", groupId: "tt", timeId: "afternoon", schedule: { type: "weekly", days: [2, 4] }, tone: "purple", icon: "◆" },
    { id: "everyday-night", groupId: "everyday", timeId: "night", schedule: { type: "daily" }, tone: "night", icon: "☾" }
  ];

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
    editToolbar: document.querySelector("#edit-toolbar"),
    editFinish: document.querySelector("#edit-finish"),
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
  let isAddingSection = false;
  const collapsedSectionIds = new Set();
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

  function createInitialSections() {
    return LEGACY_SECTION_DEFINITIONS.map((definition) => {
      const source = INITIAL_MENU_TEXT[definition.groupId][definition.timeId];
      return {
        id: definition.id,
        title: source.title,
        schedule: clone(definition.schedule),
        tone: definition.tone,
        icon: definition.icon,
        items: source.items.map((text, index) => ({
          id: `${definition.id}-${String(index + 1).padStart(2, "0")}`,
          text,
          url: ""
        }))
      };
    });
  }

  function createInitialState() {
    return { version: SCHEMA_VERSION, sections: createInitialSections(), records: {} };
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

  function normalizeIcon(value, fallback = "●") {
    const text = normalizeText(value, fallback, 16);
    return Array.from(text).slice(0, 4).join("") || fallback;
  }

  function normalizeSchedule(input, fallback = { type: "daily" }) {
    if (input?.type === "daily") return { type: "daily" };
    if (input?.type === "weekly" && Array.isArray(input.days)) {
      const days = [...new Set(input.days.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))];
      if (days.length > 0) return { type: "weekly", days };
    }
    return clone(fallback);
  }

  function normalizeItems(input, sectionId) {
    if (!Array.isArray(input)) return [];
    const usedIds = new Set();
    const items = [];

    input.slice(0, MAX_MENU_ITEMS).forEach((item, index) => {
      const rawText = typeof item === "string" ? item : item?.text;
      const text = normalizeText(rawText, "", 120);
      if (!text) return;

      let id = normalizeText(
        typeof item === "object" ? item?.id : "",
        `${sectionId}-import-${index}`,
        100
      ).replace(/[^a-zA-Z0-9_-]/g, "-");
      if (!id || usedIds.has(id)) id = createId();
      usedIds.add(id);

      const urlResult = normalizeYouTubeUrl(typeof item === "object" ? item?.url : "");
      items.push({ id, text, url: urlResult.valid ? urlResult.url : "" });
    });

    return items;
  }

  function normalizeSections(input) {
    if (!Array.isArray(input)) return createInitialSections();
    const defaults = new Map(createInitialSections().map((section) => [section.id, section]));
    const usedIds = new Set();
    const sections = [];

    input.slice(0, MAX_SECTIONS).forEach((source) => {
      if (!source || typeof source !== "object") return;
      const requestedId = normalizeText(source.id, "", 100).replace(/[^a-zA-Z0-9_-]/g, "-");
      let id = requestedId || `section-${createId()}`;
      if (usedIds.has(id)) id = `section-${createId()}`;
      usedIds.add(id);

      const fallback = defaults.get(id);
      const fallbackSchedule = fallback?.schedule || { type: "daily" };
      const tone = SECTION_TONES.includes(source.tone) ? source.tone : fallback?.tone || "blue";
      const itemsSource = Array.isArray(source.items) ? source.items : fallback?.items || [];
      sections.push({
        id,
        title: normalizeText(source.title, fallback?.title || "新しい大分類", 80),
        schedule: normalizeSchedule(source.schedule, fallbackSchedule),
        tone,
        icon: normalizeIcon(source.icon, fallback?.icon || "●"),
        items: normalizeItems(itemsSource, id)
      });
    });

    return sections;
  }

  function migrateLegacyMenu(input) {
    const defaults = createInitialSections();
    return LEGACY_SECTION_DEFINITIONS.map((definition, index) => {
      const fallback = defaults[index];
      const source = input?.[definition.groupId]?.[definition.timeId];
      return {
        ...fallback,
        title: normalizeText(source?.title, fallback.title, 80),
        items: Array.isArray(source?.items) ? normalizeItems(source.items, definition.id) : fallback.items
      };
    });
  }

  function normalizeState(input) {
    const sections = Array.isArray(input?.sections)
      ? normalizeSections(input.sections)
      : migrateLegacyMenu(input?.menu);
    return {
      version: SCHEMA_VERSION,
      sections,
      records: sanitizeRecords(input?.records)
    };
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
      const normalized = normalizeState(parsed);
      if (parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.sections)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
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

  function scheduleMatchesDate(schedule, dateString) {
    if (schedule?.type === "daily") return true;
    const day = parseLocalDate(dateString).getDay();
    return schedule?.type === "weekly" && Array.isArray(schedule.days) && schedule.days.includes(day);
  }

  function formatSchedule(schedule) {
    if (schedule?.type === "daily") return "毎日";
    const days = WEEKDAY_CHOICES.filter((choice) => schedule?.days?.includes(choice.value)).map((choice) => choice.label);
    return days.length > 0 ? `${days.join("・")}曜日` : "曜日未設定";
  }

  function getSections(dateString) {
    return state.sections.filter((section) => scheduleMatchesDate(section.schedule, dateString));
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

  function createEditItem(section, item, itemIndex) {
    const row = document.createElement("li");
    row.className = "menu-item";

    const form = document.createElement("form");
    form.className = "edit-item-form";
    form.dataset.action = "update";
    form.dataset.sectionId = section.id;
    form.dataset.itemId = item.id;

    const fields = document.createElement("div");
    fields.className = "edit-fields";
    fields.append(
      createLabeledInput("メニュー名", "itemText", "text", item.text, "例：ラジオ体操", "text-input"),
      createLabeledInput("YouTube共有URL（任意）", "youtubeUrl", "url", item.url, "https://youtu.be/…", "url-input", true)
    );

    const actions = document.createElement("div");
    actions.className = "edit-item-actions";

    const orderActions = document.createElement("div");
    orderActions.className = "item-order-actions";
    const moveUpButton = document.createElement("button");
    moveUpButton.type = "button";
    moveUpButton.className = "order-button";
    moveUpButton.textContent = "↑ 上へ";
    moveUpButton.disabled = itemIndex === 0;
    moveUpButton.dataset.action = "move-item-up";
    moveUpButton.dataset.sectionId = section.id;
    moveUpButton.dataset.itemId = item.id;
    moveUpButton.setAttribute("aria-label", `${item.text}を上へ移動`);
    const moveDownButton = document.createElement("button");
    moveDownButton.type = "button";
    moveDownButton.className = "order-button";
    moveDownButton.textContent = "↓ 下へ";
    moveDownButton.disabled = itemIndex === section.items.length - 1;
    moveDownButton.dataset.action = "move-item-down";
    moveDownButton.dataset.sectionId = section.id;
    moveDownButton.dataset.itemId = item.id;
    moveDownButton.setAttribute("aria-label", `${item.text}を下へ移動`);
    orderActions.append(moveUpButton, moveDownButton);

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "save-item-button";
    saveButton.textContent = "保存";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-item-button";
    deleteButton.textContent = "外す";
    deleteButton.dataset.action = "delete-item";
    deleteButton.dataset.sectionId = section.id;
    deleteButton.dataset.itemId = item.id;
    deleteButton.setAttribute("aria-label", `${item.text}をメニューから外す`);
    actions.append(orderActions, saveButton, deleteButton);

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

  function createLabeledSelect(labelText, name, options, value) {
    const label = document.createElement("label");
    label.className = "field-label";
    const labelSpan = document.createElement("span");
    labelSpan.textContent = labelText;
    const select = document.createElement("select");
    select.name = name;
    select.className = "select-input";
    options.forEach((optionData) => {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.label;
      option.selected = optionData.value === value;
      select.append(option);
    });
    label.append(labelSpan, select);
    return label;
  }

  function getSchedulePreset(schedule) {
    if (schedule?.type === "daily") return "daily";
    const days = [...(schedule?.days || [])].sort((a, b) => a - b).join(",");
    if (days === "1,3,5") return "mwf";
    if (days === "2,4") return "tt";
    return "custom";
  }

  function createScheduleFields(schedule, fieldId) {
    const wrapper = document.createElement("div");
    wrapper.className = "schedule-fields";
    const preset = getSchedulePreset(schedule);
    const presetField = createLabeledSelect(
      "表示する曜日",
      "schedulePreset",
      [
        { value: "daily", label: "毎日" },
        { value: "mwf", label: "月・水・金" },
        { value: "tt", label: "火・木" },
        { value: "custom", label: "曜日を選ぶ" }
      ],
      preset
    );

    const select = presetField.querySelector("select");
    const fieldset = document.createElement("fieldset");
    fieldset.className = "weekday-fieldset";
    fieldset.hidden = preset !== "custom";
    const legend = document.createElement("legend");
    legend.textContent = "表示する曜日（複数選択可）";
    fieldset.append(legend);

    WEEKDAY_CHOICES.forEach((choice) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "scheduleDay";
      input.value = String(choice.value);
      input.id = `${fieldId}-day-${choice.value}`;
      input.checked = schedule?.type === "weekly" && schedule.days.includes(choice.value);
      const text = document.createElement("span");
      text.textContent = choice.label;
      label.htmlFor = input.id;
      label.append(input, text);
      fieldset.append(label);
    });

    select.addEventListener("change", () => {
      fieldset.hidden = select.value !== "custom";
    });
    wrapper.append(presetField, fieldset);
    return wrapper;
  }

  function createSectionFields(section, fieldId) {
    const fields = document.createElement("div");
    fields.className = "section-fields";
    const titleField = createLabeledInput("大分類名", "sectionTitle", "text", section.title, "例：毎日 朝体操", "text-input");
    const iconField = createLabeledInput("アイコン", "sectionIcon", "text", section.icon, "例：☀", "text-input icon-input");
    iconField.querySelector("input").maxLength = 8;
    const toneField = createLabeledSelect(
      "色テーマ",
      "sectionTone",
      [
        { value: "orange", label: "オレンジ" },
        { value: "blue", label: "ブルー" },
        { value: "purple", label: "パープル" },
        { value: "green", label: "グリーン" },
        { value: "night", label: "ナイト" }
      ],
      section.tone
    );
    fields.append(titleField, iconField, toneField, createScheduleFields(section.schedule, fieldId));
    return fields;
  }

  function createSectionEditor(section) {
    const form = document.createElement("form");
    form.className = "section-edit-form";
    form.dataset.action = "update-section";
    form.dataset.sectionId = section.id;
    form.append(createSectionFields(section, `section-${section.id}`));

    const actions = document.createElement("div");
    actions.className = "section-edit-actions";
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "save-section-button";
    saveButton.textContent = "大分類を保存";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-section-button";
    deleteButton.dataset.action = "delete-section";
    deleteButton.dataset.sectionId = section.id;
    deleteButton.textContent = "大分類を削除";
    actions.append(saveButton, deleteButton);
    form.append(actions);
    return form;
  }

  function createAddSectionPanel() {
    const panel = document.createElement("section");
    panel.className = "add-section-panel";
    if (!isAddingSection) {
      const showButton = document.createElement("button");
      showButton.type = "button";
      showButton.className = "add-section-button";
      showButton.dataset.action = "show-add-section";
      showButton.textContent = "＋ 大分類を追加";
      panel.append(showButton);
      return panel;
    }

    const form = document.createElement("form");
    form.className = "section-add-form";
    form.dataset.action = "add-section";
    const heading = document.createElement("h2");
    heading.textContent = "新しい大分類";
    form.append(
      heading,
      createSectionFields(
        { title: "", icon: "●", tone: "blue", schedule: { type: "daily" } },
        "new-section"
      )
    );
    const actions = document.createElement("div");
    actions.className = "section-edit-actions";
    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.className = "save-section-button";
    addButton.textContent = "大分類を追加する";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-section-button";
    cancelButton.dataset.action = "cancel-add-section";
    cancelButton.textContent = "キャンセル";
    actions.append(addButton, cancelButton);
    form.append(actions);
    panel.append(form);
    return panel;
  }

  function createAddForm(section) {
    const form = document.createElement("form");
    form.className = "add-item-form";
    form.dataset.action = "add";
    form.dataset.sectionId = section.id;

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
    const sections = isEditing ? state.sections : getSections(selectedDate);
    const checkedItems = state.records[selectedDate]?.checkedItems || {};
    const fragment = document.createDocumentFragment();

    if (sections.length === 0 && !isEditing) {
      const empty = document.createElement("div");
      empty.className = "no-sections-message";
      empty.textContent = "この日に表示するメニューはありません。編集モードから大分類を追加できます。";
      fragment.append(empty);
    }

    sections.forEach((section, sectionIndex) => {
      const isCollapsed = collapsedSectionIds.has(section.id);
      const completed = section.items.filter((item) => checkedItems[`${section.id}:${item.id}`]).length;
      const card = document.createElement("section");
      card.className = `menu-card ${section.tone}${isCollapsed ? " is-collapsed" : ""}`;

      const header = document.createElement("div");
      header.className = "menu-header";
      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "menu-collapse-toggle";
      toggleButton.dataset.action = "toggle-section";
      toggleButton.dataset.sectionId = section.id;
      toggleButton.setAttribute("aria-expanded", String(!isCollapsed));
      toggleButton.setAttribute("aria-label", `${section.title}を${isCollapsed ? "開く" : "閉じる"}`);
      const icon = document.createElement("span");
      icon.className = "menu-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = section.icon;
      const heading = document.createElement("span");
      heading.className = "menu-heading";
      const title = document.createElement("h2");
      title.textContent = section.title;
      const meta = document.createElement("span");
      meta.className = "menu-meta";
      meta.textContent = `${formatSchedule(section.schedule)} ・ ${completed} / ${section.items.length} 完了`;
      heading.append(title, meta);
      const chevron = document.createElement("span");
      chevron.className = "collapse-mark";
      chevron.setAttribute("aria-hidden", "true");
      chevron.textContent = isCollapsed ? "＋" : "－";
      toggleButton.append(icon, heading, chevron);
      header.append(toggleButton);

      if (isEditing) {
        const sectionOrderActions = document.createElement("div");
        sectionOrderActions.className = "section-order-actions";
        const upButton = document.createElement("button");
        upButton.type = "button";
        upButton.className = "order-button";
        upButton.dataset.action = "move-section-up";
        upButton.dataset.sectionId = section.id;
        upButton.disabled = sectionIndex === 0;
        upButton.textContent = "↑ 上へ";
        upButton.setAttribute("aria-label", `${section.title}を上へ移動`);
        const downButton = document.createElement("button");
        downButton.type = "button";
        downButton.className = "order-button";
        downButton.dataset.action = "move-section-down";
        downButton.dataset.sectionId = section.id;
        downButton.disabled = sectionIndex === sections.length - 1;
        downButton.textContent = "↓ 下へ";
        downButton.setAttribute("aria-label", `${section.title}を下へ移動`);
        sectionOrderActions.append(upButton, downButton);
        header.append(sectionOrderActions);
      }

      card.append(header);

      if (!isCollapsed) {
        const body = document.createElement("div");
        body.className = "menu-card-body";
        if (isEditing) body.append(createSectionEditor(section));

        const list = document.createElement("ul");
        list.className = "menu-list";
        if (section.items.length === 0) {
          const empty = document.createElement("li");
          empty.className = "empty-message";
          empty.textContent = "メニューはまだありません。編集モードから追加できます。";
          list.append(empty);
        } else {
          section.items.forEach((item, itemIndex) => {
            const checked = Boolean(checkedItems[`${section.id}:${item.id}`]);
            list.append(isEditing ? createEditItem(section, item, itemIndex) : createNormalItem(section, item, checked));
          });
        }

        body.append(list);
        if (isEditing) body.append(createAddForm(section));
        card.append(body);
      }
      fragment.append(card);
    });

    if (isEditing) fragment.append(createAddSectionPanel());

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
    elements.editToolbar.hidden = !isEditing;
    document.body.classList.toggle("is-editing", isEditing);
    elements.editToggle.classList.toggle("is-active", isEditing);
    elements.editToggle.textContent = isEditing ? "✓ 編集を終える" : "✎ メニューを編集";
  }

  function setEditing(nextEditing) {
    isEditing = nextEditing;
    if (!isEditing) isAddingSection = false;
    renderEditState();
    renderMenus();
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
    isAddingSection = false;
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

  function getSection(sectionId) {
    return state.sections.find((section) => section.id === sectionId) || null;
  }

  function readScheduleForm(formData, form) {
    const preset = formData.get("schedulePreset");
    if (preset === "daily") return { type: "daily" };
    if (preset === "mwf") return { type: "weekly", days: [1, 3, 5] };
    if (preset === "tt") return { type: "weekly", days: [2, 4] };
    const days = [...new Set(formData.getAll("scheduleDay").map(Number).filter((day) => Number.isInteger(day)))];
    if (days.length === 0) {
      showToast("表示する曜日を1つ以上選んでください。");
      form.querySelector('input[name="scheduleDay"]')?.focus();
      return null;
    }
    return { type: "weekly", days };
  }

  function readSectionForm(form) {
    const formData = new FormData(form);
    const title = normalizeText(formData.get("sectionTitle"), "", 80);
    if (!title) {
      showToast("大分類名を入力してください。");
      form.elements.sectionTitle?.focus();
      return null;
    }
    const schedule = readScheduleForm(formData, form);
    if (!schedule) return null;
    const toneValue = String(formData.get("sectionTone") || "");
    return {
      title,
      icon: normalizeIcon(formData.get("sectionIcon"), "●"),
      tone: SECTION_TONES.includes(toneValue) ? toneValue : "blue",
      schedule
    };
  }

  function addSection(form) {
    if (state.sections.length >= MAX_SECTIONS) {
      showToast("追加できる大分類は100件までです。");
      return;
    }
    const values = readSectionForm(form);
    if (!values) return;
    let id = `section-${createId()}`;
    while (getSection(id)) id = `section-${createId()}`;
    state.sections.push({ id, ...values, items: [] });
    isAddingSection = false;
    saveState("大分類を追加しました。");
    renderAll();
  }

  function updateSection(form) {
    const section = getSection(form.dataset.sectionId);
    if (!section) return;
    const values = readSectionForm(form);
    if (!values) return;
    section.title = values.title;
    section.icon = values.icon;
    section.tone = values.tone;
    section.schedule = values.schedule;
    saveState("大分類を保存しました。");
    renderAll();
  }

  function deleteSection(button) {
    const section = getSection(button.dataset.sectionId);
    if (!section) return;
    if (!window.confirm("この大分類と中のメニューを削除しますか？\n過去のチェック記録は削除されません。")) return;
    state.sections = state.sections.filter((candidate) => candidate.id !== section.id);
    collapsedSectionIds.delete(section.id);
    saveState("大分類を削除しました。過去のチェック記録は保持されています。");
    renderAll();
  }

  function moveSection(sectionId, direction) {
    const index = state.sections.findIndex((section) => section.id === sectionId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= state.sections.length) return;
    [state.sections[index], state.sections[targetIndex]] = [state.sections[targetIndex], state.sections[index]];
    saveState("大分類の順番を変更しました。");
    renderAll();
  }

  function moveMenuItem(sectionId, itemId, direction) {
    const section = getSection(sectionId);
    const index = section?.items.findIndex((item) => item.id === itemId) ?? -1;
    const targetIndex = index + direction;
    if (!section || index < 0 || targetIndex < 0 || targetIndex >= section.items.length) return;
    [section.items[index], section.items[targetIndex]] = [section.items[targetIndex], section.items[index]];
    saveState("メニューの順番を変更しました。");
    renderAll();
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
    const section = getSection(form.dataset.sectionId);
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
    const section = getSection(form.dataset.sectionId);
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
    const section = getSection(button.dataset.sectionId);
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
      schemaVersion: SCHEMA_VERSION,
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
      const hasMenu = Array.isArray(imported?.sections) || (imported?.menu && typeof imported.menu === "object");
      if (!hasMenu || !imported?.records || typeof imported.records !== "object") throw new Error("形式が異なります");
      const nextState = normalizeState(imported);
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
    setEditing(!isEditing);
  });
  elements.editFinish.addEventListener("click", () => setEditing(false));

  elements.menuSections.addEventListener("change", (event) => {
    const checkbox = event.target.closest('[data-action="toggle"]');
    if (checkbox) toggleItem(checkbox.dataset.sectionId, checkbox.dataset.itemId);
  });

  elements.menuSections.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, sectionId, itemId } = button.dataset;
    if (action === "toggle-section") {
      if (collapsedSectionIds.has(sectionId)) collapsedSectionIds.delete(sectionId);
      else collapsedSectionIds.add(sectionId);
      renderMenus();
    }
    if (action === "move-section-up") moveSection(sectionId, -1);
    if (action === "move-section-down") moveSection(sectionId, 1);
    if (action === "move-item-up") moveMenuItem(sectionId, itemId, -1);
    if (action === "move-item-down") moveMenuItem(sectionId, itemId, 1);
    if (action === "delete-item") deleteMenuItem(button);
    if (action === "delete-section") deleteSection(button);
    if (action === "show-add-section") {
      isAddingSection = true;
      renderMenus();
      elements.menuSections.querySelector('.section-add-form input[name="sectionTitle"]')?.focus();
    }
    if (action === "cancel-add-section") {
      isAddingSection = false;
      renderMenus();
    }
  });

  elements.menuSections.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-action]");
    if (!form) return;
    event.preventDefault();
    if (form.dataset.action === "add") addMenuItem(form);
    if (form.dataset.action === "update") updateMenuItem(form);
    if (form.dataset.action === "add-section") addSection(form);
    if (form.dataset.action === "update-section") updateSection(form);
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
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.warn("オフライン機能を開始できませんでした。", error);
      });
    });
  }

  renderAll();
})();
