import { App, ItemView, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from "obsidian";

const VIEW_TYPE = "energy-tracker";
const DAYS = 30;

// ── Structural data (no display strings) ─────────────────────────────────────

const LEVEL_COLORS   = ["#FDFCF8", "#CFC3E5", "#BBE38D", "#FFEB95", "#FFC0C4"];
const LEVEL_IS_CLEAR = [true, false, false, false, false];

const SLOT_IDS = ["dawn", "morning", "noon", "afternoon", "evening", "night"];

const ACT_STYLE = [
  { id: "gen",   btnBg: "#FFFFFF", btnFg: "#444444", btnBorder: "1.5px solid #D0D0D0", tagBg: "#FAFAFA", tagFg: "#444444", tagBorder: "1px solid #DCDCDC", dotBg: "#FFFFFF", summaryClass: "et-col-gen" },
  { id: "neu",   btnBg: "#CECECE", btnFg: "#444444", btnBorder: "1.5px solid #B8B8B8", tagBg: "#E8E8E8", tagFg: "#555555", tagBorder: "none",             dotBg: "#A0A0A0", summaryClass: "et-col-neu" },
  { id: "drain", btnBg: "#1A1A1A", btnFg: "#EEEEEE", btnBorder: "1.5px solid #000",   tagBg: "#1A1A1A", tagFg: "#EEEEEE", tagBorder: "none",             dotBg: "#333333", summaryClass: "et-col-drain" },
];

interface SlotTime { start: number; end: number; }

const DEFAULT_SLOT_TIMES: SlotTime[] = [
  { start: 8,  end: 10 },
  { start: 10, end: 12 },
  { start: 12, end: 14 },
  { start: 14, end: 18 },
  { start: 18, end: 21 },
  { start: 21, end: 24 },
];

// ── Translations ──────────────────────────────────────────────────────────────

interface Tr {
  viewTitle: string;
  subtitle: string;
  btnExport: string;
  btnClear: string;
  clearConfirm: string;
  startDate: string;
  levelNames: string[];
  slots: { label: string }[];
  actLabels: string[];
  actSymbols: string[];
  statsTitle: string;
  actSummaryTitle: string;
  actColHeaders: string[];
  actSectionTitle: string;
  actPlaceholder: string;
  actEmpty: string;
  weekdays: string[];
  popupLabel: (day: number, slot: string, month: number, date: number) => string;
  exportFilename: (startISO: string, endISO: string) => string;
  exportCsvHeader: string;
  exportActStr: (typeLabel: string, text: string) => string;
  exportContent: (startISO: string, endISO: string, rows: string) => string;
  settingsHeading: string;
  settingsLangName: string;
  settingsLangDesc: string;
  settingsTimesHeading: string;
  settingsTimesDesc: string;
  settingsTimesStart: string;
  settingsTimesEnd: string;
  settingsTimesReset: string;
  settingsTimesError: string;
}

const ZH: Tr = {
  viewTitle:    "30日能量记录实验",
  subtitle:     "数据保存在 Obsidian Vault · 关闭重开不丢失",
  btnExport:    "导出数据",
  btnClear:     "一键清空",
  clearConfirm: "确定清空所有能量记录和活动数据？此操作不可撤销。",
  startDate:    "起始日期",
  levelNames:   ["清除", "低迷", "平稳", "活跃", "巅峰"],
  slots: [
    { label: "清晨" },
    { label: "上午" },
    { label: "午间" },
    { label: "下午" },
    { label: "傍晚" },
    { label: "夜间" },
  ],
  actLabels:  ["充能", "中性", "耗能"],
  actSymbols: ["↑", "–", "↓"],
  statsTitle:      "各时段能量均值",
  actSummaryTitle: "活动汇总",
  actColHeaders:   ["↑ 充能活动", "– 中性活动", "↓ 耗能活动"],
  actSectionTitle: "活动记录",
  actPlaceholder:  "输入活动…",
  actEmpty:        "暂无记录",
  weekdays:        ["日", "一", "二", "三", "四", "五", "六"],
  popupLabel:    (day, slot, m, d) => `第 ${day} 天 · ${slot}（${m}月${d}日）`,
  exportFilename: (s, e) => `能量记录_${s}_${e}.txt`,
  exportCsvHeader: "日期,时段,时间范围,能量水平,活动记录",
  exportActStr:  (type, text) => `[${type}]${text}`,
  exportContent: (s, e, rows) =>
    `【能量分析请求】\n\n以下是我 ${s} 至 ${e} 的能量追踪数据。\n` +
    `能量水平：低迷=1 / 平稳=2 / 活跃=3 / 巅峰=4\n` +
    `活动分三类：充能（提升能量）、中性（不影响）、耗能（降低能量）\n\n` +
    `请帮我分析：\n` +
    `1. 哪些活动对我的能量影响最显著？\n` +
    `2. 我的能量在一天中如何波动？哪些时段适合高强度工作？\n` +
    `3. 根据能量节律，如何重新安排工作、学习和休息？\n` +
    `4. 有哪些值得注意的模式或立刻可以尝试的优化建议？\n\n` +
    `【数据】\n${rows}\n`,
  settingsHeading:      "30日能量记录 · 设置",
  settingsLangName:     "显示语言",
  settingsLangDesc:     "切换插件界面语言（切换后自动刷新）",
  settingsTimesHeading: "时段时间设置",
  settingsTimesDesc:    "自定义每个时段的起止时间（24小时整点，0–24）",
  settingsTimesStart:   "开始",
  settingsTimesEnd:     "结束",
  settingsTimesReset:   "恢复默认",
  settingsTimesError:   "请输入有效整点时间（开始 0–23，结束 1–24，且结束须大于开始）",
};

const EN: Tr = {
  viewTitle:    "30-Day Energy Log",
  subtitle:     "Data saved in your Obsidian Vault · Persists across restarts",
  btnExport:    "Export",
  btnClear:     "Clear All",
  clearConfirm: "Clear all energy records and activity data? This cannot be undone.",
  startDate:    "Start date",
  levelNames:   ["Clear", "Low", "Steady", "Active", "Peak"],
  slots: [
    { label: "Dawn"      },
    { label: "Morning"   },
    { label: "Noon"      },
    { label: "Afternoon" },
    { label: "Evening"   },
    { label: "Night"     },
  ],
  actLabels:  ["Energize", "Neutral", "Drain"],
  actSymbols: ["↑", "–", "↓"],
  statsTitle:      "Average Energy by Slot",
  actSummaryTitle: "Activity Summary",
  actColHeaders:   ["↑ Energizing", "– Neutral", "↓ Draining"],
  actSectionTitle: "Activities",
  actPlaceholder:  "Enter activity…",
  actEmpty:        "No records yet",
  weekdays:        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  popupLabel:    (day, slot, m, d) => `Day ${day} · ${slot} (${m}/${d})`,
  exportFilename: (s, e) => `energy-log_${s}_${e}.txt`,
  exportCsvHeader: "Date,Slot,Time Range,Energy Level,Activities",
  exportActStr:  (type, text) => `[${type}]${text}`,
  exportContent: (s, e, rows) =>
    `[Energy Analysis Request]\n\nBelow is my energy tracking data from ${s} to ${e}.\n` +
    `Energy level: Low=1 / Steady=2 / Active=3 / Peak=4\n` +
    `Activity types: Energizing (boosts energy) / Neutral (no effect) / Draining (lowers energy)\n\n` +
    `Please help me analyze:\n` +
    `1. Which activities have the most significant impact on my energy?\n` +
    `2. How does my energy fluctuate throughout the day? Which slots suit high-intensity work?\n` +
    `3. Based on my energy rhythm, how should I rearrange work, study, and rest?\n` +
    `4. What patterns are worth noting, and what can I try immediately?\n\n` +
    `[Data]\n${rows}\n`,
  settingsHeading:      "30-Day Energy Log · Settings",
  settingsLangName:     "Language / 语言",
  settingsLangDesc:     "Switch the plugin UI language (applies immediately)",
  settingsTimesHeading: "Time Slot Configuration",
  settingsTimesDesc:    "Customize the start and end hour of each slot (24-hour, 0–24)",
  settingsTimesStart:   "Start",
  settingsTimesEnd:     "End",
  settingsTimesReset:   "Reset to defaults",
  settingsTimesError:   "Please enter valid hours (start 0–23, end 1–24, end must be after start)",
};

const TRANSLATIONS: Record<string, Tr> = { zh: ZH, en: EN };

// ── Data types ────────────────────────────────────────────────────────────────

interface ActivityRecord {
  text: string;
  type: "gen" | "neu" | "drain";
}

interface PluginData {
  language: string;
  startDate: string;
  slotTimes: SlotTime[];
  cells: Record<string, number>;
  activities: Record<string, ActivityRecord[]>;
}

const DEFAULT_DATA: PluginData = {
  language: "zh",
  startDate: "",
  slotTimes: DEFAULT_SLOT_TIMES.map(t => ({ ...t })),
  cells: {},
  activities: {},
};

// ── View ──────────────────────────────────────────────────────────────────────

class EnergyTrackerView extends ItemView {
  private plugin: EnergyTrackerPlugin;
  private startDate: Date = new Date();
  private active: { cell: HTMLElement; day: number; sid: string } | null = null;
  private popup: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: EnergyTrackerPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType()    { return VIEW_TYPE; }
  getDisplayText() { return this.tr.viewTitle; }
  getIcon()        { return "zap"; }

  private get tr(): Tr {
    return TRANSLATIONS[this.plugin.pluginData.language] ?? ZH;
  }

  private slotTime(si: number): string {
    const t = this.plugin.pluginData.slotTimes?.[si] ?? DEFAULT_SLOT_TIMES[si];
    return `${t.start}–${t.end}`;
  }

  async onOpen() {
    const saved = this.plugin.pluginData.startDate;
    if (saved) {
      this.startDate = new Date(saved + "T00:00:00");
    } else {
      this.startDate = new Date();
      this.startDate.setHours(0, 0, 0, 0);
    }
    this.render();
  }

  async onClose() {
    if (this.popup) { this.popup.remove(); this.popup = null; }
  }

  refresh() { this.render(); }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private toISO(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  private dateOfDay(n: number) {
    const d = new Date(this.startDate);
    d.setDate(d.getDate() + n - 1);
    return d;
  }

  private dateStr(n: number) { return this.toISO(this.dateOfDay(n)); }
  private cellKey(n: number, sid: string) { return `${this.dateStr(n)}_${sid}`; }

  private getLevel(n: number, sid: string): number {
    return this.plugin.pluginData.cells[this.cellKey(n, sid)] || 0;
  }

  private async storeLevel(n: number, sid: string, v: number) {
    this.plugin.pluginData.cells[this.cellKey(n, sid)] = v;
    await this.plugin.savePluginData();
  }

  private getActs(n: number, sid: string): ActivityRecord[] {
    return this.plugin.pluginData.activities[this.cellKey(n, sid)] || [];
  }

  private async storeActs(n: number, sid: string, acts: ActivityRecord[]) {
    this.plugin.pluginData.activities[this.cellKey(n, sid)] = acts;
    await this.plugin.savePluginData();
  }

  private todayIdx() {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const diff = Math.round((t.getTime() - this.startDate.getTime()) / 86400000) + 1;
    return diff >= 1 && diff <= DAYS ? diff : -1;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  private render() {
    const tr   = this.tr;
    const root = this.contentEl;
    root.empty();
    root.addClass("et-root");

    const topActions = root.createDiv({ cls: "et-top-actions" });
    const btnExport  = topActions.createEl("button", { cls: "et-top-btn",           text: tr.btnExport });
    const btnClear   = topActions.createEl("button", { cls: "et-top-btn et-danger", text: tr.btnClear  });

    const header = root.createDiv({ cls: "et-header" });
    header.createDiv({ cls: "et-title",    text: tr.viewTitle });
    header.createDiv({ cls: "et-subtitle", text: tr.subtitle  });

    const content = root.createDiv({ cls: "et-content" });

    const headerRow  = content.createDiv({ cls: "et-grid-header-row" });
    const dateRow    = headerRow.createDiv({ cls: "et-date-row" });
    dateRow.createSpan({ text: tr.startDate });
    const startInput = dateRow.createEl("input") as HTMLInputElement;
    startInput.type  = "date";
    startInput.value = this.toISO(this.startDate);

    const legend = headerRow.createDiv({ cls: "et-legend" });
    LEVEL_COLORS.slice(1).forEach((color, i) => {
      const item = legend.createDiv({ cls: "et-legend-item" });
      const sw   = item.createDiv({ cls: "et-legend-swatch" });
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

    const popup    = root.createDiv({ cls: "et-popup" });
    const popLabel = popup.createDiv({ cls: "et-popup-label" });
    const popSw    = popup.createDiv({ cls: "et-popup-swatches" });
    const popAct   = popup.createDiv();
    this.popup = popup;

    startInput.addEventListener("change", async e => {
      const val = (e.target as HTMLInputElement).value;
      if (!val) return;
      this.startDate = new Date(val + "T00:00:00");
      this.plugin.pluginData.startDate = val;
      await this.plugin.savePluginData();
      this.buildGrid(grid, statsChart, actSummaryCols, popup, popLabel, popSw, popAct);
    });

    root.addEventListener("click", e => {
      if (popup.classList.contains("et-popup-on") && !popup.contains(e.target as Node))
        this.closePopup(popup, popAct);
    });

    btnExport.addEventListener("click", () => this.doExport());

    btnClear.addEventListener("click", async () => {
      if (!confirm(tr.clearConfirm)) return;
      this.plugin.pluginData.cells      = {};
      this.plugin.pluginData.activities = {};
      await this.plugin.savePluginData();
      this.closePopup(popup, popAct);
      this.buildGrid(grid, statsChart, actSummaryCols, popup, popLabel, popSw, popAct);
    });

    this.buildGrid(grid, statsChart, actSummaryCols, popup, popLabel, popSw, popAct);
  }

  // ── Grid ───────────────────────────────────────────────────────────────────

  private buildGrid(
    grid: HTMLElement, statsChart: HTMLElement, actSummaryCols: HTMLElement,
    popup: HTMLElement, popLabel: HTMLElement, popSw: HTMLElement, popAct: HTMLElement,
  ) {
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
        cls: "et-col-header et-col-weekday" +
          (dow === 0 || dow === 6 ? " et-is-weekend" : "") +
          (d === ti ? " et-is-today" : ""),
        text: tr.weekdays[dow],
      });
    }

    SLOT_IDS.forEach((sid, si) => {
      const rh = grid.createDiv({ cls: "et-row-header" });
      rh.createSpan({ cls: "et-slot-name", text: tr.slots[si].label });
      rh.createSpan({ cls: "et-slot-time", text: this.slotTime(si) });

      for (let d = 1; d <= DAYS; d++) {
        const v    = this.getLevel(d, sid);
        const acts = this.getActs(d, sid);
        const cell = grid.createDiv({ cls: "et-cell" + (v > 0 ? " et-filled" : "") });
        cell.style.background = LEVEL_COLORS[v];
        if (acts.length) this.renderDots(cell, acts);
        cell.addEventListener("click", e => {
          e.stopPropagation();
          this.onCell(cell, d, si, sid, popup, popLabel, popSw, popAct, statsChart, actSummaryCols);
        });
      }
    });

    this.buildStats(statsChart);
    this.buildActivitySummary(actSummaryCols);
  }

  // ── Dots ───────────────────────────────────────────────────────────────────

  private renderDots(cell: HTMLElement, acts: ActivityRecord[]) {
    let dotsEl = cell.querySelector(".et-cell-dots") as HTMLElement | null;
    if (!dotsEl) dotsEl = cell.createDiv({ cls: "et-cell-dots" });
    dotsEl.empty();
    ACT_STYLE.forEach(t => {
      if (acts.some(a => a.type === t.id)) {
        const dot = dotsEl!.createDiv({ cls: "et-cell-dot" });
        dot.style.background = t.dotBg;
        if (t.dotBorder !== "none") dot.style.boxShadow = "0 0 0 1px #C0C0C0";
      }
    });
  }

  // ── Popup ──────────────────────────────────────────────────────────────────

  private onCell(
    cell: HTMLElement, day: number, slotIdx: number, sid: string,
    popup: HTMLElement, popLabel: HTMLElement, popSw: HTMLElement, popAct: HTMLElement,
    statsChart: HTMLElement, actSummaryCols: HTMLElement,
  ) {
    const tr   = this.tr;
    const curV = this.getLevel(day, sid);
    const date = this.dateOfDay(day);
    this.active = { cell, day, sid };

    popLabel.textContent = tr.popupLabel(day, tr.slots[slotIdx].label, date.getMonth() + 1, date.getDate());

    popSw.empty();
    LEVEL_COLORS.forEach((color, vi) => {
      const item = popSw.createDiv({ cls: "et-pop-item" });
      const s    = item.createDiv({
        cls: "et-pop-swatch" +
          (LEVEL_IS_CLEAR[vi] ? " et-is-clear"    : "") +
          (vi === curV         ? " et-is-selected" : ""),
      });
      s.style.background = color;
      s.addEventListener("click", async e2 => {
        e2.stopPropagation();
        await this.pick(vi, statsChart, popup, popAct);
      });
      item.createDiv({ cls: "et-pop-name", text: tr.levelNames[vi] });
    });

    this.buildActSection(day, sid, popAct, popup, actSummaryCols);
    this.positionPopup(popup, cell);
  }

  private buildActSection(
    day: number, sid: string,
    section: HTMLElement, popup: HTMLElement, actSummaryCols: HTMLElement,
  ) {
    const tr = this.tr;
    section.empty();
    section.createEl("hr", { cls: "et-act-divider" });
    section.createDiv({ cls: "et-act-section-title", text: tr.actSectionTitle });

    const inputRow = section.createDiv({ cls: "et-act-input-row" });
    const input    = inputRow.createEl("input") as HTMLInputElement;
    input.className   = "et-act-input";
    input.placeholder = tr.actPlaceholder;
    input.addEventListener("click", e => e.stopPropagation());

    const btns = inputRow.createDiv({ cls: "et-act-type-btns" });
    ACT_STYLE.forEach((t, ti) => {
      const btn = btns.createEl("button", { cls: "et-act-type-btn", text: tr.actSymbols[ti] + tr.actLabels[ti] });
      btn.style.background = t.btnBg;
      btn.style.color      = t.btnFg;
      btn.style.border     = t.btnBorder;
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const text = input.value.trim();
        if (!text) { input.focus(); return; }
        await this.addAct(day, sid, text, t.id as "gen"|"neu"|"drain", popup, actSummaryCols);
        input.value = "";
        input.focus();
      });
    });

    input.addEventListener("keydown", async e => {
      if (e.key !== "Enter") return;
      e.stopPropagation();
      const text = input.value.trim();
      if (!text) return;
      await this.addAct(day, sid, text, "neu", popup, actSummaryCols);
      input.value = "";
    });

    const listEl = section.createDiv({ cls: "et-act-list" });
    this.renderActList(day, sid, listEl, popup, actSummaryCols);
  }

  private renderActList(
    day: number, sid: string,
    listEl: HTMLElement, popup: HTMLElement, actSummaryCols: HTMLElement,
  ) {
    const tr   = this.tr;
    const acts = this.getActs(day, sid);
    listEl.empty();
    if (!acts.length) { listEl.createDiv({ cls: "et-act-empty", text: tr.actEmpty }); return; }

    acts.forEach((act, idx) => {
      const ti   = ACT_STYLE.findIndex(x => x.id === act.type);
      const tIdx = ti >= 0 ? ti : 1;
      const t    = ACT_STYLE[tIdx];
      const item = listEl.createDiv({ cls: "et-act-item" });
      const tag  = item.createSpan({ cls: "et-act-tag", text: tr.actSymbols[tIdx] + tr.actLabels[tIdx] });
      tag.style.background = t.tagBg;
      tag.style.color      = t.tagFg;
      if (t.tagBorder !== "none") tag.style.border = t.tagBorder;
      item.createSpan({ cls: "et-act-text", text: act.text });
      const del = item.createEl("button", { cls: "et-act-del", text: "×" });
      del.addEventListener("click", async e => {
        e.stopPropagation();
        await this.removeAct(day, sid, idx, popup, actSummaryCols);
      });
    });
  }

  private async addAct(
    day: number, sid: string, text: string, type: "gen"|"neu"|"drain",
    popup: HTMLElement, actSummaryCols: HTMLElement,
  ) {
    const acts = this.getActs(day, sid);
    acts.push({ text, type });
    await this.storeActs(day, sid, acts);
    const listEl = popup.querySelector(".et-act-list") as HTMLElement;
    if (listEl) this.renderActList(day, sid, listEl, popup, actSummaryCols);
    if (this.active) { this.renderDots(this.active.cell, acts); this.positionPopup(popup, this.active.cell); }
    this.buildActivitySummary(actSummaryCols);
  }

  private async removeAct(
    day: number, sid: string, idx: number,
    popup: HTMLElement, actSummaryCols: HTMLElement,
  ) {
    const acts = this.getActs(day, sid);
    acts.splice(idx, 1);
    await this.storeActs(day, sid, acts);
    const listEl = popup.querySelector(".et-act-list") as HTMLElement;
    if (listEl) this.renderActList(day, sid, listEl, popup, actSummaryCols);
    if (this.active) { this.renderDots(this.active.cell, acts); this.positionPopup(popup, this.active.cell); }
    this.buildActivitySummary(actSummaryCols);
  }

  private positionPopup(popup: HTMLElement, cell: HTMLElement) {
    popup.style.visibility = "hidden";
    popup.classList.add("et-popup-on");
    const pw = popup.offsetWidth, ph = popup.offsetHeight;
    const r  = cell.getBoundingClientRect();
    let left = r.left + r.width / 2 - pw / 2;
    let top  = r.bottom + 10;
    left = Math.max(8, Math.min(left, window.innerWidth  - pw - 8));
    if (top + ph > window.innerHeight - 8) top = r.top - ph - 10;
    popup.style.left = left + "px";
    popup.style.top  = Math.max(8, top) + "px";
    popup.style.visibility = "";
  }

  private async pick(v: number, statsChart: HTMLElement, popup: HTMLElement, popAct: HTMLElement) {
    if (!this.active) return;
    const { cell, day, sid } = this.active;
    await this.storeLevel(day, sid, v);
    cell.style.background = LEVEL_COLORS[v];
    cell.className = "et-cell" + (v > 0 ? " et-filled" : "");
    this.renderDots(cell, this.getActs(day, sid));
    this.closePopup(popup, popAct);
    this.buildStats(statsChart);
  }

  private closePopup(popup: HTMLElement, popAct: HTMLElement) {
    popup.classList.remove("et-popup-on");
    popAct.empty();
    this.active = null;
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  private buildStats(chart: HTMLElement) {
    const tr = this.tr;
    chart.empty();
    SLOT_IDS.forEach((sid, si) => {
      let total = 0, count = 0;
      for (let d = 1; d <= DAYS; d++) {
        const v = this.getLevel(d, sid);
        if (v > 0) { total += v; count++; }
      }
      const avg   = count ? total / count : 0;
      const color = count ? LEVEL_COLORS[Math.min(4, Math.max(1, Math.round(avg)))] : "#eee8df";

      const col   = chart.createDiv({ cls: "et-bar-col" });
      col.createDiv({ cls: "et-bar-val", text: count ? avg.toFixed(1) : "·" });
      const track = col.createDiv({ cls: "et-bar-track" });
      const fill  = track.createDiv({ cls: "et-bar-fill" });
      fill.style.height     = ((avg / 4) * 100).toFixed(1) + "%";
      fill.style.background = color;
      col.createDiv({ cls: "et-bar-name", text: tr.slots[si].label });
      col.createDiv({ cls: "et-bar-time", text: this.slotTime(si) });
    });
  }

  // ── Activity summary ───────────────────────────────────────────────────────

  private buildActivitySummary(container: HTMLElement) {
    const tr = this.tr;
    container.empty();
    const byType: Record<string, Set<string>> = { gen: new Set(), neu: new Set(), drain: new Set() };
    for (let d = 1; d <= DAYS; d++)
      SLOT_IDS.forEach(sid => this.getActs(d, sid).forEach(a => byType[a.type]?.add(a.text)));

    ACT_STYLE.forEach((t, ti) => {
      const col   = container.createDiv({ cls: `et-act-summary-col ${t.summaryClass}` });
      col.createDiv({ cls: "et-act-summary-col-header", text: tr.actColHeaders[ti] });
      const pills = col.createDiv({ cls: "et-act-summary-pills" });
      const items = [...byType[t.id]];
      if (!items.length) pills.createSpan({ cls: "et-act-summary-empty", text: tr.actEmpty });
      else items.forEach(text => pills.createSpan({ cls: "et-act-pill", text }));
    });
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  private doExport() {
    const tr       = this.tr;
    const startISO = this.toISO(this.startDate);
    const endISO   = this.toISO(this.dateOfDay(DAYS));
    const rows     = [tr.exportCsvHeader];

    for (let d = 1; d <= DAYS; d++) {
      SLOT_IDS.forEach((sid, si) => {
        const v    = this.getLevel(d, sid);
        const acts = this.getActs(d, sid);
        if (v === 0 && !acts.length) return;
        const actStr = acts.map(a => {
          const ti = ACT_STYLE.findIndex(x => x.id === a.type);
          const tIdx = ti >= 0 ? ti : 1;
          return tr.exportActStr(tr.actSymbols[tIdx] + tr.actLabels[tIdx], a.text);
        }).join(" / ");
        rows.push([this.dateStr(d), tr.slots[si].label, this.slotTime(si), v > 0 ? tr.levelNames[v] : "", actStr].join(","));
      });
    }

    const content = tr.exportContent(startISO, endISO, rows.join("\n"));
    const blob    = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = tr.exportFilename(startISO, endISO);
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ── Settings tab ──────────────────────────────────────────────────────────────

class EnergyTrackerSettingTab extends PluginSettingTab {
  plugin: EnergyTrackerPlugin;

  constructor(app: App, plugin: EnergyTrackerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    const tr = TRANSLATIONS[this.plugin.pluginData.language] ?? ZH;

    containerEl.createEl("h2", { text: tr.settingsHeading });

    // ── Language ──────────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName(tr.settingsLangName)
      .setDesc(tr.settingsLangDesc)
      .addDropdown(drop => drop
        .addOption("zh", "中文")
        .addOption("en", "English")
        .setValue(this.plugin.pluginData.language || "zh")
        .onChange(async value => {
          this.plugin.pluginData.language = value;
          await this.plugin.savePluginData();
          this.display();
          this.plugin.refreshViews();
        })
      );

    // ── Slot times ────────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: tr.settingsTimesHeading });
    containerEl.createEl("p",  { text: tr.settingsTimesDesc, cls: "setting-item-description" });

    const slotTimes = this.plugin.pluginData.slotTimes;

    SLOT_IDS.forEach((sid, si) => {
      const current = slotTimes[si] ?? { ...DEFAULT_SLOT_TIMES[si] };

      const setting = new Setting(containerEl).setName(tr.slots[si].label);

      // Remove default control area content and build custom layout
      setting.controlEl.empty();
      setting.controlEl.style.display = "flex";
      setting.controlEl.style.alignItems = "center";
      setting.controlEl.style.gap = "6px";

      const makeInput = (val: number, min: number, max: number, label: string) => {
        const wrap  = setting.controlEl.createDiv();
        wrap.style.display     = "flex";
        wrap.style.alignItems  = "center";
        wrap.style.gap         = "4px";
        wrap.createSpan({ text: label, cls: "et-time-label" });
        const inp   = wrap.createEl("input") as HTMLInputElement;
        inp.type    = "number";
        inp.min     = String(min);
        inp.max     = String(max);
        inp.value   = String(val);
        inp.style.width      = "52px";
        inp.style.textAlign  = "center";
        inp.style.borderRadius = "6px";
        inp.style.border     = "1px solid var(--background-modifier-border)";
        inp.style.padding    = "3px 6px";
        inp.style.background = "var(--background-primary)";
        inp.style.color      = "var(--text-normal)";
        inp.style.fontSize   = "13px";
        return inp;
      };

      const startInp = makeInput(current.start, 0, 23, tr.settingsTimesStart);
      setting.controlEl.createSpan({ text: "–", cls: "et-time-sep" });
      const endInp   = makeInput(current.end,   1, 24, tr.settingsTimesEnd);

      const save = async () => {
        const s = parseInt(startInp.value);
        const e = parseInt(endInp.value);
        if (isNaN(s) || isNaN(e) || s < 0 || s > 23 || e < 1 || e > 24 || e <= s) {
          startInp.style.borderColor = "#e05050";
          endInp.style.borderColor   = "#e05050";
          return;
        }
        startInp.style.borderColor = "";
        endInp.style.borderColor   = "";
        this.plugin.pluginData.slotTimes[si] = { start: s, end: e };
        await this.plugin.savePluginData();
        this.plugin.refreshViews();
      };

      startInp.addEventListener("change", save);
      endInp.addEventListener("change",   save);
    });

    // Reset button
    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText(tr.settingsTimesReset)
        .onClick(async () => {
          this.plugin.pluginData.slotTimes = DEFAULT_SLOT_TIMES.map(t => ({ ...t }));
          await this.plugin.savePluginData();
          this.plugin.refreshViews();
          this.display();
        })
      );
  }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export default class EnergyTrackerPlugin extends Plugin {
  pluginData: PluginData = { ...DEFAULT_DATA, slotTimes: DEFAULT_SLOT_TIMES.map(t => ({ ...t })) };

  async onload() {
    const saved = await this.loadData();
    const safeTimes = saved?.slotTimes?.length === 6
      ? saved.slotTimes
      : DEFAULT_SLOT_TIMES.map(t => ({ ...t }));
    this.pluginData = { ...DEFAULT_DATA, ...saved, slotTimes: safeTimes };
    this.registerView(VIEW_TYPE, leaf => new EnergyTrackerView(leaf, this));
    this.addSettingTab(new EnergyTrackerSettingTab(this.app, this));
    this.addRibbonIcon("zap", "30-Day Energy Log", () => this.activateView());
    this.addCommand({
      id: "open-energy-tracker",
      name: "Open 30-Day Energy Log",
      callback: () => this.activateView(),
    });
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  async activateView() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length) { workspace.revealLeaf(existing[0]); return; }
    const leaf = workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    workspace.revealLeaf(leaf);
  }

  async savePluginData() {
    await this.saveData(this.pluginData);
  }

  refreshViews() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach(leaf => {
      (leaf.view as EnergyTrackerView).refresh();
    });
  }
}
