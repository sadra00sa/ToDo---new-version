"use strict";

/* ---------- Config ---------- */
const TASKS_KEY = "tasks"; // same key as before, so existing tasks keep working
const SETTINGS_KEY = "tickTask.settings";
const DEFAULT_AVATAR = "./PSX_20230602_1910.jpg";

const CATEGORIES = [
  { id: "home", label: "Home", icon: "home" },
  { id: "health", label: "Health", icon: "health" },
  { id: "personal", label: "Personal", icon: "personal" },
  { id: "work", label: "Work", icon: "work" },
  { id: "other", label: "Other", icon: "other" },
];
const STATUSES = [
  { id: "to-do", label: "To do" },
  { id: "done", label: "Done" },
  { id: "overdue", label: "Overdue" },
];
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
const STATUS_IDS = STATUSES.map((s) => s.id);
const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
const getStatus = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

/* ---------- Icons (inline SVG, static trusted strings) ---------- */
const ICON_PATHS = {
  check: '<path class="tick" pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/>',
  home: '<path d="M3 11l9-7.5L21 11"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  health: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
  personal: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.7 2 7.5 5.6"/>',
  work: '<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"/><path d="M3.5 13h17"/>',
  other: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
  all: '<path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20"/><path d="M4 6.5h.01M4 12h.01M4 17.5h.01"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  star: '<path d="M12 3.8l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7z"/>',
  edit: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 8.5l3 3"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.8 12.2h9.4L17.5 7M10 11v5M14 11v5"/>',
  chevL: '<path d="M14.5 6l-6 6 6 6"/>',
  chevR: '<path d="M9.5 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
};
const svg = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ""}</svg>`;

/* ---------- Small helpers ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const iconEl = (name, className = "") => {
  const node = el("span", className);
  node.dataset.icon = name;
  node.innerHTML = svg(name);
  return node;
};
const makeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);

/* ---------- Dates (all local time, stored as YYYY-MM-DD) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const todayISO = () => toISO(new Date());
const addDays = (date, n) => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + n);
  return copy;
};
const startOfWeek = (date) => addDays(date, -date.getDay()); // weeks start on Sunday, like before

const fmtLong = (d) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtMonthYear = (d) => d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const fmtShort = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

const formatTaskDate = (iso) => {
  const value = iso || todayISO();
  if (value === todayISO()) return "Today";
  if (value === toISO(addDays(new Date(), 1))) return "Tomorrow";
  if (value === toISO(addDays(new Date(), -1))) return "Yesterday";
  const d = fromISO(value);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
  });
};

/* ---------- DOM references ---------- */
const sidebar = $("#sidebar");
const sidebarClose = $("#sidebar-close");
const sidebarApply = $("#sidebar-apply");
const scrim = $("#scrim");
const menuBtn = $("#menu-btn");

const userNameEl = $("#user-name");
const settingBtn = $("#setting");
const calendarBtn = $("#calendar-btn");
const searchInput = $("#search");
const resetBtn = $("#reset-filter-btn");
const badgeContainer = $("#active-filters");
const filterStatusBox = $("#filter-status");
const filterCategoryBox = $("#filter-category");

const summaryEl = $("#summary");
const addTaskBtn = $("#add_task");
const weekTitle = $("#week-title");
const weekDays = $("#week-days");
const preWeekBtn = $("#pre_week");
const nextWeekBtn = $("#next_week");
const weekTodayBtn = $("#week-today");
const chipsBox = $("#category");
const progressBox = $("#progress");
const impBtn = $("#prog_imp");

const taskList = $("#holeList");
const preentered = $("#preentered");
const emptyTitle = $("#empty-title");
const emptyText = $("#empty-text");
const emptyAction = $("#empty-action");
const listStatus = $("#list-status");

const addTaskModal = $("#add-modal");
const taskForm = $("#task-form");
const addModalTitle = $("#add-modal-title");
const addTaskButton = $("#add-task-btn");
const titleInput = $("#title");
const titleError = $("#title-error");
const descInput = $("#description");
const categorySelect = $("#category-selector");
const statusSelect = $("#status-selector");
const dateInput = $("#task-input-date");
const timeInput = $("#task-input-time");
const impCheck = $("#imp-check-box");

const confirmModal = $("#confirm-modal");
const confirmTitle = $("#confirm-title");
const confirmText = $("#confirm-text");
const confirmOk = $("#delete-task-btn");

const settingModal = $("#setting-modal");
const nameInput = $("#name-input");
const avatarInput = $("#avatar-input");
const avatarPick = $("#avatar-pick");
const avatarRemove = $("#avatar-remove");
const avatarError = $("#avatar-error");
const exportBtn = $("#export-btn");
const clearDoneBtn = $("#clear-done-btn");
const clearAllBtn = $("#clear-all-btn");

const calendarModal = $("#calendar-modal");
const calTitle = $("#cal-title");
const calGrid = $("#cal-grid");

/* ---------- State ---------- */
const normalizeTask = (t) => ({
  id: t.id || makeId(),
  title: String(t.title ?? ""),
  description: String(t.description ?? ""),
  category: CATEGORY_IDS.includes(t.category) ? t.category : "other",
  status: STATUS_IDS.includes(t.status) ? t.status : "to-do",
  isImportant: Boolean(t.isImportant),
  time: t.time || "",
  date: t.date || "",
});

const loadTasks = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(TASKS_KEY));
    return Array.isArray(raw) ? raw.filter((t) => t && typeof t === "object").map(normalizeTask) : [];
  } catch {
    return [];
  }
};
const loadSettings = () => {
  const base = { name: "", avatar: "", theme: "system" };
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return raw && typeof raw === "object" ? { ...base, ...raw } : base;
  } catch {
    return base;
  }
};

let tasks = loadTasks();
const settings = loadSettings();

const activeFilters = {
  categories: [],
  statuses: [],
  important: false,
  search: "",
  date: null, // YYYY-MM-DD or null (= all dates)
};

let weekStart = startOfWeek(new Date());
let calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let editingTaskId = null;
let justDoneId = null;

const saveTasks = () => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* storage full or blocked — the app keeps working in memory */
  }
};
const saveSettings = () => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
};

/* ---------- Theme ---------- */
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const applyTheme = () => {
  const dark = settings.theme === "dark" || (settings.theme === "system" && darkQuery.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
};
darkQuery.addEventListener("change", applyTheme);

/* ---------- Profile / avatar ---------- */
const initialsOf = (name) =>
  (name || "User Name")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join("")
    .toUpperCase() || "?";

const renderProfile = () => {
  userNameEl.textContent = settings.name || "User Name";
  const src = settings.avatar || DEFAULT_AVATAR;
  $$("[data-avatar]").forEach((node) => {
    node.textContent = initialsOf(settings.name); // fallback while (or if) the photo can't load
    const probe = new Image();
    probe.onload = () => {
      const img = el("img");
      img.src = src;
      img.alt = "";
      node.replaceChildren(img);
    };
    probe.src = src;
  });
};

const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const side = Math.min(img.width, img.height);
      canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unreadable image"));
    };
    img.src = url;
  });

/* ---------- Filtering ---------- */
const compareTasks = (a, b) => {
  const today = todayISO();
  const da = a.date || today;
  const db = b.date || today;
  if (da !== db) return da < db ? -1 : 1;
  if (a.time !== b.time) return a.time < b.time ? -1 : 1; // all-day ("") first
  return 0;
};

const getVisibleTasks = () => {
  const { categories, statuses, important, search, date } = activeFilters;
  const query = search.trim().toLowerCase();
  const today = todayISO();
  return tasks
    .filter(
      (t) =>
        (!categories.length || categories.includes(t.category)) &&
        (!statuses.length || statuses.includes(t.status)) &&
        (!important || t.isImportant) &&
        (!query || `${t.title} ${t.description}`.toLowerCase().includes(query)) &&
        (!date || (t.date || today) === date),
    )
    .sort(compareTasks);
};

const dateCounts = () => {
  const today = todayISO();
  const map = new Map();
  for (const t of tasks) {
    const key = t.date || today;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
};

const setFilter = (type, value, on) => {
  if (type === "important") {
    activeFilters.important = on;
  } else {
    const key = type === "category" ? "categories" : "statuses";
    const set = new Set(activeFilters[key]);
    if (on) set.add(value);
    else set.delete(value);
    activeFilters[key] = [...set];
  }
  render();
};

const resetFilters = () => {
  activeFilters.categories = [];
  activeFilters.statuses = [];
  activeFilters.important = false;
  activeFilters.search = "";
  activeFilters.date = null;
  searchInput.value = "";
  render();
};

/* ---------- Build static controls once ---------- */
const buildSwitchRow = ({ type, value, label, tintAttr, tintValue, iconName }) => {
  const row = el("label", "filter-row");
  if (tintAttr) row.setAttribute(tintAttr, tintValue);

  const icon = el("span", "filter-row__icon");
  if (iconName) icon.append(iconEl(iconName));
  else icon.append(el("span", "dot"));

  const text = el("span", "filter-row__label", label);

  const input = el("input", "switch__input");
  input.type = "checkbox";
  input.setAttribute("role", "switch");
  input.dataset.filterType = type;
  input.dataset.value = value;

  row.append(icon, text, input, el("span", "switch__track"));
  return row;
};

const buildControls = () => {
  // Sidebar: status + important
  filterStatusBox.append(
    buildSwitchRow({ type: "important", value: "important", label: "Important", tintAttr: "data-tint", tintValue: "star", iconName: "star" }),
    ...STATUSES.map((s) =>
      buildSwitchRow({ type: "status", value: s.id, label: s.label, tintAttr: "data-status", tintValue: s.id }),
    ),
  );

  // Sidebar: categories
  filterCategoryBox.append(
    ...CATEGORIES.map((c) =>
      buildSwitchRow({ type: "category", value: c.id, label: c.label, tintAttr: "data-cat", tintValue: c.id, iconName: c.icon }),
    ),
  );

  // Category chips under the week strip
  const allChip = el("button", "chip");
  allChip.type = "button";
  allChip.id = "cat_all";
  allChip.dataset.value = "all";
  allChip.dataset.tint = "ink";
  const chipIcon = el("span", "chip__icon");
  chipIcon.append(iconEl("all"));
  allChip.append(chipIcon, el("span", "chip__label", "All"), el("span", "chip__count"));
  chipsBox.append(allChip);

  for (const c of CATEGORIES) {
    const chip = el("button", "chip");
    chip.type = "button";
    chip.id = `cat_${c.id}`;
    chip.dataset.value = c.id;
    chip.dataset.cat = c.id;
    const ico = el("span", "chip__icon");
    ico.append(iconEl(c.icon));
    chip.append(ico, el("span", "chip__label", c.label), el("span", "chip__count"));
    chipsBox.append(chip);
  }

  // Status segmented control
  const allTab = el("button", "seg-btn");
  allTab.type = "button";
  allTab.id = "prog_all";
  allTab.dataset.value = "all";
  allTab.append(el("span", "", "All"), el("span", "seg-btn__count"));
  progressBox.append(allTab);
  for (const s of STATUSES) {
    const tab = el("button", "seg-btn");
    tab.type = "button";
    tab.id = `prog_${s.id}`;
    tab.dataset.value = s.id;
    tab.append(el("span", "", s.label), el("span", "seg-btn__count"));
    progressBox.append(tab);
  }
};

/* ---------- Rendering ---------- */
const renderSummary = () => {
  const open = tasks.filter((t) => t.status === "to-do").length;
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  const plural = (n) => (n === 1 ? "task" : "tasks");

  if (tasks.length === 0) {
    summaryEl.textContent = "Nothing planned yet. Add your first task to get started.";
  } else if (open === 0 && overdue === 0) {
    summaryEl.textContent = "You're all caught up.";
  } else if (overdue === 0) {
    summaryEl.textContent = `You have ${open} open ${plural(open)}.`;
  } else if (open === 0) {
    summaryEl.textContent = `You have ${overdue} overdue ${plural(overdue)}.`;
  } else {
    summaryEl.textContent = `You have ${open} open ${plural(open)} and ${overdue} overdue.`;
  }
};

const weekTitleText = () => {
  const end = addDays(weekStart, 6);
  if (weekStart.getMonth() === end.getMonth()) return fmtMonthYear(weekStart);
  const a = weekStart.toLocaleDateString("en-GB", { month: "short" });
  const b = end.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return `${a} – ${b}`;
};

const renderWeek = () => {
  weekTitle.textContent = weekTitleText();
  const counts = dateCounts();
  const today = todayISO();
  const buttons = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const iso = toISO(date);
    const count = counts.get(iso) || 0;

    const btn = el("button", "day");
    btn.type = "button";
    btn.dataset.date = iso;
    btn.classList.toggle("is-today", iso === today);
    btn.classList.toggle("is-selected", iso === activeFilters.date);
    btn.classList.toggle("has-tasks", count > 0);
    btn.setAttribute("aria-pressed", String(iso === activeFilters.date));
    btn.setAttribute("aria-label", `${fmtLong(date)}${count ? `, ${count} ${count === 1 ? "task" : "tasks"}` : ""}`);

    btn.append(
      el("span", "day__week", date.toLocaleDateString("en-GB", { weekday: "short" })),
      el("span", "day__num", String(date.getDate())),
      el("span", "day__dot"),
    );
    buttons.push(btn);
  }
  weekDays.replaceChildren(...buttons);
};

const renderChips = () => {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, tasks.filter((t) => t.category === c.id).length]));
  for (const chip of $$(".chip", chipsBox)) {
    const value = chip.dataset.value;
    const pressed = value === "all" ? activeFilters.categories.length === 0 : activeFilters.categories.includes(value);
    chip.setAttribute("aria-pressed", String(pressed));
    $(".chip__count", chip).textContent = value === "all" ? tasks.length : counts[value];
  }
};

const renderTabs = () => {
  for (const tab of $$(".seg-btn", progressBox)) {
    const value = tab.dataset.value;
    const pressed = value === "all" ? activeFilters.statuses.length === 0 : activeFilters.statuses.includes(value);
    tab.setAttribute("aria-pressed", String(pressed));
    $(".seg-btn__count", tab).textContent = value === "all" ? tasks.length : tasks.filter((t) => t.status === value).length;
  }
  impBtn.setAttribute("aria-pressed", String(activeFilters.important));
};

const syncSwitches = () => {
  for (const input of $$(".switch__input", sidebar)) {
    const { filterType, value } = input.dataset;
    input.checked =
      filterType === "important"
        ? activeFilters.important
        : filterType === "category"
          ? activeFilters.categories.includes(value)
          : activeFilters.statuses.includes(value);
  }
};

const createBadge = (text, onRemove) => {
  const badge = el("span", "badge");
  const remove = el("button");
  remove.type = "button";
  remove.setAttribute("aria-label", `Remove filter: ${text}`);
  remove.append(iconEl("close"));
  remove.addEventListener("click", onRemove);
  badge.append(el("span", "", text), remove);
  badgeContainer.append(badge);
};

const renderBadges = () => {
  badgeContainer.replaceChildren();
  const any =
    activeFilters.categories.length || activeFilters.statuses.length || activeFilters.important || activeFilters.date;
  badgeContainer.hidden = !any;
  if (!any) return;

  activeFilters.categories.forEach((id) => createBadge(getCategory(id).label, () => setFilter("category", id, false)));
  activeFilters.statuses.forEach((id) => createBadge(getStatus(id).label, () => setFilter("status", id, false)));
  if (activeFilters.important) createBadge("Important", () => setFilter("important", "important", false));
  if (activeFilters.date) {
    createBadge(fmtShort(fromISO(activeFilters.date)), () => {
      activeFilters.date = null;
      render();
    });
  }
};

const actionButton = (action, icon, label, extraClass = "") => {
  const btn = el("button", `icon-btn ${extraClass}`.trim());
  btn.type = "button";
  btn.dataset.action = action;
  btn.setAttribute("aria-label", label);
  btn.title = label.split(":")[0];
  btn.append(iconEl(icon));
  return btn;
};

const buildTaskItem = (task) => {
  const category = getCategory(task.category);
  const status = getStatus(task.status);
  const isDone = task.status === "done";

  const li = el("li", "task");
  li.dataset.taskId = task.id;
  li.classList.toggle("is-done", isDone);
  li.classList.toggle("just-done", task.id === justDoneId);

  const check = el("button", "task__check");
  check.type = "button";
  check.dataset.action = "toggle";
  check.setAttribute("aria-pressed", String(isDone));
  check.setAttribute("aria-label", `${isDone ? "Mark as to do" : "Mark as done"}: ${task.title}`);
  check.innerHTML = svg("check");

  const body = el("div", "task__body");
  const tags = el("div", "task__tags");
  const catTag = el("span", "tag");
  catTag.dataset.cat = category.id;
  catTag.append(iconEl(category.icon), document.createTextNode(category.label));
  const statusTag = el("span", "tag", status.label);
  statusTag.dataset.status = status.id;
  tags.append(catTag, statusTag);

  const title = el("h3", "task__title", task.title);

  const when = el("p", "task__when");
  const timeItem = el("span", "task__when-item");
  timeItem.append(iconEl("clock"), document.createTextNode(task.time || "All day"));
  const dateItem = el("span", `task__when-item${task.status === "overdue" ? " is-overdue" : ""}`);
  dateItem.append(iconEl("calendar"), document.createTextNode(formatTaskDate(task.date)));
  when.append(timeItem, dateItem);

  body.append(tags, title);
  if (task.description) body.append(el("p", "task__desc", task.description));
  body.append(when);

  const actions = el("div", "task__actions");
  const star = actionButton(
    "important",
    "star",
    `${task.isImportant ? "Remove from important" : "Mark as important"}: ${task.title}`,
    "star-btn",
  );
  star.setAttribute("aria-pressed", String(task.isImportant));
  actions.append(
    star,
    actionButton("edit", "edit", `Edit task: ${task.title}`),
    actionButton("delete", "trash", `Delete task: ${task.title}`, "icon-btn--danger"),
  );

  li.append(check, body, actions);
  return li;
};

const renderList = () => {
  const visible = getVisibleTasks();
  taskList.replaceChildren(...visible.map(buildTaskItem));
  justDoneId = null;

  const empty = visible.length === 0;
  preentered.hidden = !empty;
  if (empty) {
    const filtered = tasks.length > 0;
    emptyTitle.textContent = filtered ? "No tasks match these filters" : "No tasks yet";
    emptyText.textContent = filtered
      ? "Try a different filter or search term."
      : "Add your first task and it will show up here.";
    emptyAction.textContent = filtered ? "Clear filters" : "New task";
    emptyAction.dataset.action = filtered ? "reset" : "add";
  }

  const label = `${visible.length} ${visible.length === 1 ? "task" : "tasks"}`;
  listStatus.textContent = `${label} shown`;
  sidebarApply.textContent = visible.length ? `Show ${label}` : "Show tasks";
};

const renderDataButtons = () => {
  const doneCount = tasks.filter((t) => t.status === "done").length;
  clearDoneBtn.textContent = `Clear completed (${doneCount})`;
  clearDoneBtn.disabled = doneCount === 0;
  clearAllBtn.disabled = tasks.length === 0;
  exportBtn.disabled = tasks.length === 0;
};

const render = () => {
  renderSummary();
  renderWeek();
  renderChips();
  renderTabs();
  syncSwitches();
  renderBadges();
  renderList();
  renderDataButtons();
};

/* ---------- Dialog helpers ---------- */
const askConfirm = ({ title, text, okLabel = "Confirm" }) =>
  new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmText.textContent = text;
    confirmOk.textContent = okLabel;
    confirmModal.returnValue = "";
    confirmModal.addEventListener("close", () => resolve(confirmModal.returnValue === "ok"), { once: true });
    confirmModal.showModal();
  });

// Close buttons + clicking the dimmed backdrop
document.addEventListener("click", (e) => {
  const closer = e.target.closest("[data-close]");
  if (closer) closer.closest("dialog")?.close();
});
$$("dialog").forEach((dialog) => {
  let pressedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (e) => {
    pressedOnBackdrop = e.target === dialog;
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog && pressedOnBackdrop) dialog.close();
  });
});

/* ---------- Task form ---------- */
const showTitleError = (show) => {
  titleError.hidden = !show;
  if (show) titleInput.setAttribute("aria-invalid", "true");
  else titleInput.removeAttribute("aria-invalid");
};

const openTaskModal = (task = null) => {
  closeSidebar();
  editingTaskId = task ? task.id : null;
  taskForm.reset();
  showTitleError(false);

  titleInput.value = task ? task.title : "";
  descInput.value = task ? task.description : "";
  categorySelect.value = task ? task.category : "home";
  statusSelect.value = task ? task.status : "to-do";
  dateInput.value = task ? task.date : activeFilters.date || todayISO();
  timeInput.value = task ? task.time : "";
  impCheck.checked = task ? task.isImportant : false;

  addModalTitle.textContent = task ? "Edit task" : "New task";
  addTaskButton.textContent = task ? "Save changes" : "Add task";
  addTaskModal.showModal();
  titleInput.focus();
};

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    showTitleError(true);
    titleInput.focus();
    return;
  }

  const data = {
    title,
    description: descInput.value.trim(),
    category: categorySelect.value,
    status: statusSelect.value,
    isImportant: impCheck.checked,
    time: timeInput.value,
    date: dateInput.value,
  };

  if (editingTaskId) {
    const task = tasks.find((t) => t.id === editingTaskId);
    if (!task) return;
    Object.assign(task, data);
  } else {
    tasks.push({ id: makeId(), ...data });
  }

  saveTasks();
  addTaskModal.close();
  render();
});

titleInput.addEventListener("input", () => {
  if (titleInput.value.trim()) showTitleError(false);
});
addTaskModal.addEventListener("close", () => {
  editingTaskId = null;
});

/* ---------- Task list actions (event delegation) ---------- */
const focusTaskControl = (id, action) => {
  const li = taskList.querySelector(`[data-task-id="${CSS.escape(id)}"]`);
  li?.querySelector(`[data-action="${action}"]`)?.focus();
};

taskList.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const li = btn.closest(".task");
  const task = tasks.find((t) => t.id === li?.dataset.taskId);
  if (!task) return;

  switch (btn.dataset.action) {
    case "toggle":
      task.status = task.status === "done" ? "to-do" : "done";
      justDoneId = task.status === "done" ? task.id : null;
      saveTasks();
      render();
      focusTaskControl(task.id, "toggle");
      break;
    case "important":
      task.isImportant = !task.isImportant;
      saveTasks();
      render();
      focusTaskControl(task.id, "important");
      break;
    case "edit":
      openTaskModal(task);
      break;
    case "delete": {
      const ok = await askConfirm({
        title: "Delete this task?",
        text: `"${task.title}" will be removed. This can't be undone.`,
        okLabel: "Delete",
      });
      if (ok) {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();
        render();
      }
      break;
    }
  }
});

emptyAction.addEventListener("click", () => {
  if (emptyAction.dataset.action === "reset") resetFilters();
  else openTaskModal();
});

/* ---------- Filters: sidebar, chips, tabs, search ---------- */
sidebar.addEventListener("change", (e) => {
  const input = e.target.closest(".switch__input");
  if (input) setFilter(input.dataset.filterType, input.dataset.value, input.checked);
});

chipsBox.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const value = chip.dataset.value;
  if (value === "all") {
    activeFilters.categories = [];
    render();
  } else {
    setFilter("category", value, !activeFilters.categories.includes(value));
  }
});

progressBox.addEventListener("click", (e) => {
  const tab = e.target.closest(".seg-btn");
  if (!tab) return;
  const value = tab.dataset.value;
  activeFilters.statuses = value === "all" ? [] : [value];
  render();
});
impBtn.addEventListener("click", () => setFilter("important", "important", !activeFilters.important));

searchInput.addEventListener("input", () => {
  activeFilters.search = searchInput.value;
  render();
});
resetBtn.addEventListener("click", resetFilters);

/* ---------- Week strip ---------- */
weekDays.addEventListener("click", (e) => {
  const day = e.target.closest(".day");
  if (!day) return;
  activeFilters.date = activeFilters.date === day.dataset.date ? null : day.dataset.date;
  render();
});
preWeekBtn.addEventListener("click", () => {
  weekStart = addDays(weekStart, -7);
  renderWeek();
});
nextWeekBtn.addEventListener("click", () => {
  weekStart = addDays(weekStart, 7);
  renderWeek();
});
weekTodayBtn.addEventListener("click", () => {
  weekStart = startOfWeek(new Date());
  activeFilters.date = todayISO();
  render();
});

/* ---------- Calendar dialog ---------- */
const renderCalendar = () => {
  calTitle.textContent = fmtMonthYear(calMonth);
  const counts = dateCounts();
  const today = todayISO();
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const nodes = [];

  for (const dow of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) nodes.push(el("span", "cal__dow", dow));
  for (let i = 0; i < new Date(year, month, 1).getDay(); i++) nodes.push(el("span"));

  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month, d);
    const iso = toISO(date);
    const count = counts.get(iso) || 0;
    const btn = el("button", "cal__day", String(d));
    btn.type = "button";
    btn.dataset.date = iso;
    btn.classList.toggle("is-today", iso === today);
    btn.classList.toggle("is-selected", iso === activeFilters.date);
    btn.classList.toggle("has-tasks", count > 0);
    btn.setAttribute("aria-pressed", String(iso === activeFilters.date));
    btn.setAttribute("aria-label", `${fmtLong(date)}${count ? `, ${count} ${count === 1 ? "task" : "tasks"}` : ""}`);
    nodes.push(btn);
  }
  calGrid.replaceChildren(...nodes);
};

const selectDate = (iso) => {
  activeFilters.date = iso;
  if (iso) weekStart = startOfWeek(fromISO(iso));
  calendarModal.close();
  render();
};

calendarBtn.addEventListener("click", () => {
  closeSidebar();
  const base = activeFilters.date ? fromISO(activeFilters.date) : new Date();
  calMonth = new Date(base.getFullYear(), base.getMonth(), 1);
  renderCalendar();
  calendarModal.showModal();
});
$("#cal-prev").addEventListener("click", () => {
  calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1);
  renderCalendar();
});
$("#cal-next").addEventListener("click", () => {
  calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1);
  renderCalendar();
});
$("#cal-today").addEventListener("click", () => {
  weekStart = startOfWeek(new Date());
  selectDate(todayISO());
});
$("#cal-clear").addEventListener("click", () => selectDate(null));
calGrid.addEventListener("click", (e) => {
  const day = e.target.closest(".cal__day");
  if (day) selectDate(day.dataset.date);
});

/* ---------- Settings dialog ---------- */
const openSettings = () => {
  closeSidebar();
  nameInput.value = settings.name;
  avatarError.hidden = true;
  const radio = $(`input[name="theme"][value="${settings.theme}"]`);
  if (radio) radio.checked = true;
  renderDataButtons();
  settingModal.showModal();
};
settingBtn.addEventListener("click", openSettings);

nameInput.addEventListener("input", () => {
  settings.name = nameInput.value.trim();
  saveSettings();
  renderProfile();
});

$$('input[name="theme"]').forEach((radio) =>
  radio.addEventListener("change", () => {
    settings.theme = radio.value;
    saveSettings();
    applyTheme();
  }),
);

avatarPick.addEventListener("click", () => avatarInput.click());
avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files[0];
  avatarInput.value = "";
  if (!file) return;
  try {
    settings.avatar = await resizeImage(file);
    avatarError.hidden = true;
    saveSettings();
    renderProfile();
  } catch {
    avatarError.hidden = false;
  }
});
avatarRemove.addEventListener("click", () => {
  settings.avatar = "";
  saveSettings();
  renderProfile();
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = el("a");
  link.href = url;
  link.download = `tick-task-${todayISO()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

clearDoneBtn.addEventListener("click", async () => {
  const count = tasks.filter((t) => t.status === "done").length;
  const ok = await askConfirm({
    title: "Clear completed tasks?",
    text: `${count} completed ${count === 1 ? "task" : "tasks"} will be removed. This can't be undone.`,
    okLabel: "Clear",
  });
  if (ok) {
    tasks = tasks.filter((t) => t.status !== "done");
    saveTasks();
    render();
  }
});

clearAllBtn.addEventListener("click", async () => {
  const ok = await askConfirm({
    title: "Delete all tasks?",
    text: `All ${tasks.length} tasks will be removed. This can't be undone.`,
    okLabel: "Delete all",
  });
  if (ok) {
    tasks = [];
    saveTasks();
    render();
  }
});

/* ---------- Mobile drawer ---------- */
const mobileQuery = window.matchMedia("(max-width: 900px)");
let sidebarOpen = false;

const syncSidebarInert = () => {
  // On small screens the closed drawer must not be reachable with Tab
  sidebar.inert = mobileQuery.matches && !sidebarOpen;
};
function setSidebar(open) {
  sidebarOpen = open;
  document.body.classList.toggle("sidebar-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  syncSidebarInert();
  if (open) searchInput.focus();
}
function closeSidebar() {
  if (sidebarOpen) setSidebar(false);
}
menuBtn.addEventListener("click", () => setSidebar(true));
sidebarClose.addEventListener("click", () => {
  setSidebar(false);
  menuBtn.focus();
});
sidebarApply.addEventListener("click", () => {
  setSidebar(false);
  menuBtn.focus();
});
scrim.addEventListener("click", () => setSidebar(false));
mobileQuery.addEventListener("change", () => {
  if (!mobileQuery.matches) setSidebar(false);
  syncSidebarInert();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebarOpen && !$("dialog[open]")) {
    setSidebar(false);
    menuBtn.focus();
  }
});

addTaskBtn.addEventListener("click", () => openTaskModal());

/* ---------- Init ---------- */
const hydrateStaticIcons = () => {
  $$("[data-icon]").forEach((node) => {
    if (!node.firstElementChild) node.innerHTML = svg(node.dataset.icon);
  });
};

hydrateStaticIcons();
buildControls();
applyTheme();
renderProfile();
syncSidebarInert();
render();
