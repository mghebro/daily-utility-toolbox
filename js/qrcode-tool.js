/**
 * QR Code Generator Module
 * Generates offline QR codes for links, text, and Wi-Fi networks with customizable colors and PNG download.
 */

const QRCodeTool = (() => {
  let qrContainer, qrInput, fgColorInput, bgColorInput;
  let typeTextBtn, typeWifiBtn, textGroup, wifiGroup;
  let wifiSsid, wifiPassword, wifiAuth;
  let downloadBtn, copyBtn;
  let qrInstance = null;
  let currentMode = "text"; // "text" or "wifi"

  function init() {
    qrContainer = document.getElementById("qrcode-render");
    qrInput = document.getElementById("qr-input");
    fgColorInput = document.getElementById("qr-fg-color");
    bgColorInput = document.getElementById("qr-bg-color");

    typeTextBtn = document.getElementById("qr-type-text-btn");
    typeWifiBtn = document.getElementById("qr-type-wifi-btn");
    textGroup = document.getElementById("qr-text-group");
    wifiGroup = document.getElementById("qr-wifi-group");

    wifiSsid = document.getElementById("wifi-ssid");
    wifiPassword = document.getElementById("wifi-password");
    wifiAuth = document.getElementById("wifi-auth");

    downloadBtn = document.getElementById("download-qr-btn");
    copyBtn = document.getElementById("copy-qr-text-btn");

    // Mode Toggle
    typeTextBtn.addEventListener("click", () => switchMode("text"));
    typeWifiBtn.addEventListener("click", () => switchMode("wifi"));

    // Inputs
    qrInput.addEventListener("input", debounce(renderQR, 200));
    fgColorInput.addEventListener("input", renderQR);
    bgColorInput.addEventListener("input", renderQR);

    wifiSsid.addEventListener("input", renderQR);
    wifiPassword.addEventListener("input", renderQR);
    wifiAuth.addEventListener("change", renderQR);

    // Actions
    downloadBtn.addEventListener("click", downloadPNG);
    copyBtn.addEventListener("click", copyContent);

    // Initial render
    renderQR();
  }

  function switchMode(mode) {
    currentMode = mode;
    if (mode === "text") {
      typeTextBtn.classList.add("active");
      typeWifiBtn.classList.remove("active");
      textGroup.style.display = "block";
      wifiGroup.style.display = "none";
    } else {
      typeWifiBtn.classList.add("active");
      typeTextBtn.classList.remove("active");
      textGroup.style.display = "none";
      wifiGroup.style.display = "block";
    }
    renderQR();
  }

  function getPayload() {
    if (currentMode === "wifi") {
      const ssid = wifiSsid.value.trim();
      const pass = wifiPassword.value;
      const auth = wifiAuth.value;
      if (!ssid) return "WIFI:S:MyWiFi;T:WPA;P:password;;";
      return `WIFI:S:${ssid};T:${auth};P:${pass};;`;
    }
    const val = qrInput.value.trim();
    return val || "https://github.com";
  }

  function renderQR() {
    const payload = getPayload();
    qrContainer.innerHTML = "";

    try {
      if (typeof QRCode !== "undefined") {
        qrInstance = new QRCode(qrContainer, {
          text: payload,
          width: 220,
          height: 220,
          colorDark: fgColorInput.value || "#000000",
          colorLight: bgColorInput.value || "#ffffff",
          correctLevel: QRCode.CorrectLevel.M,
        });
      }
    } catch (e) {
      console.error("QR render error:", e);
    }
  }

  function downloadPNG() {
    const img = qrContainer.querySelector("img");
    const canvas = qrContainer.querySelector("canvas");

    let dataUrl = "";
    if (canvas) {
      dataUrl = canvas.toDataURL("image/png");
    } else if (img && img.src) {
      dataUrl = img.src;
    }

    if (!dataUrl) {
      window.ToolboxApp?.showToast("QR კოდის ჩამოტვირთვა ვერ მოხერხდა");
      return;
    }

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.ToolboxApp?.showToast("QR კოდი ჩამოიტვირთა PNG ფორმატში! 📥");
  }

  function copyContent() {
    const payload = getPayload();
    navigator.clipboard.writeText(payload).then(() => {
      window.ToolboxApp?.showToast("ტექსტი დაკოპირდა! 📋");
    });
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  return { init, renderQR };
})();
