/**
 * 进度系统
 * 基于 localStorage 存储学习进度
 */

const STORAGE_KEY = "moonstep_progress";

// 默认进度
const defaultProgress = {
  completedLevels: {},       // { levelId: { completedAt, attempts } }
  currentLevel: null,        // 当前进行中的关卡
  totalRuns: 0,              // 总运行次数
  firstRunAt: null,          // 首次使用时间
  achievements: {},          // 已解锁成就
};

let progress = { ...defaultProgress };

// ========== 初始化 ==========
export function initProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      progress = { ...defaultProgress, ...JSON.parse(saved) };
    } else {
      progress.firstRunAt = new Date().toISOString();
      save();
    }
  } catch (e) {
    console.warn("Failed to load progress:", e);
    progress = { ...defaultProgress };
    progress.firstRunAt = new Date().toISOString();
  }
}

// ========== 保存 ==========
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("Failed to save progress:", e);
  }
}

// ========== 关卡完成状态 ==========
export function isLevelCompleted(levelId) {
  return !!progress.completedLevels[levelId];
}

export function markLevelComplete(levelId) {
  const wasNew = !progress.completedLevels[levelId];
  progress.completedLevels[levelId] = {
    completedAt: new Date().toISOString(),
    attempts: (progress.completedLevels[levelId]?.attempts || 0) + 1,
  };
  progress.totalRuns++;
  save();
  return wasNew;
}

export function getCompletedCount() {
  return Object.keys(progress.completedLevels).length;
}

// ========== 关卡解锁判断 ==========
export function isLevelUnlocked(levelId, allLevels) {
  const level = allLevels.find((l) => l.id === levelId);
  if (!level) return false;

  // 没有前置条件的关卡默认解锁
  if (!level.prerequisites || level.prerequisites.length === 0) {
    return true;
  }

  // 所有前置关卡都完成了才解锁
  return level.prerequisites.every((prereq) => isLevelCompleted(prereq));
}

// ========== 运行次数 ==========
export function incrementRuns() {
  progress.totalRuns++;
  save();
}

export function getTotalRuns() {
  return progress.totalRuns;
}

// ========== 成就相关存储 ==========
export function unlockAchievement(achievementId) {
  if (!progress.achievements[achievementId]) {
    progress.achievements[achievementId] = {
      unlockedAt: new Date().toISOString(),
    };
    save();
    return true; // 新解锁
  }
  return false; // 已经解锁过
}

export function isAchievementUnlocked(achievementId) {
  return !!progress.achievements[achievementId];
}

export function getAchievementsProgress() {
  return progress.achievements;
}

// ========== 获取完整进度（调试用） ==========
export function getProgress() {
  return { ...progress };
}

// ========== 重置进度 ==========
export function resetProgress() {
  progress = { ...defaultProgress };
  progress.firstRunAt = new Date().toISOString();
  save();
}
