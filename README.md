# 30-Day Energy Log

An Obsidian plugin to track your energy levels and activities across 6 daily time slots over 30 days. All data is stored locally in your Vault — no sync, no cloud, no data loss on restart.

---

## How It Works

1. **Set a start date** — choose the first day of your 30-day experiment.
2. **Log your energy level** for each time slot by clicking a cell and selecting a color:
   - 🟣 Low — depleted, foggy
   - 🟢 Steady — calm, functional
   - 🟡 Active — engaged, productive
   - 🩷 Peak — in flow, highly energized
3. **Record activities** inside each cell — categorized as:
   - ↑ **Energizing** — activities that boost your energy
   - – **Neutral** — activities with no noticeable effect
   - ↓ **Draining** — activities that deplete your energy
4. **Export your data** (top-right button) — generates a text file with a built-in AI prompt, ready to paste into ChatGPT or Claude for personalized energy and schedule analysis.
5. **Clear and restart** — reset all data with one click to begin a new experiment.

---

## Settings

Open **Settings → 30-Day Energy Log** to:

- **Switch language** between English and 中文 (applies immediately)
- **Customize time slots** — set your own start and end hours for each of the 6 daily slots (24-hour format, updates live)
- **Reset slot times** to defaults (8–10, 10–12, 12–14, 14–18, 18–21, 21–24)

---

## Installation

### From Obsidian Community Plugins

Search for **"30-Day Energy Log"** in Settings → Community Plugins.

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](../../releases/latest).
2. Copy them into `<your-vault>/.obsidian/plugins/energy-tracker/`.
3. Enable the plugin in Settings → Community Plugins.

---

## Usage

Click the **⚡ lightning bolt** icon in the left ribbon, or run the command **"Open 30-Day Energy Log"** from the command palette (`Cmd/Ctrl + P`).

---

## Data & Privacy

All data is saved to `.obsidian/plugins/energy-tracker/data.json` inside your Vault. Nothing is sent anywhere.

---

---

# 30日能量记录

一个 Obsidian 插件，用于追踪30天内每天6个时段的能量水平与活动记录。所有数据保存在本地 Vault 中，重启不丢失。

---

## 使用方式

1. **选择起始日期** — 设置30天实验的第一天。
2. **记录每个时段的能量水平** — 点击方块，选择颜色：
   - 🟣 低迷 — 疲惫、思维模糊
   - 🟢 平稳 — 平静、正常运转
   - 🟡 活跃 — 专注、高效
   - 🩷 巅峰 — 进入心流、高度活跃
3. **记录该时段的活动** — 分为三类：
   - ↑ **充能** — 提升能量的活动
   - – **中性** — 对能量无明显影响的活动
   - ↓ **耗能** — 消耗能量的活动
4. **导出数据**（右上角按钮）— 生成一个附带 AI 提示词的文本文件，粘贴给 Claude 或 ChatGPT，即可获得适合你的时间与精力安排建议。
5. **一键清空** — 清除所有记录，重新开始新一轮实验。

---

## 设置

打开 **设置 → 30日能量记录** 可以：

- **切换语言**：中文 / English（即时生效）
- **自定义时段时间**：为6个时段分别设置起止时间（24小时制，实时更新）
- **恢复默认时间**（8–10、10–12、12–14、14–18、18–21、21–24）

---

## 安装

### 通过社区插件市场 *(即将上线)*

在 设置 → 第三方插件 中搜索 **"30-Day Energy Log"**。

### 手动安装

1. 从 [最新 Release](../../releases/latest) 下载 `main.js`、`manifest.json`、`styles.css`。
2. 将这三个文件复制到 `<你的Vault>/.obsidian/plugins/energy-tracker/` 目录下。
3. 在 设置 → 第三方插件 中启用插件。

---

## 数据与隐私

所有数据保存在 Vault 内的 `.obsidian/plugins/energy-tracker/data.json`，不会上传或共享。
