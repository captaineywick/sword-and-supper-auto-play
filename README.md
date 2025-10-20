# Sword & Supper Auto Play

> Automates gameplay for **Sword & Supper** on Reddit / Devvit — including shrine upgrades, monolith sacrifices, house decisions, and a draggable white UI for easy control.

---

## Features

- **Auto Skill Picker** — chooses skills based on your preferred configuration.
- **Shrine Priority Logic** — auto-selects shrine upgrades (`Attack`, `Crit Rate`, `Defense`, etc.) following your set order.
- **Monolith Sacrifice Logic** — smart detection for risk/reward “Lose X%” events with proper stat targeting.
- **House Auto Decision** — toggles between “Yes” and “No” on mysterious building encounters.
- **Customizable UI Panel**
  - Draggable and compact white UI.
  - Editable skill/shrine/monolith preferences stored in `localStorage`.
  - Persistent settings across sessions.
- **Tampermonkey Auto-Update** — stays up-to-date with new releases from GitHub.

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

| Setting            | Description                            | Example                      |
| ------------------ | -------------------------------------- | ---------------------------- |
| `preferredSkills`  | Skills you prefer to pick first        | `bolt on rage, heal on rage` |
| `shrinePriority`   | Shrine stat upgrade order              | `attack, crit rate, defense` |
| `monolithPriority` | Monolith sacrifice preference          | `attack, dodge rate, heal`   |
| `houseAutoYes`     | Whether to auto-select "YES" on houses | `true` / `false`             |

---

## Development

If you’d like to tweak or contribute:

```bash
# Clone the repo
git clone https://github.com/captaineywick/sword-and-supper-auto-play.git
cd sword-and-supper-auto-play

# Edit the script
code sword-and-supper.user.js
```
