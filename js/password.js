/**
 * Password & Passphrase Generator Module
 * Provides cryptographically secure password and memorable passphrase generation with entropy calculation.
 */

const PasswordGenerator = (() => {
  const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  const AMBIGUOUS_CHARS = /[il1Lo0O|]/g;

  // Curated list of distinct, recognizable English words for memorable passphrases
  const WORD_LIST = [
    "amber", "anchor", "apple", "beacon", "breeze", "bridge", "canyon", "castle", "cedar", "cipher",
    "clover", "cobalt", "comet", "coral", "crater", "crystal", "delta", "drift", "echo", "ember",
    "falcon", "feather", "forest", "fossil", "galaxy", "glacier", "granite", "harbor", "haven", "horizon",
    "island", "jaguar", "jungle", "lagoon", "lantern", "legend", "lunar", "meadow", "meteor", "mirage",
    "monarch", "mosaic", "nebula", "nexus", "oasis", "orbit", "palace", "pathway", "phoenix", "pinnacle",
    "planet", "prism", "pulse", "pyramid", "quantum", "quartz", "quiver", "radiant", "ripple", "rover",
    "saffron", "shadow", "sierra", "silver", "solace", "spark", "summit", "timber", "torch", "tundra",
    "valley", "velvet", "vessel", "vortex", "voyage", "walnut", "whisper", "wilder", "willow", "zenith"
  ];

  let mode = "password"; // "password" or "passphrase"
  let lengthSlider, lengthValue, displayEl, strengthFill, strengthLabel;
  let chkUpper, chkLower, chkNumbers, chkSymbols, chkAmbiguous;
  let wordsSlider, wordsValue, sepSelect, chkCapitalize, chkIncludeNumber;
  let passwordOptionsContainer, passphraseOptionsContainer;

  function init() {
    lengthSlider = document.getElementById("password-length");
    lengthValue = document.getElementById("length-value");
    displayEl = document.getElementById("password-display");
    strengthFill = document.getElementById("strength-fill");
    strengthLabel = document.getElementById("strength-label");

    chkUpper = document.getElementById("pw-uppercase");
    chkLower = document.getElementById("pw-lowercase");
    chkNumbers = document.getElementById("pw-numbers");
    chkSymbols = document.getElementById("pw-symbols");
    chkAmbiguous = document.getElementById("pw-exclude-ambiguous");

    wordsSlider = document.getElementById("passphrase-words");
    wordsValue = document.getElementById("words-value");
    sepSelect = document.getElementById("passphrase-sep");
    chkCapitalize = document.getElementById("passphrase-cap");
    chkIncludeNumber = document.getElementById("passphrase-num");

    passwordOptionsContainer = document.getElementById("password-options");
    passphraseOptionsContainer = document.getElementById("passphrase-options");

    // Mode Toggle Pills
    document.getElementById("mode-pw-btn")?.addEventListener("click", () => switchMode("password"));
    document.getElementById("mode-phrase-btn")?.addEventListener("click", () => switchMode("passphrase"));

    // Event Listeners for Password
    lengthSlider?.addEventListener("input", () => {
      lengthValue.textContent = lengthSlider.value;
      generate();
    });

    [chkUpper, chkLower, chkNumbers, chkSymbols, chkAmbiguous].forEach((el) => {
      el?.addEventListener("change", () => {
        if (!chkUpper.checked && !chkLower.checked && !chkNumbers.checked && !chkSymbols.checked) {
          chkLower.checked = true;
        }
        generate();
      });
    });

    // Event Listeners for Passphrase
    wordsSlider?.addEventListener("input", () => {
      wordsValue.textContent = wordsSlider.value;
      generate();
    });
    sepSelect?.addEventListener("change", generate);
    chkCapitalize?.addEventListener("change", generate);
    chkIncludeNumber?.addEventListener("change", generate);

    document.getElementById("pw-regenerate-btn")?.addEventListener("click", generate);

    document.getElementById("copy-password-btn")?.addEventListener("click", () => {
      const pwd = displayEl.textContent;
      if (!pwd) return;
      navigator.clipboard.writeText(pwd).then(() => {
        window.ToolboxApp?.showToast("დაკოპირდა გაცვლის ბუფერში");
      });
    });

    // Preset Buttons
    document.querySelectorAll("[data-pw-preset]").forEach((btn) => {
      btn.addEventListener("click", () => applyPreset(btn.dataset.pwPreset));
    });

    generate();
  }

  function switchMode(newMode) {
    mode = newMode;
    const pwBtn = document.getElementById("mode-pw-btn");
    const phraseBtn = document.getElementById("mode-phrase-btn");

    if (mode === "password") {
      pwBtn?.classList.add("active");
      phraseBtn?.classList.remove("active");
      if (passwordOptionsContainer) passwordOptionsContainer.style.display = "block";
      if (passphraseOptionsContainer) passphraseOptionsContainer.style.display = "none";
    } else {
      phraseBtn?.classList.add("active");
      pwBtn?.classList.remove("active");
      if (passwordOptionsContainer) passwordOptionsContainer.style.display = "none";
      if (passphraseOptionsContainer) passphraseOptionsContainer.style.display = "block";
    }
    generate();
  }

  function applyPreset(preset) {
    if (mode !== "password") switchMode("password");

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
      lengthSlider.value = 28;
      chkUpper.checked = true;
      chkLower.checked = true;
      chkNumbers.checked = true;
      chkSymbols.checked = true;
      chkAmbiguous.checked = false;
    }

    if (lengthValue) lengthValue.textContent = lengthSlider.value;
    generate();
  }

  function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function generate() {
    if (mode === "passphrase") {
      generatePassphrase();
    } else {
      generatePassword();
    }
  }

  function generatePassword() {
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

    for (let i = resultChars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
    }

    const password = resultChars.slice(0, length).join("");
    displayEl.textContent = password;
    updateStrength(password.length * (Math.log(pool.length) / Math.log(2)));
  }

  function generatePassphrase() {
    const wordCount = parseInt(wordsSlider?.value || 4, 10);
    const sep = sepSelect?.value || "-";
    const cap = chkCapitalize?.checked ?? true;
    const addNum = chkIncludeNumber?.checked ?? true;

    const chosen = [];
    for (let i = 0; i < wordCount; i++) {
      let w = WORD_LIST[getSecureRandomInt(WORD_LIST.length)];
      if (cap) {
        w = w.charAt(0).toUpperCase() + w.slice(1);
      }
      chosen.push(w);
    }

    if (addNum) {
      const randomNum = getSecureRandomInt(90) + 10;
      chosen[chosen.length - 1] += randomNum;
    }

    const phrase = chosen.join(sep);
    displayEl.textContent = phrase;

    // Entropy: wordCount * log2(WORD_LIST.length)
    const entropy = wordCount * (Math.log(WORD_LIST.length) / Math.log(2)) + (addNum ? 6.6 : 0);
    updateStrength(entropy);
  }

  function updateStrength(entropy) {
    let percent = 0;
    let label = "სუსტი";
    let color = "var(--rose)";

    if (entropy < 35) {
      percent = 25;
      label = "სუსტი";
      color = "var(--rose)";
    } else if (entropy < 55) {
      percent = 50;
      label = "საშუალო";
      color = "var(--amber)";
    } else if (entropy < 80) {
      percent = 75;
      label = "ძლიერი";
      color = "var(--accent)";
    } else {
      percent = 100;
      label = "ძალიან მაღალი დაცულობა";
      color = "var(--emerald)";
    }

    if (strengthFill) {
      strengthFill.style.width = `${percent}%`;
      strengthFill.style.backgroundColor = color;
    }
    if (strengthLabel) {
      strengthLabel.textContent = `${label} (${Math.round(entropy)} bits)`;
      strengthLabel.style.color = color;
    }
  }

  return { init, generate };
})();
