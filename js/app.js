/**
 * Main Application Orchestrator
 * Handles navigation tabs, dark/light theme, toast alerts, and global shortcuts.
 */

const ToolboxApp = (() => {
  let toastContainer;

  function init() {
    toastContainer = document.getElementById("toast-container");
    initTheme();
    initTabs();
    initKeyboardShortcuts();

    // Initialize all tool modules
    PasswordGenerator.init();
    QRCodeTool.init();
    TextAnalyzer.init();
    JSONTool.init();
    ColorTool.init();
  }

  // --- Theme Handling ---
  function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const themeText = document.getElementById("theme-text");

    const savedTheme = localStorage.getItem("toolbox-theme") || 
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

    applyTheme(savedTheme);

    themeBtn?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("toolbox-theme", next);
    });

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      if (themeText) {
        themeText.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
      }
    }
  }

  // --- Tab Navigation ---
  function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        switchTab(targetTab);
      });
    });

    function switchTab(tabId) {
      tabButtons.forEach((b) => {
        const isActive = b.dataset.tab === tabId;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      tabContents.forEach((content) => {
        const isActive = content.id === `tab-${tabId}`;
        content.classList.toggle("active", isActive);
      });

      if (tabId === "qrcode") {
        QRCodeTool.renderQR();
      }
    }

    ToolboxApp.switchTab = switchTab;
  }

  // --- Toast Notifications ---
  function showToast(message, duration = 2200) {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, duration);
  }

  // --- Keyboard Shortcuts ---
  function initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const tabs = ["password", "qrcode", "analyzer", "json", "color"];
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= tabs.length) {
        ToolboxApp.switchTab(tabs[keyNum - 1]);
      } else if (e.code === "Space" || e.key === "r" || e.key === "R") {
        const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
        if (activeTab === "password") {
          e.preventDefault();
          PasswordGenerator.generate();
          showToast("ახალი პაროლი გენერირებულია");
        }
      }
    });
  }

  return { init, showToast };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ToolboxApp = ToolboxApp;
  ToolboxApp.init();
});
