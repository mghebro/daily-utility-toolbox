/**
 * Text Analyzer & Converter Module
 * Real-time text metrics, case transformations, Base64/URL encoding/decoding.
 */

const TextAnalyzer = (() => {
  let textarea;
  let statWords, statChars, statCharsNoSpace, statSentences, statParagraphs, statReadTime;
  let copyBtn, clearBtn;

  function init() {
    textarea = document.getElementById("text-analyzer-input");
    statWords = document.getElementById("stat-words");
    statChars = document.getElementById("stat-chars");
    statCharsNoSpace = document.getElementById("stat-chars-nospace");
    statSentences = document.getElementById("stat-sentences");
    statParagraphs = document.getElementById("stat-paragraphs");
    statReadTime = document.getElementById("stat-read-time");

    copyBtn = document.getElementById("copy-analyzer-btn");
    clearBtn = document.getElementById("clear-text-btn");

    textarea?.addEventListener("input", analyze);

    // Transformation Buttons
    document.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyAction(btn.dataset.action);
      });
    });

    clearBtn?.addEventListener("click", () => {
      textarea.value = "";
      analyze();
      textarea.focus();
    });

    copyBtn?.addEventListener("click", () => {
      if (!textarea.value) {
        window.ToolboxApp?.showToast("ტექსტი ცარიელია");
        return;
      }
      navigator.clipboard.writeText(textarea.value).then(() => {
        window.ToolboxApp?.showToast("დაკოპირდა გაცვლის ბუფერში");
      });
    });

    analyze();
  }

  function analyze() {
    if (!textarea) return;
    const text = textarea.value;

    const charCount = text.length;
    const charNoSpaceCount = text.replace(/\s/g, "").length;

    const trimmed = text.trim();
    const wordList = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = wordList.length;

    const sentenceList = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0) : [];
    const sentenceCount = sentenceList.length;

    const paraList = text ? text.split(/\n+/).filter((p) => p.trim().length > 0) : [];
    const paraCount = paraList.length;

    const readMinutes = Math.ceil(wordCount / 200);
    const readTimeStr = wordCount === 0 ? "0 წთ" : `~${readMinutes} წთ`;

    if (statWords) statWords.textContent = wordCount.toLocaleString();
    if (statChars) statChars.textContent = charCount.toLocaleString();
    if (statCharsNoSpace) statCharsNoSpace.textContent = charNoSpaceCount.toLocaleString();
    if (statSentences) statSentences.textContent = sentenceCount.toLocaleString();
    if (statParagraphs) statParagraphs.textContent = paraCount.toLocaleString();
    if (statReadTime) statReadTime.textContent = readTimeStr;
  }

  function applyAction(action) {
    const text = textarea.value;
    if (!text) return;

    let result = text;

    try {
      switch (action) {
        case "uppercase":
          result = text.toUpperCase();
          break;

        case "lowercase":
          result = text.toLowerCase();
          break;

        case "titlecase":
          result = text.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;

        case "sentencecase":
          result = text
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
          break;

        case "camelcase":
          result = text
            .replace(/[^a-zA-Z0-9\s_-]/g, "")
            .split(/[\s_-]+/)
            .filter(Boolean)
            .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
            .join("");
          break;

        case "snakecase":
          result = text
            .replace(/[^a-zA-Z0-9\s_-]/g, "")
            .trim()
            .split(/[\s_-]+/)
            .filter(Boolean)
            .map((w) => w.toLowerCase())
            .join("_");
          break;

        case "kebabcase":
          result = text
            .replace(/[^a-zA-Z0-9\s_-]/g, "")
            .trim()
            .split(/[\s_-]+/)
            .filter(Boolean)
            .map((w) => w.toLowerCase())
            .join("-");
          break;

        case "clean-spaces":
          result = text
            .split("\n")
            .map((line) => line.trim().replace(/[ \t]+/g, " "))
            .filter((line, i, arr) => line !== "" || (i > 0 && arr[i - 1] !== ""))
            .join("\n")
            .trim();
          break;

        case "sort-lines":
          result = text
            .split("\n")
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
            .join("\n");
          break;

        case "reverse":
          result = text.split("").reverse().join("");
          break;

        case "base64-encode":
          result = btoa(unescape(encodeURIComponent(text)));
          break;

        case "base64-decode":
          result = decodeURIComponent(escape(atob(text)));
          break;

        case "url-encode":
          result = encodeURIComponent(text);
          break;

        case "url-decode":
          result = decodeURIComponent(text);
          break;
      }

      textarea.value = result;
      analyze();
      window.ToolboxApp?.showToast("მოქმედება შესრულდა");
    } catch (err) {
      window.ToolboxApp?.showToast(`შეცდომა: ${err.message}`);
    }
  }

  return { init, analyze };
})();
