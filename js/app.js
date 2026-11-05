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

    // Initialize submodules
    PasswordGenerator.init();
    QRCodeTool.init();
    TextAnalyzer.init();
  }

  // --- Theme Handling ---
  function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");

    const savedTheme = localStorage.getItem("toolbox-theme") || 
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

    applyTheme(savedTheme);

    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("toolbox-theme", next);
    });

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        themeIcon.textContent = "☀️";
        themeText.textContent = "Light Mode";
      } else {
        themeIcon.textContent = "🌙";
        themeText.textContent = "Dark Mode";
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

      // If switching to QR code, refresh render
      if (tabId === "qrcode") {
        QRCodeTool.renderQR();
      }
    }

    // Expose switchTab globally
    ToolboxApp.switchTab = switchTab;
  }

  // --- Toast Notifications ---
  function showToast(message, duration = 2600) {
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
      // Don't intercept when user is typing in input or textarea
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      // Numbers 1, 2, 3 to switch tabs
      if (e.key === "1") {
        ToolboxApp.switchTab("password");
      } else if (e.key === "2") {
        ToolboxApp.switchTab("qrcode");
      } else if (e.key === "3") {
        ToolboxApp.switchTab("analyzer");
      } else if (e.code === "Space" || e.key === "r" || e.key === "R") {
        const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
        if (activeTab === "password") {
          e.preventDefault();
          PasswordGenerator.generate();
          showToast("ახალი პაროლი გენერირებულია! 🔄");
        }
      }
    });
  }

  return { init, showToast };
})();

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.ToolboxApp = ToolboxApp;
  ToolboxApp.init();
});
