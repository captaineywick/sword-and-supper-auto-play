// ==UserScript==
// @name         Sword & Supper Auto Play v1.0.0
// @namespace    https://reddit.com/user/echo-foxtrot-delta/
// @version      1.0.0
// @description  Automates Sword & Supper on Reddit/Devvit - auto picks shrine stats, handles monolith sacrifices, house choices, and provides a draggable white UI.
// @author       Eric
// @homepageURL  https://github.com/captaineywick/sword-and-supper-auto-play
// @supportURL   https://github.com/captaineywick/sword-and-supper-auto-play/issues
// @updateURL    https://github.com/captaineywick/sword-and-supper-auto-play/raw/main/sword-and-supper.user.js
// @downloadURL  https://github.com/captaineywick/sword-and-supper-auto-play/raw/main/sword-and-supper.user.js
// @license      MIT
// @match        *://*.reddit.com/*
// @match        *://*.devvit.net/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const CONFIG = {
    clickInterval: 1000,
    preferredSkills: JSON.parse(
      localStorage.getItem("preferredSkills") ||
        '["bolt on rage","heal on rage","add rage on heal"]'
    ),
    shrinePriority: JSON.parse(
      localStorage.getItem("shrinePriority") ||
        '["attack","crit rate","defense","hp","speed"]'
    ),
    houseAutoYes: JSON.parse(localStorage.getItem("houseAutoYes") || "true"),
    monolithPriority: JSON.parse(
      localStorage.getItem("monolithPriority") ||
        '["attack","dodge rate","heal"]'
    ),
    miniBossAutoFight: JSON.parse(
      localStorage.getItem("miniBossAutoFight") || "true"
    ),
    log: true,
  };

  let running = false;
  let intervalId = null;
  const log = (msg) => CONFIG.log && console.log(`[Sword&Supper] ${msg}`);

  /* Detect when Reddit opens the game modal */
  function detectModalAndOpen() {
    log("Watching for <rpl-modal-card>...");
    const observer = new MutationObserver(() => {
      const modal = document.querySelector("rpl-modal-card");
      if (modal) {
        const iframe = modal.querySelector("devvit-blocks-web-view[src]");
        if (iframe && iframe.src.includes("devvit.net")) {
          observer.disconnect();
          log("Detected Sword & Supper modal: ready.");
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* Auto Logic */
  function runAutomation() {
    log("Running automation logic...");

    const clickAdvance = () => {
      const btn = Array.from(document.querySelectorAll(".advance-button")).find(
        (b) => {
          const text = b.textContent.trim().toLowerCase();
          return (
            (text.includes("advance") || text.includes("battle")) &&
            b.offsetParent !== null &&
            !b.disabled
          );
        }
      );

      if (btn) {
        const btnText = btn.textContent.trim();
        btn.click();
        log(`Clicked button: "${btnText}"`);
      }
    };

    const clickSkip = () => {
      const btn = Array.from(
        document.querySelectorAll(".skip-button, .skip-text")
      ).find((b) => {
        const text = b.textContent.trim().toLowerCase();
        return text.includes("skip") && b.offsetParent !== null && !b.disabled;
      });

      if (btn) {
        const btnText = btn.textContent.trim();
        btn.click();
        log(`Clicked button: "${btnText}"`);
      }
    };

    const pickSkill = () => {
      const header = document.querySelector(".ui-panel-header");
      const headerText = header ? header.textContent.toLowerCase() : "";
      log(`Header: ${headerText}`);

      // Shrine upgrade selection ("Increase Attack", "Increase Defense", etc.)
      if (headerText.includes("shrine")) {
        const shrineSkills = Array.from(
          document.querySelectorAll(
            ".ui-panel-content-skills .skill-button-label"
          )
        ).filter((b) => /increase/i.test(b.textContent));

        if (shrineSkills.length > 0) {
          log(`Detected shrine skill options: ${shrineSkills.length}`);
          for (const stat of CONFIG.shrinePriority) {
            const match = shrineSkills.find((b) =>
              b.textContent.toLowerCase().includes(stat.toLowerCase())
            );
            if (match) {
              match.click();
              log(`Selected shrine upgrade: ${stat}`);
              return;
            }
          }
          shrineSkills[0].click();
          log("No shrine priority matched: selected first option.");
          return;
        }
      }

      // Monolith sacrifice
      if (headerText.includes("monolith")) {
        const monolithOptions = Array.from(
          document.querySelectorAll(".skill-button-label")
        );

        if (monolithOptions.length > 0) {
          log(`Detected monolith options: ${monolithOptions.length}`);
          for (const stat of CONFIG.monolithPriority) {
            const match = monolithOptions.find((b) => {
              const txt = b.textContent.toLowerCase();
              // special case for heal - avoid losing health
              if (stat === "heal") {
                return txt.match(/heal\s*\d+%/);
              }

              // for all other stats — must increase that specific stat before "lose"
              return txt.includes(`increase ${stat.toLowerCase()}`);
            });
            if (match) {
              match.click();
              log(`Monolith sacrifice chosen: ${stat}`);
              return;
            }
          }

          // Default fallback: refuse
          const refuse = monolithOptions.find((b) =>
            /refuse/i.test(b.textContent)
          );
          refuse.click();
          log("No monolith priority matched: Refused.");
        }
        return;
      }

      // Skills
      if (
        headerText.includes("ancient machine") ||
        headerText.includes("selection of abilities")
      ) {
        const skillButtons = Array.from(
          document.querySelectorAll(".skill-button-label")
        );
        if (skillButtons.length > 0) {
          for (const pref of CONFIG.preferredSkills) {
            const match = skillButtons.find(
              (b) => b.textContent.trim().toLowerCase() === pref.toLowerCase()
            );
            if (match) {
              match.click();
              log(`Selected normal skill: ${pref}`);
              return;
            }
          }
          skillButtons[0].click();
          log(
            `No preferred skill matched: selected first option → "${skillButtons[0].textContent.trim()}".`
          );
          return;
        }
      }

      // House
      const houseHeader = document.querySelector(".ui-panel-header");
      if (houseHeader && /mysterious building/i.test(houseHeader.textContent)) {
        const yesBtn = Array.from(
          document.querySelectorAll(".skill-button-label")
        ).find((b) => /yes/i.test(b.textContent));
        const noBtn = Array.from(
          document.querySelectorAll(".skill-button-label")
        ).find((b) => /no/i.test(b.textContent));

        if (CONFIG.houseAutoYes && yesBtn) {
          yesBtn.click();
          log("House event: auto-picked YES 🏠");
        } else if (!CONFIG.houseAutoYes && noBtn) {
          noBtn.click();
          log("House event: auto-picked NO 🏠");
        }
        return; // stop further skill picking for this frame
      }

      // Mini Boss
      if (
        headerText.includes("dangerous creatures") &&
        headerText.includes("investigate?")
      ) {
        const fightBtn = Array.from(
          document.querySelectorAll(".skill-button-label")
        ).find((b) => /fight/i.test(b.textContent));
        const nopeBtn = Array.from(
          document.querySelectorAll(".skill-button-label")
        ).find((b) => /nope/i.test(b.textContent));

        if (CONFIG.miniBossAutoFight && fightBtn) {
          fightBtn.click();
          log("Mini Boss: auto-picked 'Let's Fight!'");
        } else if (!CONFIG.miniBossAutoFight && nopeBtn) {
          nopeBtn.click();
          log("Mini Boss: auto-picked 'Nope'");
        }
        return;
      }
    };

    const startAutomation = () => {
      if (running) return;
      running = true;
      log("Automation started.");
      intervalId = setInterval(() => {
        pickSkill();
        clickAdvance();
        clickSkip();
      }, CONFIG.clickInterval);
    };

    const stopAutomation = () => {
      if (!running) return;
      clearInterval(intervalId);
      running = false;
      log("Automation stopped.");
    };

    /* UI Panel */
    const createPanel = () => {
      const panel = document.createElement("div");
      Object.assign(panel.style, {
        position: "fixed",
        top: "45%",
        left: "20px",
        transform: "translateY(-50%)",
        padding: "6px 8px",
        background: "rgba(255,255,255,0.95)",
        color: "#000",
        borderRadius: "12px",
        fontSize: "13px",
        zIndex: "2147483647",
        border: "1px solid #aaa",
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        cursor: "move",
        minWidth: "260px",
        maxWidth: "320px",
        display: "inline-block",
        boxSizing: "border-box",
        overflow: "visible",
      });

      // --- Dragging logic with persistent position ---
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      // Load saved position
      const savedPos = JSON.parse(localStorage.getItem("panelPosition"));
      if (savedPos) {
        panel.style.left = savedPos.left;
        panel.style.top = savedPos.top;
        panel.style.transform = "";
      } else {
        // fallback default position
        panel.style.left = "20px";
        panel.style.top = "45%";
      }

      // Start dragging
      panel.addEventListener("mousedown", (e) => {
        const target = e.target;
        if (["INPUT", "TEXTAREA", "BUTTON"].includes(target.tagName)) return;
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
        panel.style.transition = "none";
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        panel.style.left = `${x}px`;
        panel.style.top = `${y}px`;
        panel.style.transform = "";
      });

      window.addEventListener("mouseup", () => {
        if (isDragging) {
          // Save position to localStorage
          localStorage.setItem(
            "panelPosition",
            JSON.stringify({
              left: panel.style.left,
              top: panel.style.top,
            })
          );
        }
        isDragging = false;
      });

      const makeBtn = (label, fn) => {
        const b = document.createElement("button");
        b.textContent = label;
        Object.assign(b.style, {
          cursor: "pointer",
          padding: "4px 6px",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "14px",
          width: "32px",
          height: "32px",
        });
        b.onclick = (e) => {
          e.stopPropagation();
          fn();
        };
        return b;
      };

      /* Editors (Normal, Shrine, Monolith) */
      const closeAllEditors = () => {
        ["#skills-editor", "#shrine-editor", "#monolith-editor"].forEach(
          (id) => {
            const el = document.querySelector(id);
            if (el) el.remove();
          }
        );
      };

      // Skills Editor
      const openSkillEditor = () => {
        const existing = document.querySelector("#skills-editor");
        if (existing) return existing.remove(); // toggle off if open
        closeAllEditors();

        const editor = document.createElement("div");
        editor.id = "skills-editor";
        Object.assign(editor.style, {
          marginTop: "10px",
          padding: "10px",
          background: "#f8f8f8",
          border: "1px solid #000",
          borderRadius: "6px",
        });
        editor.addEventListener("mousedown", (e) => e.stopPropagation());

        const label = document.createElement("div");
        label.textContent = "Preferred Skills (comma separated):";
        label.style.marginBottom = "5px";
        label.style.fontWeight = "bold";

        const textarea = document.createElement("textarea");
        Object.assign(textarea.style, {
          width: "100%",
          maxWidth: "100%",
          height: "60px",
          fontSize: "12px",
          resize: "vertical",
          boxSizing: "border-box",
        });
        textarea.value = CONFIG.preferredSkills.join(", ");

        const btnRow = document.createElement("div");
        Object.assign(btnRow.style, {
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px",
        });

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        Object.assign(saveBtn.style, {
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "bold",
        });
        saveBtn.onclick = (e) => {
          e.stopPropagation();
          CONFIG.preferredSkills = textarea.value
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          localStorage.setItem(
            "preferredSkills",
            JSON.stringify(CONFIG.preferredSkills)
          );
          log(`Saved skills: ${CONFIG.preferredSkills.join(", ")}`);
          editor.remove();
        };

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        Object.assign(closeBtn.style, {
          background: "#aaa",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "bold",
        });
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          editor.remove();
          log("Closed skill editor without saving.");
        };

        btnRow.append(saveBtn, closeBtn);
        editor.append(label, textarea, btnRow);
        panel.appendChild(editor);
      };

      // Shrine Editor
      const openShrineEditor = () => {
        const existing = document.querySelector("#shrine-editor");
        if (existing) return existing.remove(); // toggle off if open
        closeAllEditors();

        const editor = document.createElement("div");
        editor.id = "shrine-editor";
        Object.assign(editor.style, {
          marginTop: "10px",
          padding: "10px",
          background: "#f8f8f8",
          border: "1px solid #000",
          borderRadius: "6px",
        });
        editor.addEventListener("mousedown", (e) => e.stopPropagation());

        const label = document.createElement("div");
        label.textContent = "Shrine Priority (comma separated):";
        label.style.marginBottom = "5px";
        label.style.fontWeight = "bold";

        const textarea = document.createElement("textarea");
        Object.assign(textarea.style, {
          width: "100%",
          maxWidth: "100%",
          height: "60px",
          fontSize: "12px",
          resize: "vertical",
          boxSizing: "border-box",
        });
        textarea.value = CONFIG.shrinePriority.join(", ");

        const btnRow = document.createElement("div");
        Object.assign(btnRow.style, {
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px",
        });

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        Object.assign(saveBtn.style, {
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "bold",
        });
        saveBtn.onclick = (e) => {
          e.stopPropagation();
          CONFIG.shrinePriority = textarea.value
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          localStorage.setItem(
            "shrinePriority",
            JSON.stringify(CONFIG.shrinePriority)
          );
          log(`Saved shrine priorities: ${CONFIG.shrinePriority.join(", ")}`);
          editor.remove();
        };

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        Object.assign(closeBtn.style, {
          background: "#aaa",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "bold",
        });
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          editor.remove();
          log("Closed shrine editor without saving.");
        };

        btnRow.append(saveBtn, closeBtn);
        editor.append(label, textarea, btnRow);
        panel.appendChild(editor);
      };

      // Monolith Editor
      const openMonolithEditor = () => {
        const existing = document.querySelector("#monolith-editor");
        if (existing) return existing.remove(); // toggle off if open
        closeAllEditors();

        const editor = document.createElement("div");
        editor.id = "monolith-editor";
        Object.assign(editor.style, {
          marginTop: "10px",
          padding: "10px",
          background: "#f8f8f8",
          border: "1px solid #000",
          borderRadius: "6px",
        });
        editor.addEventListener("mousedown", (e) => e.stopPropagation());

        const label = document.createElement("div");
        label.textContent = "Monolith Priority (comma separated):";
        label.style.marginBottom = "5px";
        label.style.fontWeight = "bold";

        const textarea = document.createElement("textarea");
        Object.assign(textarea.style, {
          width: "100%",
          maxWidth: "100%",
          height: "60px",
          fontSize: "12px",
          resize: "vertical",
          boxSizing: "border-box",
        });
        textarea.value = CONFIG.monolithPriority.join(", ");

        const btnRow = document.createElement("div");
        Object.assign(btnRow.style, {
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px",
        });

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        Object.assign(saveBtn.style, {
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "bold",
        });
        saveBtn.onclick = (e) => {
          e.stopPropagation();
          CONFIG.monolithPriority = textarea.value
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          localStorage.setItem(
            "monolithPriority",
            JSON.stringify(CONFIG.monolithPriority)
          );
          log(
            `Saved monolith priorities: ${CONFIG.monolithPriority.join(", ")}`
          );
          editor.remove();
        };

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        Object.assign(closeBtn.style, {
          background: "#aaa",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "bold",
        });
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          editor.remove();
          log("Closed monolith editor without saving.");
        };

        btnRow.append(saveBtn, closeBtn);
        editor.append(label, textarea, btnRow);
        panel.appendChild(editor);
      };

      // House Auto Toggle
      const houseToggle = document.createElement("button");
      houseToggle.textContent = "🏠";
      Object.assign(houseToggle.style, {
        cursor: "pointer",
        padding: "4px",
        background: CONFIG.houseAutoYes ? "#0a0" : "#a00",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "16px",
        width: "32px",
        height: "32px",
      });
      houseToggle.onclick = (e) => {
        e.stopPropagation();
        CONFIG.houseAutoYes = !CONFIG.houseAutoYes;
        localStorage.setItem(
          "houseAutoYes",
          JSON.stringify(CONFIG.houseAutoYes)
        );
        houseToggle.textContent = "🏠";
        houseToggle.style.background = CONFIG.houseAutoYes ? "#0a0" : "#a00";
        log(`House event toggle set to: ${CONFIG.houseAutoYes ? "YES" : "NO"}`);
      };

      // Mini Boss toggle
      // Mini Boss toggle
      const miniBossToggle = document.createElement("button");
      miniBossToggle.textContent = "👾";
      Object.assign(miniBossToggle.style, {
        cursor: "pointer",
        padding: "4px",
        background: CONFIG.miniBossAutoFight ? "#0a0" : "#a00",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "16px",
        width: "32px",
        height: "32px",
      });
      miniBossToggle.onclick = (e) => {
        e.stopPropagation();
        CONFIG.miniBossAutoFight = !CONFIG.miniBossAutoFight;
        localStorage.setItem(
          "miniBossAutoFight",
          JSON.stringify(CONFIG.miniBossAutoFight)
        );
        miniBossToggle.style.background = CONFIG.miniBossAutoFight
          ? "#0a0"
          : "#a00";
        log(
          `Mini Boss toggle set to: ${
            CONFIG.miniBossAutoFight ? "FIGHT (👾 YES)" : "NOPE (👾 NO)"
          }`
        );
      };

      /* Buttons */
      const btnRow = document.createElement("div");
      Object.assign(btnRow.style, {
        display: "flex",
        gap: "4px",
        alignItems: "center",
      });
      btnRow.append(
        makeBtn("▶", startAutomation),
        makeBtn("⏹", stopAutomation),
        makeBtn("⚙", openSkillEditor),
        makeBtn("⛩", openShrineEditor),
        makeBtn("🗿", openMonolithEditor),
        houseToggle,
        miniBossToggle
      );
      panel.appendChild(btnRow);
      document.body.appendChild(panel);
      log("Control panel injected (draggable).");
    };

    const obs = new MutationObserver(() => {
      if (document.querySelector(".advance-button")) {
        obs.disconnect();
        createPanel();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* Entry point */
  if (window.location.hostname.includes("reddit.com")) {
    log("Running on Reddit subreddit page.");
    detectModalAndOpen();
  } else if (window.location.hostname.includes("devvit.net")) {
    log("Running inside actual game.");
    runAutomation();
  }
})();
