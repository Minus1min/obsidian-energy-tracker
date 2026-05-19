/* 30日能量记录 Obsidian Plugin */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => EnergyTrackerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var VIEW_TYPE = "energy-tracker";
var DAYS = 30;
var LEVEL_COLORS = ["#FDFCF8", "#CFC3E5", "#BBE38D", "#FFEB95", "#FFC0C4"];
var LEVEL_IS_CLEAR = [true, false, false, false, false];
var SLOT_IDS = ["dawn", "morning", "noon", "afternoon", "evening", "night"];
var ACT_STYLE = [
  { id: "gen", btnBg: "#FFFFFF", btnFg: "#444444", btnBorder: "1.5px solid #D0D0D0", tagBg: "#FAFAFA", tagFg: "#444444", tagBorder: "1px solid #DCDCDC", dotBg: "#FFFFFF", summaryClass: "et-col-gen" },
  { id: "neu", btnBg: "#CECECE", btnFg: "#444444", btnBorder: "1.5px solid #B8B8B8", tagBg: "#E8E8E8", tagFg: "#555555", tagBorder: "none", dotBg: "#A0A0A0", summaryClass: "et-col-neu" },
  { id: "drain", btnBg: "#1A1A1A", btnFg: "#EEEEEE", btnBorder: "1.5px solid #000", tagBg: "#1A1A1A", tagFg: "#EEEEEE", tagBorder: "none", dotBg: "#333333", summaryClass: "et-col-drain" }
];
var DEFAULT_SLOT_TIMES = [
  { start: 8, end: 10 },
  { start: 10, end: 12 },
  { start: 12, end: 14 },
  { start: 14, end: 18 },
  { start: 18, end: 21 },
  { start: 21, end: 24 }
];
var ZH = {
  viewTitle: "30\u65E5\u80FD\u91CF\u8BB0\u5F55\u5B9E\u9A8C",
  subtitle: "\u6570\u636E\u4FDD\u5B58\u5728 Obsidian Vault \xB7 \u5173\u95ED\u91CD\u5F00\u4E0D\u4E22\u5931",
  btnExport: "\u5BFC\u51FA\u6570\u636E",
  btnClear: "\u4E00\u952E\u6E05\u7A7A",
  clearConfirm: "\u786E\u5B9A\u6E05\u7A7A\u6240\u6709\u80FD\u91CF\u8BB0\u5F55\u548C\u6D3B\u52A8\u6570\u636E\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
  startDate: "\u8D77\u59CB\u65E5\u671F",
  levelNames: ["\u6E05\u9664", "\u4F4E\u8FF7", "\u5E73\u7A33", "\u6D3B\u8DC3", "\u5DC5\u5CF0"],
  slots: [
    { label: "\u6E05\u6668" },
    { label: "\u4E0A\u5348" },
    { label: "\u5348\u95F4" },
    { label: "\u4E0B\u5348" },
    { label: "\u508D\u665A" },
    { label: "\u591C\u95F4" }
  ],
  actLabels: ["\u5145\u80FD", "\u4E2D\u6027", "\u8017\u80FD"],
  actSymbols: ["\u2191", "\u2013", "\u2193"],
  statsTitle: "\u5404\u65F6\u6BB5\u80FD\u91CF\u5747\u503C",
  actSummaryTitle: "\u6D3B\u52A8\u6C47\u603B",
  actColHeaders: ["\u2191 \u5145\u80FD\u6D3B\u52A8", "\u2013 \u4E2D\u6027\u6D3B\u52A8", "\u2193 \u8017\u80FD\u6D3B\u52A8"],
  actSectionTitle: "\u6D3B\u52A8\u8BB0\u5F55",
  actPlaceholder: "\u8F93\u5165\u6D3B\u52A8\u2026",
  actEmpty: "\u6682\u65E0\u8BB0\u5F55",
  weekdays: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  popupLabel: (day, slot, m, d) => `\u7B2C ${day} \u5929 \xB7 ${slot}\uFF08${m}\u6708${d}\u65E5\uFF09`,
  exportFilename: (s, e) => `\u80FD\u91CF\u8BB0\u5F55_${s}_${e}.txt`,
  exportCsvHeader: "\u65E5\u671F,\u65F6\u6BB5,\u65F6\u95F4\u8303\u56F4,\u80FD\u91CF\u6C34\u5E73,\u6D3B\u52A8\u8BB0\u5F55",
  exportActStr: (type, text) => `[${type}]${text}`,
  exportContent: (s, e, rows) => `\u3010\u80FD\u91CF\u5206\u6790\u8BF7\u6C42\u3011

\u4EE5\u4E0B\u662F\u6211 ${s} \u81F3 ${e} \u7684\u80FD\u91CF\u8FFD\u8E2A\u6570\u636E\u3002
\u80FD\u91CF\u6C34\u5E73\uFF1A\u4F4E\u8FF7=1 / \u5E73\u7A33=2 / \u6D3B\u8DC3=3 / \u5DC5\u5CF0=4
\u6D3B\u52A8\u5206\u4E09\u7C7B\uFF1A\u5145\u80FD\uFF08\u63D0\u5347\u80FD\u91CF\uFF09\u3001\u4E2D\u6027\uFF08\u4E0D\u5F71\u54CD\uFF09\u3001\u8017\u80FD\uFF08\u964D\u4F4E\u80FD\u91CF\uFF09

\u8BF7\u5E2E\u6211\u5206\u6790\uFF1A
1. \u54EA\u4E9B\u6D3B\u52A8\u5BF9\u6211\u7684\u80FD\u91CF\u5F71\u54CD\u6700\u663E\u8457\uFF1F
2. \u6211\u7684\u80FD\u91CF\u5728\u4E00\u5929\u4E2D\u5982\u4F55\u6CE2\u52A8\uFF1F\u54EA\u4E9B\u65F6\u6BB5\u9002\u5408\u9AD8\u5F3A\u5EA6\u5DE5\u4F5C\uFF1F
3. \u6839\u636E\u80FD\u91CF\u8282\u5F8B\uFF0C\u5982\u4F55\u91CD\u65B0\u5B89\u6392\u5DE5\u4F5C\u3001\u5B66\u4E60\u548C\u4F11\u606F\uFF1F
4. \u6709\u54EA\u4E9B\u503C\u5F97\u6CE8\u610F\u7684\u6A21\u5F0F\u6216\u7ACB\u523B\u53EF\u4EE5\u5C1D\u8BD5\u7684\u4F18\u5316\u5EFA\u8BAE\uFF1F

\u3010\u6570\u636E\u3011
${rows}
`,
  settingsHeading: "30\u65E5\u80FD\u91CF\u8BB0\u5F55 \xB7 \u8BBE\u7F6E",
  settingsLangName: "\u663E\u793A\u8BED\u8A00",
  settingsLangDesc: "\u5207\u6362\u63D2\u4EF6\u754C\u9762\u8BED\u8A00\uFF08\u5207\u6362\u540E\u81EA\u52A8\u5237\u65B0\uFF09",
  settingsTimesHeading: "\u65F6\u6BB5\u65F6\u95F4\u8BBE\u7F6E",
  settingsTimesDesc: "\u81EA\u5B9A\u4E49\u6BCF\u4E2A\u65F6\u6BB5\u7684\u8D77\u6B62\u65F6\u95F4\uFF0824\u5C0F\u65F6\u6574\u70B9\uFF0C0\u201324\uFF09",
  settingsTimesStart: "\u5F00\u59CB",
  settingsTimesEnd: "\u7ED3\u675F",
  settingsTimesReset: "\u6062\u590D\u9ED8\u8BA4",
  settingsTimesError: "\u8BF7\u8F93\u5165\u6709\u6548\u6574\u70B9\u65F6\u95F4\uFF08\u5F00\u59CB 0\u201323\uFF0C\u7ED3\u675F 1\u201324\uFF0C\u4E14\u7ED3\u675F\u987B\u5927\u4E8E\u5F00\u59CB\uFF09"
};
var EN = {
  viewTitle: "30-Day Energy Log",
  subtitle: "Data saved in your Obsidian Vault \xB7 Persists across restarts",
  btnExport: "Export",
  btnClear: "Clear All",
  clearConfirm: "Clear all energy records and activity data? This cannot be undone.",
  startDate: "Start date",
  levelNames: ["Clear", "Low", "Steady", "Active", "Peak"],
  slots: [
    { label: "Dawn" },
    { label: "Morning" },
    { label: "Noon" },
    { label: "Afternoon" },
    { label: "Evening" },
    { label: "Night" }
  ],
  actLabels: ["Energize", "Neutral", "Drain"],
  actSymbols: ["\u2191", "\u2013", "\u2193"],
  statsTitle: "Average Energy by Slot",
  actSummaryTitle: "Activity Summary",
  actColHeaders: ["\u2191 Energizing", "\u2013 Neutral", "\u2193 Draining"],
  actSectionTitle: "Activities",
  actPlaceholder: "Enter activity\u2026",
  actEmpty: "No records yet",
  weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  popupLabel: (day, slot, m, d) => `Day ${day} \xB7 ${slot} (${m}/${d})`,
  exportFilename: (s, e) => `energy-log_${s}_${e}.txt`,
  exportCsvHeader: "Date,Slot,Time Range,Energy Level,Activities",
  exportActStr: (type, text) => `[${type}]${text}`,
  exportContent: (s, e, rows) => `[Energy Analysis Request]

Below is my energy tracking data from ${s} to ${e}.
Energy level: Low=1 / Steady=2 / Active=3 / Peak=4
Activity types: Energizing (boosts energy) / Neutral (no effect) / Draining (lowers energy)

Please help me analyze:
1. Which activities have the most significant impact on my energy?
2. How does my energy fluctuate throughout the day? Which slots suit high-intensity work?
3. Based on my energy rhythm, how should I rearrange work, study, and rest?
4. What patterns are worth noting, and what can I try immediately?

[Data]
${rows}
`,
  settingsHeading: "30-Day Energy Log \xB7 Settings",
  settingsLangName: "Language / \u8BED\u8A00",
  settingsLangDesc: "Switch the plugin UI language (applies immediately)",
  settingsTimesHeading: "Time Slot Configuration",
  settingsTimesDesc: "Customize the start and end hour of each slot (24-hour, 0\u201324)",
  settingsTimesStart: "Start",
  settingsTimesEnd: "End",
  settingsTimesReset: "Reset to defaults",
  settingsTimesError: "Please enter valid hours (start 0\u201323, end 1\u201324, end must be after start)"
};
var TRANSLATIONS = { zh: ZH, en: EN };
var DEFAULT_DATA = {
  language: "zh",
  startDate: "",
  slotTimes: DEFAULT_SLOT_TIMES.map((t) => __spreadValues({}, t)),
  cells: {},
  activities: {}
};
var EnergyTrackerView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.startDate = new Date();
    this.active = null;
    this.popup = null;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return this.tr.viewTitle;
  }
  getIcon() {
    return "zap";
  }
  get tr() {
    var _a;
    return (_a = TRANSLATIONS[this.plugin.pluginData.language]) != null ? _a : ZH;
  }
  slotTime(si) {
    var _a, _b;
    const t = (_b = (_a = this.plugin.pluginData.slotTimes) == null ? void 0 : _a[si]) != null ? _b : DEFAULT_SLOT_TIMES[si];
    return `${t.start}\u2013${t.end}`;
  }
  onOpen() {
    return __async(this, null, function* () {
      const saved = this.plugin.pluginData.startDate;
      if (saved) {
        this.startDate = new Date(saved + "T00:00:00");
      } else {
        this.startDate = new Date();
        this.startDate.setHours(0, 0, 0, 0);
        this.plugin.pluginData.startDate = this.toISO(this.startDate);
        yield this.plugin.savePluginData();
      }
      this.render();
    });
  }
  onClose() {
    return __async(this, null, function* () {
      if (this.popup) {
        this.popup.remove();
        this.popup = null;
      }
    });
  }
  refresh() {
    this.render();
  }
  // ── Helpers ────────────────────────────────────────────────────────────────
  toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  dateOfDay(n) {
    const d = new Date(this.startDate);
    d.setDate(d.getDate() + n - 1);
    return d;
  }
  dateStr(n) {
    return this.toISO(this.dateOfDay(n));
  }
  cellKey(n, sid) {
    return `${this.dateStr(n)}_${sid}`;
  }
  getLevel(n, sid) {
    return this.plugin.pluginData.cells[this.cellKey(n, sid)] || 0;
  }
  storeLevel(n, sid, v) {
    return __async(this, null, function* () {
      this.plugin.pluginData.cells[this.cellKey(n, sid)] = v;
      yield this.plugin.savePluginData();
    });
  }
  getActs(n, sid) {
    return this.plugin.pluginData.activities[this.cellKey(n, sid)] || [];
  }
  storeActs(n, sid, acts) {
    return __async(this, null, function* () {
      this.plugin.pluginData.activities[this.cellKey(n, sid)] = acts;
      yield this.plugin.savePluginData();
    });
  }
  todayIdx() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const diff = Math.round((t.getTime() - this.startDate.getTime()) / 864e5) + 1;
    return diff >= 1 && diff <= DAYS ? diff : -1;
  }
  // ── Render ─────────────────────────────────────────────────────────────────
  render() {
    const tr = this.tr;
    const root = this.contentEl;
    root.empty();
    root.addClass("et-root");
    const topActions = root.createDiv({ cls: "et-top-actions" });
    const btnExport = topActions.createEl("button", { cls: "et-top-btn", text: tr.btnExport });
    const btnClear = topActions.createEl("button", { cls: "et-top-btn et-danger", text: tr.btnClear });
    const header = root.createDiv({ cls: "et-header" });
    header.createDiv({ cls: "et-title", text: tr.viewTitle });
    header.createDiv({ cls: "et-subtitle", text: tr.subtitle });
    const content = root.createDiv({ cls: "et-content" });
    const headerRow = content.createDiv({ cls: "et-grid-header-row" });
    const dateRow = headerRow.createDiv({ cls: "et-date-row" });
    dateRow.createSpan({ text: tr.startDate });
    const startInput = dateRow.createEl("input");
    startInput.type = "date";
    startInput.value = this.toISO(this.startDate);
    const legend = headerRow.createDiv({ cls: "et-legend" });
    LEVEL_COLORS.slice(1).forEach((color, i) => {
      const item = legend.createDiv({ cls: "et-legend-item" });
      const sw = item.createDiv({ cls: "et-legend-swatch" });
      sw.style.background = color;
      item.createSpan({ text: tr.levelNames[i + 1] });
    });
    const grid = content.createDiv({ cls: "et-grid" });
    const statsSection = content.createDiv({ cls: "et-stats" });
    statsSection.createDiv({ cls: "et-stats-title", text: tr.statsTitle });
    const statsChart = statsSection.createDiv({ cls: "et-stats-chart" });
    const actSummary = content.createDiv({ cls: "et-act-summary" });
    actSummary.createDiv({ cls: "et-act-summary-title", text: tr.actSummaryTitle });
    const actSummaryCols = actSummary.createDiv({ cls: "et-act-summary-cols" });
    const popup = root.createDiv({ cls: "et-popup" });
    const popLabel = popup.createDiv({ cls: "et-popup-label" });
    const popSw = popup.createDiv({ cls: "et-popup-swatches" });
    const popAct = popup.createDiv();
    this.popup = popup;
    startInput.addEventListener("change", (e) => __async(this, null, function* () {
      const val = e.target.value;
      if (!val)
        return;
      this.startDate = new Date(val + "T00:00:00");
      this.plugin.pluginData.startDate = val;
      yield this.plugin.savePluginData();
      this.buildGrid(grid, statsChart, actSummaryCols, popup, popLabel, popSw, popAct);
    }));
    root.addEventListener("click", (e) => {
      if (popup.classList.contains("et-popup-on") && !popup.contains(e.target))
        this.closePopup(popup, popAct);
    });
    btnExport.addEventListener("click", () => this.doExport());
    btnClear.addEventListener("click", () => __async(this, null, function* () {
      if (!confirm(tr.clearConfirm))
        return;
      this.plugin.pluginData.cells = {};
      this.plugin.pluginData.activities = {};
      yield this.plugin.savePluginData();
      this.closePopup(popup, popAct);
      this.buildGrid(grid, statsChart, actSummaryCols, popup, popLabel, popSw, popAct);
    }));
    this.buildGrid(grid, statsChart, actSummaryCols, popup, popLabel, popSw, popAct);
  }
  // ── Grid ───────────────────────────────────────────────────────────────────
  buildGrid(grid, statsChart, actSummaryCols, popup, popLabel, popSw, popAct) {
    const tr = this.tr;
    grid.empty();
    const ti = this.todayIdx();
    grid.createDiv();
    for (let d = 1; d <= DAYS; d++)
      grid.createDiv({ cls: "et-col-header" + (d === ti ? " et-is-today" : ""), text: String(d) });
    grid.createDiv();
    for (let d = 1; d <= DAYS; d++) {
      const dow = this.dateOfDay(d).getDay();
      grid.createDiv({
        cls: "et-col-header et-col-weekday" + (dow === 0 || dow === 6 ? " et-is-weekend" : "") + (d === ti ? " et-is-today" : ""),
        text: tr.weekdays[dow]
      });
    }
    SLOT_IDS.forEach((sid, si) => {
      const rh = grid.createDiv({ cls: "et-row-header" });
      rh.createSpan({ cls: "et-slot-name", text: tr.slots[si].label });
      rh.createSpan({ cls: "et-slot-time", text: this.slotTime(si) });
      for (let d = 1; d <= DAYS; d++) {
        const v = this.getLevel(d, sid);
        const acts = this.getActs(d, sid);
        const cell = grid.createDiv({ cls: "et-cell" + (v > 0 ? " et-filled" : "") });
        cell.style.background = LEVEL_COLORS[v];
        if (acts.length)
          this.renderDots(cell, acts);
        cell.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onCell(cell, d, si, sid, popup, popLabel, popSw, popAct, statsChart, actSummaryCols);
        });
      }
    });
    this.buildStats(statsChart);
    this.buildActivitySummary(actSummaryCols);
  }
  // ── Dots ───────────────────────────────────────────────────────────────────
  renderDots(cell, acts) {
    let dotsEl = cell.querySelector(".et-cell-dots");
    if (!dotsEl)
      dotsEl = cell.createDiv({ cls: "et-cell-dots" });
    dotsEl.empty();
    ACT_STYLE.forEach((t) => {
      if (acts.some((a) => a.type === t.id)) {
        const dot = dotsEl.createDiv({ cls: "et-cell-dot" });
        dot.style.background = t.dotBg;
        if (t.dotBorder !== "none")
          dot.style.boxShadow = "0 0 0 1px #C0C0C0";
      }
    });
  }
  // ── Popup ──────────────────────────────────────────────────────────────────
  onCell(cell, day, slotIdx, sid, popup, popLabel, popSw, popAct, statsChart, actSummaryCols) {
    const tr = this.tr;
    const curV = this.getLevel(day, sid);
    const date = this.dateOfDay(day);
    this.active = { cell, day, sid };
    popLabel.textContent = tr.popupLabel(day, tr.slots[slotIdx].label, date.getMonth() + 1, date.getDate());
    popSw.empty();
    LEVEL_COLORS.forEach((color, vi) => {
      const item = popSw.createDiv({ cls: "et-pop-item" });
      const s = item.createDiv({
        cls: "et-pop-swatch" + (LEVEL_IS_CLEAR[vi] ? " et-is-clear" : "") + (vi === curV ? " et-is-selected" : "")
      });
      s.style.background = color;
      s.addEventListener("click", (e2) => __async(this, null, function* () {
        e2.stopPropagation();
        yield this.pick(vi, statsChart, popup, popAct);
      }));
      item.createDiv({ cls: "et-pop-name", text: tr.levelNames[vi] });
    });
    this.buildActSection(day, sid, popAct, popup, actSummaryCols);
    this.positionPopup(popup, cell);
  }
  buildActSection(day, sid, section, popup, actSummaryCols) {
    const tr = this.tr;
    section.empty();
    section.createEl("hr", { cls: "et-act-divider" });
    section.createDiv({ cls: "et-act-section-title", text: tr.actSectionTitle });
    const inputRow = section.createDiv({ cls: "et-act-input-row" });
    const input = inputRow.createEl("input");
    input.className = "et-act-input";
    input.placeholder = tr.actPlaceholder;
    input.addEventListener("click", (e) => e.stopPropagation());
    const btns = inputRow.createDiv({ cls: "et-act-type-btns" });
    ACT_STYLE.forEach((t, ti) => {
      const btn = btns.createEl("button", { cls: "et-act-type-btn", text: tr.actSymbols[ti] + tr.actLabels[ti] });
      btn.style.background = t.btnBg;
      btn.style.color = t.btnFg;
      btn.style.border = t.btnBorder;
      btn.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        const text = input.value.trim();
        if (!text) {
          input.focus();
          return;
        }
        yield this.addAct(day, sid, text, t.id, popup, actSummaryCols);
        input.value = "";
        input.focus();
      }));
    });
    input.addEventListener("keydown", (e) => __async(this, null, function* () {
      if (e.key !== "Enter")
        return;
      e.stopPropagation();
      const text = input.value.trim();
      if (!text)
        return;
      yield this.addAct(day, sid, text, "neu", popup, actSummaryCols);
      input.value = "";
    }));
    const listEl = section.createDiv({ cls: "et-act-list" });
    this.renderActList(day, sid, listEl, popup, actSummaryCols);
  }
  renderActList(day, sid, listEl, popup, actSummaryCols) {
    const tr = this.tr;
    const acts = this.getActs(day, sid);
    listEl.empty();
    if (!acts.length) {
      listEl.createDiv({ cls: "et-act-empty", text: tr.actEmpty });
      return;
    }
    acts.forEach((act, idx) => {
      const ti = ACT_STYLE.findIndex((x) => x.id === act.type);
      const tIdx = ti >= 0 ? ti : 1;
      const t = ACT_STYLE[tIdx];
      const item = listEl.createDiv({ cls: "et-act-item" });
      const tag = item.createSpan({ cls: "et-act-tag", text: tr.actSymbols[tIdx] + tr.actLabels[tIdx] });
      tag.style.background = t.tagBg;
      tag.style.color = t.tagFg;
      if (t.tagBorder !== "none")
        tag.style.border = t.tagBorder;
      item.createSpan({ cls: "et-act-text", text: act.text });
      const del = item.createEl("button", { cls: "et-act-del", text: "\xD7" });
      del.addEventListener("click", (e) => __async(this, null, function* () {
        e.stopPropagation();
        yield this.removeAct(day, sid, idx, popup, actSummaryCols);
      }));
    });
  }
  addAct(day, sid, text, type, popup, actSummaryCols) {
    return __async(this, null, function* () {
      const acts = this.getActs(day, sid);
      acts.push({ text, type });
      yield this.storeActs(day, sid, acts);
      const listEl = popup.querySelector(".et-act-list");
      if (listEl)
        this.renderActList(day, sid, listEl, popup, actSummaryCols);
      if (this.active) {
        this.renderDots(this.active.cell, acts);
        this.positionPopup(popup, this.active.cell);
      }
      this.buildActivitySummary(actSummaryCols);
    });
  }
  removeAct(day, sid, idx, popup, actSummaryCols) {
    return __async(this, null, function* () {
      const acts = this.getActs(day, sid);
      acts.splice(idx, 1);
      yield this.storeActs(day, sid, acts);
      const listEl = popup.querySelector(".et-act-list");
      if (listEl)
        this.renderActList(day, sid, listEl, popup, actSummaryCols);
      if (this.active) {
        this.renderDots(this.active.cell, acts);
        this.positionPopup(popup, this.active.cell);
      }
      this.buildActivitySummary(actSummaryCols);
    });
  }
  positionPopup(popup, cell) {
    popup.style.visibility = "hidden";
    popup.classList.add("et-popup-on");
    const pw = popup.offsetWidth, ph = popup.offsetHeight;
    const r = cell.getBoundingClientRect();
    let left = r.left + r.width / 2 - pw / 2;
    let top = r.bottom + 10;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    if (top + ph > window.innerHeight - 8)
      top = r.top - ph - 10;
    popup.style.left = left + "px";
    popup.style.top = Math.max(8, top) + "px";
    popup.style.visibility = "";
  }
  pick(v, statsChart, popup, popAct) {
    return __async(this, null, function* () {
      if (!this.active)
        return;
      const { cell, day, sid } = this.active;
      yield this.storeLevel(day, sid, v);
      cell.style.background = LEVEL_COLORS[v];
      cell.className = "et-cell" + (v > 0 ? " et-filled" : "");
      this.renderDots(cell, this.getActs(day, sid));
      this.closePopup(popup, popAct);
      this.buildStats(statsChart);
    });
  }
  closePopup(popup, popAct) {
    popup.classList.remove("et-popup-on");
    popAct.empty();
    this.active = null;
  }
  // ── Stats ──────────────────────────────────────────────────────────────────
  buildStats(chart) {
    const tr = this.tr;
    chart.empty();
    SLOT_IDS.forEach((sid, si) => {
      let total = 0, count = 0;
      for (let d = 1; d <= DAYS; d++) {
        const v = this.getLevel(d, sid);
        if (v > 0) {
          total += v;
          count++;
        }
      }
      const avg = count ? total / count : 0;
      const color = count ? LEVEL_COLORS[Math.min(4, Math.max(1, Math.round(avg)))] : "#eee8df";
      const col = chart.createDiv({ cls: "et-bar-col" });
      col.createDiv({ cls: "et-bar-val", text: count ? avg.toFixed(1) : "\xB7" });
      const track = col.createDiv({ cls: "et-bar-track" });
      const fill = track.createDiv({ cls: "et-bar-fill" });
      fill.style.height = (avg / 4 * 100).toFixed(1) + "%";
      fill.style.background = color;
      col.createDiv({ cls: "et-bar-name", text: tr.slots[si].label });
      col.createDiv({ cls: "et-bar-time", text: this.slotTime(si) });
    });
  }
  // ── Activity summary ───────────────────────────────────────────────────────
  buildActivitySummary(container) {
    const tr = this.tr;
    container.empty();
    const byType = { gen: /* @__PURE__ */ new Set(), neu: /* @__PURE__ */ new Set(), drain: /* @__PURE__ */ new Set() };
    for (let d = 1; d <= DAYS; d++)
      SLOT_IDS.forEach((sid) => this.getActs(d, sid).forEach((a) => {
        var _a;
        return (_a = byType[a.type]) == null ? void 0 : _a.add(a.text);
      }));
    ACT_STYLE.forEach((t, ti) => {
      const col = container.createDiv({ cls: `et-act-summary-col ${t.summaryClass}` });
      col.createDiv({ cls: "et-act-summary-col-header", text: tr.actColHeaders[ti] });
      const pills = col.createDiv({ cls: "et-act-summary-pills" });
      const items = [...byType[t.id]];
      if (!items.length)
        pills.createSpan({ cls: "et-act-summary-empty", text: tr.actEmpty });
      else
        items.forEach((text) => pills.createSpan({ cls: "et-act-pill", text }));
    });
  }
  // ── Export ─────────────────────────────────────────────────────────────────
  doExport() {
    const tr = this.tr;
    const startISO = this.toISO(this.startDate);
    const endISO = this.toISO(this.dateOfDay(DAYS));
    const rows = [tr.exportCsvHeader];
    for (let d = 1; d <= DAYS; d++) {
      SLOT_IDS.forEach((sid, si) => {
        const v = this.getLevel(d, sid);
        const acts = this.getActs(d, sid);
        if (v === 0 && !acts.length)
          return;
        const actStr = acts.map((a2) => {
          const ti = ACT_STYLE.findIndex((x) => x.id === a2.type);
          const tIdx = ti >= 0 ? ti : 1;
          return tr.exportActStr(tr.actSymbols[tIdx] + tr.actLabels[tIdx], a2.text);
        }).join(" / ");
        rows.push([this.dateStr(d), tr.slots[si].label, this.slotTime(si), v > 0 ? tr.levelNames[v] : "", actStr].join(","));
      });
    }
    const content = tr.exportContent(startISO, endISO, rows.join("\n"));
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tr.exportFilename(startISO, endISO);
    a.click();
    URL.revokeObjectURL(url);
  }
};
var EnergyTrackerSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    var _a;
    const { containerEl } = this;
    containerEl.empty();
    const tr = (_a = TRANSLATIONS[this.plugin.pluginData.language]) != null ? _a : ZH;
    containerEl.createEl("h2", { text: tr.settingsHeading });
    new import_obsidian.Setting(containerEl).setName(tr.settingsLangName).setDesc(tr.settingsLangDesc).addDropdown(
      (drop) => drop.addOption("zh", "\u4E2D\u6587").addOption("en", "English").setValue(this.plugin.pluginData.language || "zh").onChange((value) => __async(this, null, function* () {
        this.plugin.pluginData.language = value;
        yield this.plugin.savePluginData();
        this.display();
        this.plugin.refreshViews();
      }))
    );
    containerEl.createEl("h3", { text: tr.settingsTimesHeading });
    containerEl.createEl("p", { text: tr.settingsTimesDesc, cls: "setting-item-description" });
    const slotTimes = this.plugin.pluginData.slotTimes;
    SLOT_IDS.forEach((sid, si) => {
      var _a2;
      const current = (_a2 = slotTimes[si]) != null ? _a2 : __spreadValues({}, DEFAULT_SLOT_TIMES[si]);
      const setting = new import_obsidian.Setting(containerEl).setName(tr.slots[si].label);
      setting.controlEl.empty();
      setting.controlEl.style.display = "flex";
      setting.controlEl.style.alignItems = "center";
      setting.controlEl.style.gap = "6px";
      const makeInput = (val, min, max, label) => {
        const wrap = setting.controlEl.createDiv();
        wrap.style.display = "flex";
        wrap.style.alignItems = "center";
        wrap.style.gap = "4px";
        wrap.createSpan({ text: label, cls: "et-time-label" });
        const inp = wrap.createEl("input");
        inp.type = "number";
        inp.min = String(min);
        inp.max = String(max);
        inp.value = String(val);
        inp.style.width = "52px";
        inp.style.textAlign = "center";
        inp.style.borderRadius = "6px";
        inp.style.border = "1px solid var(--background-modifier-border)";
        inp.style.padding = "3px 6px";
        inp.style.background = "var(--background-primary)";
        inp.style.color = "var(--text-normal)";
        inp.style.fontSize = "13px";
        return inp;
      };
      const startInp = makeInput(current.start, 0, 23, tr.settingsTimesStart);
      setting.controlEl.createSpan({ text: "\u2013", cls: "et-time-sep" });
      const endInp = makeInput(current.end, 1, 24, tr.settingsTimesEnd);
      const save = () => __async(this, null, function* () {
        const s = parseInt(startInp.value);
        const e = parseInt(endInp.value);
        if (isNaN(s) || isNaN(e) || s < 0 || s > 23 || e < 1 || e > 24 || e <= s) {
          startInp.style.borderColor = "#e05050";
          endInp.style.borderColor = "#e05050";
          return;
        }
        startInp.style.borderColor = "";
        endInp.style.borderColor = "";
        this.plugin.pluginData.slotTimes[si] = { start: s, end: e };
        yield this.plugin.savePluginData();
        this.plugin.refreshViews();
      });
      startInp.addEventListener("change", save);
      endInp.addEventListener("change", save);
    });
    new import_obsidian.Setting(containerEl).addButton(
      (btn) => btn.setButtonText(tr.settingsTimesReset).onClick(() => __async(this, null, function* () {
        this.plugin.pluginData.slotTimes = DEFAULT_SLOT_TIMES.map((t) => __spreadValues({}, t));
        yield this.plugin.savePluginData();
        this.plugin.refreshViews();
        this.display();
      }))
    );
  }
};
var EnergyTrackerPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.pluginData = __spreadProps(__spreadValues({}, DEFAULT_DATA), { slotTimes: DEFAULT_SLOT_TIMES.map((t) => __spreadValues({}, t)) });
  }
  onload() {
    return __async(this, null, function* () {
      var _a;
      const saved = yield this.loadData();
      const safeTimes = ((_a = saved == null ? void 0 : saved.slotTimes) == null ? void 0 : _a.length) === 6 ? saved.slotTimes : DEFAULT_SLOT_TIMES.map((t) => __spreadValues({}, t));
      this.pluginData = __spreadProps(__spreadValues(__spreadValues({}, DEFAULT_DATA), saved), { slotTimes: safeTimes });
      this.registerView(VIEW_TYPE, (leaf) => new EnergyTrackerView(leaf, this));
      this.addSettingTab(new EnergyTrackerSettingTab(this.app, this));
      this.addRibbonIcon("zap", "30-Day Energy Log", () => this.activateView());
      this.addCommand({
        id: "open-energy-tracker",
        name: "Open 30-Day Energy Log",
        callback: () => this.activateView()
      });
    });
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
  activateView() {
    return __async(this, null, function* () {
      const { workspace } = this.app;
      const existing = workspace.getLeavesOfType(VIEW_TYPE);
      if (existing.length) {
        workspace.revealLeaf(existing[0]);
        return;
      }
      const leaf = workspace.getLeaf("tab");
      yield leaf.setViewState({ type: VIEW_TYPE, active: true });
      workspace.revealLeaf(leaf);
    });
  }
  savePluginData() {
    return __async(this, null, function* () {
      yield this.saveData(this.pluginData);
    });
  }
  refreshViews() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
      leaf.view.refresh();
    });
  }
};
