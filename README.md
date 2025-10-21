# Sword & Supper Auto Play

> Automates gameplay for **Sword & Supper** on Reddit / Devvit — including shrine upgrades, monolith sacrifices, house decisions, and a draggable white UI for easy control.

---

## Features

- **Auto Skill Picker** — automatically selects abilities based on your configured skill preferences.
- **Shrine Priority Logic** — prioritizes shrine upgrades (e.g., `attack`, `crit rate`, `defense`, `hp`, `speed`) following your saved order.
- **Monolith Sacrifice Logic** — works just like shrine priority; intelligently selects the best sacrifice option (`attack`, `speed`, `heal`, etc.) according to your configured priority list.
- **House Auto Decision** — automatically chooses "Yes" or "No" for mysterious building events based on your toggle preference.
- **Auto Mini-Boss** — detects "dangerous creatures" events and auto-chooses whether to fight or skip based on your configuration.
- **Customizable UI Panel**
  - Compact, draggable white control panel.
  - Built-in editors for skill, shrine, and monolith configurations.
  - Settings are saved in `localStorage` and persist across sessions.
- **Tampermonkey Auto-Update** — automatically fetches the latest version from GitHub to keep your script up-to-date.

---

## Installation

1. **Install Tampermonkey** (if you haven’t yet):

   - [Tamper Monkey](https://www.tampermonkey.net/)

2. Click below to **install the userscript**:

   - [**Install Sword & Supper Auto Play**](https://github.com/captaineywick/sword-and-supper-auto-play/raw/main/sword-and-supper-auto-play.user.js)

3. Open the **Sword & Supper game** inside Reddit.

   - Example: `https://www.reddit.com/r/SwordAndSupper/`
   - The automation panel will appear on the left side once the game loads.

4. Customize your configuration using the icons in the draggable UI panel.

---

## Configuration

Your preferences are automatically saved in the browser’s `localStorage`.

| Setting             | Description                            | Example                      |
| ------------------- | -------------------------------------- | ---------------------------- |
| `preferredSkills`   | Skills you prefer to pick first        | `bolt on rage, heal on rage` |
| `shrinePriority`    | Shrine stat upgrade order              | `attack, crit rate, defense` |
| `monolithPriority`  | Monolith sacrifice preference          | `attack, dodge rate, heal`   |
| `houseAutoYes`      | Whether to auto-select "YES" on houses | `true` / `false`             |
| `miniBossAutoFight` | Whether to auto-fight mini boss        | `true` / `false`             |

---

## Development

If you’d like to tweak or contribute:

```bash
# Clone the repo
git clone https://github.com/captaineywick/sword-and-supper-auto-play.git
cd sword-and-supper-auto-play

# Edit the script
code sword-and-supper-auto-play.user.js
```
