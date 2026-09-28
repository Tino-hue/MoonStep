/**
 * 成就系统
 */

import { unlockAchievement, isAchievementUnlocked, getCompletedCount, getTotalRuns } from "./progress.js";

// 成就定义
const achievementDefinitions = [
  {
    id: "first_step",
    name: "初出茅庐",
    description: "完成第一个关卡",
    icon: "🌱",
  },
  {
    id: "quick_learner",
    name: "快速学习",
    description: "一次通过某关卡",
    icon: "⚡",
  },
  {
    id: "half_way",
    name: "半途不废",
    description: "完成一半的关卡",
    icon: "🏔️",
  },
  {
    id: "pattern_master",
    name: "模式匹配大师",
    description: "通过模式匹配关卡",
    icon: "🎯",
  },
  {
    id: "graduate",
    name: "月兔学徒",
    description: "完成所有基础关卡",
    icon: "🎓",
  },
  {
    id: "code_runner",
    name: "代码奔跑者",
    description: "运行代码超过 10 次",
    icon: "🏃",
  },
  {
    id: "night_owl",
    name: "夜猫子",
    description: "在深夜学习",
    icon: "🦉",
  },
  {
    id: "persistent",
    name: "锲而不舍",
    description: "某个关卡尝试 5 次以上才通过",
    icon: "💪",
  },
];

// ========== 初始化 ==========
export function initAchievements() {
  // 目前不需要额外初始化
}

// ========== 检查成就 ==========
export function checkAchievements(event, data) {
  const newlyUnlocked = [];

  switch (event) {
    case "level_complete":
      // 首胜
      if (getCompletedCount() === 1) {
        if (unlock("first_step")) newlyUnlocked.push("first_step");
      }
      // 半途
      if (getCompletedCount() >= 4) {
        if (unlock("half_way")) newlyUnlocked.push("half_way");
      }
      // 全通关
      if (getCompletedCount() >= 8) {
        if (unlock("graduate")) newlyUnlocked.push("graduate");
      }
      // 模式匹配关
      if (data?.id === "03-pattern-matching") {
        if (unlock("pattern_master")) newlyUnlocked.push("pattern_master");
      }
      break;

    case "run_code":
      if (getTotalRuns() >= 10) {
        if (unlock("code_runner")) newlyUnlocked.push("code_runner");
      }
      // 深夜（23:00 - 5:00）
      const hour = new Date().getHours();
      if (hour >= 23 || hour < 5) {
        if (unlock("night_owl")) newlyUnlocked.push("night_owl");
      }
      break;
  }

  if (newlyUnlocked.length > 0) {
    console.log("🏆 新成就解锁:", newlyUnlocked);
    // TODO: 显示成就通知
  }

  return newlyUnlocked;
}

function unlock(id) {
  return unlockAchievement(id);
}

// ========== 获取所有成就（含解锁状态） ==========
export function getAchievements() {
  return achievementDefinitions.map((a) => ({
    ...a,
    unlocked: isAchievementUnlocked(a.id),
  }));
}
