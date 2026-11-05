/**
 * Text Analyzer & Formatter Module
 * Calculates comprehensive text metrics and provides formatting & case transformations.
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

    textarea.addEventListener("input", analyze);

    // Transformation Buttons
    document.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyAction(btn.dataset.action);
      });
    });

    clearBtn.addEventListener("click", () => {
      textarea.value = "";
      analyze();
      textarea.focus();
    });

    copyBtn.addEventListener("click", () => {
      if (!textarea.value) {
        window.ToolboxApp?.showToast("ტექსტი ცარიელია");
        return;
      }
      navigator.clipboard.writeText(textarea.value).then(() => {
        window.ToolboxApp?.showToast("ტექსტი დაკოპირდა! 📋");
      });
    });

    analyze();
  }

  function analyze() {
    const text = textarea.value;

    // Characters
    const charCount = text.length;
    const charNoSpaceCount = text.replace(/\s/g, "").length;

    // Words
    const trimmed = text.trim();
    const wordList = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = wordList.length;

    // Sentences
    const sentenceList = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0) : [];
    const sentenceCount = sentenceList.length;

    // Paragraphs
    const paraList = text ? text.split(/\n+/).filter((p) => p.trim().length > 0) : [];
    const paraCount = paraList.length;

    // Reading time: avg 200 words per minute
    const readMinutes = Math.ceil(wordCount / 200);
    const readTimeStr = wordCount === 0 ? "0 წთ" : `~${readMinutes} წთ`;

    // Update DOM
    statWords.textContent = wordCount.toLocaleString();
    statChars.textContent = charCount.toLocaleString();
    statCharsNoSpace.textContent = charNoSpaceCount.toLocaleString();
    statSentences.textContent = sentenceCount.toLocaleString();
    statParagraphs.textContent = paraCount.toLocaleString();
    statReadTime.textContent = readTimeStr;
  }

  function applyAction(action) {
    const text = textarea.value;
    if (!text) return;

    let result = text;

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
    }

    textarea.value = result;
    analyze();
    window.ToolboxApp?.showToast("ტრანსფორმაცია შესრულდა! ✨");
  }

  return { init, analyze };
})();
