/**
 * MoonStep 入口文件
 * 初始化编辑器、加载关卡、绑定事件
 */

import * as moonbitMode from "@moonbit/moonpad-monaco";
import * as monaco from "monaco-editor-core";

import {
  initLevelMap,
  loadLevel,
  getCurrentLevel,
  getNextLevelId,
} from "./levels.js";
import {
  initProgress,
  isLevelCompleted,
  markLevelComplete,
  getCompletedCount,
  incrementRuns,
} from "./progress.js";
import { validateCode } from "./validator.js";
import {
  initAchievements,
  checkAchievements,
  getAchievements,
} from "./achievements.js";

// ========== Monaco 环境配置 ==========
self.MonacoEnvironment = {
  getWorkerUrl: function () {
    return "/moonpad/editor.worker.js";
  },
};

// ========== 全局状态 ==========
let moonpadApi = null;
let editor = null;
let currentModel = null;

// ========== 初始化 ==========
async function init() {
  // 初始化进度系统
  initProgress();

  // 初始化 Moonpad，返回编译运行 API
  moonpadApi = moonbitMode.init({
    onigWasmUrl: "/moonpad/onig.wasm",
    mooncWorkerFactory: () => new Worker("/moonpad/moonc-worker.js"),
  });

  // 初始化编辑器
  initEditor();

  // 初始化关卡地图
  initLevelMap();

  // 初始化成就系统
  initAchievements();

  // 绑定 UI 事件
  bindEvents();

  // 更新进度徽章
  updateProgressBadge();

  console.log("🌙 MoonStep initialized");
}

// ========== 编辑器初始化 ==========
function initEditor() {
  const initialCode = `fn main {
  println("欢迎来到 MoonStep!")
}
`;

  currentModel = monaco.editor.createModel(initialCode, "moonbit");

  editor = monaco.editor.create(document.getElementById("editor"), {
    model: currentModel,
    theme: "vs-dark",
    fontSize: 14,
    lineNumbers: "on",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    fontLigatures: true,
    cursorBlinking: "smooth",
    smoothScrolling: true,
  });

  // 自定义月兔黄主题
  defineMoonTheme();
  monaco.editor.setTheme("moonbit-dark");
}

// ========== 自定义主题 ==========
function defineMoonTheme() {
  monaco.editor.defineTheme("moonbit-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword.moonbit", foreground: "fbbf24", fontStyle: "bold" },
      { token: "string.moonbit", foreground: "86efac" },
      { token: "number.moonbit", foreground: "fca5a5" },
      { token: "comment.moonbit", foreground: "6b7280", fontStyle: "italic" },
      { token: "type.moonbit", foreground: "93c5fd" },
      { token: "function.moonbit", foreground: "c4b5fd" },
    ],
    colors: {
      "editor.background": "#0f0f0f",
      "editor.foreground": "#f5f5f5",
      "editor.lineHighlightBackground": "#1a1a1a",
      "editorLineNumber.foreground": "#444",
      "editorLineNumber.activeForeground": "#fbbf24",
      "editorCursor.foreground": "#fbbf24",
      "editor.selectionBackground": "rgba(251, 191, 36, 0.3)",
      "editor.selectionHighlightBackground": "rgba(251, 191, 36, 0.15)",
      "editorGutter.background": "#0f0f0f",
      "editorError.foreground": "#ef4444",
      "editorWarning.foreground": "#f59e0b",
      "editorInfo.foreground": "#3b82f6",
    },
  });
}

// ========== 事件绑定 ==========
function bindEvents() {
  // 运行按钮
  document.getElementById("run-btn").addEventListener("click", runCode);

  // 重置按钮
  document.getElementById("reset-btn").addEventListener("click", resetCode);

  // 提示按钮
  document.getElementById("hint-btn").addEventListener("click", showHint);

  // 返回地图
  document.getElementById("back-to-map").addEventListener("click", () => {
    switchView("map");
  });

  // 导航切换
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });

  // 弹窗按钮
  document.getElementById("stay-btn").addEventListener("click", hideModal);
  document.getElementById("next-btn").addEventListener("click", goToNextLevel);

  // 键盘快捷键
  document.addEventListener("keydown", (e) => {
    // Cmd/Ctrl + Enter 运行
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (isViewActive("learn")) {
        runCode();
      }
    }
  });
}

// ========== 运行代码 ==========
async function runCode() {
  const runBtn = document.getElementById("run-btn");
  const consoleOutput = document.getElementById("console-output");
  const consoleStatus = document.getElementById("console-status");
  const code = currentModel.getValue();

  runBtn.disabled = true;
  runBtn.classList.add("running");
  consoleStatus.textContent = "运行中...";
  consoleStatus.className = "console-status running";
  consoleOutput.innerHTML = "";

  incrementRuns();

  try {
    const result = await moonpadApi.runSingleFile({
      code: code,
      filename: "main.mbt",
    });

    if (result.kind === "success") {
      const output = result.output || "";

      // 显示输出
      consoleOutput.innerHTML = output
        .split("\n")
        .filter((line) => line.length > 0 || output.includes("\n"))
        .map((line) => `<span class="stdout">${escapeHtml(line)}</span>`)
        .join("\n");

      // 验证关卡
      const level = getCurrentLevel();
      if (level) {
        const validation = validateCode(output, level);
        if (validation.passed) {
          consoleStatus.textContent = "通过 ✓";
          consoleStatus.className = "console-status success";
          consoleOutput.innerHTML += `\n<div class="success-msg">✓ ${validation.message}</div>`;

          // 标记完成
          const wasNew = markLevelComplete(level.id);
          if (wasNew) {
            setTimeout(() => {
              showSuccessModal(validation.message);
              checkAchievements("level_complete", level);
              updateProgressBadge();
            }, 500);
          }
        } else {
          consoleStatus.textContent = "未通过";
          consoleStatus.className = "console-status error";
          consoleOutput.innerHTML += `\n<div class="error-msg">✗ ${validation.message}</div>`;
          if (validation.hint) {
            consoleOutput.innerHTML += `<div class="hint-msg">💡 提示：${validation.hint}</div>`;
          }
        }
      } else {
        consoleStatus.textContent = "运行成功";
        consoleStatus.className = "console-status success";
      }

      // 检查运行次数成就
      checkAchievements("run_code");
    } else {
      // 编译/运行错误
      consoleStatus.textContent = "编译错误";
      consoleStatus.className = "console-status error";

      let errorHtml = "";
      if (result.diagnostics && result.diagnostics.length > 0) {
        result.diagnostics.forEach((diag) => {
          const loc = diag.start ? `第${diag.start.line + 1}行: ` : "";
          errorHtml += `<div class="stderr">${loc}${escapeHtml(diag.message)}</div>\n`;
        });
      }
      if (result.message) {
        errorHtml += `<div class="stderr">${escapeHtml(result.message)}</div>\n`;
      }
      if (!errorHtml) {
        errorHtml = `<div class="stderr">编译失败，请检查代码</div>`;
      }
      consoleOutput.innerHTML = errorHtml;
    }
  } catch (err) {
    consoleStatus.textContent = "错误";
    consoleStatus.className = "console-status error";
    consoleOutput.innerHTML = `<div class="stderr">${escapeHtml(err.message || String(err))}</div>`;
  } finally {
    runBtn.disabled = false;
    runBtn.classList.remove("running");
  }
}

// ========== 重置代码 ==========
function resetCode() {
  const level = getCurrentLevel();
  if (level && level.initialCode) {
    currentModel.setValue(level.initialCode);
  }
}

// ========== 显示提示 ==========
function showHint() {
  const level = getCurrentLevel();
  const consoleOutput = document.getElementById("console-output");
  if (level && level.hints && level.hints.length > 0) {
    const hintIdx = (level._hintShown || 0) % level.hints.length;
    const hint = level.hints[hintIdx];
    level._hintShown = hintIdx + 1;
    consoleOutput.innerHTML += `\n<div class="hint-msg">💡 提示 ${hintIdx + 1}：${hint}</div>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
}

// ========== 视图切换 ==========
export function switchView(viewName) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));

  const viewEl = document.getElementById(`view-${viewName}`);
  const navBtn = document.querySelector(`.nav-btn[data-view="${viewName}"]`);

  if (viewEl) viewEl.classList.add("active");
  if (navBtn) navBtn.classList.add("active");

  // 切到成就页时刷新
  if (viewName === "achievements") {
    renderAchievements();
  }
  // 切到地图时刷新关卡状态
  if (viewName === "map") {
    initLevelMap();
  }
}

function isViewActive(viewName) {
  const viewEl = document.getElementById(`view-${viewName}`);
  return viewEl && viewEl.classList.contains("active");
}

// ========== 关卡加载 ==========
export function openLevel(levelId) {
  const level = loadLevel(levelId);
  if (!level) return;

  // 更新标题
  document.getElementById("level-title").textContent = level.title;

  // 加载教程内容
  document.getElementById("tutorial-content").innerHTML =
    level.description || "";

  // 加载初始代码
  if (level.initialCode) {
    currentModel.setValue(level.initialCode);
  }

  // 清空控制台
  document.getElementById("console-output").innerHTML = "";
  document.getElementById("console-status").textContent = "就绪";
  document.getElementById("console-status").className = "console-status";

  // 切换到学习视图
  switchView("learn");
}

// ========== 弹窗 ==========
function showSuccessModal(message) {
  document.getElementById("success-message").textContent = message;
  document.getElementById("success-modal").classList.remove("hidden");
}

function hideModal() {
  document.getElementById("success-modal").classList.add("hidden");
}

function goToNextLevel() {
  hideModal();
  const nextId = getNextLevelId();
  if (nextId) {
    openLevel(nextId);
    initLevelMap(); // 刷新地图状态
  } else {
    switchView("map");
    initLevelMap();
  }
}

// ========== 进度徽章 ==========
function updateProgressBadge() {
  const completed = getCompletedCount();
  const total = 8;
  const badge = document.querySelector(".progress-badge");
  if (badge) {
    badge.textContent = `进度 ${completed} / ${total}`;
  }
}

// ========== 成就渲染 ==========
function renderAchievements() {
  const container = document.getElementById("achievements-list");
  const achievements = getAchievements();

  container.innerHTML = achievements
    .map(
      (a) => `
    <div class="achievement-card ${a.unlocked ? "unlocked" : "locked"}">
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-desc">${a.description}</div>
    </div>
  `,
    )
    .join("");
}

// ========== 工具函数 ==========
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========== 启动 ==========
init();
