/**
 * Color Studio & Contrast Checker Module
 */

const ColorTool = (() => {
  let colorPicker, hexInput, rgbDisplay, hslDisplay, previewBox;
  let contrastWhiteVal, contrastBlackVal, badgeAAWhite, badgeAABlack;
  let paletteContainer;

  function init() {
    colorPicker = document.getElementById("color-picker");
    hexInput = document.getElementById("color-hex");
    rgbDisplay = document.getElementById("color-rgb");
    hslDisplay = document.getElementById("color-hsl");
    previewBox = document.getElementById("color-preview");

    contrastWhiteVal = document.getElementById("contrast-white-val");
    contrastBlackVal = document.getElementById("contrast-black-val");
    badgeAAWhite = document.getElementById("badge-aa-white");
    badgeAABlack = document.getElementById("badge-aa-black");

    paletteContainer = document.getElementById("color-palette-row");

    colorPicker?.addEventListener("input", (e) => {
      updateFromHex(e.target.value);
    });

    hexInput?.addEventListener("input", (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith("#")) val = "#" + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        colorPicker.value = val;
        updateFromHex(val);
      }
    });

    document.querySelectorAll("[data-copy-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.copyColor;
        let text = "";
        if (type === "hex") text = hexInput.value;
        if (type === "rgb") text = rgbDisplay.textContent;
        if (type === "hsl") text = hslDisplay.textContent;
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            window.ToolboxApp?.showToast(`${text} დაკოპირდა!`);
          });
        }
      });
    });

    document.getElementById("random-color-btn")?.addEventListener("click", () => {
      const randHex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
      colorPicker.value = randHex;
      updateFromHex(randHex);
    });

    updateFromHex(colorPicker?.value || "#3b82f6");
  }

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  function getLuminance(r, g, b) {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(lum1, lum2) {
    const brighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  function updateFromHex(hex) {
    if (!hexInput) return;
    hex = hex.toUpperCase();
    hexInput.value = hex;

    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (rgbDisplay) rgbDisplay.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    if (hslDisplay) hslDisplay.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    if (previewBox) {
      previewBox.style.backgroundColor = hex;
      previewBox.textContent = hex;
      previewBox.style.color = hsl.l > 60 ? "#0f172a" : "#ffffff";
    }

    // Contrast against White (lum=1.0) and Black (lum=0.0)
    const currentLum = getLuminance(rgb.r, rgb.g, rgb.b);
    const ratioWhite = getContrastRatio(1.0, currentLum);
    const ratioBlack = getContrastRatio(currentLum, 0.0);

    if (contrastWhiteVal) contrastWhiteVal.textContent = `${ratioWhite.toFixed(2)}:1`;
    if (contrastBlackVal) contrastBlackVal.textContent = `${ratioBlack.toFixed(2)}:1`;

    if (badgeAAWhite) {
      const pass = ratioWhite >= 4.5;
      badgeAAWhite.className = `contrast-pill ${pass ? "pass" : "fail"}`;
      badgeAAWhite.textContent = pass ? "AA შესაფერისი" : "დაბალი კონტრასტი";
    }

    if (badgeAABlack) {
      const pass = ratioBlack >= 4.5;
      badgeAABlack.className = `contrast-pill ${pass ? "pass" : "fail"}`;
      badgeAABlack.textContent = pass ? "AA შესაფერისი" : "დაბალი კონტრასტი";
    }

    renderPalette(hsl);
  }

  function renderPalette(hsl) {
    if (!paletteContainer) return;
    paletteContainer.innerHTML = "";

    const shades = [
      Math.max(10, hsl.l - 30),
      Math.max(15, hsl.l - 15),
      hsl.l,
      Math.min(90, hsl.l + 15),
      Math.min(95, hsl.l + 30),
    ];

    shades.forEach((lightness) => {
      const swatch = document.createElement("div");
      swatch.className = "palette-swatch";
      const col = `hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`;
      swatch.style.backgroundColor = col;
      swatch.title = `დააჭირეთ დასაკოპირებლად: ${col}`;
      swatch.addEventListener("click", () => {
        navigator.clipboard.writeText(col).then(() => {
          window.ToolboxApp?.showToast(`ფერი დაკოპირდა: ${col}`);
        });
      });
      paletteContainer.appendChild(swatch);
    });
  }

  return { init, updateFromHex };
})();
