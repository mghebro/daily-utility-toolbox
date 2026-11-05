/**
 * JSON Formatter, Minifier & Validator Module
 */

const JSONTool = (() => {
  let textarea, statusEl, formatBtn, minifyBtn, validateBtn, clearBtn, copyBtn;

  function init() {
    textarea = document.getElementById("json-input");
    statusEl = document.getElementById("json-status");
    formatBtn = document.getElementById("json-format-btn");
    minifyBtn = document.getElementById("json-minify-btn");
    validateBtn = document.getElementById("json-validate-btn");
    clearBtn = document.getElementById("json-clear-btn");
    copyBtn = document.getElementById("json-copy-btn");

    formatBtn?.addEventListener("click", () => formatJSON(2));
    minifyBtn?.addEventListener("click", () => minifyJSON());
    validateBtn?.addEventListener("click", () => validateJSON());

    clearBtn?.addEventListener("click", () => {
      textarea.value = "";
      setStatus("ready", "მზად არის სამუშაოდ");
      textarea.focus();
    });

    copyBtn?.addEventListener("click", () => {
      if (!textarea.value.trim()) return;
      navigator.clipboard.writeText(textarea.value).then(() => {
        window.ToolboxApp?.showToast("JSON დაკოპირდა!");
      });
    });

    textarea?.addEventListener("input", debounce(validateJSON, 400));
  }

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "contrast-pill";
    if (type === "success") {
      statusEl.classList.add("pass");
    } else if (type === "error") {
      statusEl.classList.add("fail");
    } else {
      statusEl.style.color = "var(--text-muted)";
      statusEl.style.background = "var(--bg-surface-elevated)";
    }
  }

  function validateJSON() {
    const raw = textarea.value.trim();
    if (!raw) {
      setStatus("ready", "შეიყვანეთ ან ჩასვით JSON");
      return false;
    }

    try {
      const parsed = JSON.parse(raw);
      const isArray = Array.isArray(parsed);
      const count = isArray ? parsed.length : Object.keys(parsed).length;
      setStatus("success", `✓ ვალიდური JSON (${isArray ? "მასივი" : "ობიექტი"}: ${count} ელემენტი)`);
      return true;
    } catch (err) {
      setStatus("error", `✕ სინტაქსური შეცდომა: ${err.message}`);
      return false;
    }
  }

  function formatJSON(indent = 2) {
    const raw = textarea.value.trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      textarea.value = JSON.stringify(parsed, null, indent);
      validateJSON();
      window.ToolboxApp?.showToast("JSON წარმატებით დაფორმატდა");
    } catch (err) {
      setStatus("error", `✕ შეცდომა: ${err.message}`);
      window.ToolboxApp?.showToast("ვალიდაცია ვერ მოხერხდა");
    }
  }

  function minifyJSON() {
    const raw = textarea.value.trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      textarea.value = JSON.stringify(parsed);
      validateJSON();
      window.ToolboxApp?.showToast("JSON შეკუმშულია (Minified)");
    } catch (err) {
      setStatus("error", `✕ შეცდომა: ${err.message}`);
    }
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  return { init, formatJSON, minifyJSON };
})();
