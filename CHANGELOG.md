## v1.0.0 [10/22/2025] — Initial Release

### Features

#### **Full Auto Play Support**

- Automates shrine stat upgrades based on user-defined priority.
- Handles monolith sacrifices using configurable stat order.
- Supports house events with “Yes/No” toggle control.
- Adds mini-boss encounter automation (auto-fight or skip).

#### **Control Panel**

- Draggable white control panel with persistent position (`localStorage`).
- Built-in quick-access buttons:
  - ▶️ Start automation
  - ⏹ Stop automation
  - ⚙️ Edit preferred skills
  - ⛩ Edit shrine priorities
  - 🗿 Edit monolith priorities
  - 🏠 Toggle house auto-answer
  - 👾 Toggle mini-boss behavior
- Saves and restores last UI position on reload.

#### **Customizable Settings**

- Persistent configuration stored in `localStorage`:
  - `preferredSkills`
  - `shrinePriority`
  - `monolithPriority`
  - `houseAutoYes`
  - `miniBossAutoFight`

#### **Automation Safety**

- Automatically stops when a **Continue** or **Skip** button is detected.
- Adjustable `clickInterval` (default `1000 ms`) to prevent performance issues.

- **Logging**
  - Structured in-console logging for all actions.
  - Can be toggled on/off via `CONFIG.log`.
