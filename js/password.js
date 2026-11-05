/**
 * Password Generator Module
 * Provides cryptographically secure password generation with entropy-based strength calculation.
 */

const PasswordGenerator = (() => {
  const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  const AMBIGUOUS_CHARS = /[il1Lo0O|]/g;

  // DOM Elements
  let lengthSlider, lengthValue, displayEl, strengthBar, strengthLabel;
  let chkUpper, chkLower, chkNumbers, chkSymbols, chkAmbiguous;

  function init() {
    lengthSlider = document.getElementById("password-length");
    lengthValue = document.getElementById("length-value");
    displayEl = document.getElementById("password-display");
    strengthBar = document.getElementById("strength-bar");
    strengthLabel = document.getElementById("strength-label");

    chkUpper = document.getElementById("pw-uppercase");
    chkLower = document.getElementById("pw-lowercase");
    chkNumbers = document.getElementById("pw-numbers");
    chkSymbols = document.getElementById("pw-symbols");
    chkAmbiguous = document.getElementById("pw-exclude-ambiguous");

    // Event Listeners
    lengthSlider.addEventListener("input", () => {
      lengthValue.textContent = lengthSlider.value;
      generate();
    });

    [chkUpper, chkLower, chkNumbers, chkSymbols, chkAmbiguous].forEach((el) => {
      el.addEventListener("change", () => {
        // Ensure at least one set is checked
        if (!chkUpper.checked && !chkLower.checked && !chkNumbers.checked && !chkSymbols.checked) {
          chkLower.checked = true;
        }
        generate();
      });
    });

    document.getElementById("pw-regenerate-btn").addEventListener("click", generate);

    document.getElementById("copy-password-btn").addEventListener("click", () => {
      const pwd = displayEl.textContent;
      if (!pwd) return;
      navigator.clipboard.writeText(pwd).then(() => {
        window.ToolboxApp?.showToast("პაროლი წარმატებით დაკოპირდა! 📋");
      });
    });

    // Preset Buttons
    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyPreset(btn.dataset.preset);
      });
    });

    // Initial generate
    generate();
  }

  function applyPreset(preset) {
    if (preset === "pin") {
      lengthSlider.value = 4;
      chkUpper.checked = false;
      chkLower.checked = false;
      chkNumbers.checked = true;
      chkSymbols.checked = false;
      chkAmbiguous.checked = false;
    } else if (preset === "pin6") {
      lengthSlider.value = 6;
      chkUpper.checked = false;
      chkLower.checked = false;
      chkNumbers.checked = true;
      chkSymbols.checked = false;
      chkAmbiguous.checked = false;
    } else if (preset === "standard") {
      lengthSlider.value = 16;
      chkUpper.checked = true;
      chkLower.checked = true;
      chkNumbers.checked = true;
      chkSymbols.checked = true;
      chkAmbiguous.checked = false;
    } else if (preset === "strong") {
      lengthSlider.value = 32;
      chkUpper.checked = true;
      chkLower.checked = true;
      chkNumbers.checked = true;
      chkSymbols.checked = true;
      chkAmbiguous.checked = false;
    } else if (preset === "alphanumeric") {
      lengthSlider.value = 20;
      chkUpper.checked = true;
      chkLower.checked = true;
      chkNumbers.checked = true;
      chkSymbols.checked = false;
      chkAmbiguous.checked = false;
    }

    lengthValue.textContent = lengthSlider.value;
    generate();
  }

  function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function generate() {
    let pool = "";
    const guaranteed = [];

    if (chkUpper.checked) {
      let upper = CHARSETS.uppercase;
      if (chkAmbiguous.checked) upper = upper.replace(AMBIGUOUS_CHARS, "");
      pool += upper;
      guaranteed.push(upper[getSecureRandomInt(upper.length)]);
    }

    if (chkLower.checked) {
      let lower = CHARSETS.lowercase;
      if (chkAmbiguous.checked) lower = lower.replace(AMBIGUOUS_CHARS, "");
      pool += lower;
      guaranteed.push(lower[getSecureRandomInt(lower.length)]);
    }

    if (chkNumbers.checked) {
      let nums = CHARSETS.numbers;
      if (chkAmbiguous.checked) nums = nums.replace(AMBIGUOUS_CHARS, "");
      pool += nums;
      guaranteed.push(nums[getSecureRandomInt(nums.length)]);
    }

    if (chkSymbols.checked) {
      let syms = CHARSETS.symbols;
      if (chkAmbiguous.checked) syms = syms.replace(AMBIGUOUS_CHARS, "");
      pool += syms;
      guaranteed.push(syms[getSecureRandomInt(syms.length)]);
    }

    if (pool.length === 0) {
      pool = CHARSETS.lowercase;
      chkLower.checked = true;
    }

    const length = parseInt(lengthSlider.value, 10);
    const resultChars = [...guaranteed];

    while (resultChars.length < length) {
      resultChars.push(pool[getSecureRandomInt(pool.length)]);
    }

    // Shuffle characters securely using Fisher-Yates
    for (let i = resultChars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
    }

    const password = resultChars.slice(0, length).join("");
    displayEl.textContent = password;
    updateStrength(password, pool.length);
  }

  function updateStrength(password, poolSize) {
    // Entropy = length * log2(poolSize)
    const entropy = password.length * (Math.log(Math.max(poolSize, 2)) / Math.log(2));

    let percent = 0;
    let label = "სუსტი";
    let color = "var(--danger)";

    if (entropy < 35) {
      percent = 25;
      label = "სუსტი (მარტივი გასატეხი)";
      color = "#ef4444";
    } else if (entropy < 60) {
      percent = 50;
      label = "საშუალო";
      color = "#f59e0b";
    } else if (entropy < 85) {
      percent = 75;
      label = "ძლიერი";
      color = "#3b82f6";
    } else {
      percent = 100;
      label = "ძალიან ძლიერი (მაღალი უსაფრთხოება)";
      color = "#10b981";
    }

    strengthBar.style.width = `${percent}%`;
    strengthBar.style.backgroundColor = color;
    strengthLabel.textContent = label;
    strengthLabel.style.color = color;
  }

  return { init, generate };
})();
